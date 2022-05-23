import { gql } from "@apollo/client";

export const warehouseListPdfQuery = gql`
  query OrderList($filters: OrderFilterInput, $orderIds: [ID!]) {
    warehouseListPdf(filters: $filters, orderIds: $orderIds)
  }
`;
