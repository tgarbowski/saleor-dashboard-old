import { useLazyQuery } from "@apollo/client";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent
} from "@material-ui/core";
import ChannelPickerDialog from "@saleor/channels/components/ChannelPickerDialog";
import useAppChannel from "@saleor/components/AppLayout/AppChannelContext";
import CardTitle from "@saleor/components/CardTitle";
import DeleteFilterTabDialog from "@saleor/components/DeleteFilterTabDialog";
import SaveFilterTabDialog, {
  SaveFilterTabDialogFormData
} from "@saleor/components/SaveFilterTabDialog";
import { useShopLimitsQuery } from "@saleor/components/Shop/query";
import useListSettings from "@saleor/hooks/useListSettings";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import { usePaginationReset } from "@saleor/hooks/usePaginationReset";
import usePaginator, {
  createPaginationState
} from "@saleor/hooks/usePaginator";
import { getStringOrPlaceholder } from "@saleor/misc";
import { warehouseListPdfQuery } from "@saleor/orders/extQueries/queries";
import { downloadBase64File } from "@saleor/shipping/handlers";
import { ListViews } from "@saleor/types";
import createDialogActionHandlers from "@saleor/utils/handlers/dialogActionHandlers";
import createFilterHandlers from "@saleor/utils/handlers/filterHandlers";
import createSortHandler from "@saleor/utils/handlers/sortHandler";
import { mapEdgesToItems, mapNodeToChoice } from "@saleor/utils/maps";
import { getSortParams } from "@saleor/utils/sort";
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import OrderListPage from "../../components/OrderListPage/OrderListPage";
import { useOrderDraftCreateMutation } from "../../mutations";
import { useOrderListQuery } from "../../queries";
import { OrderDraftCreate } from "../../types/OrderDraftCreate";
import {
  orderListUrl,
  OrderListUrlDialog,
  OrderListUrlQueryParams,
  orderSettingsPath,
  orderUrl
} from "../../urls";
import {
  deleteFilterTab,
  getActiveFilters,
  getFilterOpts,
  getFilterQueryParam,
  getFiltersCurrentTab,
  getFilterTabs,
  getFilterVariables,
  saveFilterTab
} from "./filters";
import { getSortQueryVariables } from "./sort";

interface OrderListProps {
  params: OrderListUrlQueryParams;
}

export const OrderList: React.FC<OrderListProps> = ({ params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const paginate = usePaginator();
  const { updateListSettings, settings } = useListSettings(
    ListViews.ORDER_LIST
  );

  usePaginationReset(orderListUrl, params, settings.rowNumber);

  const intl = useIntl();

  const handleCreateOrderCreateSuccess = (data: OrderDraftCreate) => {
    notify({
      status: "success",
      text: intl.formatMessage({
        defaultMessage: "Order draft successfully created"
      })
    });
    navigate(orderUrl(data.draftOrderCreate.order.id));
  };

  const [createOrder] = useOrderDraftCreateMutation({
    onCompleted: handleCreateOrderCreateSuccess
  });

  const { channel, availableChannels } = useAppChannel(false);
  const limitOpts = useShopLimitsQuery({
    variables: {
      orders: true
    }
  });

  const noChannel = !channel && typeof channel !== "undefined";
  const channelOpts = availableChannels
    ? mapNodeToChoice(availableChannels)
    : null;

  const tabs = getFilterTabs();

  const currentTab = getFiltersCurrentTab(params, tabs);

  const [
    changeFilters,
    resetFilters,
    handleSearchChange
  ] = createFilterHandlers({
    createUrl: orderListUrl,
    getFilterQueryParam,
    navigate,
    params
  });

  const [openModal, closeModal] = createDialogActionHandlers<
    OrderListUrlDialog,
    OrderListUrlQueryParams
  >(navigate, orderListUrl, params);

  const handleTabChange = (tab: number) =>
    navigate(
      orderListUrl({
        activeTab: tab.toString(),
        ...getFilterTabs()[tab - 1].data
      })
    );

  const handleFilterTabDelete = () => {
    deleteFilterTab(currentTab);
    navigate(orderListUrl());
  };

  const handleFilterTabSave = (data: SaveFilterTabDialogFormData) => {
    saveFilterTab(data.name, getActiveFilters(params));
    handleTabChange(tabs.length + 1);
  };

  const paginationState = createPaginationState(settings.rowNumber, params);

  const queryVariables = React.useMemo(
    () => ({
      ...paginationState,
      filter: getFilterVariables(params),
      sort: getSortQueryVariables(params)
    }),
    [params, settings.rowNumber]
  );
  const { data, loading } = useOrderListQuery({
    displayLoader: true,
    variables: queryVariables
  });

  const { loadNextPage, loadPreviousPage, pageInfo } = paginate(
    data?.orders?.pageInfo,
    paginationState,
    params
  );

  const handleSort = createSortHandler(navigate, orderListUrl, params);
  const [
    warehouseListGenerationError,
    setWarehouseListGenerationError
  ] = useState(false);

  const [
    getWarehouseListPdfQuery,
    {
      data: warehouseListData,
      loading: warehouseListLoading,
      error: warehouseListError
    }
  ] = useLazyQuery(warehouseListPdfQuery);

  const onGenerateWarehouseList = () => {
    getWarehouseListPdfQuery({
      variables: {
        filters: getFilterVariables(params)
      }
    });
  };

  useEffect(() => {
    if (warehouseListError) {
      setWarehouseListGenerationError(true);
    } else {
      if (!warehouseListLoading) {
        if (warehouseListData) {
          const today = new Date();
          const dd = String(today.getDate()).padStart(2, "0");
          const mm = String(today.getMonth() + 1).padStart(2, "0");
          const yyyy = today.getFullYear();
          downloadBase64File(
            "application/pdf",
            warehouseListData.warehouseListPdf,
            `Lista pobrania z magazynu ${dd}${mm}${yyyy}.pdf`
          );
        }
      }
    }
  }, [warehouseListLoading]);

  return (
    <>
      <OrderListPage
        settings={settings}
        currentTab={currentTab}
        disabled={loading}
        filterOpts={getFilterOpts(params, channelOpts)}
        limits={limitOpts.data?.shop.limits}
        orders={mapEdgesToItems(data?.orders)}
        pageInfo={pageInfo}
        sort={getSortParams(params)}
        onAdd={() => openModal("create-order")}
        onNextPage={loadNextPage}
        onPreviousPage={loadPreviousPage}
        onUpdateListSettings={updateListSettings}
        onRowClick={id => () => navigate(orderUrl(id))}
        onSort={handleSort}
        onSearchChange={handleSearchChange}
        onFilterChange={changeFilters}
        onTabSave={() => openModal("save-search")}
        onTabDelete={() => openModal("delete-search")}
        onTabChange={handleTabChange}
        initialSearch={params.query || ""}
        tabs={getFilterTabs().map(tab => tab.name)}
        onAll={resetFilters}
        onSettingsOpen={() => navigate(orderSettingsPath)}
        onGenerateWarehouseList={onGenerateWarehouseList}
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
        tabName={getStringOrPlaceholder(tabs[currentTab - 1]?.name)}
      />
      {!noChannel && (
        <ChannelPickerDialog
          channelsChoices={mapNodeToChoice(availableChannels)}
          confirmButtonState="success"
          defaultChoice={channel.id}
          open={params.action === "create-order"}
          onClose={closeModal}
          onConfirm={channelId =>
            createOrder({
              variables: {
                input: { channelId }
              }
            })
          }
        />
      )}
      <Dialog open={warehouseListGenerationError}>
        <CardTitle
          title="Błąd"
          onClose={() => setWarehouseListGenerationError(false)}
        />
        <DialogContent>
          <FormattedMessage defaultMessage="Brak wybranych filtrów" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarehouseListGenerationError(false)}>
            Dalej
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderList;
