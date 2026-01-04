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

import { customerIoApiRequest, customerIoApiRequestAllItems } from '../../transport';

export const messagesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['messages'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'getMessage',
				description: 'Get a message by ID',
				action: 'Get a message',
			},
			{
				name: 'Get Deliveries',
				value: 'getMessageDeliveries',
				description: 'Get delivery information for a message',
				action: 'Get message deliveries',
			},
			{
				name: 'Get Templates',
				value: 'getMessageTemplates',
				description: 'Get templates used in a message',
				action: 'Get message templates',
			},
			{
				name: 'List',
				value: 'listMessages',
				description: 'List sent messages',
				action: 'List messages',
			},
		],
		default: 'listMessages',
	},
];

export const messagesFields: INodeProperties[] = [
	// ----------------------------------
	//         getMessage / getMessageDeliveries / getMessageTemplates
	// ----------------------------------
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the message',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['getMessage', 'getMessageTemplates', 'getMessageDeliveries'],
			},
		},
	},

	// ----------------------------------
	//         listMessages
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['listMessages', 'getMessageDeliveries'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['listMessages', 'getMessageDeliveries'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['listMessages'],
			},
		},
		options: [
			{
				displayName: 'Campaign ID',
				name: 'campaign_id',
				type: 'number',
				default: 0,
				description: 'Filter by campaign ID',
			},
			{
				displayName: 'Metric',
				name: 'metric',
				type: 'options',
				options: [
					{ name: 'Attempted', value: 'attempted' },
					{ name: 'Bounced', value: 'bounced' },
					{ name: 'Clicked', value: 'clicked' },
					{ name: 'Converted', value: 'converted' },
					{ name: 'Created', value: 'created' },
					{ name: 'Delivered', value: 'delivered' },
					{ name: 'Drafted', value: 'drafted' },
					{ name: 'Dropped', value: 'dropped' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Opened', value: 'opened' },
					{ name: 'Sent', value: 'sent' },
					{ name: 'Spam Complained', value: 'spammed' },
					{ name: 'Unsubscribed', value: 'unsubscribed' },
				],
				default: 'sent',
				description: 'Filter by message state',
			},
			{
				displayName: 'Newsletter ID',
				name: 'newsletter_id',
				type: 'number',
				default: 0,
				description: 'Filter by newsletter ID',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Email', value: 'email' },
					{ name: 'Push', value: 'push' },
					{ name: 'Slack', value: 'slack' },
					{ name: 'SMS', value: 'sms' },
					{ name: 'Webhook', value: 'webhook' },
				],
				default: '',
				description: 'Filter by message type',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'listMessages') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

		const endpoint = '/messages';
		const qs: IDataObject = {};

		// Add filters
		if (filters.campaign_id && filters.campaign_id !== 0) {
			qs.campaign_id = filters.campaign_id;
		}
		if (filters.newsletter_id && filters.newsletter_id !== 0) {
			qs.newsletter_id = filters.newsletter_id;
		}
		if (filters.metric) {
			qs.metric = filters.metric;
		}
		if (filters.type) {
			qs.type = filters.type;
		}

		if (returnAll) {
			responseData = await customerIoApiRequestAllItems.call(
				this,
				'GET',
				endpoint,
				{},
				qs,
				'app',
				'messages',
			);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			qs.limit = limit;
			responseData = (await customerIoApiRequest.call(
				this,
				'GET',
				endpoint,
				{},
				qs,
				'app',
			)) as IDataObject;
		}
	} else if (operation === 'getMessage') {
		const messageId = this.getNodeParameter('messageId', index) as string;

		const endpoint = `/messages/${messageId}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'getMessageTemplates') {
		const messageId = this.getNodeParameter('messageId', index) as string;

		const endpoint = `/messages/${messageId}/templates`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'getMessageDeliveries') {
		const messageId = this.getNodeParameter('messageId', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;

		const endpoint = `/messages/${messageId}/deliveries`;

		if (returnAll) {
			responseData = await customerIoApiRequestAllItems.call(
				this,
				'GET',
				endpoint,
				{},
				{},
				'app',
				'deliveries',
			);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			responseData = (await customerIoApiRequest.call(
				this,
				'GET',
				endpoint,
				{},
				{ limit },
				'app',
			)) as IDataObject;
		}
	} else {
		throw new Error(`Operation "${operation}" is not supported for Messages resource`);
	}

	if (Array.isArray(responseData)) {
		return responseData.map((item) => ({
			json: item,
			pairedItem: { item: index },
		}));
	}

	return [{ json: responseData, pairedItem: { item: index } }];
}
