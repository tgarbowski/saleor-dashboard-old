import { WindowTitle } from "@saleor/components/WindowTitle";
import WarehouseDocumentDetailsPage from "@saleor/warehouses/components/WarehouseDocumentDetails";
import {
  useWMSDocPositions,
  useWMSDocumentQuery
} from "@saleor/warehouses/queries";
import { WMSDocumentUrlQueryparams } from "@saleor/warehouses/urls";
import React from "react";

export interface WarehouseDetailsProps {
  id: string;
  params: WMSDocumentUrlQueryparams;
}

const WarehouseDocumentDetails: React.FC<WarehouseDetailsProps> = ({ id }) => {
  const { data } = useWMSDocumentQuery({
    displayLoader: true,
    variables: { id }
  });

  const { ...positions } = useWMSDocPositions({
    displayLoader: true,
    variables: { id }
  });

  return (
    <>
      <WindowTitle title={data?.wmsDocument?.number} />
      <WarehouseDocumentDetailsPage
        document={data}
        positions={positions.data?.wmsDocPositions?.edges}
      />
    </>
  );
};

WarehouseDocumentDetails.displayName = "WarehouseDocumentDetails";
export default WarehouseDocumentDetails;
