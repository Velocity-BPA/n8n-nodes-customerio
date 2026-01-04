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
import { cleanObject } from '../../utils/helpers';

export const exportsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['exports'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'createExport',
				description: 'Create a new data export',
				action: 'Create an export',
			},
			{
				name: 'Download',
				value: 'downloadExport',
				description: 'Download an export file',
				action: 'Download an export',
			},
			{
				name: 'Get',
				value: 'getExport',
				description: 'Get export status',
				action: 'Get an export',
			},
			{
				name: 'List',
				value: 'listExports',
				description: 'List all exports',
				action: 'List exports',
			},
		],
		default: 'listExports',
	},
];

export const exportsFields: INodeProperties[] = [
	// ----------------------------------
	//         createExport
	// ----------------------------------
	{
		displayName: 'Export Type',
		name: 'exportType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Customers', value: 'customers' },
			{ name: 'Deliveries', value: 'deliveries' },
			{ name: 'Newsletter Deliveries', value: 'newsletter_deliveries' },
		],
		default: 'customers',
		description: 'The type of data to export',
		displayOptions: {
			show: {
				resource: ['exports'],
				operation: ['createExport'],
			},
		},
	},
	{
		displayName: 'Customer IDs',
		name: 'customerIds',
		type: 'string',
		default: '',
		placeholder: 'id1,id2,id3',
		description: 'Comma-separated list of customer IDs to export',
		displayOptions: {
			show: {
				resource: ['exports'],
				operation: ['createExport'],
				exportType: ['customers'],
			},
		},
	},
	{
		displayName: 'Segment ID',
		name: 'segmentId',
		type: 'number',
		default: 0,
		description: 'Export customers in this segment',
		displayOptions: {
			show: {
				resource: ['exports'],
				operation: ['createExport'],
				exportType: ['customers'],
			},
		},
	},
	{
		displayName: 'Filter (JSON)',
		name: 'filter',
		type: 'json',
		default: '{}',
		description: 'Filter for deliveries export',
		displayOptions: {
			show: {
				resource: ['exports'],
				operation: ['createExport'],
				exportType: ['deliveries'],
			},
		},
	},
	{
		displayName: 'Newsletter ID',
		name: 'newsletterId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The newsletter ID to export deliveries for',
		displayOptions: {
			show: {
				resource: ['exports'],
				operation: ['createExport'],
				exportType: ['newsletter_deliveries'],
			},
		},
	},

	// ----------------------------------
	//         getExport / downloadExport
	// ----------------------------------
	{
		displayName: 'Export ID',
		name: 'exportId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the export',
		displayOptions: {
			show: {
				resource: ['exports'],
				operation: ['getExport', 'downloadExport'],
			},
		},
	},

	// ----------------------------------
	//         listExports
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['exports'],
				operation: ['listExports'],
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
				resource: ['exports'],
				operation: ['listExports'],
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

	if (operation === 'listExports') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;

		const endpoint = '/exports';

		if (returnAll) {
			responseData = await customerIoApiRequestAllItems.call(
				this,
				'GET',
				endpoint,
				{},
				{},
				'app',
				'exports',
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
	} else if (operation === 'getExport') {
		const exportId = this.getNodeParameter('exportId', index) as number;

		const endpoint = `/exports/${exportId}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'createExport') {
		const exportType = this.getNodeParameter('exportType', index) as string;

		let endpoint: string;
		const body: IDataObject = {};

		if (exportType === 'customers') {
			endpoint = '/exports/customers';
			const customerIds = this.getNodeParameter('customerIds', index, '') as string;
			const segmentId = this.getNodeParameter('segmentId', index, 0) as number;

			if (customerIds) {
				body.ids = customerIds.split(',').map((id) => id.trim());
			}
			if (segmentId && segmentId !== 0) {
				body.segment = { id: segmentId };
			}
		} else if (exportType === 'deliveries') {
			endpoint = '/exports/deliveries';
			const filterRaw = this.getNodeParameter('filter', index, '{}') as string;

			try {
				const filter = JSON.parse(filterRaw);
				if (Object.keys(filter).length > 0) {
					body.filters = filter;
				}
			} catch {
				// Ignore invalid JSON
			}
		} else {
			// newsletter_deliveries
			endpoint = '/exports/deliveries';
			const newsletterId = this.getNodeParameter('newsletterId', index) as number;
			body.newsletter_id = newsletterId;
		}

		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			cleanObject(body),
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'downloadExport') {
		const exportId = this.getNodeParameter('exportId', index) as number;

		const endpoint = `/exports/${exportId}/download`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else {
		throw new Error(`Operation "${operation}" is not supported for Exports resource`);
	}

	if (Array.isArray(responseData)) {
		return responseData.map((item) => ({
			json: item,
			pairedItem: { item: index },
		}));
	}

	return [{ json: responseData, pairedItem: { item: index } }];
}
