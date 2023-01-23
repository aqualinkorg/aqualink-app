import React from "react";
import { Link } from "react-router-dom";
import { isNumber } from "lodash";
import {
  Grid,
  Typography,
  Tooltip,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  MenuItem,
  TextField,
  Button,
} from "@material-ui/core";
import classNames from "classnames";
import AddIcon from "@material-ui/icons/Add";
import { useSelector } from "react-redux";
import NewSurveyPointDialog from "../../../../common/NewSurveyPointDialog";
import { siteDetailsSelector } from "../../../../store/Sites/selectedSiteSlice";

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
  const [addSurveyPointDialogOpen, setAddSurveyPointDialogOpen] =
    React.useState<boolean>(false);
  const surveyPointOptions =
    useSelector(siteDetailsSelector)?.surveyPoints || [];

  React.useEffect(() => {
    if (!editing) {
      setEditSurveyPointId(pointId);
    }
  }, [editing, pointId, setEditSurveyPointId]);

  return (
    <>
      <NewSurveyPointDialog
        siteId={siteId}
        open={addSurveyPointDialogOpen}
        onClose={() => setAddSurveyPointDialogOpen(false)}
      />
      <Grid container spacing={1} alignItems="baseline">
        <Grid style={{ alignSelf: "end" }} item>
          <Typography variant="h6">Survey Point: </Typography>
        </Grid>
        {editing ? (
          <Grid item xs={10}>
            <TextField
              className={classes.textField}
              select
              id="surveyPoint"
              name="surveyPoint"
              onChange={(e) => setEditSurveyPointId(Number(e.target.value))}
              value={editSurveyPointId}
              variant="outlined"
              fullWidth
              inputProps={{
                className: classes.textField,
              }}
            >
              {surveyPointOptions.map((item) => (
                <MenuItem
                  className={classNames(classes.textField, classes.menuItem)}
                  value={item.id}
                  key={item.id}
                >
                  {item.name}
                </MenuItem>
              ))}
              <MenuItem className={classes.textField}>
                <AddIcon />
                <Button
                  style={{ color: "black" }}
                  onClick={() => setAddSurveyPointDialogOpen(true)}
                >
                  Add new survey point
                </Button>
              </MenuItem>
            </TextField>
          </Grid>
        ) : (
          <Grid className={classes.surveyPointName} item>
            {isNumber(pointId) ? (
              <Tooltip title="View survey point" arrow placement="top">
                <Link
                  className={classes.link}
                  to={`/sites/${siteId}/points/${pointId}`}
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
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    surveyPointName: {
      maxWidth: "calc(100% - 120px)", // width of 100% minus the "Survey Point:" label
      height: "4em",
      display: "flex",
    },
    link: {
      textDecoration: "none",
      color: "inherit",
      "&:hover": {
        textDecoration: "none",
        color: "inherit",
      },
      display: "flex",
    },
    titleName: {
      fontSize: 18,
      lineHeight: 1.56,
      width: "100%",
      display: "block",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      alignSelf: "end",
    },
    selectedPoi: {
      color: theme.palette.primary.main,
    },
    textField: {
      color: "black",
      "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.23)",
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
    },
    menuItem: {
      overflowWrap: "break-word",
      display: "block",
      whiteSpace: "unset",
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
