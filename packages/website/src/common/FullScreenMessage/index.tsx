import React from 'react';
import { useTheme, Box, Typography } from '@mui/material';

const FullScreenMessage = ({ message }: FullScreenMessageProps) => {
  const theme = useTheme();
  return (
    <Box
      height="100%"
      textAlign="center"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color={theme.palette.primary.main}
    >
      <Typography variant="h2">{message}</Typography>
    </Box>
  );
};

interface FullScreenMessageProps {
  message: string;
}

export default FullScreenMessage;
