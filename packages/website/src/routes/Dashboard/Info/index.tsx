import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Theme,
  Divider,
} from "@material-ui/core";

import { User } from "../../../store/User/types";
import { Collection } from "../collection";
import Header from "./Header";
import BarChart from "./BarChart";

const Info = ({ user, collection, classes }: InfoProps) => {
  return (
    <Box
      className={classes.root}
      borderRadius="5px"
      border="2px solid #EEEEEE"
      height="480px"
      padding="18px 23px"
      mt="46px"
      display="flex"
      flexDirection="column"
    >
      <Header user={user} collection={collection} />
      <Divider className={classes.divider} />
      <BarChart collection={collection} />
    </Box>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.between("md", "md")]: {
        height: 420,
      },
      [theme.breakpoints.down("xs")]: {
        height: 440,
        padding: "18px 16px",
      },
    },

    divider: {
      margin: "20px 0",
    },
  });

interface InfoIncomingProps {
  user: User;
  collection: Collection;
}

type InfoProps = InfoIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Info);
