import {
  Button,
  DialogActions,
  TableContainer,
  TextField
} from "@material-ui/core";
import { Dialog, DialogContent, DialogContentText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ConfirmButton from "@saleor/components/ConfirmButton";
import FormSpacer from "@saleor/components/FormSpacer";
import ResponsiveTable from "@saleor/components/ResponsiveTable";
import useNotifier from "@saleor/hooks/useNotifier";
import { buttonMessages, commonMessages } from "@saleor/intl";
import { maybe } from "@saleor/misc";
import {
  useProductListQuery,
  useProductPrivateMetadata,
  useProductSkus,
  useProductType
} from "@saleor/products/queries";
import { ProductListVariables } from "@saleor/products/types/ProductList";
import {
  ProductPrivateMetadataData,
  ProductPrivateMetadataData_privateMetadata
} from "@saleor/products/types/ProductPrivateMetadata";
import { ProductsSkusData } from "@saleor/products/types/ProductSkus";
import { DialogProps, FetchMoreProps } from "@saleor/types";
import { useMegapackPrivateMetadataUpdate } from "@saleor/utils/metadata/updateMegapackPrivateMetadata";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import useNavigator from "@saleor/hooks/useNavigator";
import { productListUrl } from "@saleor/products/urls";

const useStyles = makeStyles(
  theme => ({
    selectedProduct: {
      background: theme.palette.primary.main
    },
    table: {
      minWidth: 650,
      maxHeight: 400,
      overflowY: "auto"
    }
  }),
  { name: "ProductAddToMegaPackDialog" }
);

export interface ProductAddToMegaPackDialogProps
  extends DialogProps,
    FetchMoreProps {
  params: any;
}

const getSkusToUpdatePrivateMetadata = (
  newProductsSkus: ProductsSkusData,
  skusFromSelectedProduct: ProductPrivateMetadataData
): any => {
  const newProducts: string[] = newProductsSkus.products.edges.map(
    item => item.node.defaultVariant.sku
  );
  const findOldProducts: ProductPrivateMetadataData_privateMetadata = skusFromSelectedProduct.product?.privateMetadata.find(
    privateMetadataField => privateMetadataField.key === "skus"
  );

  const oldProducts: any[] =
    findOldProducts.value !== undefined
      ? JSON.parse(findOldProducts.value.replaceAll("'", '"'))
      : [""];

  return newProducts.concat(oldProducts);
};

const getPrivateMetadataUpdateInput = (
  newProductsSkus: ProductsSkusData,
  skusFromSelectedProduct: ProductPrivateMetadataData
) => {
  const skus = getSkusToUpdatePrivateMetadata(
    newProductsSkus,
    skusFromSelectedProduct
  );
  return [{ key: "skus", value: skus }];
};

const ProductAddToMegaPackDialog: React.FC<ProductAddToMegaPackDialogProps> = ({
  params,
  onClose,
  open
}) => {
  const intl = useIntl();
  const navigate = useNavigator();
  const notify = useNotifier();

  const [selectedProduct, setSelectedProduct] = React.useState(null);

  const [searchValue, setSearchValue] = React.useState("");

  const { ...values } = useProductType({
    variables: {
      first: 1,
      query: "mega-paka"
    }
  });

  const queryVariables = React.useMemo<ProductListVariables>(
    () => ({
      filter: {
        productTypes: values.data ? [values.data.search.edges[0].node.id] : [],
        search: searchValue
      },
      hasChannel: true,
      hasSelectedAttributes: true,
      first: 100
    }),
    [params, searchValue]
  );

  const { data } = useProductListQuery({
    displayLoader: true,
    variables: queryVariables
  });

  const { ...productsSkus } = useProductSkus({
    displayLoader: true,
    variables: {
      ids: params.ids
    }
  });

  const handleProductSelect = id => {
    setSelectedProduct(id);
  };

  const handleSearch = value => {
    setSearchValue(value);
  };

  const { ...megaPackMetadata } = useProductPrivateMetadata({
    displayLoader: true,
    variables: {
      id: selectedProduct
    },
    skip: !selectedProduct
  });

  const [updatePrivateMetadata] = useMegapackPrivateMetadataUpdate({
    onCompleted: data => {
      notify({
        status: "success",
        text: intl.formatMessage(commonMessages.assignedSkusToMegapack)
      });
      navigate(productListUrl());
      const megaPackError = data.updatePrivateMetadata.errors.find(
        error => error.code === "MEGAPACK_ASSIGNED"
      );
      if (megaPackError) {
        notify({
          status: "error",
          text: megaPackError.message
        });
      }
      navigate(productListUrl());
    }
  });
  const classes = useStyles(params);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={intl.formatMessage({
        defaultMessage: "Add to mega pack",
        description: "dialog header"
      })}
      maxWidth="md"
    >
      <DialogContent>
        <DialogContentText>
          <FormattedMessage
            defaultMessage="Wybierz mega pakę"
            description="dialog content"
            values={{
              counter: maybe(() => params.ids.length),
              displayQuantity: <strong>{maybe(() => params.ids.length)}</strong>
            }}
          />
        </DialogContentText>
        <FormSpacer />
        <TextField
          id="search-for-megapack"
          label="Szukaj"
          variant="outlined"
          fullWidth
          onChange={event => handleSearch(event.target.value)}
        />
        <FormSpacer />
        <TableContainer className={classes.table}>
          <ResponsiveTable className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Nazwa</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.products.edges.map(node => (
                <TableRow
                  className={
                    selectedProduct === node.node.id
                      ? classes.selectedProduct
                      : ""
                  }
                  key={node.node.id}
                  onClick={() => handleProductSelect(node.node.id)}
                  hover
                >
                  <TableCell component="th" scope="row">
                    {node.node.name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </ResponsiveTable>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <FormattedMessage {...buttonMessages.back} />
        </Button>
        <ConfirmButton
          transitionState={params}
          color="primary"
          onClick={() =>
            updatePrivateMetadata({
              variables: {
                id: selectedProduct,
                input: getPrivateMetadataUpdateInput(
                  productsSkus.data,
                  megaPackMetadata.data
                )
              }
            })
          }
          disabled={selectedProduct ? false : true}
        >
          {intl.formatMessage(buttonMessages.confirm)}
        </ConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

ProductAddToMegaPackDialog.displayName = "ProductAddToMegaPackDialog";
export default ProductAddToMegaPackDialog;
