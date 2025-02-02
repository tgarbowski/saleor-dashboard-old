import { CardActions, Typography } from "@material-ui/core";
import { buttonMessages, commonMessages } from "@saleor/intl";
import { Button } from "@saleor/macaw-ui";
import { FulfillmentStatus } from "@saleor/types/globalTypes";
import React from "react";
import { FormattedMessage } from "react-intl";
import courierIcon from "@assets/images/courier.svg";
import SVG from "react-inlinesvg";

import { actionButtonsMessages } from "./messages";
import useStyles from "./styles";

interface AcionButtonsProps {
  status: FulfillmentStatus;
  trackingNumber?: string;
  orderIsPaid?: boolean;
  fulfillmentAllowUnpaid: boolean;
  classes: any;
  printing?: boolean;
  onParcelDetails();
  onParcelLabelDownload();
  onTrackingCodeAdd();
  onRefund();
  onApprove();
}

const statusesToShow = [
  FulfillmentStatus.FULFILLED,
  FulfillmentStatus.RETURNED,
  FulfillmentStatus.WAITING_FOR_APPROVAL
];

const ActionButtons: React.FC<AcionButtonsProps> = ({
  status,
  trackingNumber,
  printing,
  onParcelDetails,
  onParcelLabelDownload,
  onRefund,
  orderIsPaid,
  fulfillmentAllowUnpaid,
  onTrackingCodeAdd,
  onApprove
}) => {
  const classes = useStyles();

  const hasTrackingNumber = !!trackingNumber;

  if (!statusesToShow.includes(status)) {
    return null;
  }

  if (status === FulfillmentStatus.WAITING_FOR_APPROVAL) {
    const cannotFulfill = !orderIsPaid && !fulfillmentAllowUnpaid;

    return (
      <CardActions className={classes.actions}>
        <Button color="primary" onClick={onApprove} disabled={cannotFulfill}>
          <FormattedMessage {...buttonMessages.approve} />
        </Button>
        {cannotFulfill && (
          <Typography color="error" variant="caption">
            <FormattedMessage {...commonMessages.cannotFullfillUnpaidOrder} />
          </Typography>
        )}
      </CardActions>
    );
  }

  if (status === FulfillmentStatus.RETURNED) {
    return (
      <CardActions>
        <Button variant="primary" onClick={onRefund}>
          <FormattedMessage {...actionButtonsMessages.refund} />
        </Button>
      </CardActions>
    );
  }

  return hasTrackingNumber ? (
    <CardActions className={classes.actions}>
      <Button
        variant="primary"
        onClick={onParcelLabelDownload}
        disabled={printing}
      >
        {printing ? (
          <FormattedMessage defaultMessage="Drukowanie" />
        ) : (
          <FormattedMessage
            defaultMessage="Download tracking label"
            description="Download tracking label"
            id="generateLabel"
          />
        )}
      </Button>
      <Button variant="primary" onClick={onTrackingCodeAdd}>
        <FormattedMessage {...actionButtonsMessages.editTracking} />
      </Button>
    </CardActions>
  ) : (
    <CardActions className={classes.actions}>
      <Button variant="primary" onClick={onParcelDetails} disabled={printing}>
        {printing ? (
          <FormattedMessage defaultMessage="Drukowanie" />
        ) : (
          <FormattedMessage {...actionButtonsMessages.parcelDetails} />
        )}
        <SVG src={courierIcon} className={classes.courierImg} />
      </Button>
      <Button variant="primary" onClick={onTrackingCodeAdd}>
        <FormattedMessage {...actionButtonsMessages.addTracking} />
      </Button>
    </CardActions>
  );
};

export default ActionButtons;
