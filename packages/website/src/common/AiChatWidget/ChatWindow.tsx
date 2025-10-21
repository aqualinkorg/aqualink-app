import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactMarkdown from 'react-markdown';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import { styles } from './styles';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  id: string;
}

interface ChatWindowProps extends WithStyles<typeof styles> {
  onClose: () => void;
  siteId: number;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  classes,
  onClose,
  siteId,
}) => {
  // Load messages from localStorage on mount
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(`chat-history-${siteId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [
          {
            sender: 'assistant',
            text: "Hi! I'm your AI assistant for coral reef monitoring. I can help you understand heat stress, coral bleaching, and suggest response actions. What would you like to know?",
            id: `msg-${Date.now()}`,
          },
        ];
      }
    }
    return [
      {
        sender: 'assistant',
        text: "Hi! I'm your AI assistant for coral reef monitoring. I can help you understand heat stress, coral bleaching, and suggest response actions. What would you like to know?",
        id: `msg-${Date.now()}`,
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`chat-history-${siteId}`, JSON.stringify(messages));
  }, [messages, siteId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClearHistory = () => {
    // eslint-disable-next-line no-alert
    const confirmClear = window.confirm('Clear chat history for this site?');
    if (confirmClear) {
      const initialMessage: Message = {
        sender: 'assistant',
        text: "Hi! I'm your AI assistant for coral reef monitoring. I can help you understand heat stress, coral bleaching, and suggest response actions. What would you like to know?",
        id: `msg-${Date.now()}`,
      };
      setMessages([initialMessage]);
      localStorage.removeItem(`chat-history-${siteId}`);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      sender: 'user',
      text: inputValue,
      id: `msg-${Date.now()}-${Math.random()}`,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history for context (last 10 messages)
      const conversationHistory = messages.slice(-10).map((msg) => ({
        sender: msg.sender,
        text: msg.text,
      }));

      const API_URL =
        process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${API_URL}/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          siteId,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        sender: 'assistant',
        text: data.response,
        id: `msg-${Date.now()}-${Math.random()}`,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling AI:', error);
      const errorMessage: Message = {
        sender: 'assistant',
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        id: `msg-${Date.now()}-error`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box className={classes.chatWindow}>
      {/* Header */}
      <Box className={classes.chatHeader}>
        <Typography variant="h6" className={classes.chatHeaderTitle}>
          Aqualink AI Assistant
        </Typography>
        <Box>
          <IconButton
            onClick={handleClearHistory}
            size="small"
            className={classes.clearButton}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            onClick={onClose}
            size="small"
            className={classes.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Messages */}
      <Box className={classes.messagesContainer}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            className={`${classes.messageWrapper} ${
              msg.sender === 'user'
                ? classes.userMessageWrapper
                : classes.assistantMessageWrapper
            }`}
          >
            <Box
              className={`${classes.message} ${
                msg.sender === 'user'
                  ? classes.userMessage
                  : classes.assistantMessage
              }`}
            >
              {msg.sender === 'assistant' ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                <Typography variant="body2">{msg.text}</Typography>
              )}
            </Box>
          </Box>
        ))}

        {isLoading && (
          <Box
            className={`${classes.messageWrapper} ${classes.assistantMessageWrapper}`}
          >
            <Box className={`${classes.message} ${classes.assistantMessage}`}>
              <Box className={classes.loadingDots}>
                <Box className={`${classes.dot} ${classes.dot1}`} />
                <Box className={`${classes.dot} ${classes.dot2}`} />
                <Box className={classes.dot} />
              </Box>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box className={classes.inputContainer}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about heat stress, coral bleaching..."
          disabled={isLoading}
          size="small"
          className={classes.inputField}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={isLoading || !inputValue.trim()}
          className={classes.sendButton}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default withStyles(styles)(ChatWindow);
