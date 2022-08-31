import React from "react";
import { Button } from "@saleor/macaw-ui";
import { Card, CardContent } from "@material-ui/core";
import CardTitle from "@saleor/components/CardTitle";
import { FormattedMessage, useIntl } from "react-intl";
import CardSpacer from "@saleor/components/CardSpacer";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  monthInput: {
    outline: "1px",
    font: "inherit",
    margin: "20px 0px 0px 4px",
    padding: "6px",
    minWidth: "0px",
    background: "none",
    boxSizing: "content-box",
    borderRadius: "4px",
    letterSpacing: "inherit",
    display: "inline-block",
    width: "50px"
  },
  yearInput: {
    outline: "1px",
    font: "inherit",
    margin: "20px 0px 2px 4px",
    padding: "6px",
    minWidth: "0px",
    background: "none",
    boxSizing: "content-box",
    borderRadius: "4px",
    letterSpacing: "inherit",
    display: "inline-block",
    width: "80px"
  },
  generateButton: {
    padding: "6px",
    margin: "4px",
    display: "block"
  }
});

export interface TalliesGenerationCardProps {
  month: number;
  year: number;
  generateCurrentMonthTally: () => void;
  generatePreviousMonthTally: () => void;
  generateCurrentMonthMiglo: () => void;
  generatePreviousMonthMiglo: () => void;
  tallyMonthInput: string;
  handleTallyMonthInputChange: (
    event: React.FormEvent<HTMLInputElement>
  ) => void;
  tallyYearInput: string;
  handleTallyYearInputChange: (
    event: React.FormEvent<HTMLInputElement>
  ) => void;
  generateCustomDateTally: () => void;
  migloMonthInput: string;
  handleMigloMonthInputChange: (
    event: React.FormEvent<HTMLInputElement>
  ) => void;
  migloYearInput: string;
  handleMigloYearInputChange: (
    event: React.FormEvent<HTMLInputElement>
  ) => void;
  generateCustomDateMiglo: () => void;
}

const TalliesGenerationCard: React.FC<TalliesGenerationCardProps> = props => {
  const {
    month,
    year,
    generateCurrentMonthTally,
    generatePreviousMonthTally,
    generateCurrentMonthMiglo,
    generatePreviousMonthMiglo,
    tallyMonthInput,
    handleTallyMonthInputChange,
    tallyYearInput,
    handleTallyYearInputChange,
    generateCustomDateTally,
    migloMonthInput,
    handleMigloMonthInputChange,
    migloYearInput,
    handleMigloYearInputChange,
    generateCustomDateMiglo
  } = props;
  const intl = useIntl();
  const classes = useStyles();

  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;

  return (
    <div>
      <Card>
        <CardTitle
          title={intl.formatMessage({
            defaultMessage: "Tallies generation",
            description: "section header"
          })}
        />
        <CardContent>
          <Button
            className={classes.generateButton}
            onClick={generateCurrentMonthTally}
          >
            {`Wygeneruj zestawienie Tally z aktualnego miesiąca (${month}/${year})`}
          </Button>
          <Button
            className={classes.generateButton}
            onClick={generatePreviousMonthTally}
          >
            {`Wygeneruj zestawienie Tally z poprzedniego miesiąca (${previousMonth}/${previousYear})`}
          </Button>
          <input
            className={classes.monthInput}
            type="text"
            value={tallyMonthInput}
            onChange={handleTallyMonthInputChange}
            placeholder="MM"
          />
          <input
            className={classes.yearInput}
            type="text"
            value={tallyYearInput}
            onChange={handleTallyYearInputChange}
            placeholder="YYYY"
          />
          <Button
            className={classes.generateButton}
            onClick={generateCustomDateTally}
          >
            <FormattedMessage
              defaultMessage="Wygeneruj zestawienie Tally z wybranej daty"
              description=""
            />
          </Button>
        </CardContent>
      </Card>
      <CardSpacer />
      <Card>
        <CardTitle
          title={intl.formatMessage({
            defaultMessage: "Miglo generation",
            description: "section header"
          })}
        />
        <CardContent>
          <Button
            className={classes.generateButton}
            onClick={generateCurrentMonthMiglo}
          >
            {`Wygeneruj zestawienie Miglo z aktualnego miesiąca (${month}/${year})`}
          </Button>
          <Button
            className={classes.generateButton}
            onClick={generatePreviousMonthMiglo}
          >
            {`Wygeneruj zestawienie Miglo z poprzedniego miesiąca (${previousMonth}/${previousYear})`}
          </Button>
          <input
            className={classes.monthInput}
            type="text"
            value={migloMonthInput}
            onChange={handleMigloMonthInputChange}
            placeholder="MM"
          />
          <input
            className={classes.yearInput}
            type="text"
            value={migloYearInput}
            onChange={handleMigloYearInputChange}
            placeholder="YYYY"
          />
          <Button
            className={classes.generateButton}
            onClick={generateCustomDateMiglo}
          >
            <FormattedMessage
              defaultMessage="Wygeneruj zestawienie Miglo z wybranej daty"
              description=""
            />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TalliesGenerationCard;
