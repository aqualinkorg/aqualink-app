import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import ChatIcon from '@mui/icons-material/Chat';
import { styles } from './styles';

const ChatButton = ({ classes, onClick }: ChatButtonProps) => {
  return (
    <Tooltip
      title="Ask AI about coral bleaching and heat stress"
      placement="left"
    >
      <Fab
        className={classes.chatButton}
        color="primary"
        aria-label="open ai chat"
        onClick={onClick}
      >
        <ChatIcon />
      </Fab>
    </Tooltip>
  );
};

interface ChatButtonIncomingProps {
  onClick: () => void;
}

type ChatButtonProps = WithStyles<typeof styles> & ChatButtonIncomingProps;

export default withStyles(styles)(ChatButton);
