import classNames from 'classnames';
import DefaultDropzone, {
  DropzoneProps as DefaultDropzoneProps,
} from 'react-dropzone';
import { Theme, Grid, Typography, Button } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { alpha } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const GREY_COLOR = grey[500];
const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = [
  { extension: 'xls', mimeType: 'application/vnd.ms-excel' },
  { extension: 'csv', mimeType: 'text/csv' },
  {
    extension: 'xlsx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
];

const DropZone = ({ disabled, onFilesDrop }: DropZoneProps) => {
  const classes = useStyles();

  return (
    <DefaultDropzone
      maxSize={MAX_SIZE_MB * 2 ** 20}
      accept={ACCEPTED_TYPES.map(({ mimeType }) => mimeType)}
      onDropAccepted={onFilesDrop}
      disabled={disabled}
    >
      {({ getRootProps, getInputProps }) => (
        <Grid
          container
          {...getRootProps({
            className: classNames(classes.root, {
              [classes.disabled]: disabled,
            }),
          })}
          justifyContent="center"
          direction="column"
          alignItems="center"
        >
          <input {...getInputProps()} />
          <Grid item>
            <Typography
              className={classes.bold}
              variant="subtitle2"
              display="block"
              align="center"
              gutterBottom
            >
              Drag and Drop your file(s)
            </Typography>
            <Typography
              gutterBottom
              variant="caption"
              display="block"
              align="center"
            >
              or
            </Typography>
            <Typography
              className={classes.bold}
              variant="subtitle2"
              display="block"
              align="center"
              gutterBottom
            >
              Upload file(s)
            </Typography>
          </Grid>
          <Grid item>
            <Button
              size="small"
              className={classes.button}
              color="primary"
              variant="outlined"
              disabled={disabled}
            >
              Select Files
            </Button>
          </Grid>
          <Grid item>
            <Typography
              className={classNames(classes.bold, classes.grey)}
              variant="caption"
              display="block"
              align="center"
            >
              Supported format:{' '}
              {ACCEPTED_TYPES.map(({ extension }) => `.${extension}`).join(
                ', ',
              )}
            </Typography>
            <Typography
              className={classNames(classes.bold, classes.grey)}
              variant="caption"
              display="block"
              align="center"
            >
              Maximum upload total size: {MAX_SIZE_MB}MB
            </Typography>
          </Grid>
        </Grid>
      )}
    </DefaultDropzone>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(5),
    border: `1px dashed ${theme.palette.primary.main}`,
    borderRadius: 10,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    padding: theme.spacing(4),
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    },
    transition: theme.transitions.create(
      ['background-color', 'box-shadow', 'border'],
      {
        duration: '250ms',
        delay: '0ms',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    ),
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none',
    borderColor: GREY_COLOR,
    color: GREY_COLOR,
    backgroundColor: alpha(GREY_COLOR, 0.1),
  },
  bold: {
    fontWeight: 700,
  },
  grey: {
    color: GREY_COLOR,
  },
  button: {
    marginBottom: theme.spacing(2),
  },
}));

interface DropZoneProps {
  disabled: boolean;
  onFilesDrop: DefaultDropzoneProps['onDropAccepted'];
}

export default DropZone;
