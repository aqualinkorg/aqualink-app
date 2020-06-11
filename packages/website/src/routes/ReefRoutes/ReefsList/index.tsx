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
import { useHistory } from "react-router-dom";

const ReefsList = ({ classes }: ReefsListProps) => {
  const history = useHistory();

  return (
    <>
      <div className={classes.root}>
        <List component="nav">
          <ListItem button>
            <ListItemText
              primary="Reef 1"
              onClick={() => {
                history.push("/reefs/1");
              }}
            />
          </ListItem>
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
