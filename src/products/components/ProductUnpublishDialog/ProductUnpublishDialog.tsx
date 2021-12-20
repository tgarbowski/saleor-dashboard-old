import {
  DialogContentText,
  Radio,
  RadioGroup,
  FormControlLabel
} from "@material-ui/core";
import FormSpacer from "@saleor/components/FormSpacer";
import ActionDialog from "@saleor/components/ActionDialog";
import {
  ProductPublishDialogProps,
  ProductPublishSelectType
} from "@saleor/products/components/ProductPublishDialog";
import { FormattedMessage, useIntl } from "react-intl";
import React from "react";

  
const ProductUnpublishDialog: React.FC<ProductPublishDialogProps> = props => {
  const { onClose, params, filter, channel, selected, all, confirmButtonState, onSubmitFunction } = props;
  const intl = useIntl();

  const [publishSelectTypeVal, publishSelectTypeSetValue] = React.useState(
    ProductPublishSelectType.UNPUBLISH_SELECTED
  );
  const publishSelectTypeHandleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    publishSelectTypeSetValue(
      ProductPublishSelectType[(event.target as HTMLInputElement).value]
    );
  };

  const currentCounter =
    publishSelectTypeVal === ProductPublishSelectType.UNPUBLISH_SELECTED
      ? selected
      : all;

  return (
    <ActionDialog
      open={params.action === "unpublish"}
      confirmButtonState={confirmButtonState}
      onClose={onClose}
      title={intl.formatMessage({
        defaultMessage: "Unpublish Products",
        description: "dialog header"
      })}
      onConfirm={() =>
        onSubmitFunction({
          variables: {
            ids: params.ids,
            isPublished: false,
            channel: channel,
            filter: filter,
            offerType: "",
            startingAt: "",
            startingAtDate: "",
            endingAtDate: "",
            publishHour: "",
            mode: publishSelectTypeVal
          }
        })
      }
    >
      <RadioGroup
        row
        aria-label="Selected or all"
        name="selected_or_all"
        value={publishSelectTypeVal}
        onChange={publishSelectTypeHandleChange}
      >
        <FormControlLabel
          value={ProductPublishSelectType.UNPUBLISH_SELECTED}
          control={<Radio color="primary" />}
          label={`Zaznaczone: (${selected})`}
        />
        <FormControlLabel
          value={ProductPublishSelectType.UNPUBLISH_ALL}
          control={<Radio color="primary" />}
          label={`Wszystkie: (${all})`}
        />
      </RadioGroup>
      <FormSpacer/>
      <DialogContentText>
        <FormattedMessage
          defaultMessage="Are you sure you want to unpublish {displayQuantity} products?"
          description="dialog content"
          values={{
            displayQuantity: <strong>{currentCounter}</strong>
          }}
        />
      </DialogContentText>
    </ActionDialog>
    );
  };
  ProductUnpublishDialog.displayName = "ProductUnpublishDialog";
  export default ProductUnpublishDialog;
  