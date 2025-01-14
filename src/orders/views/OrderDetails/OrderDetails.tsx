import { MetadataFormData } from "@saleor/components/Metadata";
import NotFoundPage from "@saleor/components/NotFoundPage";
import { Task } from "@saleor/containers/BackgroundTasks/types";
import useBackgroundTask from "@saleor/hooks/useBackgroundTask";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import { commonMessages } from "@saleor/intl";
import { useOrderConfirmMutation } from "@saleor/orders/mutations";
import { InvoiceRequest } from "@saleor/orders/types/InvoiceRequest";
import getOrderErrorMessage from "@saleor/utils/errors/order";
import createDialogActionHandlers from "@saleor/utils/handlers/dialogActionHandlers";
import createMetadataUpdateHandler from "@saleor/utils/handlers/metadataUpdateHandler";
import {
  useMetadataUpdate,
  usePrivateMetadataUpdate
} from "@saleor/utils/metadata/updateMetadata";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import { JobStatusEnum, OrderStatus } from "../../../types/globalTypes";
import OrderOperations from "../../containers/OrderOperations";
import { TypedOrderDetailsQuery } from "../../queries";
import {
  orderListUrl,
  orderUrl,
  OrderUrlDialog,
  OrderUrlQueryParams
} from "../../urls";
import { OrderDetailsMessages } from "./OrderDetailsMessages";
import { OrderDraftDetails } from "./OrderDraftDetails";
import { OrderNormalDetails } from "./OrderNormalDetails";
import { OrderUnconfirmedDetails } from "./OrderUnconfirmedDetails";
import {
  useLabelCreateMutation,
  usePackageCreateMutation
} from "@saleor/orders/mutations";
import {
  checkIfParcelDialogCorrect,
  PackageData
} from "@saleor/shipping/handlers";
import { usePluginDetails } from "@saleor/plugins/queries";

interface OrderDetailsProps {
  id: string;
  params: OrderUrlQueryParams;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ id, params }) => {
  const navigate = useNavigator();
  const { queue } = useBackgroundTask();
  const intl = useIntl();
  const [updateMetadata, updateMetadataOpts] = useMetadataUpdate({});
  const [
    updatePrivateMetadata,
    updatePrivateMetadataOpts
  ] = usePrivateMetadataUpdate({});
  const notify = useNotifier();

  const [openModal, closeModal] = createDialogActionHandlers<
    OrderUrlDialog,
    OrderUrlQueryParams
  >(navigate, params => orderUrl(id, params), params);

  const handleBack = () => navigate(orderListUrl());

  const [orderConfirm] = useOrderConfirmMutation({
    onCompleted: ({ orderConfirm: { errors } }) => {
      const isError = !!errors.length;

      notify({
        status: isError ? "error" : "success",
        text: isError
          ? getOrderErrorMessage(errors[0], intl)
          : "Confirmed Order"
      });
    }
  });

  const [labelCreate] = useLabelCreateMutation({
    onError() {
      notify({
        status: "error",
        text: "Błąd tworzenia etykiety"
      });
    }
  });
  const pluginId = "printservers";
  const { data: pluginData } = usePluginDetails({
    displayLoader: true,
    variables: { id: pluginId }
  });

  const [packageCreate] = usePackageCreateMutation({});
  const [labelPrinting, setLabelPrinting] = useState(false);

  return (
    <>
      <TypedOrderDetailsQuery displayLoader variables={{ id }}>
        {({ data, loading }) => {
          const order = data?.order;
          if (order === null) {
            return <NotFoundPage onBack={handleBack} />;
          }

          const isOrderUnconfirmed = order?.status === OrderStatus.UNCONFIRMED;
          const isOrderDraft = order?.status === OrderStatus.DRAFT;

          const handleSubmit = async (data: MetadataFormData) => {
            if (order?.status === OrderStatus.UNCONFIRMED) {
              await orderConfirm({ variables: { id: order?.id } });
            }

            const update = createMetadataUpdateHandler(
              order,
              () => Promise.resolve([]),
              variables => updateMetadata({ variables }),
              variables => updatePrivateMetadata({ variables })
            );

            const result = await update(data);

            if (result.length === 0) {
              notify({
                status: "success",
                text: intl.formatMessage(commonMessages.savedChanges)
              });
            }

            return result;
          };

          const initialPackageData: PackageData[] = [
            {
              fieldIndex: 0,
              size1: null,
              size2: null,
              size3: null,
              weight: null
            }
          ];

          const printLabel = async (packageIdentifier: number) => {
            setLabelPrinting(true);
            const serverUrl =
              pluginData.plugin.globalConfiguration.configuration[0].value;
            const labelCreated = await labelCreate({
              variables: {
                input: {
                  packageId: packageIdentifier,
                  order: order.id
                }
              }
            });
            if (serverUrl) {
              const tempSocket = new WebSocket(`${serverUrl}`);
              tempSocket.onopen = () => {
                tempSocket.send(
                  Buffer.from(
                    labelCreated.data.labelCreate.label,
                    "base64"
                  ).toString()
                );
              };
              tempSocket.onerror = () => {
                notify({
                  status: "error",
                  text: "Błąd drukowania"
                });
                setLabelPrinting(false);
              };
              tempSocket.onclose = () => {
                setLabelPrinting(false);
              };
            } else {
              notify({
                status: "error",
                text: "Url drukarki etykiet jest błędnie skonfigurowany"
              });
              setLabelPrinting(false);
            }
          };

          const handlePackageCreateSubmit = async (
            formData: PackageData[],
            generateLabel: boolean,
            fulfillmentId: string
          ) => {
            const dataCorrect = checkIfParcelDialogCorrect(formData);
            if (dataCorrect) {
              const result = await packageCreate({
                variables: {
                  input: {
                    fulfillment: fulfillmentId,
                    order: order.id,
                    packageData: formData.map(data => ({
                      sizeX: data.size1,
                      sizeY: data.size2,
                      sizeZ: data.size3,
                      weight: data.weight
                    }))
                  }
                }
              });
              if (!result.data.packageCreate.packageId) {
                notify({
                  status: "error",
                  text: "Błędne wymiary lub waga wysyłki"
                });
                closeModal();
              } else {
                notify({
                  status: "success",
                  text: "Package created"
                });
                closeModal();
                if (generateLabel) {
                  printLabel(result.data.packageCreate.packageId);
                } else {
                  window.location.reload();
                }
              }
            } else {
              notify({
                status: "error",
                text: "Dane do wysłania są niepoprawne"
              });
              closeModal();
            }
          };

          const handleLabelDownloadOnButton = async (fulfillmentId: string) => {
            const packageIdentifier = JSON.parse(
              order?.fulfillments
                ?.find(item => item.id === fulfillmentId)
                .privateMetadata?.find(item => item.key === "package")
                .value.replace(/'/g, '"')
            ).id;
            printLabel(packageIdentifier);
          };

          return (
            <OrderDetailsMessages id={id} params={params}>
              {orderMessages => (
                <OrderOperations
                  onParcelDetails={orderMessages.handleParcelDetails}
                  order={id}
                  onNoteAdd={orderMessages.handleNoteAdd}
                  onOrderCancel={orderMessages.handleOrderCancel}
                  onOrderVoid={orderMessages.handleOrderVoid}
                  onPaymentCapture={orderMessages.handlePaymentCapture}
                  onUpdate={orderMessages.handleUpdate}
                  onDraftUpdate={orderMessages.handleDraftUpdate}
                  onShippingMethodUpdate={data => {
                    orderMessages.handleShippingMethodUpdate(data);
                    order.total = data.orderUpdateShipping.order.total;
                  }}
                  onOrderLineDelete={orderMessages.handleOrderLineDelete}
                  onOrderLinesAdd={orderMessages.handleOrderLinesAdd}
                  onOrderLineUpdate={orderMessages.handleOrderLineUpdate}
                  onOrderFulfillmentApprove={
                    orderMessages.handleOrderFulfillmentApprove
                  }
                  onOrderFulfillmentCancel={
                    orderMessages.handleOrderFulfillmentCancel
                  }
                  onOrderFulfillmentUpdate={
                    orderMessages.handleOrderFulfillmentUpdate
                  }
                  onDraftFinalize={orderMessages.handleDraftFinalize}
                  onDraftCancel={orderMessages.handleDraftCancel}
                  onOrderMarkAsPaid={orderMessages.handleOrderMarkAsPaid}
                  onInvoiceRequest={(data: InvoiceRequest) => {
                    if (
                      data.invoiceRequest.invoice.status ===
                      JobStatusEnum.SUCCESS
                    ) {
                      orderMessages.handleInvoiceGenerateFinished(data);
                    } else {
                      orderMessages.handleInvoiceGeneratePending(data);
                      queue(Task.INVOICE_GENERATE, {
                        generateInvoice: {
                          invoiceId: data.invoiceRequest.invoice.id,
                          orderId: id
                        }
                      });
                    }
                  }}
                  onInvoiceSend={orderMessages.handleInvoiceSend}
                >
                  {({
                    orderAddNote,
                    orderCancel,
                    orderDraftUpdate,
                    orderLinesAdd,
                    orderLineDelete,
                    orderLineUpdate,
                    orderParcelDetails,
                    orderPaymentCapture,
                    orderVoid,
                    orderShippingMethodUpdate,
                    orderUpdate,
                    orderFulfillmentApprove,
                    orderFulfillmentCancel,
                    orderFulfillmentUpdateTracking,
                    orderDraftCancel,
                    orderDraftFinalize,
                    orderPaymentMarkAsPaid,
                    orderInvoiceRequest,
                    orderInvoiceSend
                  }) => (
                    <>
                      {!isOrderDraft && !isOrderUnconfirmed && (
                        <OrderNormalDetails
                          id={id}
                          params={params}
                          data={data}
                          initialPackageData={initialPackageData}
                          handlePackageCreate={handlePackageCreateSubmit}
                          onParcelLabelDownload={handleLabelDownloadOnButton}
                          printing={labelPrinting}
                          orderParcelDetails={orderParcelDetails}
                          orderAddNote={orderAddNote}
                          orderInvoiceRequest={orderInvoiceRequest}
                          handleSubmit={handleSubmit}
                          orderUpdate={orderUpdate}
                          orderCancel={orderCancel}
                          orderPaymentMarkAsPaid={orderPaymentMarkAsPaid}
                          orderVoid={orderVoid}
                          orderPaymentCapture={orderPaymentCapture}
                          orderFulfillmentApprove={orderFulfillmentApprove}
                          orderFulfillmentCancel={orderFulfillmentCancel}
                          orderFulfillmentUpdateTracking={
                            orderFulfillmentUpdateTracking
                          }
                          orderInvoiceSend={orderInvoiceSend}
                          updateMetadataOpts={updateMetadataOpts}
                          updatePrivateMetadataOpts={updatePrivateMetadataOpts}
                          openModal={openModal}
                          closeModal={closeModal}
                        />
                      )}
                      {isOrderDraft && (
                        <OrderDraftDetails
                          id={id}
                          params={params}
                          loading={loading}
                          data={data}
                          orderAddNote={orderAddNote}
                          orderLineUpdate={orderLineUpdate}
                          orderLineDelete={orderLineDelete}
                          orderShippingMethodUpdate={orderShippingMethodUpdate}
                          orderLinesAdd={orderLinesAdd}
                          orderDraftUpdate={orderDraftUpdate}
                          orderDraftCancel={orderDraftCancel}
                          orderDraftFinalize={orderDraftFinalize}
                          openModal={openModal}
                          closeModal={closeModal}
                        />
                      )}
                      {isOrderUnconfirmed && (
                        <OrderUnconfirmedDetails
                          id={id}
                          params={params}
                          data={data}
                          orderAddNote={orderAddNote}
                          orderLineUpdate={orderLineUpdate}
                          orderLineDelete={orderLineDelete}
                          orderInvoiceRequest={orderInvoiceRequest}
                          handleSubmit={handleSubmit}
                          orderUpdate={orderUpdate}
                          orderCancel={orderCancel}
                          orderShippingMethodUpdate={orderShippingMethodUpdate}
                          orderLinesAdd={orderLinesAdd}
                          orderPaymentMarkAsPaid={orderPaymentMarkAsPaid}
                          orderVoid={orderVoid}
                          orderPaymentCapture={orderPaymentCapture}
                          orderFulfillmentApprove={orderFulfillmentApprove}
                          orderFulfillmentCancel={orderFulfillmentCancel}
                          orderFulfillmentUpdateTracking={
                            orderFulfillmentUpdateTracking
                          }
                          orderInvoiceSend={orderInvoiceSend}
                          updateMetadataOpts={updateMetadataOpts}
                          updatePrivateMetadataOpts={updatePrivateMetadataOpts}
                          openModal={openModal}
                          closeModal={closeModal}
                        />
                      )}
                    </>
                  )}
                </OrderOperations>
              )}
            </OrderDetailsMessages>
          );
        }}
      </TypedOrderDetailsQuery>
    </>
  );
};

export default OrderDetails;
