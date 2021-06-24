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
  documentType = "documentType",
  status = "status",
  query = "query"
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
  name = "name"
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
export type WarehouseUrlDialog = "delete";
export type WarehouseUrlQueryParams = Dialog<WarehouseUrlDialog> & SingleAction;
export const warehouseUrl = (id: string, params?: WarehouseUrlQueryParams) =>
  warehousePath(encodeURIComponent(id)) + "?" + stringifyQs(params);

export const warehouseAddPath = urlJoin(warehouseSection, "add");
export const warehouseAddUrl = warehouseAddPath;
