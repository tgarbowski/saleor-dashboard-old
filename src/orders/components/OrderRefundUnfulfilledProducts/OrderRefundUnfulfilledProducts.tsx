import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@material-ui/core";
import CardTitle from "@saleor/components/CardTitle";
import Money from "@saleor/components/Money";
import Skeleton from "@saleor/components/Skeleton";
import { StatusBadge } from "@saleor/components/StatusBadge";
import TableCellAvatar from "@saleor/components/TableCellAvatar";
import { FormsetChange } from "@saleor/hooks/useFormset";
import { Button, makeStyles } from "@saleor/macaw-ui";
import { renderCollection } from "@saleor/misc";
import { OrderRefundData_order_lines } from "@saleor/orders/types/OrderRefundData";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { OrderRefundFormData } from "../OrderRefundPage/form";
import { messages } from "./messages";

const useStyles = makeStyles(
  theme => {
    const inputPadding = {
      paddingBottom: theme.spacing(2),
      paddingTop: theme.spacing(2)
    };

    return {
      cartContent: {
        paddingBottom: 0,
        paddingTop: 0
      },
      colQuantity: {
        textAlign: "right",
        width: 210
      },
      notice: {
        marginBottom: theme.spacing(1),
        marginTop: theme.spacing(2)
      },
      quantityInnerInput: {
        ...inputPadding
      },
      quantityInnerInputNoRemaining: {
        paddingRight: 0
      },
      remainingQuantity: {
        ...inputPadding,
        color: theme.palette.text.secondary,
        whiteSpace: "nowrap"
      },
      setMaximalQuantityButton: {
        marginTop: theme.spacing(1)
      }
    };
  },
  { name: "OrderRefundUnfulfilledProducts" }
);

interface OrderRefundUnfulfilledProductsProps {
  unfulfilledLines: OrderRefundData_order_lines[];
  data: OrderRefundFormData;
  disabled: boolean;
  onRefundedProductQuantityChange: FormsetChange<string>;
  onSetMaximalQuantities: () => void;
}

const OrderRefundUnfulfilledProducts: React.FC<OrderRefundUnfulfilledProductsProps> = props => {
  const {
    unfulfilledLines,
    data,
    disabled,
    onRefundedProductQuantityChange,
    onSetMaximalQuantities
  } = props;
  const classes = useStyles({});
  const intl = useIntl();

  return (
    <Card>
      <CardTitle
        title={intl.formatMessage({
          defaultMessage: "Unfulfilled Products",
          description: "section header"
        })}
      />
      <CardContent className={classes.cartContent}>
        <Typography
          variant="caption"
          color="textSecondary"
          className={classes.notice}
        >
          <FormattedMessage
            defaultMessage="Unfulfilled products will be restocked"
            description="section notice"
          />
        </Typography>
        <Button
          className={classes.setMaximalQuantityButton}
          onClick={onSetMaximalQuantities}
          data-test-id="set-maximal-quantity-unfulfilled-button"
        >
          <FormattedMessage
            defaultMessage="Set maximal quantities"
            description="button"
          />
        </Button>
      </CardContent>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <FormattedMessage
                defaultMessage="Product"
                description="tabel column header"
              />
            </TableCell>
            <TableCell>
              <FormattedMessage
                defaultMessage="SKU"
                description="table column header"
              />
            </TableCell>
            <TableCell>
              <FormattedMessage
                defaultMessage="Price"
                description="tabel column header"
              />
            </TableCell>
            <TableCell>
              <FormattedMessage
                defaultMessage="Refunded Qty"
                description="tabel column header"
              />
            </TableCell>
            <TableCell>
              <FormattedMessage
                defaultMessage="Total"
                description="tabel column header"
              />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {renderCollection(
            unfulfilledLines,
            line => {
              const selectedLineQuantity = data.refundedProductQuantities.find(
                refundedLine => refundedLine.id === line.id
              );
              const lineQuantity = line?.quantityToFulfill;
              const isError =
                Number(selectedLineQuantity?.value) > lineQuantity ||
                Number(selectedLineQuantity?.value) < 0;

              return (
                <TableRow key={line?.id}>
                  <TableCellAvatar
                    badge={
                      !line.variant && (
                        <StatusBadge
                          variant={"error"}
                          description={intl.formatMessage(
                            messages.unfulfilledVariantDeleted
                          )}
                        />
                      )
                    }
                    thumbnail={line?.thumbnail?.url}
                  >
                    {line?.productName ? line?.productName : <Skeleton />}
                  </TableCellAvatar>
                  <TableCell>{line?.productSku || <Skeleton />}</TableCell>
                  <TableCell>
                    {line?.unitPrice ? (
                      <Money money={line?.unitPrice.gross} />
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell className={classes.colQuantity}>
                    {lineQuantity || lineQuantity === 0 ? (
                      <TextField
                        disabled={disabled}
                        type="number"
                        inputProps={{
                          className: classes.quantityInnerInput,
                          "data-test-id": "quantity-input" + line?.id,
                          max: lineQuantity.toString(),
                          min: 0,
                          style: { textAlign: "right" }
                        }}
                        fullWidth
                        value={selectedLineQuantity?.value}
                        onChange={event =>
                          onRefundedProductQuantityChange(
                            line.id,
                            event.target.value
                          )
                        }
                        InputProps={{
                          endAdornment: lineQuantity && (
                            <div className={classes.remainingQuantity}>
                              / {lineQuantity}
                            </div>
                          )
                        }}
                        error={isError}
                        helperText={
                          isError &&
                          intl.formatMessage({
                            defaultMessage: "Improper value",
                            description: "error message"
                          })
                        }
                      />
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell>
                    {(line?.unitPrice.gross && (
                      <Money
                        money={{
                          ...line.unitPrice.gross,
                          amount:
                            (line.unitPrice.gross.amount ?? 0) *
                            Number(selectedLineQuantity?.value)
                        }}
                      />
                    )) || <Skeleton />}
                  </TableCell>
                </TableRow>
              );
            },
            () => (
              <TableRow>
                <TableCell colSpan={4}>
                  <FormattedMessage defaultMessage="No products found" />
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
OrderRefundUnfulfilledProducts.displayName = "OrderRefundUnfulfilledProducts";
export default OrderRefundUnfulfilledProducts;
