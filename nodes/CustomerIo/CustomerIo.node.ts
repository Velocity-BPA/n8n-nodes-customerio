/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { VELOCITY_BPA_LICENSE_NOTICE } from './constants/constants';

// Resource operations and fields
import { peopleOperations, peopleFields, execute as executePeopleOperation } from './actions/people/people';
import { eventsOperations, eventsFields, execute as executeEventsOperation } from './actions/events/events';
import { segmentsOperations, segmentsFields, execute as executeSegmentsOperation } from './actions/segments/segments';
import { customersOperations, customersFields, execute as executeCustomersOperation } from './actions/customers/customers';
import { campaignsOperations, campaignsFields, execute as executeCampaignsOperation } from './actions/campaigns/campaigns';
import { broadcastsOperations, broadcastsFields, execute as executeBroadcastsOperation } from './actions/broadcasts/broadcasts';
import { transactionalOperations, transactionalFields, execute as executeTransactionalOperation } from './actions/transactional/transactional';
import { newslettersOperations, newslettersFields, execute as executeNewslettersOperation } from './actions/newsletters/newsletters';
import { messagesOperations, messagesFields, execute as executeMessagesOperation } from './actions/messages/messages';
import { activitiesOperations, activitiesFields, execute as executeActivitiesOperation } from './actions/activities/activities';
import { exportsOperations, exportsFields, execute as executeExportsOperation } from './actions/exports/exports';
import { objectsOperations, objectsFields, execute as executeObjectsOperation } from './actions/objects/objects';
import { pipelinesOperations, pipelinesFields, executePipelinesOperation } from './actions/pipelines/pipelines';

export class CustomerIo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Customer.io',
		name: 'customerIo',
		icon: 'file:customerio.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Customer.io API for marketing automation, messaging, and customer data',
		defaults: {
			name: 'Customer.io',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'customerIoApi',
				required: true,
			},
		],
		properties: [
			// License notice (displayed at top)
			{
				displayName: VELOCITY_BPA_LICENSE_NOTICE,
				name: 'licenseNotice',
				type: 'notice',
				default: '',
			},
			// Resource selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Activity',
						value: 'activities',
						description: 'View activity logs and events',
					},
					{
						name: 'Broadcast',
						value: 'broadcasts',
						description: 'Create and trigger one-time broadcasts',
					},
					{
						name: 'Campaign',
						value: 'campaigns',
						description: 'Manage automated campaign workflows',
					},
					{
						name: 'Customer',
						value: 'customers',
						description: 'Search and retrieve customer data',
					},
					{
						name: 'Event',
						value: 'events',
						description: 'Track customer events and page views',
					},
					{
						name: 'Export',
						value: 'exports',
						description: 'Export customer and delivery data',
					},
					{
						name: 'Message',
						value: 'messages',
						description: 'View sent messages and deliveries',
					},
					{
						name: 'Newsletter',
						value: 'newsletters',
						description: 'Manage newsletter campaigns',
					},
					{
						name: 'Object',
						value: 'objects',
						description: 'Manage B2B objects and relationships',
					},
					{
						name: 'People',
						value: 'people',
						description: 'Manage customer profiles and devices',
					},
					{
						name: 'Pipeline (CDP)',
						value: 'pipelines',
						description: 'CDP operations (identify, track, page, screen, group, alias)',
					},
					{
						name: 'Segment',
						value: 'segments',
						description: 'View segments and membership',
					},
					{
						name: 'Transactional',
						value: 'transactional',
						description: 'Send transactional emails, push, and SMS',
					},
				],
				default: 'people',
			},
			// Operations and fields for each resource
			...peopleOperations,
			...peopleFields,
			...eventsOperations,
			...eventsFields,
			...segmentsOperations,
			...segmentsFields,
			...customersOperations,
			...customersFields,
			...campaignsOperations,
			...campaignsFields,
			...broadcastsOperations,
			...broadcastsFields,
			...transactionalOperations,
			...transactionalFields,
			...newslettersOperations,
			...newslettersFields,
			...messagesOperations,
			...messagesFields,
			...activitiesOperations,
			...activitiesFields,
			...exportsOperations,
			...exportsFields,
			...objectsOperations,
			...objectsFields,
			...pipelinesOperations,
			...pipelinesFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;

		// Log license notice once per execution
		this.logger.warn(VELOCITY_BPA_LICENSE_NOTICE);

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				switch (resource) {
					case 'people':
						responseData = await executePeopleOperation.call(this, i);
						break;
					case 'events':
						responseData = await executeEventsOperation.call(this, i);
						break;
					case 'segments':
						responseData = await executeSegmentsOperation.call(this, i);
						break;
					case 'customers':
						responseData = await executeCustomersOperation.call(this, i);
						break;
					case 'campaigns':
						responseData = await executeCampaignsOperation.call(this, i);
						break;
					case 'broadcasts':
						responseData = await executeBroadcastsOperation.call(this, i);
						break;
					case 'transactional':
						responseData = await executeTransactionalOperation.call(this, i);
						break;
					case 'newsletters':
						responseData = await executeNewslettersOperation.call(this, i);
						break;
					case 'messages':
						responseData = await executeMessagesOperation.call(this, i);
						break;
					case 'activities':
						responseData = await executeActivitiesOperation.call(this, i);
						break;
					case 'exports':
						responseData = await executeExportsOperation.call(this, i);
						break;
					case 'objects':
						responseData = await executeObjectsOperation.call(this, i);
						break;
					case 'pipelines':
						responseData = await executePipelinesOperation.call(this, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
