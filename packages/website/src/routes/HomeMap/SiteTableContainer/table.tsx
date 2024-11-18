import {
  createStyles,
  Hidden,
  TableCell,
  TableRow,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
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
import { VirtualTable } from 'common/VirtualTable';
import { getComparator, Order, OrderKeys, stableSort } from './utils';
import { Collection } from '../../Dashboard/collection';

const SCROLLT_TIMEOUT = 500;

const RowNameCell = ({
  site: { locationName, region },
  classes,
}: {
  site: Row;
  classes: SiteTableProps['classes'];
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
  classes: SiteTableProps['classes'];
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
  classes: SiteTableProps['classes'];
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

type RowRendererDataProps = {
  sitesList: Row[];
  selectedRow?: number;
  classes: SiteTableProps['classes'];
  handleClick: (event: unknown, site: Row) => void;
  isExtended?: boolean;
};

const RowRenderer = ({
  index,
  style,
  data,
}: ListChildComponentProps<RowRendererDataProps>) => {
  const { sitesList, selectedRow, classes, handleClick, isExtended } = data;
  const site = sitesList[index];

  return (
    <TableRow
      id={`homepage-table-row-${site.tableData.id}`}
      hover
      className={classes.tableRow}
      style={{
        ...style,
        backgroundColor:
          site.tableData.id === selectedRow ? colors.lighterBlue : 'white',
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
};

const SiteTable = ({
  header,
  order,
  orderBy,
  height,
  isExtended,
  collection,
  scrollTableOnSelection,
  scrollPageOnSelection,
  classes,
}: SiteTableProps) => {
  const dispatch = useDispatch();
  const storedSites = useSelector(sitesToDisplayListSelector);
  const sitesList = useMemo(
    () => collection?.sites || storedSites || [],
    [collection, storedSites],
  );
  const listRef = React.useRef<List>(null);

  const siteOnMap = useSelector(siteOnMapSelector);
  const [selectedRow, setSelectedRow] = useState<number>();

  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClick = (event: unknown, site: Row) => {
    const mapElement = document.getElementById('sites-map');
    setSelectedRow(site.tableData.id);
    dispatch(setSearchResult());
    dispatch(setSiteOnMap(sitesList[site.tableData.id]));
    if (scrollPageOnSelection && mapElement) {
      mapElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  };

  const tableData = useMemo(
    () =>
      stableSort<Row>(
        constructTableData(sitesList),
        getComparator(order, orderBy),
      ),
    [sitesList, order, orderBy],
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

  useEffect(() => {
    const index = sitesList.findIndex((item) => item.id === siteOnMap?.id);
    setSelectedRow(index);
  }, [siteOnMap, sitesList]);

  // scroll to the relevant site row when site is selected.
  useEffect(() => {
    if (selectedRow === undefined) return;
    const itemIndex = idToIndexMap[selectedRow];
    // only scroll if not on mobile (info at the top is more useful than the site row)
    if (!isTablet && scrollTableOnSelection) {
      setTimeout(
        () => listRef.current?.scrollToItem(itemIndex),
        SCROLLT_TIMEOUT,
      );
    }
  }, [idToIndexMap, isTablet, scrollTableOnSelection, selectedRow]);

  return (
    <VirtualTable
      ref={listRef}
      header={header}
      row={RowRenderer}
      height={height ?? 300}
      width="100%"
      itemSize={60}
      itemCount={tableData.length}
      itemData={{
        sitesList: tableData,
        classes,
        isExtended,
        selectedRow,
        handleClick,
      }}
    />
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
      position: 'static !important' as 'static',
      cursor: 'pointer',
      borderTop: `1px solid ${theme.palette.grey['300']}`,
    },
  });

type SiteTableBodyIncomingProps = {
  header: React.ReactNode;
  order: Order;
  orderBy: OrderKeys;
  height?: number;
  isExtended?: boolean;
  collection?: Collection;
  scrollTableOnSelection?: boolean;
  scrollPageOnSelection?: boolean;
};

SiteTable.defaultProps = {
  isExtended: false,
  collection: undefined,
  scrollTableOnSelection: true,
  scrollPageOnSelection: false,
};

type SiteTableProps = WithStyles<typeof styles> & SiteTableBodyIncomingProps;

export default withStyles(styles)(SiteTable);
