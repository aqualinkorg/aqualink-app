import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  IconButton,
} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";

const UploadMedia = ({ changeTab, classes }: UploadMediaProps) => {
  return (
    <div className={classes.root}>
      <IconButton
        edge="start"
        color="primary"
        aria-label="menu"
        onClick={() => changeTab(0)}
      >
        <ArrowBack />
      </IconButton>
    </div>
  );
};

const styles = () =>
  createStyles({
    root: {
      marginTop: "2rem",
    },
  });

interface UploadMediaIncomingProps {
  changeTab: (index: number) => void;
}

type UploadMediaProps = UploadMediaIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(UploadMedia);
