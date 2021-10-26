import { Button, CardActions } from "@material-ui/core";
import { FulfillmentStatus } from "@saleor/types/globalTypes";
import React from "react";
import { FormattedMessage } from "react-intl";
import courierIcon from "@assets/images/courier.svg";
import SVG from "react-inlinesvg";
import { actionButtonsMessages } from "./messages";

interface AcionButtonsProps {
  classes: any;
  status: FulfillmentStatus;
  trackingNumber?: string;
  onParcelDetails();
  onParcelLabelDownload();
  onTrackingCodeAdd();
  onRefund();
}

const statusesToShow = [
  FulfillmentStatus.FULFILLED,
  FulfillmentStatus.RETURNED
];

const ActionButtons: React.FC<AcionButtonsProps> = ({
  classes,
  status,
  onTrackingCodeAdd,
  trackingNumber,
  onParcelDetails,
  onParcelLabelDownload,
  onRefund
}) => {
  const hasTrackingNumber = !!trackingNumber;

  if (!statusesToShow.includes(status)) {
    return null;
  }

  if (status === FulfillmentStatus.RETURNED) {
    return (
      <CardActions>
        <Button color="primary" onClick={onRefund}>
          <FormattedMessage
            defaultMessage="Refund"
            description="refund button"
          />
        </Button>
      </CardActions>
    );
  }

  return hasTrackingNumber ? (
    <CardActions>
      <Button color="primary" onClick={onParcelLabelDownload}>
        <FormattedMessage
          defaultMessage="Download tracking label"
          description="Download tracking label"
          id="generateLabel"
        />
      </Button>
      <Button color="primary" onClick={onTrackingCodeAdd}>
        <FormattedMessage
          defaultMessage="Edit tracking"
          description="edit tracking button"
        />
      </Button>
    </CardActions>
  ) : (
    <CardActions>
      <Button color="primary" onClick={onParcelDetails}>
        <SVG className={classes.menuIcon} src={courierIcon} />{" "}
        <FormattedMessage {...actionButtonsMessages.addTracking} />
      </Button>
    </CardActions>
  );
};

export default ActionButtons;
