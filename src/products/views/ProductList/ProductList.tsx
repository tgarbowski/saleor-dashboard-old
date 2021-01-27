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
  ProductListColumns
} from "@saleor/config";
import { Task } from "@saleor/containers/BackgroundTasks/types";
import useBackgroundTask from "@saleor/hooks/useBackgroundTask";
import useBulkActions from "@saleor/hooks/useBulkActions";
import useListSettings from "@saleor/hooks/useListSettings";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import usePaginator, {
  createPaginationState
} from "@saleor/hooks/usePaginator";
import useShop from "@saleor/hooks/useShop";
import { buttonMessages, commonMessages } from "@saleor/intl";
import { maybe } from "@saleor/misc";
import ProductExportDialog from "@saleor/products/components/ProductExportDialog";
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
import { useWarehouseList } from "@saleor/warehouses/queries";
import plLocale from "date-fns/locale/pl";
import moment from "moment-timezone";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import ProductListPage from "../../components/ProductListPage";
import {
  useProductBulkDeleteMutation,
  useProductBulkPublishMutation,
  useProductExport
} from "../../mutations";
import {
  useAvailableInGridAttributesQuery,
  useCountAllProducts,
  useInitialProductFilterDataQuery,
  useProductListQuery
} from "../../queries";
import {
  productAddUrl,
  productListUrl,
  ProductListUrlDialog,
  ProductListUrlQueryParams,
  ProductListUrlSortField,
  productUrl
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
import { getSortQueryVariables } from "./sort";

interface ProductListProps {
  params: ProductListUrlQueryParams;
}

enum ProductPublishType {
  AUCTION = "AUCTION",
  BUY_NOW = "BUY_NOW"
}

export const ProductList: React.FC<ProductListProps> = ({ params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const paginate = usePaginator();
  const { queue } = useBackgroundTask();
  const shop = useShop();
  const { isSelected, listElements, reset, toggle, toggleAll } = useBulkActions(
    params.ids
  );
  const { updateListSettings, settings } = useListSettings<ProductListColumns>(
    ListViews.PRODUCT_LIST
  );
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
        productListUrl({
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
  >(navigate, productListUrl, params);
  const countAllProducts = useCountAllProducts({});

  const [exportProducts, exportProductsOpts] = useProductExport({
    onCompleted: data => {
      if (data.exportProducts.errors.length === 0) {
        notify({
          text: intl.formatMessage({
            defaultMessage:
              "We are currently exporting your requested CSV. As soon as it is available it will be sent to your email address"
          }),
          title: intl.formatMessage({
            defaultMessage: "Exporting CSV",
            description: "waiting for export to end, header"
          })
        });
        queue(Task.EXPORT, {
          id: data.exportProducts.exportFile.id
        });
        closeModal();
        reset();
      }
    }
  });

  const [
    changeFilters,
    resetFilters,
    handleSearchChange
  ] = createFilterHandlers({
    cleanupFn: reset,
    createUrl: productListUrl,
    getFilterQueryParam,
    navigate,
    params
  });

  React.useEffect(() => {
    const allegroNieopublikowaneLabel = "Allegro - nieopublikowane";
    const allegroOpublikowaneLabel = "Allegro - opublikowane";

    if (
      tabs.filter(tab => tab.name === allegroNieopublikowaneLabel).length === 0
    ) {
      saveFilterTab(allegroNieopublikowaneLabel, {
        allegroStatus: "moderated",
        status: "hidden"
      });
    }
    if (
      tabs.filter(tab => tab.name === allegroNieopublikowaneLabel).length === 0
    ) {
      saveFilterTab(allegroOpublikowaneLabel, {
        allegroStatus: "published",
        status: "published"
      });
    }
  }, []);

  const handleTabChange = (tab: number) => {
    reset();
    navigate(
      productListUrl({
        activeTab: tab.toString(),
        ...getFilterTabs()[tab - 1].data
      })
    );
  };

  const handleFilterTabDelete = () => {
    deleteFilterTab(currentTab);
    reset();
    navigate(productListUrl());
  };

  const handleFilterTabSave = (data: SaveFilterTabDialogFormData) => {
    saveFilterTab(data.name, getActiveFilters(params));
    handleTabChange(tabs.length + 1);
  };

  const handleSort = (field: ProductListUrlSortField, attributeId?: string) =>
    navigate(
      productListUrl({
        ...params,
        ...getSortUrlVariables(field, params),
        attributeId,
        ...DEFAULT_INITIAL_PAGINATION_DATA
      })
    );

  const paginationState = createPaginationState(settings.rowNumber, params);
  const currencySymbol = maybe(() => shop.defaultCurrency, "USD");
  const filter = getFilterVariables(params);
  const sort = getSortQueryVariables(params);
  const queryVariables = React.useMemo<ProductListVariables>(
    () => ({
      ...paginationState,
      filter,
      sort
    }),
    [params, settings.rowNumber]
  );
  const { data, loading, refetch } = useProductListQuery({
    displayLoader: true,
    variables: queryVariables
  });

  function filterColumnIds(columns: ProductListColumns[]) {
    return columns
      .filter(isAttributeColumnValue)
      .map(getAttributeIdFromColumnValue);
  }
  const attributes = useAvailableInGridAttributesQuery({
    variables: { first: 6, ids: filterColumnIds(settings.columns) }
  });

  const [
    productBulkDelete,
    productBulkDeleteOpts
  ] = useProductBulkDeleteMutation({
    onCompleted: data => {
      if (data.productBulkDelete.errors.length === 0) {
        closeModal();
        notify({
          status: "success",
          text: intl.formatMessage(commonMessages.savedChanges)
        });
        reset();
        refetch();
      }
    }
  });

  const [
    productBulkPublish,
    productBulkPublishOpts
  ] = useProductBulkPublishMutation({
    onCompleted: data => {
      if (data.productBulkPublish.errors.length === 0) {
        closeModal();
        notify({
          status: "success",
          text: intl.formatMessage(commonMessages.savedChanges)
        });
        reset();
        refetch();
      }
    }
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
    maybe(() => data.products.pageInfo),
    paginationState,
    params
  );

  const [auctionTypeVal, auctionTypeSetValue] = React.useState(
    ProductPublishType.AUCTION
  );
  const auctionTypeHandleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    auctionTypeSetValue(
      ProductPublishType[(event.target as HTMLInputElement).value]
    );
  };

  const [auctionDate, auctionHandleDateChange] = React.useState(new Date());

  return (
    <>
      <ProductListPage
        activeAttributeSortId={params.attributeId}
        sort={{
          asc: params.asc,
          sort: params.sort
        }}
        onSort={handleSort}
        availableInGridAttributes={maybe(
          () => attributes.data.availableInGrid.edges.map(edge => edge.node),
          []
        )}
        currencySymbol={currencySymbol}
        currentTab={currentTab}
        defaultSettings={defaultListSettings[ListViews.PRODUCT_LIST]}
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
        products={maybe(() => data.products.edges.map(edge => edge.node))}
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
        toolbar={
          <>
            <Button
              color="primary"
              onClick={() =>
                openModal("unpublish", {
                  ids: listElements
                })
              }
            >
              <FormattedMessage
                defaultMessage="Unpublish"
                description="unpublish product, button"
              />
            </Button>
            <Button
              color="primary"
              onClick={() =>
                openModal("publish", {
                  ids: listElements
                })
              }
            >
              <FormattedMessage
                defaultMessage="Publish"
                description="publish product, button"
              />
            </Button>
            <IconButton
              color="primary"
              onClick={() =>
                openModal("delete", {
                  ids: listElements
                })
              }
            >
              <DeleteIcon />
            </IconButton>
          </>
        }
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
      <ActionDialog
        open={params.action === "delete"}
        confirmButtonState={productBulkDeleteOpts.status}
        onClose={closeModal}
        onConfirm={() =>
          productBulkDelete({
            variables: { ids: params.ids }
          })
        }
        title={intl.formatMessage({
          defaultMessage: "Delete Products",
          description: "dialog header"
        })}
        variant="delete"
      >
        <DialogContentText>
          <FormattedMessage
            defaultMessage="{counter,plural,one{Are you sure you want to delete this product?} other{Are you sure you want to delete {displayQuantity} products?}}"
            description="dialog content"
            values={{
              counter: maybe(() => params.ids.length),
              displayQuantity: <strong>{maybe(() => params.ids.length)}</strong>
            }}
          />
        </DialogContentText>
      </ActionDialog>
      <Dialog
        open={params.action === "publish"}
        onClose={closeModal}
        title={intl.formatMessage({
          defaultMessage: "Publish Products",
          description: "dialog header"
        })}
      >
        <DialogContent>
          <DialogContentText>
            <FormattedMessage
              defaultMessage="{counter,plural,one{Parametry publikacji produktu} other{Parametry publikacji {displayQuantity} produktów}}"
              description="dialog content"
              values={{
                counter: maybe(() => params.ids.length),
                displayQuantity: (
                  <strong>{maybe(() => params.ids.length)}</strong>
                )
              }}
            />
          </DialogContentText>
          <FormSpacer />
          <RadioGroup
            row
            aria-label="Typ aukcji"
            name="auction_type"
            value={auctionTypeVal}
            onChange={auctionTypeHandleChange}
          >
            <FormControlLabel
              value={ProductPublishType.AUCTION}
              control={<Radio />}
              label="Aukcja"
            />
            <FormControlLabel
              value={ProductPublishType.BUY_NOW}
              control={<Radio />}
              label="Kup teraz"
            />
          </RadioGroup>
          <FormSpacer />
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={plLocale}>
            <DateTimePicker
              label="Data i godzina publikacji"
              format="yyyy-MM-dd HH:mm"
              ampm={false}
              disabled={auctionTypeVal !== ProductPublishType.AUCTION}
              value={auctionDate}
              onChange={auctionHandleDateChange}
            />
          </MuiPickersUtilsProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>
            <FormattedMessage {...buttonMessages.back} />
          </Button>
          <ConfirmButton
            transitionState={productBulkPublishOpts.status}
            color="primary"
            variant="contained"
            onClick={() =>
              productBulkPublish({
                variables: {
                  ids: params.ids,
                  isPublished: true,
                  offerType: auctionTypeVal,
                  startingAt: moment(auctionDate).format("YYYY-MM-DD HH:mm")
                }
              })
            }
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </ConfirmButton>
        </DialogActions>
      </Dialog>
      <ActionDialog
        open={params.action === "unpublish"}
        confirmButtonState={productBulkPublishOpts.status}
        onClose={closeModal}
        onConfirm={() =>
          productBulkPublish({
            variables: {
              ids: params.ids,
              isPublished: false,
              offerType: null,
              startingAt: null
            }
          })
        }
        title={intl.formatMessage({
          defaultMessage: "Unpublish Products",
          description: "dialog header"
        })}
      >
        <DialogContentText>
          <FormattedMessage
            defaultMessage="{counter,plural,one{Are you sure you want to unpublish this product?} other{Are you sure you want to unpublish {displayQuantity} products?}}"
            description="dialog content"
            values={{
              counter: maybe(() => params.ids.length),
              displayQuantity: <strong>{maybe(() => params.ids.length)}</strong>
            }}
          />
        </DialogContentText>
      </ActionDialog>
      <ProductExportDialog
        attributes={(searchAttributes.result.data?.search.edges || []).map(
          edge => edge.node
        )}
        hasMore={searchAttributes.result.data?.search.pageInfo.hasNextPage}
        loading={searchAttributes.result.loading}
        onFetch={searchAttributes.search}
        onFetchMore={searchAttributes.loadMore}
        open={params.action === "export"}
        confirmButtonState={exportProductsOpts.status}
        errors={exportProductsOpts.data?.exportProducts.errors || []}
        productQuantity={{
          all: countAllProducts.data?.products.totalCount,
          filter: data?.products.totalCount
        }}
        selectedProducts={listElements.length}
        warehouses={
          warehouses.data?.warehouses.edges.map(edge => edge.node) || []
        }
        onClose={closeModal}
        onSubmit={data =>
          exportProducts({
            variables: {
              input: {
                ...data,
                filter,
                ids: listElements
              }
            }
          })
        }
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
export default ProductList;
