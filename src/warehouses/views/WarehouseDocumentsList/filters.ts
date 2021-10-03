import { UseSearchResult } from "@saleor/hooks/makeSearch";
import { findValueInEnum, maybe } from "@saleor/misc";
import {
  SearchWarehouses,
  SearchWarehousesVariables
} from "@saleor/searches/types/SearchWarehouses";
import {
  SearchWMSDeliverers,
  SearchWMSDeliverersVariables
} from "@saleor/searches/types/SearchWMSDeliverers";
import {
  DocumentStatus,
  DocumentType,
  WMSDocumentsFilterKeys,
  WMSDocumentsListFilterOpts
} from "@saleor/warehouses/components/WarehouseDocumentsListPage";
import {
  InitialWMSDocumentFilterData_warehouse_edges_node,
  InitialWMSDocumentFilterData_wmsDeliverers_edges_node
} from "@saleor/warehouses/types/InitialWMSDocumentsFilterData";
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
  dedupeFilter,
  getGteLteVariables,
  getMinMaxQueryParam,
  getMultipleValueQueryParam,
  getSingleValueQueryParam
} from "../../../utils/filters";

export const WMSDOCUMENTS_FILTERS_KEY = "wmsDocumentsFilters";

export function getFilterOpts(
  params: WMSDocumentsListUrlFilters,
  warehouse: {
    initial: InitialWMSDocumentFilterData_warehouse_edges_node[];
    search: UseSearchResult<SearchWarehouses, SearchWarehousesVariables>;
  },
  wmsDeliverer: {
    initial: InitialWMSDocumentFilterData_wmsDeliverers_edges_node[];
    search: UseSearchResult<SearchWMSDeliverers, SearchWMSDeliverersVariables>;
  }
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
    location: {
      active: !!maybe(() => params.location),
      value: params.location
    },
    status: {
      active: maybe(() => params.status !== undefined, false),
      value: maybe(() => findValueInEnum(params.status, DocumentStatus))
    },
    warehouse: {
      active: !!params.warehouse,
      choices: maybe(
        () =>
          warehouse.search.result.data.search.edges.map(edge => ({
            label: edge.node.name,
            value: edge.node.id
          })),
        []
      ),
      displayValues: !!params.warehouse
        ? maybe(
            () =>
              warehouse.initial.map(category => ({
                label: category.name,
                value: category.id
              })),
            []
          )
        : [],
      hasMore: maybe(
        () => warehouse.search.result.data.search.pageInfo.hasNextPage,
        false
      ),
      initialSearch: "",
      loading: warehouse.search.result.loading,
      onFetchMore: warehouse.search.loadMore,
      onSearchChange: warehouse.search.search,
      value: maybe(() => dedupeFilter([params.warehouse]))
    },
    wmsDeliverer: {
      active: !!params.wmsDeliverer,
      choices: maybe(
        () =>
          wmsDeliverer.search.result.data.search.edges.map(edge => ({
            label: edge.node.companyName,
            value: edge.node.id
          })),
        []
      ),
      displayValues: !!params.wmsDeliverer
        ? maybe(
            () =>
              wmsDeliverer.initial.map(category => ({
                label: category.companyName,
                value: category.id
              })),
            []
          )
        : [],
      hasMore: maybe(
        () => wmsDeliverer.search.result.data.search.pageInfo.hasNextPage,
        false
      ),
      initialSearch: "",
      loading: wmsDeliverer.search.result.loading,
      onFetchMore: wmsDeliverer.search.loadMore,
      onSearchChange: wmsDeliverer.search.search,
      value: maybe(() => dedupeFilter([params.wmsDeliverer]))
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
    deliverers: params.wmsDeliverer !== undefined ? params.wmsDeliverer : null,
    documentType:
      params.documentType !== undefined ? params.documentType : null,
    location: params.location,
    status: params.status !== undefined ? params.status : null,
    warehouses: params.warehouse !== undefined ? params.warehouse : null
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
    case WMSDocumentsFilterKeys.location:
      return getSingleValueQueryParam(
        filter,
        WMSDocumentsListUrlFiltersEnum.location
      );
    case WMSDocumentsFilterKeys.warehouse:
      return getMultipleValueQueryParam(
        filter,
        WMSDocumentsListUrlFiltersEnum.warehouse
      );
    case WMSDocumentsFilterKeys.wmsDeliverer:
      return getMultipleValueQueryParam(
        filter,
        WMSDocumentsListUrlFiltersEnum.wmsDeliverer
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
