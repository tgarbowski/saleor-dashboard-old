import { findValueInEnum, maybe } from "@saleor/misc";
import {
  DocumentStatus,
  DocumentType,
  WMSDocumentsFilterKeys,
  WMSDocumentsListFilterOpts
} from "@saleor/warehouses/components/WarehouseDocumentsListPage";
import {
  WMSDocumentsListUrlFilters,
  WMSDocumentsListUrlFiltersEnum,
  WMSDocumentsListUrlQueryParams
} from "@saleor/warehouses/urls";

import { IFilterElement } from "../../../components/Filter";
import { WMSDocumentsFilterInput } from "../../../types/globalTypes";
import {
  createFilterTabUtils,
  createFilterUtils,
  getGteLteVariables,
  getMinMaxQueryParam,
  getMultipleValueQueryParam
} from "../../../utils/filters";

export const WMSDOCUMENTS_FILTERS_KEY = "wmsDocumentsFilters";

export function getFilterOpts(
  params: WMSDocumentsListUrlFilters
): WMSDocumentsListFilterOpts {
  return {
    createdAt: {
      active: maybe(
        () =>
          [params.createdAtFrom, params.createdAtTo].some(
            field => field !== undefined
          ),
        false
      ),
      value: {
        max: maybe(() => params.createdAtTo, ""),
        min: maybe(() => params.createdAtFrom, "")
      }
    },
    documentType: {
      active: maybe(() => params.documentType !== undefined, false),
      value: maybe(() => findValueInEnum(params.documentType, DocumentType))
    },
    status: {
      active: maybe(() => params.status !== undefined, false),
      value: maybe(() => findValueInEnum(params.status, DocumentStatus))
    }
  };
}

export function getFilterVariables(
  params: WMSDocumentsListUrlFilters
): WMSDocumentsFilterInput {
  return {
    createdAt: getGteLteVariables({
      gte: params.createdAtFrom,
      lte: params.createdAtTo
    }),
    documentType:
      params.documentType !== undefined ? params.documentType : null,
    status: params.status !== undefined ? params.status : null
  };
}

export function getFilterQueryParam(
  filter: IFilterElement<WMSDocumentsFilterKeys>
): WMSDocumentsListUrlFilters {
  const { name } = filter;

  switch (name) {
    case WMSDocumentsFilterKeys.createdAt:
      return getMinMaxQueryParam(
        filter,
        WMSDocumentsListUrlFiltersEnum.createdAtFrom,
        WMSDocumentsListUrlFiltersEnum.createdAtTo
      );
    case WMSDocumentsFilterKeys.documentType:
      return getMultipleValueQueryParam(
        filter,
        WMSDocumentsListUrlFiltersEnum.documentType
      );
    case WMSDocumentsFilterKeys.status:
      return getMultipleValueQueryParam(
        filter,
        WMSDocumentsListUrlFiltersEnum.status
      );
  }
}

export const {
  deleteFilterTab,
  getFilterTabs,
  saveFilterTab
} = createFilterTabUtils<WMSDocumentsListUrlFilters>(WMSDOCUMENTS_FILTERS_KEY);

export const { areFiltersApplied, getActiveFilters } = createFilterUtils<
  WMSDocumentsListUrlQueryParams,
  WMSDocumentsListUrlFilters
>({
  ...WMSDocumentsListUrlFiltersEnum
});
