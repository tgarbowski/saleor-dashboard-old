import { Box, Step, StepButton, Stepper } from "@material-ui/core";
import { OrderDetails_order } from "@saleor/orders/types/OrderDetails";
import React from "react";

import CardSpacer from "@saleor/components/CardSpacer";
import { OrderStatus } from "@saleor/types/globalTypes";

export interface OrderStepsProps {
  order: OrderDetails_order;
  setPrint: (boolean) => void;
  generating: boolean;
  setGenerating: (boolean) => void;
  onOrderFulfill: () => void;
  onParcelDetails: () => void;
  onInvoiceGenerate: () => void;
  isInvoiceRequired: boolean;
}

const steps = [
  "Zamówienie opłacone",
  "Zrealizuj zamówienie",
  "Wygeneruj i wydrukuj etykietę",
  "Wydrukuj paragon lub fakturę"
];

export const OrderSteps: React.FC<OrderStepsProps> = props => {
  const {
    order,
    setPrint,
    generating,
    setGenerating,
    onOrderFulfill,
    onParcelDetails,
    onInvoiceGenerate,
    isInvoiceRequired
  } = props;
  const completed = {
    0: order?.isPaid,
    1:
      order?.status === OrderStatus.FULFILLED ||
      order?.status === OrderStatus.PARTIALLY_FULFILLED,
    2: !!order?.fulfillments.length
      ? !!order?.fulfillments[0].trackingNumber
      : false,
    3: !!order?.invoices.length
  };

  const handleStep = (step: number) => () => {
    switch (step) {
      case 1:
        if (!completed[step]) {
          onOrderFulfill();
        }
        break;
      case 2:
        if (
          !!order?.fulfillments?.length &&
          !order?.fulfillments[0].trackingNumber
        )
          onParcelDetails();
        break;
      case 3:
        if (!order.invoices.length) {
          if (isInvoiceRequired && !generating) {
            setGenerating(true);
            onInvoiceGenerate();
          } else {
            setPrint(true);
          }
        }
        break;
    }
  };

  return (
    <div>
      <Box>
        <Stepper nonLinear activeStep={null} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={completed[index]}>
              <StepButton color="inherit" onClick={handleStep(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>
      <CardSpacer />
    </div>
  );
};
OrderSteps.displayName = "OrderSteps";
export default OrderSteps;
