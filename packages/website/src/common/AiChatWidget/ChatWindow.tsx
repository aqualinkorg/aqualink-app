import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactMarkdown from 'react-markdown';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import { useSelector } from 'react-redux';
import { userInfoSelector } from '../../store/User/userSlice';
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

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Generate the initial greeting by calling the API with isFirstMessage: true
const generateInitialGreeting = async (
  siteId: number,
  userId?: number,
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello',
        siteId,
        userId,
        conversationHistory: [],
        isFirstMessage: true,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.response;
    }

    // Try to parse structured error (no mutations)
    const details = await (async () => {
      try {
        const err = await response.json();
        return err?.details || err?.message || 'Unknown error';
      } catch {
        const errorText = await response.text();
        return errorText || 'Unknown error';
      }
    })();

    console.error('API error:', details);
  } catch (error) {
    console.error('Failed to generate initial greeting:', error);
  }

  // Fallback greeting if API fails
  return "Hi! I'm your AI assistant for coral reef monitoring. I can help you understand heat stress, coral bleaching, and suggest response actions. What would you like to know?";
};

function ChatWindow({
  classes,
  onClose,
  siteId,
}: ChatWindowProps) {
  const user = useSelector(userInfoSelector);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGreeting, setIsLoadingGreeting] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load or generate initial greeting
  useEffect(() => {
    const initializeChat = async () => {
      // Try to load from localStorage first
      const saved = localStorage.getItem(`chat-history-${siteId}`);
      if (saved) {
        try {
          const savedMessages = JSON.parse(saved);
          // NEW: Validate saved messages aren't corrupted
          if (Array.isArray(savedMessages) && savedMessages.length > 0) {
            setMessages(savedMessages);
            setIsLoadingGreeting(false);
            return;
          }
        } catch (error) {
          console.error('Failed to load chat history:', error);
          // NEW: Clear corrupted localStorage
          localStorage.removeItem(`chat-history-${siteId}`);
        }
      }

      // No saved history, generate fresh greeting
      const greetingText = await generateInitialGreeting(siteId, user?.id);
      const initialMessage: Message = {
        sender: 'assistant',
        text: greetingText,
        id: `msg-${Date.now()}`,
      };
      setMessages([initialMessage]);
      setIsLoadingGreeting(false);
    };

    initializeChat();
  }, [siteId, user?.id]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat-history-${siteId}`, JSON.stringify(messages));
    }
  }, [messages, siteId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClearHistory = async () => {
    // eslint-disable-next-line no-alert
    const confirmClear = window.confirm('Clear chat history for this site?');
    if (confirmClear) {
      setIsLoadingGreeting(true);
      // Generate fresh contextual greeting
      const greetingText = await generateInitialGreeting(siteId, user?.id);
      const initialMessage: Message = {
        sender: 'assistant',
        text: greetingText,
        id: `msg-${Date.now()}`,
      };
      setMessages([initialMessage]);
      localStorage.removeItem(`chat-history-${siteId}`);
      setIsLoadingGreeting(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      sender: 'user',
      text: inputValue,
      id: `msg-${Date.now()}-user`,
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

      const response = await fetch(`${API_BASE_URL}/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          siteId,
          userId: user?.id,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        // Attempt to read structured backend error
        const backendMessage = await (async () => {
          try {
            const err = await response.json();
            const msg = err?.message;
            const details = err?.details;
            return (
              [msg, details].filter(Boolean).join(': ') ||
              'Failed to get AI response'
            );
          } catch {
            const text = await response.text();
            return text || 'Failed to get AI response';
          }
        })();
        throw new Error(backendMessage);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        sender: 'assistant',
        text: data.response,
        id: `msg-${Date.now()}-assistant`,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const readable = error instanceof Error ? error.message : String(error);
      console.error('Error calling AI:', readable);
      const errorMessage: Message = {
        sender: 'assistant',
        text:
          readable ||
          "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
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
        {isLoadingGreeting ? (
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
        ) : (
          messages.map((msg) => (
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
          ))
        )}

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
}

export default withStyles(styles)(ChatWindow);
