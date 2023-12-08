import {
  createStyles,
  Link,
  makeStyles,
  Padding,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@material-ui/core';
import { colors } from 'layout/App/theme';
import React from 'react';

type Order = 'asc' | 'desc';

export interface HeadCell<T> {
  id: keyof T;
  label: string;
  tooltipText: string;
  padding?: Padding;
  width?: string | number;
  align?: 'left' | 'right' | 'inherit' | 'center' | 'justify';
}

export interface BodyCell<T> {
  id: keyof T;
  align?: 'left' | 'right' | 'inherit' | 'center' | 'justify';
  linkTo?: (row: T) => string;
}

interface MonitoringTableProps<T> {
  defaultSortColumn?: keyof T;
  defaultOrder?: Order;
  headCells: HeadCell<T>[];
  data: T[];
  bodyCells: BodyCell<T>[];
  showPagination?: boolean;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
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

  return (
    <Paper>
      <TableContainer>
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
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow hover key={JSON.stringify(row)}>
                  {bodyCells.map((bodyCell) => (
                    <TableCell
                      key={bodyCell.id as React.Key}
                      align={bodyCell.align}
                    >
                      {bodyCell.linkTo ? (
                        <Link
                          href={bodyCell.linkTo(row)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {row[bodyCell.id]}
                        </Link>
                      ) : (
                        row[bodyCell.id]
                      )}
                    </TableCell>
                  ))}
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
  }),
);

export default MonitoringTable;
