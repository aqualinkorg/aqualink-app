import React, { forwardRef } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Grid,
  Typography,
  GridProps,
  CardMedia,
  Theme,
} from "@material-ui/core";

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { title, text, backgroundColor, direction, image, scaleDown, classes },
    ref
  ) => {
    const titleOnly = !text;

    return (
      <div ref={ref}>
        <Box bgcolor={backgroundColor} className={classes.container}>
          <Grid container direction={direction} item xs={12}>
            <Grid item xs={12} md={titleOnly ? 12 : 6}>
              <Box className={classes.textContainer}>
                <Box mb="1rem">
                  <Typography
                    className={classes.cardTitle}
                    variant="h5"
                    align={titleOnly ? "center" : "inherit"}
                  >
                    {title}
                  </Typography>
                </Box>
                <Typography variant="h6">{text}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={titleOnly ? 12 : 6}>
              <CardMedia
                className={
                  scaleDown ? classes.cardImageScaleDown : classes.cardImage
                }
                component="img"
                src={image}
              />
            </Grid>
          </Grid>
        </Box>
      </div>
    );
  }
);

const styles = (theme: Theme) =>
  createStyles({
    container: {
      marginTop: "5rem",
      [theme.breakpoints.down("sm")]: {
        marginTop: "2rem",
      },
    },
    textContainer: {
      padding: "4rem",
      [theme.breakpoints.down("sm")]: {
        padding: "1rem",
      },
    },
    cardTitle: {
      fontWeight: 500,
    },
    cardImage: {
      height: "100%",
    },
    cardImageScaleDown: {
      height: "100%",
      objectFit: "scale-down",
    },
  });

export interface CardIncomingProps {
  title: string;
  text?: string;
  backgroundColor: string;
  direction: GridProps["direction"];
  image: string;
  scaleDown?: boolean;
}

Card.defaultProps = { scaleDown: false };

type CardProps = CardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Card);
