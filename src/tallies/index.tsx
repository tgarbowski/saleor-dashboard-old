import { WindowTitle } from "@saleor/components/WindowTitle";

import { sectionNames } from "@saleor/intl";
import { parse as parseQs } from "qs";
import React from "react";
import { useIntl } from "react-intl";
import TalliesPage from "./TalliesPage";
import { TalliesListUrlQueryParams } from "./urls";

export const talliesSection = "/tallies/";

export const TalliesSection: React.FC = () => {
  const intl = useIntl();

  const params: TalliesListUrlQueryParams = parseQs(location.search.substr(1));

  return (
    <>
      <WindowTitle title={intl.formatMessage(sectionNames.tallies)} />
      <TalliesPage params={params} />
    </>
  );
};
export default TalliesSection;
