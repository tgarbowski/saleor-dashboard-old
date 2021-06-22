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
import { WMSDocumentList, WMSDocumentListVariables } from "./types/WMSDoucumentsList";

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
query WMSDocumentsList(
  $first: Int
  $after: String
  $last: Int
  $before: String
  $filter: WMSDocumentFilterInput
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

`

export const useWMSDocumentsList = makeQuery<WMSDocumentList, WMSDocumentListVariables>(WMSDocumentsList);
