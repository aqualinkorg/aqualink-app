import { useState, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconButton,
  Grid,
  Typography,
  Button,
  Collapse,
  LinearProgress,
  Tooltip,
  Theme,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import Alert from '@mui/material/Alert';
import { ArrowBack, CloudUploadOutlined } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import Dropzone, { FileRejection } from 'react-dropzone';
import { useSelector } from 'react-redux';
import { userInfoSelector } from 'store/User/userSlice';
import { surveyDetailsSelector } from 'store/Survey/surveySlice';
import { SurveyMediaData } from 'store/Survey/types';
import { SurveyPoints } from 'store/Sites/types';
import surveyServices from 'services/surveyServices';
import uploadServices from 'services/uploadServices';
import MediaCard from './MediaCard';

const maxUploadSize = 40 * 1000 * 1000; // 40mb

const UploadMedia = ({
  siteId,
  siteName,
  changeTab,
  classes,
}: UploadMediaProps) => {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Metadata[]>([]);
  const user = useSelector(userInfoSelector);
  const survey = useSelector(surveyDetailsSelector);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [featuredFile, setFeaturedFile] = useState<number>(0);
  const missingObservations =
    metadata.findIndex((item) => item.observation === null) > -1;

  const handleFileDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // TODO - add explicit error warnings.
      fileRejections.forEach((rejection: FileRejection) => {
        // eslint-disable-next-line no-console
        console.log(rejection.errors, rejection.file);
      });
      setFiles([...files, ...acceptedFiles]);
      setPreviews([
        ...previews,
        ...acceptedFiles.map((file) => URL.createObjectURL(file)),
      ]);
      setMetadata([
        ...metadata,
        ...acceptedFiles.map(() => ({
          observation: null,
          surveyPoint: undefined,
          comments: '',
        })),
      ]);
    },
    [files, previews, metadata],
  );

  const handleSurveyPointOptionAdd =
    (index: number) => (newPointName: string, newPoints: SurveyPoints[]) => {
      const newPointId = newPoints.find(
        (point) => point.name === newPointName,
      )?.id;

      const newMetadata = metadata.map((item, key) =>
        key === index ? { ...item, surveyPoint: newPointId } : item,
      );
      setMetadata(newMetadata);
    };

  const deleteCard = (index: number) => {
    setPreviews(previews.filter((item, key) => key !== index));
    setFiles(files.filter((item, key) => key !== index));
    setMetadata(metadata.filter((item, key) => key !== index));
    if (index === featuredFile) {
      setFeaturedFile(0);
    }
  };

  const removeCards = () => {
    setFiles([]);
    setMetadata([]);
    setPreviews([]);
  };

  const setFeatured = useCallback((index: number) => {
    setFeaturedFile(index);
  }, []);

  const onMediaSubmit = () => {
    const promises = files.map((file, index) => {
      const formData = new FormData();
      formData.append('file', file);
      return uploadServices
        .uploadMedia(formData, `${siteId}`, user?.token)
        .then((response) => {
          const { url, thumbnailUrl } = response.data;
          const surveyId = survey?.id;
          const surveyMediaData: SurveyMediaData = {
            url,
            thumbnailUrl,
            surveyPointId: metadata[index].surveyPoint
              ? metadata[index].surveyPoint || 10
              : (undefined as unknown as number),
            observations: metadata[index].observation,
            comments: metadata[index].comments || undefined,
            metadata: '{}',
            token: user?.token,
            featured: index === featuredFile,
            hidden: false,
          };
          return surveyServices.addSurveyMedia(
            `${siteId}`,
            `${surveyId}`,
            surveyMediaData,
          );
        });
    });
    setLoading(true);
    Promise.all(promises)
      .then(() => {
        setFiles([]);
        setMetadata([]);
        setPreviews([]);
        setFeaturedFile(0);
        router.push(`/sites/${siteId}/survey_details/${survey?.id}`);
      })
      .catch((err) => {
        setAlertMessage(err.message);
        setAlertOpen(true);
      })
      .finally(() => setLoading(false));
  };

  const handleSurveyPointChange = (index: number) => {
    return (event: ChangeEvent<{ value: unknown }>) => {
      const surveyPoint = Number(event.target.value);
      const newMetadata = metadata.map((item, key) => {
        if (key === index) {
          return {
            ...item,
            surveyPoint,
          };
        }
        return item;
      });
      setMetadata(newMetadata);
    };
  };

  const handleObservationChange = (index: number) => {
    return (event: ChangeEvent<{ value: unknown }>) => {
      const observation = event.target.value as SurveyMediaData['observations'];
      const newMetadata = metadata.map((item, key) => {
        if (key === index) {
          return {
            ...item,
            observation,
          };
        }
        return item;
      });
      setMetadata(newMetadata);
    };
  };

  const handleCommentsChange = (index: number) => {
    return (event: ChangeEvent<{ value: unknown }>) => {
      const comments = event.target.value as string;
      const newMetadata = metadata.map((item, key) => {
        if (key === index) {
          return {
            ...item,
            comments,
          };
        }
        return item;
      });
      setMetadata(newMetadata);
    };
  };

  const fileCards = previews.map((preview, index) => {
    return (
      <MediaCard
        key={preview}
        siteId={siteId}
        index={index}
        preview={preview}
        file={files[index]}
        handleSurveyPointOptionAdd={handleSurveyPointOptionAdd(index)}
        surveyPoint={metadata?.[index]?.surveyPoint}
        observation={metadata?.[index]?.observation || ''}
        comments={metadata?.[index]?.comments || ''}
        deleteCard={deleteCard}
        setFeatured={setFeatured}
        featuredFile={featuredFile}
        handleCommentsChange={handleCommentsChange(index)}
        handleObservationChange={handleObservationChange(index)}
        handleSurveyPointChange={handleSurveyPointChange(index)}
      />
    );
  });

  return (
    <>
      {loading && <LinearProgress />}
      <Grid item xs={12}>
        <Collapse in={alertOpen}>
          <Alert
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setAlertOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {alertMessage}
          </Alert>
        </Collapse>
      </Grid>
      <Grid
        className={classes.root}
        container
        justifyContent="center"
        item
        xs={12}
      >
        <Grid container alignItems="center" item xs={10}>
          <Grid item>
            <IconButton
              edge="start"
              color="primary"
              aria-label="menu"
              onClick={() => changeTab(0)}
              size="large"
            >
              <ArrowBack />
            </IconButton>
          </Grid>
          <Grid item className={classes.siteName}>
            {siteName && (
              <Typography variant="h5">{`${siteName.toUpperCase()} MEDIA UPLOAD`}</Typography>
            )}
          </Grid>
        </Grid>
        <Grid container justifyContent="center" item xs={4}>
          <Dropzone
            accept={['image/png', 'image/jpeg', 'image/gif']}
            onDrop={handleFileDrop}
            maxSize={maxUploadSize}
          >
            {({ getRootProps, getInputProps }) => (
              <Grid
                container
                justifyContent="center"
                {...getRootProps({ className: classes.dropzone })}
              >
                <input {...getInputProps()} />
                <Grid container justifyContent="center" item xs={12}>
                  <CloudUploadOutlined fontSize="large" color="primary" />
                </Grid>
                <Grid container justifyContent="center" item xs={12}>
                  <Typography variant="h5">
                    Drag and drop or click here
                  </Typography>
                </Grid>
                <Grid container justifyContent="center" item xs={12}>
                  <Typography variant="subtitle2">
                    Supported formats: .jpg .png .gif Max 40mb.
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Dropzone>
        </Grid>
        <Grid style={{ marginBottom: '2rem' }} container item xs={11} lg={9}>
          {fileCards}
        </Grid>
        {files && files.length > 0 && (
          <Grid
            style={{ margin: '4rem 0 2rem 0' }}
            container
            justifyContent="flex-end"
            item
            xs={9}
          >
            <Button
              style={{ marginRight: '1rem' }}
              color="primary"
              variant="outlined"
              onClick={removeCards}
            >
              Cancel
            </Button>
            <Tooltip
              title={missingObservations ? 'Missing Observation Info' : ''}
            >
              <div>
                <Button
                  disabled={loading || missingObservations}
                  onClick={onMediaSubmit}
                  color="primary"
                  variant="contained"
                >
                  {loading ? 'Uploading...' : 'Save'}
                </Button>
              </div>
            </Tooltip>
          </Grid>
        )}
      </Grid>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: '2rem',
    },
    dropzone: {
      borderWidth: 2,
      borderRadius: 2,
      borderColor: '#eeeeee',
      borderStyle: 'dashed',
      backgroundColor: '#fafafa',
      height: '8rem',
      width: '100%',
      cursor: 'pointer',
      '&:focus': {
        outline: 'none',
      },
      marginTop: theme.spacing(2),
    },
    siteName: {
      maxWidth: 'calc(100% - 56px)', // 100% minus the back button
      overflowWrap: 'break-word',
    },
    popover: {
      pointerEvents: 'none',
    },
    popoverText: {
      height: '3rem',
      width: '12rem',
    },
    paper: {
      backgroundColor: 'rgba(22, 141, 189, 0.3)',
    },
  });

interface UploadMediaIncomingProps {
  changeTab: (index: number) => void;
  siteName: string | null;
  siteId: number;
}

interface Metadata {
  surveyPoint?: number;
  observation: SurveyMediaData['observations'];
  comments: string;
}

type UploadMediaProps = UploadMediaIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(UploadMedia);
