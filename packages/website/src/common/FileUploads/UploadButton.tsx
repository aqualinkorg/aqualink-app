import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

function UploadButton({ loading, onUpload }: UploadButtonProps) {
  const classes = useStyles();

  return (
    <Box mt={2} display="flex">
      <Button
        color="primary"
        variant="outlined"
        className={classes.root}
        onClick={onUpload}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress color="inherit" size={24.5} />
        ) : (
          'UPLOAD FILES'
        )}
      </Button>
    </Box>
  );
}

const useStyles = makeStyles(() => ({
  root: {
    marginLeft: 'auto',
    minWidth: 140,
  },
}));

interface UploadButtonProps {
  loading: boolean;
  onUpload: () => any;
}

export default UploadButton;
