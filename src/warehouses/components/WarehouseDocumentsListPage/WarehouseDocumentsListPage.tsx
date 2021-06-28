import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Container from "@saleor/components/Container";
import FilterBar from "@saleor/components/FilterBar";
import PageHeader from "@saleor/components/PageHeader";
import { WMSDocumentsListColumns } from "@saleor/config";
import { sectionNames } from "@saleor/intl";
import {
  GridAttributes_availableInGrid_edges_node,
  GridAttributes_grid_edges_node
} from "@saleor/products/types/GridAttributes";
import {
  FetchMoreProps,
  FilterPageProps,
  ListActions,
  PageListProps,
  SortPage
} from "@saleor/types";
import { WMSDocumentList_documents_edges_node } from "@saleor/warehouses/types/WMSDoucumentsList";
import { WMSDocumentsListUrlSortField } from "@saleor/warehouses/urls";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import WMSDocumentsList from "../WarehouseDocumentsList/WarehouseDocumentsList";
import {
  createFilterStructure,
  WMSDocumentsFilterKeys,
  WMSDocumentsListFilterOpts
} from "./filters";

export interface WMSDocumentsListPageProps
  extends PageListProps<WMSDocumentsListColumns>,
    ListActions,
    FilterPageProps<WMSDocumentsFilterKeys, WMSDocumentsListFilterOpts>,
    FetchMoreProps,
    SortPage<WMSDocumentsListUrlSortField> {
  availableInGridAttributes: GridAttributes_availableInGrid_edges_node[];
  currencySymbol: string;
  gridAttributes: GridAttributes_grid_edges_node[];
  totalGridAttributes: number;
  products: WMSDocumentList_documents_edges_node[];
  onExport: () => void;
}

export const WMSDocumentsListPage: React.FC<WMSDocumentsListPageProps> = props => {
  const {
    currencySymbol,
    currentTab,
    defaultSettings,
    gridAttributes,
    availableInGridAttributes,
    filterOpts,
    hasMore,
    initialSearch,
    loading,
    settings,
    tabs,
    totalGridAttributes,
    onAdd,
    onAll,
    onExport,
    onFetchMore,
    onFilterChange,
    onSearchChange,
    onTabChange,
    onTabDelete,
    onTabSave,
    onUpdateListSettings,
    ...listProps
  } = props;
  const intl = useIntl();

  const filterStructure = createFilterStructure(intl, filterOpts);

  return (
    <Container>
      <PageHeader title={intl.formatMessage(sectionNames.wmsDocuments)}>
        <Button
          onClick={onAdd}
          color="primary"
          variant="contained"
          data-test="add-product"
        >
          <FormattedMessage
            defaultMessage="Create WMS Document"
            description="button"
          />
        </Button>
      </PageHeader>
      <Card>
        <FilterBar
          currencySymbol={currencySymbol}
          currentTab={currentTab}
          initialSearch={initialSearch}
          onAll={onAll}
          onFilterChange={onFilterChange}
          onSearchChange={onSearchChange}
          onTabChange={onTabChange}
          onTabDelete={onTabDelete}
          onTabSave={onTabSave}
          tabs={tabs}
          allTabLabel={intl.formatMessage({
            defaultMessage: "All Documents",
            description: "tab name"
          })}
          filterStructure={filterStructure}
          searchPlaceholder={intl.formatMessage({
            defaultMessage: "Search Documents..."
          })}
        />
        <WMSDocumentsList
          {...listProps}
          loading={loading}
          gridAttributes={gridAttributes}
          settings={settings}
          onUpdateListSettings={onUpdateListSettings}
        />
      </Card>
    </Container>
  );
};
WMSDocumentsListPage.displayName = "WMSDocumentsListPage";
export default WMSDocumentsListPage;
