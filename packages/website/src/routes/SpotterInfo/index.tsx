import {
  Backdrop,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import Footer from 'common/Footer';
import NavBar from 'common/NavBar';
import React from 'react';
import { useSelector } from 'react-redux';
import { userInfoSelector } from 'store/User/userSlice';
import requests from 'helpers/requests';
import siteServices from 'services/siteServices';
import { useSnackbar } from 'notistack';

type SearchMethod = 'siteId' | 'spotterId';

function SpotterInfo() {
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector(userInfoSelector);

  const [searchMethod, setSearchMethod] =
    React.useState<SearchMethod>('siteId');
  const [siteId, setSiteId] = React.useState<string>('');
  const [sensorId, setSensorId] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [result, setResult] = React.useState<any>(undefined);

  function handleSearchMethod(
    event: React.MouseEvent<HTMLElement>,
    val: string | null,
  ) {
    if (val === null) return;
    setSearchMethod(val as SearchMethod);
  }

  async function search() {
    setResult(undefined);
    const query = requests.generateUrlQueryParams(
      searchMethod === 'siteId' ? { siteId } : { sensorId },
    );

    setLoading(true);
    try {
      const response = await siteServices.getSpotterInfo(
        query,
        user?.token || '',
      );
      if (!response) return;

      const { data } = response;

      const res = {
        batteryPower: data.batteryPower,
        batteryVoltage: data.batteryVoltage,
        humidity: data.humidity,
        payloadType: data.payloadType,
        solarVoltage: data.solarVoltage,
        spotterId: data.spotterId,
        spotterName: data.spotterName,
        location: {
          latitude: data.track?.[0]?.latitude,
          longitude: data.track?.[0]?.longitude,
          timestamp: data.track?.[0]?.timestamp,
        },
      };
      setResult(res);
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || 'Request failed', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Backdrop open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <NavBar searchLocation={false} />
      <div style={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
        <div
          style={{
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '15rem',
          }}
        >
          <div>
            <Typography>Search with:</Typography>
            <ToggleButtonGroup
              exclusive
              value={searchMethod}
              onChange={(e, v) => handleSearchMethod(e, v)}
            >
              <ToggleButton value="siteId">Site ID</ToggleButton>
              <ToggleButton value="spotterId">Spotter ID</ToggleButton>
            </ToggleButtonGroup>
          </div>

          <div>
            {searchMethod === 'siteId' ? (
              <TextField
                variant="outlined"
                label="Site ID"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
              />
            ) : (
              <TextField
                variant="outlined"
                label="Spotter ID"
                value={sensorId}
                onChange={(e) => setSensorId(e.target.value)}
              />
            )}
          </div>

          <Button color="primary" variant="outlined" onClick={() => search()}>
            search
          </Button>
        </div>
        <div style={{ padding: '1rem' }}>
          {result && (
            <code
              style={{
                whiteSpace: 'break-spaces',
                overflowWrap: 'anywhere',
              }}
            >
              {JSON.stringify(result, null, 2)}
            </code>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SpotterInfo;
