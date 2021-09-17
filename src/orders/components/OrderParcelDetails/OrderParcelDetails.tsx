import { Card, Checkbox, FormControlLabel } from "@material-ui/core";
import {
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import TableHead from "@material-ui/core/TableHead";
import TextField from "@material-ui/core/TextField";
import DeleteIcon from "@material-ui/icons/Delete";
import CardTitle from "@saleor/components/CardTitle";
import ConfirmButton, {
  ConfirmButtonTransitionState
} from "@saleor/components/ConfirmButton";
import Form from "@saleor/components/Form";
import { nameInputPrefix, nameSeparator } from "@saleor/components/Metadata";
import { OrderErrorFragment } from "@saleor/fragments/types/OrderErrorFragment";
import { buttonMessages } from "@saleor/intl";
import { OrderDetails_order } from "@saleor/orders/types/OrderDetails";
import { PackageData } from "@saleor/orders/views/OrderDetails";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

const useStyles = makeStyles(
  theme => {
    const colAction: React.CSSProperties = {
      textAlign: "right",
      width: 130
    };
    const colName: React.CSSProperties = {
      width: 220
    };

    return {
      card: {
        width: "40%"
      },
      colAction: {
        "&:last-child": {
          ...colAction,
          paddingRight: theme.spacing()
        }
      },
      colActionHeader: {
        ...colAction
      },
      colName: {
        ...colName,
        verticalAlign: "top"
      },
      colNameHeader: {
        ...colName
      },
      colValue: {},
      content: {
        paddingBottom: 0,
        paddingTop: theme.spacing()
      },
      dialog: {
        overflow: "scroll"
      },
      emptyContainer: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        paddingBottom: theme.spacing(4),
        paddingTop: theme.spacing(3),
        textAlign: "center"
      },
      emptyImage: {
        display: "block",
        marginBottom: theme.spacing(2)
      },
      generateRaport: {
        paddingLeft: theme.spacing()
      },
      input: {
        padding: theme.spacing(0.5, 2)
      },
      nameInput: {
        padding: `13px 16px`
      },
      overflow: {
        alignItems: "stretch",
        display: "flex",
        flexDirection: "row",
        gridGap: "20%",
        overflowY: "visible"
      },
      table: {
        tableLayout: "fixed"
      },
      togglable: {
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between"
      }
    };
  },
  {
    name: "OrderParcelDetails"
  }
);

export interface FormData {
  amount: number;
}

export interface OrderParcelDetailsProps {
  confirmButtonState: ConfirmButtonTransitionState;
  errors: OrderErrorFragment[];
  open: boolean;
  orderDetails: OrderDetails_order;
  initial: number;
  variant: "parcel";
  productWeight: any;
  shopDetails: any;
  packageData: PackageData[];
  onSubmit: (formData: PackageData[], generateLabel: boolean) => void;
  onClose: () => void;
}

const OrderParcelDetails: React.FC<OrderParcelDetailsProps> = props => {
  const {
    confirmButtonState,
    orderDetails,
    productWeight,
    shopDetails,
    packageData,
    onSubmit,
    open,
    onClose
  } = props;
  const classes = useStyles(props);

  const [state, setState] = React.useState({
    generateReport: false
  });

  const handleGenerateRaportChange = event => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const intl = useIntl();

  const autogenerateIndex = () => packageData.length;
  const onParcelAdd = () => {
    packageData.push({
      content: "Ubrania",
      fieldIndex: autogenerateIndex(),
      size1: "",
      size2: "",
      size3: "",
      weight: productWeight[0]?.variant?.product?.weight?.value
    });
    setState({ ...state });
  };

  const onParcelDelete = event => {
    packageData.splice(event, 1);
    setState({ ...state });
  };

  const onParcelChange = (index, value, inputType) => {
    packageData[index][inputType] = value;
  };

  return (
    <Dialog
      onClose={onClose}
      open={open}
      className={classes.dialog}
      maxWidth="md"
      fullWidth
    >
      <Form
        initial={orderDetails?.shippingAddress}
        onSubmit={() => onSubmit(packageData, state.generateReport)}
      >
        {() => (
          <>
            <DialogTitle>
              {intl.formatMessage({
                defaultMessage: "Dane dostawy",
                description: "dialog header"
              })}
            </DialogTitle>
            <DialogContent className={classes.overflow}>
              <Card className={classes.card}>
                <CardTitle title="Adres nadawcy" />
                <CardContent>
                  <>
                    {shopDetails?.companyName && (
                      <Typography>{shopDetails?.companyName}</Typography>
                    )}
                    <Typography>
                      {shopDetails?.firstName} {shopDetails?.lastName}
                    </Typography>
                    <Typography>
                      {shopDetails?.streetAddress1}
                      <br />
                      {shopDetails?.streetAddress2}
                    </Typography>
                    <Typography>
                      {shopDetails?.postalCode} {shopDetails?.city}
                      {shopDetails?.cityArea
                        ? ", " + shopDetails?.cityArea
                        : ""}
                    </Typography>
                    <Typography>
                      {shopDetails?.countryArea
                        ? shopDetails?.countryArea +
                          ", " +
                          shopDetails?.country.country
                        : shopDetails?.country.country}
                    </Typography>
                    <Typography>{shopDetails?.phone}</Typography>
                  </>
                </CardContent>
              </Card>
              <Card className={classes.card}>
                <CardTitle title="Adres wysyłki" />
                <CardContent>
                  <>
                    {orderDetails?.shippingAddress?.companyName && (
                      <Typography>
                        {orderDetails?.shippingAddress?.companyName}
                      </Typography>
                    )}
                    <Typography>
                      {orderDetails?.shippingAddress?.firstName}{" "}
                      {orderDetails?.shippingAddress?.lastName}
                    </Typography>
                    <Typography>
                      {orderDetails?.shippingAddress?.streetAddress1}
                      <br />
                      {orderDetails?.shippingAddress?.streetAddress2}
                    </Typography>
                    <Typography>
                      {orderDetails?.shippingAddress?.postalCode}{" "}
                      {orderDetails?.shippingAddress?.city}
                      {orderDetails?.shippingAddress?.cityArea
                        ? ", " + orderDetails?.shippingAddress?.cityArea
                        : ""}
                    </Typography>
                    <Typography>
                      {orderDetails?.shippingAddress?.countryArea
                        ? orderDetails?.shippingAddress?.countryArea +
                          ", " +
                          orderDetails?.shippingAddress?.country.country
                        : orderDetails?.shippingAddress?.country.country}
                    </Typography>
                    <Typography>
                      {orderDetails?.shippingAddress?.phone}
                    </Typography>
                  </>
                </CardContent>
              </Card>
            </DialogContent>
            <DialogTitle>
              {intl.formatMessage({
                defaultMessage: "Dane przesyłki",
                description: "dialog header"
              })}
            </DialogTitle>
            <DialogContent className={classes.overflow}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.colValue}>
                      <FormattedMessage
                        defaultMessage="Waga"
                        description="metadata field name, header"
                      />
                    </TableCell>
                    <TableCell className={classes.colValue}>
                      <FormattedMessage
                        defaultMessage="Zawartość"
                        description="metadata field value, header"
                      />
                    </TableCell>
                    <TableCell className={classes.colValue}>
                      <FormattedMessage
                        defaultMessage="Wymiar 1"
                        description="metadata field value, header"
                      />
                    </TableCell>
                    <TableCell className={classes.colValue}>
                      <FormattedMessage
                        defaultMessage="Wymiar 2"
                        description="metadata field value, header"
                      />
                    </TableCell>
                    <TableCell className={classes.colValue}>
                      <FormattedMessage
                        defaultMessage="Wymiar 3"
                        description="metadata field value, header"
                      />
                    </TableCell>
                    <TableCell className={classes.colActionHeader}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {packageData.map(element => (
                    <TableRow data-test="field" key={element.fieldIndex}>
                      <TableCell className={classes.colName}>
                        <TextField
                          InputProps={{
                            classes: {
                              input: classes.nameInput
                            }
                          }}
                          name={`${nameInputPrefix}${nameSeparator}${element.fieldIndex}`}
                          fullWidth
                          onChange={event =>
                            onParcelChange(
                              element.fieldIndex,
                              event.target.value,
                              "weight"
                            )
                          }
                          defaultValue={
                            productWeight[0]?.variant?.product?.weight?.value
                          }
                        />
                      </TableCell>
                      <TableCell className={classes.colName}>
                        <TextField
                          InputProps={{
                            classes: {
                              input: classes.nameInput
                            }
                          }}
                          name={`${nameInputPrefix}${nameSeparator}${element.fieldIndex}`}
                          fullWidth
                          onChange={event =>
                            onParcelChange(
                              element.fieldIndex,
                              event.target.value,
                              "content"
                            )
                          }
                          defaultValue={element.content}
                        />
                      </TableCell>
                      <TableCell className={classes.colName}>
                        <TextField
                          InputProps={{
                            classes: {
                              input: classes.nameInput
                            }
                          }}
                          name={`${nameInputPrefix}${nameSeparator}${element.fieldIndex}`}
                          fullWidth
                          onChange={event =>
                            onParcelChange(
                              element.fieldIndex,
                              event.target.value,
                              "size1"
                            )
                          }
                          defaultValue={element.size1}
                        />
                      </TableCell>
                      <TableCell className={classes.colName}>
                        <TextField
                          InputProps={{
                            classes: {
                              input: classes.nameInput
                            }
                          }}
                          name={`${nameInputPrefix}${nameSeparator}${element.fieldIndex}`}
                          fullWidth
                          onChange={event =>
                            onParcelChange(
                              element.fieldIndex,
                              event.target.value,
                              "size2"
                            )
                          }
                          defaultValue={element.size2}
                        />
                      </TableCell>
                      <TableCell className={classes.colName}>
                        <TextField
                          InputProps={{
                            classes: {
                              input: classes.nameInput
                            }
                          }}
                          name={`${nameInputPrefix}${nameSeparator}${element.fieldIndex}`}
                          fullWidth
                          onChange={event =>
                            onParcelChange(
                              element.fieldIndex,
                              event.target.value,
                              "size3"
                            )
                          }
                          defaultValue={element.size3}
                        />
                      </TableCell>
                      <TableCell className={classes.colAction}>
                        <IconButton
                          color="primary"
                          data-test="deleteField"
                          data-test-id={element.fieldIndex}
                          onClick={() => onParcelDelete(element.fieldIndex)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions>
              <FormControlLabel
                className={classes.generateRaport}
                control={
                  <Checkbox
                    checked={state.generateReport}
                    onChange={handleGenerateRaportChange}
                    name="generateReport"
                  />
                }
                label="Wygeneruj etykiete"
              />
              <Button
                color="primary"
                data-test="addField"
                onClick={onParcelAdd}
              >
                <FormattedMessage
                  defaultMessage="Dodaj paczke"
                  description="add parcel,button"
                />
              </Button>
              <Button onClick={onClose}>
                <FormattedMessage {...buttonMessages.back} />
              </Button>
              <ConfirmButton
                transitionState={confirmButtonState}
                color="primary"
                variant="contained"
                type="submit"
              >
                <FormattedMessage {...buttonMessages.confirm} />
              </ConfirmButton>
            </DialogActions>
          </>
        )}
      </Form>
    </Dialog>
  );
};
OrderParcelDetails.displayName = "OrderParcelDetails";
export default OrderParcelDetails;