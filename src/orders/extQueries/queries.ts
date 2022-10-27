import { gql } from "@apollo/client";

export const warehouseListsGenerateQuery = gql`
  query WarehouseListsGenerate($filters: OrderFilterInput, $orderIds: [ID!]) {
    warehouseListsGenerate(filters: $filters, orderIds: $orderIds) {
      warehouseList
      wmsList
    }
  }
`;
