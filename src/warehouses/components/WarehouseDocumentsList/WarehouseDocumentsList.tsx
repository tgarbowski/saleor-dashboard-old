import { makeStyles } from "@material-ui/core/styles";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@saleor/components/Checkbox";
import ResponsiveTable from "@saleor/components/ResponsiveTable";
import Skeleton from "@saleor/components/Skeleton";
import { AVATAR_MARGIN } from "@saleor/components/TableCellAvatar";
import TableCellHeader from "@saleor/components/TableCellHeader";
import TableHead from "@saleor/components/TableHead";
import TablePagination from "@saleor/components/TablePagination";
import { WMSDocumentsListColumns } from "@saleor/config";
import { maybe, renderCollection } from "@saleor/misc";
import { isAttributeColumnValue } from "@saleor/products/components/ProductListPage/utils";
import { GridAttributes_grid_edges_node } from "@saleor/products/types/GridAttributes";
import { ListActions, ListProps, SortPage } from "@saleor/types";
import TDisplayColumn, {
  DisplayColumnProps
} from "@saleor/utils/columns/DisplayColumn";
import { getArrowDirection } from "@saleor/utils/sort";
import { WMSDocumentList_documents_edges_node } from "@saleor/warehouses/types/WMSDoucumentsList";
import { WMSDocumentsListUrlSortField } from "@saleor/warehouses/urls";
import classNames from "classnames";
import React from "react";
import { FormattedMessage } from "react-intl";

const useStyles = makeStyles(
  theme => ({
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
    link: {
      cursor: "pointer"
    },
    table: {
      tableLayout: "fixed"
    },
    tableContainer: {
      overflowX: "scroll"
    },
    textLeft: {
      textAlign: "left"
    },
    textRight: {
      textAlign: "right"
    }
  }),
  { name: "WMSDocumentsList" }
);

const DisplayColumn = TDisplayColumn as React.FunctionComponent<
  DisplayColumnProps<WMSDocumentsListColumns>
>;

interface WMSDocumentsListProps
  extends ListProps<WMSDocumentsListColumns>,
    ListActions,
    SortPage<WMSDocumentsListUrlSortField> {
  gridAttributes: GridAttributes_grid_edges_node[];
  products: WMSDocumentList_documents_edges_node[];
  loading: boolean;
}

export const WMSDocumentsList: React.FC<WMSDocumentsListProps> = props => {
  const {
    settings,
    disabled,
    isChecked,
    pageInfo,
    products,
    selected,
    sort,
    toggle,
    toggleAll,
    toolbar,
    onNextPage,
    onPreviousPage,
    onUpdateListSettings,
    onRowClick,
    onSort
  } = props;
  const classes = useStyles(props);

  const gridAttributesFromSettings = settings.columns.filter(
    isAttributeColumnValue
  );
  const numberOfColumns = 2 + settings.columns.length;

  return (
    <div className={classes.tableContainer}>
      <ResponsiveTable className={classes.table}>
        <colgroup>
          <col />
          <col className={classes.colName} />
          <DisplayColumn column="status" displayColumns={settings.columns}>
            <col className={classes.colPublished} />
          </DisplayColumn>
          <DisplayColumn column="status" displayColumns={settings.columns}>
            <col className={classes.colUpdatedAt} />
          </DisplayColumn>
          <DisplayColumn column="updatedAt" displayColumns={settings.columns}>
            <col className={classes.colUpdatedAt} />
          </DisplayColumn>
          <DisplayColumn
            column="documentType"
            displayColumns={settings.columns}
          >
            <col className={classes.colUpdatedAt} />
          </DisplayColumn>
          {gridAttributesFromSettings.map(gridAttribute => (
            <col className={classes.colAttribute} key={gridAttribute} />
          ))}
          <DisplayColumn
            column="documentType"
            displayColumns={settings.columns}
          >
            <col className={classes.colPrice} />
          </DisplayColumn>
        </colgroup>
        <TableHead
          colSpan={numberOfColumns}
          selected={selected}
          disabled={disabled}
          items={products}
          toggleAll={toggleAll}
          toolbar={toolbar}
        >
          <TableCellHeader
            arrowPosition="right"
            className={classNames(classes.colName, {
              [classes.colNameFixed]: settings.columns.length > 4
            })}
            direction={
              sort.sort === WMSDocumentsListUrlSortField.name
                ? getArrowDirection(sort.asc)
                : undefined
            }
            onClick={() => onSort(WMSDocumentsListUrlSortField.name)}
          >
            <span className={classes.colNameHeader}>
              <FormattedMessage
                defaultMessage="Numer"
                description="wmsDocument"
              />
            </span>
          </TableCellHeader>
          <DisplayColumn column="status" displayColumns={settings.columns}>
            <TableCellHeader
              className={classes.colPublished}
              direction={
                sort.sort === WMSDocumentsListUrlSortField.status
                  ? getArrowDirection(sort.asc)
                  : undefined
              }
              onClick={() => onSort(WMSDocumentsListUrlSortField.status)}
            >
              <FormattedMessage
                defaultMessage="Status"
                description="document status"
              />
            </TableCellHeader>
          </DisplayColumn>
          <DisplayColumn column="updatedAt" displayColumns={settings.columns}>
            <TableCellHeader
              className={classes.colUpdatedAt}
              direction={
                sort.sort === WMSDocumentsListUrlSortField.createdAt
                  ? getArrowDirection(sort.asc)
                  : undefined
              }
              onClick={() => onSort(WMSDocumentsListUrlSortField.createdAt)}
            >
              <FormattedMessage
                defaultMessage="Data utworzenia"
                description="Data utworzenia"
              />
            </TableCellHeader>
          </DisplayColumn>

          <DisplayColumn
            column="documentType"
            displayColumns={settings.columns}
          >
            <TableCellHeader
              className={classes.colUpdatedAt}
              direction={
                sort.sort === WMSDocumentsListUrlSortField.documentType
                  ? getArrowDirection(sort.asc)
                  : undefined
              }
              onClick={() => onSort(WMSDocumentsListUrlSortField.documentType)}
            >
              <FormattedMessage
                defaultMessage="Typ dokumentu"
                description="Typ dokumentu"
              />
            </TableCellHeader>
          </DisplayColumn>

          <DisplayColumn
            column="documentType"
            displayColumns={settings.columns}
          >
            <TableCellHeader
              className={classes.colUpdatedAt}
              direction={
                sort.sort === WMSDocumentsListUrlSortField.warehouse
                  ? getArrowDirection(sort.asc)
                  : undefined
              }
              onClick={() => onSort(WMSDocumentsListUrlSortField.warehouse)}
            >
              <FormattedMessage
                defaultMessage="Magazyn"
                description="magazyn"
              />
            </TableCellHeader>
          </DisplayColumn>
        </TableHead>
        <TableFooter>
          <TableRow>
            <TablePagination
              colSpan={numberOfColumns}
              settings={settings}
              hasNextPage={pageInfo && !disabled ? pageInfo.hasNextPage : false}
              onNextPage={onNextPage}
              onUpdateListSettings={onUpdateListSettings}
              hasPreviousPage={
                pageInfo && !disabled ? pageInfo.hasPreviousPage : false
              }
              onPreviousPage={onPreviousPage}
            />
          </TableRow>
        </TableFooter>
        <TableBody>
          {renderCollection(
            products,
            product => {
              const isSelected = product ? isChecked(product.id) : false;

              return (
                <TableRow
                  selected={isSelected}
                  hover={!!product}
                  key={product ? product.id : "skeleton"}
                  onClick={product && onRowClick(product.id)}
                  className={classes.link}
                  data-test="id"
                  data-test-id={maybe(() => product.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      disabled={disabled}
                      disableClickPropagation
                      onChange={() => toggle(product.id)}
                    />
                  </TableCell>
                  <DisplayColumn
                    column="number"
                    displayColumns={settings.columns}
                  >
                    <TableCell className={classes.colUpdatedAt}>
                      {product?.number}
                    </TableCell>
                  </DisplayColumn>
                  <DisplayColumn
                    column="status"
                    displayColumns={settings.columns}
                  >
                    <TableCell className={classes.colUpdatedAt}>
                      {product?.status}
                    </TableCell>
                  </DisplayColumn>
                  <DisplayColumn
                    column="updatedAt"
                    displayColumns={settings.columns}
                  >
                    <TableCell className={classes.colUpdatedAt}>
                      {product && product.createdAt ? (
                        new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        }).format(new Date(product.createdAt))
                      ) : (
                        <Skeleton />
                      )}
                    </TableCell>
                  </DisplayColumn>
                  <DisplayColumn
                    column="documentType"
                    displayColumns={settings.columns}
                  >
                    <TableCell className={classes.colUpdatedAt}>
                      {product?.documentType === "GIN" && (
                        <FormattedMessage
                          defaultMessage="Magazyn"
                          description="magazyn"
                          id="wmsDocumentGIN"
                        />
                      )}
                      {product?.documentType === "GRN" && (
                        <FormattedMessage
                          defaultMessage="Magazyn"
                          description="magazyn"
                          id="wmsDocumentGRN"
                        />
                      )}
                      {product?.documentType === "FGTN" && (
                        <FormattedMessage
                          defaultMessage="Magazyn"
                          description="magazyn"
                          id="wmsDocumentFGTN"
                        />
                      )}
                      {product?.documentType === "IO" && (
                        <FormattedMessage
                          defaultMessage="Magazyn"
                          description="magazyn"
                          id="wmsDocumentIO"
                        />
                      )}
                      {product?.documentType === "IWM" && (
                        <FormattedMessage
                          defaultMessage="Magazyn"
                          description="magazyn"
                          id="wmsDocumentIWM"
                        />
                      )}
                    </TableCell>
                  </DisplayColumn>
                  <DisplayColumn
                    column="documentType"
                    displayColumns={settings.columns}
                  >
                    <TableCell className={classes.colUpdatedAt}>
                      {product?.warehouse.name}
                    </TableCell>
                  </DisplayColumn>
                </TableRow>
              );
            },
            () => (
              <TableRow>
                <TableCell colSpan={numberOfColumns}>
                  <FormattedMessage defaultMessage="No documents found" />
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </ResponsiveTable>
    </div>
  );
};
WMSDocumentsList.displayName = "WMSDocumentsList";
export default WMSDocumentsList;
