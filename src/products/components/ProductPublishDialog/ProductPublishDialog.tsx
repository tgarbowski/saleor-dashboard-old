import {
  Dialog,
  DialogContent,
  DialogContentText,
  Radio,
  RadioGroup,
  FormControlLabel
} from "@material-ui/core";
import { maybe } from "@saleor/misc";
import FormSpacer from "@saleor/components/FormSpacer";
import { buttonMessages } from "@saleor/intl";
import ConfirmButton from "@saleor/components/ConfirmButton";

import moment from "moment-timezone";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import plLocale from "date-fns/locale/pl";
import DateFnsUtils from "@date-io/date-fns";
import { FormattedMessage, useIntl } from "react-intl";
import React from "react";
import { DatePicker, DateTimePicker, MuiPickersUtilsProvider, TimePicker } from "@material-ui/pickers";

export interface ProductPublishDialogProps {
  onClose: any;
  params: any;
  filter: any;
  channel: any;
  selected: any;
  all: any;
  confirmButtonState: any;
  onSubmitFunction: any;
}

enum ProductPublishType {
  AUCTION = "AUCTION",
  BUY_NOW = "BUY_NOW"
}

export enum ProductPublishSelectType {
  PUBLISH_ALL = "PUBLISH_ALL",
  PUBLISH_SELECTED = "PUBLISH_SELECTED",
  UNPUBLISH_SELECTED = "UNPUBLISH_SELECTED",
  UNPUBLISH_ALL = "UNPUBLISH_ALL"
}

const ProductPublishDialog: React.FC<ProductPublishDialogProps> = props => {
  const { onClose, params, filter, channel, selected, all, confirmButtonState, onSubmitFunction } = props;
  const intl = useIntl();

  const [auctionTypeVal, auctionTypeSetValue] = React.useState(
    ProductPublishType.AUCTION
  );
  const auctionTypeHandleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    auctionTypeSetValue(
      ProductPublishType[(event.target as HTMLInputElement).value]
    );
  };

  const [publishSelectTypeVal, publishSelectTypeSetValue] = React.useState(
    ProductPublishSelectType.PUBLISH_SELECTED
  );
  const publishSelectTypeHandleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    publishSelectTypeSetValue(
      ProductPublishSelectType[(event.target as HTMLInputElement).value]
    );
  };

  const [auctionDate, auctionHandleDateChange] = React.useState(null);
  const [auctionStartDate, auctionHandleStartDateChange] = React.useState(null);
  const [auctionEndDate, auctionHandleEndDateChange] = React.useState(null);
  const [auctionHour, auctionHandleHourChange] = React.useState(null);


  return (
    <Dialog
        open={params.action === "publish"}
        onClose={onClose}
        title={intl.formatMessage({
          defaultMessage: "Publish Products",
          description: "dialog header"
        })}
    >
        <DialogContent>
          <DialogContentText>
            <FormattedMessage
              defaultMessage="{counter,plural,one{Parametry publikacji produktu} other{Parametry publikacji {displayQuantity} produktów}}"
              description="dialog content"
              values={{
                counter: maybe(() => params.ids.length),
                displayQuantity: (
                  <strong>{maybe(() => params.ids.length)}</strong>
                )
              }}
            />
          </DialogContentText>
          <FormSpacer />
          <RadioGroup
            row
            aria-label="Typ aukcji"
            name="auction_type"
            value={auctionTypeVal}
            onChange={auctionTypeHandleChange}
          >
            <FormControlLabel
              value={ProductPublishType.AUCTION}
              control={<Radio color="primary" />}
              label="Aukcja"
            />
            <FormControlLabel
              value={ProductPublishType.BUY_NOW}
              control={<Radio color="primary" />}
              label="Kup teraz"
            />
          </RadioGroup>
          <RadioGroup
            row
            aria-label="Selected or all"
            name="selected_or_all"
            value={publishSelectTypeVal}
            onChange={publishSelectTypeHandleChange}
          >
            <FormControlLabel
              value={ProductPublishSelectType.PUBLISH_SELECTED}
              control={<Radio color="primary" />}
              label={`Zaznaczone: (${selected})`}
            />
            <FormControlLabel
              value={ProductPublishSelectType.PUBLISH_ALL}
              control={<Radio color="primary" />}
              label={`Wszystkie: (${all})`}
            />
          </RadioGroup>
          <FormSpacer />
          {publishSelectTypeVal === ProductPublishSelectType.PUBLISH_SELECTED && (
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={plLocale}>
            <DateTimePicker
              label="Data i godzina publikacji"
              format="yyyy-MM-dd HH:mm"
              ampm={false}
              disabled={auctionTypeVal !== ProductPublishType.AUCTION}
              value={auctionDate}
              onChange={auctionHandleDateChange}
            />
          </MuiPickersUtilsProvider>
          )}
          {publishSelectTypeVal === ProductPublishSelectType.PUBLISH_ALL && (
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={plLocale}>
            <DatePicker
              label="Data publikacji start"
              format="yyyy-MM-dd"
              disabled={auctionTypeVal !== ProductPublishType.AUCTION}
              value={auctionStartDate}
              onChange={auctionHandleStartDateChange}
            />
            <DatePicker
              label="Data publikacji koniec"
              format="yyyy-MM-dd"
              disabled={auctionTypeVal !== ProductPublishType.AUCTION}
              value={auctionEndDate}
              onChange={auctionHandleEndDateChange}
            />
            <TimePicker
              label="Godzina publikacji"
              format="HH:mm"
              ampm={false}
              disabled={auctionTypeVal !== ProductPublishType.AUCTION}
              value={auctionHour}
              onChange={auctionHandleHourChange}
            />
          </MuiPickersUtilsProvider>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            <FormattedMessage {...buttonMessages.back} />
          </Button>
          <ConfirmButton
            transitionState={confirmButtonState}
            color="primary"
            onClick={() =>
              onSubmitFunction({
                variables: {
                  ids: params.ids,
                  isPublished: true,
                  offerType: auctionTypeVal,
                  startingAt: auctionDate ? moment(auctionDate).format("YYYY-MM-DD HH:mm") : '',
                  startingAtDate: auctionStartDate ? moment(auctionStartDate).format("YYYY-MM-DD") : '',
                  endingAtDate: auctionEndDate ? moment(auctionEndDate).format("YYYY-MM-DD") : '',
                  publishHour: auctionHour ? moment(auctionHour).format("HH:mm") : '',
                  filter,
                  channel,
                  mode: publishSelectTypeVal
                }
              })
            }
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </ConfirmButton>
        </DialogActions>
      </Dialog>
  );
};
ProductPublishDialog.displayName = "ProductPublishDialog";
export default ProductPublishDialog;
