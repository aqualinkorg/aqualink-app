import { Backdrop, CircularProgress } from '@mui/material';
import React from 'react';

interface LoadingBackdropProps {
  loading: boolean;
}

function LoadingBackdrop({ loading }: LoadingBackdropProps) {
  return (
    <Backdrop open={loading} style={{ zIndex: 42 }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export default LoadingBackdrop;
