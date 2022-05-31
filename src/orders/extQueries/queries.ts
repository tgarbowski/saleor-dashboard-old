import { gql } from "@apollo/client";

export const warehouseListPdfQuery = gql`
  query WarehouseListPdf($filters: OrderFilterInput, $orderIds: [ID!]) {
    warehouseListPdf(filters: $filters, orderIds: $orderIds)
  }
`;

export const wmsDocumentsListPdfQuery = gql`
  query WmsDocumentsListPdf($filters: OrderFilterInput) {
    wmsDocumentsListPdf(filters: $filters)
  }
`;
