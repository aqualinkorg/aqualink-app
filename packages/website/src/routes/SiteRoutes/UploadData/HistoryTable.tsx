import React from 'react';
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
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { startCase } from 'lodash';
import { Link } from 'react-router-dom';
import { Site, SiteUploadHistory } from 'store/Sites/types';
import requests from 'helpers/requests';
import { pluralize } from 'helpers/stringUtils';
import DeleteButton from 'common/DeleteButton';
import { DateTime } from 'luxon';

const tableHeaderTitles = [
  'NAME',
  'TIMEZONE',
  'SITE',
  'SURVEY POINT',
  'SENSOR TYPE',
  'UPLOAD DATE',
  'DATA RANGE',
  '',
];

const tableCellTypographyProps: TypographyProps = {
  color: 'textSecondary',
  variant: 'subtitle2',
};

const HistoryTable = ({ site, uploadHistory, onDelete }: HistoryTableProps) => {
  const nUploads = uploadHistory.length;
  const classes = useStyles();
  const { timezone } = site;
  const timezoneAbbreviation = timezone
    ? DateTime.local().setZone(timezone).toFormat('zzz')
    : undefined;
  const dateFormat = 'LL/dd/yyyy';

  const dataVisualizationButtonLink = (
    start: string,
    end: string,
    surveyPoint: number,
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
      <div>
        <Typography variant="h6" gutterBottom>
          {nUploads} {pluralize(nUploads, 'file')} previously uploaded
        </Typography>
      </div>
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
              }) => {
                const row = [
                  file,
                  timezoneAbbreviation || timezone,
                  site.name,
                  surveyPoint.name,
                  startCase(sensorType),
                  DateTime.fromISO(createdAt).toFormat(dateFormat),
                ];
                return (
                  <TableRow key={id}>
                    {row.map((item) => (
                      <TableCell>
                        <Typography {...tableCellTypographyProps}>
                          {item}
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        component={Link}
                        to={dataVisualizationButtonLink(
                          minDate,
                          maxDate,
                          surveyPoint.id,
                        )}
                        size="small"
                        variant="outlined"
                        color="primary"
                        className={classes.dateIntervalButton}
                      >
                        {DateTime.fromISO(minDate).toFormat(dateFormat)} -{' '}
                        {DateTime.fromISO(maxDate).toFormat(dateFormat)}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <DeleteButton
                        onConfirm={() => onDelete([id])}
                        content={
                          <Typography color="textSecondary">
                            Are you sure you want to delete file &quot;
                            <span className={classes.bold}>{file}</span>&quot;?
                            Data between dates{' '}
                            <span className={classes.bold}>
                              {DateTime.fromISO(minDate).toFormat(
                                'LL/dd/yyyy HH:mm',
                              )}
                            </span>{' '}
                            and{' '}
                            <span className={classes.bold}>
                              {DateTime.fromISO(maxDate).toFormat(
                                'LL/dd/yyyy HH:mm',
                              )}
                            </span>{' '}
                            will be lost.
                          </Typography>
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              },
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
  bold: {
    fontWeight: 700,
  },
  dateIntervalButton: {
    whiteSpace: 'nowrap',
  },
}));

interface HistoryTableProps {
  site: Site;
  uploadHistory: SiteUploadHistory;
  onDelete: (ids: number[]) => Promise<void>;
}

export default HistoryTable;
