import React, { useState } from "react";
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
  Checkbox,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { startCase } from "lodash";
import { Link } from "react-router-dom";
import moment from "moment";
import DeleteIcon from "@material-ui/icons/Delete";
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
  "DATA RANGE",
];

const tableCellTypographyProps: TypographyProps = {
  color: "textSecondary",
  variant: "subtitle2",
};

const HistoryTable = ({
  site,
  uploadHistory,
  loading,
  onDelete,
}: HistoryTableProps) => {
  const [selected, setSelected] = useState<number[]>([]);
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

  const onSelectAllClick = (
    _: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (checked) {
      const newSelected = uploadHistory.map((x) => x.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleCheckboxChange = (checked: boolean, id: number) => {
    const selectedIndex = selected.indexOf(id);
    if (checked && selectedIndex === -1) {
      const newSelected = [...selected, id];
      setSelected(newSelected);
    } else if (!checked && selectedIndex > -1) {
      const newSelected = selected.filter((x) => x !== id);
      setSelected(newSelected);
    }
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const deleteSelected = () => {
    onDelete(selected);
  };

  return (
    <div className={classes.root}>
      <div>
        {selected.length === 0 ? (
          <Typography variant="h6" gutterBottom>
            {nUploads} {pluralize(nUploads, "file")} previously uploaded
          </Typography>
        ) : (
          <Typography variant="h6" gutterBottom>
            {selected.length} {pluralize(selected.length, "file")} selected
            <Tooltip title="Delete">
              {loading ? (
                <CircularProgress color="inherit" size={24.5} />
              ) : (
                <IconButton
                  aria-label="delete"
                  className={classes.deleteButton}
                  onClick={() => deleteSelected()}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Tooltip>
          </Typography>
        )}
      </div>
      <TableContainer>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" className={classes.headCell}>
                <Checkbox
                  color="primary"
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < uploadHistory.length
                  }
                  checked={
                    uploadHistory.length > 0 &&
                    selected.length === uploadHistory.length
                  }
                  onChange={onSelectAllClick}
                  inputProps={{
                    "aria-label": "select all desserts",
                  }}
                />
              </TableCell>
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
              }) => {
                const isItemSelected = isSelected(id);
                return (
                  <TableRow key={id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        onChange={(_, checked) =>
                          handleCheckboxChange(checked, id)
                        }
                        color="primary"
                        checked={isItemSelected}
                      />
                    </TableCell>
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
                );
              }
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
  deleteButton: {
    padding: 0,
    marginLeft: "0.5em",
  },
}));

interface HistoryTableProps {
  site: Site;
  uploadHistory: SiteUploadHistory;
  loading: boolean;
  onDelete: (ids: number[]) => Promise<void>;
}

export default HistoryTable;
