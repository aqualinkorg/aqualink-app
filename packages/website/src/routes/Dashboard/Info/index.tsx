import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Theme,
  Divider,
} from "@material-ui/core";

import { CollectionDetails } from "../../../store/Collection/types";
import Header from "./Header";
import BarChart from "./BarChart";

const Info = ({ collection, classes }: InfoProps) => {
  return (
    <Box className={classes.root}>
      <Header collection={collection} />
      <Divider className={classes.divider} />
      <BarChart collection={collection} />
    </Box>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      borderRadius: 5,
      border: `2px solid ${theme.palette.grey[200]}`,
      height: 480,
      padding: theme.spacing(3),
      marginTop: 46,
      display: "flex",
      flexDirection: "column",
      [theme.breakpoints.only("md")]: {
        height: 420,
      },
      [theme.breakpoints.down("xs")]: {
        height: 440,
        padding: theme.spacing(2),
      },
    },

    divider: {
      margin: "20px 0",
    },
  });

interface InfoIncomingProps {
  collection: CollectionDetails;
}

type InfoProps = InfoIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Info);
