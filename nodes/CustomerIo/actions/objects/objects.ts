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
import { prepareObjectAttributes, cleanObject } from '../../utils/helpers';

export const objectsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['objects'],
			},
		},
		options: [
			{
				name: 'Add Relationship',
				value: 'addRelationship',
				description: 'Add a relationship between a person and an object',
				action: 'Add relationship',
			},
			{
				name: 'Delete',
				value: 'deleteObject',
				description: 'Delete an object',
				action: 'Delete an object',
			},
			{
				name: 'Identify',
				value: 'identifyObject',
				description: 'Create or update an object',
				action: 'Identify an object',
			},
			{
				name: 'Remove Relationship',
				value: 'removeRelationship',
				description: 'Remove a relationship between a person and an object',
				action: 'Remove relationship',
			},
		],
		default: 'identifyObject',
	},
];

export const objectsFields: INodeProperties[] = [
	// ----------------------------------
	//         identifyObject / deleteObject
	// ----------------------------------
	{
		displayName: 'Object Type',
		name: 'objectType',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'company',
		description: 'The type of object (e.g., company, account, course)',
		displayOptions: {
			show: {
				resource: ['objects'],
				operation: ['identifyObject', 'deleteObject', 'addRelationship', 'removeRelationship'],
			},
		},
	},
	{
		displayName: 'Object ID',
		name: 'objectId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier for the object',
		displayOptions: {
			show: {
				resource: ['objects'],
				operation: ['identifyObject', 'deleteObject', 'addRelationship', 'removeRelationship'],
			},
		},
	},

	// ----------------------------------
	//         identifyObject
	// ----------------------------------
	{
		displayName: 'Object Attributes',
		name: 'objectAttributesUi',
		type: 'fixedCollection',
		placeholder: 'Add Attribute',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['objects'],
				operation: ['identifyObject'],
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
	//         addRelationship / removeRelationship
	// ----------------------------------
	{
		displayName: 'Person Identifier',
		name: 'personIdentifier',
		type: 'string',
		required: true,
		default: '',
		description: 'The identifier of the person to relate to the object',
		displayOptions: {
			show: {
				resource: ['objects'],
				operation: ['addRelationship', 'removeRelationship'],
			},
		},
	},
	{
		displayName: 'Identifier Type',
		name: 'identifierType',
		type: 'options',
		options: [
			{ name: 'ID', value: 'id' },
			{ name: 'Email', value: 'email' },
			{ name: 'CIO ID', value: 'cio_id' },
		],
		default: 'id',
		description: 'The type of identifier used for the person',
		displayOptions: {
			show: {
				resource: ['objects'],
				operation: ['addRelationship', 'removeRelationship'],
			},
		},
	},
	{
		displayName: 'Relationship Attributes',
		name: 'relationshipAttributesUi',
		type: 'fixedCollection',
		placeholder: 'Add Attribute',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['objects'],
				operation: ['addRelationship'],
			},
		},
		description: 'Attributes specific to this relationship',
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
						description: 'The attribute value',
					},
				],
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject;

	if (operation === 'identifyObject') {
		const objectType = this.getNodeParameter('objectType', index) as string;
		const objectId = this.getNodeParameter('objectId', index) as string;
		const objectAttributesUi = this.getNodeParameter('objectAttributesUi', index, {}) as IDataObject;

		const body: IDataObject = {};

		// Add object attributes
		const attributes = prepareObjectAttributes(objectAttributesUi);
		Object.assign(body, attributes);

		const endpoint = `/objects/${encodeURIComponent(objectType)}/${encodeURIComponent(objectId)}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'PUT',
			endpoint,
			cleanObject(body),
			{},
			'track',
		)) as IDataObject;

		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, objectType, objectId };
		}
	} else if (operation === 'deleteObject') {
		const objectType = this.getNodeParameter('objectType', index) as string;
		const objectId = this.getNodeParameter('objectId', index) as string;

		const endpoint = `/objects/${encodeURIComponent(objectType)}/${encodeURIComponent(objectId)}`;
		responseData = (await customerIoApiRequest.call(
			this,
			'DELETE',
			endpoint,
			{},
			{},
			'track',
		)) as IDataObject;

		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, deleted: `${objectType}/${objectId}` };
		}
	} else if (operation === 'addRelationship') {
		const objectType = this.getNodeParameter('objectType', index) as string;
		const objectId = this.getNodeParameter('objectId', index) as string;
		const personIdentifier = this.getNodeParameter('personIdentifier', index) as string;
		const identifierType = this.getNodeParameter('identifierType', index) as string;
		const relationshipAttributesUi = this.getNodeParameter('relationshipAttributesUi', index, {}) as IDataObject;

		const body: IDataObject = {
			identifiers: {
				[identifierType]: personIdentifier,
			},
			relationship: {
				identifiers: {
					object_type_id: objectType,
					object_id: objectId,
				},
			},
		};

		// Add relationship attributes
		const relationshipAttributes = prepareObjectAttributes(relationshipAttributesUi);
		if (Object.keys(relationshipAttributes).length > 0) {
			(body.relationship as IDataObject).relationship_attributes = relationshipAttributes;
		}

		const endpoint = `/customers/${encodeURIComponent(personIdentifier)}/relationships`;
		responseData = (await customerIoApiRequest.call(
			this,
			'POST',
			endpoint,
			cleanObject(body),
			{},
			'track',
		)) as IDataObject;

		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, personIdentifier, objectType, objectId };
		}
	} else if (operation === 'removeRelationship') {
		const objectType = this.getNodeParameter('objectType', index) as string;
		const objectId = this.getNodeParameter('objectId', index) as string;
		const personIdentifier = this.getNodeParameter('personIdentifier', index) as string;
		const identifierType = this.getNodeParameter('identifierType', index) as string;

		const body: IDataObject = {
			identifiers: {
				[identifierType]: personIdentifier,
			},
			relationship: {
				identifiers: {
					object_type_id: objectType,
					object_id: objectId,
				},
			},
		};

		const endpoint = `/customers/${encodeURIComponent(personIdentifier)}/relationships`;
		responseData = (await customerIoApiRequest.call(
			this,
			'DELETE',
			endpoint,
			cleanObject(body),
			{},
			'track',
		)) as IDataObject;

		if (!responseData || Object.keys(responseData).length === 0) {
			responseData = { success: true, removed: true, personIdentifier, objectType, objectId };
		}
	} else {
		throw new Error(`Operation "${operation}" is not supported for Objects resource`);
	}

	return [{ json: responseData, pairedItem: { item: index } }];
}
