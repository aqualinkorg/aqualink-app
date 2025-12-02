import React, { useState } from 'react';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';
import { styles } from './styles';

function AiChatWidget({ siteId }: AiChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {!isOpen && <ChatButton onClick={handleToggle} />}
      {isOpen && <ChatWindow onClose={handleClose} siteId={siteId} />}
    </>
  );
}

interface AiChatWidgetIncomingProps {
  siteId: number;
}

type AiChatWidgetProps = WithStyles<typeof styles> & AiChatWidgetIncomingProps;

export default withStyles(styles)(AiChatWidget);
