import { Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    chatButton: {
      position: 'fixed',
      bottom: theme.spacing(3),
      right: theme.spacing(3),
      zIndex: 1000,
      width: 80,
      height: 80,
      borderRadius: '50%',
      backgroundColor: 'white',
      color: 'white',
      boxShadow: theme.shadows[6],
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        boxShadow: theme.shadows[12],
      },
      [theme.breakpoints.down('sm')]: {
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        width: 56,
        height: 56,
      },
    },
    chatWindow: {
      position: 'fixed',
      bottom: theme.spacing(10),
      right: theme.spacing(2),
      width: 650,
      height: 600,
      zIndex: 1000,
      borderRadius: theme.spacing(1),
      boxShadow: theme.shadows[10],
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.paper,
      [theme.breakpoints.down('md')]: {
        width: 450,
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        height: '100%',
        bottom: 0,
        right: 0,
        borderRadius: 0,
      },
    },
    chatHeader: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      padding: theme.spacing(2),
      borderTopLeftRadius: theme.spacing(1),
      borderTopRightRadius: theme.spacing(1),
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    chatHeaderTitle: {
      fontWeight: 600,
    },
    closeButton: {
      color: 'white',
      padding: theme.spacing(0.5),
    },
    clearButton: {
      color: 'white',
      padding: theme.spacing(0.5),
      marginRight: theme.spacing(1),
    },
    messagesContainer: {
      flexGrow: 1,
      overflowY: 'auto',
      padding: theme.spacing(2),
      backgroundColor: '#f5f5f5',
    },
    messageWrapper: {
      display: 'flex',
      marginBottom: theme.spacing(2),
    },
    userMessageWrapper: {
      justifyContent: 'flex-end',
    },
    assistantMessageWrapper: {
      justifyContent: 'flex-start',
    },
    message: {
      maxWidth: '85%', // Wider messages (was 75%)
      padding: theme.spacing(1.5),
      borderRadius: theme.spacing(1),
      wordWrap: 'break-word',
    },
    userMessage: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      borderBottomRightRadius: theme.spacing(0.5),
    },
    assistantMessage: {
      backgroundColor: 'white',
      color: '#000000',
      border: `1px solid ${theme.palette.divider}`,
      borderBottomLeftRadius: theme.spacing(0.5),
      // Markdown styling
      '& h3': {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
        fontSize: '1.1rem',
        fontWeight: 'bold',
      },
      '& h4': {
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(0.5),
        fontSize: '1rem',
        fontWeight: 'bold',
      },
      '& p': {
        marginBottom: theme.spacing(1),
      },
      '& ul, & ol': {
        paddingLeft: theme.spacing(2),
        marginBottom: theme.spacing(1),
      },
      '& li': {
        marginBottom: theme.spacing(0.5),
      },
      '& strong': {
        fontWeight: 700,
      },
    },
    inputContainer: {
      padding: theme.spacing(2),
      borderTop: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
      display: 'flex',
      gap: theme.spacing(1),
    },
    inputField: {
      flexGrow: 1,
    },
    sendButton: {
      minWidth: 40,
    },
    loadingDots: {
      display: 'flex',
      gap: theme.spacing(0.5),
      padding: theme.spacing(1),
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.main,
      animation: '$bounce 1.4s infinite ease-in-out both',
    },
    dot1: {
      animationDelay: '-0.32s',
    },
    dot2: {
      animationDelay: '-0.16s',
    },
    '@keyframes bounce': {
      '0%, 80%, 100%': {
        transform: 'scale(0)',
      },
      '40%': {
        transform: 'scale(1)',
      },
    },
  });
