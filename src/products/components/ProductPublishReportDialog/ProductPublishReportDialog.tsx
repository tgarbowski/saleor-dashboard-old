import React from "react";
import {Link, Dialog, DialogTitle, Grid} from "@material-ui/core";
import { ProductList_products_edges_node_metadata } from "@saleor/products/types/ProductList";

export interface ProductPublishReportDialogProps {
  open: boolean;
  privateMetadata: ProductList_products_edges_node_metadata[];
  onClose?();
}

const ProductPublishReportDialog: React.FC<ProductPublishReportDialogProps> = props => {
  const { open, onClose, privateMetadata } = props;

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Raport publikacji</DialogTitle>
      <Grid container>
        <Grid item xs={4}>
          Status allegro: XXX
        </Grid>
        <Grid item xs={4}>
          Data publikacji: yyyy-MM-dd HH:mm
        </Grid>
        <Grid item xs={4}>
          <Link href={"https://allegro.pl/oferta/aukcja-" + "123456789"}>
            Przejdź do aukcji
          </Link>
        </Grid>
      </Grid>
      <p>
        Lista błędów<br />
        {privateMetadata}
      </p>
    </Dialog>
  );
};
ProductPublishReportDialog.displayName = "ProductPublishReportDialog";
export default ProductPublishReportDialog;
