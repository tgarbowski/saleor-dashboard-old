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
import Date from "@saleor/components/Date";
import ResponsiveTable from "@saleor/components/ResponsiveTable";
import Skeleton from "@saleor/components/Skeleton";
import { InvoiceFragment } from "@saleor/fragments/types/InvoiceFragment";
import { Button, makeStyles } from "@saleor/macaw-ui";
import classNames from "classnames";
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { buttonMessages } from "@saleor/intl";
import { OrderDetails_order } from "@saleor/orders/types/OrderDetails";
import { useMutation } from "@apollo/client";
import { ExtInvoiceCorrectionRequestMutation } from "@saleor/orders/extMutations/mutations";
import { invoiceRequestMutation } from "@saleor/orders/mutations";

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

export interface OrderInvoiceListProps {
  invoices: InvoiceFragment[];
  onInvoiceGenerate?: () => void;
  onInvoiceClick: (invoiceId: string) => void;
  onInvoiceSend: (invoiceId: string) => void;
  order?: OrderDetails_order;
  generating: boolean;
  setGenerating: (boolean) => void;
}

const OrderInvoiceList: React.FC<OrderInvoiceListProps> = props => {
  const {
    invoices,
    onInvoiceClick,
    onInvoiceSend,
    order,
    generating,
    setGenerating
  } = props;
  const classes = useStyles(props);

  const [correctionGenerate] = useMutation(ExtInvoiceCorrectionRequestMutation);
  const [invoiceRequest] = useMutation(invoiceRequestMutation);

  const [orderStatusError, setOrderStatusError] = useState<string>("");

  const intl = useIntl();

  const generatedInvoices = invoices?.filter(
    invoice => invoice.status === "SUCCESS"
  );

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

  const invoiceGenerateToolbar = !generatedInvoices?.length ? (
    invoiceRequest && (
      <Button
        onClick={() => {
          setGenerating(true);
          invoiceRequest({ variables: { orderId: order.id } }).then(
            response => {
              if (response.data.invoiceRequest.errors.length) {
                setOrderStatusError(
                  response.data.invoiceRequest.errors[0]?.message
                );
              }
            }
          );
        }}
        disabled={!!generatedInvoices?.length || generating}
      >
        <FormattedMessage
          defaultMessage="Generuj"
          description="generate invoice button"
        />
      </Button>
    )
  ) : (
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
        )
      }
    >
      <FormattedMessage
        defaultMessage="Generuj korektę"
        description="generate invoice button"
      />
    </Button>
  );

  return (
    <Card className={classes.card}>
      <CardTitle
        title={intl.formatMessage({
          defaultMessage: "Invoices",
          description: "section header"
        })}
        toolbar={invoiceGenerateToolbar}
      />
      <CardContent
        className={classNames({
          [classes.cardContentTable]: generatedInvoices?.length
        })}
      >
        {!generatedInvoices ? (
          <Skeleton />
        ) : !generatedInvoices?.length ? (
          <Typography color="textSecondary">
            <FormattedMessage defaultMessage="No invoices to be shown" />
          </Typography>
        ) : (
          <ResponsiveTable className={classes.invoicesTable}>
            <TableBody className={classes.invoicesTableBody}>
              {generatedInvoices.map(invoice => (
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
                      defaultMessage="Invoice"
                      description="invoice number prefix"
                    />
                    {invoice.number}
                    <Typography variant="caption">
                      <FormattedMessage
                        defaultMessage="created"
                        description="invoice create date prefix"
                      />
                      <Date date={invoice.createdAt} plain />
                    </Typography>
                  </TableCell>
                  {onInvoiceSend && (
                    <TableCell
                      className={classes.colAction}
                      onClick={() => onInvoiceSend(invoice.id)}
                    >
                      <Button>
                        <FormattedMessage {...buttonMessages.send} />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </ResponsiveTable>
        )}
      </CardContent>

      <Dialog open={!!orderStatusError}>
        <CardTitle title="Błąd" onClose={() => window.location.reload()} />
        <DialogContent>
          {!!orderStatusError && (
            <>
              <FormattedMessage defaultMessage="Zamówienie nie zostało zrealizowane" />
              <p>Error message: {orderStatusError}</p>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => window.location.reload()}>Dalej</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

OrderInvoiceList.displayName = "OrderInvoiceList";
export default OrderInvoiceList;
