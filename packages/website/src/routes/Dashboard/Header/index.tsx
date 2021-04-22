import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Grid,
  Typography,
  Button,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { useHistory } from "react-router-dom";

const Header = ({ collectionName, classes }: HeaderProps) => {
  const history = useHistory();
  return (
    <Box mt="50px">
      <Grid container alignItems="center" spacing={1}>
        <Grid item>
          <Button onClick={() => history.goBack()}>
            <ArrowBackIcon color="primary" />
          </Button>
        </Grid>
        <Grid item>
          <Typography className={classes.name} color="textSecondary">
            {collectionName}
          </Typography>
        </Grid>
        {/* TODO: Add collection name edit functionality */}
        {/* <Grid item>
          <IconButton>
            <EditIcon fontSize="small" color="primary" />
          </IconButton>
        </Grid> */}
      </Grid>
    </Box>
  );
};

const styles = () =>
  createStyles({
    name: {
      fontSize: 24,
    },
  });

interface HeaderIncomingProps {
  collectionName: string;
}

type HeaderProps = HeaderIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Header);
