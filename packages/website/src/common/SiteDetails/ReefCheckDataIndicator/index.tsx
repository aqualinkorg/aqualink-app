import { KeyboardDoubleArrowDown } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
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
  const { list: reefCheckSurveyList } = useSelector(
    reefCheckSurveyListSelector,
  );
  if (reefCheckSurveyList.length === 0) {
    return null;
  }

  return (
    <Box
      component={HashLink}
      to={`/sites/${siteId}#surveys`}
      display="flex"
      alignItems="center"
      gap={1}
      color="black"
    >
      <img src={reefCheckLogo} alt="Reef Check" width={50} />
      <Typography variant="h5">REEF CHECK DATA AVAILABLE</Typography>
      <KeyboardDoubleArrowDown />
    </Box>
  );
}
