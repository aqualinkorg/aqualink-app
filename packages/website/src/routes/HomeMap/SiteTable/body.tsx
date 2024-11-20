import {
  createStyles,
  Hidden,
  TableBody,
  TableCell,
  TableRow,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
  WithStyles,
  withStyles,
  TablePagination,
} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TableRow as Row } from 'store/Homepage/types';
import { constructTableData } from 'store/Sites/helpers';
import { sitesToDisplayListSelector } from 'store/Sites/sitesListSlice';
import {
  siteOnMapSelector,
  setSiteOnMap,
  setSearchResult,
} from 'store/Homepage/homepageSlice';
import { dhwColorFinder } from 'helpers/degreeHeatingWeeks';
import { formatNumber } from 'helpers/numberUtils';
import { alertColorFinder } from 'helpers/bleachingAlertIntervals';
import { colors } from 'layout/App/theme';
import { getComparator, Order, OrderKeys, stableSort } from './utils';
import { Collection } from '../../Dashboard/collection';

const SCROLLT_TIMEOUT = 500;
const ROWS_PER_PAGE = 25;

const RowNameCell = ({
  site: { locationName, region },
  classes,
}: {
  site: Row;
  classes: SiteTableBodyProps['classes'];
}) => {
  return (
    <TableCell className={classes.nameCells}>
      <Typography align="left" variant="h6" color="textSecondary">
        {locationName}
      </Typography>

      {locationName !== region && region && (
        <Typography className={classes.regionName} variant="subtitle1">
          {region}
        </Typography>
      )}
    </TableCell>
  );
};

const RowNumberCell = ({
  color,
  unit,
  decimalPlaces,
  value,
  classes,
  isExtended,
}: {
  color?: string;
  unit?: string;
  value: number | null;
  decimalPlaces?: number;
  classes: SiteTableBodyProps['classes'];
  isExtended?: boolean;
}) => {
  return (
    <TableCell
      className={
        isExtended ? classes.cellTextAlignExtended : classes.cellTextAlign
      }
    >
      <Typography
        variant="h6"
        style={{ color }}
        className={classes.numberCellsTitle}
      >
        {formatNumber(value, decimalPlaces)}
        <Hidden smUp>
          &nbsp;
          <Typography variant="h6" component="span">
            {unit}
          </Typography>
        </Hidden>
      </Typography>
    </TableCell>
  );
};

const RowAlertCell = ({
  site: { alertLevel },
  classes,
}: {
  site: Row;
  classes: SiteTableBodyProps['classes'];
}) => {
  return (
    <TableCell className={classes.cellTextAlign}>
      <ErrorIcon
        style={{
          color: alertColorFinder(alertLevel),
        }}
      />
    </TableCell>
  );
};

RowNumberCell.defaultProps = {
  unit: '',
  color: colors.black,
  decimalPlaces: 1,
  isExtended: false,
};

const SiteTableBody = ({
  order,
  orderBy,
  isExtended,
  collection,
  scrollTableOnSelection,
  scrollPageOnSelection,
  classes,
}: SiteTableBodyProps) => {
  const dispatch = useDispatch();
  const storedSites = useSelector(sitesToDisplayListSelector);
  const sitesList = useMemo(
    () => collection?.sites || storedSites || [],
    [collection, storedSites],
  );
  const siteOnMap = useSelector(siteOnMapSelector);
  const [selectedRow, setSelectedRow] = useState<number>();
  const [page, setPage] = useState(0);

  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('sm'));

  const tableData = useMemo(
    () =>
      stableSort<Row>(
        constructTableData(sitesList),
        getComparator(order, orderBy),
      ),
    [order, orderBy, sitesList],
  );
  const idToIndexMap = useMemo(
    () =>
      tableData.reduce((acc, item, index) => {
        // eslint-disable-next-line fp/no-mutation
        acc[item.tableData.id] = index;
        return acc;
      }, {} as Record<number, number>),
    [tableData],
  );

  const handleClick = (event: unknown, site: Row) => {
    setSelectedRow(site.tableData.id);
    dispatch(setSearchResult());
    dispatch(setSiteOnMap(sitesList[site.tableData.id]));
    const mapElement = document.getElementById('sites-map');
    if (scrollPageOnSelection && mapElement) {
      mapElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const index = sitesList.findIndex((item) => item.id === siteOnMap?.id);
    setSelectedRow(index);
  }, [siteOnMap, sitesList]);

  // scroll to the relevant site row when site is selected.
  useEffect(() => {
    if (selectedRow === undefined || idToIndexMap[selectedRow] === undefined)
      return;
    // Go to the page where the selected site is
    setPage(Math.floor(idToIndexMap[selectedRow] / ROWS_PER_PAGE));
    // only scroll if not on mobile (info at the top is more useful than the site row)
    if (!isTablet && scrollTableOnSelection) {
      setTimeout(() => {
        const child = document.getElementById(
          `homepage-table-row-${selectedRow}`,
        );

        child?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, SCROLLT_TIMEOUT);
    }
  }, [idToIndexMap, isTablet, scrollTableOnSelection, selectedRow]);

  // Handle page change
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      <TableBody>
        {stableSort<Row>(
          constructTableData(sitesList),
          getComparator(order, orderBy),
        )
          .slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE)
          .map((site) => {
            return (
              <TableRow
                id={`homepage-table-row-${site.tableData.id}`}
                hover
                className={classes.tableRow}
                style={{
                  backgroundColor:
                    site.tableData.id === selectedRow
                      ? colors.lighterBlue
                      : 'white',
                }}
                onClick={(event) => handleClick(event, site)}
                role="button"
                tabIndex={-1}
                key={site.tableData.id}
              >
                <RowNameCell
                  site={site}
                  classes={{
                    ...classes,
                    nameCells: isExtended
                      ? classes.extendedTableNameCells
                      : classes.nameCells,
                  }}
                />
                <RowNumberCell
                  isExtended={isExtended}
                  classes={classes}
                  value={site.sst}
                  color={isExtended ? colors.black : colors.lightBlue}
                  unit="°C"
                />
                {isExtended && (
                  <RowNumberCell
                    isExtended={isExtended}
                    classes={classes}
                    value={site.historicMax}
                    color={colors.black}
                    unit="°C"
                  />
                )}
                {isExtended && (
                  <RowNumberCell
                    isExtended={isExtended}
                    classes={classes}
                    value={site.sstAnomaly}
                    color={colors.black}
                    unit="°C"
                  />
                )}
                <RowNumberCell
                  isExtended={isExtended}
                  classes={classes}
                  value={site.dhw}
                  color={dhwColorFinder(site.dhw)}
                  unit="DHW"
                />
                {isExtended && (
                  <RowNumberCell
                    isExtended={isExtended}
                    classes={classes}
                    value={site.buoyTop}
                    color={colors.black}
                    unit="°C"
                  />
                )}
                {isExtended && (
                  <RowNumberCell
                    isExtended={isExtended}
                    classes={classes}
                    value={site.buoyBottom}
                    color={colors.black}
                    unit="°C"
                  />
                )}
                <RowAlertCell site={site} classes={classes} />
              </TableRow>
            );
          })}
      </TableBody>
      {sitesList.length > 0 && (
        <TablePagination
          className={classes.stickyFooter}
          count={sitesList.length}
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[ROWS_PER_PAGE]}
          page={page}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    nameCells: {
      paddingLeft: 10,
      maxWidth: 120,
      overflowWrap: 'break-word',
      [theme.breakpoints.down('xs')]: { width: '35%', paddingRight: 0 },
    },
    extendedTableNameCells: {
      paddingLeft: 10,
      maxWidth: 200,
      overflowWrap: 'break-word',
      [theme.breakpoints.down('xs')]: { width: '10%', paddingRight: 0 },
    },
    regionName: {
      color: 'gray',
    },
    numberCellsTitle: {
      [theme.breakpoints.down('xs')]: { fontWeight: 600 },
    },
    cellTextAlign: {
      textAlign: 'left',
      [theme.breakpoints.down('xs')]: {
        textAlign: 'right',
      },
    },
    cellTextAlignExtended: {
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 10,
        paddingRight: 0,
        textAlign: 'left',
      },
    },
    tableRow: {
      cursor: 'pointer',
      borderTop: `1px solid ${theme.palette.grey['300']}`,
    },
    stickyFooter: {
      position: 'sticky',
      bottom: 0,
    },
  });

type SiteTableBodyIncomingProps = {
  order: Order;
  orderBy: OrderKeys;
  isExtended?: boolean;
  collection?: Collection;
  scrollTableOnSelection?: boolean;
  scrollPageOnSelection?: boolean;
};

SiteTableBody.defaultProps = {
  isExtended: false,
  collection: undefined,
  scrollTableOnSelection: true,
  scrollPageOnSelection: false,
};

type SiteTableBodyProps = WithStyles<typeof styles> &
  SiteTableBodyIncomingProps;

export default withStyles(styles)(SiteTableBody);
