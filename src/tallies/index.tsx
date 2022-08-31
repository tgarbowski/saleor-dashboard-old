import { WindowTitle } from "@saleor/components/WindowTitle";

import { sectionNames } from "@saleor/intl";

import React from "react";
import { useIntl } from "react-intl";
import TalliesPage from "./TalliesPage";

export const talliesSection = "/tallies/";

export const TalliesSection: React.FC = () => {
  const intl = useIntl();

  return (
    <>
      <WindowTitle title={intl.formatMessage(sectionNames.tallies)} />
      <TalliesPage />
    </>
  );
};
export default TalliesSection;
