/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchWMSDeliverers
// ====================================================

export interface SearchWMSDeliverers_search_edges_node {
    __typename: "Warehouse";
    id: string;
    companyName: string;
  }
  
  export interface SearchWMSDeliverers_search_edges {
    __typename: "WarehouseCountableEdge";
    node: SearchWMSDeliverers_search_edges_node;
  }
  
  export interface SearchWMSDeliverers_search_pageInfo {
    __typename: "PageInfo";
    endCursor: string | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
  }
  
  export interface SearchWMSDeliverers_search {
    __typename: "WarehouseCountableConnection";
    edges: SearchWMSDeliverers_search_edges[];
    pageInfo: SearchWMSDeliverers_search_pageInfo;
  }
  
  export interface SearchWMSDeliverers {
    search: SearchWMSDeliverers_search | null;
  }
  
  export interface SearchWMSDeliverersVariables {
    after?: string | null;
    first: number;
    query: string;
  }