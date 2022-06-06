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

export const ExtInvoiceCorrectionRequestMutation = gql`
  mutation ExtInvoiceCorrectionRequest($orderId: ID!) {
    extInvoiceCorrectionRequest(orderId: $orderId) {
      invoice {
        id
      }
      order {
        id
      }
      errors {
        field
        message
        code
      }
    }
  }
`;
