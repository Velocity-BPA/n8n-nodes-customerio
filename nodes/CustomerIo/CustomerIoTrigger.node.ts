/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';

import { VELOCITY_BPA_LICENSE_NOTICE, WEBHOOK_EVENTS } from './constants/constants';
import { validateWebhookSignature } from './transport';

export class CustomerIoTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Customer.io Trigger',
		name: 'customerIoTrigger',
		icon: 'file:customerio.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Receive Customer.io reporting webhook events',
		defaults: {
			name: 'Customer.io Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'customerIoApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			// License notice
			{
				displayName: VELOCITY_BPA_LICENSE_NOTICE,
				name: 'licenseNotice',
				type: 'notice',
				default: '',
			},
			// Events to listen for
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				description: 'The events to listen for',
				options: WEBHOOK_EVENTS.map(event => ({
					name: event.name,
					value: event.value,
					description: event.description,
				})),
			},
			// Options
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Validate Signature',
						name: 'validateSignature',
						type: 'boolean',
						default: true,
						description: 'Whether to validate the webhook signature using the Track API Key',
					},
					{
						displayName: 'Webhook Signing Key',
						name: 'webhookSigningKey',
						type: 'string',
						typeOptions: {
							password: true,
						},
						default: '',
						description: 'Custom webhook signing key (if different from Track API Key)',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// Customer.io webhooks are configured in the dashboard, not via API
				// We just return true to indicate the webhook endpoint is ready
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// Customer.io webhooks must be configured manually in the dashboard
				// The webhook URL to configure is available via this.getNodeWebhookUrl('default')
				const webhookUrl = this.getNodeWebhookUrl('default');
				this.logger.info(`Customer.io webhook URL: ${webhookUrl}`);
				this.logger.info('Please configure this URL in your Customer.io reporting webhook settings');
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// No API to delete webhooks - must be done manually in Customer.io dashboard
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;
		const headers = this.getHeaderData() as IDataObject;
		const options = this.getNodeParameter('options', {}) as IDataObject;
		const selectedEvents = this.getNodeParameter('events', []) as string[];

		// Validate signature if enabled
		if (options.validateSignature !== false) {
			const signature = headers['x-cio-signature'] as string;
			const timestamp = headers['x-cio-timestamp'] as string;

			if (!signature) {
				this.logger.warn('Customer.io webhook received without signature');
				return {
					webhookResponse: {
						status: 401,
						body: { error: 'Missing signature' },
					},
				};
			}

			let signingKey = options.webhookSigningKey as string;
			if (!signingKey) {
				// Use Track API Key as default signing key
				const credentials = await this.getCredentials('customerIoApi');
				signingKey = credentials.trackApiKey as string;
			}

			// Get raw body for signature validation
			const rawBody = req.rawBody?.toString() || JSON.stringify(body);

			const isValid = validateWebhookSignature(rawBody, signature, timestamp, signingKey);
			if (!isValid) {
				this.logger.warn('Customer.io webhook signature validation failed');
				return {
					webhookResponse: {
						status: 401,
						body: { error: 'Invalid signature' },
					},
				};
			}
		}

		// Extract event type from the webhook payload
		const eventType = body.event_type as string || body.metric as string;
		const objectType = body.object_type as string;

		// Determine the event category
		let eventCategory = '';
		if (objectType === 'email') {
			eventCategory = `email_${eventType}`;
		} else if (objectType === 'push') {
			eventCategory = `push_${eventType}`;
		} else if (objectType === 'sms') {
			eventCategory = `sms_${eventType}`;
		} else if (objectType === 'webhook') {
			eventCategory = `webhook_${eventType}`;
		} else if (objectType === 'slack') {
			eventCategory = `slack_${eventType}`;
		} else if (objectType === 'in_app') {
			eventCategory = `in_app_${eventType}`;
		} else {
			eventCategory = eventType;
		}

		// Map webhook metrics to our event values
		const eventMapping: IDataObject = {
			// Email events
			email_sent: 'emailSent',
			email_delivered: 'emailDelivered',
			email_opened: 'emailOpened',
			email_clicked: 'emailClicked',
			email_bounced: 'emailBounced',
			email_unsubscribed: 'emailUnsubscribed',
			email_complained: 'emailComplained',
			email_spamreport: 'emailComplained',
			email_converted: 'emailConverted',
			// Push events
			push_sent: 'pushSent',
			push_opened: 'pushOpened',
			push_clicked: 'pushClicked',
			// SMS events
			sms_sent: 'smsSent',
			sms_delivered: 'smsDelivered',
			sms_clicked: 'smsClicked',
			sms_failed: 'smsFailed',
			// Webhook events
			webhook_sent: 'webhookSent',
			webhook_clicked: 'webhookClicked',
			// Slack events
			slack_sent: 'slackSent',
			slack_clicked: 'slackClicked',
			// In-app events
			in_app_sent: 'inAppSent',
			in_app_opened: 'inAppOpened',
			in_app_clicked: 'inAppClicked',
		};

		const mappedEvent = eventMapping[eventCategory] as string;

		// Check if this event type is one we're listening for
		if (selectedEvents.length > 0 && mappedEvent && !selectedEvents.includes(mappedEvent)) {
			// Event type not in our selected events, acknowledge but don't process
			return {
				webhookResponse: {
					status: 200,
					body: { received: true, processed: false },
				},
			};
		}

		// Build the return data with enhanced metadata
		const returnData: IDataObject = {
			...body,
			_metadata: {
				eventType,
				eventCategory,
				mappedEvent,
				objectType,
				receivedAt: new Date().toISOString(),
			},
		};

		return {
			workflowData: [this.helpers.returnJsonArray([returnData])],
		};
	}
}
