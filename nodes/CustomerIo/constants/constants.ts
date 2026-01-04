/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const TRACK_API_ENDPOINTS = {
	us: 'https://track.customer.io/api/v1',
	eu: 'https://track-eu.customer.io/api/v1',
};

export const APP_API_ENDPOINTS = {
	us: 'https://api.customer.io/v1',
	eu: 'https://api-eu.customer.io/v1',
};

export const PIPELINES_API_ENDPOINT = 'https://cdp.customer.io/v1';

export const BETA_API_ENDPOINTS = {
	us: 'https://beta-api.customer.io/v1/api',
	eu: 'https://beta-api-eu.customer.io/v1/api',
};

export const VELOCITY_BPA_LICENSE_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

export const WEBHOOK_EVENTS = [
	{ name: 'Email Sent', value: 'emailSent', description: 'Triggered when an email is sent' },
	{ name: 'Email Delivered', value: 'emailDelivered', description: 'Triggered when an email is delivered' },
	{ name: 'Email Opened', value: 'emailOpened', description: 'Triggered when an email is opened' },
	{ name: 'Email Clicked', value: 'emailClicked', description: 'Triggered when a link in an email is clicked' },
	{ name: 'Email Bounced', value: 'emailBounced', description: 'Triggered when an email bounces' },
	{ name: 'Email Unsubscribed', value: 'emailUnsubscribed', description: 'Triggered when someone unsubscribes' },
	{ name: 'Email Complained', value: 'emailComplained', description: 'Triggered when an email is marked as spam' },
	{ name: 'Email Converted', value: 'emailConverted', description: 'Triggered when an email conversion is tracked' },
	{ name: 'Push Sent', value: 'pushSent', description: 'Triggered when a push notification is sent' },
	{ name: 'Push Opened', value: 'pushOpened', description: 'Triggered when a push notification is opened' },
	{ name: 'Push Clicked', value: 'pushClicked', description: 'Triggered when a push notification is clicked' },
	{ name: 'SMS Sent', value: 'smsSent', description: 'Triggered when an SMS is sent' },
	{ name: 'SMS Delivered', value: 'smsDelivered', description: 'Triggered when an SMS is delivered' },
	{ name: 'SMS Clicked', value: 'smsClicked', description: 'Triggered when a link in an SMS is clicked' },
	{ name: 'SMS Failed', value: 'smsFailed', description: 'Triggered when an SMS fails to deliver' },
	{ name: 'Webhook Sent', value: 'webhookSent', description: 'Triggered when a webhook is sent' },
	{ name: 'Webhook Clicked', value: 'webhookClicked', description: 'Triggered when a webhook link is clicked' },
	{ name: 'Slack Sent', value: 'slackSent', description: 'Triggered when a Slack message is sent' },
	{ name: 'Slack Clicked', value: 'slackClicked', description: 'Triggered when a Slack message link is clicked' },
	{ name: 'In-App Sent', value: 'inAppSent', description: 'Triggered when an in-app message is sent' },
	{ name: 'In-App Opened', value: 'inAppOpened', description: 'Triggered when an in-app message is opened' },
	{ name: 'In-App Clicked', value: 'inAppClicked', description: 'Triggered when an in-app message is clicked' },
];

export const TRANSACTIONAL_MESSAGE_TYPES = ['email', 'push', 'sms'] as const;

export const EXPORT_TYPES = [
	'customers',
	'deliveries',
	'newsletter_deliveries',
] as const;

export const ACTIVITY_TYPES = [
	'page',
	'event',
	'attribute_change',
	'failed_attribute_change',
	'stripe_event',
	'drafted_email',
	'sent_email',
	'bounced_email',
	'opened_email',
	'converted_email',
	'clicked_email',
	'unsubscribed_email',
	'marked_email_as_spam',
	'subscribed_email',
	'sent_push',
	'opened_push',
	'converted_push',
	'clicked_push',
	'sent_sms',
	'delivered_sms',
	'clicked_sms',
	'undelivered_sms',
	'converted_sms',
	'sent_slack',
	'clicked_slack',
	'converted_slack',
	'sent_webhook',
	'clicked_webhook',
	'converted_webhook',
	'entered_segment',
	'exited_segment',
	'enrolled_campaign',
	'started_campaign_workflow',
	'paused_campaign_workflow',
	'finished_campaign_workflow',
	'exited_campaign_workflow',
] as const;
