import React from "react";
import {Link, Dialog, DialogTitle, Grid, Paper, makeStyles, createStyles, Theme} from "@material-ui/core";
import { ProductList_products_edges_node_metadata } from "@saleor/products/types/ProductList";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(2),
      maxWidth: 600,
      width: 600
    }
  }),
);

export interface ProductPublishReportDialogProps {
  open: boolean;
  privateMetadata: ProductList_products_edges_node_metadata[];
  onClose?();
}

const ProductPublishReportDialog: React.FC<ProductPublishReportDialogProps> = props => {
  const { open, onClose, privateMetadata } = props;
  const classes = useStyles();

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Raport publikacji</DialogTitle>
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <strong>Status allegro</strong>
            <br />
            XXX
          </Grid>
          <Grid item xs={4}>
            <strong>Data publikacji</strong>
            <br />
            yyyy-MM-dd HH:mm
          </Grid>
          <Grid item xs={4}>
            <Link href={"https://allegro.pl/oferta/aukcja-" + "123456789"} target="_blank">
              Przejdź do aukcji
            </Link>
          </Grid>
        </Grid>
        <p>
          Lista błędów<br />
          {privateMetadata}
        </p>
      </Paper>
    </Dialog>
  );
};
ProductPublishReportDialog.displayName = "ProductPublishReportDialog";
export default ProductPublishReportDialog;
