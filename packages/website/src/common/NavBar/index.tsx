import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Grid,
  IconButton,
  Typography,
  Avatar,
  Button,
  Menu,
  MenuItem,
  Box,
  Hidden,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import NotificationsIcon from "@material-ui/icons/Notifications";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useSelector, useDispatch } from "react-redux";

import RegisterDialog from "../../routes/Homepage/RegisterDialog";
import SignInDialog from "../../routes/Homepage/SignInDialog";
import Search from "../Search";
import MenuDrawer from "../MenuDrawer";
import { userInfoSelector, signOutUser } from "../../store/User/userSlice";

const NavBar = ({ searchLocation, classes }: NavBarProps) => {
  const user = useSelector(userInfoSelector);
  const dispatch = useDispatch();
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);
  const [signInDialogOpen, setSignInDialogOpen] = useState<boolean>(false);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleRegisterDialog = (open: boolean) => setRegisterDialogOpen(open);
  const handleSignInDialog = (open: boolean) => setSignInDialogOpen(open);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar className={classes.appBar} position="static" color="primary">
        <Toolbar className={classes.toolbar}>
          <MenuDrawer
            open={menuDrawerOpen}
            onClose={() => setMenuDrawerOpen(false)}
          />
          <Grid container alignItems="center" spacing={1}>
            <Grid item xs={5} sm={4}>
              <Box display="flex" flexWrap="nowrap" alignItems="center">
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={() => setMenuDrawerOpen(true)}
                >
                  <MenuIcon />
                </IconButton>

                <Typography variant="h4">Aqua</Typography>
                <Typography style={{ color: "#8AC6DE" }} variant="h4">
                  link
                </Typography>
              </Box>
            </Grid>

            {searchLocation && (
              <Hidden xsDown>
                <Grid item sm={4}>
                  <Search />
                </Grid>
              </Hidden>
            )}

            <Grid container justify="flex-end" item xs={7} sm={4}>
              {user ? (
                <>
                  <IconButton className={classes.button}>
                    <NotificationsIcon className={classes.notificationIcon} />
                  </IconButton>
                  <IconButton className={classes.button}>
                    <Avatar />
                  </IconButton>
                  <IconButton className={classes.button} onClick={handleClick}>
                    <ExpandMoreIcon className={classes.expandIcon} />
                  </IconButton>
                  <Menu
                    key="user-menu"
                    className={classes.userMenu}
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem
                      className={classes.menuItem}
                      onClick={() => {
                        dispatch(signOutUser());
                        handleMenuClose();
                      }}
                    >
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Grid item>
                    <Button onClick={() => handleSignInDialog(true)}>
                      SIGN IN
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button onClick={() => handleRegisterDialog(true)}>
                      REGISTER
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>

            {searchLocation && (
              <Hidden smUp>
                <Grid item xs={12} style={{ margin: 0, paddingTop: 0 }}>
                  <Search />
                </Grid>
              </Hidden>
            )}
          </Grid>
        </Toolbar>
      </AppBar>
      <RegisterDialog
        open={registerDialogOpen}
        handleRegisterOpen={handleRegisterDialog}
        handleSignInOpen={handleSignInDialog}
      />
      <SignInDialog
        open={signInDialogOpen}
        handleRegisterOpen={handleRegisterDialog}
        handleSignInOpen={handleSignInDialog}
      />
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    appBar: {
      height: 64,
      "&.MuiPaper-root": {
        backgroundColor: theme.palette.primary.main,
      },

      [theme.breakpoints.only("xs")]: {
        height: 122,
      },
    },
    toolbar: {
      padding: theme.spacing(0, 1),
    },
    userMenu: {
      marginTop: "3rem",
    },
    menuItem: {
      margin: 0,
      backgroundColor: theme.palette.grey[500],
      color: theme.palette.text.secondary,
    },
    notificationIcon: {
      color: "#a9e6ff",
    },
    expandIcon: {
      color: "#ffffff",
    },
    button: {
      padding: theme.spacing(1),
    },
  });

interface NavBarIncomingProps {
  searchLocation: boolean;
}

type NavBarProps = NavBarIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(NavBar);
