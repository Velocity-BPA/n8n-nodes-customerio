/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Convert object attributes from UI format
 */
export function prepareObjectAttributes(
	attributesUi: IDataObject,
): IDataObject {
	const attributes: IDataObject = {};

	if (attributesUi && (attributesUi as IDataObject).attributeValues) {
		const attributeValues = (attributesUi as IDataObject).attributeValues as IDataObject[];
		for (const attribute of attributeValues) {
			const key = attribute.key as string;
			let value = attribute.value;

			// Try to parse JSON values
			if (typeof value === 'string') {
				try {
					value = JSON.parse(value);
				} catch {
					// Keep as string if not valid JSON
				}
			}

			attributes[key] = value;
		}
	}

	return attributes;
}

/**
 * Standalone version of prepareAttributes for use without execution context
 * Converts { attribute: [{ name, value }] } format to { name: value } format
 */
export function prepareAttributes(attributesCollection: IDataObject): IDataObject {
	const attributes: IDataObject = {};

	const attributeItems = (attributesCollection.attribute as IDataObject[]) || 
		(attributesCollection.attributeValues as IDataObject[]) || [];
	
	for (const item of attributeItems) {
		const key = (item.name as string) || (item.key as string);
		if (key) {
			let value = item.value;
			// Try to parse JSON values
			if (typeof value === 'string') {
				try {
					value = JSON.parse(value);
				} catch {
					// Keep as string if not valid JSON
				}
			}
			attributes[key] = value;
		}
	}

	return attributes;
}

/**
 * Format timestamp for Customer.io API
 */
export function formatTimestamp(date: string | number | Date | undefined): number | undefined {
	if (!date || date === '') {
		return undefined;
	}

	if (typeof date === 'number') {
		// If already a Unix timestamp (seconds)
		if (date > 10000000000) {
			return Math.floor(date / 1000);
		}
		return date;
	}

	const dateObj = new Date(date);
	return Math.floor(dateObj.getTime() / 1000);
}

/**
 * Parse Customer.io timestamp to ISO string
 */
export function parseTimestamp(timestamp: number | string | undefined): string | undefined {
	if (!timestamp) {
		return undefined;
	}

	const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
	if (isNaN(ts)) {
		return undefined;
	}

	// Customer.io uses Unix timestamps in seconds
	return new Date(ts * 1000).toISOString();
}

/**
 * Prepare filter parameters for API requests
 */
export function prepareFilters(filters: IDataObject): IDataObject {
	const result: IDataObject = {};

	for (const [key, value] of Object.entries(filters)) {
		if (value !== undefined && value !== null && value !== '') {
			result[key] = value;
		}
	}

	return result;
}

/**
 * Build return data from API response
 */
export function buildReturnData(
	response: IDataObject | IDataObject[],
	itemIndex: number,
): INodeExecutionData[] {
	if (Array.isArray(response)) {
		return response.map((item) => ({
			json: item,
			pairedItem: { item: itemIndex },
		}));
	}

	return [
		{
			json: response,
			pairedItem: { item: itemIndex },
		},
	];
}

/**
 * Deep merge objects
 */
export function deepMerge(
	target: IDataObject,
	source: IDataObject,
): IDataObject {
	const output = { ...target };

	for (const key of Object.keys(source)) {
		if (source[key] instanceof Object && key in target) {
			output[key] = deepMerge(
				target[key] as IDataObject,
				source[key] as IDataObject,
			);
		} else {
			output[key] = source[key];
		}
	}

	return output;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Generate anonymous ID if not provided
 */
export function generateAnonymousId(): string {
	return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Prepare event data for tracking
 */
export function prepareEventData(
	eventName: string,
	eventData: IDataObject = {},
	timestamp?: number,
): IDataObject {
	const data: IDataObject = {
		name: eventName,
		data: eventData,
	};

	if (timestamp) {
		data.timestamp = timestamp;
	}

	return data;
}

/**
 * Clean empty values from object
 */
export function cleanObject(obj: IDataObject): IDataObject {
	const cleaned: IDataObject = {};

	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined && value !== null && value !== '') {
			if (typeof value === 'object' && !Array.isArray(value)) {
				const cleanedNested = cleanObject(value as IDataObject);
				if (Object.keys(cleanedNested).length > 0) {
					cleaned[key] = cleanedNested;
				}
			} else {
				cleaned[key] = value;
			}
		}
	}

	return cleaned;
}
