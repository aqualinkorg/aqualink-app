import React from 'react';
import {
  Card,
  CardMedia,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
  Theme,
  Tooltip,
  TextField,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import SaveIcon from '@mui/icons-material/Save';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSelector } from 'react-redux';
import observationOptions, { findOption } from 'constants/uploadDropdowns';
import {
  Observations,
  SurveyMedia,
  SurveyMediaUpdateRequestData,
} from 'store/Survey/types';
import {
  surveyLoadingSelector,
  surveyMediaEditLoadingSelector,
} from 'store/Survey/surveySlice';

const SliderCard = ({
  media,
  isSiteAdmin,
  editing,
  setEditing,
  editSurveyPointId,
  onSurveyMediaUpdate,
  classes,
}: SliderCardProps) => {
  const {
    id,
    url,
    comments: existingComments,
    observations: existingObservations,
    featured,
  } = media;
  const [editComments, setEditComments] = React.useState(
    existingComments || undefined,
  );
  const [observation, setObservation] =
    React.useState<Observations>(existingObservations);

  const mediaLoading = useSelector(surveyMediaEditLoadingSelector);
  const surveyLoading = useSelector(surveyLoadingSelector);

  const loading = mediaLoading || surveyLoading;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  function onClose() {
    setEditing(false);
    setEditComments(existingComments || undefined);
    setObservation(existingObservations);
  }

  function onSave() {
    if (
      editComments !== existingComments ||
      observation !== existingObservations ||
      editSurveyPointId !== media.surveyPoint?.id
    ) {
      onSurveyMediaUpdate(id, {
        featured,
        comments: editComments !== existingComments ? editComments : undefined,
        observations:
          observation !== existingObservations ? observation : undefined,
        surveyPoint:
          editSurveyPointId !== media.surveyPoint?.id
            ? { id: editSurveyPointId }
            : undefined,
      });
    }
    setEditing(false);
  }

  return (
    <Card elevation={3} className={classes.shadowBox}>
      {loading ? (
        <div className={classes.loaderWrapper}>
          <CircularProgress size="4rem" thickness={1} />
        </div>
      ) : (
        <Grid className={classes.fullHeight} container>
          <Grid className={classes.imageWrapper} item sm={12} md={6}>
            <CardMedia className={classes.cardImage} image={url} />
          </Grid>
          <Grid
            className={classes.mediaInfoWrapper}
            container
            item
            sm={12}
            md={6}
          >
            <Grid container item xs={10} alignItems="flex-start" spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">IMAGE OBSERVATION</Typography>
                {editing ? (
                  <TextField
                    className={classes.input}
                    select
                    id="observation"
                    name="observation"
                    onChange={(e) =>
                      setObservation(e.target.value as Observations)
                    }
                    value={observation}
                    placeholder="Select One"
                    variant="outlined"
                    slotProps={{
                      htmlInput: {
                        className: classes.textField,
                      },
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
                ) : (
                  <Typography variant="subtitle1">
                    {findOption(existingObservations)}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">IMAGE COMMENTS</Typography>
                {editing ? (
                  <TextField
                    className={classes.input}
                    variant="outlined"
                    multiline
                    name="comments"
                    placeholder="Comments"
                    onChange={(e) => setEditComments(e.target.value)}
                    value={editComments}
                    minRows={isMobile ? 1 : 7}
                    slotProps={{
                      htmlInput: {
                        className: classes.textField,
                      },
                    }}
                  />
                ) : (
                  <Typography variant="subtitle1">
                    {existingComments}
                  </Typography>
                )}
              </Grid>
            </Grid>
            {isSiteAdmin && (
              <Grid
                container
                item
                direction="column"
                xs={2}
                spacing={1}
                style={{ flexWrap: 'unset' }}
              >
                <Grid item xs={editing ? 8 : 10}>
                  {featured ? (
                    <Tooltip title="Featured image">
                      <IconButton className={classes.featuredIcon} size="large">
                        <StarIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Set as featured image">
                      <IconButton
                        onClick={() =>
                          onSurveyMediaUpdate(id, { featured: true })
                        }
                        className={classes.featuredIcon}
                        size="large"
                      >
                        <StarBorderIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
                {editing && (
                  <Grid item xs={2}>
                    <IconButton
                      className={classes.featuredIcon}
                      onClick={() => onSave()}
                      size="large"
                    >
                      <SaveIcon color="primary" />
                    </IconButton>
                  </Grid>
                )}
                <Grid item xs={2}>
                  {editing ? (
                    <IconButton
                      className={classes.featuredIcon}
                      onClick={() => onClose()}
                      size="large"
                    >
                      <CancelIcon color="secondary" />
                    </IconButton>
                  ) : (
                    <IconButton
                      className={classes.featuredIcon}
                      onClick={() => setEditing(true)}
                      size="large"
                    >
                      <EditIcon color="primary" />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
    </Card>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    shadowBox: {
      backgroundColor: '#f5f6f6',
      color: theme.palette.text.secondary,
      marginBottom: '4rem',
      height: '28rem',
      [theme.breakpoints.down('md')]: {
        height: '32rem',
      },
    },
    loaderWrapper: {
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullHeight: {
      height: '100%',
    },
    imageWrapper: {
      width: '100%',
      [theme.breakpoints.down('md')]: {
        height: '50%',
      },
    },
    cardImage: {
      width: '100%',
      height: '100%',
    },
    mediaInfoWrapper: {
      height: '100%',
      overflowY: 'auto',
      padding: theme.spacing(2, 2, 2, 3),
      [theme.breakpoints.down('md')]: {
        height: '50%',
      },
    },
    featuredIcon: {
      height: '3rem',
      width: '3rem',
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
    input: {
      width: '90%',
    },
  });

interface SliderCardIncomingProps {
  media: SurveyMedia;
  isSiteAdmin: boolean;
  editing: boolean;
  editSurveyPointId?: number;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onSurveyMediaUpdate: (
    mediaId: number,
    data: Partial<SurveyMediaUpdateRequestData>,
  ) => void;
}

type SliderCardProps = SliderCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SliderCard);
