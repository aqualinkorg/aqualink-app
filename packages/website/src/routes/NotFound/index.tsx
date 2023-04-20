import React from 'react';
import { withStyles, WithStyles, createStyles } from '@material-ui/core';
import { Link } from 'react-router-dom';
import NotFoundButton from '../../assets/img/404_click.png';
import NotFoundBG from '../../assets/img/404_background.jpg';

const NotFoundPage = ({ classes }: NotFoundPageProps) => {
  return (
    <div className={classes.background}>
      <Link to="/map">
        <img src={NotFoundButton} alt="404 Not Found" />
      </Link>
    </div>
  );
};

const styles = () =>
  createStyles({
    background: {
      backgroundImage: `url("${NotFoundBG}")`,
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

type NotFoundPageProps = WithStyles<typeof styles>;

export default withStyles(styles)(NotFoundPage);
