import { gql } from "@apollo/client";
import { limitFragment } from "@saleor/fragments/shop";
import makeQuery, { UseQueryOpts } from "@saleor/hooks/makeQuery";

import { TypedQuery } from "../../queries";
import { RefreshLimits, RefreshLimitsVariables } from "./types/RefreshLimits";
import { ShopCountries, ShopCountriesVariables } from "./types/ShopCountries";
import { ShopInfo } from "./types/ShopInfo";

const shopInfo = gql`
  query ShopInfo {
    shop {
      countries {
        country
        code
      }
      defaultCountry {
        code
        country
      }
      defaultWeightUnit
      displayGrossPrices
      domain {
        host
        url
      }
      languages {
        code
        language
      }
      includeTaxesInPrices
      name
      trackInventoryByDefault
      permissions {
        code
        name
      }
      name
      description
      companyAddress {
        firstName
        lastName
        companyName
        streetAddress1
        streetAddress2
        city
        cityArea
        phone
        postalCode
        country {
          code
          country
        }
      }
      version
    }
  }
`;
export const TypedShopInfoQuery = TypedQuery<ShopInfo, {}>(shopInfo);

const shopCountries = gql`
  query ShopCountries($filter: CountryFilterInput) {
    shop {
      countries(filter: $filter) {
        code
        country
      }
    }
  }
`;
export const useShopCountries = makeQuery<
  ShopCountries,
  ShopCountriesVariables
>(shopCountries);

const limitVariables: Record<keyof RefreshLimitsVariables, boolean> = {
  channels: false,
  orders: false,
  productVariants: false,
  staffUsers: false,
  warehouses: false
};
const limitInfo = gql`
  ${limitFragment}
  query RefreshLimits(
    $channels: Boolean!
    $orders: Boolean!
    $productVariants: Boolean!
    $staffUsers: Boolean!
    $warehouses: Boolean!
  ) {
    shop {
      ...ShopLimitFragment
    }
  }
`;
const useBaseShopLimitsQuery = makeQuery<RefreshLimits, RefreshLimitsVariables>(
  limitInfo
);
export const useShopLimitsQuery = (
  opts: UseQueryOpts<Partial<RefreshLimitsVariables>>
) =>
  useBaseShopLimitsQuery({
    ...opts,
    variables: {
      ...limitVariables,
      ...opts.variables
    }
  });
