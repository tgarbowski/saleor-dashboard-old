import { Card, CardContent } from "@material-ui/core";
import CardTitle from "@saleor/components/CardTitle";
import { OrderDetails_order } from "@saleor/orders/types/OrderDetails";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

export interface OrderReceiptCardProps {
  order: OrderDetails_order;
}

export const OrderReceiptCard: React.FC<OrderReceiptCardProps> = ({
  order
}) => {
  const intl = useIntl();

  return (
    <Card>
      <CardTitle
        title={intl.formatMessage({
          defaultMessage: "Paragon",
          description: "section header"
        })}
        toolbar={
          <button
            onClick={() => {
              const lines = [];
              const summary = {
                to: order.undiscountedTotal.gross.amount * 100
              };

              order.lines.forEach(line => {
                const newLine = {
                  na: line.productName,
                  il: line.quantity,
                  vt: 0,
                  pr: line.unitPrice.gross.amount * 100
                };
                lines.push(newLine);
              });
              const shippingPrice = {
                na: "TRANSPORT Usługa transportowa",
                il: 1.0,
                vt: 0,
                pr: order.shippingPrice.gross.amount * 100
              };
              lines.push(shippingPrice);

              const http = new XMLHttpRequest();
              const url = "http://localhost:3050/paragon";
              const params = {
                lines,
                summary
              };

              //      TEST DRUKOWANIA FAKTURY
              // var url = "http://localhost:3050/faktura";
              // var params = {
              //   lines: [
              //     { na: "Towar 1", il: 1.0, vt: 0, pr: 2350 },
              //     { na: "Towar 2", il: 1.0, vt: 0, pr: 1150 }
              //   ],
              //   header: {
              //     nb: "56/2020",
              //     ni: "584-222-98-89",
              //     na: ["Nazwa firmy", "ul. Miejska 56", "88-888 Miasto"],
              //     pd: "2020-02-15",
              //     pt: "Visa ... ... 0456"
              //   },
              //   summary: {
              //     to: 3500
              //   }
              // };

              http.open("POST", url, true);
              http.setRequestHeader("Content-type", "application/json");
              http.send(JSON.stringify(params));
            }}
          >
            <FormattedMessage
              defaultMessage="Generuj"
              description="generate invoice button"
            />
          </button>
        }
      />
      <CardContent></CardContent>
    </Card>
  );
};
OrderReceiptCard.displayName = "OrderReceiptCard";
export default OrderReceiptCard;
