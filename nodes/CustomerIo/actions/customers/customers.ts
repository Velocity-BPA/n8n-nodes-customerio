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
import { prepareFilters } from '../../utils/helpers';

export const customersOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customers'],
			},
		},
		options: [
			{
				name: 'Export',
				value: 'exportCustomers',
				description: 'Export customer data',
				action: 'Export customers',
			},
			{
				name: 'Get',
				value: 'getCustomer',
				description: 'Get a customer by ID',
				action: 'Get a customer',
			},
			{
				name: 'Get Activities',
				value: 'getCustomerActivities',
				description: 'Get activities for a customer',
				action: 'Get customer activities',
			},
			{
				name: 'Get Attributes',
				value: 'getCustomerAttributes',
				description: 'Get all attributes for a customer',
				action: 'Get customer attributes',
			},
			{
				name: 'Get Messages',
				value: 'getCustomerMessages',
				description: 'Get messages sent to a customer',
				action: 'Get customer messages',
			},
			{
				name: 'Get Segments',
				value: 'getCustomerSegments',
				description: 'Get segments a customer belongs to',
				action: 'Get customer segments',
			},
			{
				name: 'List',
				value: 'listCustomers',
				description: 'List all customers',
				action: 'List customers',
			},
			{
				name: 'Search',
				value: 'searchCustomers',
				description: 'Search for customers',
				action: 'Search customers',
			},
		],
		default: 'listCustomers',
	},
];

export const customersFields: INodeProperties[] = [
	// ----------------------------------
	//         getCustomer / getCustomerAttributes / etc.
	// ----------------------------------
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the customer',
		displayOptions: {
			show: {
				resource: ['customers'],
				operation: [
					'getCustomer',
					'getCustomerAttributes',
					'getCustomerSegments',
					'getCustomerMessages',
					'getCustomerActivities',
				],
			},
		},
	},

	// ----------------------------------
	//         listCustomers
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['customers'],
				operation: ['listCustomers', 'searchCustomers', 'getCustomerMessages', 'getCustomerActivities'],
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
				resource: ['customers'],
				operation: ['listCustomers', 'searchCustomers', 'getCustomerMessages', 'getCustomerActivities'],
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
				resource: ['customers'],
				operation: ['listCustomers'],
			},
		},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Filter by email address',
			},
		],
	},

	// ----------------------------------
	//         searchCustomers
	// ----------------------------------
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'json',
		required: true,
		default: '{\n  "filter": {\n    "and": [\n      {\n        "attribute": {\n          "field": "email",\n          "operator": "exists"\n        }\n      }\n    ]\n  }\n}',
		description: 'The search query in Customer.io filter format',
		displayOptions: {
			show: {
				resource: ['customers'],
				operation: ['searchCustomers'],
			},
		},
	},

	// ----------------------------------
	//         exportCustomers
	// ----------------------------------
	{
		displayName: 'Customer IDs',
		name: 'customerIds',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'id1,id2,id3',
		description: 'Comma-separated list of customer IDs to export',
		displayOptions: {
			show: {
				resource: ['customers'],
				operation: ['exportCustomers'],
			},
		},
	},

	// ----------------------------------
	//         getCustomerActivities
	// ----------------------------------
	{
		displayName: 'Activity Type',
		name: 'activityType',
		type: 'options',
		default: '',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Attribute Change', value: 'attribute_change' },
			{ name: 'Bounced Email', value: 'bounced_email' },
			{ name: 'Clicked Email', value: 'clicked_email' },
			{ name: 'Converted Email', value: 'converted_email' },
			{ name: 'Enrolled Campaign', value: 'enrolled_campaign' },
			{ name: 'Entered Segment', value: 'entered_segment' },
			{ name: 'Event', value: 'event' },
			{ name: 'Exited Segment', value: 'exited_segment' },
			{ name: 'Opened Email', value: 'opened_email' },
			{ name: 'Page', value: 'page' },
			{ name: 'Sent Email', value: 'sent_email' },
			{ name: 'Sent Push', value: 'sent_push' },
			{ name: 'Sent SMS', value: 'sent_sms' },
			{ name: 'Unsubscribed Email', value: 'unsubscribed_email' },
		],
		displayOptions: {
			show: {
				resource: ['customers'],
				operation: ['getCustomerActivities'],
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

	if (operation === 'listCustomers') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

		const endpoint = '/customers';
		const qs = prepareFilters(filters);

		if (returnAll) {
			responseData = await customerIoApiRequestAllItems.call(
				this,
				'GET',
				endpoint,
				{},
				qs,
				'app',
				'customers',
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
	} else if (operation === 'getCustomer') {
		const customerId = this.getNodeParameter('customerId', index) as string;

		const endpoint = `/customers/${encodeURIComponent(customerId)}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'searchCustomers') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const searchQueryRaw = this.getNodeParameter('searchQuery', index) as string;

		let searchQuery: IDataObject;
		try {
			searchQuery = JSON.parse(searchQueryRaw);
		} catch {
			throw new Error('Invalid JSON in search query');
		}

		const endpoint = '/customers';

		if (returnAll) {
			responseData = await customerIoApiRequestAllItems.call(
				this,
				'POST',
				endpoint,
				searchQuery,
				{},
				'beta',
				'identifiers',
			);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			searchQuery.limit = limit;
			responseData = (await customerIoApiRequest.call(
				this,
				'POST',
				endpoint,
				searchQuery,
				{},
				'beta',
			)) as IDataObject;
		}
	} else if (operation === 'getCustomerAttributes') {
		const customerId = this.getNodeParameter('customerId', index) as string;

		const endpoint = `/customers/${encodeURIComponent(customerId)}/attributes`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'getCustomerSegments') {
		const customerId = this.getNodeParameter('customerId', index) as string;

		const endpoint = `/customers/${encodeURIComponent(customerId)}/segments`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'getCustomerMessages') {
		const customerId = this.getNodeParameter('customerId', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;

		const endpoint = `/customers/${encodeURIComponent(customerId)}/messages`;

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
	} else if (operation === 'getCustomerActivities') {
		const customerId = this.getNodeParameter('customerId', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const activityType = this.getNodeParameter('activityType', index, '') as string;

		const endpoint = `/customers/${encodeURIComponent(customerId)}/activities`;
		const qs: IDataObject = {};

		if (activityType) {
			qs.type = activityType;
		}

		if (returnAll) {
			responseData = await customerIoApiRequestAllItems.call(
				this,
				'GET',
				endpoint,
				{},
				qs,
				'app',
				'activities',
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
	} else if (operation === 'exportCustomers') {
		const customerIds = this.getNodeParameter('customerIds', index) as string;
		const ids = customerIds.split(',').map((id) => id.trim());

		const body: IDataObject = {
			ids,
		};

		const endpoint = '/exports/customers';
		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			body,
			{},
			'app',
		)) as IDataObject;
	} else {
		throw new Error(`Operation "${operation}" is not supported for Customers resource`);
	}

	if (Array.isArray(responseData)) {
		return responseData.map((item) => ({
			json: item,
			pairedItem: { item: index },
		}));
	}

	return [{ json: responseData, pairedItem: { item: index } }];
}
