import { Typography } from "@material-ui/core";
import Money from "@saleor/components/Money";
import { TimelineEvent } from "@saleor/components/Timeline";
import { makeStyles } from "@saleor/macaw-ui";
import { OrderEventsEnum } from "@saleor/types/globalTypes";
import camelCase from "lodash/camelCase";
import React from "react";
import { defineMessages, useIntl } from "react-intl";

import { OrderDetails_order_events } from "../../types/OrderDetails";
import ExtendedDiscountTimelineEvent from "./ExtendedDiscountTimelineEvent";
import Label from "./Label";
import {
  getEmployeeNameLink,
  getOrderNumberLink,
  hasOrderLineDiscountWithNoPreviousValue,
  isTimelineEventOfDiscountType
} from "./utils";

const useStyles = makeStyles(
  theme => ({
    eventSubtitle: {
      marginBottom: theme.spacing(0.5),
      marginTop: theme.spacing(1)
    },
    header: {
      fontWeight: 500,
      marginBottom: theme.spacing(1)
    },
    linesTableCell: {
      paddingRight: theme.spacing(3)
    },
    root: { marginTop: theme.spacing(4) },
    topSpacer: {
      marginTop: theme.spacing(3)
    },
    user: {
      marginBottom: theme.spacing(1)
    }
  }),
  { name: "OrderHistory" }
);

export const productTitles = defineMessages({
  draftCreatedFromReplace: {
    defaultMessage: "Wymienione produkty",
    description: "draft created from replace products list title",
    id: "event products title draft reissued"
  },
  fulfillmentRefunded: {
    defaultMessage: "Produkty refundowane",
    description: "refunded products list title",
    id: "event products list title refunded"
  },
  fulfillmentReplaced: {
    defaultMessage: "Wymienione produkty",
    description: "replaced products list title",
    id: "event products list title replaced"
  },
  fulfillmentReturned: {
    defaultMessage: "Zwrócone produkty",
    description: "returned products list title",
    id: "event products list title returned"
  }
});

export const titles = defineMessages({
  draftCreatedFromReplace: {
    defaultMessage: "Projekt został ponownie wydany z polecenia ",
    description: "draft created from replace event title",
    id: "event title draft reissued"
  },
  fulfillmentRefunded: {
    defaultMessage: "Produkty zostały zwrócone przez ",
    description: "refunded event title",
    id: "event title refunded"
  },
  fulfillmentReplaced: {
    defaultMessage: "Produkty zostały zastąpione przez ",
    description: "replaced event title",
    id: "event title replaced"
  },
  fulfillmentReturned: {
    defaultMessage: "Produkty zostały zwrócone przez",
    description: "returned event title",
    id: "event title returned"
  },
  orderDiscountAdded: {
    defaultMessage: "Zamówienie zostało przecenione o",
    description: "order was discounted event title",
    id: "event title order discounted"
  },
  orderDiscountAutomaticallyUpdated: {
    defaultMessage: "Rabat na zamówienie został zaktualizowany automatycznie",
    description: "order discount was updated automatically event title",
    id: "event title order discount auto updated"
  },
  orderDiscountUpdated: {
    defaultMessage: "Rabat na zamówienie został zaktualizowany przez",
    description: "order discount was updated event title",
    id: "event title order discount updated"
  },
  orderLineDiscountAdded: {
    defaultMessage: "{productName} zniżka została dodana przez ",
    description: "order line discount added title",
    id: "event title order line discount added"
  },
  orderLineDiscountUpdated: {
    defaultMessage: "{productName} rabat został zaktualizowany przez ",
    description: "order line discount updated title",
    id: "event title order line discount updated"
  },
  orderMarkedAsPaid: {
    defaultMessage: "Zamówienie zostało oznaczone jako opłacone przez",
    description: "order marked as paid event title",
    id: "event title marked as paid"
  }
});

export const messages = defineMessages({
  by: {
    defaultMessage: "przez",
    description: "by preposition",
    id: "by preposition"
  },
  refundedAmount: {
    defaultMessage: "Kwota refundowana",
    description: "amount title",
    id: "amount title"
  },
  refundedShipment: {
    defaultMessage: "Przesyłka została zwrócona",
    description: "shipment refund title",
    id: "shipment refund title"
  },
  transactionReference: {
    defaultMessage: "Odniesienie do transakcji",
    description: "transaction reference subtitle",
    id: "transaction reference subtitle"
  }
});

interface ExtendedTimelineEventProps {
  event: OrderDetails_order_events;
  orderCurrency: string;
}

const ExtendedTimelineEvent: React.FC<ExtendedTimelineEventProps> = ({
  event,
  orderCurrency
}) => {
  const {
    id,
    date,
    type,
    lines,
    amount,
    transactionReference,
    shippingCostsIncluded
  } = event;
  const classes = useStyles({});
  const intl = useIntl();

  const eventTypeInCamelCase = camelCase(type);

  const getEventTitleMessageInCamelCase = () => {
    if (hasOrderLineDiscountWithNoPreviousValue(event)) {
      return titles.orderLineDiscountAdded;
    }

    return titles[eventTypeInCamelCase];
  };

  const getTitleProps = () => {
    if (type === OrderEventsEnum.ORDER_LINE_DISCOUNT_UPDATED) {
      return { productName: lines[0]?.itemName };
    }

    return {};
  };

  const titleElements = {
    by: { text: intl.formatMessage(messages.by) },
    employeeName: getEmployeeNameLink(event),
    orderNumber: getOrderNumberLink(event),
    title: {
      text: intl.formatMessage(
        getEventTitleMessageInCamelCase(),
        getTitleProps()
      )
    }
  };

  const selectTitleElements = () => {
    const { title, by, employeeName, orderNumber } = titleElements;

    switch (type) {
      case OrderEventsEnum.DRAFT_CREATED_FROM_REPLACE: {
        return [title, orderNumber, by, employeeName];
      }
      case OrderEventsEnum.ORDER_DISCOUNT_AUTOMATICALLY_UPDATED: {
        return [title];
      }
      default: {
        return [title, employeeName];
      }
    }
  };

  if (isTimelineEventOfDiscountType(type)) {
    return (
      <ExtendedDiscountTimelineEvent
        event={event}
        titleElements={selectTitleElements()}
      />
    );
  }

  return (
    <TimelineEvent date={date} titleElements={selectTitleElements()} key={id}>
      {lines && (
        <>
          <Label
            text={intl.formatMessage(productTitles[eventTypeInCamelCase])}
          />
          <table>
            <tbody>
              {lines.map(({ orderLine, quantity, itemName }, i) => (
                <tr key={`${itemName}-${i}`}>
                  <td className={classes.linesTableCell}>
                    {orderLine?.productName || itemName}
                  </td>
                  <td className={classes.linesTableCell}>
                    <Label text={orderLine?.variantName} />
                  </td>
                  <td className={classes.linesTableCell}>
                    <Label text={`qty: ${quantity}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(amount || amount === 0) && (
            <>
              <Label text={intl.formatMessage(messages.refundedAmount)} />
              <Money
                money={{
                  amount,
                  currency: orderCurrency
                }}
              />
            </>
          )}
          {shippingCostsIncluded && (
            <Typography>
              {intl.formatMessage(messages.refundedShipment)}
            </Typography>
          )}
        </>
      )}

      {!!transactionReference && (
        <>
          <Label text={intl.formatMessage(messages.transactionReference)} />
          <Typography>{transactionReference}</Typography>
        </>
      )}
    </TimelineEvent>
  );
};

export default ExtendedTimelineEvent;
