import { gql } from "@apollo/client";
import { metadataErrorFragment } from "@saleor/fragments/errors";
import makeMutation from "@saleor/hooks/makeMutation";

import { metadataFragment } from "../../fragments/metadata";
import {
  UpdatePrivateMetadata,
  UpdatePrivateMetadataVariables
} from "./types/UpdatePrivateMetadata";

const updateMegapackPrivateMetadata = gql`
  ${metadataFragment}
  ${metadataErrorFragment}
  mutation UpdateMegapackPrivateMetadata($id: ID!, $input: [MetadataInput!]!) {
    updateMegapackPrivateMetadata(id: $id, input: $input) {
      errors {
        ...MetadataErrorFragment
      }
      item {
        ...MetadataFragment
        ... on Node {
          id
        }
      }
    }
  }
`;

export const useMegapackPrivateMetadataUpdate = makeMutation<
  UpdatePrivateMetadata,
  UpdatePrivateMetadataVariables
>(updateMegapackPrivateMetadata);
