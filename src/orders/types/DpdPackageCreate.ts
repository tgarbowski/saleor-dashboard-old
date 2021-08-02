/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DpdPackageCreate
// ====================================================


export interface DpdPackage {
  __typename: "DpdPackagel";
  errors: DpdPackagel_orderParcel_errors[];
}

export interface DpdPackage {
  orderParcel: DpdPackagel | null;
}

export interface DpdPackage {
  orderParcel: DpdPackage | null
}

export interface DpdPackageDetails_order_lines {
  weight: string;
  content: string;
  customerData: string;
  sizeX: string;
  sizeY: string;
  sizeZ: string;
}

export interface DpdPackageVariables {
    id: string;
    amount: any;
  }
