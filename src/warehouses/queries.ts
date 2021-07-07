import { pageInfoFragment } from "@saleor/fragments/pageInfo";
import {
  warehouseDetailsFragment,
  warehouseWithShippingFragment
} from "@saleor/fragments/warehouses";
import makeQuery from "@saleor/hooks/makeQuery";
import gql from "graphql-tag";

import {
  WarehouseDetails,
  WarehouseDetailsVariables
} from "./types/WarehouseDetails";
import { WarehouseList, WarehouseListVariables } from "./types/WarehouseList";
import {
  WMSDocPositions,
  WMSDocPositionsVariables
} from "./types/WMSDocPositions";
import { WMSDocument, WMSDocumentVariables } from "./types/WMSDocument";
import {
  WMSDocumentList,
  WMSDocumentListVariables
} from "./types/WMSDoucumentsList";

const warehouseList = gql`
  ${warehouseWithShippingFragment}
  ${pageInfoFragment}
  query WarehouseList(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $filter: WarehouseFilterInput
    $sort: WarehouseSortingInput
  ) {
    warehouses(
      before: $before
      after: $after
      first: $first
      last: $last
      filter: $filter
      sortBy: $sort
    ) {
      edges {
        node {
          ...WarehouseWithShippingFragment
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
`;
export const useWarehouseList = makeQuery<
  WarehouseList,
  WarehouseListVariables
>(warehouseList);

const warehouseDetails = gql`
  ${warehouseDetailsFragment}
  query WarehouseDetails($id: ID!) {
    warehouse(id: $id) {
      ...WarehouseDetailsFragment
    }
  }
`;
export const useWarehouseDetails = makeQuery<
  WarehouseDetails,
  WarehouseDetailsVariables
>(warehouseDetails);

const WMSDocumentsList = gql`
  query wmsDocuments(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $filter: WmsDocumentFilterInput
  ) {
    wmsDocuments(
      before: $before
      after: $after
      first: $first
      last: $last
      filter: $filter
    ) {
      edges {
        node {
          number
          createdAt
          deliverer
          warehouse {
            id
            name
            slug
          }
          recipient {
            id
            email
          }
          documentType
          createdBy {
            email
            firstName
            id
          }
          status
          id
        }
        cursor
      }
      totalCount
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const useWMSDocumentsList = makeQuery<
  WMSDocumentList,
  WMSDocumentListVariables
>(WMSDocumentsList);

const wmsDocumentQuery = gql`
  query wmsDocument($id: ID, $number: String) {
    wmsDocument(id: $id, number: $number) {
      id
      createdAt
      updatedAt
      warehouse {
        id
        name
      }
      warehouseSecond {
        id
        name
      }
      documentType
      createdBy {
        id
        email
      }
      recipient {
        id
      }
      deliverer
      number
      status
    }
  }
`;

export const useWMSDocumentQuery = makeQuery<WMSDocument, WMSDocumentVariables>(
  wmsDocumentQuery
);

const wmsDocPositions = gql`
  query wmsDocPosition($id: String) {
    wmsDocPositions(first: 100, filter: { document: { document: $id } }) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        __typename
      }
      edges {
        node {
          id
          quantity
          weight
          productVariant {
            id
            name
            sku
            product {
              name
            }
          }
        }
      }
    }
  }
`;
export const useWMSDocPositions = makeQuery<
  WMSDocPositions,
  WMSDocPositionsVariables
>(wmsDocPositions);
