import { IconProps } from "@material-ui/core/Icon";
import usePaginator, {
  createPaginationState
} from "@saleor/hooks/usePaginator";
import { sectionNames } from "@saleor/intl";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import Container from "../components/Container";
import PageHeader from "../components/PageHeader";
import { PermissionEnum } from "../types/globalTypes";
import {
  useExportFilesQuery,
  useExtMigloCsvMutation,
  useExtTallyCsvMutation
} from "./queries";
import { parse as parseQs } from "qs";
import { asSortParams } from "@saleor/utils/sort";
import TalliesList from "./components/TalliesList";
import { mapEdgesToItems } from "@saleor/utils/maps";
import TalliesGenerationCard from "./components/TalliesGenerationCard";
import CardSpacer from "@saleor/components/CardSpacer";

export interface MenuItem {
  description: string;
  icon: React.ReactElement<IconProps>;
  permissions: PermissionEnum[];
  title: string;
  url?: string;
  testId?: string;
}

export interface MenuSection {
  label: string;
  menuItems: MenuItem[];
}

export const TalliesPage: React.FC = () => {
  const intl = useIntl();
  const paginate = usePaginator();

  const qs = parseQs(location.search.substr(1));
  const params: any = asSortParams(qs, null);

  const paginationState = createPaginationState(20, params);

  const queryVariables = React.useMemo(
    () => ({
      ...paginationState
    }),
    [params]
  );
  const { data, loading } = useExportFilesQuery({
    displayLoader: true,
    variables: queryVariables
  });

  const { loadNextPage, loadPreviousPage, pageInfo } = paginate(
    data?.exportFiles?.pageInfo,
    paginationState,
    params
  );
  const [generateTallyCsv] = useExtTallyCsvMutation({});
  const [generateMigloCsv] = useExtMigloCsvMutation({});
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const generateCurrentMonthTally = () => {
    generateTallyCsv({
      variables: { month: month.toString(), year: year.toString() }
    });
  };
  const generatePreviousMonthTally = () => {
    if (month === 1) {
      generateTallyCsv({
        variables: { month: "12", year: (year - 1).toString() }
      });
    } else {
      generateTallyCsv({
        variables: { month: (month - 1).toString(), year: year.toString() }
      });
    }
  };

  const generateCurrentMonthMiglo = () => {
    generateMigloCsv({
      variables: { month: month.toString(), year: year.toString() }
    });
  };
  const generatePreviousMonthMiglo = () => {
    if (month === 1) {
      generateMigloCsv({
        variables: { month: "12", year: (year - 1).toString() }
      });
    } else {
      generateMigloCsv({
        variables: { month: (month - 1).toString(), year: year.toString() }
      });
    }
  };

  const [tallyMonthInput, setTallyMonthInput] = useState<string>("");
  const [tallyYearInput, setTallyYearInput] = useState<string>("");
  const [migloMonthInput, setMigloMonthInput] = useState<string>("");
  const [migloYearInput, setMigloYearInput] = useState<string>("");

  const handleTallyMonthInputChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    setTallyMonthInput(event.currentTarget.value);
  };
  const handleTallyYearInputChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    setTallyYearInput(event.currentTarget.value);
  };
  const generateCustomDateTally = () => {
    if (
      !!tallyMonthInput &&
      !!tallyYearInput &&
      0 < parseInt(tallyMonthInput, 10) &&
      parseInt(tallyMonthInput, 10) <= 12
    ) {
      generateTallyCsv({
        variables: { month: tallyMonthInput, year: tallyYearInput }
      });
    }
  };

  const handleMigloMonthInputChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    setMigloMonthInput(event.currentTarget.value);
  };
  const handleMigloYearInputChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    setMigloYearInput(event.currentTarget.value);
  };
  const generateCustomDateMiglo = () => {
    if (
      !!migloMonthInput &&
      !!migloYearInput &&
      0 < parseInt(migloMonthInput, 10) &&
      parseInt(migloMonthInput, 10) <= 12
    ) {
      generateTallyCsv({
        variables: { month: migloMonthInput, year: migloYearInput }
      });
    }
  };

  return (
    <Container>
      <PageHeader title={intl.formatMessage(sectionNames.tallies)} />
      <TalliesGenerationCard
        month={month}
        year={year}
        generateCurrentMonthTally={generateCurrentMonthTally}
        generatePreviousMonthTally={generatePreviousMonthTally}
        generateCurrentMonthMiglo={generateCurrentMonthMiglo}
        generatePreviousMonthMiglo={generatePreviousMonthMiglo}
        tallyMonthInput={tallyMonthInput}
        handleTallyMonthInputChange={handleTallyMonthInputChange}
        tallyYearInput={tallyYearInput}
        handleTallyYearInputChange={handleTallyYearInputChange}
        generateCustomDateTally={generateCustomDateTally}
        migloMonthInput={migloMonthInput}
        handleMigloMonthInputChange={handleMigloMonthInputChange}
        migloYearInput={migloYearInput}
        handleMigloYearInputChange={handleMigloYearInputChange}
        generateCustomDateMiglo={generateCustomDateMiglo}
      />
      <CardSpacer />
      <TalliesList
        exportFiles={mapEdgesToItems(data?.exportFiles)}
        onNextPage={loadNextPage}
        onPreviousPage={loadPreviousPage}
        onRowClick={null}
        pageInfo={pageInfo}
        disabled={loading}
      />
    </Container>
  );
};
TalliesPage.displayName = "TalliesPage";
export default TalliesPage;
