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
  Theme,
  Skeleton,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { createStyles, WithStyles } from '@mui/styles';
import { times } from 'lodash';
import React from 'react';

export type ColumnDef<T> = {
  field: keyof T | ((row: T) => string | number);
  header: string;
} & TableCellProps;

type ObjectWithId = {
  id: string | number;
};

type ReefCheckSurveyTableIncomingProps<T extends ObjectWithId> = {
  data: T[];
  columns: ColumnDef<T>[];
  title: string;
  loading?: boolean | null;
  description?: string;
};

const ReefCheckSurveyTableComponent = <T extends ObjectWithId>({
  data,
  columns,
  title,
  loading,
  description = '',
  classes,
}: ReefCheckSurveyTableProps<T>) => {
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
            {loading &&
              times(3).map((index) => (
                <TableRow key={index}>
                  {columns.map(({ header, field, ...props }) => (
                    <TableCell key={header} {...props}>
                      <Skeleton animation="wave" className={classes.skeleton} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!loading &&
              data.map((row) => (
                <TableRow key={row.id}>
                  {columns.map(({ header, field, ...props }) => {
                    const value =
                      typeof field === 'function' ? field(row) : row[field];
                    return (
                      <TableCell key={header} {...props}>
                        {value as React.ReactNode}
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
    skeleton: {
      backgroundColor: '#E2E2E2',
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

type ReefCheckSurveyTableProps<T extends ObjectWithId> =
  ReefCheckSurveyTableIncomingProps<T> & WithStyles<typeof styles>;

export const ReefCheckSurveyTable = withStyles(styles)(
  ReefCheckSurveyTableComponent,
) as <T extends ObjectWithId>(
  props: ReefCheckSurveyTableIncomingProps<T>,
) => React.ReactElement;
