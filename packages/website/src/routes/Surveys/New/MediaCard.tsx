import React, { ChangeEvent, useCallback } from 'react';
import {
  Theme,
  Grid,
  Paper,
  Typography,
  IconButton,
  CardMedia,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { DeleteOutlineOutlined } from '@mui/icons-material';
import observationOptions from 'constants/uploadDropdowns';
import { SurveyPoints } from 'store/Sites/types';
import SurveyPointSelector from 'common/SurveyPointSelector';
import { ReactComponent as StarIcon } from '../../../assets/starIcon.svg';

const MediaCard = ({
  preview,
  surveyPoint,
  siteId,
  observation,
  comments,
  index,
  file = null,
  featuredFile,
  handleSurveyPointOptionAdd,
  deleteCard,
  setFeatured,
  handleCommentsChange,
  handleObservationChange,
  handleSurveyPointChange,
  classes,
}: MediaCardProps) => {
  const size = (file && file.size && file.size / 1000000)?.toFixed(2);

  const onImageClick = useCallback(() => {
    setFeatured(index);
  }, [index, setFeatured]);

  return (
    <Grid style={{ marginTop: '2rem' }} container item xs={12}>
      <Paper elevation={0} className={classes.mediaCardWrapper}>
        <Grid
          style={{ height: '100%' }}
          container
          alignItems="center"
          justifyContent="space-between"
          item
          xs={12}
        >
          <Grid style={{ height: '100%' }} item xs={3}>
            <CardMedia className={classes.cardImage} image={preview}>
              {size && (
                <Grid
                  className={classes.mediaSizeWrapper}
                  container
                  item
                  xs={12}
                  alignItems="flex-end"
                  justifyContent="flex-end"
                >
                  <Grid
                    className={classes.mediaSize}
                    container
                    alignItems="center"
                    justifyContent="center"
                    item
                    xs={3}
                  >
                    <Typography variant="subtitle2">{size} MB</Typography>
                  </Grid>
                </Grid>
              )}
            </CardMedia>
          </Grid>
          <Grid container justifyContent="center" item xs={3}>
            <Grid style={{ marginBottom: '1rem' }} item xs={10}>
              <Typography color="textSecondary" variant="h6">
                Survey Point
              </Typography>
            </Grid>
            <Grid style={{ marginBottom: '2rem' }} item xs={10}>
              <SurveyPointSelector
                handleSurveyPointChange={handleSurveyPointChange}
                handleSurveyPointOptionAdd={handleSurveyPointOptionAdd}
                value={surveyPoint}
                siteId={siteId}
              />
            </Grid>

            <Grid style={{ marginBottom: '1rem' }} item xs={10}>
              <Typography color="textSecondary" variant="h6">
                Observation
              </Typography>
            </Grid>
            <Grid style={{ marginBottom: '2rem' }} item xs={10}>
              <TextField
                className={classes.textField}
                select
                id="observation"
                name="observation"
                onChange={handleObservationChange}
                value={observation}
                placeholder="Select One"
                fullWidth
                variant="outlined"
                inputProps={{
                  className: classes.textField,
                }}
              >
                {observationOptions.map((item) => (
                  <MenuItem
                    className={classes.textField}
                    value={item.key}
                    key={item.key}
                  >
                    {item.value}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid container justifyContent="center" item xs={5}>
            <Grid style={{ marginBottom: '1rem' }} item xs={12}>
              <Typography color="textSecondary" variant="h6">
                Comments
              </Typography>
            </Grid>
            <Grid style={{ marginBottom: '2rem' }} item xs={12}>
              <TextField
                className={classes.textField}
                variant="outlined"
                multiline
                name="comments"
                placeholder="Comments"
                onChange={handleCommentsChange}
                value={comments}
                rows="8"
                fullWidth
                inputProps={{
                  className: classes.textField,
                }}
              />
            </Grid>
          </Grid>
          <Grid style={{ height: '100%' }} container item xs={1}>
            <Grid
              container
              item
              alignContent="space-between"
              justifyContent="flex-end"
              xs={12}
            >
              <IconButton onClick={onImageClick} size="large">
                <Tooltip
                  title={
                    index === featuredFile
                      ? 'Featured image'
                      : 'Set this image as featured'
                  }
                >
                  <StarIcon
                    fill={index === featuredFile ? '#168dbd' : '#939393'}
                    className={classes.starIcon}
                  />
                </Tooltip>
              </IconButton>
              <IconButton onClick={() => deleteCard(index)} size="large">
                <DeleteOutlineOutlined />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    mediaCardWrapper: {
      width: '100%',
      border: 1,
      borderStyle: 'solid',
      borderColor: '#dddddd',
      borderRadius: 2,
      height: '17rem',
    },
    cardImage: {
      height: '100%',
      width: '100%',
      borderRadius: '2px 0 0 2px',
      transition: 'all 0.3s ease',
    },
    textField: {
      color: 'black',
      '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0, 0, 0, 0.23)',
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    mediaSizeWrapper: {
      height: '100%',
    },
    mediaSize: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      height: '2rem',
      borderRadius: '2px 0 0 2px',
    },
    newSurveyPointDialog: {
      width: '20rem',
      '& > *:last-child': {
        padding: theme.spacing(2),
      },
    },
    starIcon: {
      height: 42,
      padding: 8,
    },
    image: {
      height: '100%',
      cursor: 'pointer',
      outline: 'none',
    },
  });

interface MediaCardIncomingProps {
  index: number;
  preview: string;
  siteId: number;
  surveyPoint?: number;
  observation: string;
  comments: string;
  file?: File | null;
  featuredFile: number | null;
  handleSurveyPointOptionAdd: (arg0: string, arg1: SurveyPoints[]) => void;
  deleteCard: (index: number) => void;
  setFeatured: (index: number) => void;
  handleCommentsChange: (event: ChangeEvent<{ value: unknown }>) => void;
  handleObservationChange: (event: ChangeEvent<{ value: unknown }>) => void;
  handleSurveyPointChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

type MediaCardProps = MediaCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(MediaCard);
