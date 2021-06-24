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
import {
  ProductListUrlFiltersAsDictWithMultipleValues,
  ProductListUrlFiltersEnum,
  ProductListUrlFiltersWithMultipleValues
} from "../../../products/urls";
import { WMSDocumentsFilterInput } from "../../../types/globalTypes";
import {
  createFilterTabUtils,
  createFilterUtils,
  getMultipleValueQueryParam
} from "../../../utils/filters";

export const WMSDOCUMENTS_FILTERS_KEY = "wmsDocumentsFilters";

export function getFilterOpts(
  params: WMSDocumentsListUrlFilters
): WMSDocumentsListFilterOpts {
  return {
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
    documentType: params.documentType !== undefined ? params.documentType : null
  };
}

export function getFilterQueryParam(
  filter: IFilterElement<WMSDocumentsFilterKeys>,
  params: WMSDocumentsListUrlFilters
): WMSDocumentsListUrlFilters {
  const { group, name } = filter;

  if (!!group) {
    const rest = params && params[group] ? params[group] : undefined;

    return {
      [group]: active
        ? {
            ...((rest === undefined ? {} : rest) as {}),
            [name]: value
          }
        : rest
    };
  }

  switch (name) {
    case WMSDocumentsFilterKeys.documentType:
      return getMultipleValueQueryParam(
        filter,
        WMSDocumentsListUrlFiltersEnum.documentType
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
