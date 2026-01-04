/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { customerIoApiRequest } from '../../transport';
import { generateAnonymousId, cleanObject } from '../../utils/helpers';

export const pipelinesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pipelines'],
			},
		},
		options: [
			{
				name: 'CDP Alias',
				value: 'cdpAlias',
				description: 'Create an alias to merge identities',
				action: 'Create CDP alias',
			},
			{
				name: 'CDP Group',
				value: 'cdpGroup',
				description: 'Associate a user with a group',
				action: 'CDP group call',
			},
			{
				name: 'CDP Identify',
				value: 'cdpIdentify',
				description: 'Identify a user with traits',
				action: 'CDP identify call',
			},
			{
				name: 'CDP Page',
				value: 'cdpPage',
				description: 'Track a page view',
				action: 'CDP page view',
			},
			{
				name: 'CDP Screen',
				value: 'cdpScreen',
				description: 'Track a screen view (mobile)',
				action: 'CDP screen view',
			},
			{
				name: 'CDP Track',
				value: 'cdpTrack',
				description: 'Track an event',
				action: 'CDP track event',
			},
		],
		default: 'cdpIdentify',
	},
];

export const pipelinesFields: INodeProperties[] = [
	// CDP Identify fields
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		description: 'The unique identifier for the user',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpIdentify', 'cdpTrack', 'cdpPage', 'cdpScreen', 'cdpGroup'],
			},
		},
	},
	{
		displayName: 'Anonymous ID',
		name: 'anonymousId',
		type: 'string',
		default: '',
		description: 'Anonymous identifier (used if no User ID). Leave empty to auto-generate.',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpIdentify', 'cdpTrack', 'cdpPage', 'cdpScreen'],
			},
		},
	},
	{
		displayName: 'Traits',
		name: 'traits',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		description: 'User traits/attributes to set',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpIdentify', 'cdpGroup'],
			},
		},
		options: [
			{
				name: 'trait',
				displayName: 'Trait',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the trait',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value of the trait',
					},
				],
			},
		],
	},

	// CDP Track fields
	{
		displayName: 'Event Name',
		name: 'eventName',
		type: 'string',
		default: '',
		required: true,
		description: 'The name of the event to track',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpTrack'],
			},
		},
	},
	{
		displayName: 'Event Properties',
		name: 'properties',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		description: 'Properties to attach to the event',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpTrack'],
			},
		},
		options: [
			{
				name: 'property',
				displayName: 'Property',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the property',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value of the property',
					},
				],
			},
		],
	},

	// CDP Page fields
	{
		displayName: 'Page Name',
		name: 'pageName',
		type: 'string',
		default: '',
		description: 'The name of the page viewed',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpPage'],
			},
		},
	},
	{
		displayName: 'Page Category',
		name: 'pageCategory',
		type: 'string',
		default: '',
		description: 'The category of the page',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpPage'],
			},
		},
	},
	{
		displayName: 'Page Properties',
		name: 'pageProperties',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		description: 'Properties to attach to the page view',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpPage'],
			},
		},
		options: [
			{
				name: 'property',
				displayName: 'Property',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the property',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value of the property',
					},
				],
			},
		],
	},

	// CDP Screen fields
	{
		displayName: 'Screen Name',
		name: 'screenName',
		type: 'string',
		default: '',
		required: true,
		description: 'The name of the screen viewed',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpScreen'],
			},
		},
	},
	{
		displayName: 'Screen Category',
		name: 'screenCategory',
		type: 'string',
		default: '',
		description: 'The category of the screen',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpScreen'],
			},
		},
	},
	{
		displayName: 'Screen Properties',
		name: 'screenProperties',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		description: 'Properties to attach to the screen view',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpScreen'],
			},
		},
		options: [
			{
				name: 'property',
				displayName: 'Property',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the property',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value of the property',
					},
				],
			},
		],
	},

	// CDP Group fields
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		default: '',
		required: true,
		description: 'The unique identifier for the group',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpGroup'],
			},
		},
	},

	// CDP Alias fields
	{
		displayName: 'Previous ID',
		name: 'previousId',
		type: 'string',
		default: '',
		required: true,
		description: 'The previous identifier (anonymous ID or old user ID)',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpAlias'],
			},
		},
	},
	{
		displayName: 'New User ID',
		name: 'newUserId',
		type: 'string',
		default: '',
		required: true,
		description: 'The new user identifier to merge into',
		displayOptions: {
			show: {
				resource: ['pipelines'],
				operation: ['cdpAlias'],
			},
		},
	},

	// Common options
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['pipelines'],
			},
		},
		options: [
			{
				displayName: 'Timestamp',
				name: 'timestamp',
				type: 'dateTime',
				default: '',
				description: 'The time the event occurred (ISO 8601 format)',
			},
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'string',
				default: '',
				description: 'A unique identifier for this message (for deduplication)',
			},
			{
				displayName: 'Context',
				name: 'context',
				type: 'json',
				default: '{}',
				description: 'Additional context about the event (device, location, etc.)',
			},
			{
				displayName: 'Integrations',
				name: 'integrations',
				type: 'json',
				default: '{}',
				description: 'Control which integrations receive this event',
			},
		],
	},
];

function prepareTraits(traitsCollection: IDataObject): IDataObject {
	const traits: IDataObject = {};
	const traitItems = (traitsCollection.trait as IDataObject[]) || [];
	for (const item of traitItems) {
		if (item.name) {
			traits[item.name as string] = item.value;
		}
	}
	return traits;
}

function prepareProperties(propertiesCollection: IDataObject): IDataObject {
	const properties: IDataObject = {};
	const propertyItems = (propertiesCollection.property as IDataObject[]) || [];
	for (const item of propertyItems) {
		if (item.name) {
			properties[item.name as string] = item.value;
		}
	}
	return properties;
}

export async function executePipelinesOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject> {
	const operation = this.getNodeParameter('operation', index) as string;
	const options = this.getNodeParameter('options', index, {}) as IDataObject;

	let body: IDataObject = {};
	let endpoint = '';

	// Common context handling
	const commonPayload: IDataObject = {};
	if (options.timestamp) {
		commonPayload.timestamp = options.timestamp;
	}
	if (options.messageId) {
		commonPayload.messageId = options.messageId;
	}
	if (options.context) {
		try {
			commonPayload.context = JSON.parse(options.context as string);
		} catch {
			commonPayload.context = {};
		}
	}
	if (options.integrations) {
		try {
			commonPayload.integrations = JSON.parse(options.integrations as string);
		} catch {
			commonPayload.integrations = {};
		}
	}

	switch (operation) {
		case 'cdpIdentify': {
			endpoint = '/identify';
			const userId = this.getNodeParameter('userId', index, '') as string;
			let anonymousId = this.getNodeParameter('anonymousId', index, '') as string;
			const traitsCollection = this.getNodeParameter('traits', index, {}) as IDataObject;

			if (!userId && !anonymousId) {
				anonymousId = generateAnonymousId();
			}

			body = {
				...commonPayload,
				type: 'identify',
			};

			if (userId) {
				body.userId = userId;
			}
			if (anonymousId) {
				body.anonymousId = anonymousId;
			}

			const traits = prepareTraits(traitsCollection);
			if (Object.keys(traits).length > 0) {
				body.traits = traits;
			}
			break;
		}

		case 'cdpTrack': {
			endpoint = '/track';
			const userId = this.getNodeParameter('userId', index, '') as string;
			let anonymousId = this.getNodeParameter('anonymousId', index, '') as string;
			const eventName = this.getNodeParameter('eventName', index) as string;
			const propertiesCollection = this.getNodeParameter('properties', index, {}) as IDataObject;

			if (!userId && !anonymousId) {
				anonymousId = generateAnonymousId();
			}

			body = {
				...commonPayload,
				type: 'track',
				event: eventName,
			};

			if (userId) {
				body.userId = userId;
			}
			if (anonymousId) {
				body.anonymousId = anonymousId;
			}

			const properties = prepareProperties(propertiesCollection);
			if (Object.keys(properties).length > 0) {
				body.properties = properties;
			}
			break;
		}

		case 'cdpPage': {
			endpoint = '/page';
			const userId = this.getNodeParameter('userId', index, '') as string;
			let anonymousId = this.getNodeParameter('anonymousId', index, '') as string;
			const pageName = this.getNodeParameter('pageName', index, '') as string;
			const pageCategory = this.getNodeParameter('pageCategory', index, '') as string;
			const propertiesCollection = this.getNodeParameter('pageProperties', index, {}) as IDataObject;

			if (!userId && !anonymousId) {
				anonymousId = generateAnonymousId();
			}

			body = {
				...commonPayload,
				type: 'page',
			};

			if (userId) {
				body.userId = userId;
			}
			if (anonymousId) {
				body.anonymousId = anonymousId;
			}
			if (pageName) {
				body.name = pageName;
			}
			if (pageCategory) {
				body.category = pageCategory;
			}

			const properties = prepareProperties(propertiesCollection);
			if (Object.keys(properties).length > 0) {
				body.properties = properties;
			}
			break;
		}

		case 'cdpScreen': {
			endpoint = '/screen';
			const userId = this.getNodeParameter('userId', index, '') as string;
			let anonymousId = this.getNodeParameter('anonymousId', index, '') as string;
			const screenName = this.getNodeParameter('screenName', index) as string;
			const screenCategory = this.getNodeParameter('screenCategory', index, '') as string;
			const propertiesCollection = this.getNodeParameter('screenProperties', index, {}) as IDataObject;

			if (!userId && !anonymousId) {
				anonymousId = generateAnonymousId();
			}

			body = {
				...commonPayload,
				type: 'screen',
				name: screenName,
			};

			if (userId) {
				body.userId = userId;
			}
			if (anonymousId) {
				body.anonymousId = anonymousId;
			}
			if (screenCategory) {
				body.category = screenCategory;
			}

			const properties = prepareProperties(propertiesCollection);
			if (Object.keys(properties).length > 0) {
				body.properties = properties;
			}
			break;
		}

		case 'cdpGroup': {
			endpoint = '/group';
			const userId = this.getNodeParameter('userId', index, '') as string;
			const groupId = this.getNodeParameter('groupId', index) as string;
			const traitsCollection = this.getNodeParameter('traits', index, {}) as IDataObject;

			body = {
				...commonPayload,
				type: 'group',
				groupId,
			};

			if (userId) {
				body.userId = userId;
			}

			const traits = prepareTraits(traitsCollection);
			if (Object.keys(traits).length > 0) {
				body.traits = traits;
			}
			break;
		}

		case 'cdpAlias': {
			endpoint = '/alias';
			const previousId = this.getNodeParameter('previousId', index) as string;
			const newUserId = this.getNodeParameter('newUserId', index) as string;

			body = {
				...commonPayload,
				type: 'alias',
				previousId,
				userId: newUserId,
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	body = cleanObject(body);

	const response = await customerIoApiRequest.call(
		this,
		'POST',
		endpoint,
		body,
		{},
		'pipelines',
	) as IDataObject;

	return response || { success: true };
}
