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
import { AddressTypeInput } from "@saleor/customers/types";
import { OrderErrorFragment } from "@saleor/fragments/types/OrderErrorFragment";
import useAddressValidation from "@saleor/hooks/useAddressValidation";
import useStateFromProps from "@saleor/hooks/useStateFromProps";
import { buttonMessages } from "@saleor/intl";
import { maybe } from "@saleor/misc";
import { AddressInput } from "@saleor/types/globalTypes";
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
        overflowY: "visible",
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        gridGap: "20%"
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
  data: any;
  open: boolean;
  initial: number;
  variant: "parcel";
  onClose: () => void;
  onSubmit: (data: OrderParcelDetailsProps) => void;

  address: AddressTypeInput;
  countries?: Array<{
    code: string;
    label: string;
  }>;
  onConfirm(data: AddressInput);
}

const OrderParcelDetails: React.FC<OrderParcelDetailsProps> = props => {
  const {
    confirmButtonState,
    orderDetails,
    productWeight,
    shopDetails,
    packageData,
    open,
    errors = [],
    countries = [],
    onClose,
    onConfirm
  } = props;
  const classes = useStyles(props);

  const [state, setState] = React.useState({
    generateReport: false
  });

  const handleGenerateRaportChange = event => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const intl = useIntl();
  const [countryDisplayName, setCountryDisplayName] = useStateFromProps(
    maybe(
      () =>
        countries.find(
          country => orderDetails.billingAddress.country.code === country.code
        ).label
    )
  );

  //  const autogenerateIndex = () => packageData.length - 1;
  const onParcelAdd = () => {
    packageData.push({
      weight: "",
      size1: "",
      size2: "",
      size3: "",
      content: "Ubrania",
      fieldIndex: autogenerateIndex()
    });
    setState({ ...state });
  };

  const onParcelDelete = event => {
    console.log(event);
    packageData.splice(event, 1);
    console.log(packageData);
    setState({ ...state });
  };

  const {
    errors: validationErrors,
    submit: handleSubmit
  } = useAddressValidation(onConfirm);

  return (
    <Dialog
      onClose={onClose}
      open={open}
      className={classes.dialog}
      maxWidth="md"
      fullWidth
    >
      <Form initial={orderDetails?.billingAddress} onSubmit={handleSubmit}>
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
                    {shopDetails.companyName && (
                      <Typography>{shopDetails.companyName}</Typography>
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
                    {orderDetails?.billingAddress?.companyName && (
                      <Typography>
                        {orderDetails?.billingAddress?.companyName}
                      </Typography>
                    )}
                    <Typography>
                      {orderDetails?.billingAddress?.firstName}{" "}
                      {orderDetails?.billingAddress?.lastName}
                    </Typography>
                    <Typography>
                      {orderDetails?.billingAddress?.streetAddress1}
                      <br />
                      {orderDetails?.billingAddress?.streetAddress2}
                    </Typography>
                    <Typography>
                      {orderDetails?.billingAddress?.postalCode}{" "}
                      {orderDetails?.billingAddress?.city}
                      {orderDetails?.billingAddress?.cityArea
                        ? ", " + orderDetails?.billingAddress?.cityArea
                        : ""}
                    </Typography>
                    <Typography>
                      {orderDetails?.billingAddress?.countryArea
                        ? orderDetails?.billingAddress?.countryArea +
                          ", " +
                          orderDetails?.billingAddress?.country.country
                        : orderDetails?.billingAddress?.country.country}
                    </Typography>
                    <Typography>
                      {orderDetails?.billingAddress?.phone}
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
                          onChange={() => console.log("dupa")}
                          defaultValue={element.weight}
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
                          onChange={() => console.log("dupa")}
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
                          onChange={() => console.log("dupa")}
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
                          onChange={() => console.log("dupa")}
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
                          onChange={() => console.log("dupa")}
                          defaultValue={element.size3}
                        />
                      </TableCell>
                      <TableCell className={classes.colAction}>
                        <IconButton
                          color="primary"
                          data-test="deleteField"
                          data-test-id={1}
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
