/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: InitialWMSDocumentFilterData
// ====================================================
  
  export interface InitialWMSDocumentFilterData_warehouse_edges_node {
    id: string;
    name: string;
  }
  
  export interface InitialWMSDocumentFilterData_warehouse_edges {
    __typename: "CollectionCountableEdge";
    node: InitialWMSDocumentFilterData_warehouse_edges_node;
  }
  
  export interface InitialWMSDocumentFilterData_warehouse {
    __typename: "CollectionCountableConnection";
    edges: InitialWMSDocumentFilterData_warehouse_edges[];
  }
  
  export interface InitialWMSDocumentFilterData_wmsDeliverers_edges_node {
    __typename: "wmsDeliverers";
    id: string;
    companyName: string;
  }
  
  export interface InitialWMSDocumentFilterData_wmsDeliverers_edges {
    node: InitialWMSDocumentFilterData_wmsDeliverers_edges_node;
  }
  
  export interface InitialWMSDocumentFilterData_wmsDeliverers {
    edges: InitialWMSDocumentFilterData_wmsDeliverers_edges[];
  }
  
  export interface InitialWMSDocumentFilterData {
    warehouses: InitialWMSDocumentFilterData_warehouse | null;
    wmsDeliverers: InitialWMSDocumentFilterData_wmsDeliverers | null;

  }
  
  export interface InitialWMSDocumentFilterDataVariables {
    warehouses?: string[] | null;
  }
  