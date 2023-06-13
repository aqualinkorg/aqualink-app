import {
  Button,
  MenuItem,
  TextField,
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import AddIcon from '@material-ui/icons/Add';
import classNames from 'classnames';
import { siteDetailsSelector } from 'store/Sites/selectedSiteSlice';
import { SurveyPoints } from 'store/Sites/types';
import NewSurveyPointDialog from '../NewSurveyPointDialog';

function SurveyPointSelector({
  handleSurveyPointChange,
  handleSurveyPointOptionAdd,
  value,
  siteId,
  classes,
}: SurveyPointSelectorProps) {
  const surveyPointOptions =
    useSelector(siteDetailsSelector)?.surveyPoints || [];
  const [addSurveyPointDialogOpen, setAddSurveyPointDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <NewSurveyPointDialog
        siteId={siteId}
        open={addSurveyPointDialogOpen}
        onClose={() => setAddSurveyPointDialogOpen(false)}
        onSuccess={handleSurveyPointOptionAdd}
      />
      <TextField
        className={classes.textField}
        select
        id="surveyPoint"
        name="surveyPoint"
        onChange={handleSurveyPointChange}
        value={value}
        fullWidth
        variant="outlined"
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
            style={{ color: 'black' }}
            onClick={() => setAddSurveyPointDialogOpen(true)}
          >
            Add new survey point
          </Button>
        </MenuItem>
      </TextField>
    </>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    textField: {
      color: 'black',
      '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0, 0, 0, 0.23)',
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    menuItem: {
      maxWidth: 280,
      overflowWrap: 'break-word',
      display: 'block',
      whiteSpace: 'unset',
    },
  });

interface SurveyPointSelectorIncomingProps {
  handleSurveyPointChange: (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => void;
  handleSurveyPointOptionAdd?: (arg0: string, arg1: SurveyPoints[]) => void;
  value: number | undefined;
  siteId: number;
}

type SurveyPointSelectorProps = SurveyPointSelectorIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyPointSelector);
