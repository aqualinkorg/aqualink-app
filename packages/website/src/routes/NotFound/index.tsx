import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { Link } from 'react-router-dom';
import NotFoundButton from '../../assets/img/404_click.png';
import NotFoundBG from '../../assets/img/404_background.jpg';

const NotFoundPage = ({ classes }: NotFoundPageProps) => {
  return (
    <div className={classes.background}>
      <Link to="/map">
        <img src={NotFoundButton.src} alt="404 Not Found" />
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
