import React from "react";
import {
  Button,
  makeStyles,
  Theme,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TypographyProps,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { startCase } from "lodash";
import { Link } from "react-router-dom";
import moment from "moment";

import { Site, SiteUploadHistory } from "../../../store/Sites/types";
import requests from "../../../helpers/requests";
import { pluralize } from "../../../helpers/stringUtils";

const tableHeaderTitles = [
  "NAME",
  "TIMEZONE",
  "SITE",
  "SURVEY POINT",
  "SENSOR TYPE",
  "UPLOAD DATE",
  "",
];

const tableCellTypographyProps: TypographyProps = {
  color: "textSecondary",
  variant: "subtitle2",
};

const HistoryTable = ({ site, uploadHistory }: HistoryTableProps) => {
  const nUploads = uploadHistory.length;
  const classes = useStyles();
  const { timezone } = site;
  const timezoneAbbreviation = timezone
    ? moment().tz(timezone).zoneAbbr()
    : undefined;
  const dateFormat = "MM/DD/YYYY";

  const dataVizualizationButtonLink = (
    start: string,
    end: string,
    surveyPoint: number
  ) =>
    `/sites/${site.id}${requests.generateUrlQueryParams({
      start,
      end,
      surveyPoint,
    })}`;

  if (nUploads === 0) {
    return null;
  }

  return (
    <div className={classes.root}>
      <Typography variant="h6" gutterBottom>
        {nUploads} {pluralize(nUploads, "file")} previously uploaded
      </Typography>
      <TableContainer>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              {tableHeaderTitles.map((title) => (
                <TableCell key={title} className={classes.headCell}>
                  <Typography {...tableCellTypographyProps}>{title}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {uploadHistory.map(
              ({
                id,
                file,
                surveyPoint,
                sensorType,
                minDate,
                maxDate,
                createdAt,
              }) => (
                <TableRow key={id}>
                  <TableCell component="th" scope="row">
                    <Typography {...tableCellTypographyProps}>
                      {file}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography {...tableCellTypographyProps}>
                      {timezoneAbbreviation || timezone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography {...tableCellTypographyProps}>
                      {site.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography {...tableCellTypographyProps}>
                      {surveyPoint.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography {...tableCellTypographyProps}>
                      {startCase(sensorType)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography {...tableCellTypographyProps}>
                      {moment(createdAt).format(dateFormat)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={dataVizualizationButtonLink(
                        minDate,
                        maxDate,
                        surveyPoint.id
                      )}
                      size="small"
                      variant="outlined"
                      color="primary"
                    >
                      {moment(minDate).format(dateFormat)} -{" "}
                      {moment(maxDate).format(dateFormat)}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  table: {
    minWidth: 1080,
  },
  headCell: {
    backgroundColor: grey[200],
  },
}));

interface HistoryTableProps {
  site: Site;
  uploadHistory: SiteUploadHistory;
}

export default HistoryTable;
