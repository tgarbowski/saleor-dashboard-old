import { stringify as stringifyQs } from "qs";
import urlJoin from "url-join";

import { Pagination, SingleAction } from "../types";

export const talliesListPath = "/tallies";

export type TalliesListUrlQueryParams = Pagination & SingleAction;

export const talliesListUrl = (params?: TalliesListUrlQueryParams): string => {
  if (params === undefined) {
    return talliesListPath;
  } else {
    return urlJoin(talliesListPath, "?" + stringifyQs(params));
  }
};
