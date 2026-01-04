/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
} from 'n8n-workflow';

import { customerIoApiRequest } from '../../transport';
import { formatTimestamp, prepareAttributes, cleanObject, generateAnonymousId } from '../../utils/helpers';

export const eventsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['events'],
			},
		},
		options: [
			{
				name: 'Track',
				value: 'track',
				description: 'Track an event for a person',
				action: 'Track an event for a person',
			},
			{
				name: 'Track Anonymous',
				value: 'trackAnonymous',
				description: 'Track an event for an anonymous user',
				action: 'Track an anonymous event',
			},
			{
				name: 'Track Page View',
				value: 'trackPageView',
				description: 'Track a page view for a person',
				action: 'Track a page view',
			},
		],
		default: 'track',
	},
];

export const eventsFields: INodeProperties[] = [
	// ----------------------------------
	//         track
	// ----------------------------------
	{
		displayName: 'Identifier',
		name: 'identifier',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier for the person',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['track', 'trackPageView'],
			},
		},
	},
	{
		displayName: 'Event Name',
		name: 'eventName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'purchased',
		description: 'The name of the event to track',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['track', 'trackAnonymous'],
			},
		},
	},
	{
		displayName: 'Event Type',
		name: 'eventType',
		type: 'options',
		default: 'event',
		options: [
			{
				name: 'Event',
				value: 'event',
				description: 'Standard behavioral event',
			},
		],
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['track'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['track'],
			},
		},
		options: [
			{
				displayName: 'Timestamp',
				name: 'timestamp',
				type: 'dateTime',
				default: '',
				description: 'When the event occurred (defaults to now)',
			},
		],
	},
	{
		displayName: 'Event Data',
		name: 'eventDataUi',
		type: 'fixedCollection',
		placeholder: 'Add Event Data',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['track', 'trackAnonymous'],
			},
		},
		options: [
			{
				name: 'attributeValues',
				displayName: 'Data',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						description: 'The data key',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The data value (supports JSON for complex types)',
					},
				],
			},
		],
	},

	// ----------------------------------
	//         trackAnonymous
	// ----------------------------------
	{
		displayName: 'Anonymous ID',
		name: 'anonymousId',
		type: 'string',
		default: '',
		description: 'The anonymous ID for the user (auto-generated if empty)',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['trackAnonymous'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFieldsAnon',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['trackAnonymous'],
			},
		},
		options: [
			{
				displayName: 'Timestamp',
				name: 'timestamp',
				type: 'dateTime',
				default: '',
				description: 'When the event occurred (defaults to now)',
			},
		],
	},

	// ----------------------------------
	//         trackPageView
	// ----------------------------------
	{
		displayName: 'Page URL',
		name: 'pageUrl',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com/page',
		description: 'The URL of the page viewed',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['trackPageView'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'pageViewFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['trackPageView'],
			},
		},
		options: [
			{
				displayName: 'Referrer',
				name: 'referrer',
				type: 'string',
				default: '',
				description: 'The referrer URL',
			},
			{
				displayName: 'Timestamp',
				name: 'timestamp',
				type: 'dateTime',
				default: '',
				description: 'When the page view occurred',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject;

	if (operation === 'track') {
		const identifier = this.getNodeParameter('identifier', index) as string;
		const eventName = this.getNodeParameter('eventName', index) as string;
		const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;
		const eventDataUi = this.getNodeParameter('eventDataUi', index, {}) as IDataObject;

		const body: IDataObject = {
			name: eventName,
		};

		if (additionalFields.timestamp) {
			body.timestamp = formatTimestamp(additionalFields.timestamp as string);
		}

		// Add event data
		const eventData = prepareAttributes(eventDataUi);
		if (Object.keys(eventData).length > 0) {
			body.data = eventData;
		}

		const endpoint = `/customers/${encodeURIComponent(identifier)}/events`;
		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			cleanObject(body),
			{},
			'track',
		)) as IDataObject;

		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, identifier, event: eventName };
		}
	} else if (operation === 'trackAnonymous') {
		let anonymousId = this.getNodeParameter('anonymousId', index, '') as string;
		const eventName = this.getNodeParameter('eventName', index) as string;
		const additionalFields = this.getNodeParameter('additionalFieldsAnon', index, {}) as IDataObject;
		const eventDataUi = this.getNodeParameter('eventDataUi', index, {}) as IDataObject;

		if (!anonymousId) {
			anonymousId = generateAnonymousId();
		}

		const body: IDataObject = {
			anonymous_id: anonymousId,
			name: eventName,
		};

		if (additionalFields.timestamp) {
			body.timestamp = formatTimestamp(additionalFields.timestamp as string);
		}

		// Add event data
		const eventData = prepareAttributes(eventDataUi);
		if (Object.keys(eventData).length > 0) {
			body.data = eventData;
		}

		const endpoint = '/events';
		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			cleanObject(body),
			{},
			'track',
		)) as IDataObject;

		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, anonymous_id: anonymousId, event: eventName };
		}
	} else if (operation === 'trackPageView') {
		const identifier = this.getNodeParameter('identifier', index) as string;
		const pageUrl = this.getNodeParameter('pageUrl', index) as string;
		const pageViewFields = this.getNodeParameter('pageViewFields', index, {}) as IDataObject;

		const body: IDataObject = {
			type: 'page',
			name: pageUrl,
		};

		if (pageViewFields.referrer) {
			body.data = { referrer: pageViewFields.referrer };
		}

		if (pageViewFields.timestamp) {
			body.timestamp = formatTimestamp(pageViewFields.timestamp as string);
		}

		const endpoint = `/customers/${encodeURIComponent(identifier)}/events`;
		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			cleanObject(body),
			{},
			'track',
		)) as IDataObject;

		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, identifier, page: pageUrl };
		}
	} else {
		throw new Error(`Operation "${operation}" is not supported for Events resource`);
	}

	return [{ json: responseData, pairedItem: { item: index } }];
}
