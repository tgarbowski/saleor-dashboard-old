export interface ExportFiles_exportFilse_edges_node {
    id:string;
    createdAt: string;
    message: string;
    url: string;
}

export interface ExportFiles_exportFilse_edges {
    __typename: "OrderCountableEdge";
    node: ExportFiles_exportFilse_edges_node;
}

export interface ExportFiles_exportFilse_pageInfo {
    __typename: "PageInfo";
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
}

export interface ExportFiles_exportFilse{
    edges: ExportFiles_exportFilse_edges[];
    pageInfo: ExportFiles_exportFilse_pageInfo;
}

export interface ExportFiles{
    exportFiles: ExportFiles_exportFilse
}

export interface ExportFilesVariables {
    first?: number | null;
    after?: string | null;
  }