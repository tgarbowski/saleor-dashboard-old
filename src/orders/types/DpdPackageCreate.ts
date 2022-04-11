/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { CountryCode } from "@saleor/types/globalTypes";

// ====================================================
// GraphQL mutation operation: PackageCreate
// ====================================================

export interface Package_parcelData{
  weight: number;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
}

export interface Package_packageCreated {
  packageId:  number;
  //parcelIds: number[];
  //status: string;
}

export interface Package {
  packageCreate: Package_packageCreated;
}


export interface Package_input {
  packageData: Package_parcelData[];
  fulfillment: string;
  order: string;
}

export interface PackageVariables {
  input: Package_input;
}
