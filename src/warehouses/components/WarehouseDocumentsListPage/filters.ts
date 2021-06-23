import { IFilter } from "@saleor/components/Filter";
import { FilterOpts } from "@saleor/types";
import {
  createOptionsField} from "@saleor/utils/filters/fields";
import { defineMessages, IntlShape } from "react-intl";

export enum WMSDocumentsFilterKeys {
  documentType = "documentType",
}


export interface WMSDocumentsListFilterOpts {

  documentType: FilterOpts<DocumentType>;

}


export enum DocumentType {

  GIN = "GIN",
  GRN = "GRN"
}
const messages = defineMessages({
  GIN: {
    defaultMessage: "GIN",
    description: "GIN"
  },
  GRN: {
    defaultMessage: "GRN",
    description: "GRN"
  },
  documentType: {
    defaultMessage: "Document Type",
    description: "document type"
  },
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
            label: intl.formatMessage(messages.GRN),
            value: DocumentType.GRN
          }
        ]
      ),
      active: opts.documentType.active
    },
  ];
}
