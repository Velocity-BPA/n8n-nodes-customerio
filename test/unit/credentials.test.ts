/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { CustomerIoApi } from '../../credentials/CustomerIoApi.credentials';

describe('CustomerIoApi Credentials', () => {
	let credentials: CustomerIoApi;

	beforeEach(() => {
		credentials = new CustomerIoApi();
	});

	it('should have correct name', () => {
		expect(credentials.name).toBe('customerIoApi');
	});

	it('should have correct display name', () => {
		expect(credentials.displayName).toBe('Customer.io API');
	});

	it('should have required properties', () => {
		const properties = credentials.properties;
		const propertyNames = properties.map(p => p.name);

		expect(propertyNames).toContain('region');
		expect(propertyNames).toContain('siteId');
		expect(propertyNames).toContain('trackApiKey');
		expect(propertyNames).toContain('appApiKey');
	});

	it('should have region with US and EU options', () => {
		const regionProp = credentials.properties.find(p => p.name === 'region');
		expect(regionProp).toBeDefined();
		expect(regionProp?.type).toBe('options');
		
		const options = (regionProp as any)?.options;
		expect(options).toContainEqual(expect.objectContaining({ value: 'us' }));
		expect(options).toContainEqual(expect.objectContaining({ value: 'eu' }));
	});

	it('should have test configuration', () => {
		expect(credentials.test).toBeDefined();
		expect(credentials.test?.request).toBeDefined();
	});
});
