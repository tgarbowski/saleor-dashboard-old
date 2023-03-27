import {
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from "@material-ui/core";
import CardTitle from "@saleor/components/CardTitle";
import { OrderDetails_order } from "@saleor/orders/types/OrderDetails";
import React, { useState } from "react";
import classNames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import Date from "@saleor/components/Date";
import { buttonMessages } from "@saleor/intl";
import { Button, ResponsiveTable, makeStyles } from "@saleor/macaw-ui";
import { usePluginDetails } from "@saleor/plugins/queries";
import { useMutation } from "@apollo/client";
import {
  ExtInvoiceCorrectionRequestMutation,
  ExtReceiptRequestMutation,
  ExtReceiptUpdateMutation
} from "../../extMutations/mutations";
import { Skeleton } from "@material-ui/lab";
import { DeleteIcon, IconButton } from "@saleor/macaw-ui";
import { useInvoiceDeleteMutation } from "@saleor/orders/mutations";

const useStyles = makeStyles(
  () => ({
    card: {
      overflow: "hidden"
    },
    cardContentTable: {
      "&:last-child": {
        padding: 0
      },
      padding: 0
    },
    colAction: {
      button: {
        padding: "0"
      },
      padding: "0 0.5rem",
      width: "auto"
    },
    colActionSecond: {
      button: {
        padding: "0"
      },
      padding: "0 24px 0 0.5rem",
      width: "auto"
    },
    smallIconButton: {
      padding: "2px 6px"
    },
    colNumber: { width: "100%" },
    colNumberClickable: {
      cursor: "pointer",
      width: "100%"
    },
    invoicesTable: {
      display: "flex"
    },
    invoicesTableBody: {
      width: "100%"
    }
  }),
  { name: "OrderInvoiceList" }
);

export interface OrderReceiptCardProps {
  order: OrderDetails_order;
  onInvoiceClick: (invoiceId: string) => void;
  onInvoiceSend: (invoiceId: string) => void;
  print: boolean;
  setPrint: (boolean) => void;
}

export const OrderReceiptCard: React.FC<OrderReceiptCardProps> = props => {
  const { order, onInvoiceClick, onInvoiceSend, print, setPrint } = props;
  const [printing, setPrinting] = useState(false);
  const [pluginError, setPluginError] = useState(false);
  const [printserverError, setPrintserverError] = useState(false);
  const [orderStatusError, setOrderStatusError] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const classes = useStyles(props);

  const id = "printservers";
  const intl = useIntl();
  const { data: pluginData } = usePluginDetails({
    displayLoader: true,
    variables: { id }
  });
  const [receiptRequest] = useMutation(ExtReceiptRequestMutation);
  const [receiptUpdate] = useMutation(ExtReceiptUpdateMutation);
  const [correctionGenerate] = useMutation(ExtInvoiceCorrectionRequestMutation);

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
            setOrderStatusError(
              response.data.extReceiptRequest.errors[0]?.message
            );
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
        const invoiceDate = order.invoices[0].createdAt.split("T");
        const params = [
          {
            cmd: "ecprndoc",
            params: `sd,0\nty,0\nfn,${invoiceNumber}\ntn,${invoiceNumber}\nfd,${invoiceDate[0]};00:00\ntd,${invoiceDate[0]};23:59`
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

  const onCorrectionGenerate = () => {
    correctionGenerate({
      variables: {
        orderId: order.id
      }
    }).then(() => {
      setGenerating(false);
      window.location.reload();
    });
  };

  const [invoiceDelete] = useInvoiceDeleteMutation({
    onCompleted: data => {
      window.location.reload();
      return data;
    }
  });

  const onInvoiceDelete = async (id: string) => {
    invoiceDelete({
      variables: {
        id
      }
    }).then(() => window.location.reload());
  };

  const closeDialog = () => {
    window.location.reload();
  };

  if (print) {
    if (!printing) {
      printReceipt();
    }
    setPrint(false);
  }

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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Button
              onClick={printReceipt}
              disabled={printing || order.invoices[0]?.number === null}
            >
              {formattedMessage}
            </Button>
            {!!order.invoices.length && (
              <Button
                onClick={() => {
                  setGenerating(true);
                  onCorrectionGenerate();
                }}
                disabled={
                  generating ||
                  !(
                    order.status === "RETURNED" ||
                    order.status === "PARTIALLY_RETURNED" ||
                    order.paymentStatus === "PARTIALLY_REFUNDED"
                  ) ||
                  !order.invoices[0]?.number
                }
                style={{ marginTop: "5px" }}
              >
                <FormattedMessage
                  defaultMessage="Generuj korektę"
                  description="generate invoice button"
                />
              </Button>
            )}
          </div>
        }
      />
      <CardContent
        className={classNames({
          [classes.cardContentTable]: order.invoices?.length
        })}
      >
        {!order.invoices ? (
          <Skeleton />
        ) : !order.invoices?.length ? (
          <Typography color="textSecondary">
            <FormattedMessage defaultMessage="No invoices to be shown" />
          </Typography>
        ) : (
          <ResponsiveTable className={classes.invoicesTable}>
            <TableBody className={classes.invoicesTableBody}>
              {order.invoices.map(invoice => (
                <TableRow key={invoice.id} hover={!!invoice}>
                  <TableCell
                    className={
                      onInvoiceClick
                        ? classes.colNumberClickable
                        : classes.colNumber
                    }
                    onClick={() => onInvoiceClick(invoice.id)}
                  >
                    <FormattedMessage
                      defaultMessage="Invoice "
                      description="invoice number prefix"
                    />
                    {invoice.number}
                    <Typography variant="caption">
                      <FormattedMessage
                        defaultMessage="created"
                        description="invoice create date prefix"
                      />
                    </Typography>
                    <Date date={invoice.createdAt} plain />
                  </TableCell>
                  {onInvoiceSend && !!invoice.url && (
                    <TableCell
                      className={classes.colAction}
                      onClick={() => onInvoiceSend(invoice.id)}
                    >
                      <Button>
                        <FormattedMessage {...buttonMessages.send} />
                      </Button>
                    </TableCell>
                  )}
                  {!invoice.number && (
                    <TableCell className={classes.colActionSecond}>
                      <IconButton
                        onClick={() => onInvoiceDelete(invoice.id)}
                        className={classes.smallIconButton}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </ResponsiveTable>
        )}
      </CardContent>
      <Dialog open={pluginError || printserverError || !!orderStatusError}>
        <CardTitle title="Błąd" onClose={closeDialog} />
        <DialogContent>
          {pluginError && (
            <FormattedMessage defaultMessage="Błąd pluginu Printservers" />
          )}
          {printserverError && (
            <FormattedMessage defaultMessage="Błąd serwera wydruku, odśwież stronę" />
          )}
          {!!orderStatusError && (
            <>
              <FormattedMessage defaultMessage="Zamówienie nie zostało zrealizowane" />
              <p>Error message: {orderStatusError}</p>
            </>
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
