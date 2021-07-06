/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { WarehouseList_warehouses_edges_node } from "./WarehouseList";



export interface WMSDocument_document{
  __typename: "WMSDocument";
  id: string;
  number: string;
  createdAt: any | null;
  createdBy: any | null;
  documentType: string;
  status: string;
  warehouse: WarehouseList_warehouses_edges_node
}

export interface WMSDocument {
  wmsDocument: WMSDocument_document | null;
}

export interface WMSDocumentVariables {
  id?: string | null;
  number?: string | null;  
}
