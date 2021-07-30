/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ProductVariant } from "@saleor/fragments/types/ProductVariant";


export interface WMSDocPositions_documents_edges_node {
  __typename: "WMSDocPosition";
  id: string;
  quantity: number | null;
  weight: number | null;
  productVariant: ProductVariant;
}

export interface WMSDocPositions_documents_edges {
  node: WMSDocPositions_documents_edges_node;
}

export interface WMSDocPositions_documents_pageInfo {
  __typename: "PageInfo";
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface WMSDocPositions_documents {
  edges: WMSDocPositions_documents_edges[];
  pageInfo: WMSDocPositions_documents_pageInfo;
  totalCount: number | null;
}

export interface WMSDocPositions {
  wmsDocPositions: WMSDocPositions_documents | null;
}

export interface WMSDocPositionsVariables {
  id?: string | null;
}
