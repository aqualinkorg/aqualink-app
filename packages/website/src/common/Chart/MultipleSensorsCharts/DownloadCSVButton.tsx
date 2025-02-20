import React, { useState } from 'react';
import { Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { siteTimeSeriesDataRangeSelector } from 'store/Sites/selectedSiteSlice';
import { useSnackbar } from 'notistack';
import { MetricsKeys } from 'store/Sites/types';
import { downloadBlob } from 'utils/utils';
import { constructTimeSeriesDataCsvRequestUrl } from 'helpers/siteUtils';
import monitoringServices from 'services/monitoringServices';
import { userInfoSelector } from 'store/User/userSlice';
import { MonitoringMetric } from 'utils/types';
import { CSVColumnData } from './types';
import DownloadCSVDialog from './DownloadCSVDialog';

interface DownloadCSVButtonParams {
  data: CSVColumnData[];
  startDate?: string;
  endDate?: string;
  siteId?: number | string;
  defaultMetrics?: MetricsKeys[];
}

function DownloadCSVButton({
  data,
  startDate,
  endDate,
  siteId,
  defaultMetrics,
}: DownloadCSVButtonParams) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timeSeriesDataRanges = useSelector(siteTimeSeriesDataRangeSelector);
  const user = useSelector(userInfoSelector);
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
      const resp = await fetch(
        `${
          import.meta.env.VITEAPI_BASE_URL
        }/${constructTimeSeriesDataCsvRequestUrl({
          hourly,
          start: allDates ? undefined : startDate,
          end: allDates ? undefined : endDate,
          metrics: additionalData ? undefined : defaultMetrics,
          siteId: String(siteId),
        })}`,
      );
      if (!(resp.status >= 200 && resp.status <= 299)) {
        throw new Error(await resp.text());
      }
      const header = resp.headers.get('Content-Disposition');
      const parts = header?.split(';');
      const filename = parts?.[1]?.split('=')[1] || 'data.csv';
      const blob = await resp.blob();
      downloadBlob(blob, filename);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('There was an error downloading csv data', {
        variant: 'error',
      });
    }

    if (user?.token)
      monitoringServices.postMonitoringMetric({
        token: user.token,
        siteId: Number(siteId),
        metric: MonitoringMetric.CSVDownload,
      });

    setLoading(false);
    setOpen(false);
  };

  return (
    <div>
      <Button
        disabled={loading}
        variant="outlined"
        color="primary"
        onClick={() => {
          setOpen(true);
        }}
        style={{
          marginBottom: timeSeriesDataRanges?.bottomTemperature?.find(
            (x) => x.type === 'spotter',
          )?.data
            ? 0
            : '2em',
        }}
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
        loading={loading}
      />
    </div>
  );
}

export default DownloadCSVButton;
