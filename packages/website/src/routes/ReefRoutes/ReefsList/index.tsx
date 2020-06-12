import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  createStyles,
  withStyles,
  WithStyles,
  Theme,
} from "@material-ui/core";
import { Link } from "react-router-dom";

const ReefsList = ({ classes }: ReefsListProps) => {
  return (
    <>
      <div className={classes.root}>
        <List component="nav">
          <Link
            style={{ color: "inherit", textDecoration: "none" }}
            to="/reefs/1"
          >
            <ListItem button>
              <ListItemText primary="Reef 1" />
            </ListItem>
          </Link>
        </List>
      </div>
    </>
  );
};

const styles = (theme: Theme) => {
  return createStyles({
    root: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.palette.primary.dark,
    },
  });
};

interface ReefsListProps extends WithStyles<typeof styles> {}

export default withStyles(styles)(ReefsList);
