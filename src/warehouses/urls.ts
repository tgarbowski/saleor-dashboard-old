import { stringify as stringifyQs } from "qs";
import urlJoin from "url-join";

import {
  ActiveTab,
  Dialog,
  Filters,
  Pagination,
  SingleAction,
  Sort,
  TabActionDialog
} from "../types";

export const warehouseSection = "/warehouses/";

export const warehouseListPath = warehouseSection;

export const wmsDocumentsListPath = warehouseListPath + "documents/";

export enum WarehouseListUrlFiltersEnum {
  query = "query"
}

export enum WMSDocumentsListUrlFiltersEnum {
  createdAtFrom = "createdAtFrom",
  createdAtTo = "createdAtTo",
  documentType = "documentType",
  location = "location",
  status = "status",
  query = "query",
  warehouse = "warehouse",
  wmsDeliverer = "wmsDeliverer"
}

export enum WMSDocumentsListUrlSortEnum {
  documentType = "documentType",
  status = "status",
  number = "number"
}

export type WMSDocumentsListUrlFilters = Filters<
  WMSDocumentsListUrlFiltersEnum
>;
export type WarehouseListUrlFilters = Filters<WarehouseListUrlFiltersEnum>;
export type WarehouseListUrlDialog = "delete" | TabActionDialog;
export enum WarehouseListUrlSortField {
  name = "name"
}
export enum WMSDocumentsListUrlSortField {
  createdAt = "createdAt",
  documentType = "documentType",
  name = "name",
  status = "status",
  warehouse = "warehouse"
}
export type WarehouseListUrlSort = Sort<WarehouseListUrlSortField>;

export type WMSDocumentsListUrlSort = Sort<WMSDocumentsListUrlSortField>;

export interface WarehouseListUrlQueryParams
  extends SingleAction,
    Dialog<WarehouseListUrlDialog>,
    Pagination,
    WarehouseListUrlFilters,
    WarehouseListUrlSort,
    ActiveTab {
  attributeId?: string;
}

export type WMSDocumentsListUrlQueryParams = ActiveTab &
  Dialog<WarehouseListUrlDialog> &
  Pagination &
  WMSDocumentsListUrlFilters &
  WMSDocumentsListUrlSort &
  SingleAction;
export const warehouseListUrl = (params?: WarehouseListUrlQueryParams) =>
  warehouseListPath + "?" + stringifyQs(params);

export const wmsDocumentsListUrl = (params?: WMSDocumentsListUrlQueryParams) =>
  wmsDocumentsListPath + "?" + stringifyQs(params);

export const warehousePath = (id: string) => urlJoin(warehouseSection, id);
export const wmsDocumentPath = (id: string) =>
  urlJoin(wmsDocumentsListPath, id);
export type WarehouseUrlDialog = "delete";
export type WarehouseUrlQueryParams = Dialog<WarehouseUrlDialog> & SingleAction;
export const warehouseUrl = (id: string, params?: WarehouseUrlQueryParams) =>
  warehousePath(encodeURIComponent(id)) + "?" + stringifyQs(params);

export type WMSDocumentUrlDialog = "delete";
export type WMSDocumentUrlQueryparams = Dialog<WMSDocumentUrlDialog> &
  SingleAction;
export const wmsDocumentUrl = (
  id: string,
  params?: WMSDocumentUrlQueryparams
) => wmsDocumentPath(encodeURIComponent(id)) + "?" + stringifyQs(params);

export const warehouseAddPath = urlJoin(warehouseSection, "add");
export const warehouseAddUrl = warehouseAddPath;
