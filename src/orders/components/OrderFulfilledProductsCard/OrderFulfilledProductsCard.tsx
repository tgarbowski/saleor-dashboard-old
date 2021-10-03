import { Card, IconButton, TableBody } from "@material-ui/core";
import CardSpacer from "@saleor/components/CardSpacer";
import ResponsiveTable from "@saleor/components/ResponsiveTable";
import TrashIcon from "@saleor/icons/Trash";
import { makeStyles } from "@saleor/macaw-ui";
import { mergeRepeatedOrderLines } from "@saleor/orders/utils/data";
import React from "react";

import { renderCollection } from "../../../misc";
import { FulfillmentStatus } from "../../../types/globalTypes";
import {
  OrderDetails_order,
  OrderDetails_order_fulfillments
} from "../../types/OrderDetails";
import TableHeader from "../OrderProductsCardElements/OrderProductsCardHeader";
import TableLine from "../OrderProductsCardElements/OrderProductsTableRow";
import CardTitle from "../OrderReturnPage/OrderReturnRefundItemsCard/CardTitle";
import ActionButtons from "./ActionButtons";
import ExtraInfoLines from "./ExtraInfoLines";

interface OrderFulfilledProductsCardProps {
  fulfillment: OrderDetails_order_fulfillments;
  fulfillmentAllowUnpaid: boolean;
  order?: OrderDetails_order;
  onOrderFulfillmentApprove: () => void;
  onOrderFulfillmentCancel: () => void;
  onTrackingCodeAdd: () => void;
  onParcelLabelDownload: () => void;
  onParcelDetails: () => void;
  onRefund: () => void;
}

const statusesToMergeLines = [
  FulfillmentStatus.REFUNDED,
  FulfillmentStatus.REFUNDED_AND_RETURNED,
  FulfillmentStatus.RETURNED,
  FulfillmentStatus.REPLACED
];
const cancelableStatuses = [
  FulfillmentStatus.FULFILLED,
  FulfillmentStatus.WAITING_FOR_APPROVAL
];

const OrderFulfilledProductsCard: React.FC<OrderFulfilledProductsCardProps> = props => {
  const {
    fulfillment,
    fulfillmentAllowUnpaid,
    order,
    onOrderFulfillmentApprove,
    onOrderFulfillmentCancel,
    onTrackingCodeAdd,
    onParcelDetails,
    onParcelLabelDownload,
    onRefund
  } = props;
  const classes = makeStyles(
    theme => ({
      menuIcon: {
        "& svg": {
          fill: theme.palette.primary.main,
          height: 25,
          width: 25
        },
        display: "inline-block",
        position: "relative",
        right: 8
      },
      table: {
        tableLayout: "fixed"
      },
      deleteIcon: {
        height: 40,
        paddingRight: 0,
        paddingLeft: theme.spacing(1),
        width: 40
      }
    }),
    { name: "OrderFulfillment" }
  );

  if (!fulfillment) {
    return null;
  }

  const getLines = () => {
    if (statusesToMergeLines.includes(fulfillment?.status)) {
      return mergeRepeatedOrderLines(fulfillment.lines);
    }

    return fulfillment?.lines || [];
  };

  return (
    <>
      <Card>
        <CardTitle
          withStatus
          lines={fulfillment?.lines}
          fulfillmentOrder={fulfillment?.fulfillmentOrder}
          status={fulfillment?.status}
          warehouseName={fulfillment?.warehouse?.name}
          orderNumber={order?.number}
          toolbar={
            cancelableStatuses.includes(fulfillment?.status) && (
              <IconButton
                className={classes.deleteIcon}
                onClick={onOrderFulfillmentCancel}
                data-test-id="cancelFulfillmentButton"
              >
                <TrashIcon />
              </IconButton>
            )
          }
        />
        <ResponsiveTable className={classes.table}>
          <TableHeader />
          <TableBody>
            {renderCollection(getLines(), line => (
              <TableLine line={line} />
            ))}
          </TableBody>
          <ExtraInfoLines fulfillment={fulfillment} />
        </ResponsiveTable>
        <ActionButtons
          classes={classes}
          status={fulfillment?.status}
          trackingNumber={fulfillment?.trackingNumber}
          orderIsPaid={order?.isPaid}
          fulfillmentAllowUnpaid={fulfillmentAllowUnpaid}
          onTrackingCodeAdd={onTrackingCodeAdd}
          onParcelDetails={onParcelDetails}
          onParcelLabelDownload={onParcelLabelDownload}
          onRefund={onRefund}
          onApprove={onOrderFulfillmentApprove}
        />
      </Card>
      <CardSpacer />
    </>
  );
};

export default OrderFulfilledProductsCard;
