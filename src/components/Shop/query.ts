import gql from "graphql-tag";

import { TypedQuery } from "../../queries";
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
      defaultCurrency
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
      companyAddress{
        firstName
        lastName
        companyName
        streetAddress1
        streetAddress2
        city
        cityArea
        phone
        postalCode
        country{
          country
        }
      }
    }
  }
`;
export const TypedShopInfoQuery = TypedQuery<ShopInfo, {}>(shopInfo);
