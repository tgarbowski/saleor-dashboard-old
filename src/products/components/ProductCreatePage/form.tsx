import { OutputData } from "@editorjs/editorjs";
import { getAttributesDisplayData } from "@saleor/attributes/utils/data";
import {
  createAttributeChangeHandler,
  createAttributeFileChangeHandler,
  createAttributeMultiChangeHandler,
  createAttributeReferenceChangeHandler,
  createAttributeValueReorderHandler,
  createFetchMoreReferencesHandler,
  createFetchReferencesHandler
} from "@saleor/attributes/utils/handlers";
import { getTokens } from "@saleor/auth";
import { ChannelData, ChannelPriceArgs } from "@saleor/channels/utils";
import {
  AttributeInput,
  AttributeInputData
} from "@saleor/components/Attributes";
import { MetadataFormData } from "@saleor/components/Metadata";
import { MultiAutocompleteChoiceType } from "@saleor/components/MultiAutocompleteSelectField";
import { RichTextEditorChange } from "@saleor/components/RichTextEditor";
import { SingleAutocompleteChoiceType } from "@saleor/components/SingleAutocompleteSelectField";
import useForm, { FormChange } from "@saleor/hooks/useForm";
import useFormset, {
  FormsetChange,
  FormsetData
} from "@saleor/hooks/useFormset";
import {
  useProductVariantsSkus,
  useUserWithMetadata
} from "@saleor/products/queries";
import { ProductType_productType } from "@saleor/products/types/ProductType";
import { ProductVariantsSkusData } from "@saleor/products/types/ProductVariantSkus";
import { UserWithMetadataData } from "@saleor/products/types/UserWithMetadata";
import {
  generateSkuNumberToQuery,
  getAttributeInputFromProductType,
  updateDataFromMegaPackValues
} from "@saleor/products/utils/data";
import {
  createChannelsChangeHandler,
  createChannelsPriceChangeHandler,
  createProductTypeSelectHandler
} from "@saleor/products/utils/handlers";
import {
  validateCostPrice,
  validatePrice
} from "@saleor/products/utils/validation";
import { SearchPages_search_edges_node } from "@saleor/searches/types/SearchPages";
import { SearchProducts_search_edges_node } from "@saleor/searches/types/SearchProducts";
import { SearchProductTypes_search_edges_node } from "@saleor/searches/types/SearchProductTypes";
import { SearchWarehouses_search_edges_node } from "@saleor/searches/types/SearchWarehouses";
import { FetchMoreProps, ReorderEvent } from "@saleor/types";
import createMultiAutocompleteSelectHandler from "@saleor/utils/handlers/multiAutocompleteSelectChangeHandler";
import createSingleAutocompleteSelectHandler from "@saleor/utils/handlers/singleAutocompleteSelectChangeHandler";
import useMetadataChangeTrigger from "@saleor/utils/metadata/useMetadataChangeTrigger";
import useRichText from "@saleor/utils/richText/useRichText";
import React from "react";

import { ProductStockFormsetData, ProductStockInput } from "../ProductStocks";

export interface ProductCreateFormData extends MetadataFormData {
  category: string;
  changeTaxCode: boolean;
  channelListings: ChannelData[];
  chargeTaxes: boolean;
  collections: string[];
  description: OutputData;
  isAvailable: boolean;
  name: string;
  productType: ProductType_productType;
  rating: number;
  seoDescription: string;
  seoTitle: string;
  sku: string;
  slug: string;
  stockQuantity: number;
  taxCode: string;
  trackInventory: boolean;
  weight: string;
  megaPackProduct: string;
}
export interface ProductCreateData extends ProductCreateFormData {
  attributes: AttributeInput[];
  attributesWithNewFileValue: FormsetData<null, File>;
  stocks: ProductStockInput[];
}

export interface ProductCreateHandlers
  extends Record<
      | "changeMetadata"
      | "selectCategory"
      | "selectCollection"
      | "selectProductType"
      | "selectTaxRate",
      FormChange
    >,
    Record<
      "changeStock" | "selectAttribute" | "selectAttributeMultiple",
      FormsetChange<string>
    >,
    Record<"changeChannelPrice", (id: string, data: ChannelPriceArgs) => void>,
    Record<
      "changeChannels",
      (
        id: string,
        data: Omit<ChannelData, "name" | "price" | "currency" | "id">
      ) => void
    >,
    Record<"selectAttributeReference", FormsetChange<string[]>>,
    Record<"selectAttributeFile", FormsetChange<File>>,
    Record<"reorderAttributeValue", FormsetChange<ReorderEvent>>,
    Record<"addStock" | "deleteStock", (id: string) => void> {
  changeDescription: RichTextEditorChange;
  fetchReferences: (value: string) => void;
  fetchMoreReferences: FetchMoreProps;
}
export interface UseProductCreateFormResult {
  change: FormChange;
  data: ProductCreateData;
  disabled: boolean;
  handlers: ProductCreateHandlers;
  hasChanged: boolean;
  submit: () => Promise<boolean>;
}

export interface UseProductCreateFormOpts
  extends Record<
    "categories" | "collections" | "taxTypes",
    SingleAutocompleteChoiceType[]
  > {
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  setSelectedCollections: React.Dispatch<
    React.SetStateAction<MultiAutocompleteChoiceType[]>
  >;
  setSelectedTaxType: React.Dispatch<React.SetStateAction<string>>;
  setChannels: (channels: ChannelData[]) => void;
  selectedCollections: MultiAutocompleteChoiceType[];
  productTypes: SearchProductTypes_search_edges_node[];
  warehouses: SearchWarehouses_search_edges_node[];
  currentChannels: ChannelData[];
  referencePages: SearchPages_search_edges_node[];
  referenceProducts: SearchProducts_search_edges_node[];
  fetchReferencePages?: (data: string) => void;
  fetchMoreReferencePages?: FetchMoreProps;
  fetchReferenceProducts?: (data: string) => void;
  fetchMoreReferenceProducts?: FetchMoreProps;
  assignReferencesAttributeId?: string;
  selectedProductType?: ProductType_productType;
  onSelectProductType: (productTypeId: string) => void;
}

export interface ProductCreateFormProps extends UseProductCreateFormOpts {
  children: (props: UseProductCreateFormResult) => React.ReactNode;
  initial?: Partial<ProductCreateFormData>;
  onSubmit: (data: ProductCreateData) => Promise<boolean>;
}

function useProductCreateForm(
  initial: Partial<ProductCreateFormData>,
  skusCount: ProductVariantsSkusData,
  userData: UserWithMetadataData,
  onSubmit: (data: ProductCreateData) => Promise<boolean>,
  opts: UseProductCreateFormOpts
): UseProductCreateFormResult {
  const defaultInitialFormData: ProductCreateFormData &
    Record<"productType", string> = {
    category: "",
    changeTaxCode: false,
    channelListings: opts.currentChannels,
    chargeTaxes: false,
    collections: [],
    description: null,
    isAvailable: false,
    megaPackProduct: "",
    metadata: [],
    name: "",
    privateMetadata: [],
    productType: null,
    rating: 0,
    seoDescription: "",
    seoTitle: "",
    sku: "",
    slug: "",
    stockQuantity: null,
    taxCode: null,
    trackInventory: false,
    weight: ""
  };
  const [changed, setChanged] = React.useState(false);
  const triggerChange = () => setChanged(true);

  const form = useForm({
    ...initial,
    ...defaultInitialFormData
  });

  const [sku, setSkuCode] = React.useState(form?.data?.sku);

  const attributes = useFormset<AttributeInputData>(
    opts.selectedProductType
      ? getAttributeInputFromProductType(opts.selectedProductType)
      : []
  );
  const attributesWithNewFileValue = useFormset<null, File>([]);
  const stocks = useFormset<ProductStockFormsetData>([]);
  const [description, changeDescription] = useRichText({
    initial: null,
    triggerChange
  });

  const {
    makeChangeHandler: makeMetadataChangeHandler
  } = useMetadataChangeTrigger();

  const handleChange: FormChange = (event, cb) => {
    form.change(event, cb);
    triggerChange();
  };
  const handleCollectionSelect = createMultiAutocompleteSelectHandler(
    form.toggleValue,
    opts.setSelectedCollections,
    opts.selectedCollections,
    opts.collections
  );
  const handleCategorySelect = createSingleAutocompleteSelectHandler(
    handleChange,
    opts.setSelectedCategory,
    opts.categories
  );
  const handleAttributeChange = createAttributeChangeHandler(
    attributes.change,
    triggerChange
  );
  const handleAttributeMultiChange = createAttributeMultiChangeHandler(
    attributes.change,
    attributes.data,
    triggerChange
  );
  const handleAttributeReferenceChange = createAttributeReferenceChangeHandler(
    attributes.change,
    triggerChange
  );
  const handleFetchReferences = createFetchReferencesHandler(
    attributes.data,
    opts.assignReferencesAttributeId,
    opts.fetchReferencePages,
    opts.fetchReferenceProducts
  );
  const handleFetchMoreReferences = createFetchMoreReferencesHandler(
    attributes.data,
    opts.assignReferencesAttributeId,
    opts.fetchMoreReferencePages,
    opts.fetchMoreReferenceProducts
  );
  const handleAttributeFileChange = createAttributeFileChangeHandler(
    attributes.change,
    attributesWithNewFileValue.data,
    attributesWithNewFileValue.add,
    attributesWithNewFileValue.change,
    triggerChange
  );
  const handleAttributeValueReorder = createAttributeValueReorderHandler(
    attributes.change,
    attributes.data,
    triggerChange
  );
  const handleProductTypeSelect = createProductTypeSelectHandler(
    opts.onSelectProductType,
    setSkuCode,
    skusCount,
    userData,
    triggerChange
  );
  const handleStockChange: FormsetChange<string> = (id, value) => {
    triggerChange();
    stocks.change(id, value);
  };
  const handleStockAdd = (id: string) => {
    triggerChange();
    stocks.add({
      data: {
        quantityAllocated: 0
      },
      id,
      label: opts.warehouses.find(warehouse => warehouse.id === id).name,
      value: "0"
    });
  };
  const handleStockDelete = (id: string) => {
    triggerChange();
    stocks.remove(id);
  };
  const handleTaxTypeSelect = createSingleAutocompleteSelectHandler(
    handleChange,
    opts.setSelectedTaxType,
    opts.taxTypes
  );
  const changeMetadata = makeMetadataChangeHandler(handleChange);
  const handleChannelsChange = createChannelsChangeHandler(
    opts.currentChannels,
    opts.setChannels,
    triggerChange
  );
  const handleChannelPriceChange = createChannelsPriceChangeHandler(
    opts.currentChannels,
    opts.setChannels,
    triggerChange
  );

  const getData = (): ProductCreateData => ({
    ...form.data,
    attributes: getAttributesDisplayData(
      attributes.data,
      attributesWithNewFileValue.data,
      opts.referencePages,
      opts.referenceProducts
    ),
    attributesWithNewFileValue: attributesWithNewFileValue.data,
    description: description.current,
    productType: opts.selectedProductType,
    stocks: stocks.data
  });
  const data = getData();
  const submit = () => onSubmit(data);

  const disabled =
    !opts.selectedProductType?.hasVariants &&
    (!data.sku ||
      data.channelListings.some(
        channel =>
          validatePrice(channel.price) || validateCostPrice(channel.costPrice)
      ) ||
      !data.category);

  updateDataFromMegaPackValues(form.data, form.data.megaPackProduct);

  form.data.sku = sku;

  return {
    change: handleChange,
    data,
    disabled,
    handlers: {
      addStock: handleStockAdd,
      changeChannelPrice: handleChannelPriceChange,
      changeChannels: handleChannelsChange,
      changeDescription,
      changeMetadata,
      changeStock: handleStockChange,
      deleteStock: handleStockDelete,
      fetchMoreReferences: handleFetchMoreReferences,
      fetchReferences: handleFetchReferences,
      reorderAttributeValue: handleAttributeValueReorder,
      selectAttribute: handleAttributeChange,
      selectAttributeFile: handleAttributeFileChange,
      selectAttributeMultiple: handleAttributeMultiChange,
      selectAttributeReference: handleAttributeReferenceChange,
      selectCategory: handleCategorySelect,
      selectCollection: handleCollectionSelect,
      selectProductType: handleProductTypeSelect,
      selectTaxRate: handleTaxTypeSelect
    },
    hasChanged: changed,
    submit
  };
}

const ProductCreateForm: React.FC<ProductCreateFormProps> = ({
  children,
  initial,
  onSubmit,
  ...rest
}) => {
  const { ...values } = useUserWithMetadata({
    displayLoader: true,
    variables: {
      id: getTokens().id
    }
  });

  const { data } = useProductVariantsSkus({
    displayLoader: true,
    variables: { sku: generateSkuNumberToQuery(values.data) }
  });

  const props = useProductCreateForm(
    initial || {},
    data,
    values.data,
    onSubmit,
    rest
  );

  return <form onSubmit={props.submit}>{children(props)}</form>;
};

ProductCreateForm.displayName = "ProductCreateForm";
export default ProductCreateForm;
