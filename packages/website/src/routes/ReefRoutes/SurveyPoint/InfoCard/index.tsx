import React, { ChangeEvent, useState } from "react";
import {
  Box,
  Container,
  Collapse,
  Card,
  IconButton,
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Theme,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import CloseIcon from "@material-ui/icons/Close";
import { useSelector, useDispatch } from "react-redux";
import { every } from "lodash";

import EditForm from "./EditForm";
import Info from "./Info";
import Map from "./Map";
import { Reef } from "../../../../store/Reefs/types";
import { useFormField } from "../../../../hooks/useFormField";
import { userInfoSelector } from "../../../../store/User/userSlice";
import surveyServices from "../../../../services/surveyServices";
import { setReefPois } from "../../../../store/Reefs/selectedReefSlice";

const InfoCard = ({ reef, pointId, bgColor, classes }: InfoCardProps) => {
  const user = useSelector(userInfoSelector);
  const dispatch = useDispatch();
  const surveyPoint = reef.surveyPoints.find((item) => item.id === pointId);
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editAlertOpen, setEditAlertOpen] = useState(false);
  const [editAlertSeverity, setEditAlertSeverity] = useState<
    "success" | "error"
  >();

  const [editPointName, setEditPointName] = useFormField(surveyPoint?.name, [
    "required",
    "maxLength",
  ]);
  const [editPointLatitude, setEditPointLatitude] = useFormField(
    surveyPoint?.polygon?.type === "Point"
      ? surveyPoint.polygon.coordinates[1].toString()
      : undefined,
    ["required", "isNumeric", "isLat"]
  );
  const [editPointLongitude, setEditPointLongitude] = useFormField(
    surveyPoint?.polygon?.type === "Point"
      ? surveyPoint.polygon.coordinates[0].toString()
      : undefined,
    ["required", "isNumeric", "isLong"]
  );

  const onFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name: field, value: newValue } = event.target;
    switch (field) {
      case "pointName":
        setEditPointName(newValue);
        break;
      case "latitude":
        setEditPointLatitude(newValue);
        break;
      case "longitude":
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
        (item) => item.value
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
          user.token
        )
        .then(({ data: newPoint }) => {
          dispatch(
            setReefPois(
              reef.surveyPoints.map((point) => ({
                id: point.id,
                name: point.id === pointId ? newPoint.name : point.name,
                polygon:
                  point.id === pointId ? newPoint.polygon : point.polygon,
              }))
            )
          );
          setEditAlertSeverity("success");
        })
        .catch(() => setEditAlertSeverity("error"))
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
            {editAlertSeverity === "success"
              ? "Successfully updated survey point information"
              : "Something went wrong"}
          </Alert>
        </Collapse>
        <Grid className={classes.cardWrapper} container justify="center">
          <Grid item xs={12} sm={12}>
            <Card elevation={3}>
              <Grid container justify="space-between">
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
                    reef={reef}
                    pointId={pointId}
                    onEditButtonClick={() => setEditModeEnabled(true)}
                  />
                )}
                <Map
                  reef={reef}
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
      [theme.breakpoints.down("xs")]: {
        marginBottom: 50,
      },
    },
  });

interface InfoCardIncomingProps {
  reef: Reef;
  pointId: number;
  bgColor: string;
}

type InfoCardProps = InfoCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(InfoCard);
