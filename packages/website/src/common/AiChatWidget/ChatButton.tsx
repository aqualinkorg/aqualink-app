import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import aiChat from '../../assets/aiChat.png';
import { styles } from './styles';

function ChatButton({ classes, onClick }: ChatButtonProps) {
  return (
    <Tooltip
      title="Ask AI about coral bleaching and heat stress"
      placement="left"
    >
      <Fab
        className={classes.chatButton}
        onClick={onClick}
        style={{
          backgroundImage: `url(${aiChat})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#2873c5',
        }}
      />
    </Tooltip>
  );
}

interface ChatButtonIncomingProps {
  onClick: () => void;
}

type ChatButtonProps = WithStyles<typeof styles> & ChatButtonIncomingProps;

export default withStyles(styles)(ChatButton);
