import { Card, CardContent, makeStyles, Typography } from "@material-ui/core";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableFooter from "@material-ui/core/TableFooter/TableFooter";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import CardSpacer from "@saleor/components/CardSpacer";
import CardTitle from "@saleor/components/CardTitle";
import Container from "@saleor/components/Container";
import Grid from "@saleor/components/Grid";
import PageHeader from "@saleor/components/PageHeader";
import ResponsiveTable from "@saleor/components/ResponsiveTable";
import Skeleton from "@saleor/components/Skeleton";
import { AVATAR_MARGIN } from "@saleor/components/TableCellAvatar";
import TableCellHeader from "@saleor/components/TableCellHeader";
import { AddressTypeInput } from "@saleor/customers/types";
import { renderCollection } from "@saleor/misc";
import { WMSDocPositions_documents_edges } from "@saleor/warehouses/types/WMSDocPositions";
import { WMSDocument } from "@saleor/warehouses/types/WMSDocument";
import React from "react";
import { FormattedMessage } from "react-intl";

export interface WarehouseDetailsPageFormData extends AddressTypeInput {
  name: string;
}
export interface WarehouseDocumentDetailsPageProps {
  document: WMSDocument;
  positions: WMSDocPositions_documents_edges[];
}

const useStyles = makeStyles(
  theme => ({
    cardTitle: {
      height: 72
    },
    checkbox: {
      marginBottom: theme.spacing()
    },
    colAttribute: {
      width: 150
    },
    colFill: {
      padding: 0,
      width: "100%"
    },
    colName: {
      "&$colNameFixed": {
        width: 250
      }
    },
    colNameFixed: {},
    colNameHeader: {
      marginLeft: AVATAR_MARGIN
    },
    colNameWrapper: {
      display: "block"
    },
    colPrice: {
      textAlign: "right"
    },
    colPublished: {},
    colType: {},
    content: {
      paddingTop: theme.spacing()
    },
    link: {
      cursor: "pointer"
    },
    subtitle: {
      marginTop: theme.spacing()
    },
    [theme.breakpoints.up("lg")]: {
      colName: {
        width: "auto"
      },
      colPrice: {
        width: 100
      },
      colPublished: {
        width: 200
      },
      colType: {
        width: 200
      },
      colUpdatedAt: {
        width: 200
      }
    },

    table: {
      tableLayout: "fixed"
    },
    tableContainer: {
      backgroundColor: "white",
      marginTop: "10%"
    },
    textLeft: {
      textAlign: "left"
    },
    textRight: {
      textAlign: "right"
    }
  }),
  { name: "WMSDocumentDetails" }
);

const WarehouseDocumentDetails: React.FC<WarehouseDocumentDetailsPageProps> = ({
  document,
  positions
}) => {
  const classes = useStyles(document);
    return (
    <Container>
      <PageHeader title={document?.wmsDocument?.number} />
      <Grid variant="uniform">
        <div>
          <Card>
            <CardTitle className={classes.cardTitle} title="Użytkownik" />
            <CardContent className={classes.content}>
              <Typography color="textPrimary">
                {document?.wmsDocument?.createdBy?.email}
              </Typography>
            </CardContent>
          </Card>
          <CardSpacer />
        </div>
        <div>
          <Card>
            <CardTitle className={classes.cardTitle} title="Data utworzenia" />
            <CardContent className={classes.content}>
              {document?.wmsDocument && document?.wmsDocument?.createdAt ? (
                new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                }).format(new Date(document.wmsDocument.createdAt))
              ) : (
                <Skeleton />
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <CardSpacer />
          <Card>
            <CardTitle className={classes.cardTitle} title="Typ dokumentu" />
            <CardContent className={classes.content}>
              {document?.wmsDocument?.documentType === "GIN" && (
                <FormattedMessage
                  defaultMessage="GIN"
                  description="magazyn"
                  id="documentGIN"
                />
              )}
              {document?.wmsDocument?.documentType === "GRN" && (
                <FormattedMessage
                  defaultMessage="GRN"
                  description="magazyn"
                  id="documentGRN"
                />
              )}
              {document?.wmsDocument?.documentType === "FGTN" && (
                <FormattedMessage
                  defaultMessage="FGTN"
                  description="magazyn"
                  id="documentFGTN"
                />
              )}
              {document?.wmsDocument?.documentType === "IO" && (
                <FormattedMessage
                  defaultMessage="IO"
                  description="magazyn"
                  id="documentIO"
                />
              )}
              {document?.wmsDocument?.documentType === "IWM" && (
                <FormattedMessage
                  defaultMessage="IWM"
                  description="magazyn"
                  id="documentIWM"
                />
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <CardSpacer />
          <Card>
            <CardTitle className={classes.cardTitle} title="Status" />
            <CardContent className={classes.content}>
              {document?.wmsDocument?.status}
            </CardContent>
          </Card>
        </div>
        <div>
          <CardSpacer />
          <Card>
            <CardTitle className={classes.cardTitle} title="Magazyn" />
            <CardContent className={classes.content}>
              {document?.wmsDocument?.warehouse.name}
            </CardContent>
          </Card>
        </div>
          <div>
              <CardSpacer />
              <Card>
                  <CardTitle className={classes.cardTitle} title="Odbiorca / Nadawca" />
                  <CardContent className={classes.content}>

                      {document?.wmsDocument?.documentType === "GIN" && (
                          "Odbiorca: " + document?.wmsDocument.recipient.email
                      )}
                      {document?.wmsDocument?.documentType === "GRN" && (
                          "Nadawca: " +  document?.wmsDocument.deliverer.companyName
                      )}
                      {document?.wmsDocument?.documentType === "FGTN" && (
                          "Nadawca : " + document?.wmsDocument.deliverer.companyName
                      )}
                      {document?.wmsDocument?.documentType === "IO" && (
                          "Nadawca: " + document?.wmsDocument.deliverer.companyName
                      )}
                      {document?.wmsDocument?.documentType === "IWM" && (
                          "Nadawca: " + document?.wmsDocument.deliverer.companyName
                      )}
                  </CardContent>
              </Card>
          </div>
      </Grid>
      <div className={classes.tableContainer}>
        <ResponsiveTable className={classes.table}>
          <TableHead>
            <TableCellHeader>
              <span className={classes.colNameHeader}>
                <FormattedMessage
                  defaultMessage="Produkt"
                  description="wmsDocument"
                />
              </span>
            </TableCellHeader>
            <TableCellHeader className={classes.colPublished}>
              <FormattedMessage defaultMessage="Ilość" description="quantity" />
            </TableCellHeader>

            <TableCellHeader className={classes.colUpdatedAt}>
              <FormattedMessage defaultMessage="Waga" description="weight" />
            </TableCellHeader>
          </TableHead>
          <TableFooter></TableFooter>
          <TableBody>
            {renderCollection(
              positions,
              position => (
                <TableRow>
                  <TableCell className={classes.colUpdatedAt}>
                    {position?.node?.productVariant?.product?.name}
                  </TableCell>
                  <TableCell className={classes.colUpdatedAt}>
                    {position?.node.quantity}
                  </TableCell>
                  <TableCell className={classes.colUpdatedAt}>
                    {position?.node.weight}
                  </TableCell>
                </TableRow>
              ),
              () => (
                <TableRow>
                  <TableCell colSpan={4}>
                    <FormattedMessage defaultMessage="No positions found" />
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </ResponsiveTable>
      </div>
    </Container>
  );
};

WarehouseDocumentDetails.displayName = "WarehouseDocumentDetails";
export default WarehouseDocumentDetails;
