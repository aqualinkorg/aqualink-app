import React from "react";
import { useTheme, Box, Typography } from "@material-ui/core";

const Message = ({ message }: MessageProps) => {
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

interface MessageProps {
  message: string;
}

export default Message;
