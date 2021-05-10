import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import CardTitle from "@saleor/components/CardTitle";
import Grid from "@saleor/components/Grid";
import { ProductErrorFragment } from "@saleor/fragments/types/ProductErrorFragment";
import React from "react";
import { useIntl } from "react-intl";
import { FormChange } from "@saleor/hooks/useForm";
import {errors} from "@saleor/categories/fixtures";
import { getFormErrors, getProductErrorMessage } from "@saleor/utils/errors";

interface ProductMegaPackProps {
  data: [];
  disabled: boolean;
  errors: ProductErrorFragment[];
  onChange: FormChange;
}

const ProductMegaPack: React.FC<ProductMegaPackProps> = props => {
  const { data, disabled, onChange, errors } = props;
  const intl = useIntl();
  const handleChange = onChange;

  const formErrors = getFormErrors(["sku"], errors);

  return (
    <Card>
      <CardTitle
        title={intl.formatMessage({
          defaultMessage: "Dodaj produkty do Mega Paki",
          description: "mega pack creation"
        })}
      />
      <CardContent>
        <Grid variant="default">
          <TextField
            disabled={disabled}
            label={intl.formatMessage({
              defaultMessage: "Lista produktów",
              description: "add item"
            })}
            name="megaPackProduct"
            onChange={handleChange}
            InputProps={{
              inputProps: {
                min: 0
              }
            }}
            multiline
            rowsMax = "10"
            value={data.megaPackProduct}
            error={formErrors.sku}
          />
        </Grid>
      </CardContent>
    </Card>
  );
};
ProductMegaPack.displayName = "ProductMegaPack";
export default ProductMegaPack;
