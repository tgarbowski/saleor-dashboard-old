import {
  Card,
  Checkbox,
  FormControlLabel,
  InputAdornment
} from "@material-ui/core";
import {
  CardContent,
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
import CardTitle from "@saleor/components/CardTitle";
import ConfirmButton from "@saleor/components/ConfirmButton";
import { ConfirmButtonTransitionState } from "@saleor/macaw-ui";
import Form from "@saleor/components/Form";
import { nameInputPrefix, nameSeparator } from "@saleor/components/Metadata";
import { OrderErrorFragment } from "@saleor/fragments/types/OrderErrorFragment";
import { buttonMessages } from "@saleor/intl";
import { OrderDetails_order } from "@saleor/orders/types/OrderDetails";
import { PackageData } from "@saleor/shipping/handlers";
import React, { useState } from "react";
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
      defaultDimensionsContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        marginTop: "32px",
        marginBottom: "32px"
      },
      defaultDimensionsButton: {
        border: "1px solid #056DFF",
        padding: "13px 35px",
        fontSize: "1.6rem",
        minWidth: "64px",
        boxSizing: "border-box",
        lineHeight: "1.55",
        borderRadius: "4px",
        letterSpacing: "0.02rem",
        textTransform: "none",
        color: "#FFFFFF",
        backgroundColor: "#FFCC07",
        cursor: "pointer"
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
    shopDetails,
    packageData,
    onSubmit,
    open,
    onClose
  } = props;
  const classes = useStyles(props);

  const [dimentions, setDimentions] = useState({
    firstDimension: "",
    secondDimension: "",
    thirdDimension: ""
  });

  const [weight, setWeight] = useState({
    weightKg: ""
  });

  const DefaultDimentions = [
    {
      firstDimension: "38",
      secondDimension: "64",
      thirdDimension: "8"
    },
    {
      firstDimension: "38",
      secondDimension: "64",
      thirdDimension: "19"
    },
    {
      firstDimension: "38",
      secondDimension: "64",
      thirdDimension: "41"
    }
  ];

  const [state, setState] = useState({
    generateReport: false
  });

  const handleGenerateRaportChange = event => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const intl = useIntl();

  const onParcelChange = (index, value, inputType) => {
    packageData[index][inputType] = parseFloat(value);
  };

  const onWeightChange = (index, value, inputType) => {
    packageData[index][inputType] = parseFloat(value);
  };

  const getDimension = e => {
    e.preventDefault();
    const index = e.target.value;
    const dim = DefaultDimentions[index];
    setDimentions({
      firstDimension: dim.firstDimension,
      secondDimension: dim.secondDimension,
      thirdDimension: dim.thirdDimension
    });

    onParcelChange(packageData[0].fieldIndex, dim.firstDimension, "size1");
    onParcelChange(packageData[0].fieldIndex, dim.secondDimension, "size2");
    onParcelChange(packageData[0].fieldIndex, dim.thirdDimension, "size3");
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
        onSubmit={() => {
          onSubmit(packageData, state.generateReport);
          setDimentions({
            firstDimension: "",
            secondDimension: "",
            thirdDimension: ""
          });
        }}
        style={{ overflowY: "auto" }}
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
            <div className={classes.defaultDimensionsContainer}>
              <button
                id="getDimensionsA"
                onClick={e => getDimension(e)}
                className={classes.defaultDimensionsButton}
                value={0}
              >
                A - 38 x 64 x 8
              </button>
              <button
                id="getDimensionsB"
                onClick={e => getDimension(e)}
                className={classes.defaultDimensionsButton}
                value={1}
              >
                B - 38 x 64 x 19
              </button>
              <button
                id="getDimensionsC"
                onClick={e => getDimension(e)}
                className={classes.defaultDimensionsButton}
                value={2}
              >
                C - 38 x 64 x 41
              </button>
            </div>
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
                        defaultMessage="Długość"
                        description="metadata field value, header"
                      />
                    </TableCell>
                    <TableCell className={classes.colValue}>
                      <FormattedMessage
                        defaultMessage="Szerokość"
                        description="metadata field value, header"
                      />
                    </TableCell>
                    <TableCell className={classes.colValue}>
                      <FormattedMessage
                        defaultMessage="Wysokość"
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
                            endAdornment: (
                              <InputAdornment position="end">kg</InputAdornment>
                            ),
                            classes: {
                              input: classes.nameInput
                            }
                          }}
                          name={`${nameInputPrefix}${nameSeparator}${element.fieldIndex}`}
                          fullWidth
                          onChange={event => {
                            const value = event.target.value;
                            setWeight(prevWeight => ({
                              ...prevWeight,
                              weightKg: value
                            }));
                            onWeightChange(element.fieldIndex, value, "weight");
                          }}
                          value={weight.weightKg}
                        />
                      </TableCell>
                      <TableCell className={classes.colName}>
                        <TextField
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">cm</InputAdornment>
                            ),
                            classes: {
                              input: classes.nameInput
                            }
                          }}
                          name={`${nameInputPrefix}${nameSeparator}${element.fieldIndex}`}
                          fullWidth
                          onChange={event => {
                            const value = event.target.value;
                            setDimentions(prevDimentions => ({
                              ...prevDimentions,
                              firstDimension: value
                            }));
                            onParcelChange(element.fieldIndex, value, "size1");
                          }}
                          defaultValue={element.size1}
                          value={dimentions.firstDimension}
                        />
                      </TableCell>
                      <TableCell className={classes.colName}>
                        <TextField
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">cm</InputAdornment>
                            ),
                            classes: {
                              input: classes.nameInput
                            }
                          }}
                          name={`${nameInputPrefix}${nameSeparator}${element.fieldIndex}`}
                          fullWidth
                          onChange={event => {
                            const value = event.target.value;
                            setDimentions(prevDimentions => ({
                              ...prevDimentions,
                              secondDimension: value
                            }));
                            onParcelChange(element.fieldIndex, value, "size2");
                          }}
                          defaultValue={element.size2}
                          value={dimentions.secondDimension}
                        />
                      </TableCell>
                      <TableCell className={classes.colName}>
                        <TextField
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">cm</InputAdornment>
                            ),
                            classes: {
                              input: classes.nameInput
                            }
                          }}
                          name={`${nameInputPrefix}${nameSeparator}${element.fieldIndex}`}
                          fullWidth
                          onChange={event => {
                            const value = event.target.value;
                            setDimentions(prevDimentions => ({
                              ...prevDimentions,
                              thirdDimension: value
                            }));
                            onParcelChange(element.fieldIndex, value, "size3");
                          }}
                          defaultValue={element.size3}
                          value={dimentions.thirdDimension}
                        />
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
              <Button onClick={onClose}>
                <FormattedMessage {...buttonMessages.back} />
              </Button>
              <ConfirmButton
                transitionState={confirmButtonState}
                color="primary"
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
