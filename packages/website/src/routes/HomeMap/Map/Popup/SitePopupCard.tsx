import React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import { Link, useLocation } from 'react-router-dom';
import type { Site } from 'store/Sites/types';
import { getSiteNameAndRegion } from 'store/Sites/helpers';
import { maxLengths } from 'constants/names';
import { formatNumber } from 'helpers/numberUtils';
import { dhwColorFinder } from 'helpers/degreeHeatingWeeks';
import { colors } from 'layout/App/theme';
import { GaCategory, GaAction, trackButtonClick } from 'utils/google-analytics';

export const sitePopupStyles = (theme: Theme) =>
  createStyles({
    popupHeader: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },

    popupHeaderContent: {
      width: '100%',
      overflowWrap: 'break-word',
    },

    subheader: {
      color: 'white',
    },

    popup: {
      width: 215,
    },
  });

export type SitePopupCardClasses = {
  popupHeader: string;
  popupHeaderContent: string;
  subheader: string;
};

function SitePopupCard({
  site,
  classes,
}: {
  site: Site;
  classes: SitePopupCardClasses;
}) {
  const location = useLocation();
  const { name, region } = getSiteNameAndRegion(site);
  const isNameLong = name?.length && name.length > maxLengths.SITE_NAME_POPUP;
  const { dhw, satelliteTemperature } = site.collectionData || {};

  const onExploreButtonClick = () => {
    trackButtonClick(
      GaCategory.BUTTON_CLICK,
      GaAction.MAP_PAGE_BUTTON_CLICK,
      'Explore',
    );
  };

  return (
    <Card>
      <CardHeader
        className={classes.popupHeader}
        classes={{
          content: classes.popupHeaderContent,
          subheader: classes.subheader,
        }}
        title={
          <span title={isNameLong && name ? name : undefined}>
            {isNameLong
              ? `${name?.substring(0, maxLengths.SITE_NAME_POPUP)}...`
              : name}
          </span>
        }
        subheader={region}
      />
      <CardContent>
        <Grid container item xs={12}>
          <Grid item xs={6}>
            <Grid container item xs={12}>
              <Typography variant="caption" color="textSecondary">
                SST
              </Typography>
            </Grid>
            <Grid container item xs={12}>
              <Typography
                style={{ color: colors.lightBlue }}
                variant="h5"
                color="textSecondary"
              >
                {`${formatNumber(satelliteTemperature, 1)}  °C`}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid container item xs={12}>
              <Typography variant="caption" color="textSecondary">
                HEAT STRESS
              </Typography>
            </Grid>
            <Grid container alignItems="flex-end" item xs={12}>
              <Typography
                style={{
                  color: `${dhwColorFinder(dhw)}`,
                }}
                variant="h5"
                color="textSecondary"
              >
                {formatNumber(dhw, 1)}
                &nbsp;
              </Typography>
              <Tooltip title="Degree Heating Weeks - a measure of the amount of time above the 20 year historical maximum temperatures">
                <Typography
                  style={{
                    color: `${dhwColorFinder(dhw)}`,
                    position: 'relative',
                    bottom: 0,
                  }}
                  variant="h6"
                  color="textSecondary"
                >
                  DHW
                </Typography>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
        <Grid style={{ margin: '1rem 0 1rem 0' }} container item xs={12}>
          <Grid item>
            <Link
              style={{ color: 'inherit', textDecoration: 'none' }}
              to={`/sites/${site.id}`}
              state={{ from: location.pathname }}
            >
              <Button
                onClick={onExploreButtonClick}
                size="small"
                variant="outlined"
                color="primary"
              >
                EXPLORE
              </Button>
            </Link>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default SitePopupCard;
