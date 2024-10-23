import React, { ChangeEvent, FormEvent } from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  Button,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useDispatch, useSelector } from 'react-redux';
import { find } from 'lodash';

import { Site, SiteUpdateParams, Status } from 'store/Sites/types';
import { getSiteNameAndRegion } from 'store/Sites/helpers';
import { siteDraftSelector, setSiteDraft } from 'store/Sites/selectedSiteSlice';
import { useFormField } from 'hooks/useFormField';
import TextField from 'common/Forms/TextField';
import StatusSelector from 'common/StatusSelector';
import { userInfoSelector } from 'store/User/userSlice';
import { sanitizeUrl } from '@braintree/sanitize-url';

const NUMERIC_FIELD_STEP = 1 / 10 ** 15;

const EditForm = ({
  site,
  loading,
  onClose,
  onSubmit,
  classes,
}: EditFormProps) => {
  const dispatch = useDispatch();
  const user = useSelector(userInfoSelector);

  const draftSite = useSelector(siteDraftSelector);
  const location = site.polygon.type === 'Point' ? site.polygon : null;
  const { latitude: draftLatitude, longitude: draftLongitude } =
    draftSite?.coordinates || {};

  const [editToken, setEditToken] = React.useState(
    !!site.maskedSpotterApiToken,
  );

  const [editContactInfo, setEditContactInfo] = React.useState(false);

  const setDraftSiteCoordinates =
    (field: 'longitude' | 'latitude') => (value: string) => {
      dispatch(
        setSiteDraft({
          ...draftSite,
          coordinates: draftSite?.coordinates && {
            ...draftSite.coordinates,
            [field]: parseFloat(value),
          },
        }),
      );
    };

  // Form Fields
  const [siteName, setSiteName] = useFormField<string>(
    getSiteNameAndRegion(site).name ?? '',
    ['required', 'maxLength'],
  );

  const [siteDepth, setSiteDepth] = useFormField<string>(
    site.depth?.toString() ?? '',
    ['required', 'isInt'],
  );

  const [siteLatitude, setSiteLatitude] = useFormField<string>(
    location?.coordinates[1].toString() ?? '',
    ['required', 'isNumeric', 'isLat'],
    draftLatitude?.toString(),
    setDraftSiteCoordinates('latitude'),
  );

  const [siteLongitude, setSiteLongitude] = useFormField<string>(
    location?.coordinates[0].toString() ?? '',
    ['required', 'isNumeric', 'isLong'],
    draftLongitude?.toString(),
    setDraftSiteCoordinates('longitude'),
  );

  const [siteSensorId, setSensorId] = useFormField<string>(
    site.sensorId ?? '',
    ['maxLength'],
  );

  const [siteSpotterApiToken, setSiteSpotterApiToken] = useFormField<string>(
    site.maskedSpotterApiToken ?? '',
    ['maxLength'],
  );

  const [apiTokenChanged, setApiTokenChanged] = React.useState(false);

  const [status, setStatus] = useFormField<string>(site.status, []);

  const [display, setDisplay] = useFormField<boolean>(site.display, []);

  const [videoStream, setVideoStream] = useFormField<string>(
    site.videoStream || '',
    [],
  );

  const [contactInformation, setContactInformation] = useFormField<string>(
    site.contactInformation || '',
    ['maxLength'],
  );

  const [siteIframe, setSiteIframe] = useFormField<string>(site.iframe || '', [
    'maxLength',
  ]);

  const onApiTokenBlur = () => {
    if (siteSpotterApiToken.value === '' && site.maskedSpotterApiToken) {
      setSiteSpotterApiToken(site.maskedSpotterApiToken);
      setApiTokenChanged(false);
    }
  };
  const onApiTokenFocus = () => {
    if (!apiTokenChanged) {
      setSiteSpotterApiToken('');
    }
  };

  const formSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (
      siteName.value &&
      siteDepth.value &&
      siteLatitude.value &&
      siteLongitude.value
    ) {
      const insertedTokenValue = apiTokenChanged
        ? siteSpotterApiToken.value
        : undefined;
      const spotterApiToken = editToken ? insertedTokenValue : null;
      // fields need to be undefined in order not be affected by the update.
      // siteSensorId.value here can be <empty string> which our api does not accept
      const sensorId = siteSensorId.value || undefined;
      const statusVal = status.value;
      const displayVal = display.value;
      const videoStreamVal = videoStream.value || null;
      const contactInformationVal = contactInformation.value || null;
      const updateParams: SiteUpdateParams = {
        coordinates: {
          latitude: parseFloat(siteLatitude.value),
          longitude: parseFloat(siteLongitude.value),
        },
        name: siteName.value,
        depth: parseInt(siteDepth.value, 10),
        sensorId,
        spotterApiToken,
        ...(siteIframe.value ? { iframe: sanitizeUrl(siteIframe.value) } : {}),
        ...(user?.adminLevel === 'super_admin' && statusVal
          ? { status: statusVal as Status }
          : {}),
        ...(user?.adminLevel === 'super_admin' ? { display: displayVal } : {}),
        ...(user?.adminLevel === 'super_admin'
          ? { videoStream: videoStreamVal }
          : {}),
        ...(user?.adminLevel === 'super_admin' && editContactInfo
          ? { contactInformation: contactInformationVal }
          : {}),
      };
      onSubmit(updateParams);
    }
    event.preventDefault();
  };

  const onFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    checked?: boolean,
  ) => {
    const { name: field, value: newValue } = event.target;
    switch (field) {
      case 'siteName':
        setSiteName(newValue);
        break;
      case 'depth':
        setSiteDepth(newValue);
        break;
      case 'latitude':
        setSiteLatitude(newValue, true);
        break;
      case 'longitude':
        setSiteLongitude(newValue, true);
        break;
      case 'spotterId':
        setSensorId(newValue);
        break;
      case 'spotterApiToken':
        setSiteSpotterApiToken(newValue);
        setApiTokenChanged(true);
        break;
      case 'status':
        setStatus(newValue);
        break;
      case 'display':
        setDisplay(!!checked);
        break;
      case 'videoStream':
        setVideoStream(newValue);
        break;
      case 'contactInformation':
        setContactInformation(newValue);
        break;
      case 'iframe':
        setSiteIframe(newValue);
        break;
      default:
        break;
    }
  };

  return (
    <form onSubmit={formSubmit}>
      <Grid container alignItems="flex-end" spacing={3}>
        <Grid container item sm={12} md={6} spacing={2}>
          <Grid item sm={8} xs={12}>
            <TextField
              formField={siteName}
              label="Site Name"
              placeholder="Site Name"
              name="siteName"
              onChange={onFieldChange}
            />
          </Grid>
          <Grid item sm={4} xs={12}>
            <TextField
              formField={siteDepth}
              label="Depth (m)"
              placeholder="Depth (m)"
              name="depth"
              isNumeric
              step={1}
              onChange={onFieldChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Alert className={classes.infoAlert} icon={false} severity="info">
              <Typography variant="subtitle2">
                Only Sofar Ocean spotters are supported for now. Please contact
                us if you would like to connect other live buoys at{' '}
                <a
                  href="mailto:admin@aqualink.org?subject=Connect%20a%20buoy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  admin@aqualink.org
                </a>
                .
              </Typography>
            </Alert>
          </Grid>
          <Grid item sm={8} xs={8}>
            <TextField
              formField={siteSensorId}
              label="Spotter ID"
              placeholder="Spotter ID"
              name="spotterId"
              onChange={onFieldChange}
            />
          </Grid>
          <Grid
            item
            xs={4}
            style={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <FormControlLabel
              labelPlacement="start"
              control={
                <Checkbox
                  color="primary"
                  checked={editToken}
                  onChange={() => setEditToken(!editToken)}
                />
              }
              label="Add a custom API token"
            />
          </Grid>
          {editToken && (
            <Grid item xs={12}>
              <TextField
                formField={siteSpotterApiToken}
                label="Spotter API token"
                placeholder="Spotter API token"
                name="spotterApiToken"
                onChange={onFieldChange}
                onBlur={onApiTokenBlur}
                onFocus={onApiTokenFocus}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Alert className={classes.infoAlert} icon={false} severity="info">
              <Typography variant="subtitle2">
                You can also change your site position by dragging the pin on
                the map.
              </Typography>
            </Alert>
          </Grid>
          <Grid item sm={6} xs={12}>
            <TextField
              formField={siteLatitude}
              label="Latitude"
              placeholder="Latitude"
              name="latitude"
              isNumeric
              step={NUMERIC_FIELD_STEP}
              onChange={onFieldChange}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <TextField
              formField={siteLongitude}
              label="Longitude"
              placeholder="Longitude"
              name="longitude"
              isNumeric
              step={NUMERIC_FIELD_STEP}
              onChange={onFieldChange}
            />
          </Grid>
          {user?.adminLevel === 'super_admin' && (
            <Grid item xs={4}>
              <StatusSelector
                status={status.value as Status | ''}
                onChange={onFieldChange}
                name="status"
              />
            </Grid>
          )}
          {user?.adminLevel === 'super_admin' && (
            <Grid
              item
              xs={2}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Checkbox
                    color="primary"
                    name="display"
                    checked={display.value}
                    onChange={onFieldChange}
                  />
                }
                label="display"
              />
            </Grid>
          )}
          {user?.adminLevel === 'super_admin' && (
            <Grid item xs={6}>
              <TextField
                formField={videoStream}
                label="Video Stream"
                placeholder="Video Stream"
                name="videoStream"
                onChange={onFieldChange}
              />
            </Grid>
          )}
          {user?.adminLevel === 'super_admin' && (
            <Grid
              item
              xs={4}
              style={{ display: 'flex', justifyContent: 'flex-start' }}
            >
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Checkbox
                    color="primary"
                    checked={editContactInfo}
                    onChange={() => setEditContactInfo(!editContactInfo)}
                  />
                }
                label="Edit Contact Info"
              />
            </Grid>
          )}
          {user?.adminLevel === 'super_admin' && (
            <Grid item xs={8}>
              <TextField
                disabled={!editContactInfo}
                formField={contactInformation}
                label="Contact Information"
                placeholder="Contact Information"
                name="contactInformation"
                onChange={onFieldChange}
              />
            </Grid>
          )}
          {
            // Temporally hide this option
            false && (
              <TextField
                formField={siteIframe}
                label="iframe"
                placeholder="iframe"
                name="iframe"
                onChange={onFieldChange}
              />
            )
          }
        </Grid>
        <Grid
          container
          justifyContent="flex-end"
          item
          sm={12}
          md={4}
          spacing={3}
        >
          <Grid item>
            <Button
              onClick={onClose}
              variant="outlined"
              size="medium"
              color="secondary"
            >
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button
              type="submit"
              disabled={
                loading ||
                !!find(
                  [siteName, siteDepth, siteLongitude, siteLatitude],
                  (field) => field.error,
                )
              }
              variant="outlined"
              size="medium"
              color="primary"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

const styles = () =>
  createStyles({
    textField: {
      color: 'black',
      alignItems: 'center',
    },
    infoAlert: {
      marginTop: '0.5rem',
    },
  });

interface EditFormIncomingProps {
  site: Site;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: SiteUpdateParams) => void;
}

type EditFormProps = EditFormIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(EditForm);
