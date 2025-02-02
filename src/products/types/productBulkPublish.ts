import { ProductErrorCode } from "./../../types/globalTypes";
import { ProductFilterInput } from "./../../types/globalTypes";

// ====================================================
// GraphQL mutation operation: productBulkPublish
// ====================================================

export interface productBulkPublish_productBulkPublish_errors {
  __typename: "ProductError";
  code: ProductErrorCode;
  field: string | null;
}

export interface productBulkPublish_productBulkPublish {
  __typename: "ProductBulkPublish";
  errors: productBulkPublish_productBulkPublish_errors[];
}

export interface productBulkPublish {
  productBulkPublish: productBulkPublish_productBulkPublish | null;
}

export interface productBulkPublishVariables {
  ids: string[];
  isPublished: boolean;
  offerType: string;
  startingAt: string;
  startingAtDate: string;
  endingAtDate: string;
  publishHour: string;
  filter?: ProductFilterInput;
  channel?: string | null;
  mode: string;
}