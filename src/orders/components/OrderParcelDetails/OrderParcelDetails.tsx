import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import CardActions from "@material-ui/core/CardActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import ConfirmButton, {ConfirmButtonTransitionState} from "@saleor/components/ConfirmButton";
import {makeStyles} from "@material-ui/core/styles";
import Form from "@saleor/components/Form";
import {OrderErrorFragment} from "@saleor/fragments/types/OrderErrorFragment";
import {buttonMessages} from "@saleor/intl";
import React from "react";
import {FormattedMessage, useIntl} from "react-intl";
import createSingleAutocompleteSelectHandler from "@saleor/utils/handlers/singleAutocompleteSelectChangeHandler";
import AddressEdit from "@saleor/components/AddressEdit";
import {AddressTypeInput} from "@saleor/customers/types";
import {AddressInput} from "@saleor/types/globalTypes";
import useStateFromProps from "@saleor/hooks/useStateFromProps";
import {maybe} from "@saleor/misc";
import useAddressValidation from "@saleor/hooks/useAddressValidation";
import useModalDialogErrors from "@saleor/hooks/useModalDialogErrors";
import {EventDataAction} from "@saleor/components/Metadata";

const useStyles = makeStyles(
    {
        overflow: {
            overflowY: "visible"
        }
    },
    { name: "OrderAddressEditDialog" }
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
        open,
        errors = [],
        countries = [],
        onClose,
        onConfirm
    } = props;
    const classes = useStyles(props);
    const intl = useIntl();
    const [countryDisplayName, setCountryDisplayName] = useStateFromProps(
        maybe(
            () => countries.find(country => orderDetails.billingAddress.country.code === country.code).label
        )
    );
    const {
        errors: validationErrors,
        submit: handleSubmit
    } = useAddressValidation(onConfirm);
    const dialogErrors = useModalDialogErrors(
        [...errors, ...validationErrors],
        open
    );

    const countryChoices = countries.map(country => ({
        label: country.label,
        value: country.code
    }));

    return (
        <Dialog onClose={onClose} open={open} classes={{ paper: classes.overflow }}>
            <Form initial={orderDetails?.billingAddress} onSubmit={handleSubmit}>
                {({ change, data}) => {
                    const handleCountrySelect = createSingleAutocompleteSelectHandler(
                        change,
                        setCountryDisplayName,
                        countryChoices
                    );


                    return (
                        <>
                            <DialogTitle>
                                { intl.formatMessage({
                                        defaultMessage: "Dane odbiorcy",
                                        description: "dialog header"
                                    })
                                   }
                            </DialogTitle>
                            <DialogContent className={classes.overflow}>
                                <AddressEdit
                                    countries={countryChoices}
                                    countryDisplayValue={countryDisplayName}
                                    data={data}
                                    errors={dialogErrors}
                                    onChange={change}
                                    onCountryChange={handleCountrySelect}
                                />
                            </DialogContent>
                            <DialogTitle>
                                { intl.formatMessage({
                                    defaultMessage: "Dane przesyłki",
                                    description: "dialog header"
                                })
                                }
                            </DialogTitle>
                            <DialogContent className={classes.overflow}>

                                <div>
                                    <TextField
                                        label={"Ilość paczek"}
                                        defaultValue="1"
                                    />

                                    <TextField style={{marginLeft: '18px'} }
                                        label={"Waga"}
                                        defaultValue={productWeight}
                                    />
                                </div>
                                <div>
                                    <TextField style={{marginTop: '25px'}}
                                        label={"Zawartość"}
                                        defaultValue="ubrania"
                                    />
                                </div>

                            </DialogContent>
                            <DialogActions>
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
                    );
                }}
            </Form>
        </Dialog>
    );
};
OrderParcelDetails.displayName = "OrderParcelDetails";
export default OrderParcelDetails;
