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

export const activitiesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['activities'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'getActivity',
				description: 'Get an activity by ID',
				action: 'Get an activity',
			},
			{
				name: 'List',
				value: 'listActivities',
				description: 'List activities',
				action: 'List activities',
			},
		],
		default: 'listActivities',
	},
];

export const activitiesFields: INodeProperties[] = [
	// ----------------------------------
	//         getActivity
	// ----------------------------------
	{
		displayName: 'Activity ID',
		name: 'activityId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the activity',
		displayOptions: {
			show: {
				resource: ['activities'],
				operation: ['getActivity'],
			},
		},
	},

	// ----------------------------------
	//         listActivities
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['activities'],
				operation: ['listActivities'],
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
				resource: ['activities'],
				operation: ['listActivities'],
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
				resource: ['activities'],
				operation: ['listActivities'],
			},
		},
		options: [
			{
				displayName: 'Customer ID',
				name: 'customer_id',
				type: 'string',
				default: '',
				description: 'Filter by customer ID',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Attribute Change', value: 'attribute_change' },
					{ name: 'Bounced Email', value: 'bounced_email' },
					{ name: 'Clicked Email', value: 'clicked_email' },
					{ name: 'Clicked Push', value: 'clicked_push' },
					{ name: 'Clicked SMS', value: 'clicked_sms' },
					{ name: 'Clicked Slack', value: 'clicked_slack' },
					{ name: 'Clicked Webhook', value: 'clicked_webhook' },
					{ name: 'Converted Email', value: 'converted_email' },
					{ name: 'Converted Push', value: 'converted_push' },
					{ name: 'Converted SMS', value: 'converted_sms' },
					{ name: 'Converted Slack', value: 'converted_slack' },
					{ name: 'Converted Webhook', value: 'converted_webhook' },
					{ name: 'Delivered SMS', value: 'delivered_sms' },
					{ name: 'Drafted Email', value: 'drafted_email' },
					{ name: 'Enrolled Campaign', value: 'enrolled_campaign' },
					{ name: 'Entered Segment', value: 'entered_segment' },
					{ name: 'Event', value: 'event' },
					{ name: 'Exited Campaign Workflow', value: 'exited_campaign_workflow' },
					{ name: 'Exited Segment', value: 'exited_segment' },
					{ name: 'Failed Attribute Change', value: 'failed_attribute_change' },
					{ name: 'Finished Campaign Workflow', value: 'finished_campaign_workflow' },
					{ name: 'Marked Email as Spam', value: 'marked_email_as_spam' },
					{ name: 'Opened Email', value: 'opened_email' },
					{ name: 'Opened Push', value: 'opened_push' },
					{ name: 'Page', value: 'page' },
					{ name: 'Paused Campaign Workflow', value: 'paused_campaign_workflow' },
					{ name: 'Sent Email', value: 'sent_email' },
					{ name: 'Sent Push', value: 'sent_push' },
					{ name: 'Sent Slack', value: 'sent_slack' },
					{ name: 'Sent SMS', value: 'sent_sms' },
					{ name: 'Sent Webhook', value: 'sent_webhook' },
					{ name: 'Started Campaign Workflow', value: 'started_campaign_workflow' },
					{ name: 'Stripe Event', value: 'stripe_event' },
					{ name: 'Subscribed Email', value: 'subscribed_email' },
					{ name: 'Undelivered SMS', value: 'undelivered_sms' },
					{ name: 'Unsubscribed Email', value: 'unsubscribed_email' },
				],
				default: '',
				description: 'Filter by activity type',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by activity name (for events)',
			},
			{
				displayName: 'Deleted',
				name: 'deleted',
				type: 'boolean',
				default: false,
				description: 'Whether to include activities for deleted customers',
			},
			{
				displayName: 'Start',
				name: 'start',
				type: 'dateTime',
				default: '',
				description: 'Filter activities after this time',
			},
			{
				displayName: 'End',
				name: 'end',
				type: 'dateTime',
				default: '',
				description: 'Filter activities before this time',
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

	if (operation === 'listActivities') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

		const endpoint = '/activities';
		const qs: IDataObject = {};

		// Add filters
		if (filters.customer_id) {
			qs.customer_id = filters.customer_id;
		}
		if (filters.type) {
			qs.type = filters.type;
		}
		if (filters.name) {
			qs.name = filters.name;
		}
		if (filters.deleted !== undefined) {
			qs.deleted = filters.deleted;
		}
		if (filters.start) {
			qs.start = Math.floor(new Date(filters.start as string).getTime() / 1000);
		}
		if (filters.end) {
			qs.end = Math.floor(new Date(filters.end as string).getTime() / 1000);
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
	} else if (operation === 'getActivity') {
		const activityId = this.getNodeParameter('activityId', index) as string;

		const endpoint = `/activities/${activityId}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else {
		throw new Error(`Operation "${operation}" is not supported for Activities resource`);
	}

	if (Array.isArray(responseData)) {
		return responseData.map((item) => ({
			json: item,
			pairedItem: { item: index },
		}));
	}

	return [{ json: responseData, pairedItem: { item: index } }];
}
