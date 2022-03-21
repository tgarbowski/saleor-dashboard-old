/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AttributeInputTypeEnum, AttributeEntityTypeEnum, MeasurementUnitsEnum } from "./../../types/globalTypes";

// ====================================================
// GraphQL query operation: ProductType
// ====================================================

export interface ProductType_productType_productAttributes_choices_pageInfo {
  __typename: "PageInfo";
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
}

export interface ProductType_productType_productAttributes_choices_edges_node_file {
  __typename: "File";
  url: string;
  contentType: string | null;
}

export interface ProductType_productType_productAttributes_choices_edges_node {
  __typename: "AttributeValue";
  id: string;
  name: string | null;
  slug: string | null;
  file: ProductType_productType_productAttributes_choices_edges_node_file | null;
  reference: string | null;
  boolean: boolean | null;
  date: any | null;
  dateTime: any | null;
  value: string | null;
  richText: any | null;
}

export interface ProductType_productType_productAttributes_choices_edges {
  __typename: "AttributeValueCountableEdge";
  cursor: string;
  node: ProductType_productType_productAttributes_choices_edges_node;
}

export interface ProductType_productType_productAttributes_choices {
  __typename: "AttributeValueCountableConnection";
  pageInfo: ProductType_productType_productAttributes_choices_pageInfo;
  edges: ProductType_productType_productAttributes_choices_edges[];
}

export interface ProductType_productType_productAttributes {
  __typename: "Attribute";
  id: string;
  inputType: AttributeInputTypeEnum | null;
  entityType: AttributeEntityTypeEnum | null;
  slug: string | null;
  name: string | null;
  valueRequired: boolean;
  unit: MeasurementUnitsEnum | null;
  choices: ProductType_productType_productAttributes_choices | null;
}

export interface ProductType_productType_taxType {
  __typename: "TaxType";
  description: string | null;
  taxCode: string | null;
}

export interface ProductType_productType {
  __typename: "ProductType";
  id: string;
  name: string;
  hasVariants: boolean;
  productAttributes: (ProductType_productType_productAttributes | null)[] | null;
  taxType: ProductType_productType_taxType | null;
}

export interface ProductType {
  productType: ProductType_productType | null;
}

export interface ProductTypeVariables {
  id: string;
  firstValues?: number | null;
  afterValues?: string | null;
  lastValues?: number | null;
  beforeValues?: string | null;
}

export interface ProductTypeData_node {
  id: string;
  name: string;
  slug: string;
}

export interface ProductTypeData_edge {
  node: ProductTypeData_node;
}

export interface ProductTypeData_edges {
  edges: ProductTypeData_edge[];
}

export interface ProductTypeData {
  search: ProductTypeData_edges;
}


export interface ProductTypeDataVariables {
  first: number;
  query: string;
}