import makeQuery from "@saleor/hooks/makeQuery";
import { gql } from "@apollo/client";
import { ExportFiles, ExportFilesVariables } from "./types/ExportFiles";
import makeMutation from "@saleor/hooks/makeMutation";
import { ExtTallyCsv, ExtTallyCsvVariables } from "./types/ExtTallyCsv";
import { ExtMigloCsv, ExtMigloCsvVariables } from "./types/ExtMigloCsv";

export const talliesListQuery = gql`
  query ExportFiles($first: Int, $after: String, $last: Int, $before: String) {
    exportFiles(
      first: $first
      after: $after
      before: $before
      last: $last
      sortBy: { direction: DESC, field: CREATED_AT }
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          createdAt
          message
          url
        }
      }
    }
  }
`;

export const useExportFilesQuery = makeQuery<ExportFiles, ExportFilesVariables>(
  talliesListQuery
);

export const extTallyCsvMutationMutation = gql`
  mutation ExtTallyCsv($month: String!, $year: String!) {
    extTallyCsv(month: $month, year: $year) {
      errors {
        message
      }
    }
  }
`;

export const useExtTallyCsvMutation = makeMutation<
  ExtTallyCsv,
  ExtTallyCsvVariables
>(extTallyCsvMutationMutation);

export const extMigloCsvMutationMutation = gql`
  mutation ExtMigloCsv($month: String!, $year: String!) {
    extMigloCsv(month: $month, year: $year) {
      errors {
        message
      }
    }
  }
`;

export const useExtMigloCsvMutation = makeMutation<
  ExtMigloCsv,
  ExtMigloCsvVariables
>(extMigloCsvMutationMutation);
