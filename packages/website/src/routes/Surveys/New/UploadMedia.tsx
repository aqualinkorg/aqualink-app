import React, { useState, useCallback, ChangeEvent, useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  IconButton,
  Grid,
  Typography,
  Button,
  Collapse,
  LinearProgress,
  Popover,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { ArrowBack, CloudUploadOutlined } from "@material-ui/icons";
import CloseIcon from "@material-ui/icons/Close";
import Dropzone, { FileRejection } from "react-dropzone";
import { useSelector } from "react-redux";

import MediaCard from "./MediaCard";
import uploadServices from "../../../services/uploadServices";
import surveyServices from "../../../services/surveyServices";
import { userInfoSelector } from "../../../store/User/userSlice";
import { surveyDetailsSelector } from "../../../store/Survey/surveySlice";
import { SurveyMediaData } from "../../../store/Survey/types";
import { Pois } from "../../../store/Reefs/types";
import reefServices from "../../../services/reefServices";

const maxUploadSize = 40 * 1000 * 1000; // 40mb

const UploadMedia = ({
  reefId,
  reefName,
  changeTab,
  classes,
}: UploadMediaProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Metadata[]>([]);
  const user = useSelector(userInfoSelector);
  const survey = useSelector(surveyDetailsSelector);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<
    "success" | "error" | "info" | "warning" | undefined
  >(undefined);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [featuredFile, setFeaturedFile] = useState<number | null>(null);
  const [hidden, setHidden] = useState<boolean[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [surveyPointOptions, setSurveyPointOptions] = useState<Pois[]>([]);

  const handleFileDrop = useCallback(
    (acceptedFiles: File[], fileRejections) => {
      // TODO - add explicit error warnings.
      fileRejections.forEach((rejection: FileRejection) => {
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
          surveyPoint: "",
          comments: "",
        })),
      ]);
      setHidden([...hidden, ...acceptedFiles.map(() => false)]);
    },
    [files, previews, metadata, hidden]
  );

  useEffect(() => {
    reefServices
      .getReefPois(`${reefId}`)
      .then((response) => setSurveyPointOptions(response.data));
  }, [setSurveyPointOptions, reefId]);

  const handlePoiOptionAdd = (index: number, name: string) => {
    surveyServices
      .addNewPoi(reefId, name, user?.token)
      .then(() => {
        return reefServices.getReefPois(`${reefId}`);
      })
      .then((response) => {
        const len = response.data.length;
        setSurveyPointOptions(response.data);

        return response.data[len - 1].id;
      })
      .then((id) => {
        const newMetadata = metadata.map((item, key) => {
          if (key === index) {
            return {
              ...item,
              surveyPoint: `${id}`,
            };
          }
          return item;
        });
        setMetadata(newMetadata);
      });
  };

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const missingObservations = () => {
    const index = metadata.findIndex((item) => item.observation === null);

    return index > -1;
  };

  const deleteCard = (index: number) => {
    setPreviews(previews.filter((item, key) => key !== index));
    setFiles(files.filter((item, key) => key !== index));
    setMetadata(metadata.filter((item, key) => key !== index));
  };

  const removeCards = () => {
    setFiles([]);
    setMetadata([]);
    setPreviews([]);
  };

  const setFeatured = useCallback(
    (index: number) => {
      if (featuredFile === index) {
        // If file is already selected, uncheck it
        setFeaturedFile(null);
      } else {
        setFeaturedFile(index);
      }
    },
    [featuredFile]
  );

  const onMediaSubmit = () => {
    files.forEach((file, index) => {
      const formData = new FormData();
      formData.append("file", file);
      setLoading(true);
      uploadServices
        .uploadMedia(formData, `${reefId}`, user?.token)
        .then((response) => {
          const url = response.data;
          const surveyId = survey?.id;
          const surveyMediaData: SurveyMediaData = {
            url,
            poiId: metadata[index].surveyPoint
              ? parseInt(metadata[index].surveyPoint, 10)
              : ((undefined as unknown) as number),
            observations: metadata[index].observation,
            comments: metadata[index].comments || undefined,
            metadata: "{}",
            token: user?.token,
            featured: index === featuredFile,
            hidden: hidden[index],
          };
          surveyServices
            .addSurveyMedia(`${reefId}`, `${surveyId}`, surveyMediaData)
            .then(() => {
              setFiles([]);
              setMetadata([]);
              setPreviews([]);
              setHidden([]);
              setFeaturedFile(null);
              setAlertMessage("Successfully uploaded media");
              setAlertSeverity("success");
              setAlertOpen(true);
            })
            .catch((err) => {
              setAlertMessage(err.message);
              setAlertSeverity("error");
              setAlertOpen(true);
            })
            .finally(() => setLoading(false));
        })
        .catch((err) => {
          setAlertMessage(err.message);
          setAlertSeverity("error");
          setAlertOpen(true);
        });
    });
  };

  const handleSurveyPointChange = (index: number) => {
    return (event: ChangeEvent<{ value: unknown }>) => {
      const surveyPoint = event.target.value as string;
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
      const observation = event.target.value as SurveyMediaData["observations"];
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

  const handleHiddenChange = (index: number) => {
    const newHidden = hidden.map((item, key) => {
      if (key === index) {
        return !item;
      }
      return item;
    });
    setHidden(newHidden);
  };

  const fileCards = previews.map((preview, index) => {
    return (
      <MediaCard
        key={preview}
        index={index}
        preview={preview}
        file={files[index]}
        surveyPointOptions={surveyPointOptions}
        handlePoiOptionAdd={handlePoiOptionAdd}
        surveyPoint={
          (metadata && metadata[index] && metadata[index].surveyPoint) || ""
        }
        observation={
          (metadata && metadata[index] && metadata[index].observation) || ""
        }
        comments={
          (metadata && metadata[index] && metadata[index].comments) || ""
        }
        deleteCard={deleteCard}
        setFeatured={setFeatured}
        featuredFile={featuredFile}
        hidden={hidden[index]}
        handleHiddenChange={handleHiddenChange}
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
            severity={alertSeverity}
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
      <Grid className={classes.root} container justify="center" item xs={12}>
        <Grid container justify="flex-start" alignItems="center" item xs={10}>
          <Grid item>
            <IconButton
              edge="start"
              color="primary"
              aria-label="menu"
              onClick={() => changeTab(0)}
            >
              <ArrowBack />
            </IconButton>
          </Grid>
          <Grid item>
            {reefName && (
              <Typography variant="h5">{`${reefName.toUpperCase()} MEDIA UPLOAD`}</Typography>
            )}
          </Grid>
        </Grid>
        <Grid container justify="center" item xs={4}>
          <Dropzone
            accept={["image/png", "image/jpeg", "image/gif"]}
            onDrop={handleFileDrop}
            maxSize={maxUploadSize}
          >
            {({ getRootProps, getInputProps }) => (
              <Grid
                container
                justify="center"
                {...getRootProps({ className: classes.dropzone })}
              >
                <input {...getInputProps()} />
                <Grid container justify="center" item xs={12}>
                  <CloudUploadOutlined fontSize="large" color="primary" />
                </Grid>
                <Grid container justify="center" item xs={12}>
                  <Typography variant="h5">
                    Drag and drop or click here
                  </Typography>
                </Grid>
                <Grid container justify="center" item xs={12}>
                  <Typography variant="subtitle2">
                    Supported formats: .jpg .png .gif Max 40mb.
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Dropzone>
        </Grid>
        <Grid style={{ marginBottom: "2rem" }} container item xs={11} lg={9}>
          {fileCards}
        </Grid>
        {files && files.length > 0 && (
          <Grid
            style={{ margin: "4rem 0 2rem 0" }}
            container
            justify="flex-end"
            item
            xs={9}
          >
            <Popover
              id="mouse-over-popover"
              className={classes.popover}
              open={Boolean(anchorEl) && missingObservations()}
              anchorEl={anchorEl}
              classes={{
                paper: classes.paper,
              }}
              anchorOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              onClose={handlePopoverClose}
              disableRestoreFocus
            >
              <Grid
                className={classes.popoverText}
                container
                justify="center"
                alignItems="center"
              >
                <Typography color="textSecondary">
                  Missing Observation Info
                </Typography>
              </Grid>
            </Popover>
            <Button
              style={{ marginRight: "1rem" }}
              color="primary"
              variant="outlined"
              onClick={removeCards}
            >
              Cancel
            </Button>
            <div
              onMouseEnter={handlePopoverOpen}
              onMouseLeave={handlePopoverClose}
            >
              <Button
                disabled={missingObservations()}
                onClick={onMediaSubmit}
                color="primary"
                variant="contained"
              >
                Save
              </Button>
            </div>
          </Grid>
        )}
      </Grid>
    </>
  );
};

const styles = () =>
  createStyles({
    root: {
      marginTop: "2rem",
    },
    dropzone: {
      borderWidth: 2,
      borderRadius: 2,
      borderColor: "#eeeeee",
      borderStyle: "dashed",
      backgroundColor: "#fafafa",
      height: "8rem",
      width: "100%",
    },
    popover: {
      pointerEvents: "none",
    },
    popoverText: {
      height: "3rem",
      width: "12rem",
    },
    paper: {
      backgroundColor: "rgba(22, 141, 189, 0.3)",
    },
  });

interface UploadMediaIncomingProps {
  changeTab: (index: number) => void;
  reefName: string | null;
  reefId: number;
}

interface Metadata {
  surveyPoint: string;
  observation: SurveyMediaData["observations"];
  comments: string;
}

type UploadMediaProps = UploadMediaIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(UploadMedia);
