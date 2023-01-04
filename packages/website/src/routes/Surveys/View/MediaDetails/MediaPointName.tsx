import React from "react";
import { Link } from "react-router-dom";
import { isNumber } from "lodash";
import {
  Grid,
  Typography,
  Tooltip,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from "@material-ui/core";
import classNames from "classnames";

const MediaPointName = ({
  pointName,
  pointId,
  siteId,
  selectedPoint,
  classes,
}: MediaPointNameProps) => {
  return (
    <Grid container spacing={1} alignItems="baseline">
      <Grid item>
        <Typography variant="h6">Survey Point: </Typography>
      </Grid>
      <Grid className={classes.surveyPointName} item>
        {isNumber(pointId) ? (
          <Tooltip title="View survey point" arrow placement="top">
            <Link
              className={classes.link}
              to={`/sites/${siteId}/points/${pointId}`}
            >
              <Typography
                className={classNames(classes.titleName, {
                  [classes.selectedPoi]: pointName === selectedPoint,
                })}
                variant="h6"
              >
                {pointName}
              </Typography>
            </Link>
          </Tooltip>
        ) : (
          <Typography
            className={classNames(classes.titleName, {
              [classes.selectedPoi]: pointName === selectedPoint,
            })}
            variant="h6"
          >
            {pointName}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    surveyPointName: {
      maxWidth: "calc(100% - 120px)", // width of 100% minus the "Survey Point:" label
    },
    link: {
      textDecoration: "none",
      color: "inherit",
      "&:hover": {
        textDecoration: "none",
        color: "inherit",
      },
    },
    titleName: {
      fontSize: 18,
      lineHeight: 1.56,
      width: "100%",
      display: "block",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    selectedPoi: {
      color: theme.palette.primary.main,
    },
  });

interface MediaPointNameIncomingProps {
  siteId: number;
  pointName: string;
  pointId?: number;
  selectedPoint?: string;
}

MediaPointName.defaultProps = {
  pointId: undefined,
  selectedPoint: undefined,
};

type MediaPointNameProps = MediaPointNameIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(MediaPointName);
