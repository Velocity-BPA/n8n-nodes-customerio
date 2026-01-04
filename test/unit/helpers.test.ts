/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	prepareAttributes,
	formatTimestamp,
	parseTimestamp,
	prepareFilters,
	cleanObject,
	isValidEmail,
	generateAnonymousId,
	prepareEventData,
} from '../../nodes/CustomerIo/utils/helpers';

describe('Customer.io Helpers', () => {
	describe('prepareAttributes', () => {
		it('should convert attribute collection to object', () => {
			const input = {
				attribute: [
					{ name: 'firstName', value: 'John' },
					{ name: 'lastName', value: 'Doe' },
				],
			};
			const result = prepareAttributes(input);
			expect(result).toEqual({ firstName: 'John', lastName: 'Doe' });
		});

		it('should return empty object for empty input', () => {
			const result = prepareAttributes({});
			expect(result).toEqual({});
		});

		it('should skip items without name', () => {
			const input = {
				attribute: [
					{ name: 'firstName', value: 'John' },
					{ name: '', value: 'Skip' },
					{ value: 'NoName' },
				],
			};
			const result = prepareAttributes(input);
			expect(result).toEqual({ firstName: 'John' });
		});
	});

	describe('formatTimestamp', () => {
		it('should convert ISO string to Unix timestamp', () => {
			const isoDate = '2024-01-15T12:00:00.000Z';
			const result = formatTimestamp(isoDate);
			expect(result).toBe(Math.floor(new Date(isoDate).getTime() / 1000));
		});

		it('should handle Date object', () => {
			const date = new Date('2024-01-15T12:00:00.000Z');
			const result = formatTimestamp(date);
			expect(result).toBe(Math.floor(date.getTime() / 1000));
		});

		it('should return undefined for empty input', () => {
			const result = formatTimestamp('');
			expect(result).toBeUndefined();
		});

		it('should return number as-is', () => {
			const result = formatTimestamp(1705320000);
			expect(result).toBe(1705320000);
		});
	});

	describe('parseTimestamp', () => {
		it('should convert Unix timestamp to ISO string', () => {
			const timestamp = 1705320000;
			const result = parseTimestamp(timestamp);
			expect(result).toBe(new Date(timestamp * 1000).toISOString());
		});

		it('should handle string timestamp', () => {
			const result = parseTimestamp('1705320000');
			expect(result).toBe(new Date(1705320000 * 1000).toISOString());
		});

		it('should return undefined for invalid input', () => {
			const result = parseTimestamp('invalid');
			expect(result).toBeUndefined();
		});
	});

	describe('prepareFilters', () => {
		it('should remove empty and undefined values', () => {
			const input = {
				name: 'test',
				empty: '',
				nullVal: null,
				undefinedVal: undefined,
				valid: 123,
			};
			const result = prepareFilters(input);
			expect(result).toEqual({ name: 'test', valid: 123 });
		});

		it('should keep false and zero values', () => {
			const input = {
				active: false,
				count: 0,
				empty: '',
			};
			const result = prepareFilters(input);
			expect(result).toEqual({ active: false, count: 0 });
		});
	});

	describe('cleanObject', () => {
		it('should remove empty strings and undefined', () => {
			const input = {
				name: 'test',
				empty: '',
				undefinedVal: undefined,
				valid: 123,
			};
			const result = cleanObject(input);
			expect(result).toEqual({ name: 'test', valid: 123 });
		});

		it('should keep false and zero but remove null', () => {
			const input = {
				nullVal: null,
				falseVal: false,
				zeroVal: 0,
				empty: '',
			};
			const result = cleanObject(input);
			expect(result).toEqual({ falseVal: false, zeroVal: 0 });
		});
	});

	describe('isValidEmail', () => {
		it('should validate correct email addresses', () => {
			expect(isValidEmail('test@example.com')).toBe(true);
			expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
		});

		it('should reject invalid email addresses', () => {
			expect(isValidEmail('invalid')).toBe(false);
			expect(isValidEmail('test@')).toBe(false);
			expect(isValidEmail('@domain.com')).toBe(false);
			expect(isValidEmail('')).toBe(false);
		});
	});

	describe('generateAnonymousId', () => {
		it('should generate unique IDs', () => {
			const id1 = generateAnonymousId();
			const id2 = generateAnonymousId();
			expect(id1).not.toBe(id2);
		});

		it('should generate IDs with anon_ prefix', () => {
			const id = generateAnonymousId();
			expect(id).toMatch(/^anon_\d+_[a-z0-9]+$/);
		});
	});

	describe('prepareEventData', () => {
		it('should prepare event data with name and data', () => {
			const result = prepareEventData('purchase', { amount: 100 });
			expect(result).toEqual({
				name: 'purchase',
				data: { amount: 100 },
			});
		});

		it('should handle empty data', () => {
			const result = prepareEventData('pageview', {});
			expect(result).toEqual({
				name: 'pageview',
				data: {},
			});
		});
	});
});
