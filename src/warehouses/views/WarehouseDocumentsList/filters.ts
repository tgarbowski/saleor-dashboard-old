import { UseSearchResult } from "@saleor/hooks/makeSearch";
import { findValueInEnum, maybe } from "@saleor/misc";
import {
  ProductFilterKeys,
  ProductListFilterOpts,
  ProductStatus
} from "@saleor/products/components/ProductListPage";
import { DocumentType, WMSDocumentsFilterKeys, WMSDocumentsListFilterOpts } from "@saleor/warehouses/components/WarehouseDocumentsListPage";
import { WMSDocumentsListUrlFilters } from "@saleor/warehouses/urls";
import isArray from "lodash-es/isArray";

import { IFilterElement } from "../../../components/Filter";
import {
  ProductListUrlFilters,
  ProductListUrlFiltersAsDictWithMultipleValues,
  ProductListUrlFiltersEnum,
  ProductListUrlFiltersWithMultipleValues,
  ProductListUrlQueryParams
} from "../../../products/urls";
import {
  ProductFilterInput,
  StockAvailability,
  WMSDocumentsFilterInput
} from "../../../types/globalTypes";
import {
  createFilterTabUtils,
  createFilterUtils,
  getGteLteVariables,
  getMinMaxQueryParam,
  getMultipleValueQueryParam,
  getSingleEnumValueQueryParam
} from "../../../utils/filters";

export const PRODUCT_FILTERS_KEY = "productFilters";

export function getFilterOpts(
  params: WMSDocumentsListUrlFilters,
): WMSDocumentsListFilterOpts {
  return {
    documentType: {
      active: maybe(() => params.documentType !== undefined, false),
      value: maybe(() => findValueInEnum(params.documentType, DocumentType))
    }
  };
}

export function getFilterVariables(
  params: WMSDocumentsListUrlFilters
): WMSDocumentsFilterInput {
  return {
    documentType:
      params.documentType !== undefined ? params.documentType : null,
  };
}

export function getFilterQueryParam(
  filter: IFilterElement<WMSDocumentsFilterKeys>,
  params: WMSDocumentsListUrlFilters
): WMSDocumentsListUrlFilters {
  const { active, group, name, value } = filter;

  if (!!group) {
    const rest = params && params[group] ? params[group] : undefined;

    return {
      [group]: active
        ? {
            ...(rest === undefined ? {} : rest),
            [name]: value
          }
        : rest
    };
  }

  switch (name) {
    case WMSDocumentsFilterKeys.documentType:
      return getMultipleValueQueryParam(
        filter,
        ProductListUrlFiltersWithMultipleValues.productTypes
      );
  }
}

export const {
  deleteFilterTab,
  getFilterTabs,
  saveFilterTab
} = createFilterTabUtils<ProductListUrlFilters>(PRODUCT_FILTERS_KEY);

export const { areFiltersApplied, getActiveFilters } = createFilterUtils<
  ProductListUrlQueryParams,
  ProductListUrlFilters
>({
  ...ProductListUrlFiltersEnum,
  ...ProductListUrlFiltersWithMultipleValues,
  ...ProductListUrlFiltersAsDictWithMultipleValues
});
