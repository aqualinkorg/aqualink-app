import { KeyboardDoubleArrowDown } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { useHistoricalDate } from 'hooks/useHistoricalDate';
import {
  onOrBeforeHistoricalDate,
  withHistoricalDate,
} from 'helpers/historicalDate';
import { useSelector } from 'react-redux';
import { HashLink } from 'react-router-hash-link';
import { reefCheckSurveyListSelector } from 'store/ReefCheckSurveys';
import reefCheckLogo from '../../../assets/img/reef-check-logo.png';

type ReefCheckDataIndicatorProps = {
  siteId: number;
};
export function ReefCheckDataIndicator({
  siteId,
}: ReefCheckDataIndicatorProps) {
  const asOf = useHistoricalDate();
  const { list: reefCheckSurveyList } = useSelector(
    reefCheckSurveyListSelector,
  );
  if (
    !reefCheckSurveyList.some((survey) =>
      onOrBeforeHistoricalDate(survey.date, asOf),
    )
  ) {
    return null;
  }

  return (
    <Box
      component={HashLink}
      to={withHistoricalDate(`/sites/${siteId}#surveys`, asOf)}
      display="flex"
      alignItems="center"
      gap={1}
      color="black"
    >
      <img src={reefCheckLogo} alt="Reef Check" width={40} />
      <Typography
        fontSize="1rem"
        sx={{
          display: {
            xs: 'none', // hide on mobile
            sm: 'block', // show on tablet and up
          },
        }}
      >
        REEF CHECK DATA AVAILABLE
      </Typography>
      <KeyboardDoubleArrowDown />
    </Box>
  );
}
