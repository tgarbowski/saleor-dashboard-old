import { pageInfoFragment } from "@saleor/fragments/pageInfo";
import makeTopLevelSearch from "@saleor/hooks/makeTopLevelSearch";
import gql from "graphql-tag";

import {
  SearchWMSDeliverers,
  SearchWMSDeliverersVariables
} from "./types/SearchWMSDeliverers";

export const searchWMSDeliverers = gql`
  ${pageInfoFragment}
  query SearchWMSDeliverers($after: String, $first: Int!, $query: String!) {
    search: wmsDeliverers(
      after: $after
      first: $first
      filter: { search: $query }
    ) {
      edges {
        node {
          id
          companyName
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
`;

export default makeTopLevelSearch<
  SearchWMSDeliverers,
  SearchWMSDeliverersVariables
>(searchWMSDeliverers);
