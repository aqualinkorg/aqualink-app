import {
  Button,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Tooltip,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { colors } from 'layout/App/theme';
// eslint-disable-next-line import/no-unresolved
import { stringify } from 'csv-stringify/browser/esm/sync';
import React from 'react';
import { downloadBlob } from 'utils/utils';

export type Order = 'asc' | 'desc';

export interface HeadCell<T> {
  id: keyof T;
  label: string;
  tooltipText: string;
  padding?: TableCellProps['padding'];
  width?: string | number;
  align?: 'left' | 'right' | 'inherit' | 'center' | 'justify';
}

export interface BodyCell<T> {
  id: keyof T;
  align?: 'left' | 'right' | 'inherit' | 'center' | 'justify';
  linkTo?: (row: T) => string;
  format?: (row: T) => string;
}

export interface MonitoringTableProps<T> {
  defaultSortColumn?: keyof T;
  defaultOrder?: Order;
  headCells: HeadCell<T>[];
  data: T[];
  bodyCells: BodyCell<T>[];
  showPagination?: boolean;
  downloadCsvFilename?: string;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  // sort a before b
  if (b[orderBy] == null || b[orderBy] < a[orderBy]) {
    return -1;
  }
  // sort a after b
  if (a[orderBy] == null || b[orderBy] > a[orderBy]) {
    return 1;
  }
  // keep original order of a and b
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string | null },
  b: { [key in Key]: number | string | null },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Sorts an array without mutating it. Uses a list of comparators to achieve multi-column sorting.
function stableSort<T>(array: T[], ...comparators: ((a: T, b: T) => number)[]) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  // eslint-disable-next-line fp/no-mutating-methods
  stabilizedThis.sort((a, b) => {
    // eslint-disable-next-line fp/no-mutation
    for (let i = 0; i < comparators.length; i += 1) {
      const order = comparators[i](a[0], b[0]);
      if (order !== 0) {
        return order;
      }
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const rowsPerPageOptions = [10, 20, 50, 100];

function MonitoringTable<
  T extends { [key in keyof T]: string | number | null },
>({
  defaultSortColumn,
  defaultOrder = 'desc',
  headCells,
  data,
  bodyCells,
  showPagination = false,
  downloadCsvFilename,
}: MonitoringTableProps<T>) {
  const classes = useStyles();

  const [order, setOrder] = React.useState<Order>(defaultOrder);
  const [orderBy, setOrderBy] = React.useState<keyof T | undefined>(
    defaultSortColumn,
  );
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(
    rowsPerPageOptions[0],
  );

  const createSortHandler = (property: keyof T) => () => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const downloadCsv = () => {
    if (!downloadCsvFilename) {
      return;
    }

    const str = stringify(data, { header: true });
    const blob = new Blob([str], { type: 'text/csv' });
    downloadBlob(blob, downloadCsvFilename);
  };

  return (
    <Paper>
      {downloadCsvFilename && (
        <Toolbar className={classes.toolbar}>
          <Button
            color="primary"
            variant="outlined"
            onClick={() => downloadCsv()}
          >
            Download CSV
          </Button>
        </Toolbar>
      )}
      <TableContainer style={{ maxHeight: '80vh' }}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: colors.backgroundGray }}>
              {headCells.map((cell) => (
                <TableCell
                  key={cell.id as React.Key}
                  style={{
                    width: cell.width,
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold',
                  }}
                  align={cell.align}
                  padding={cell.padding}
                  sortDirection={orderBy === cell.id ? order : false}
                >
                  <Tooltip title={cell.tooltipText} placement="top">
                    <TableSortLabel
                      active={orderBy === cell.id}
                      direction={orderBy === cell.id ? order : 'asc'}
                      onClick={() => createSortHandler(cell.id)()}
                    >
                      {cell.label}
                      {orderBy === cell.id ? (
                        <span className={classes.visuallyHidden}>
                          {order === 'desc'
                            ? 'sorted descending'
                            : 'sorted ascending'}
                        </span>
                      ) : null}
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(orderBy !== undefined
              ? stableSort<T>(data, getComparator(order, orderBy))
              : data
            )
              .slice(
                showPagination ? page * rowsPerPage : undefined,
                showPagination ? page * rowsPerPage + rowsPerPage : undefined,
              )
              .map((row) => (
                <TableRow hover key={JSON.stringify(row)}>
                  {bodyCells.map((bodyCell) => {
                    const formatted = bodyCell.format
                      ? bodyCell.format(row)
                      : row[bodyCell.id];
                    return (
                      <TableCell
                        key={bodyCell.id as React.Key}
                        align={bodyCell.align}
                      >
                        {bodyCell.linkTo ? (
                          <Link
                            href={bodyCell.linkTo(row)}
                            target="_blank"
                            rel="noreferrer noopener"
                            underline="hover"
                          >
                            {formatted}
                          </Link>
                        ) : (
                          formatted
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {showPagination && (
        <TablePagination
          component="div"
          onRowsPerPageChange={handleChangeRowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={rowsPerPageOptions}
          count={data.length}
          page={page}
          rowsPerPage={rowsPerPage}
        />
      )}
    </Paper>
  );
}

const useStyles = makeStyles(() =>
  createStyles({
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
    toolbar: {
      flexDirection: 'row-reverse',
    },
  }),
);

export default MonitoringTable;
