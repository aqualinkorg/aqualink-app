import {
  Grid,
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Tooltip,
  Theme,
  Alert,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import isEmpty from 'lodash/isEmpty';
import { TimeSeriesSurveyPoint } from 'store/Sites/types';

import { grey } from '@mui/material/colors';
import { AvailableRange, RangeButton, RangeValue } from './types';
import { availableRangeString } from './helpers';

const Header = ({
  id,
  range,
  disableMaxRange,
  title = '',
  onRangeChange,
  classes,
  availableRanges = [],
  timeZone,
  showRangeButtons = true,
  surveyPoint,
}: HeaderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const buttons: RangeButton[] = [
    {
      id: 'one_month',
      title: '1 Month',
      tooltip: '1 month from maximum date',
    },
    {
      id: 'one_year',
      title: '1 Year',
      tooltip: 'Range of 1 year from maximum date',
    },
    {
      id: 'max',
      title: 'Max',
      disabled: disableMaxRange,
      tooltip: disableMaxRange ? 'No maximum range' : 'Maximun range',
    },
    {
      id: 'custom',
      title: 'Custom',
      tooltip: 'Custom range',
    },
  ];

  return (
    <div id={id}>
      <Grid
        className={classes.autoWidth}
        container
        alignItems="flex-end"
        justifyContent="space-between"
        spacing={2}
      >
        <Grid item>
          <Box ml={isMobile ? 0 : 4}>
            <Typography
              className={classes.title}
              variant="h6"
              color="textSecondary"
            >
              {title?.toUpperCase() || 'TEMPERATURE'}
            </Typography>
            {surveyPoint?.name && (
              <Typography className={classes.title} variant="subtitle1">
                Survey point: {surveyPoint.name}
              </Typography>
            )}
            {!isEmpty(availableRanges) && (
              <Grid
                className={classes.rangesWrapper}
                container
                alignItems="center"
                spacing={2}
              >
                {availableRanges?.map(({ name, data }) => {
                  const dateRangeString = availableRangeString(
                    name,
                    data?.[0],
                    timeZone,
                  );

                  if (!dateRangeString) {
                    return null;
                  }

                  return (
                    <Grid key={name} item>
                      <Alert
                        classes={{
                          icon: classes.rangeIcon,
                          root: classes.rangeItem,
                        }}
                        severity="info"
                      >
                        <Typography variant="subtitle2">
                          {dateRangeString}
                        </Typography>
                      </Alert>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Grid>
        {showRangeButtons && (
          <Grid item xs={isMobile ? 12 : undefined}>
            <Box ml={isMobile ? 0 : 4}>
              <Grid
                className={classes.autoWidth}
                container
                justifyContent={isMobile ? 'center' : 'flex-start'}
                alignItems="center"
                spacing={2}
              >
                <Grid item xs={isMobile ? 12 : undefined}>
                  <Typography
                    className={classes.rangeTitle}
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    View Range:
                  </Typography>
                </Grid>
                {buttons.map((button) => (
                  <Grid key={button.id} item xs={isMobile ? 12 : undefined}>
                    <Tooltip arrow placement="top" title={button.tooltip}>
                      <div>
                        <Button
                          onClick={() => onRangeChange(button.id)}
                          size="small"
                          variant={
                            range === button.id ? 'contained' : 'outlined'
                          }
                          color="primary"
                          disabled={button.disabled}
                          fullWidth
                        >
                          <Typography variant="subtitle1">
                            {button.title}
                          </Typography>
                        </Button>
                      </div>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    autoWidth: {
      width: 'auto',
    },
    rangesWrapper: {
      marginTop: 0,
    },
    rangeItem: {
      height: 28,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: grey[100],
      color: grey[600],
      borderRadius: 5,
      padding: '2px 5px',
    },
    title: {
      marginLeft: theme.spacing(1.5),
    },
    rangeTitle: {
      [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(1.5),
      },
    },
    rangeIcon: {
      color: 'inherit !important',
      fontSize: theme.spacing(2),
      marginRight: 5,
    },
  });

interface HeaderIncomingProps {
  id?: string;
  range: RangeValue | undefined;
  disableMaxRange: boolean;
  title?: string;
  availableRanges?: AvailableRange[];
  onRangeChange: (value: RangeValue) => void;
  timeZone?: string | null;
  showRangeButtons?: boolean;
  surveyPoint?: TimeSeriesSurveyPoint;
}

type HeaderProps = HeaderIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Header);
