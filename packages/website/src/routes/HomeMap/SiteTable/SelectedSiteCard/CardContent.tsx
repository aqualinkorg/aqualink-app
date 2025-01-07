import {
  Theme,
  useTheme,
  useMediaQuery,
  Grid,
  Box,
  CardMedia,
  Hidden,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { isNumber } from 'lodash';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import { Site } from 'store/Sites/types';
import { getSiteNameAndRegion } from 'store/Sites/helpers';
import { formatNumber } from 'helpers/numberUtils';
import Chart from 'common/Chart';
import { standardDailyDataDataset } from 'common/Chart/MultipleSensorsCharts/helpers';
import Chip from 'common/Chip';
import LoadingSkeleton from 'common/LoadingSkeleton';
import { GaAction, GaCategory, trackButtonClick } from 'utils/google-analytics';
import featuredImageLoading from '../../../../assets/img/loading-image.svg';
import chartLoading from '../../../../assets/img/chart_skeleton.png';

const SelectedSiteCardContent = ({
  site,
  loading,
  error,
  imageUrl = null,
}: SelectedSiteCardContentProps) => {
  const classes = useStyles({ imageUrl, loading });
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const {
    bottomTemperature,
    satelliteTemperature,
    dhw: degreeHeatingWeek,
  } = site?.collectionData || {};
  const useCardWithImageLayout = Boolean(loading || imageUrl);

  const metrics = [
    {
      label: 'SURFACE TEMP',
      value: formatNumber(satelliteTemperature, 1),
      unit: ' °C',
      display: isNumber(satelliteTemperature),
    },
    {
      label: 'HEAT STRESS',
      value: formatNumber(degreeHeatingWeek, 1),
      unit: ' DHW',
      display: isNumber(degreeHeatingWeek),
    },
    {
      label: `TEMP AT ${site?.depth}m`,
      value: formatNumber(bottomTemperature, 1),
      unit: ' °C',
      display: isNumber(bottomTemperature) && isNumber(site?.depth),
    },
  ];

  const { name, region: regionName } = site
    ? getSiteNameAndRegion(site)
    : { name: null, region: null };

  const chartDataset = site
    ? standardDailyDataDataset(
        site.dailyData,
        site.maxMonthlyMean,
        false,
        site.timezone,
      )
    : undefined;

  const ChartComponent =
    site && chartDataset ? (
      <Chart
        siteId={site.id}
        datasets={[chartDataset]}
        surveys={[]}
        temperatureThreshold={
          site.maxMonthlyMean ? site.maxMonthlyMean + 1 : null
        }
        maxMonthlyMean={site.maxMonthlyMean || null}
        background
      />
    ) : null;

  const onExploreButtonClick = () => {
    trackButtonClick(
      GaCategory.BUTTON_CLICK,
      GaAction.MAP_PAGE_BUTTON_CLICK,
      'Explore',
    );
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!loading && !site) {
    return <Alert severity="error">Featured site is not available</Alert>;
  }

  return (
    <Grid
      className={classes.cardWrapper}
      container
      justifyContent="space-between"
      spacing={1}
    >
      {useCardWithImageLayout && (
        <Grid item xs={12} md={6} lg={4}>
          <Box position="relative" height="100%" minHeight={300}>
            <LoadingSkeleton
              className={classes.imageBorderRadius}
              image={featuredImageLoading}
              loading={loading}
              variant="rectangular"
              height="100%"
            >
              {site && imageUrl && (
                <Link to={`/sites/${site.id}`}>
                  <CardMedia
                    className={classNames(
                      classes.cardImage,
                      classes.imageBorderRadius,
                    )}
                    image={imageUrl}
                  />
                </Link>
              )}

              <Hidden mdUp>
                <Box
                  bgcolor="rgba(3, 48, 66, 0.75)"
                  height="55%"
                  width="100%"
                  position="absolute"
                  top={0}
                  left={0}
                >
                  <Box className={classes.cardImageTextWrapper}>
                    <Typography variant="h5">{name}</Typography>

                    {regionName && (
                      <Typography variant="h6">{regionName}</Typography>
                    )}
                  </Box>
                </Box>
              </Hidden>

              {site && (
                <Box position="absolute" bottom={16} px={2} width="100%">
                  <Grid
                    container
                    alignItems="center"
                    justifyContent={
                      site.videoStream && isTablet
                        ? 'space-between'
                        : 'flex-end'
                    }
                  >
                    {site.videoStream && isTablet && (
                      <Chip
                        live
                        liveText="LIVE VIDEO"
                        to={`/sites/${site.id}`}
                        width={80}
                      />
                    )}
                    <Grid item>
                      <Button
                        className={classes.exporeButton}
                        component={Link}
                        to={`/sites/${site.id}`}
                        onClick={onExploreButtonClick}
                        size="small"
                        variant="contained"
                        color="primary"
                      >
                        EXPLORE
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </LoadingSkeleton>
          </Box>
        </Grid>
      )}
      <Grid
        item
        xs={12}
        md={useCardWithImageLayout ? 6 : 12}
        lg={useCardWithImageLayout ? 6 : 10}
        className={classes.cardAnalyticsWrapper}
      >
        <Box pb="0.5rem" pl="0.5rem" pt="1.5rem" fontWeight={400}>
          <Hidden mdDown={useCardWithImageLayout}>
            <LoadingSkeleton
              loading={loading}
              variant="text"
              lines={1}
              textHeight={28}
              longText
            >
              <Grid container alignItems="center">
                <Grid item className={classes.cardTitleWrapper}>
                  <Typography
                    className={classes.cardTitle}
                    color="textSecondary"
                    variant="h5"
                  >
                    <span title={name || ''}>{name}</span>
                  </Typography>
                </Grid>
                {site?.videoStream && (
                  <Chip
                    live
                    liveText="LIVE VIDEO"
                    to={`/sites/${site.id}`}
                    width={80}
                  />
                )}
              </Grid>
            </LoadingSkeleton>
            <LoadingSkeleton
              loading={loading}
              variant="text"
              lines={1}
              textHeight={19}
              className={classes.siteRegionName}
            >
              <Typography
                color="textSecondary"
                variant="h6"
                className={classNames(
                  classes.cardTitle,
                  classes.siteRegionName,
                )}
              >
                <span title={regionName || ''}>{regionName}</span>
              </Typography>
            </LoadingSkeleton>
          </Hidden>
          <LoadingSkeleton
            loading={loading}
            variant="text"
            lines={1}
            textHeight={12}
          >
            <Typography color="textSecondary" variant="caption">
              DAILY SURFACE TEMP. (°C)
            </Typography>
          </LoadingSkeleton>
        </Box>
        <Hidden mdDown>
          <LoadingSkeleton
            image={chartLoading.src}
            loading={loading}
            variant="rectangular"
            width="98%"
            height={180}
          >
            <div>{ChartComponent}</div>
          </LoadingSkeleton>
        </Hidden>
        <Hidden mdUp>
          <LoadingSkeleton
            className={classes.mobileChartLoading}
            image={chartLoading.src}
            loading={loading}
            variant="rectangular"
            width="98%"
            height={200}
          >
            {ChartComponent}
          </LoadingSkeleton>
        </Hidden>
      </Grid>
      <Grid item xs={12} lg={2} container>
        <div className={classes.metricsContainer}>
          {metrics.map(({ label, value, unit, display }) => (
            <div key={label} className={classes.metric}>
              <LoadingSkeleton
                longText
                loading={loading}
                variant="text"
                lines={1}
                textHeight={12}
              >
                {display && (
                  <Typography variant="caption" color="textSecondary">
                    {label}
                  </Typography>
                )}
              </LoadingSkeleton>
              <LoadingSkeleton
                loading={loading}
                variant="rectangular"
                width={80}
                height={32}
              >
                {display && (
                  <Typography variant="h4" color="primary">
                    {value}
                    &nbsp;
                    <Typography variant="h6" component="span">
                      {unit}
                    </Typography>
                  </Typography>
                )}
              </LoadingSkeleton>
            </div>
          ))}
        </div>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  cardWrapper: ({ imageUrl, loading }: SelectedSiteCardContentStyleProps) => ({
    minHeight: '18rem',
    [theme.breakpoints.down('lg')]: {
      minHeight: '24rem',
    },
    [theme.breakpoints.down('md')]: {
      height: imageUrl || loading ? '42rem' : '27rem',
    },
  }),
  imageBorderRadius: {
    borderRadius: '4px 0 0 4px',
    [theme.breakpoints.down('lg')]: {
      borderRadius: '4px 0 0 0',
    },
    [theme.breakpoints.down('md')]: {
      borderRadius: '4px 4px 0 0',
    },
  },
  cardImage: {
    height: '100%',

    [theme.breakpoints.down('md')]: {
      height: 300,
    },
  },
  cardImageTextWrapper: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    overflowWrap: 'break-word',
  },
  cardAnalyticsWrapper: {
    marginBottom: '2rem',
    maxHeight: '14rem',
  },
  cardTitleWrapper: {
    maxWidth: 'calc(100% - 88px)',
    marginRight: theme.spacing(1),
  },
  cardTitle: {
    width: '100%',
    display: 'block',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  siteRegionName: {
    marginBottom: '0.6rem',
  },
  metricsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },

    [theme.breakpoints.up('lg')]: {
      flexDirection: 'column',
      alignItems: 'start',
    },
  },
  metric: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  mobileChartLoading: {
    margin: 'auto',
  },
  exporeButton: {
    '&:hover': {
      color: 'white',
    },
  },
}));

interface SelectedSiteCardContentProps {
  site?: Site | null;
  loading: boolean;
  error?: string | null;
  imageUrl?: string | null;
}

type SelectedSiteCardContentStyleProps = Pick<
  SelectedSiteCardContentProps,
  'imageUrl' | 'loading'
>;

export default SelectedSiteCardContent;
