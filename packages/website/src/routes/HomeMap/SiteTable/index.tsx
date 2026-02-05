import React, { ReactNode, useState } from 'react';
import { times } from 'lodash';
import {
  Box,
  CircularProgress,
  Hidden,
  MenuItem,
  Select,
  SelectProps,
  Table,
  TableContainer,
  Theme,
  Typography,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import L from 'leaflet';

import { siteOnMapSelector } from 'store/Homepage/homepageSlice';
import { getSiteNameAndRegion } from 'store/Sites/helpers';
import { useWindowSize } from 'hooks/useWindowSize';
import { sitesListLoadingSelector } from 'store/Sites/sitesListSlice';
import SelectedSiteCard from './SelectedSiteCard';
import SiteTableBody from './body';
import { getOrderKeysFriendlyString, Order, OrderKeys } from './utils';
import EnhancedTableHead from './tableHead';
import { Collection } from '../../Dashboard/collection';
import { SitesFilterModal } from './SitesFilterDropdown';

const SMALL_HEIGHT = 720;

const DEFAULT_ITEMS: OrderKeys[] = [
  OrderKeys.ALERT,
  OrderKeys.DHW,
  OrderKeys.LOCATION_NAME,
  OrderKeys.SST,
];

const MOBILE_SELECT_MENU_ITEMS = Object.values(OrderKeys)
  .filter((key) => DEFAULT_ITEMS.includes(key))
  .reduce<ReactNode[]>(
    (elements, val) => [
      ...elements,
      ...times(2, (i) => {
        const itemOrder: Order = i % 2 === 0 ? 'asc' : 'desc';
        return (
          <MenuItem value={`${val}-${itemOrder}`} key={val + i}>
            <Typography color="primary" variant="h4">
              {getOrderKeysFriendlyString(val)}
              {'  '}
              {itemOrder === 'asc' ? (
                <ArrowDownward fontSize="small" />
              ) : (
                <ArrowUpward fontSize="small" />
              )}
            </Typography>
          </MenuItem>
        );
      }),
    ],
    [],
  );

function SiteTable({
  isDrawerOpen = false,
  showCard = true,
  showSiteFiltersDropdown = true,
  isExtended = false,
  collection,
  scrollTableOnSelection = true,
  scrollPageOnSelection,
  map,
  classes,
}: SiteTableProps) {
  const loading = useSelector(sitesListLoadingSelector);
  const siteOnMap = useSelector(siteOnMapSelector);
  const { height } = useWindowSize() || {};

  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderKeys>(OrderKeys.ALERT);

  const handleRequestSort = (event: unknown, property: OrderKeys) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // This function is used to prevent the drawer onClick close effect on mobile
  const onInteractiveClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.stopPropagation();
  };

  const onMobileSelectChange: SelectProps['onChange'] = (newValue) => {
    const value = newValue.target.value as string;
    const [newOrderBy, newOrder] = value.split('-') as [OrderKeys, Order];
    setOrder(newOrder);
    setOrderBy(newOrderBy);
  };

  // Get empty columns from SiteTableBody
  const [emptyColumns, setEmptyColumns] = useState<OrderKeys[]>([]);

  return (
    <>
      {/* Holds drawer handle and site name text on mobile */}
      {showCard && (
        <Hidden mdUp>
          <Box
            width="100vw"
            display="flex"
            justifyContent="center"
            marginTop={2}
            marginBottom={3}
          >
            <Box
              className={classNames(classes.topHandle, {
                [classes.bounce]: !!siteOnMap && !isDrawerOpen,
              })}
            />
            {!isDrawerOpen && (
              <Typography
                className={classes.allSitesText}
                variant="h5"
                color="textSecondary"
              >
                {siteOnMap ? getSiteNameAndRegion(siteOnMap).name : 'All Sites'}
              </Typography>
            )}
          </Box>
        </Hidden>
      )}
      {showCard && <SelectedSiteCard />}
      {showSiteFiltersDropdown && (
        <Box className={classes.dropdownWrapper}>
          <SitesFilterModal />
        </Box>
      )}
      {/* Holds sort selector on mobile. Sorting on desktop uses table headers. */}
      {!isExtended && (
        <Hidden mdUp>
          <Box
            paddingX={2}
            paddingY={3}
            display="flex"
            alignItems="center"
            onClick={onInteractiveClick}
          >
            <Typography variant="h5">Sort By: </Typography>
            <Select
              variant="standard"
              value={`${orderBy}-${order}`}
              className={classes.mobileSortSelect}
              onChange={onMobileSelectChange}
            >
              {MOBILE_SELECT_MENU_ITEMS}
            </Select>
          </Box>
        </Hidden>
      )}
      <Box
        className={
          height && height > SMALL_HEIGHT
            ? `${classes.tableHolder} ${classes.scrollable}`
            : `${classes.tableHolder}`
        }
        display="flex"
        flexDirection="column"
        flex={1}
      >
        <TableContainer>
          <Table
            stickyHeader
            className={isExtended ? classes.extendedTable : classes.table}
          >
            <Hidden mdDown={!isExtended}>
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                isExtended={isExtended}
                emptyColumns={emptyColumns}
              />
            </Hidden>
            <SiteTableBody
              order={order}
              orderBy={orderBy}
              isExtended={isExtended}
              collection={collection}
              scrollTableOnSelection={scrollTableOnSelection}
              scrollPageOnSelection={scrollPageOnSelection}
              map={map}
              onEmptyColumnsChange={setEmptyColumns}
            />
          </Table>
        </TableContainer>
        {loading && (
          <Box
            display="flex"
            flex={1}
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress size="4rem" thickness={1} />
          </Box>
        )}
      </Box>
    </>
  );
}
const styles = (theme: Theme) =>
  createStyles({
    tableHolder: {
      paddingLeft: 10,
      [theme.breakpoints.down('sm')]: {
        paddingLeft: 0,
        height: 'auto',
      },
    },
    scrollable: {
      overflowY: 'auto',
    },
    table: {
      borderCollapse: 'collapse',
    },
    extendedTable: {
      [theme.breakpoints.down('sm')]: {
        minWidth: 1220,
      },
      borderCollapse: 'collapse',
    },
    dropdownWrapper: {
      padding: '0 0 10px 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    topHandle: {
      width: 50,
      height: 10,
      backgroundColor: theme.palette.grey['400'],
      borderRadius: '20px',
    },
    mobileSortSelect: {
      marginLeft: theme.spacing(2),
    },
    allSitesText: {
      position: 'absolute',
      left: 25,
      top: 25,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '90vw',
    },
    bounce: { animation: '$bounce 1s infinite alternate' },
    '@keyframes bounce': {
      '0%': { transform: 'translateY(0px)' },
      '100%': { transform: 'translateY(-5px)' },
    },
  });

interface SiteTableProps
  extends SiteTableIncomingProps,
    WithStyles<typeof styles> {}

interface SiteTableIncomingProps {
  // used on mobile to add descriptive elements if the drawer is closed.
  isDrawerOpen?: boolean;
  showCard?: boolean;
  showSiteFiltersDropdown?: boolean;
  isExtended?: boolean; // Determines whether an extended version of the table will be displayed or not
  collection?: Collection;
  scrollTableOnSelection?: boolean;
  scrollPageOnSelection?: boolean;
  map?: L.Map | null; // Add map prop type
}

export default withStyles(styles)(SiteTable);
