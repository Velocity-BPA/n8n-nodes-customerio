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

export const segmentsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['segments'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'getSegment',
				description: 'Get a segment by ID',
				action: 'Get a segment',
			},
			{
				name: 'Get Membership',
				value: 'getSegmentMembership',
				description: 'Get people in a segment',
				action: 'Get segment membership',
			},
			{
				name: 'List',
				value: 'listSegments',
				description: 'List all segments',
				action: 'List segments',
			},
		],
		default: 'listSegments',
	},
];

export const segmentsFields: INodeProperties[] = [
	// ----------------------------------
	//         getSegment / getSegmentMembership
	// ----------------------------------
	{
		displayName: 'Segment ID',
		name: 'segmentId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the segment',
		displayOptions: {
			show: {
				resource: ['segments'],
				operation: ['getSegment', 'getSegmentMembership'],
			},
		},
	},

	// ----------------------------------
	//         getSegmentMembership
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['segments'],
				operation: ['getSegmentMembership'],
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
				resource: ['segments'],
				operation: ['getSegmentMembership'],
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

	if (operation === 'listSegments') {
		const endpoint = '/segments';
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'getSegment') {
		const segmentId = this.getNodeParameter('segmentId', index) as number;

		const endpoint = `/segments/${segmentId}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'getSegmentMembership') {
		const segmentId = this.getNodeParameter('segmentId', index) as number;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;

		const endpoint = `/segments/${segmentId}/membership`;

		if (returnAll) {
			responseData = await customerIoApiRequestAllItems.call(
				this,
				'GET',
				endpoint,
				{},
				{},
				'app',
				'ids',
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
		throw new Error(`Operation "${operation}" is not supported for Segments resource`);
	}

	if (Array.isArray(responseData)) {
		return responseData.map((item) => ({
			json: item,
			pairedItem: { item: index },
		}));
	}

	return [{ json: responseData, pairedItem: { item: index } }];
}
