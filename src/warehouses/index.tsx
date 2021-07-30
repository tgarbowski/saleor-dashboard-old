import { sectionNames } from "@saleor/intl";
import { asSortParams } from "@saleor/utils/sort";
import { getArrayQueryParam } from "@saleor/utils/urls";
import { parse as parseQs } from "qs";
import React from "react";
import { useIntl } from "react-intl";
import { Route, RouteComponentProps, Switch } from "react-router-dom";

import { WindowTitle } from "../components/WindowTitle";
import {
  warehouseAddPath,
  warehouseListPath,
  WarehouseListUrlQueryParams,
  WarehouseListUrlSortField,
  warehousePath,
  WarehouseUrlQueryParams,
  wmsDocumentPath,
  wmsDocumentsListPath,
  WMSDocumentsListUrlQueryParams,
  WMSDocumentsListUrlSortField,
  WMSDocumentUrlQueryparams
} from "./urls";
import WarehouseCreate from "./views/WarehouseCreate";
import WarehouseDetailsComponent from "./views/WarehouseDetails";
import WarehouseDocumentDetailsComponent from "./views/WarehouseDocumentDetails";
import WarehouseDocumentsListComponent from "./views/WarehouseDocumentsList";
import WarehouseListComponent from "./views/WarehouseList";

const WarehouseList: React.FC<RouteComponentProps> = ({ location }) => {
  const qs = parseQs(location.search.substr(1));
  const params: WarehouseListUrlQueryParams = asSortParams(
    qs,
    WarehouseListUrlSortField
  );
  return <WarehouseListComponent params={params} />;
};

const WarehouseDocumentsList: React.FC<RouteComponentProps<any>> = ({
  location
}) => {
  const qs = parseQs(location.search.substr(1));
  const params: WMSDocumentsListUrlQueryParams = asSortParams(
    {
      ...qs,
      categories: getArrayQueryParam(qs.categories),
      collections: getArrayQueryParam(qs.collections),
      ids: getArrayQueryParam(qs.ids),
      productTypes: getArrayQueryParam(qs.productTypes)
    },
    WMSDocumentsListUrlSortField
  );

  return <WarehouseDocumentsListComponent params={params} />;
};

const WarehouseDetails: React.FC<RouteComponentProps<{ id: string }>> = ({
  location,
  match
}) => {
  const qs = parseQs(location.search.substr(1));
  const params: WarehouseUrlQueryParams = qs;
  return (
    <WarehouseDetailsComponent
      id={decodeURIComponent(match.params.id)}
      params={params}
    />
  );
};

const WarehouseDocumentDetails: React.FC<RouteComponentProps<{
  id: string;
}>> = ({ location, match }) => {
  const qs = parseQs(location.search.substr(1));
  const params: WMSDocumentUrlQueryparams = qs;
  return (
    <WarehouseDocumentDetailsComponent
      id={decodeURIComponent(match.params.id)}
      params={params}
    />
  );
};

export const WarehouseSection: React.FC = () => {
  const intl = useIntl();

  return (
    <>
      <WindowTitle title={intl.formatMessage(sectionNames.warehouses)} />
      <Switch>
        <Route exact path={warehouseListPath} component={WarehouseList} />
        <Route
          exact
          path={wmsDocumentsListPath}
          component={WarehouseDocumentsList}
        />
        <Route exact path={warehouseAddPath} component={WarehouseCreate} />
        <Route
          exact
          path={wmsDocumentPath(":id")}
          component={WarehouseDocumentDetails}
        />
        <Route path={warehousePath(":id")} component={WarehouseDetails} />
      </Switch>
    </>
  );
};
export default WarehouseSection;
