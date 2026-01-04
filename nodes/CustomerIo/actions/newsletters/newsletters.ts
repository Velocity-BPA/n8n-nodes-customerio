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

export const newslettersOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['newsletters'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'getNewsletter',
				description: 'Get a newsletter by ID',
				action: 'Get a newsletter',
			},
			{
				name: 'Get Contents',
				value: 'getNewsletterContents',
				description: 'Get content variants for a newsletter',
				action: 'Get newsletter contents',
			},
			{
				name: 'Get Metrics',
				value: 'getNewsletterMetrics',
				description: 'Get metrics for a newsletter',
				action: 'Get newsletter metrics',
			},
			{
				name: 'List',
				value: 'listNewsletters',
				description: 'List all newsletters',
				action: 'List newsletters',
			},
		],
		default: 'listNewsletters',
	},
];

export const newslettersFields: INodeProperties[] = [
	// ----------------------------------
	//         getNewsletter / getNewsletterMetrics / getNewsletterContents
	// ----------------------------------
	{
		displayName: 'Newsletter ID',
		name: 'newsletterId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the newsletter',
		displayOptions: {
			show: {
				resource: ['newsletters'],
				operation: ['getNewsletter', 'getNewsletterMetrics', 'getNewsletterContents'],
			},
		},
	},

	// ----------------------------------
	//         getNewsletterMetrics
	// ----------------------------------
	{
		displayName: 'Metric Options',
		name: 'metricOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['newsletters'],
				operation: ['getNewsletterMetrics'],
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
	//         listNewsletters
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['newsletters'],
				operation: ['listNewsletters'],
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
				resource: ['newsletters'],
				operation: ['listNewsletters'],
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

	if (operation === 'listNewsletters') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;

		const endpoint = '/newsletters';

		if (returnAll) {
			responseData = await customerIoApiRequestAllItems.call(
				this,
				'GET',
				endpoint,
				{},
				{},
				'app',
				'newsletters',
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
	} else if (operation === 'getNewsletter') {
		const newsletterId = this.getNodeParameter('newsletterId', index) as number;

		const endpoint = `/newsletters/${newsletterId}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'getNewsletterMetrics') {
		const newsletterId = this.getNodeParameter('newsletterId', index) as number;
		const metricOptions = this.getNodeParameter('metricOptions', index, {}) as IDataObject;

		const endpoint = `/newsletters/${newsletterId}/metrics`;
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
	} else if (operation === 'getNewsletterContents') {
		const newsletterId = this.getNodeParameter('newsletterId', index) as number;

		const endpoint = `/newsletters/${newsletterId}/contents`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else {
		throw new Error(`Operation "${operation}" is not supported for Newsletters resource`);
	}

	if (Array.isArray(responseData)) {
		return responseData.map((item) => ({
			json: item,
			pairedItem: { item: index },
		}));
	}

	return [{ json: responseData, pairedItem: { item: index } }];
}
