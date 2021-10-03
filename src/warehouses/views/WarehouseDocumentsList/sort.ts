import {
  WMSDocumentOrder,
  WMSDocumentsOrderField
} from "@saleor/types/globalTypes";
import { getOrderDirection } from "@saleor/utils/sort";
import {
  WMSDocumentsListUrlQueryParams,
  WMSDocumentsListUrlSortField
} from "@saleor/warehouses/urls";

export function getSortQueryField(
  sort: WMSDocumentsListUrlSortField
): WMSDocumentsOrderField {
  switch (sort) {
    case WMSDocumentsListUrlSortField.name:
      return WMSDocumentsOrderField.NAME;
    case WMSDocumentsListUrlSortField.warehouse:
      return WMSDocumentsOrderField.WAREHOUSE;
    case WMSDocumentsListUrlSortField.documentType:
      return WMSDocumentsOrderField.DOCUMENT_TYPE;
    case WMSDocumentsListUrlSortField.status:
      return WMSDocumentsOrderField.STATUS;
    case WMSDocumentsListUrlSortField.createdAt:
      return WMSDocumentsOrderField.CREATED_AT;
    default:
      return undefined;
  }
}

export function getSortQueryVariables(
  params: WMSDocumentsListUrlQueryParams
): WMSDocumentOrder {
  return {
    direction: getOrderDirection(params.asc)
    // field: getSortQueryField(params.sort)
  };
}
