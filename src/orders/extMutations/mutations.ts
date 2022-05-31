import { gql } from "@apollo/client";

export const ExtReceiptRequestMutation = gql`
  mutation ExtReceiptRequest($orderId: ID!) {
    extReceiptRequest(orderId: $orderId) {
      payload
      invoice {
        id
      }
      errors {
        message
        code
      }
    }
  }
`;

export const ExtReceiptUpdateMutation = gql`
  mutation ExtReceiptUpdate($id: ID!, $input: ExtReceiptInput!) {
    extReceiptUpdate(id: $id, input: $input) {
      errors {
        message
      }
    }
  }
`;
