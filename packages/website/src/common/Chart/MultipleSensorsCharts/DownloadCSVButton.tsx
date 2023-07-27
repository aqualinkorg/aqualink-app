import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { MetricsKeys } from 'store/Sites/types';
import { spotterPositionSelector } from 'store/Sites/selectedSiteSlice';
import { downloadCsvFile } from 'utils/utils';
import { constructTimeSeriesDataCsvRequestUrl } from 'helpers/siteUtils';
import DownloadCSVDialog from './DownloadCSVDialog';
import { CSVColumnData } from './types';

interface DownloadCSVButtonParams {
  data: CSVColumnData[];
  startDate?: string;
  endDate?: string;
  className?: string;
  siteId?: number | string;
  defaultMetrics?: MetricsKeys[];
}

function DownloadCSVButton({
  data,
  startDate,
  endDate,
  className,
  siteId,
  defaultMetrics,
}: DownloadCSVButtonParams) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const spotterData = useSelector(spotterPositionSelector);
  const { enqueueSnackbar } = useSnackbar();

  const onClose = async (
    shouldDownload: boolean,
    additionalData: boolean,
    allDates: boolean,
    hourly: boolean,
  ) => {
    if (!shouldDownload) {
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      await downloadCsvFile(
        `${
          process.env.REACT_APP_API_BASE_URL
        }/${constructTimeSeriesDataCsvRequestUrl({
          hourly,
          start: allDates ? undefined : startDate,
          end: allDates ? undefined : endDate,
          metrics: additionalData ? undefined : defaultMetrics,
          siteId: String(siteId),
        })}`,
      );
    } catch (error) {
      console.error(error);
      enqueueSnackbar('There was an error downloading csv data', {
        variant: 'error',
      });
    }

    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <Button
        disabled={loading}
        variant="outlined"
        color="primary"
        className={className}
        onClick={() => {
          setOpen(true);
        }}
        style={{ marginBottom: spotterData?.isDeployed ? 0 : '2em' }}
      >
        {/* TODO update this component with LoadingButton from MUILab when newest version is released. */}
        {loading ? 'Loading...' : 'Download CSV'}
      </Button>
      <DownloadCSVDialog
        open={open}
        onClose={onClose}
        data={data}
        startDate={startDate || ''}
        endDate={endDate || ''}
      />
    </>
  );
}

DownloadCSVButton.defaultProps = {
  startDate: undefined,
  endDate: undefined,
  siteId: undefined,
  className: undefined,
};

export default DownloadCSVButton;
