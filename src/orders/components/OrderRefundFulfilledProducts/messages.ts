import { FulfillmentStatus } from "@saleor/types/globalTypes";
import { defineMessages, IntlShape } from "react-intl";

export const messages = defineMessages({
  fulfillment: {
    defaultMessage: "Realizacja",
    description: "section header"
  },
  fulfillmentReturned: {
    defaultMessage: "Realizacja zwrócona",
    description: "section header returned"
  },
  fulfillmentWaitingForApproval: {
    defaultMessage: "Realizacja czeka na zatwierdzenie",
    description: "section header returned"
  }
});

export const getTitle = (
  fulfillmentStatus: FulfillmentStatus,
  intl: IntlShape
) => {
  switch (fulfillmentStatus) {
    case FulfillmentStatus.RETURNED:
      return intl.formatMessage(messages.fulfillmentReturned);
    case FulfillmentStatus.WAITING_FOR_APPROVAL:
      return intl.formatMessage(messages.fulfillmentWaitingForApproval);
    default:
      return intl.formatMessage(messages.fulfillment);
  }
};
