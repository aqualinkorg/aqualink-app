import React, { ChangeEvent, useState } from 'react';
import {
  Box,
  Container,
  Collapse,
  Card,
  IconButton,
  Grid,
  Theme,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector, useDispatch } from 'react-redux';
import { every } from 'lodash';

import { Site } from 'store/Sites/types';
import { userInfoSelector } from 'store/User/userSlice';
import { setSiteSurveyPoints } from 'store/Sites/selectedSiteSlice';
import { useFormField } from 'hooks/useFormField';
import surveyServices from 'services/surveyServices';
import EditForm from './EditForm';
import Info from './Info';
import Map from './Map';

const InfoCard = ({ site, pointId, bgColor, classes }: InfoCardProps) => {
  const user = useSelector(userInfoSelector);
  const dispatch = useDispatch();
  const surveyPoint = site.surveyPoints.find((item) => item.id === pointId);
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editAlertOpen, setEditAlertOpen] = useState(false);
  const [editAlertSeverity, setEditAlertSeverity] = useState<
    'success' | 'error'
  >();

  const [editPointName, setEditPointName] = useFormField<string>(
    surveyPoint?.name ?? '',
    ['required', 'maxLength'],
  );
  const [editPointLatitude, setEditPointLatitude] = useFormField<string>(
    surveyPoint?.polygon?.type === 'Point'
      ? surveyPoint.polygon.coordinates[1].toString()
      : '',
    ['required', 'isNumeric', 'isLat'],
  );
  const [editPointLongitude, setEditPointLongitude] = useFormField<string>(
    surveyPoint?.polygon?.type === 'Point'
      ? surveyPoint.polygon.coordinates[0].toString()
      : '',
    ['required', 'isNumeric', 'isLong'],
  );

  const onFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name: field, value: newValue } = event.target;
    switch (field) {
      case 'pointName':
        setEditPointName(newValue);
        break;
      case 'latitude':
        setEditPointLatitude(newValue);
        break;
      case 'longitude':
        setEditPointLongitude(newValue);
        break;
      default:
        break;
    }
  };

  const onEditPointCoordinatesChange = (lat: string, lng: string) => {
    setEditPointLatitude(lat);
    setEditPointLongitude(lng);
  };

  const onSubmit = () => {
    if (
      user?.token &&
      every(
        [editPointName, editPointLatitude, editPointLongitude],
        (item) => item.value,
      )
    ) {
      setEditLoading(true);
      surveyServices
        .updatePoi(
          pointId,
          {
            name: editPointName.value,
            latitude: parseFloat(editPointLatitude.value),
            longitude: parseFloat(editPointLongitude.value),
          },
          user.token,
        )
        .then(({ data: newPoint }) => {
          dispatch(
            setSiteSurveyPoints(
              site.surveyPoints.map((point) => ({
                id: point.id,
                name: point.id === pointId ? newPoint.name : point.name,
                polygon:
                  point.id === pointId ? newPoint.polygon : point.polygon,
              })),
            ),
          );
          setEditAlertSeverity('success');
        })
        .catch(() => setEditAlertSeverity('error'))
        .finally(() => {
          setEditLoading(false);
          setEditModeEnabled(false);
          setEditAlertOpen(true);
        });
    }
  };

  return (
    <Box bgcolor={bgColor}>
      <Container>
        <Collapse in={editAlertOpen}>
          <Alert
            severity={editAlertSeverity}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => {
                  setEditAlertOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {editAlertSeverity === 'success'
              ? 'Successfully updated survey point information'
              : 'Something went wrong'}
          </Alert>
        </Collapse>
        <Grid className={classes.cardWrapper} container justifyContent="center">
          <Grid item xs={12} sm={12}>
            <Card elevation={3}>
              <Grid container justifyContent="space-between">
                {editModeEnabled ? (
                  <EditForm
                    editLoading={editLoading}
                    editPointName={editPointName}
                    editPointLatitude={editPointLatitude}
                    editPointLongitude={editPointLongitude}
                    onFieldChange={onFieldChange}
                    onSaveButtonClick={onSubmit}
                    onCancelButtonClick={() => setEditModeEnabled(false)}
                  />
                ) : (
                  <Info
                    site={site}
                    pointId={pointId}
                    onEditButtonClick={() => setEditModeEnabled(true)}
                  />
                )}
                <Map
                  site={site}
                  selectedPointId={pointId}
                  editModeEnabled={editModeEnabled}
                  editPointLatitude={editPointLatitude}
                  editPointLongitude={editPointLongitude}
                  onEditPointCoordinatesChange={onEditPointCoordinatesChange}
                />
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    cardWrapper: {
      marginBottom: 100,
      [theme.breakpoints.down('sm')]: {
        marginBottom: 50,
      },
    },
  });

interface InfoCardIncomingProps {
  site: Site;
  pointId: number;
  bgColor: string;
}

type InfoCardProps = InfoCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(InfoCard);
