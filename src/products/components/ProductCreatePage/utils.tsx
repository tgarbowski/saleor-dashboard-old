import { MetadataInput } from "@saleor/types/globalTypes";

export const deleteSkusFieldFromPrivateMetadata = (
  privateMetadata: MetadataInput[]
) => privateMetadata.filter(element => element.key !== "skus");
