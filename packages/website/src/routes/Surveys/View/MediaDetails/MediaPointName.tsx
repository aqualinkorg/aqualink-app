import React from 'react';
import { Link } from 'react-router-dom';
import { isNumber } from 'lodash';
import { Grid, Typography, Tooltip, Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import classNames from 'classnames';
import SurveyPointSelector from 'common/SurveyPointSelector';

const MediaPointName = ({
  pointName,
  pointId,
  siteId,
  selectedPoint,
  editing,
  editSurveyPointId,
  setEditSurveyPointId,
  classes,
}: MediaPointNameProps) => {
  React.useEffect(() => {
    if (!editing) {
      setEditSurveyPointId(pointId);
    }
  }, [editing, pointId, setEditSurveyPointId]);

  return (
    <Grid container spacing={1} alignItems="baseline">
      <Grid style={{ alignSelf: 'end' }} item>
        <Typography variant="h6">Survey Point: </Typography>
      </Grid>
      {editing ? (
        <Grid item xs={10}>
          <SurveyPointSelector
            handleSurveyPointChange={(e) =>
              setEditSurveyPointId(Number(e.target.value))
            }
            value={editSurveyPointId}
            siteId={siteId}
          />
        </Grid>
      ) : (
        <Grid className={classes.surveyPointName} item>
          {isNumber(pointId) ? (
            <Tooltip title="View survey point" arrow placement="top">
              <Link
                className={classes.link}
                to={`/sites/${encodeURIComponent(
                  siteId,
                )}/points/${encodeURIComponent(pointId)}`}
              >
                <Typography
                  className={classNames(classes.titleName, {
                    [classes.selectedPoi]: pointName === selectedPoint,
                  })}
                  variant="h6"
                >
                  {pointName}
                </Typography>
              </Link>
            </Tooltip>
          ) : (
            <Typography
              className={classNames(classes.titleName, {
                [classes.selectedPoi]: pointName === selectedPoint,
              })}
              variant="h6"
            >
              {pointName}
            </Typography>
          )}
        </Grid>
      )}
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    surveyPointName: {
      maxWidth: 'calc(100% - 120px)', // width of 100% minus the "Survey Point:" label
      height: '4em',
      display: 'flex',
    },
    link: {
      textDecoration: 'none',
      color: 'inherit',
      '&:hover': {
        textDecoration: 'none',
        color: 'inherit',
      },
      display: 'flex',
    },
    titleName: {
      fontSize: 18,
      lineHeight: 1.56,
      width: '100%',
      display: 'block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      alignSelf: 'end',
    },
    selectedPoi: {
      color: theme.palette.primary.main,
    },
  });

interface MediaPointNameIncomingProps {
  siteId: number;
  pointName: string;
  pointId?: number;
  selectedPoint?: string;
  editing: boolean;
  editSurveyPointId?: number;
  setEditSurveyPointId: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
}

MediaPointName.defaultProps = {
  pointId: undefined,
  selectedPoint: undefined,
};

type MediaPointNameProps = MediaPointNameIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(MediaPointName);
