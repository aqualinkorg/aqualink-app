import React from 'react';
import { Box, createStyles, makeStyles, Typography } from '@material-ui/core';

import { Site, Sources } from 'store/Sites/types';
import { SurveyListItem } from 'store/Survey/types';
import { convertSurveyDataToLocalTime } from 'helpers/dates';
import ChartWithTooltip from './ChartWithTooltip';
import MultipleSensorsCharts from './MultipleSensorsCharts';
import { standardDailyDataDataset } from './MultipleSensorsCharts/helpers';
import LoadingSkeleton from '../LoadingSkeleton';
import chartSkeletonImage from '../../assets/img/chart_skeleton.png';

const CombinedCharts = ({
  site,
  selectedSurveyPointId,
  surveys,
  setParentAvailableSources,
}: CombinedChartsProps) => {
  const classes = useStyles();
  const isLoading = !site;
  const heatStressDataset = site
    ? standardDailyDataDataset(
        site.dailyData,
        site.maxMonthlyMean,
        true,
        site.timezone,
      )
    : undefined;

  return (
    <div>
      <LoadingSkeleton loading={isLoading} variant="text" lines={1}>
        <Box className={classes.graphtTitleWrapper}>
          <Typography className={classes.graphTitle} variant="h6">
            HEAT STRESS ANALYSIS (°C)
          </Typography>
        </Box>
      </LoadingSkeleton>
      <LoadingSkeleton
        loading={isLoading}
        variant="rect"
        height={256}
        width="100%"
        image={chartSkeletonImage}
      >
        {site && heatStressDataset && (
          <>
            <ChartWithTooltip
              className={classes.chart}
              siteId={site.id}
              datasets={[heatStressDataset]}
              surveys={convertSurveyDataToLocalTime(surveys, site.timezone)}
              temperatureThreshold={
                typeof site.maxMonthlyMean === 'number'
                  ? site.maxMonthlyMean + 1
                  : null
              }
              maxMonthlyMean={site.maxMonthlyMean || null}
              background
              timeZone={site.timezone}
            />
            <MultipleSensorsCharts
              site={site}
              pointId={selectedSurveyPointId}
              surveysFiltered={false}
              disableGutters
              setParentAvailableSources={setParentAvailableSources}
            />
          </>
        )}
      </LoadingSkeleton>
    </div>
  );
};

const useStyles = makeStyles(() =>
  createStyles({
    chart: {
      height: '16rem',
      marginBottom: '3rem',
      marginTop: '1rem',
    },
    graphtTitleWrapper: {
      marginLeft: 42,
    },
    graphTitle: {
      lineHeight: 1.5,
    },
  }),
);

interface CombinedChartsProps {
  site?: Site;
  selectedSurveyPointId: string | undefined;
  surveys: SurveyListItem[];
  setParentAvailableSources?: React.Dispatch<React.SetStateAction<Sources[]>>;
}

export default CombinedCharts;
