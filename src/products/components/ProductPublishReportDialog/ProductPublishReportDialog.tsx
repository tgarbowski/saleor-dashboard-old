import {
  createStyles,
  Dialog,
  DialogTitle,
  Grid,
  Link,
  makeStyles,
  Paper,
  Theme
} from "@material-ui/core";
import { renderCollection } from "@saleor/misc";
import React from "react";

const useStyles = makeStyles(
  (theme: Theme) =>
    createStyles({
      paper: {
        maxWidth: 600,
        padding: theme.spacing(2),
        width: 600
      }
    }),
  { name: "ProductPublishReportDialog" }
);

export interface ProductPublishReportDialogProps {
  open: boolean;
  privateMetadataMap: any;
  isPublished: boolean;
  onClose?();
}

const ProductPublishReportDialog: React.FC<ProductPublishReportDialogProps> = props => {
  const { open, onClose, privateMetadataMap, isPublished } = props;
  const classes = useStyles(props);

  const offerUrlPart =
    !isPublished &&
    privateMetadataMap &&
    privateMetadataMap["publish.status"] === "moderated"
      ? "offer"
      : "oferta";

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Raport publikacji</DialogTitle>
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <strong>Status allegro</strong>
            <br />
            {privateMetadataMap && privateMetadataMap["publish.status"]
              ? privateMetadataMap["publish.status"]
              : "-"}
          </Grid>
          <Grid item xs={4}>
            <strong>Data publikacji</strong>
            <br />
            {privateMetadataMap && privateMetadataMap["publish.date"]
              ? privateMetadataMap["publish.date"]
              : "-"}
          </Grid>
          <Grid item xs={4}>
            {privateMetadataMap &&
            privateMetadataMap["publish.id"] !== undefined ? (
              <Link
                href={
                  "https://allegro.pl/" +
                  offerUrlPart +
                  "/" +
                  privateMetadataMap["publish.id"] +
                  (!isPublished &&
                  privateMetadataMap["publish.status"] === "moderated"
                    ? "/restore"
                    : "")
                }
                target="_blank"
              >
                Przejdź do aukcji
              </Link>
            ) : (
              undefined
            )}
          </Grid>
        </Grid>
        <p>
          <strong>Lista błędów</strong>
          <br />
          {privateMetadataMap &&
            renderCollection(
              privateMetadataMap["publish.errors"],
              err => <p>{err}</p>,
              () => <p>-</p>
            )}
        </p>
      </Paper>
    </Dialog>
  );
};
ProductPublishReportDialog.displayName = "ProductPublishReportDialog";
export default ProductPublishReportDialog;
