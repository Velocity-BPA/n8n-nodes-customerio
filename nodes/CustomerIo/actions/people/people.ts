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

import { customerIoApiRequest } from '../../transport';
import { prepareAttributes, formatTimestamp, cleanObject } from '../../utils/helpers';

export const peopleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['people'],
			},
		},
		options: [
			{
				name: 'Add Device',
				value: 'addDevice',
				description: 'Add a mobile device token to a person',
				action: 'Add device to a person',
			},
			{
				name: 'Delete',
				value: 'deletePerson',
				description: 'Delete a person',
				action: 'Delete a person',
			},
			{
				name: 'Delete Device',
				value: 'deleteDevice',
				description: 'Remove a device token from a person',
				action: 'Delete device from a person',
			},
			{
				name: 'Identify',
				value: 'identify',
				description: 'Create or update a person',
				action: 'Identify a person',
			},
			{
				name: 'Merge',
				value: 'mergePeople',
				description: 'Merge two people together',
				action: 'Merge people',
			},
			{
				name: 'Suppress',
				value: 'suppress',
				description: 'Suppress a person to stop all messaging',
				action: 'Suppress a person',
			},
			{
				name: 'Unsuppress',
				value: 'unsuppress',
				description: 'Unsuppress a person to resume messaging',
				action: 'Unsuppress a person',
			},
		],
		default: 'identify',
	},
];

export const peopleFields: INodeProperties[] = [
	// ----------------------------------
	//         identify
	// ----------------------------------
	{
		displayName: 'Identifier',
		name: 'identifier',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier for the person (ID or email)',
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['identify', 'deletePerson', 'addDevice', 'deleteDevice', 'suppress', 'unsuppress'],
			},
		},
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		description: 'The email address of the person',
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['identify'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['identify'],
			},
		},
		options: [
			{
				displayName: 'Anonymous ID',
				name: 'anonymous_id',
				type: 'string',
				default: '',
				description: 'The anonymous ID to associate with this person',
			},
			{
				displayName: 'Created At',
				name: 'created_at',
				type: 'dateTime',
				default: '',
				description: 'The timestamp when this person was created',
			},
			{
				displayName: 'CIO Subscription Preferences',
				name: 'cio_subscription_preferences',
				type: 'json',
				default: '{}',
				description: 'Subscription preferences object',
			},
			{
				displayName: 'Unsubscribed',
				name: 'unsubscribed',
				type: 'boolean',
				default: false,
				description: 'Whether the person is unsubscribed from emails',
			},
		],
	},
	{
		displayName: 'Custom Attributes',
		name: 'attributesUi',
		type: 'fixedCollection',
		placeholder: 'Add Attribute',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['identify'],
			},
		},
		options: [
			{
				name: 'attributeValues',
				displayName: 'Attribute',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						description: 'The attribute name',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The attribute value (supports JSON for complex types)',
					},
				],
			},
		],
	},

	// ----------------------------------
	//         addDevice
	// ----------------------------------
	{
		displayName: 'Device ID',
		name: 'deviceId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique device token',
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['addDevice', 'deleteDevice'],
			},
		},
	},
	{
		displayName: 'Platform',
		name: 'platform',
		type: 'options',
		required: true,
		options: [
			{
				name: 'iOS',
				value: 'ios',
			},
			{
				name: 'Android',
				value: 'android',
			},
		],
		default: 'ios',
		description: 'The device platform',
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['addDevice'],
			},
		},
	},
	{
		displayName: 'Device Options',
		name: 'deviceOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['addDevice'],
			},
		},
		options: [
			{
				displayName: 'Last Used',
				name: 'last_used',
				type: 'dateTime',
				default: '',
				description: 'When the device was last used',
			},
		],
	},

	// ----------------------------------
	//         mergePeople
	// ----------------------------------
	{
		displayName: 'Primary ID',
		name: 'primaryId',
		type: 'string',
		required: true,
		default: '',
		description: 'The identifier of the person to keep',
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['mergePeople'],
			},
		},
	},
	{
		displayName: 'Secondary ID',
		name: 'secondaryId',
		type: 'string',
		required: true,
		default: '',
		description: 'The identifier of the person to merge into the primary',
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['mergePeople'],
			},
		},
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject;

	if (operation === 'identify') {
		const identifier = this.getNodeParameter('identifier', index) as string;
		const email = this.getNodeParameter('email', index, '') as string;
		const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;
		const attributesUi = this.getNodeParameter('attributesUi', index, {}) as IDataObject;

		const body: IDataObject = {};

		if (email) {
			body.email = email;
		}

		// Add additional fields
		if (additionalFields.anonymous_id) {
			body.anonymous_id = additionalFields.anonymous_id;
		}
		if (additionalFields.created_at) {
			body.created_at = formatTimestamp(additionalFields.created_at as string);
		}
		if (additionalFields.unsubscribed !== undefined) {
			body.unsubscribed = additionalFields.unsubscribed;
		}
		if (additionalFields.cio_subscription_preferences) {
			try {
				body.cio_subscription_preferences = JSON.parse(
					additionalFields.cio_subscription_preferences as string,
				);
			} catch {
				body.cio_subscription_preferences = additionalFields.cio_subscription_preferences;
			}
		}

		// Add custom attributes
		const attributes = prepareAttributes(attributesUi);
		Object.assign(body, attributes);

		const endpoint = `/customers/${encodeURIComponent(identifier)}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'PUT',
			endpoint,
			cleanObject(body),
			{},
			'track',
		)) as IDataObject;

		// Track API returns empty on success
		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, identifier };
		}
	} else if (operation === 'deletePerson') {
		const identifier = this.getNodeParameter('identifier', index) as string;

		const endpoint = `/customers/${encodeURIComponent(identifier)}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'DELETE',
			endpoint,
			{},
			{},
			'track',
		)) as IDataObject;

		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, deleted: identifier };
		}
	} else if (operation === 'addDevice') {
		const identifier = this.getNodeParameter('identifier', index) as string;
		const deviceId = this.getNodeParameter('deviceId', index) as string;
		const platform = this.getNodeParameter('platform', index) as string;
		const deviceOptions = this.getNodeParameter('deviceOptions', index, {}) as IDataObject;

		const body: IDataObject = {
			device: {
				id: deviceId,
				platform,
			},
		};

		if (deviceOptions.last_used) {
			(body.device as IDataObject).last_used = formatTimestamp(deviceOptions.last_used as string);
		}

		const endpoint = `/customers/${encodeURIComponent(identifier)}/devices`;
		responseData = (await customerIoApiRequest.call(
			this,
			'PUT',
			endpoint,
			body,
			{},
			'track',
		)) as IDataObject;

		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, identifier, deviceId };
		}
	} else if (operation === 'deleteDevice') {
		const identifier = this.getNodeParameter('identifier', index) as string;
		const deviceId = this.getNodeParameter('deviceId', index) as string;

		const endpoint = `/customers/${encodeURIComponent(identifier)}/devices/${encodeURIComponent(deviceId)}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'DELETE',
			endpoint,
			{},
			{},
			'track',
		)) as IDataObject;

		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, deleted: deviceId };
		}
	} else if (operation === 'suppress') {
		const identifier = this.getNodeParameter('identifier', index) as string;

		const endpoint = `/customers/${encodeURIComponent(identifier)}/suppress`;
		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			{},
			{},
			'track',
		)) as IDataObject;

		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, suppressed: identifier };
		}
	} else if (operation === 'unsuppress') {
		const identifier = this.getNodeParameter('identifier', index) as string;

		const endpoint = `/customers/${encodeURIComponent(identifier)}/unsuppress`;
		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			{},
			{},
			'track',
		)) as IDataObject;

		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, unsuppressed: identifier };
		}
	} else if (operation === 'mergePeople') {
		const primaryId = this.getNodeParameter('primaryId', index) as string;
		const secondaryId = this.getNodeParameter('secondaryId', index) as string;

		const body: IDataObject = {
			primary: {
				id: primaryId,
			},
			secondary: {
				id: secondaryId,
			},
		};

		const endpoint = '/merge_customers';
		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			body,
			{},
			'track',
		)) as IDataObject;

		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, primaryId, secondaryId };
		}
	} else {
		throw new Error(`Operation "${operation}" is not supported for People resource`);
	}

	return [{ json: responseData, pairedItem: { item: index } }];
}
