import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  createStyles,
  withStyles,
  WithStyles,
  Theme,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
} from "@material-ui/core";
import { Link } from "react-router-dom";

import { reefsListSelector } from "../../../store/Reefs/reefsListSlice";
import { Reef } from "../../../store/Reefs/types";
import { colors } from "../../../layout/App/theme";

const marker = require("../../../assets/buoy.png");

const pinIcon = L.icon({
  iconUrl: marker,
  iconSize: [24, 24],
  iconAnchor: [8, 48],
  popupAnchor: [3, -48],
});

const HomepageMap = ({ classes }: HomepageMapProps) => {
  const mapRef = useRef<Map>(null);
  const reefsList = useSelector(reefsListSelector);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState<number>(2);

  useEffect(() => {
    const { current } = mapRef;
    if (current && current.leafletElement) {
      const map = current.leafletElement;
      map.flyTo(center, zoom, { duration: 1 });
    }
  }, [center, zoom]);

  return (
    <Map
      className={classes.map}
      ref={mapRef}
      center={center}
      zoom={zoom}
      minZoom={2}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      {reefsList.length > 0 &&
        reefsList.map((reef: Reef) => {
          if (reef.polygon.type === "Point") {
            const [lng, lat] = reef.polygon.coordinates;
            return (
              <Marker
                onClick={() => {
                  setZoom(6);
                  setCenter([lat, lng]);
                }}
                key={reef.id}
                icon={pinIcon}
                position={[
                  reef.polygon.coordinates[1],
                  reef.polygon.coordinates[0],
                ]}
              >
                <Popup closeButton={false} className={classes.popup}>
                  <Card>
                    <CardHeader
                      className={classes.popupHeader}
                      title={reef.name}
                      subheader={reef.region}
                    />
                    <CardContent>
                      <Grid container item xs={12}>
                        <Grid container justify="flex-start" item xs={6}>
                          <Typography variant="caption" color="textSecondary">
                            TEMP AT 25M
                          </Typography>
                          <Typography
                            style={{ color: colors.lightBlue }}
                            variant="h5"
                            color="textSecondary"
                          >
                            31.8 &#8451;
                          </Typography>
                        </Grid>
                        <Grid container justify="flex-end" item xs={6}>
                          <Typography variant="caption" color="textSecondary">
                            DEG. HEAT. DAYS
                          </Typography>
                          <Typography
                            style={{ color: "purple" }}
                            variant="h5"
                            color="textSecondary"
                          >
                            58
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid
                        style={{ margin: "1rem 0 1rem 0" }}
                        container
                        justify="flex-start"
                        item
                        xs={12}
                      >
                        <Grid item>
                          <Link
                            style={{ color: "inherit", textDecoration: "none" }}
                            to={`/reefs/${reef.id}`}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                            >
                              EXPLORE
                            </Button>
                          </Link>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
    </Map>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    map: {
      height: "100%",
      width: "100%",
    },
    popup: {
      width: "12vw",
    },
    popupHeader: {
      backgroundColor: theme.palette.primary.main,
    },
  });

interface HomepageMapProps extends WithStyles<typeof styles> {}

export default withStyles(styles)(HomepageMap);
