import React from "react";
import { Box, Button, CircularProgress, makeStyles } from "@material-ui/core";

const UploadButton = ({ loading, onUpload }: UploadButtonProps) => {
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
          "UPLOAD FILES"
        )}
      </Button>
    </Box>
  );
};

const useStyles = makeStyles(() => ({
  root: {
    marginLeft: "auto",
    minWidth: 140,
  },
}));

interface UploadButtonProps {
  loading: boolean;
  onUpload: () => Promise<void>;
}

export default UploadButton;
