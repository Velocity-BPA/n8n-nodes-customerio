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
import { prepareAttributes, cleanObject } from '../../utils/helpers';

export const transactionalOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transactional'],
			},
		},
		options: [
			{
				name: 'Get Status',
				value: 'getTransactionalStatus',
				description: 'Get delivery status of a transactional message',
				action: 'Get transactional status',
			},
			{
				name: 'Send Email',
				value: 'sendEmail',
				description: 'Send a transactional email',
				action: 'Send transactional email',
			},
			{
				name: 'Send Push',
				value: 'sendPush',
				description: 'Send a transactional push notification',
				action: 'Send transactional push',
			},
			{
				name: 'Send SMS',
				value: 'sendSMS',
				description: 'Send a transactional SMS',
				action: 'Send transactional SMS',
			},
		],
		default: 'sendEmail',
	},
];

export const transactionalFields: INodeProperties[] = [
	// ----------------------------------
	//         sendEmail
	// ----------------------------------
	{
		displayName: 'Transactional Message ID',
		name: 'transactionalId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the transactional message template',
		displayOptions: {
			show: {
				resource: ['transactional'],
				operation: ['sendEmail', 'sendPush', 'sendSMS'],
			},
		},
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'name@email.com',
		description: 'The recipient email address or customer ID',
		displayOptions: {
			show: {
				resource: ['transactional'],
				operation: ['sendEmail'],
			},
		},
	},
	{
		displayName: 'Identifiers (JSON)',
		name: 'identifiers',
		type: 'json',
		required: true,
		default: '{\n  "id": "customer_123"\n}',
		description: 'The identifiers for the recipient (id or email)',
		displayOptions: {
			show: {
				resource: ['transactional'],
				operation: ['sendPush', 'sendSMS'],
			},
		},
	},
	{
		displayName: 'Email Options',
		name: 'emailOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['transactional'],
				operation: ['sendEmail'],
			},
		},
		options: [
			{
				displayName: 'BCC',
				name: 'bcc',
				type: 'string',
				default: '',
				placeholder: 'bcc@email.com',
				description: 'BCC recipient email address',
			},
			{
				displayName: 'Disable Message Retention',
				name: 'disable_message_retention',
				type: 'boolean',
				default: false,
				description: 'Whether to disable message retention for GDPR compliance',
			},
			{
				displayName: 'From',
				name: 'from',
				type: 'string',
				default: '',
				placeholder: 'sender@email.com',
				description: 'Override the from address',
			},
			{
				displayName: 'Queue Draft',
				name: 'queue_draft',
				type: 'boolean',
				default: false,
				description: 'Whether to queue as draft instead of sending immediately',
			},
			{
				displayName: 'Reply To',
				name: 'reply_to',
				type: 'string',
				default: '',
				placeholder: 'reply@email.com',
				description: 'Reply-to email address',
			},
			{
				displayName: 'Send to Unsubscribed',
				name: 'send_to_unsubscribed',
				type: 'boolean',
				default: false,
				description: 'Whether to send to unsubscribed recipients',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Override the email subject',
			},
			{
				displayName: 'Track Clicks',
				name: 'tracked',
				type: 'boolean',
				default: true,
				description: 'Whether to track clicks in the email',
			},
			{
				displayName: 'Track Opens',
				name: 'track_opens',
				type: 'boolean',
				default: true,
				description: 'Whether to track email opens',
			},
		],
	},
	{
		displayName: 'Message Data',
		name: 'messageDataUi',
		type: 'fixedCollection',
		placeholder: 'Add Data',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['transactional'],
				operation: ['sendEmail', 'sendPush', 'sendSMS'],
			},
		},
		description: 'Custom data to use in the message template',
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
						description: 'The data key (use in template as {{ key }})',
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
	//         sendPush / sendSMS
	// ----------------------------------
	{
		displayName: 'Push Options',
		name: 'pushOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['transactional'],
				operation: ['sendPush'],
			},
		},
		options: [
			{
				displayName: 'Custom Device',
				name: 'custom_device',
				type: 'json',
				default: '{}',
				description: 'Custom device targeting',
			},
			{
				displayName: 'Disable Message Retention',
				name: 'disable_message_retention',
				type: 'boolean',
				default: false,
				description: 'Whether to disable message retention',
			},
			{
				displayName: 'Send to Unsubscribed',
				name: 'send_to_unsubscribed',
				type: 'boolean',
				default: false,
				description: 'Whether to send to unsubscribed recipients',
			},
		],
	},
	{
		displayName: 'SMS Options',
		name: 'smsOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['transactional'],
				operation: ['sendSMS'],
			},
		},
		options: [
			{
				displayName: 'Disable Message Retention',
				name: 'disable_message_retention',
				type: 'boolean',
				default: false,
				description: 'Whether to disable message retention',
			},
			{
				displayName: 'Send to Unsubscribed',
				name: 'send_to_unsubscribed',
				type: 'boolean',
				default: false,
				description: 'Whether to send to unsubscribed recipients',
			},
		],
	},

	// ----------------------------------
	//         getTransactionalStatus
	// ----------------------------------
	{
		displayName: 'Delivery ID',
		name: 'deliveryId',
		type: 'string',
		required: true,
		default: '',
		description: 'The delivery ID returned when sending the transactional message',
		displayOptions: {
			show: {
				resource: ['transactional'],
				operation: ['getTransactionalStatus'],
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

	if (operation === 'sendEmail') {
		const transactionalId = this.getNodeParameter('transactionalId', index) as number;
		const to = this.getNodeParameter('to', index) as string;
		const emailOptions = this.getNodeParameter('emailOptions', index, {}) as IDataObject;
		const messageDataUi = this.getNodeParameter('messageDataUi', index, {}) as IDataObject;

		const body: IDataObject = {
			transactional_message_id: transactionalId,
			to,
			identifiers: {
				email: to,
			},
		};

		// Add email options
		if (emailOptions.from) body.from = emailOptions.from;
		if (emailOptions.reply_to) body.reply_to = emailOptions.reply_to;
		if (emailOptions.bcc) body.bcc = emailOptions.bcc;
		if (emailOptions.subject) body.subject = emailOptions.subject;
		if (emailOptions.tracked !== undefined) body.tracked = emailOptions.tracked;
		if (emailOptions.track_opens !== undefined) body.track_opens = emailOptions.track_opens;
		if (emailOptions.disable_message_retention !== undefined) {
			body.disable_message_retention = emailOptions.disable_message_retention;
		}
		if (emailOptions.send_to_unsubscribed !== undefined) {
			body.send_to_unsubscribed = emailOptions.send_to_unsubscribed;
		}
		if (emailOptions.queue_draft !== undefined) body.queue_draft = emailOptions.queue_draft;

		// Add message data
		const messageData = prepareAttributes(messageDataUi);
		if (Object.keys(messageData).length > 0) {
			body.message_data = messageData;
		}

		const endpoint = '/send/email';
		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			cleanObject(body),
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'sendPush') {
		const transactionalId = this.getNodeParameter('transactionalId', index) as number;
		const identifiersRaw = this.getNodeParameter('identifiers', index) as string;
		const pushOptions = this.getNodeParameter('pushOptions', index, {}) as IDataObject;
		const messageDataUi = this.getNodeParameter('messageDataUi', index, {}) as IDataObject;

		let identifiers: IDataObject;
		try {
			identifiers = JSON.parse(identifiersRaw);
		} catch {
			throw new Error('Invalid JSON in identifiers');
		}

		const body: IDataObject = {
			transactional_message_id: transactionalId,
			identifiers,
		};

		// Add push options
		if (pushOptions.custom_device) {
			try {
				body.custom_device = JSON.parse(pushOptions.custom_device as string);
			} catch {
				body.custom_device = pushOptions.custom_device;
			}
		}
		if (pushOptions.disable_message_retention !== undefined) {
			body.disable_message_retention = pushOptions.disable_message_retention;
		}
		if (pushOptions.send_to_unsubscribed !== undefined) {
			body.send_to_unsubscribed = pushOptions.send_to_unsubscribed;
		}

		// Add message data
		const messageData = prepareAttributes(messageDataUi);
		if (Object.keys(messageData).length > 0) {
			body.message_data = messageData;
		}

		const endpoint = '/send/push';
		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			cleanObject(body),
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'sendSMS') {
		const transactionalId = this.getNodeParameter('transactionalId', index) as number;
		const identifiersRaw = this.getNodeParameter('identifiers', index) as string;
		const smsOptions = this.getNodeParameter('smsOptions', index, {}) as IDataObject;
		const messageDataUi = this.getNodeParameter('messageDataUi', index, {}) as IDataObject;

		let identifiers: IDataObject;
		try {
			identifiers = JSON.parse(identifiersRaw);
		} catch {
			throw new Error('Invalid JSON in identifiers');
		}

		const body: IDataObject = {
			transactional_message_id: transactionalId,
			identifiers,
		};

		// Add SMS options
		if (smsOptions.disable_message_retention !== undefined) {
			body.disable_message_retention = smsOptions.disable_message_retention;
		}
		if (smsOptions.send_to_unsubscribed !== undefined) {
			body.send_to_unsubscribed = smsOptions.send_to_unsubscribed;
		}

		// Add message data
		const messageData = prepareAttributes(messageDataUi);
		if (Object.keys(messageData).length > 0) {
			body.message_data = messageData;
		}

		const endpoint = '/send/sms';
		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			cleanObject(body),
			{},
			'app',
		)) as IDataObject;
	} else if (operation === 'getTransactionalStatus') {
		const deliveryId = this.getNodeParameter('deliveryId', index) as string;

		const endpoint = `/messages/${deliveryId}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{},
			'app',
		)) as IDataObject;
	} else {
		throw new Error(`Operation "${operation}" is not supported for Transactional resource`);
	}

	return [{ json: responseData, pairedItem: { item: index } }];
}
