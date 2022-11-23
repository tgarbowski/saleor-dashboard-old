/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { WMSDocumentErrorCode } from "./../../types/globalTypes";

// ====================================================
// GraphQL mutation operation: productBulkDelete
// ====================================================

export interface wmsDocumentBulkDelete_wmsDocumentBulkDelete_errors {
    __typename: "WmsDocumentError";
    code: WMSDocumentErrorCode;
    field: string | null;
}

export interface wmsDocumentBulkDelete_wmsDocumentBulkDelete {
    __typename: "wmsDocumentBulkDelete";
    errors: wmsDocumentBulkDelete_wmsDocumentBulkDelete_errors[];
}

export interface wmsDocumentBulkDelete {
    wmsDocumentBulkDelete: wmsDocumentBulkDelete_wmsDocumentBulkDelete | null;
}

export interface wmsDocumentBulkDeleteVariables {
    ids: string[];
}
