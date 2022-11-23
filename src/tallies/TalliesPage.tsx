import { IconProps } from "@material-ui/core/Icon";
import usePaginator, {
  createPaginationState
} from "@saleor/hooks/usePaginator";
import { sectionNames } from "@saleor/intl";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import Container from "../components/Container";
import PageHeader from "../components/PageHeader";
import { PermissionEnum } from "../types/globalTypes";
import {
  useExportFilesQuery,
  useExtMigloCsvMutation,
  useExtTallyCsvMutation
} from "./queries";
import TalliesList from "./components/TalliesList";
import { mapEdgesToItems } from "@saleor/utils/maps";
import TalliesGenerationCard from "./components/TalliesGenerationCard";
import CardSpacer from "@saleor/components/CardSpacer";
import useListSettings from "@saleor/hooks/useListSettings";
import { talliesListUrl, TalliesListUrlQueryParams } from "./urls";
import { ListViews } from "@saleor/types";
import { maybe } from "@saleor/misc";

import {
  DEFAULT_INITIAL_PAGINATION_DATA,
  defaultListSettings
} from "@saleor/config";
import useNavigator from "@saleor/hooks/useNavigator";
import { usePaginationReset } from "@saleor/hooks/usePaginationReset";

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

export interface TalliesListProps {
  params: TalliesListUrlQueryParams;
}

export const TalliesPage: React.FC<TalliesListProps> = ({ params }) => {
  const intl = useIntl();
  const { updateListSettings, settings } = useListSettings(
    ListViews.TALLIES_LIST
  );

  usePaginationReset(talliesListUrl, params, settings.rowNumber);

  const navigate = useNavigator();
  const paginate = usePaginator();

  useEffect(() => {
    navigate(
      talliesListUrl({
        ...params,
        ...DEFAULT_INITIAL_PAGINATION_DATA
      })
    );
  }, [settings.rowNumber]);

  const paginationState = createPaginationState(settings.rowNumber, params);

  const queryVariables = React.useMemo(
    () => ({
      ...paginationState
    }),
    [params, settings.rowNumber]
  );

  const { data, loading } = useExportFilesQuery({
    displayLoader: true,
    variables: queryVariables
  });

  const { loadNextPage, loadPreviousPage, pageInfo } = paginate(
    maybe(() => data?.exportFiles?.pageInfo),
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
      generateMigloCsv({
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
        onUpdateListSettings={updateListSettings}
        settings={settings}
        defaultSettings={defaultListSettings[ListViews.TALLIES_LIST]}
      />
    </Container>
  );
};
TalliesPage.displayName = "TalliesPage";
export default TalliesPage;
