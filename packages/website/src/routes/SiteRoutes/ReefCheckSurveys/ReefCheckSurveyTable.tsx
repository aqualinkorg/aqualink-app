import {
  TableContainer,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableCellProps,
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { reefCheckSurveySelector } from 'store/ReefCheckSurveys/reefCheckSurveySlice';
import { ReefCheckOrganism } from 'store/ReefCheckSurveys/types';

export type ColumnDef<T> = {
  field: keyof T | ((row: T) => string | number);
  header: string;
} & TableCellProps;

type ReefCheckSurveyTableIncomingProps = {
  columns: ColumnDef<ReefCheckOrganism>[];
  title: string;
  description?: string;
  filter?: (organism: ReefCheckOrganism) => boolean;
};

const ReefCheckSurveyTableComponent = ({
  columns,
  title,
  description = '',
  filter = () => true,
  classes,
}: ReefCheckSurveyTableProps) => {
  const { survey, loading, error } = useSelector(reefCheckSurveySelector);
  const rows = survey?.organisms.filter(filter);

  if (error || !rows) {
    return null;
  }

  if (loading) {
    // TODO: Add skeleton
    return null;
  }

  return (
    <>
      <TableContainer component={Paper} className={classes.paper}>
        <Typography className={classes.title}>{title}</Typography>
        <Typography variant="body2" className={classes.description}>
          {description}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map(({ header, field, ...props }) => (
                <TableCell key={header} className={classes.header} {...props}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                {columns.map(({ header, field, ...props }) => {
                  const value =
                    typeof field === 'function' ? field(row) : row[field];
                  return (
                    <TableCell key={header} {...props}>
                      {value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      padding: 16,
      color: theme.palette.text.secondary,
    },
    title: {
      textTransform: 'uppercase',
    },
    description: {
      margin: '8px 0',
    },
    header: {
      backgroundColor: '#FAFAFA',
      borderBottom: '1px solid black',
      borderTop: '1px solid rgba(224, 224, 224, 1)',
    },
  });

type ReefCheckSurveyTableProps = ReefCheckSurveyTableIncomingProps &
  WithStyles<typeof styles>;

export const ReefCheckSurveyTable = withStyles(styles)(
  ReefCheckSurveyTableComponent,
);
