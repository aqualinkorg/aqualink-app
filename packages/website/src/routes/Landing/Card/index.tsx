import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Grid,
  Typography,
  GridProps,
  CardMedia,
} from "@material-ui/core";

const Card = ({
  title,
  text,
  backgroundColor,
  direction,
  image,
  classes,
}: CardProps) => {
  return (
    <Box bgcolor={backgroundColor} mt="5rem">
      <Grid container direction={direction} item xs={12}>
        <Grid item xs={12} md={6}>
          <Box padding="4rem">
            <Box mb="1rem">
              <Typography className={classes.cardTitle} variant="h5">
                {title}
              </Typography>
            </Box>
            <Typography variant="h6">{text}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <CardMedia
            className={classes.cardImage}
            component="img"
            src={image}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const styles = () =>
  createStyles({
    cardTitle: {
      fontWeight: 500,
    },
    cardImage: {
      height: "100%",
    },
  });

export interface CardIncomingProps {
  title: string;
  text: string;
  backgroundColor: string;
  direction: GridProps["direction"];
  image: string;
}

type CardProps = CardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Card);
