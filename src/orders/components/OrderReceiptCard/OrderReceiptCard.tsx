import { Card, Dialog, DialogActions, DialogContent } from "@material-ui/core";
import CardTitle from "@saleor/components/CardTitle";
import { OrderDetails_order } from "@saleor/orders/types/OrderDetails";
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@saleor/macaw-ui";
import { usePluginDetails } from "@saleor/plugins/queries";
import { useMutation } from "@apollo/client";
import {
  ExtReceiptRequestMutation,
  ExtReceiptUpdateMutation
} from "../../extMutations/mutations";

export interface OrderReceiptCardProps {
  order: OrderDetails_order;
}

export const OrderReceiptCard: React.FC<OrderReceiptCardProps> = ({
  order
}) => {
  const [printing, setPrinting] = useState(false);
  const [pluginError, setPluginError] = useState(false);
  const [printserverError, setPrintserverError] = useState(false);
  const [orderStatusError, setOrderStatusError] = useState(false);

  const id = "printservers";
  const intl = useIntl();
  const { data: pluginData } = usePluginDetails({
    displayLoader: true,
    variables: { id }
  });
  const [receiptRequest] = useMutation(ExtReceiptRequestMutation);
  const [receiptUpdate] = useMutation(ExtReceiptUpdateMutation);

  const printReceipt = () => {
    setPrinting(true);
    if (pluginData) {
      const serverUrl =
        pluginData.plugin.globalConfiguration.configuration[1].value;
      const http = new XMLHttpRequest();
      if (!order.invoices.length) {
        const url = `${serverUrl}/paragon`;
        http.onerror = () => {
          setPrintserverError(true);
        };
        http.open("POST", url, true);
        http.setRequestHeader("Content-type", "application/json");
        receiptRequest({ variables: { orderId: order.id } }).then(response => {
          if (response.data.extReceiptRequest.errors.length) {
            setOrderStatusError(true);
            setPrinting(false);
          } else {
            const params = response.data.extReceiptRequest.payload;
            const invoiceId = response.data.extReceiptRequest.invoice.id;

            http.onreadystatechange = function() {
              if (http.readyState === 4 && http.status === 200) {
                receiptUpdate({
                  variables: {
                    id: invoiceId,
                    input: {
                      receiptNumber: http.responseText.match(/"bn":"(\d+)"/)[1],
                      metadata: {
                        hn: http.responseText.match(/"hn":"(\d+)"/)[1]
                      }
                    }
                  }
                });
                setPrinting(false);
              } else if (http.readyState === 4 && http.status !== 200) {
                setPrinting(false);
              }
            };
            http.send(JSON.stringify(params));
          }
        });
      } else {
        const url = `${serverUrl}/command`;
        http.onerror = () => {
          setPrintserverError(true);
        };
        http.open("POST", url, true);
        http.setRequestHeader("Content-type", "application/json");
        const invoiceNumber = order.invoices[0].number;
        const params = [
          {
            cmd: "ecprndoc",
            params: `sd,0\nty,0\nfn,${invoiceNumber}\ntn,${invoiceNumber}`
          }
        ];
        http.onreadystatechange = function() {
          if (http.readyState === 4 && http.status === 200) {
            setPrinting(false);
          } else if (http.readyState === 4 && http.status !== 200) {
            setPrinting(false);
          }
        };
        http.send(JSON.stringify(params));
      }
    } else {
      setPluginError(true);
      setPrinting(false);
    }
  };

  const closeDialog = () => {
    setPluginError(false);
    setPrintserverError(false);
    setOrderStatusError(false);
  };

  const formattedMessage = !order.invoices.length ? (
    <FormattedMessage
      defaultMessage="Drukuj"
      description="generate invoice button"
    />
  ) : (
    <FormattedMessage
      defaultMessage="Drukuj (kopia)"
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
          <Button onClick={printReceipt} disabled={printing}>
            {formattedMessage}
          </Button>
        }
      />
      <Dialog open={pluginError || printserverError || orderStatusError}>
        <CardTitle title="Błąd" onClose={closeDialog} />
        <DialogContent>
          {pluginError && (
            <FormattedMessage defaultMessage="Błąd pluginu Printservers" />
          )}
          {printserverError && (
            <FormattedMessage defaultMessage="Błąd serwera wydruku" />
          )}
          {orderStatusError && (
            <FormattedMessage defaultMessage="Zamówienie nie zostało zrealizowane" />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Dalej</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
OrderReceiptCard.displayName = "OrderReceiptCard";
export default OrderReceiptCard;
