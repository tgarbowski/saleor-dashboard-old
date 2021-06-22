import { IFilter } from "@saleor/components/Filter";
import { MultiAutocompleteChoiceType } from "@saleor/components/MultiAutocompleteSelectField";
import { sectionNames } from "@saleor/intl";
import { AutocompleteFilterOpts, FilterOpts, MinMax } from "@saleor/types";
import { StockAvailability } from "@saleor/types/globalTypes";
import {
  createAutocompleteField,
  createDateField,
  createOptionsField,
  createPriceField,
  createWarehouseField
} from "@saleor/utils/filters/fields";
import { defineMessages, IntlShape } from "react-intl";

export enum WMSDocumentsFilterKeys {
  documentType = "documentType",
}


export interface WMSDocumentsListFilterOpts {

  documentType: FilterOpts<DocumentType>;

}


export enum DocumentType {

  GIN = "GIN",
  GTD = "GTD"
}
const messages = defineMessages({
  documentType: {
    defaultMessage: "Document Type",
    description: "document type"
  },
  GIN: {
    defaultMessage: "GIN",
    description: "GIN"
  },
  GTD: {
    defaultMessage: "GTD",
    description: "GTD"
  }
});

export function createFilterStructure(
  intl: IntlShape,
  opts: WMSDocumentsListFilterOpts
): IFilter<WMSDocumentsFilterKeys> {
  return [
    {
      ...createOptionsField(
        WMSDocumentsFilterKeys.documentType,
        intl.formatMessage(messages.documentType),
        [opts.documentType.value],
        false,
        [
          {
            label: intl.formatMessage(messages.GIN),
            value: DocumentType.GIN
          },
          {
            label: intl.formatMessage(messages.GTD),
            value: DocumentType.GTD
          }
        ]
      ),
      active: opts.documentType.active
    },
  ];
}
