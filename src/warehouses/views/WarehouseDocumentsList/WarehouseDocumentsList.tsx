import DeleteFilterTabDialog from "@saleor/components/DeleteFilterTabDialog";
import SaveFilterTabDialog, {
  SaveFilterTabDialogFormData
} from "@saleor/components/SaveFilterTabDialog";
import {
  DEFAULT_INITIAL_PAGINATION_DATA,
  DEFAULT_INITIAL_SEARCH_DATA,
  defaultListSettings,
  WMSDocumentsListColumns
} from "@saleor/config";
import useBulkActions from "@saleor/hooks/useBulkActions";
import useListSettings from "@saleor/hooks/useListSettings";
import useNavigator from "@saleor/hooks/useNavigator";
import usePaginator, {
  createPaginationState
} from "@saleor/hooks/usePaginator";
import useShop from "@saleor/hooks/useShop";
import { maybe } from "@saleor/misc";
import {
  getAttributeIdFromColumnValue,
  isAttributeColumnValue
} from "@saleor/products/components/ProductListPage/utils";
import useWarehouseSearch from "@saleor/searches/useWarehouseSearch";
import useWMSDeliverersSearch from "@saleor/searches/useWMSDeliverersSearch";
import { ListViews } from "@saleor/types";
import createDialogActionHandlers from "@saleor/utils/handlers/dialogActionHandlers";
import createFilterHandlers from "@saleor/utils/handlers/filterHandlers";
import { getSortUrlVariables } from "@saleor/utils/sort";
import WMSDocumentsListPage from "@saleor/warehouses/components/WarehouseDocumentsListPage";
import {
  useInitialFilterWMSDocuments,
  useWMSDocumentsList
} from "@saleor/warehouses/queries";
import { WMSDocumentListVariables } from "@saleor/warehouses/types/WMSDoucumentsList";
import React from "react";

import { useAvailableInGridAttributesQuery } from "../../../products/queries";
import {
  productAddUrl,
  ProductListUrlDialog,
  ProductListUrlQueryParams
} from "../../../products/urls";
import {
  wmsDocumentsListUrl,
  WMSDocumentsListUrlQueryParams,
  WMSDocumentsListUrlSortField,
  wmsDocumentUrl
} from "../../urls";
import {
  areFiltersApplied,
  deleteFilterTab,
  getActiveFilters,
  getFilterOpts,
  getFilterQueryParam,
  getFilterTabs,
  getFilterVariables,
  saveFilterTab
} from "./filters";

interface WMSDocumentsListProps {
  params: WMSDocumentsListUrlQueryParams;
}

export const WMSDocumentsList: React.FC<WMSDocumentsListProps> = ({
  params
}) => {
  const navigate = useNavigator();
  const paginate = usePaginator();
  const shop = useShop();
  const { isSelected, listElements, reset, toggle, toggleAll } = useBulkActions(
    []
  );
  const { updateListSettings, settings } = useListSettings<
    WMSDocumentsListColumns
  >(ListViews.WMS_DOCUMENTS_LIST);

  React.useEffect(
    () =>
      navigate(
        wmsDocumentsListUrl({
          ...params,
          ...DEFAULT_INITIAL_PAGINATION_DATA
        }),
        true
      ),
    [settings.rowNumber]
  );

  const tabs = getFilterTabs();

  const currentTab =
    params.activeTab === undefined
      ? areFiltersApplied(params)
        ? tabs.length + 1
        : 0
      : parseInt(params.activeTab, 0);

  const [openModal, closeModal] = createDialogActionHandlers<
    ProductListUrlDialog,
    ProductListUrlQueryParams
  >(navigate, wmsDocumentsListUrl, params);

  const [
    changeFilters,
    resetFilters,
    handleSearchChange
  ] = createFilterHandlers({
    cleanupFn: reset,
    createUrl: wmsDocumentsListUrl,
    getFilterQueryParam,
    navigate,
    params
  });

  const handleSort = (field: WMSDocumentsListUrlSortField) =>
    navigate(
      wmsDocumentsListUrl({
        ...params,
        ...getSortUrlVariables(field, params),
        ...DEFAULT_INITIAL_PAGINATION_DATA
      })
    );

  const handleTabChange = (tab: number) => {
    reset();
    navigate(
      wmsDocumentsListUrl({
        activeTab: tab.toString(),
        ...getFilterTabs()[tab - 1].data
      })
    );
  };

  const handleFilterTabDelete = () => {
    deleteFilterTab(currentTab);
    reset();
    navigate(wmsDocumentsListUrl());
  };

  const handleFilterTabSave = (data: SaveFilterTabDialogFormData) => {
    saveFilterTab(data.name, getActiveFilters(params));
    handleTabChange(tabs.length + 1);
  };

  const paginationState = createPaginationState(settings.rowNumber, params);
  const currencySymbol = maybe(() => shop.defaultCurrency, "USD");
  const filter = getFilterVariables(params);
  const queryVariables = React.useMemo<WMSDocumentListVariables>(
    () => ({
      ...paginationState,
      filter
    }),
    [params, settings.rowNumber]
  );
  const { data, loading } = useWMSDocumentsList({
    displayLoader: true,
    variables: queryVariables
  });

  function filterColumnIds(columns: WMSDocumentsListColumns[]) {
    return columns
      .filter(isAttributeColumnValue)
      .map(getAttributeIdFromColumnValue);
  }
  const attributes = useAvailableInGridAttributesQuery({
    variables: { first: 6, ids: filterColumnIds(settings.columns) }
  });
  const { data: initialFilterData } = useInitialFilterWMSDocuments({});
  const searchWarehouses = useWarehouseSearch({
    variables: {
      ...DEFAULT_INITIAL_SEARCH_DATA,
      first: 5
    }
  });
  const searchWMSDeliverers = useWMSDeliverersSearch({
    variables: {
      ...DEFAULT_INITIAL_SEARCH_DATA,
      first: 5
    }
  });
  const filterOpts = getFilterOpts(
    params,
    {
      initial: maybe(
        () => initialFilterData.warehouses.edges.map(edge => edge.node),
        []
      ),
      search: searchWarehouses
    },
    {
      initial: maybe(
        () => initialFilterData.wmsDeliverers.edges.map(edge => edge.node),
        []
      ),
      search: searchWMSDeliverers
    }
  );

  const { loadNextPage, loadPreviousPage, pageInfo } = paginate(
    maybe(() => data.wmsDocuments.pageInfo),
    paginationState,
    params
  );

  return (
    <>
      <WMSDocumentsListPage
        sort={{
          asc: params.asc,
          sort: params.sort
        }}
        availableInGridAttributes={maybe(
          () => attributes.data.availableInGrid.edges.map(edge => edge.node),
          []
        )}
        currencySymbol={currencySymbol}
        currentTab={currentTab}
        defaultSettings={defaultListSettings[ListViews.WMS_DOCUMENTS_LIST]}
        filterOpts={filterOpts}
        gridAttributes={maybe(
          () => attributes.data.grid.edges.map(edge => edge.node),
          []
        )}
        totalGridAttributes={maybe(
          () => attributes.data.availableInGrid.totalCount,
          0
        )}
        settings={settings}
        loading={attributes.loading}
        hasMore={maybe(
          () => attributes.data.availableInGrid.pageInfo.hasNextPage,
          false
        )}
        onAdd={() => navigate(productAddUrl)}
        disabled={loading}
        products={maybe(() => data.wmsDocuments.edges.map(edge => edge.node))}
        onFetchMore={() =>
          attributes.loadMore(
            (prev, next) => {
              if (
                prev.availableInGrid.pageInfo.endCursor ===
                next.availableInGrid.pageInfo.endCursor
              ) {
                return prev;
              }
              return {
                ...prev,
                availableInGrid: {
                  ...prev.availableInGrid,
                  edges: [
                    ...prev.availableInGrid.edges,
                    ...next.availableInGrid.edges
                  ],
                  pageInfo: next.availableInGrid.pageInfo
                }
              };
            },
            {
              after: attributes.data.availableInGrid.pageInfo.endCursor
            }
          )
        }
        onNextPage={loadNextPage}
        onPreviousPage={loadPreviousPage}
        onUpdateListSettings={updateListSettings}
        pageInfo={pageInfo}
        onRowClick={id => () => navigate(wmsDocumentUrl(id))}
        onAll={resetFilters}
        onSort={handleSort}
        toolbar={null}
        isChecked={isSelected}
        selected={listElements.length}
        toggle={toggle}
        toggleAll={toggleAll}
        onSearchChange={handleSearchChange}
        onFilterChange={changeFilters}
        onTabSave={() => openModal("save-search")}
        onTabDelete={() => openModal("delete-search")}
        onTabChange={handleTabChange}
        initialSearch={params.query || ""}
        tabs={getFilterTabs().map(tab => tab.name)}
        onExport={() => openModal("export")}
      />
      <SaveFilterTabDialog
        open={params.action === "save-search"}
        confirmButtonState="default"
        onClose={closeModal}
        onSubmit={handleFilterTabSave}
      />
      <DeleteFilterTabDialog
        open={params.action === "delete-search"}
        confirmButtonState="default"
        onClose={closeModal}
        onSubmit={handleFilterTabDelete}
        tabName={maybe(() => tabs[currentTab - 1].name, "...")}
      />
    </>
  );
};
export default WMSDocumentsList;
