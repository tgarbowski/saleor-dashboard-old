import {
  Card,
  CardContent,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow
} from "@material-ui/core";
import { DateTime } from "@saleor/components/Date";
import ResponsiveTable from "@saleor/components/ResponsiveTable";
import Skeleton from "@saleor/components/Skeleton";
import TableCellHeader from "@saleor/components/TableCellHeader";
import TablePagination from "@saleor/components/TablePagination";
import { maybe } from "@saleor/misc";
import { FormattedMessage, useIntl } from "react-intl";

import React from "react";
import { ExportFiles_exportFilse_edges_node } from "../types/ExportFiles";
import { ListProps } from "@saleor/types";
import CardTitle from "@saleor/components/CardTitle";
export interface TalliesListProps extends ListProps {
  exportFiles: ExportFiles_exportFilse_edges_node[];
}

const TalliesList: React.FC<TalliesListProps> = ({
  exportFiles,
  disabled,
  settings,
  pageInfo,
  onPreviousPage,
  onNextPage,
  onUpdateListSettings
}) => {
  const intl = useIntl();

  return (
    <Card>
      <CardTitle
        title={intl.formatMessage({
          defaultMessage: "Lista zestawień",
          description: "section header"
        })}
      />
      <CardContent>
        <ResponsiveTable>
          <TableHead>
            <TableRow>
              <TableCellHeader style={{ width: "20%" }}>
                <FormattedMessage defaultMessage="Nr." />
              </TableCellHeader>
              <TableCellHeader style={{ width: "20%" }}>
                <FormattedMessage
                  defaultMessage="Data"
                  description="date when order was placed"
                />
              </TableCellHeader>
              <TableCellHeader style={{ width: "20%" }}>
                <FormattedMessage
                  defaultMessage="URL"
                  description="date when order was placed"
                />
              </TableCellHeader>
              <TableCellHeader style={{ width: "40%" }}>
                <FormattedMessage
                  defaultMessage="Message"
                  description="date when order was placed"
                />
              </TableCellHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {exportFiles?.map(
              file => (
                <TableRow data-test-id="order-table-row">
                  <TableCell>
                    {maybe(() => file.id) ? (
                      atob(file.id).split(":")[1]
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell>
                    {maybe(() => file.createdAt) ? (
                      <DateTime date={file.createdAt} />
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell>
                    {maybe(() => file.url) ? (
                      <a href={file.url}>Pobierz</a>
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell>
                    {maybe(() => file.message) ? file.message : <Skeleton />}
                  </TableCell>
                </TableRow>
              ),
              () => (
                <TableRow>
                  <TableCell>
                    <FormattedMessage defaultMessage="No tallies found" />
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                settings={settings}
                hasNextPage={
                  pageInfo && !disabled ? pageInfo.hasNextPage : false
                }
                onNextPage={onNextPage}
                onUpdateListSettings={onUpdateListSettings}
                hasPreviousPage={
                  pageInfo && !disabled ? pageInfo.hasPreviousPage : false
                }
                onPreviousPage={onPreviousPage}
              />
            </TableRow>
          </TableFooter>
        </ResponsiveTable>
      </CardContent>
    </Card>
  );
};
export default TalliesList;
