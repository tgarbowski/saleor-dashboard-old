import { Typography } from "@material-ui/core";
import CardMenu from "@saleor/components/CardMenu";
import { CardSpacer } from "@saleor/components/CardSpacer";
import { Container } from "@saleor/components/Container";
import { DateTime } from "@saleor/components/Date";
import Form from "@saleor/components/Form";
import Grid from "@saleor/components/Grid";
import Metadata, { MetadataFormData } from "@saleor/components/Metadata";
import PageHeader from "@saleor/components/PageHeader";
import Savebar from "@saleor/components/Savebar";
import Skeleton from "@saleor/components/Skeleton";
import { SubmitPromise } from "@saleor/hooks/useForm";
import { sectionNames } from "@saleor/intl";
import { ConfirmButtonTransitionState } from "@saleor/macaw-ui";
import { Backlink } from "@saleor/macaw-ui";
import { makeStyles } from "@saleor/macaw-ui";
import OrderChannelSectionCard from "@saleor/orders/components/OrderChannelSectionCard";
import { mapMetadataItemToInput } from "@saleor/utils/maps";
import useMetadataChangeTrigger from "@saleor/utils/metadata/useMetadataChangeTrigger";
import { defineMessages, useIntl } from "react-intl";

import { getMutationErrors, maybe } from "../../../misc";
import { OrderStatus } from "../../../types/globalTypes";
import {
  OrderDetails_order,
  OrderDetails_shop
} from "../../types/OrderDetails";
import OrderCustomer from "../OrderCustomer";
import OrderCustomerNote from "../OrderCustomerNote";
import OrderDraftDetails from "../OrderDraftDetails/OrderDraftDetails";
import { FormData as OrderDraftDetailsProductsFormData } from "../OrderDraftDetailsProducts";
import OrderFulfilledProductsCard from "../OrderFulfilledProductsCard";
import OrderHistory, { FormData as HistoryFormData } from "../OrderHistory";
import OrderInvoiceList from "../OrderInvoiceList";
import OrderPayment from "../OrderPayment/OrderPayment";
import OrderReceiptCard from "../OrderReceiptCard";
import OrderUnfulfilledProductsCard from "../OrderUnfulfilledProductsCard";
import Title from "./Title";
import { filteredConditionalItems, hasAnyItemsReplaceable } from "./utils";
import * as React from "react";
import { useState } from "react";
import OrderSteps from "../OrderSteps";

const useStyles = makeStyles(
  theme => ({
    date: {
      marginBottom: theme.spacing(3)
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 0
    }
  }),
  {
    name: "OrderDetailsPage"
  }
);

export interface OrderDetailsPageProps {
  order: OrderDetails_order;
  shop: OrderDetails_shop;
  shippingMethods?: Array<{
    id: string;
    name: string;
  }>;
  disabled: boolean;
  printing?: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  onOrderLineAdd?: () => void;
  onOrderLineChange?: (
    id: string,
    data: OrderDraftDetailsProductsFormData
  ) => void;
  onOrderLineRemove?: (id: string) => void;
  onShippingMethodEdit?: () => void;
  onBack();
  onBillingAddressEdit();
  onFulfillmentApprove(id: string);
  onFulfillmentCancel(id: string);
  onFulfillmentTrackingNumberUpdate(id: string);
  onOrderFulfill();
  onParcelDetails();
  onParcelLabelDownload(fulfillmentId: string);
  onProductClick?(id: string);
  onPaymentCapture();
  onPaymentPaid();
  onPaymentRefund();
  onPaymentVoid();
  onShippingAddressEdit();
  onOrderCancel();
  onNoteAdd(data: HistoryFormData);
  onProfileView();
  onOrderReturn();
  onInvoiceClick(invoiceId: string);
  onInvoiceGenerate();
  onInvoiceSend(invoiceId: string);
  onSubmit(data: MetadataFormData): SubmitPromise;
}

const messages = defineMessages({
  cancelOrder: {
    defaultMessage: "Cancel order",
    description: "cancel button"
  },
  confirmOrder: {
    defaultMessage: "Confirm order",
    description: "save button"
  },
  returnOrder: {
    defaultMessage: "Return / Replace order",
    description: "return button"
  }
});

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = props => {
  const {
    disabled,
    order,
    shop,
    saveButtonBarState,
    printing,
    onBack,
    onBillingAddressEdit,
    onFulfillmentApprove,
    onFulfillmentCancel,
    onFulfillmentTrackingNumberUpdate,
    onNoteAdd,
    onOrderCancel,
    onOrderFulfill,
    onParcelDetails,
    onParcelLabelDownload,
    onPaymentCapture,
    onPaymentPaid,
    onPaymentRefund,
    onPaymentVoid,
    onShippingAddressEdit,
    onProfileView,
    onInvoiceClick,
    onInvoiceGenerate,
    onInvoiceSend,
    onOrderReturn,
    onOrderLineAdd,
    onOrderLineChange,
    onOrderLineRemove,
    onShippingMethodEdit,
    onSubmit
  } = props;
  const classes = useStyles(props);

  const intl = useIntl();
  const {
    isMetadataModified,
    isPrivateMetadataModified,
    makeChangeHandler: makeMetadataChangeHandler,
    resetMetadataChanged
  } = useMetadataChangeTrigger();

  const isOrderUnconfirmed = order?.status === OrderStatus.UNCONFIRMED;
  const canCancel = order?.status !== OrderStatus.CANCELED;
  const canEditAddresses = order?.status !== OrderStatus.CANCELED;
  const canFulfill = order?.status !== OrderStatus.CANCELED;
  const notAllowedToFulfillUnpaid =
    shop?.fulfillmentAutoApprove &&
    !shop?.fulfillmentAllowUnpaid &&
    !order?.isPaid;
  const unfulfilled = (order?.lines || []).filter(
    line => line.quantityToFulfill > 0
  );

  const handleSubmit = async (data: MetadataFormData) => {
    const metadata = isMetadataModified ? data.metadata : undefined;
    const privateMetadata = isPrivateMetadataModified
      ? data.privateMetadata
      : undefined;

    const result = await onSubmit({
      metadata,
      privateMetadata
    });
    resetMetadataChanged();
    return getMutationErrors(result);
  };

  const initial: MetadataFormData = {
    metadata: order?.metadata.map(mapMetadataItemToInput),
    privateMetadata: order?.privateMetadata.map(mapMetadataItemToInput)
  };

  const saveLabel = isOrderUnconfirmed
    ? { confirm: intl.formatMessage(messages.confirmOrder) }
    : undefined;

  const allowSave = (hasChanged: boolean) => {
    if (!isOrderUnconfirmed) {
      return disabled || !hasChanged;
    } else if (!order?.lines?.length) {
      return true;
    }
    return disabled;
  };

  const selectCardMenuItems = filteredConditionalItems([
    {
      item: {
        label: intl.formatMessage(messages.cancelOrder),
        onSelect: onOrderCancel
      },
      shouldExist: canCancel
    },
    {
      item: {
        label: intl.formatMessage(messages.returnOrder),
        onSelect: onOrderReturn
      },
      shouldExist: hasAnyItemsReplaceable(order)
    }
  ]);

  const checkInvoice = () => {
    let invoice = false;
    order?.metadata.forEach(({ key, value }) => {
      if (key === "invoice") {
        if (value === "true") {
          invoice = true;
          return;
        } else {
          return;
        }
      }
    });
    return invoice;
  };

  const isInvoiceRequired = checkInvoice();

  const [print, setPrint] = useState<boolean>(false);
  const [generating, setGenerating] = useState(false);

  return (
    <Form confirmLeave initial={initial} onSubmit={handleSubmit}>
      {({ change, data, hasChanged, submit }) => {
        const changeMetadata = makeMetadataChangeHandler(change);

        return (
          <Container>
            <Backlink onClick={onBack}>
              {intl.formatMessage(sectionNames.orders)}
            </Backlink>
            <PageHeader
              className={classes.header}
              inline
              title={<Title order={order} />}
              cardMenu={<CardMenu outlined menuItems={selectCardMenuItems} />}
            />
            <div className={classes.date}>
              {order && order.created ? (
                <Typography variant="body2">
                  <DateTime date={order.created} />
                </Typography>
              ) : (
                <Skeleton style={{ width: "10em" }} />
              )}
            </div>
            <OrderSteps
              order={order}
              setPrint={setPrint}
              generating={generating}
              setGenerating={setGenerating}
              onOrderFulfill={onOrderFulfill}
              onParcelDetails={onParcelDetails}
              onInvoiceGenerate={onInvoiceGenerate}
              isInvoiceRequired={isInvoiceRequired}
            />
            <Grid>
              <div data-test-id="order-fulfillment">
                {!isOrderUnconfirmed ? (
                  <OrderUnfulfilledProductsCard
                    showFulfillmentAction={canFulfill}
                    notAllowedToFulfillUnpaid={notAllowedToFulfillUnpaid}
                    lines={unfulfilled}
                    onFulfill={onOrderFulfill}
                    onParcelDetails={onParcelDetails}
                  />
                ) : (
                  <>
                    <OrderDraftDetails
                      order={order}
                      onOrderLineAdd={onOrderLineAdd}
                      onOrderLineChange={onOrderLineChange}
                      onOrderLineRemove={onOrderLineRemove}
                      onShippingMethodEdit={onShippingMethodEdit}
                    />
                    <CardSpacer />
                  </>
                )}
                {order?.fulfillments?.map(fulfillment => (
                  <React.Fragment key={fulfillment.id}>
                    <OrderFulfilledProductsCard
                      fulfillment={fulfillment}
                      fulfillmentAllowUnpaid={shop?.fulfillmentAllowUnpaid}
                      order={order}
                      onOrderFulfillmentCancel={() =>
                        onFulfillmentCancel(fulfillment.id)
                      }
                      onTrackingCodeAdd={() =>
                        onFulfillmentTrackingNumberUpdate(fulfillment.id)
                      }
                      onParcelLabelDownload={() => onParcelLabelDownload(fulfillment.id)}
                      printing={printing}
                      onParcelDetails={onParcelDetails}
                      onRefund={onPaymentRefund}
                      onOrderFulfillmentApprove={() =>
                        onFulfillmentApprove(fulfillment.id)
                      }
                    />
                  </React.Fragment>
                ))}
                {!isOrderUnconfirmed && (
                  <>
                    <OrderPayment
                      order={order}
                      onCapture={onPaymentCapture}
                      onMarkAsPaid={onPaymentPaid}
                      onRefund={onPaymentRefund}
                      onVoid={onPaymentVoid}
                    />
                    <CardSpacer />
                    <Metadata data={data} onChange={changeMetadata} />
                  </>
                )}
                <OrderHistory
                  history={order?.events}
                  orderCurrency={order?.total?.gross.currency}
                  onNoteAdd={onNoteAdd}
                />
              </div>
              <div>
                <OrderCustomer
                  canEditAddresses={canEditAddresses}
                  canEditCustomer={false}
                  order={order}
                  onBillingAddressEdit={onBillingAddressEdit}
                  onShippingAddressEdit={onShippingAddressEdit}
                  onProfileView={onProfileView}
                />
                <CardSpacer />
                <OrderChannelSectionCard
                  selectedChannelName={order?.channel?.name}
                />
                <CardSpacer />
                {!isOrderUnconfirmed && !!order && (
                  <>
                    {isInvoiceRequired ? (
                      <OrderInvoiceList
                        invoices={order?.invoices}
                        onInvoiceClick={onInvoiceClick}
                        onInvoiceGenerate={onInvoiceGenerate}
                        onInvoiceSend={onInvoiceSend}
                        order={order}
                        generating={generating}
                        setGenerating={setGenerating}
                      />
                    ) : (
                      <OrderReceiptCard
                        order={order}
                        onInvoiceClick={onInvoiceClick}
                        onInvoiceSend={onInvoiceSend}
                        print={print}
                        setPrint={setPrint}
                      />
                    )}

                    <CardSpacer />
                  </>
                )}
                <OrderCustomerNote note={maybe(() => order.customerNote)} />
              </div>
            </Grid>
            <Savebar
              labels={saveLabel}
              onCancel={onBack}
              onSubmit={submit}
              state={saveButtonBarState}
              disabled={allowSave(hasChanged)}
            />
          </Container>
        );
      }}
    </Form>
  );
};

OrderDetailsPage.displayName = "OrderDetailsPage";
export default OrderDetailsPage;
