/* eslint-disable radix */
import { MetadataFormData } from "@saleor/components/Metadata";
import NotFoundPage from "@saleor/components/NotFoundPage";
import { WindowTitle } from "@saleor/components/WindowTitle";
import { DEFAULT_INITIAL_SEARCH_DATA } from "@saleor/config";
import { Task } from "@saleor/containers/BackgroundTasks/types";
import useBackgroundTask from "@saleor/hooks/useBackgroundTask";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import useShop from "@saleor/hooks/useShop";
import useUser from "@saleor/hooks/useUser";
import { commonMessages } from "@saleor/intl";
import OrderCannotCancelOrderDialog from "@saleor/orders/components/OrderCannotCancelOrderDialog";
import OrderInvoiceEmailSendDialog from "@saleor/orders/components/OrderInvoiceEmailSendDialog";
import OrderParcelDetails from "@saleor/orders/components/OrderParcelDetails";
import {
  useDpdLabelCreateMutation,
  useDpdPackageCreateMutation
} from "@saleor/orders/mutations";
import { InvoiceRequest } from "@saleor/orders/types/InvoiceRequest";
import useCustomerSearch from "@saleor/searches/useCustomerSearch";
import createDialogActionHandlers from "@saleor/utils/handlers/dialogActionHandlers";
import createMetadataUpdateHandler from "@saleor/utils/handlers/metadataUpdateHandler";
import {
  useMetadataUpdate,
  usePrivateMetadataUpdate
} from "@saleor/utils/metadata/updateMetadata";
import { useWarehouseList } from "@saleor/warehouses/queries";
import React from "react";
import { useIntl } from "react-intl";

import { customerUrl } from "../../../customers/urls";
import { getMutationState, getStringOrPlaceholder, maybe } from "../../../misc";
import { productUrl } from "../../../products/urls";
import {
  FulfillmentStatus,
  JobStatusEnum,
  OrderStatus
} from "../../../types/globalTypes";
import OrderCancelDialog from "../../components/OrderCancelDialog";
import OrderDetailsPage from "../../components/OrderDetailsPage";
import OrderDraftCancelDialog from "../../components/OrderDraftCancelDialog/OrderDraftCancelDialog";
import OrderDraftPage from "../../components/OrderDraftPage";
import OrderFulfillmentCancelDialog from "../../components/OrderFulfillmentCancelDialog";
import OrderFulfillmentTrackingDialog from "../../components/OrderFulfillmentTrackingDialog";
import OrderMarkAsPaidDialog from "../../components/OrderMarkAsPaidDialog/OrderMarkAsPaidDialog";
import OrderPaymentDialog from "../../components/OrderPaymentDialog";
import OrderPaymentVoidDialog from "../../components/OrderPaymentVoidDialog";
import OrderProductAddDialog from "../../components/OrderProductAddDialog";
import OrderShippingMethodEditDialog from "../../components/OrderShippingMethodEditDialog";
import OrderOperations from "../../containers/OrderOperations";
import { TypedOrderDetailsQuery, useOrderVariantSearch } from "../../queries";
import {
  orderDraftListUrl,
  orderFulfillUrl,
  orderListUrl,
  orderUrl,
  OrderUrlDialog,
  OrderUrlQueryParams
} from "../../urls";
import OrderAddressFields from "./OrderAddressFields";
import { OrderDetailsMessages } from "./OrderDetailsMessages";

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
  const { user } = useUser();
  const {
    loadMore: loadMoreCustomers,
    search: searchUsers,
    result: users
  } = useCustomerSearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA
  });
  const {
    loadMore,
    search: variantSearch,
    result: variantSearchOpts
  } = useOrderVariantSearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA
  });
  const warehouses = useWarehouseList({
    displayLoader: true,
    variables: {
      first: 30
    }
  });
  const { queue } = useBackgroundTask();
  const intl = useIntl();
  const shop = useShop();

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
        if (order === null) {
          return <NotFoundPage onBack={handleBack} />;
        }

        const handleSubmit = async (data: MetadataFormData) => {
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
                    sizeX: parseInt(data.size1),
                    sizeY: parseInt(data.size2),
                    sizeZ: parseInt(data.size3),
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

        return (
          <OrderDetailsMessages id={id} params={params}>
            {orderMessages => (
              <OrderOperations
                order={id}
                onNoteAdd={orderMessages.handleNoteAdd}
                onOrderCancel={orderMessages.handleOrderCancel}
                onOrderVoid={orderMessages.handleOrderVoid}
                onPaymentCapture={orderMessages.handlePaymentCapture}
                onPaymentRefund={orderMessages.handlePaymentRefund}
                onParcelDetails={orderMessages.handleParcelDetails}
                onUpdate={orderMessages.handleUpdate}
                onDraftUpdate={orderMessages.handleDraftUpdate}
                onShippingMethodUpdate={
                  orderMessages.handleShippingMethodUpdate
                }
                onOrderLineDelete={orderMessages.handleOrderLineDelete}
                onOrderLinesAdd={orderMessages.handleOrderLinesAdd}
                onOrderLineUpdate={orderMessages.handleOrderLineUpdate}
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
                  orderPaymentRefund,
                  orderVoid,
                  orderShippingMethodUpdate,
                  orderUpdate,
                  orderFulfillmentCancel,
                  orderFulfillmentUpdateTracking,
                  orderDraftCancel,
                  orderDraftFinalize,
                  orderPaymentMarkAsPaid,
                  orderInvoiceRequest,
                  orderInvoiceSend
                }) => (
                  <>
                    {order?.status !== OrderStatus.DRAFT ? (
                      <>
                        <WindowTitle
                          title={intl.formatMessage(
                            {
                              defaultMessage: "Order #{orderNumber}",
                              description: "window title"
                            },
                            {
                              orderNumber: getStringOrPlaceholder(
                                data?.order?.number
                              )
                            }
                          )}
                        />
                        <OrderDetailsPage
                          disabled={
                            updateMetadataOpts.loading ||
                            updatePrivateMetadataOpts.loading
                          }
                          onNoteAdd={variables =>
                            orderAddNote.mutate({
                              input: variables,
                              order: id
                            })
                          }
                          onBack={handleBack}
                          order={order}
                          saveButtonBarState={getMutationState(
                            updateMetadataOpts.called ||
                              updatePrivateMetadataOpts.called,
                            updateMetadataOpts.loading ||
                              updatePrivateMetadataOpts.loading,
                            [
                              ...(updateMetadataOpts.data?.deleteMetadata
                                .errors || []),
                              ...(updateMetadataOpts.data?.updateMetadata
                                .errors || []),
                              ...(updatePrivateMetadataOpts.data
                                ?.deletePrivateMetadata.errors || []),
                              ...(updatePrivateMetadataOpts.data
                                ?.updatePrivateMetadata.errors || [])
                            ]
                          )}
                          shippingMethods={maybe(
                            () => data.order.availableShippingMethods,
                            []
                          )}
                          userPermissions={user?.userPermissions || []}
                          onOrderCancel={() => openModal("cancel")}
                          onOrderFulfill={() => navigate(orderFulfillUrl(id))}
                          onParcelDetails={() => openModal("parcel")}
                          onFulfillmentCancel={fulfillmentId =>
                            navigate(
                              orderUrl(id, {
                                action: "cancel-fulfillment",
                                id: fulfillmentId
                              })
                            )
                          }
                          onFulfillmentTrackingNumberUpdate={fulfillmentId =>
                            navigate(
                              orderUrl(id, {
                                action: "edit-fulfillment",
                                id: fulfillmentId
                              })
                            )
                          }
                          onParcelLabelDownload={handleLabelDownloadOnButton}
                          onPaymentCapture={() => openModal("capture")}
                          onPaymentVoid={() => openModal("void")}
                          onPaymentRefund={() => openModal("refund")}
                          onProductClick={id => () => navigate(productUrl(id))}
                          onBillingAddressEdit={() =>
                            openModal("edit-billing-address")
                          }
                          onShippingAddressEdit={() =>
                            openModal("edit-shipping-address")
                          }
                          onPaymentPaid={() => openModal("mark-paid")}
                          onProfileView={() =>
                            navigate(customerUrl(order.user.id))
                          }
                          onInvoiceClick={id =>
                            window.open(
                              order.invoices.find(invoice => invoice.id === id)
                                ?.url,
                              "_blank"
                            )
                          }
                          onInvoiceGenerate={() =>
                            orderInvoiceRequest.mutate({
                              orderId: id
                            })
                          }
                          onInvoiceSend={id =>
                            openModal("invoice-send", { id })
                          }
                          onSubmit={handleSubmit}
                        />
                        <OrderCannotCancelOrderDialog
                          onClose={closeModal}
                          open={
                            params.action === "cancel" &&
                            order?.fulfillments.some(
                              fulfillment =>
                                fulfillment.status ===
                                FulfillmentStatus.FULFILLED
                            )
                          }
                        />
                        <OrderCancelDialog
                          confirmButtonState={orderCancel.opts.status}
                          errors={
                            orderCancel.opts.data?.orderCancel.errors || []
                          }
                          number={order?.number}
                          open={params.action === "cancel"}
                          onClose={closeModal}
                          onSubmit={() =>
                            orderCancel.mutate({
                              id
                            })
                          }
                        />
                        <OrderMarkAsPaidDialog
                          confirmButtonState={
                            orderPaymentMarkAsPaid.opts.status
                          }
                          errors={
                            orderPaymentMarkAsPaid.opts.data?.orderMarkAsPaid
                              .errors || []
                          }
                          onClose={closeModal}
                          onConfirm={() =>
                            orderPaymentMarkAsPaid.mutate({
                              id
                            })
                          }
                          open={params.action === "mark-paid"}
                        />
                        <OrderPaymentVoidDialog
                          confirmButtonState={orderVoid.opts.status}
                          errors={orderVoid.opts.data?.orderVoid.errors || []}
                          open={params.action === "void"}
                          onClose={closeModal}
                          onConfirm={() => orderVoid.mutate({ id })}
                        />
                        <OrderPaymentDialog
                          confirmButtonState={orderPaymentCapture.opts.status}
                          errors={
                            orderPaymentCapture.opts.data?.orderCapture
                              .errors || []
                          }
                          initial={order?.total.gross.amount}
                          open={params.action === "capture"}
                          variant="capture"
                          onClose={closeModal}
                          onSubmit={variables =>
                            orderPaymentCapture.mutate({
                              ...variables,
                              id
                            })
                          }
                        />
                        <OrderPaymentDialog
                          confirmButtonState={orderPaymentRefund.opts.status}
                          errors={
                            orderPaymentRefund.opts.data?.orderRefund.errors ||
                            []
                          }
                          initial={order?.total.gross.amount}
                          open={params.action === "refund"}
                          variant="refund"
                          onClose={closeModal}
                          onSubmit={variables =>
                            orderPaymentRefund.mutate({
                              ...variables,
                              id
                            })
                          }
                        />
                        <OrderParcelDetails
                          confirmButtonState={orderParcelDetails.opts.status}
                          errors={orderParcelDetails.opts.data?.errors || []}
                          initial={order?.total.gross.amount}
                          open={params.action === "parcel"}
                          variant="parcel"
                          onClose={closeModal}
                          orderDetails={order}
                          packageData={initialPackageData}
                          productWeight={order?.lines}
                          shopDetails={shop?.companyAddress}
                          onSubmit={handleDpdPackageCreateSubmit}
                        />
                        <OrderFulfillmentCancelDialog
                          confirmButtonState={
                            orderFulfillmentCancel.opts.status
                          }
                          errors={
                            orderFulfillmentCancel.opts.data
                              ?.orderFulfillmentCancel.errors || []
                          }
                          open={params.action === "cancel-fulfillment"}
                          warehouses={
                            warehouses.data?.warehouses.edges.map(
                              edge => edge.node
                            ) || []
                          }
                          onConfirm={variables =>
                            orderFulfillmentCancel.mutate({
                              id: params.id,
                              input: variables
                            })
                          }
                          onClose={closeModal}
                        />
                        <OrderFulfillmentTrackingDialog
                          confirmButtonState={
                            orderFulfillmentUpdateTracking.opts.status
                          }
                          errors={
                            orderFulfillmentUpdateTracking.opts.data
                              ?.orderFulfillmentUpdateTracking.errors || []
                          }
                          open={params.action === "edit-fulfillment"}
                          trackingNumber={getStringOrPlaceholder(
                            data?.order?.fulfillments.find(
                              fulfillment => fulfillment.id === params.id
                            )?.trackingNumber
                          )}
                          onConfirm={variables =>
                            orderFulfillmentUpdateTracking.mutate({
                              id: params.id,
                              input: {
                                ...variables,
                                notifyCustomer: true
                              }
                            })
                          }
                          onClose={closeModal}
                        />
                        <OrderInvoiceEmailSendDialog
                          confirmButtonState={orderInvoiceSend.opts.status}
                          errors={
                            orderInvoiceSend.opts.data?.invoiceSendEmail
                              .errors || []
                          }
                          open={params.action === "invoice-send"}
                          invoice={order?.invoices?.find(
                            invoice => invoice.id === params.id
                          )}
                          onClose={closeModal}
                          onSend={() =>
                            orderInvoiceSend.mutate({ id: params.id })
                          }
                        />
                      </>
                    ) : (
                      <>
                        <WindowTitle
                          title={intl.formatMessage(
                            {
                              defaultMessage: "Draft Order #{orderNumber}",
                              description: "window title"
                            },
                            {
                              orderNumber: getStringOrPlaceholder(
                                data?.order?.number
                              )
                            }
                          )}
                        />
                        <OrderDraftPage
                          disabled={loading}
                          onNoteAdd={variables =>
                            orderAddNote.mutate({
                              input: variables,
                              order: id
                            })
                          }
                          users={maybe(
                            () =>
                              users.data.search.edges.map(edge => edge.node),
                            []
                          )}
                          hasMore={maybe(
                            () => users.data.search.pageInfo.hasNextPage,
                            false
                          )}
                          onFetchMore={loadMoreCustomers}
                          fetchUsers={searchUsers}
                          loading={users.loading}
                          usersLoading={users.loading}
                          onCustomerEdit={data =>
                            orderDraftUpdate.mutate({
                              id,
                              input: data
                            })
                          }
                          onDraftFinalize={() =>
                            orderDraftFinalize.mutate({ id })
                          }
                          onDraftRemove={() => openModal("cancel")}
                          onOrderLineAdd={() => openModal("add-order-line")}
                          onBack={() => navigate(orderDraftListUrl())}
                          order={order}
                          countries={maybe(() => data.shop.countries, []).map(
                            country => ({
                              code: country.code,
                              label: country.country
                            })
                          )}
                          onProductClick={id => () =>
                            navigate(productUrl(encodeURIComponent(id)))}
                          onBillingAddressEdit={() =>
                            openModal("edit-billing-address")
                          }
                          onShippingAddressEdit={() =>
                            openModal("edit-shipping-address")
                          }
                          onShippingMethodEdit={() =>
                            openModal("edit-shipping")
                          }
                          onOrderLineRemove={id =>
                            orderLineDelete.mutate({ id })
                          }
                          onOrderLineChange={(id, data) =>
                            orderLineUpdate.mutate({
                              id,
                              input: data
                            })
                          }
                          saveButtonBarState="default"
                          onProfileView={() =>
                            navigate(customerUrl(order.user.id))
                          }
                          userPermissions={user?.userPermissions || []}
                        />
                        <OrderDraftCancelDialog
                          confirmButtonState={orderDraftCancel.opts.status}
                          errors={
                            orderDraftCancel.opts.data?.draftOrderDelete
                              .errors || []
                          }
                          onClose={closeModal}
                          onConfirm={() => orderDraftCancel.mutate({ id })}
                          open={params.action === "cancel"}
                          orderNumber={getStringOrPlaceholder(order?.number)}
                        />
                        <OrderShippingMethodEditDialog
                          confirmButtonState={
                            orderShippingMethodUpdate.opts.status
                          }
                          errors={
                            orderShippingMethodUpdate.opts.data
                              ?.orderUpdateShipping.errors || []
                          }
                          open={params.action === "edit-shipping"}
                          shippingMethod={order?.shippingMethod?.id}
                          shippingMethods={order?.availableShippingMethods}
                          onClose={closeModal}
                          onSubmit={variables =>
                            orderShippingMethodUpdate.mutate({
                              id,
                              input: {
                                shippingMethod: variables.shippingMethod
                              }
                            })
                          }
                        />
                        <OrderProductAddDialog
                          confirmButtonState={orderLinesAdd.opts.status}
                          errors={
                            orderLinesAdd.opts.data?.draftOrderLinesCreate
                              .errors || []
                          }
                          loading={variantSearchOpts.loading}
                          open={params.action === "add-order-line"}
                          hasMore={
                            variantSearchOpts.data?.search.pageInfo.hasNextPage
                          }
                          products={variantSearchOpts.data?.search.edges.map(
                            edge => edge.node
                          )}
                          onClose={closeModal}
                          onFetch={variantSearch}
                          onFetchMore={loadMore}
                          onSubmit={variants =>
                            orderLinesAdd.mutate({
                              id,
                              input: variants.map(variant => ({
                                quantity: 1,
                                variantId: variant.id
                              }))
                            })
                          }
                        />
                      </>
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
