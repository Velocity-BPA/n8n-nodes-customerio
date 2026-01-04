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
import { prepareAttributes, cleanObject } from '../../utils/helpers';

export const broadcastsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['broadcasts'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'createBroadcast',
				description: 'Create a new broadcast',
				action: 'Create a broadcast',
			},
			{
				name: 'Get',
				value: 'getBroadcast',
				description: 'Get a broadcast by ID',
				action: 'Get a broadcast',
			},
			{
				name: 'Get Actions',
				value: 'getBroadcastActions',
				description: 'Get actions for a broadcast',
				action: 'Get broadcast actions',
			},
			{
				name: 'Get Metrics',
				value: 'getBroadcastMetrics',
				description: 'Get metrics for a broadcast',
				action: 'Get broadcast metrics',
			},
			{
				name: 'Get Triggers',
				value: 'listBroadcastTriggers',
				description: 'Get triggers for a broadcast',
				action: 'Get broadcast triggers',
			},
			{
				name: 'List',
				value: 'listBroadcasts',
				description: 'List all broadcasts',
				action: 'List broadcasts',
			},
			{
				name: 'Trigger',
				value: 'triggerBroadcast',
				description: 'Trigger an API-triggered broadcast',
				action: 'Trigger a broadcast',
			},
		],
		default: 'listBroadcasts',
	},
];

export const broadcastsFields: INodeProperties[] = [
	// ----------------------------------
	//         getBroadcast / getBroadcastMetrics / etc.
	// ----------------------------------
	{
		displayName: 'Broadcast ID',
		name: 'broadcastId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the broadcast',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: [
					'getBroadcast',
					'getBroadcastMetrics',
					'getBroadcastActions',
					'listBroadcastTriggers',
					'triggerBroadcast',
				],
			},
		},
	},

	// ----------------------------------
	//         createBroadcast
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the broadcast',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['createBroadcast'],
			},
		},
	},
	{
		displayName: 'Trigger Type',
		name: 'triggerType',
		type: 'options',
		required: true,
		options: [
			{ name: 'API', value: 'api' },
			{ name: 'Scheduled', value: 'scheduled' },
		],
		default: 'api',
		description: 'How the broadcast will be triggered',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['createBroadcast'],
			},
		},
	},
	{
		displayName: 'Broadcast Options',
		name: 'broadcastOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['createBroadcast'],
			},
		},
		options: [
			{
				displayName: 'Data Type Identifier',
				name: 'data_type_identifier',
				type: 'string',
				default: '',
				description: 'Reference to an object type for object-triggered broadcasts',
			},
		],
	},

	// ----------------------------------
	//         triggerBroadcast
	// ----------------------------------
	{
		displayName: 'Recipients',
		name: 'recipientType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Emails', value: 'emails' },
			{ name: 'Customer IDs', value: 'ids' },
			{ name: 'Per-User Data', value: 'per_user_data' },
			{ name: 'Data File URL', value: 'data_file_url' },
		],
		default: 'emails',
		description: 'How to specify recipients',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['triggerBroadcast'],
			},
		},
	},
	{
		displayName: 'Emails',
		name: 'emails',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'email1@example.com,email2@example.com',
		description: 'Comma-separated list of email addresses',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['triggerBroadcast'],
				recipientType: ['emails'],
			},
		},
	},
	{
		displayName: 'Customer IDs',
		name: 'customerIds',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'id1,id2,id3',
		description: 'Comma-separated list of customer IDs',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['triggerBroadcast'],
				recipientType: ['ids'],
			},
		},
	},
	{
		displayName: 'Per-User Data (JSON)',
		name: 'perUserData',
		type: 'json',
		required: true,
		default: '[\n  {\n    "id": "customer_1",\n    "data": {\n      "first_name": "John"\n    }\n  }\n]',
		description: 'JSON array of user objects with ID and custom data',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['triggerBroadcast'],
				recipientType: ['per_user_data'],
			},
		},
	},
	{
		displayName: 'Data File URL',
		name: 'dataFileUrl',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com/recipients.json',
		description: 'URL to a JSON file containing recipient data',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['triggerBroadcast'],
				recipientType: ['data_file_url'],
			},
		},
	},
	{
		displayName: 'Trigger Options',
		name: 'triggerOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['triggerBroadcast'],
			},
		},
		options: [
			{
				displayName: 'ID Ignore Missing',
				name: 'id_ignore_missing',
				type: 'boolean',
				default: false,
				description: 'Whether to ignore IDs that don\'t exist in Customer.io',
			},
			{
				displayName: 'Email Add Duplicates',
				name: 'email_add_duplicates',
				type: 'boolean',
				default: false,
				description: 'Whether to add people who already exist with matching emails',
			},
			{
				displayName: 'Email Ignore Missing',
				name: 'email_ignore_missing',
				type: 'boolean',
				default: false,
				description: 'Whether to ignore emails that don\'t exist in Customer.io',
			},
		],
	},
	{
		displayName: 'Broadcast Data',
		name: 'broadcastDataUi',
		type: 'fixedCollection',
		placeholder: 'Add Data',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['triggerBroadcast'],
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
						description: 'The data value',
					},
				],
			},
		],
	},

	// ----------------------------------
	//         getBroadcastMetrics
	// ----------------------------------
	{
		displayName: 'Metric Options',
		name: 'metricOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['getBroadcastMetrics'],
			},
		},
		options: [
			{
				displayName: 'Period',
				name: 'period',
				type: 'options',
				options: [
					{ name: 'Days', value: 'days' },
					{ name: 'Weeks', value: 'weeks' },
					{ name: 'Months', value: 'months' },
				],
				default: 'days',
				description: 'The period for metrics aggregation',
			},
			{
				displayName: 'Steps',
				name: 'steps',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 24,
				},
				default: 7,
				description: 'Number of periods to retrieve',
			},
		],
	},

	// ----------------------------------
	//         listBroadcastTriggers
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['broadcasts'],
				operation: ['listBroadcastTriggers'],
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
				resource: ['broadcasts'],
				operation: ['listBroadcastTriggers'],
				returnAll: [false],
			},
		},
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'listBroadcasts') {
		const endpoint = '/broadcasts';
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'getBroadcast') {
		const broadcastId = this.getNodeParameter('broadcastId', index) as number;

		const endpoint = `/broadcasts/${broadcastId}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'createBroadcast') {
		const name = this.getNodeParameter('name', index) as string;
		const triggerType = this.getNodeParameter('triggerType', index) as string;
		const broadcastOptions = this.getNodeParameter('broadcastOptions', index, {}) as IDataObject;

		const body: IDataObject = {
			name,
			type: triggerType,
		};

		if (broadcastOptions.data_type_identifier) {
			body.data_type_identifier = broadcastOptions.data_type_identifier;
		}

		const endpoint = '/broadcasts';
		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			cleanObject(body),
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'triggerBroadcast') {
		const broadcastId = this.getNodeParameter('broadcastId', index) as number;
		const recipientType = this.getNodeParameter('recipientType', index) as string;
		const triggerOptions = this.getNodeParameter('triggerOptions', index, {}) as IDataObject;
		const broadcastDataUi = this.getNodeParameter('broadcastDataUi', index, {}) as IDataObject;

		const body: IDataObject = {};

		// Add recipients based on type
		if (recipientType === 'emails') {
			const emails = this.getNodeParameter('emails', index) as string;
			body.emails = emails.split(',').map((e) => e.trim());
		} else if (recipientType === 'ids') {
			const customerIds = this.getNodeParameter('customerIds', index) as string;
			body.ids = customerIds.split(',').map((id) => id.trim());
		} else if (recipientType === 'per_user_data') {
			const perUserDataRaw = this.getNodeParameter('perUserData', index) as string;
			try {
				body.per_user_data = JSON.parse(perUserDataRaw);
			} catch {
				throw new Error('Invalid JSON in per-user data');
			}
		} else if (recipientType === 'data_file_url') {
			body.data_file_url = this.getNodeParameter('dataFileUrl', index) as string;
		}

		// Add trigger options
		if (triggerOptions.id_ignore_missing !== undefined) {
			body.id_ignore_missing = triggerOptions.id_ignore_missing;
		}
		if (triggerOptions.email_add_duplicates !== undefined) {
			body.email_add_duplicates = triggerOptions.email_add_duplicates;
		}
		if (triggerOptions.email_ignore_missing !== undefined) {
			body.email_ignore_missing = triggerOptions.email_ignore_missing;
		}

		// Add broadcast data
		const broadcastData = prepareAttributes(broadcastDataUi);
		if (Object.keys(broadcastData).length > 0) {
			body.data = broadcastData;
		}

		const endpoint = `/campaigns/${broadcastId}/triggers`;
		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			cleanObject(body),
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'getBroadcastMetrics') {
		const broadcastId = this.getNodeParameter('broadcastId', index) as number;
		const metricOptions = this.getNodeParameter('metricOptions', index, {}) as IDataObject;

		const endpoint = `/broadcasts/${broadcastId}/metrics`;
		const qs: IDataObject = {};

		if (metricOptions.period) {
			qs.period = metricOptions.period;
		}
		if (metricOptions.steps) {
			qs.steps = metricOptions.steps;
		}

		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			qs,
			'app',
		)) as IDataObject;
	} else if (operation === 'getBroadcastActions') {
		const broadcastId = this.getNodeParameter('broadcastId', index) as number;

		const endpoint = `/broadcasts/${broadcastId}/actions`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'listBroadcastTriggers') {
		const broadcastId = this.getNodeParameter('broadcastId', index) as number;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;

		const endpoint = `/broadcasts/${broadcastId}/triggers`;

		if (returnAll) {
			responseData = await customerIoApiRequestAllItems.call(
				this,
				'GET',
				endpoint,
				{},
				{},
				'app',
				'triggers',
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
		throw new Error(`Operation "${operation}" is not supported for Broadcasts resource`);
	}

	if (Array.isArray(responseData)) {
		return responseData.map((item) => ({
			json: item,
			pairedItem: { item: index },
		}));
	}

	return [{ json: responseData, pairedItem: { item: index } }];
}
