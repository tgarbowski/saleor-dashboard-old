/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {OrderErrorCode} from "./../../types/globalTypes";

// ====================================================
// GraphQL mutation operation: OrderRefund
// ====================================================

export interface OrderParcel_orderParcel_errors {
  __typename: "OrderError";
  code: OrderErrorCode;
  field: string | null;
}

export interface OrderParcel {
  __typename: "OrderParcel";
  errors: OrderParcel_orderParcel_errors[];
}

export interface OrderParcel {
  orderParcel: OrderParcel | null;
}

export interface OrderParcelVariables {
  id: string;
  amount: any;
}

export interface OrderParcel {
  orderParcel: OrderParcel | null
}

export interface OrderParcelDetails_order_lines {
  weight: string;
  content: string;
  customerData: string;
  sizeX: string;
  sizeY: string;
  sizeZ: string;
}
