/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CustomerIoApi implements ICredentialType {
	name = 'customerIoApi';
	displayName = 'Customer.io API';
	documentationUrl = 'https://customer.io/docs/api/';
	properties: INodeProperties[] = [
		{
			displayName: 'Region',
			name: 'region',
			type: 'options',
			options: [
				{
					name: 'US',
					value: 'us',
				},
				{
					name: 'EU',
					value: 'eu',
				},
			],
			default: 'us',
			description: 'The region where your Customer.io account is hosted',
		},
		{
			displayName: 'Site ID',
			name: 'siteId',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Customer.io Site ID (found in Settings > API Credentials)',
		},
		{
			displayName: 'Track API Key',
			name: 'trackApiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Customer.io Track API Key (found in Settings > API Credentials)',
		},
		{
			displayName: 'App API Key',
			name: 'appApiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Customer.io App API Key (found in Settings > API Credentials > App API)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.region === "eu" ? "https://track-eu.customer.io" : "https://track.customer.io"}}',
			url: '/auth',
			method: 'GET',
			headers: {
				Authorization:
					'=Basic {{Buffer.from($credentials.siteId + ":" + $credentials.trackApiKey).toString("base64")}}',
			},
		},
	};
}
