import { Switch } from '@mui/material';

import withStyles from '@mui/styles/withStyles';

const OneColorSwitch = withStyles((theme) => ({
  switchBase: {
    color: theme.palette.primary.main,
    '&.Mui-checked': {
      color: theme.palette.primary.main,
    },
    '&.Mui-checked + .MuiSwitch-track': {
      backgroundColor: theme.palette.primary.main,
    },
    '& + .MuiSwitch-track': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  checked: {},
  track: {},
}))(Switch);

export default OneColorSwitch;
