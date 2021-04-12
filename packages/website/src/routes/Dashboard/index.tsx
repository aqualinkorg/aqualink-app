import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Container,
} from "@material-ui/core";
import { RouteComponentProps, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import NavBar from "../../common/NavBar";
import Footer from "../../common/Footer";
import {
  userInfoSelector,
  userLoadingSelector,
} from "../../store/User/userSlice";

const Dashboard = ({ match, classes }: DashboardProps) => {
  const storedUser = useSelector(userInfoSelector);
  const userLoading = useSelector(userLoadingSelector);
  const { userId } = match.params;
  const unauthorized = !userLoading && userId !== storedUser?.id.toString();
  return (
    <>
      {unauthorized && <Redirect to="/" />}
      <NavBar searchLocation={false} />
      <Container className={classes.root}>
        <h1>{`Dashboard for user ${userId} works!`}</h1>
      </Container>
      <Footer />
    </>
  );
};

const styles = () =>
  createStyles({
    root: {
      flexGrow: 1,
    },
  });

interface MatchProps extends RouteComponentProps<{ userId: string }> {}

interface DashboardIncomingProps {}

type DashboardProps = MatchProps &
  DashboardIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(Dashboard);
