import { Typography } from '@mui/material';
import Button from 'common/Button';
import React from 'react';

interface InfoWithActionProps {
  message: string;
  actionText: string;
  action: () => void;
}

function InfoWithAction({ message, actionText, action }: InfoWithActionProps) {
  return (
    <>
      <Typography variant="h3" style={{ textAlign: 'center' }} color="primary">
        {message}
      </Typography>
      <Button color="primary" onClick={action}>
        {actionText}
      </Button>
    </>
  );
}

export default InfoWithAction;
