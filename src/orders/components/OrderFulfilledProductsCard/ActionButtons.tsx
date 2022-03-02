import { CardActions } from "@material-ui/core";
import { Button } from "@saleor/macaw-ui";
import { FulfillmentStatus } from "@saleor/types/globalTypes";
import React from "react";
import { FormattedMessage } from "react-intl";
import courierIcon from "@assets/images/courier.svg";
import SVG from "react-inlinesvg";
import { actionButtonsMessages } from "./messages";

import useStyles from "./styles";

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
  status,
  onTrackingCodeAdd,
  trackingNumber,
  onParcelDetails,
  onParcelLabelDownload,
  onRefund
}) => {
  const classes = useStyles();

  const hasTrackingNumber = !!trackingNumber;

  if (!statusesToShow.includes(status)) {
    return null;
  }

  if (status === FulfillmentStatus.RETURNED) {
    return (
      <CardActions className={classes.actions}>
        <Button variant="primary" onClick={onRefund}>
          <FormattedMessage
            defaultMessage="Refund"
            description="refund button"
          />
        </Button>
      </CardActions>
    );
  }

  return hasTrackingNumber ? (
    <CardActions className={classes.actions}>
      <Button variant="primary" onClick={onParcelLabelDownload}>
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
    <CardActions className={classes.actions}>
      <Button variant="primary" onClick={onParcelDetails}>
        <SVG src={courierIcon} />{" "}
        <FormattedMessage {...actionButtonsMessages.addTracking} />
      </Button>
    </CardActions>
  );
};

export default ActionButtons;
