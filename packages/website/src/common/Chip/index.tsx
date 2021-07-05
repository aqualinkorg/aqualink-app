import React from "react";
import {
  Typography,
  Grid,
  Theme,
  makeStyles,
  createStyles,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { grey } from "@material-ui/core/colors";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chip: ({ width }: { width?: number }) => ({
      backgroundColor: "#dddddd",
      borderRadius: 8,
      height: 24,
      width: width || 60,
      display: "flex",
      [theme.breakpoints.between("md", "md")]: {
        width: width || 48,
      },
    }),
    chipText: {
      fontSize: 9,
      color: grey[600],
      [theme.breakpoints.between("md", "md")]: {
        fontSize: 7,
      },
    },
    circle: {
      backgroundColor: "#51DD00",
      borderRadius: "50%",
      height: 8.4,
      width: 8.4,
      marginRight: 5,
    },
    link: {
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      color: "inherit",
      "&:hover": {
        textDecoration: "none",
        color: "inherit",
      },
    },
    sensorImage: {
      height: 18,
      width: 18,
    },
  })
);

const Chip = ({
  live,
  href,
  to,
  image,
  imageText,
  liveText,
  width,
}: ChipProps) => {
  const classes = useStyles({ width });
  return (
    <Grid className={classes.chip} item>
      <Grid container alignItems="center" justify="center">
        <Link
          to={to || { pathname: href }}
          target={href ? "_blank" : undefined}
          className={classes.link}
        >
          {live ? (
            <>
              <div className={classes.circle} />
              <Typography className={classes.chipText}>
                {liveText || "LIVE"}
              </Typography>
            </>
          ) : (
            <>
              <Typography className={classes.chipText}>{imageText}</Typography>
              {image && (
                <img
                  className={classes.sensorImage}
                  alt="sensor-type"
                  src={image}
                />
              )}
            </>
          )}
        </Link>
      </Grid>
    </Grid>
  );
};

interface ChipProps {
  live: boolean;
  href?: string;
  to?: string;
  liveText?: string;
  imageText?: string | null;
  image?: string | null;
  width?: number;
}

Chip.defaultProps = {
  href: undefined,
  to: undefined,
  imageText: undefined,
  image: undefined,
  liveText: undefined,
  width: undefined,
};

export default Chip;
