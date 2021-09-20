import { Card, TableBody } from "@material-ui/core";
import CardMenu from "@saleor/components/CardMenu";
import CardSpacer from "@saleor/components/CardSpacer";
import ResponsiveTable from "@saleor/components/ResponsiveTable";
import { makeStyles } from "@saleor/macaw-ui";
import { mergeRepeatedOrderLines } from "@saleor/orders/utils/data";
import React from "react";
import { useIntl } from "react-intl";

import { maybe, renderCollection } from "../../../misc";
import { FulfillmentStatus } from "../../../types/globalTypes";
import { OrderDetails_order_fulfillments } from "../../types/OrderDetails";
import TableHeader from "../OrderProductsCardElements/OrderProductsCardHeader";
import TableLine from "../OrderProductsCardElements/OrderProductsTableRow";
import CardTitle from "../OrderReturnPage/OrderReturnRefundItemsCard/CardTitle";
import ActionButtons from "./ActionButtons";
import ExtraInfoLines from "./ExtraInfoLines";

const useStyles = makeStyles(
  () => ({
    table: {
      tableLayout: "fixed"
    }
  }),
  { name: "OrderFulfillment" }
);

interface OrderFulfilledProductsCardProps {
  fulfillment: OrderDetails_order_fulfillments;
  orderNumber?: string;
  onOrderFulfillmentCancel: () => void;
  onTrackingCodeAdd: () => void;
  onParcelLabelDownload: () => void;
  onParcelDetails: () => void;
  onRefund: () => void;
}

const OrderFulfilledProductsCard: React.FC<OrderFulfilledProductsCardProps> = props => {
  const {
    fulfillment,
    orderNumber,
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
      }
    }),
    { name: "OrderFulfillment" }
  );

  const intl = useIntl();

  if (!fulfillment) {
    return null;
  }

  const getLines = () => {
    const statusesToMergeLines = [
      FulfillmentStatus.REFUNDED,
      FulfillmentStatus.REFUNDED_AND_RETURNED,
      FulfillmentStatus.RETURNED,
      FulfillmentStatus.REPLACED
    ];

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
          orderNumber={orderNumber}
          toolbar={
            maybe(() => fulfillment.status) === FulfillmentStatus.FULFILLED && (
              <CardMenu
                menuItems={[
                  {
                    label: intl.formatMessage({
                      defaultMessage: "Cancel Fulfillment",
                      description: "button"
                    }),
                    onSelect: onOrderFulfillmentCancel,
                    testId: "cancelFulfillmentButton"
                  }
                ]}
              />
            )
          }
        />
        <ResponsiveTable className={classes.table}>
          <TableHeader />
          <TableBody>
            {renderCollection(getLines(), line => (
              <TableLine line={line} isFulfilled={true} />
            ))}
          </TableBody>
          <ExtraInfoLines fulfillment={fulfillment} />
        </ResponsiveTable>
        <ActionButtons
          classes={classes}
          status={fulfillment?.status}
          trackingNumber={fulfillment?.trackingNumber}
          onTrackingCodeAdd={onTrackingCodeAdd}
          onParcelDetails={onParcelDetails}
          onParcelLabelDownload={onParcelLabelDownload}
          onRefund={onRefund}
        />
      </Card>
      <CardSpacer />
    </>
  );
};

export default OrderFulfilledProductsCard;
