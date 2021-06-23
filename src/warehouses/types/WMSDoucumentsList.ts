/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { WMSDocumentsFilterInput } from "./../../types/globalTypes";
import { WarehouseList_warehouses_edges_node } from "./WarehouseList";



export interface WMSDocumentList_documents_edges_node {
  __typename: "WMSDocument";
  id: string;
  number: string;
  createdAt: any | null;
  documentType: string;
  status: string;
  warehouse: WarehouseList_warehouses_edges_node
}

export interface WMSDocumentList_documents_edges {
  __typename: "WMSDocumentCountableEdge";
  node: WMSDocumentList_documents_edges_node;
}

export interface WMSDocumentList_documents_pageInfo {
  __typename: "PageInfo";
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface WMSDocumentList_documents {
  __typename: "WMSDocumentCountableConnection";
  edges: WMSDocumentList_documents_edges[];
  pageInfo: WMSDocumentList_documents_pageInfo;
  totalCount: number | null;
}

export interface WMSDocumentList {
  wmsDocuments: WMSDocumentList_documents | null;
}

export interface WMSDocumentListVariables {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
  filter?: WMSDocumentsFilterInput | null;
}
