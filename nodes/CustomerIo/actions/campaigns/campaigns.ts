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

export const campaignsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['campaigns'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'getCampaign',
				description: 'Get a campaign by ID',
				action: 'Get a campaign',
			},
			{
				name: 'Get Actions',
				value: 'getCampaignActions',
				description: 'Get actions for a campaign',
				action: 'Get campaign actions',
			},
			{
				name: 'Get Messages',
				value: 'listCampaignMessages',
				description: 'Get messages for a campaign',
				action: 'Get campaign messages',
			},
			{
				name: 'Get Metrics',
				value: 'getCampaignMetrics',
				description: 'Get metrics for a campaign',
				action: 'Get campaign metrics',
			},
			{
				name: 'Get Triggers',
				value: 'getCampaignTriggers',
				description: 'Get triggers for a campaign',
				action: 'Get campaign triggers',
			},
			{
				name: 'List',
				value: 'listCampaigns',
				description: 'List all campaigns',
				action: 'List campaigns',
			},
		],
		default: 'listCampaigns',
	},
];

export const campaignsFields: INodeProperties[] = [
	// ----------------------------------
	//         getCampaign / getCampaignMetrics / etc.
	// ----------------------------------
	{
		displayName: 'Campaign ID',
		name: 'campaignId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the campaign',
		displayOptions: {
			show: {
				resource: ['campaigns'],
				operation: [
					'getCampaign',
					'getCampaignMetrics',
					'getCampaignActions',
					'getCampaignTriggers',
					'listCampaignMessages',
				],
			},
		},
	},

	// ----------------------------------
	//         getCampaignMetrics
	// ----------------------------------
	{
		displayName: 'Metric Options',
		name: 'metricOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['campaigns'],
				operation: ['getCampaignMetrics'],
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
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'Email', value: 'email' },
					{ name: 'Push', value: 'push' },
					{ name: 'SMS', value: 'sms' },
					{ name: 'Slack', value: 'slack' },
					{ name: 'Webhook', value: 'webhook' },
				],
				default: 'email',
				description: 'Filter by message type',
			},
		],
	},

	// ----------------------------------
	//         listCampaignMessages
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['campaigns'],
				operation: ['listCampaignMessages'],
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
				resource: ['campaigns'],
				operation: ['listCampaignMessages'],
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

	if (operation === 'listCampaigns') {
		const endpoint = '/campaigns';
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'getCampaign') {
		const campaignId = this.getNodeParameter('campaignId', index) as number;

		const endpoint = `/campaigns/${campaignId}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'getCampaignMetrics') {
		const campaignId = this.getNodeParameter('campaignId', index) as number;
		const metricOptions = this.getNodeParameter('metricOptions', index, {}) as IDataObject;

		const endpoint = `/campaigns/${campaignId}/metrics`;
		const qs: IDataObject = {};

		if (metricOptions.period) {
			qs.period = metricOptions.period;
		}
		if (metricOptions.steps) {
			qs.steps = metricOptions.steps;
		}
		if (metricOptions.type) {
			qs.type = metricOptions.type;
		}

		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			qs,
			'app',
		)) as IDataObject;
	} else if (operation === 'getCampaignActions') {
		const campaignId = this.getNodeParameter('campaignId', index) as number;

		const endpoint = `/campaigns/${campaignId}/actions`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'getCampaignTriggers') {
		const campaignId = this.getNodeParameter('campaignId', index) as number;

		const endpoint = `/campaigns/${campaignId}/triggers`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'listCampaignMessages') {
		const campaignId = this.getNodeParameter('campaignId', index) as number;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;

		const endpoint = `/campaigns/${campaignId}/messages`;

		if (returnAll) {
			responseData = await customerIoApiRequestAllItems.call(
				this,
				'GET',
				endpoint,
				{},
				{},
				'app',
				'messages',
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
		throw new Error(`Operation "${operation}" is not supported for Campaigns resource`);
	}

	if (Array.isArray(responseData)) {
		return responseData.map((item) => ({
			json: item,
			pairedItem: { item: index },
		}));
	}

	return [{ json: responseData, pairedItem: { item: index } }];
}
