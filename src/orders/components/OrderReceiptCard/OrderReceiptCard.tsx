import { Card, CardContent } from "@material-ui/core";
import CardTitle from "@saleor/components/CardTitle";
import { OrderDetails_order } from "@saleor/orders/types/OrderDetails";
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useMetadataUpdate } from "@saleor/utils/metadata/updateMetadata";
import { Button } from "@saleor/macaw-ui";

export interface OrderReceiptCardProps {
  order: OrderDetails_order;
}

export const OrderReceiptCard: React.FC<OrderReceiptCardProps> = ({
  order
}) => {
  const [printing, setPrinting] = useState(false);
  const [receiptNo, setReceiptNo] = useState(null);

  useEffect(() => {
    let receiptNumber = null;
    order.metadata.forEach(metadata => {
      if (metadata.key === "receipt_no") {
        receiptNumber = metadata.value;
        return;
      }
    });
    setReceiptNo(receiptNumber);
  }, [order.metadata]);

  const intl = useIntl();
  const [updateMetadata] = useMetadataUpdate({});

  const generateInvoice = () => {
    setPrinting(true);
    if (!receiptNo) {
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
      http.open("POST", url, true);
      http.setRequestHeader("Content-type", "application/json");

      http.onreadystatechange = function() {
        if (http.readyState === 4 && http.status === 200) {
          const variables = {
            id: order.id,
            input: [
              {
                key: "receipt_no",
                value: http.responseText.match(/"bn":"(\d+)"/)[1]
              }
            ],
            keysToDelete: []
          };
          updateMetadata({ variables });
          setPrinting(false);
        } else if (http.readyState === 4 && http.status !== 200) {
          setPrinting(false);
        }
      };
      http.send(JSON.stringify(params));
    } else {
      const http = new XMLHttpRequest();
      const url = "http://127.0.0.1:3050/command";
      const params = [
        {
          cmd: "ecprndoc",
          params: `sd,0\nty,0\nfn,${receiptNo}\ntn,${receiptNo}`
        }
      ];
      http.open("POST", url, true);

      http.setRequestHeader("Content-type", "application/json");

      http.onreadystatechange = function() {
        if (http.readyState === 4 && http.status === 200) {
          setPrinting(false);
        } else if (http.readyState === 4 && http.status !== 200) {
          setPrinting(false);
        }
      };
      http.send(JSON.stringify(params));
    }
  };

  const formattedMessage = receiptNo ? (
    <FormattedMessage
      defaultMessage="Drukuj (kopia)"
      description="generate invoice button"
    />
  ) : (
    <FormattedMessage
      defaultMessage="Drukuj"
      description="generate invoice button"
    />
  );

  return (
    <Card>
      <CardTitle
        title={intl.formatMessage({
          defaultMessage: "Paragon",
          description: "section header"
        })}
        toolbar={
          <Button onClick={generateInvoice} disabled={printing}>
            {formattedMessage}
          </Button>
        }
      />
      <CardContent></CardContent>
    </Card>
  );
};
OrderReceiptCard.displayName = "OrderReceiptCard";
export default OrderReceiptCard;
