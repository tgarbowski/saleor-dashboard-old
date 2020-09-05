import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import {Modal} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles(
  theme => ({
    modal: {
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
      padding: theme.spacing(3)
    },
    paper: {
      overflow: "hidden"
    },
    root: {
      height: 500,
      maxWidth: 600,
      outline: 0,
      width: "100%"
    }
  }),
  { name: "ProductPublishReportDialog" }
);

export interface ProductPublishReportDialogProps {
  open: boolean;
  onClose?();
}

const ProductPublishReportDialog: React.FC<ProductPublishReportDialogProps> = props => {
  const { open, onClose } = props;

  const classes = useStyles(props);

  return (
    <Modal className={classes.modal} onClose={onClose} open={open}>
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <h2>Raport publikacji</h2>
          <p>
            TODO: wyciągnąć z metadanych
          </p>
        </Paper>
      </div>
    </Modal>
  );
};
ProductPublishReportDialog.displayName = "ProductPublishReportDialog";
export default ProductPublishReportDialog;
