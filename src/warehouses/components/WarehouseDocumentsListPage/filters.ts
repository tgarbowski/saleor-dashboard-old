import { IFilter } from "@saleor/components/Filter";
import { AutocompleteFilterOpts, FilterOpts, MinMax } from "@saleor/types";
import {
  createAutocompleteField,
  createDateField,
  createOptionsField,
  createTextField
} from "@saleor/utils/filters/fields";
import { defineMessages, IntlShape } from "react-intl";

export enum WMSDocumentsFilterKeys {
  documentType = "documentType",
  status = "status",
  createdAt = "createdAt",
  location = "location",
  warehouse = "warehouse",
  wmsDeliverer = "wmsDeliverer"
}

export enum DocumentType {
  GIN = "GIN",
  GRN = "GRN",
  IWM = "IWM",
  FGTN = "FGTN",
  IO = "IO"
}

export enum DocumentStatus {
  DRAFT = "DRAFT",
  APPROVED = "APPROVED"
}

export interface WMSDocumentsListFilterOpts {
  documentType: FilterOpts<DocumentType>;
  status: FilterOpts<DocumentStatus>;
  createdAt: FilterOpts<MinMax>;
  location: FilterOpts<string>;
  warehouse: FilterOpts<string[]> & AutocompleteFilterOpts;
  wmsDeliverer: FilterOpts<string[]> & AutocompleteFilterOpts;
}

const messages = defineMessages({
  APPROVED: {
    defaultMessage: "Zaakceptowane",
    description: "APPROVED"
  },
  DRAFT: {
    defaultMessage: "Draft",
    description: "DRAFT"
  },
  FGTN: {
    defaultMessage: "Przyjęcie wewnętrzne",
    description: "FGTN",
    id: "wmsDocumentFGTN"
  },
  GIN: {
    defaultMessage: "Wydanie zewnętrzne",
    description: "GIN",
    id: "wmsDocumentGIN"
  },
  GRN: {
    defaultMessage: "Przyjęcie zewnętrzne",
    description: "GRN",
    id: "wmsDocumentGRN"
  },
  IO: {
    defaultMessage: "Rozchód wewnętrzny",
    description: "IO",
    id: "wmsDocumentIO"
  },
  IWM: {
    defaultMessage: "Przesunięcie między magazynami",
    description: "IWM",
    id: "wmsDocumentIWM"
  },
  createdAt: {
    defaultMessage: "Data utworzenia",
    description: "createdAt"
  },
  deliverer: {
    defaultMessage: "Dostawca",
    description: "deliverer"
  },
  documentType: {
    defaultMessage: "Typ dokumentu",
    description: "document type"
  },
  location: {
    defaultMessage: "Lokacja",
    description: "location"
  },
  status: {
    defaultMessage: "Status",
    description: "status"
  },
  warehouse: {
    defaultMessage: "Magazyn",
    description: "warehouse"
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
            label: intl.formatMessage(messages.GRN),
            value: DocumentType.GRN
          },
          {
            label: intl.formatMessage(messages.FGTN),
            value: DocumentType.FGTN
          },
          {
            label: intl.formatMessage(messages.IO),
            value: DocumentType.IO
          },
          {
            label: intl.formatMessage(messages.IWM),
            value: DocumentType.IWM
          }
        ]
      ),
      active: opts.documentType.active
    },
    {
      ...createOptionsField(
        WMSDocumentsFilterKeys.status,
        intl.formatMessage(messages.status),
        [opts.status.value],
        false,
        [
          {
            label: intl.formatMessage(messages.DRAFT),
            value: DocumentStatus.DRAFT
          },
          {
            label: intl.formatMessage(messages.APPROVED),
            value: DocumentStatus.APPROVED
          }
        ]
      ),
      active: opts.status.active
    },
    {
      ...createDateField(
        WMSDocumentsFilterKeys.createdAt,
        intl.formatMessage(messages.createdAt),
        opts.createdAt.value
      ),
      active: opts.createdAt.active
    },
    {
      ...createTextField(
        WMSDocumentsFilterKeys.location,
        intl.formatMessage(messages.location),
        opts.location.value
      ),
      active: opts.location.active
    },
    {
      ...createAutocompleteField(
        WMSDocumentsFilterKeys.warehouse,
        intl.formatMessage(messages.warehouse),
        opts.warehouse.value,
        opts.warehouse.displayValues,
        true,
        opts.warehouse.choices,
        {
          hasMore: opts.warehouse.hasMore,
          initialSearch: "",
          loading: opts.warehouse.loading,
          onFetchMore: opts.warehouse.onFetchMore,
          onSearchChange: opts.warehouse.onSearchChange
        }
      ),
      active: opts.warehouse.active
    },
    {
      ...createAutocompleteField(
        WMSDocumentsFilterKeys.wmsDeliverer,
        intl.formatMessage(messages.deliverer),
        opts.wmsDeliverer.value,
        opts.wmsDeliverer.displayValues,
        true,
        opts.wmsDeliverer.choices,
        {
          hasMore: opts.wmsDeliverer.hasMore,
          initialSearch: "",
          loading: opts.wmsDeliverer.loading,
          onFetchMore: opts.wmsDeliverer.onFetchMore,
          onSearchChange: opts.wmsDeliverer.onSearchChange
        }
      ),
      active: opts.wmsDeliverer.active
    }
  ];
}
