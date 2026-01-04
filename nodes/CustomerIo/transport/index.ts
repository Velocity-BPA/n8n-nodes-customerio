/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHookFunctions,
	IWebhookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import * as crypto from 'crypto';

import {
	TRACK_API_ENDPOINTS,
	APP_API_ENDPOINTS,
	PIPELINES_API_ENDPOINT,
	BETA_API_ENDPOINTS,
} from '../constants/constants';

export type ApiType = 'track' | 'app' | 'pipelines' | 'beta';

export interface CustomerIoCredentials {
	region: 'us' | 'eu';
	siteId: string;
	trackApiKey: string;
	appApiKey: string;
}

function getBaseUrl(apiType: ApiType, region: 'us' | 'eu'): string {
	switch (apiType) {
		case 'track':
			return TRACK_API_ENDPOINTS[region];
		case 'app':
			return APP_API_ENDPOINTS[region];
		case 'pipelines':
			return PIPELINES_API_ENDPOINT;
		case 'beta':
			return BETA_API_ENDPOINTS[region];
		default:
			return TRACK_API_ENDPOINTS[region];
	}
}

function getAuthHeader(
	apiType: ApiType,
	credentials: CustomerIoCredentials,
): string {
	if (apiType === 'app' || apiType === 'beta') {
		return `Bearer ${credentials.appApiKey}`;
	}
	// Track API and Pipelines API use Basic Auth
	const basicAuth = Buffer.from(
		`${credentials.siteId}:${credentials.trackApiKey}`,
	).toString('base64');
	return `Basic ${basicAuth}`;
}

export async function customerIoApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	apiType: ApiType = 'track',
): Promise<IDataObject | IDataObject[]> {
	const credentials = (await this.getCredentials('customerIoApi')) as unknown as CustomerIoCredentials;
	const region = credentials.region || 'us';

	const options: IHttpRequestOptions = {
		method,
		url: `${getBaseUrl(apiType, region)}${endpoint}`,
		headers: {
			Authorization: getAuthHeader(apiType, credentials),
			'Content-Type': 'application/json',
		},
		qs: query,
		json: true,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	try {
		const response = await this.helpers.httpRequest(options);
		return response as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `Customer.io API error: ${(error as Error).message}`,
		});
	}
}

export async function customerIoApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	apiType: ApiType = 'app',
	propertyName: string = 'results',
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let responseData: IDataObject;

	query.limit = query.limit || 100;
	query.start = query.start || '';

	do {
		responseData = (await customerIoApiRequest.call(
			this,
			method,
			endpoint,
			body,
			query,
			apiType,
		)) as IDataObject;

		const items = responseData[propertyName] as IDataObject[];
		if (items) {
			returnData.push(...items);
		}

		// Handle Customer.io pagination
		if (responseData.next) {
			query.start = responseData.next as string;
		} else {
			break;
		}
	} while (responseData.next);

	return returnData;
}

export function validateWebhookSignature(
	body: string,
	signature: string,
	timestamp: string,
	webhookSigningKey: string,
): boolean {
	// Customer.io uses v0 signature format: v0:timestamp:body
	const signaturePayload = `v0:${timestamp}:${body}`;
	const expectedSignature = `v0=${crypto
		.createHmac('sha256', webhookSigningKey)
		.update(signaturePayload)
		.digest('hex')}`;
	
	return signature === expectedSignature;
}
