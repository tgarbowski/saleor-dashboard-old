import { Card, CardContent } from "@material-ui/core";
import CardTitle from "@saleor/components/CardTitle";
import { OrderDetails_order } from "@saleor/orders/types/OrderDetails";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useMetadataUpdate } from "@saleor/utils/metadata/updateMetadata";

export interface OrderReceiptCardProps {
  order: OrderDetails_order;
}

export const OrderReceiptCard: React.FC<OrderReceiptCardProps> = ({
  order
}) => {
  const intl = useIntl();
  const [updateMetadata] = useMetadataUpdate({});

  const generateInvoice = () => {
    console.log(order.metadata);
    let receiptNumber = null;
    order.metadata.forEach(metadata => {
      if (metadata.key === "receipt_id") {
        receiptNumber = metadata.value;
        return;
      }
    });
    console.log(receiptNumber);
    if (!receiptNumber) {
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

      http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 200) {
          console.log(http.responseText.match(/"bn":"(\d+)"/)[1]);
          const variables = {
            id: order.id,
            input: [
              {
                key: "receipt_id",
                value: http.responseText.match(/"bn":"(\d+)"/)[1]
              }
            ],
            keysToDelete: []
          };
          updateMetadata({ variables });
        }
      };
      http.send(JSON.stringify(params));
    } else {
      const http = new XMLHttpRequest();
      const url = "http://127.0.0.1:3050/command";
      const params = [
        {
          cmd: "ecprndoc",
          params: `sd,0\nty,0\nfn,${receiptNumber}\ntn,${receiptNumber}`
        }
      ];
      http.open("POST", url, true);

      http.setRequestHeader("Content-type", "application/json");

      http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 200) {
          console.log(http.responseText);
        }
      };
      http.send(JSON.stringify(params));
    }
  };

  return (
    <Card>
      <CardTitle
        title={intl.formatMessage({
          defaultMessage: "Paragon",
          description: "section header"
        })}
        toolbar={
          <button onClick={generateInvoice}>
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
