import { ShopInfo_shop_countries } from "@saleor/components/Shop/types/ShopInfo";
import { SingleAutocompleteChoiceType } from "@saleor/components/SingleAutocompleteSelectField";
import { AddressTypeInput } from "@saleor/customers/types";
import {
  CustomerAddresses_user_addresses,
  CustomerAddresses_user_defaultBillingAddress,
  CustomerAddresses_user_defaultShippingAddress
} from "@saleor/customers/types/CustomerAddresses";
import useForm, { FormChange } from "@saleor/hooks/useForm";
import createSingleAutocompleteSelectHandler from "@saleor/utils/handlers/singleAutocompleteSelectChangeHandler";
import React, { useState } from "react";

export enum AddressInputOptionEnum {
  CUSTOMER_ADDRESS = "customerAddress",
  NEW_ADDRESS = "newAddress"
}

export interface OrderCustomerAddressesEditFormData {
  cloneAddress: boolean;
  shippingAddressInputOption: AddressInputOptionEnum;
  billingAddressInputOption: AddressInputOptionEnum;
  customerShippingAddress: CustomerAddresses_user_defaultShippingAddress;
  customerBillingAddress: CustomerAddresses_user_defaultBillingAddress;
  shippingAddress: AddressTypeInput;
  billingAddress: AddressTypeInput;
}

export interface OrderCustomerAddressesEditData
  extends OrderCustomerAddressesEditFormData {
  shippingCountryDisplayName: string;
  billingCountryDisplayName: string;
}

export interface OrderCustomerAddressesEditHandlers {
  changeFormAddress: (
    event: React.ChangeEvent<any>,
    addressType: "shippingAddress" | "billingAddress"
  ) => void;
  changeCustomerAddress: (
    customerAddress: CustomerAddresses_user_addresses,
    addressType: "customerShippingAddress" | "customerBillingAddress"
  ) => void;
  selectShippingCountry: FormChange;
  selectBillingCountry: FormChange;
}

interface UseOrderCustomerAddressesEditFormResult {
  submit: (event: React.FormEvent<any>) => void;
  change: FormChange;
  hasChanged: boolean;
  data: OrderCustomerAddressesEditData;
  handlers: OrderCustomerAddressesEditHandlers;
}

interface UseOrderCustomerAddressesEditFormOpts {
  countryChoices: SingleAutocompleteChoiceType[];
  countries: ShopInfo_shop_countries[];
  defaultShippingAddress: CustomerAddresses_user_defaultShippingAddress;
  defaultBillingAddress: CustomerAddresses_user_defaultBillingAddress;
  defaultCloneAddress: boolean;
}

export interface OrderCustomerAddressesEditFormProps
  extends UseOrderCustomerAddressesEditFormOpts {
  children: (props: UseOrderCustomerAddressesEditFormResult) => React.ReactNode;
  initial?: Partial<OrderCustomerAddressesEditFormData>;
  onSubmit: (data: OrderCustomerAddressesEditData) => void;
}

function useOrderCustomerAddressesEditForm(
  providedInitialFormData: Partial<OrderCustomerAddressesEditFormData>,
  onSubmit: (data: OrderCustomerAddressesEditData) => void,
  opts: UseOrderCustomerAddressesEditFormOpts
): UseOrderCustomerAddressesEditFormResult {
  const emptyAddress: AddressTypeInput = {
    city: "",
    country: "",
    phone: "",
    postalCode: "",
    streetAddress1: ""
  };
  const defaultInitialFormData: OrderCustomerAddressesEditFormData = {
    cloneAddress: opts.defaultCloneAddress,
    shippingAddressInputOption: AddressInputOptionEnum.CUSTOMER_ADDRESS,
    billingAddressInputOption: AddressInputOptionEnum.CUSTOMER_ADDRESS,
    customerShippingAddress: opts.defaultShippingAddress,
    customerBillingAddress: opts.defaultBillingAddress,
    shippingAddress: emptyAddress,
    billingAddress: emptyAddress
  };

  const initialData = {
    ...defaultInitialFormData,
    ...providedInitialFormData
  };

  const form = useForm({
    ...initialData
  });

  const [changed, setChanged] = useState(false);
  const triggerChange = () => setChanged(true);

  const [shippingCountryDisplayName, setShippingCountryDisplayName] = useState(
    opts.countries.find(
      country => initialData.shippingAddress.country === country.code
    )?.country
  );
  const [billingCountryDisplayName, setBillingCountryDisplayName] = useState(
    opts.countries.find(
      country => initialData.billingAddress.country === country.code
    )?.country
  );

  const handleChange: FormChange = (event, cb) => {
    form.change(event, cb);
    triggerChange();
  };
  const handleFormAddressChange = (
    event: React.ChangeEvent<any>,
    addressType: "shippingAddress" | "billingAddress"
  ) =>
    form.change({
      target: {
        name: addressType,
        value: {
          ...form.data[addressType],
          [event.target.name]: event.target.value
        }
      }
    });
  const handleCustomerAddressChange = (
    customerAddress: CustomerAddresses_user_addresses,
    addressType: "customerShippingAddress" | "customerBillingAddress"
  ) =>
    form.change({
      target: {
        name: addressType,
        value: customerAddress
      }
    });
  const handleShippingCountrySelect = createSingleAutocompleteSelectHandler(
    event =>
      form.change({
        target: {
          name: "shippingAddress",
          value: {
            ...form.data.shippingAddress,
            [event.target.name]: event.target.value
          }
        }
      }),
    setShippingCountryDisplayName,
    opts.countryChoices
  );
  const handleBillingCountrySelect = createSingleAutocompleteSelectHandler(
    event =>
      form.change({
        target: {
          name: "billingAddress",
          value: {
            ...form.data.billingAddress,
            [event.target.name]: event.target.value
          }
        }
      }),
    setBillingCountryDisplayName,
    opts.countryChoices
  );

  const data = {
    ...form.data,
    shippingCountryDisplayName,
    billingCountryDisplayName
  };

  const submit = (event: React.FormEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();
    return onSubmit(data);
  };

  return {
    change: handleChange,
    submit,
    hasChanged: changed,
    data,
    handlers: {
      changeCustomerAddress: handleCustomerAddressChange,
      changeFormAddress: handleFormAddressChange,
      selectShippingCountry: handleShippingCountrySelect,
      selectBillingCountry: handleBillingCountrySelect
    }
  };
}

const OrderCustomerAddressesEditForm: React.FC<OrderCustomerAddressesEditFormProps> = ({
  children,
  initial,
  onSubmit,
  ...rest
}) => {
  const props = useOrderCustomerAddressesEditForm(
    initial || {},
    onSubmit,
    rest
  );

  return <form onSubmit={props.submit}>{children(props)}</form>;
};

OrderCustomerAddressesEditForm.displayName = "OrderCustomerAddressesEditForm";
export default OrderCustomerAddressesEditForm;
