import DateFnsUtils from "@date-io/date-fns";
import {
  Dialog,
  DialogContent,
  FormControlLabel,
  Radio,
  RadioGroup
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContentText from "@material-ui/core/DialogContentText";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import ActionDialog from "@saleor/components/ActionDialog";
import ConfirmButton from "@saleor/components/ConfirmButton";
import DeleteFilterTabDialog from "@saleor/components/DeleteFilterTabDialog";
import FormSpacer from "@saleor/components/FormSpacer";
import SaveFilterTabDialog, {
  SaveFilterTabDialogFormData
} from "@saleor/components/SaveFilterTabDialog";
import {
  DEFAULT_INITIAL_PAGINATION_DATA,
  DEFAULT_INITIAL_SEARCH_DATA,
  defaultListSettings,
  ProductListColumns,
  WMSDocumentsListColumns
} from "@saleor/config";
import useBackgroundTask from "@saleor/hooks/useBackgroundTask";
import useBulkActions from "@saleor/hooks/useBulkActions";
import useListSettings from "@saleor/hooks/useListSettings";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import usePaginator, {
  createPaginationState
} from "@saleor/hooks/usePaginator";
import useShop from "@saleor/hooks/useShop";
import { maybe } from "@saleor/misc";
import {
  getAttributeIdFromColumnValue,
  isAttributeColumnValue
} from "@saleor/products/components/ProductListPage/utils";
import { ProductListVariables } from "@saleor/products/types/ProductList";
import useAttributeSearch from "@saleor/searches/useAttributeSearch";
import useCategorySearch from "@saleor/searches/useCategorySearch";
import useCollectionSearch from "@saleor/searches/useCollectionSearch";
import useProductTypeSearch from "@saleor/searches/useProductTypeSearch";
import { ListViews } from "@saleor/types";
import createDialogActionHandlers from "@saleor/utils/handlers/dialogActionHandlers";
import createFilterHandlers from "@saleor/utils/handlers/filterHandlers";
import { getSortUrlVariables } from "@saleor/utils/sort";
import WMSDocumentsListPage from "@saleor/warehouses/components/WarehouseDocumentsListPage";
import {
  useWarehouseList,
  useWMSDocumentsList
} from "@saleor/warehouses/queries";
import { WMSDocumentListVariables } from "@saleor/warehouses/types/WMSDoucumentsList";
import React from "react";
import { useIntl } from "react-intl";

import {
  useAvailableInGridAttributesQuery,
  useInitialProductFilterDataQuery
} from "../../../products/queries";
import {
  productAddUrl,
  ProductListUrlDialog,
  ProductListUrlQueryParams,
  productUrl
} from "../../../products/urls";
import { wmsDocumentsListUrl } from "../../urls";
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

interface ProductListProps {
  params: ProductListUrlQueryParams;
}

export const WMSDocumentsList: React.FC<ProductListProps> = ({ params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const paginate = usePaginator();
  const { queue } = useBackgroundTask();
  const shop = useShop();
  const { isSelected, listElements, reset, toggle, toggleAll } = useBulkActions(
    params.ids
  );
  const { updateListSettings, settings } = useListSettings<
    WMSDocumentsListColumns
  >(ListViews.PRODUCT_LIST);
  console.log(settings);
  const intl = useIntl();
  const { data: initialFilterData } = useInitialProductFilterDataQuery({
    variables: {
      categories: params.categories,
      collections: params.collections,
      productTypes: params.productTypes
    }
  });
  const searchCategories = useCategorySearch({
    variables: {
      ...DEFAULT_INITIAL_SEARCH_DATA,
      first: 5
    }
  });
  const searchCollections = useCollectionSearch({
    variables: {
      ...DEFAULT_INITIAL_SEARCH_DATA,
      first: 5
    }
  });
  const searchProductTypes = useProductTypeSearch({
    variables: {
      ...DEFAULT_INITIAL_SEARCH_DATA,
      first: 5
    }
  });
  const searchAttributes = useAttributeSearch({
    variables: {
      ...DEFAULT_INITIAL_SEARCH_DATA,
      first: 10
    }
  });
  const warehouses = useWarehouseList({
    variables: {
      first: 100
    }
  });

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
  const { data, loading, refetch } = useWMSDocumentsList({
    displayLoader: true,
    variables: queryVariables
  });

  console.log(data);

  function filterColumnIds(columns: WMSDocumentsListColumns[]) {
    return columns
      .filter(isAttributeColumnValue)
      .map(getAttributeIdFromColumnValue);
  }
  const attributes = useAvailableInGridAttributesQuery({
    variables: { first: 6, ids: filterColumnIds(settings.columns) }
  });

  const filterOpts = getFilterOpts(
    params,
    maybe(() => initialFilterData.attributes.edges.map(edge => edge.node), []),
    {
      initial: maybe(
        () => initialFilterData.categories.edges.map(edge => edge.node),
        []
      ),
      search: searchCategories
    },
    {
      initial: maybe(
        () => initialFilterData.collections.edges.map(edge => edge.node),
        []
      ),
      search: searchCollections
    },
    {
      initial: maybe(
        () => initialFilterData.productTypes.edges.map(edge => edge.node),
        []
      ),
      search: searchProductTypes
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
        activeAttributeSortId={params.attributeId}
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
        onRowClick={id => () => navigate(productUrl(id))}
        onAll={resetFilters}
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
