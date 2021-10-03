import { MetadataFormData } from "@saleor/components/Metadata";
import NotFoundPage from "@saleor/components/NotFoundPage";
import { Task } from "@saleor/containers/BackgroundTasks/types";
import useBackgroundTask from "@saleor/hooks/useBackgroundTask";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import useShop from "@saleor/hooks/useShop";
import { commonMessages } from "@saleor/intl";
import { useOrderConfirmMutation } from "@saleor/orders/mutations";
import {
  useDpdLabelCreateMutation,
  useDpdPackageCreateMutation
} from "@saleor/orders/mutations";
import { InvoiceRequest } from "@saleor/orders/types/InvoiceRequest";
import getOrderErrorMessage from "@saleor/utils/errors/order";
import createDialogActionHandlers from "@saleor/utils/handlers/dialogActionHandlers";
import createMetadataUpdateHandler from "@saleor/utils/handlers/metadataUpdateHandler";
import {
  useMetadataUpdate,
  usePrivateMetadataUpdate
} from "@saleor/utils/metadata/updateMetadata";
import React from "react";
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
import OrderAddressFields from "./OrderAddressFields";
import { OrderDetailsMessages } from "./OrderDetailsMessages";
import { OrderDraftDetails } from "./OrderDraftDetails";
import { OrderNormalDetails } from "./OrderNormalDetails";
import { OrderUnconfirmedDetails } from "./OrderUnconfirmedDetails";

interface OrderDetailsProps {
  id: string;
  params: OrderUrlQueryParams;
}

export interface PackageData {
  weight: string;
  content: string;
  size1: string;
  size2: string;
  size3: string;
  fieldIndex: number;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ id, params }) => {
  const navigate = useNavigator();

  const shop = useShop();
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

  const [dpdLabelCreate] = useDpdLabelCreateMutation({});

  const [dpdPackageCreate] = useDpdPackageCreateMutation({
    onCompleted: data => {
      notify({
        status: "success",
        text: "Package created"
      });
      closeModal();
      return data;
    }
  });

  const checkIfParcelDialogCorrect = (formData: PackageData[]) => {
    let dataCorrect: boolean = true;
    formData.forEach(element => {
      if (
        isNaN(parseFloat(element.size1)) ||
        isNaN(parseFloat(element.size2)) ||
        isNaN(parseFloat(element.size3)) ||
        isNaN(parseFloat(element.weight))
      ) {
        dataCorrect = false;
      }
    });
    return dataCorrect;
  };

  const downloadBase64File = (
    contentType: string,
    base64Data: string,
    fileName: string
  ) => {
    const linkSource = `data:${contentType};base64,${base64Data}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  };

  return (
    <TypedOrderDetailsQuery displayLoader variables={{ id }}>
      {({ data, loading }) => {
        const order = data?.order;
        if (order === null) {
          return <NotFoundPage onBack={handleBack} />;
        }

        const isOrderUnconfirmed = order?.status === OrderStatus.UNCONFIRMED;
        const isOrderDraft = order?.status === OrderStatus.DRAFT;

        const initialPackageData: PackageData[] = [
          {
            content: "Ubrania",
            fieldIndex: 0,
            size1: "",
            size2: "",
            size3: "",
            weight: order?.lines[0]?.variant?.product?.weight?.value
          }
        ];

        const handleDpdPackageCreateSubmit = async (
          formData: PackageData[],
          generateLabel: boolean
        ) => {
          const dataCorrect = checkIfParcelDialogCorrect(formData);
          if (dataCorrect) {
            const result = await dpdPackageCreate({
              variables: {
                input: {
                  fulfillment: order?.fulfillments[0]?.id,
                  packageData: formData.map(data => ({
                    content: data.content,
                    sizeX: parseInt(data.size1, 5),
                    sizeY: parseInt(data.size2, 5),
                    sizeZ: parseInt(data.size3, 5),
                    weight: parseFloat(data.weight)
                  })),
                  receiverData: {
                    address:
                      order?.shippingAddress?.streetAddress1 +
                      order?.shippingAddress?.streetAddress2,
                    city: order?.shippingAddress?.city,
                    company:
                      order?.shippingAddress?.firstName +
                      " " +
                      order?.shippingAddress?.lastName +
                      order?.shippingAddress?.companyName,
                    countryCode: order?.shippingAddress?.country?.code,
                    email: order?.userEmail,
                    phone: order?.shippingAddress?.phone,
                    postalCode: order?.shippingAddress?.postalCode
                  },
                  senderData: {
                    address:
                      shop?.companyAddress?.streetAddress1 +
                      " " +
                      shop?.companyAddress?.streetAddress2,
                    city: shop?.companyAddress?.city,
                    company: shop?.companyAddress?.companyName,
                    countryCode: order?.shippingAddress?.country?.code,
                    email: order?.userEmail,
                    fid: "1495",
                    phone: shop?.companyAddress?.phone,
                    postalCode: shop?.companyAddress?.postalCode
                  }
                }
              }
            });
            if (generateLabel) {
              const labelCreated = await dpdLabelCreate({
                variables: {
                  input: {
                    packageId: result.data.dpdPackageCreate.packageId
                  }
                }
              });
              downloadBase64File(
                "application/pdf",
                labelCreated.data.dpdLabelCreate.label,
                result.data.dpdPackageCreate.packageId.toString()
              );
            }
            window.location.reload();
          } else {
            notify({
              status: "error",
              text: "Dane do wysłania są niepoprawne"
            });
            closeModal();
          }
        };

        const handleLabelDownloadOnButton = async () => {
          const packageIdentifier = JSON.parse(
            order?.fulfillments[0]?.privateMetadata
              ?.find(item => item.key === "package")
              .value.replace(/'/g, '"')
          ).id;
          const labelCreated = await dpdLabelCreate({
            variables: {
              input: {
                packageId: packageIdentifier
              }
            }
          });
          downloadBase64File(
            "application/pdf",
            labelCreated.data.dpdLabelCreate.label,
            packageIdentifier
          );
        };

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

        return (
          <OrderDetailsMessages id={id} params={params}>
            {orderMessages => (
              <OrderOperations
                order={id}
                onNoteAdd={orderMessages.handleNoteAdd}
                onOrderCancel={orderMessages.handleOrderCancel}
                onOrderVoid={orderMessages.handleOrderVoid}
                onPaymentCapture={orderMessages.handlePaymentCapture}
                onParcelDetails={orderMessages.handleParcelDetails}
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
                    data.invoiceRequest.invoice.status === JobStatusEnum.SUCCESS
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
                        orderAddNote={orderAddNote}
                        orderInvoiceRequest={orderInvoiceRequest}
                        handleSubmit={handleSubmit}
                        handleDpdPackageCreate={handleDpdPackageCreateSubmit}
                        onParcelLabelDownload={handleLabelDownloadOnButton}
                        orderCancel={orderCancel}
                        orderPaymentMarkAsPaid={orderPaymentMarkAsPaid}
                        orderVoid={orderVoid}
                        orderPaymentCapture={orderPaymentCapture}
                        orderFulfillmentApprove={orderFulfillmentApprove}
                        orderFulfillmentCancel={orderFulfillmentCancel}
                        orderParcelDetails={orderParcelDetails}
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
                    <OrderAddressFields
                      isDraft={order?.status === OrderStatus.DRAFT}
                      orderUpdate={orderUpdate}
                      orderDraftUpdate={orderDraftUpdate}
                      data={data}
                      id={id}
                      onClose={closeModal}
                      action={params.action}
                    />
                  </>
                )}
              </OrderOperations>
            )}
          </OrderDetailsMessages>
        );
      }}
    </TypedOrderDetailsQuery>
  );
};

export default OrderDetails;
