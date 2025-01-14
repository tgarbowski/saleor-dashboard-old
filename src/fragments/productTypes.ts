import { gql } from "@apollo/client";

import { attributeFragment } from "./attributes";
import { metadataFragment } from "./metadata";

export const productTypeFragment = gql`
  fragment ProductTypeFragment on ProductType {
    id
    name
    kind
    hasVariants
    isShippingRequired
    slug
    taxType {
      description
      taxCode
    }
  }
`;

export const productTypeDetailsFragment = gql`
  ${attributeFragment}
  ${productTypeFragment}
  ${metadataFragment}
  fragment ProductTypeDetailsFragment on ProductType {
    ...ProductTypeFragment
    ...MetadataFragment
    productAttributes {
      ...AttributeFragment
    }
    variantAttributes {
      ...AttributeFragment
    }
    assignedVariantAttributes {
      attribute {
        ...AttributeFragment
      }
      variantSelection
    }
    weight {
      unit
      value
    }
  }
`;
