/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { CountryCode } from "@saleor/types/globalTypes";

// ====================================================
// GraphQL mutation operation: DpdPackageCreate
// ====================================================

export interface DpdPackage_packageCreated {
  packageId:  number;
  parcelIds: number[];
  waybills: string[];
  status: string;
}

export interface DpdPackage {
  dpdPackageCreate: DpdPackage_packageCreated;
}


export interface DpdPackage_senderData {
  company?: string | null;
  address?: string | null;
  city?: string | null;
  email?: string | null;
  countryCode?: CountryCode | string | null;
  phone?: string | null;
  fid?: string | null;
  postalCode?: string | null;

}

export interface DpdPackage_receivedData {
  company?: string | null;
  address?: string | null;
  city?: string | null;
  email?: string | null;
  countryCode?: CountryCode | string | null;
  phone?: string | null;
  postalCode?: string | null;
}

export interface DpdPackage_parcelData{
  weight: number;
  content: string;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
}

export interface DpdPackage_input {
    senderData: DpdPackage_senderData;
    receiverData: DpdPackage_receivedData;
    packageData: DpdPackage_parcelData[];
    fulfillment: string;
}

export interface DpdPackageVariables {
  input: DpdPackage_input;
}
