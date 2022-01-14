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

import { Site, SiteUploadHistory } from "../../../store/Sites/types";
import requests from "../../../helpers/requests";

const tableHeaderTitles = [
  "NAME",
  "TIMEZONE",
  "SITE",
  "SURVEY POINT",
  "SENSOR TYPE",
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

  const dataVizualizationButtonLink = (start: string, end: string) =>
    `/sites/${site.id}${requests.generateUrlQueryParams({ start, end })}`;

  if (nUploads === 0) {
    return null;
  }

  return (
    <div className={classes.root}>
      <Typography variant="h6" gutterBottom>
        {nUploads} files previously uploaded
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
              ({ id, file, surveyPoint, sensorType, minDate, maxDate }) => (
                <TableRow key={id}>
                  <TableCell component="th" scope="row">
                    <Typography {...tableCellTypographyProps}>
                      {file}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography {...tableCellTypographyProps}>
                      {timezone}
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
                    <Button
                      component={Link}
                      to={dataVizualizationButtonLink(minDate, maxDate)}
                      size="small"
                      variant="outlined"
                      color="primary"
                    >
                      SEE DATA VIZUALIZATION
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
