import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { userInfoSelector } from 'store/User/userSlice';
import { colors } from 'layout/App/theme';
import promptServices, {
  AIPrompt,
  AIPromptHistory,
} from 'services/promptServices';

interface SearchResult {
  promptKey: string;
  matches: Array<{
    lineNumber: number;
    line: string;
    context: string;
  }>;
}

type ViewMode = 'single' | 'all' | 'search';

// MOCK DATA for testing without backend
const MOCK_PROMPTS: AIPrompt[] = [
  {
    id: 1,
    promptKey: 'system',
    content:
      "# AQUALINK AI ASSISTANT\n\nYou are Aqualink's AI assistant...\n\n(Full system prompt would be here)",
    description: 'Core system prompt defining AI identity and behavior',
    category: 'core',
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: 'pete@aqualink.org',
    isActive: true,
  },
  {
    id: 2,
    promptKey: 'guardrails',
    content:
      '## AI ASSISTANT SCOPE & LIMITATIONS\n\n### WHAT THIS AI CAN HELP WITH:\n...',
    description: 'Scope boundaries and what AI can/cannot answer',
    category: 'core',
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: 'pete@aqualink.org',
    isActive: true,
  },
  {
    id: 3,
    promptKey: 'greeting',
    content: '## TASK: GENERATE REEF STATUS GREETING\n\n...',
    description: 'Initial conversation greeting template',
    category: 'greeting',
    version: 1,
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 4,
    promptKey: 'data-guide',
    content: '## DATA SOURCES AND HIERARCHY\n\n...',
    description: 'Technical data sources and API documentation',
    category: 'knowledge',
    version: 1,
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 5,
    promptKey: 'survey-guide',
    content: '## SURVEY PROTOCOLS\n\n### Camera Settings\n...',
    description: 'How to conduct Aqualink surveys',
    category: 'knowledge',
    version: 1,
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 6,
    promptKey: 'bleaching-response',
    content: '## EMERGENCY BLEACHING PROTOCOLS\n\n...',
    description: 'Emergency bleaching protocols',
    category: 'knowledge',
    version: 1,
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 7,
    promptKey: 'faq',
    content: '## FAQ KNOWLEDGE\n\nQ: How do I conduct surveys?\n...',
    description: 'FAQ knowledge from aqualink.org/faq',
    category: 'knowledge',
    version: 1,
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 8,
    promptKey: 'readme-knowledge',
    content:
      '## Contributing\n\nAqualink is an MIT-licensed open source project...',
    description: 'Repository documentation',
    category: 'knowledge',
    version: 1,
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
];

const useStyles = makeStyles(() => ({
  root: {
    padding: '2rem',
  },
  header: {
    marginBottom: '1rem',
  },
  viewModeToggle: {
    marginBottom: '1rem',
  },
  searchBar: {
    marginBottom: '2rem',
  },
  controlsWrapper: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  promptCard: {
    marginBottom: '1rem',
  },
  textField: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
  },
  metadataChips: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
  },
  searchResultCard: {
    marginBottom: '1rem',
    '&:hover': {
      backgroundColor: colors.backgroundGray,
    },
  },
  highlight: {
    backgroundColor: '#ffeb3b',
    padding: '0.125rem',
  },
  accordionContent: {
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    maxHeight: '400px',
    overflow: 'auto',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    whiteSpace: 'pre-wrap',
  },
  loadingWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
}));

function PromptsEditor() {
  const classes = useStyles();
  const user = useSelector(userInfoSelector);
  const token = user?.token || null;

  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [changeNotes, setChangeNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<AIPromptHistory[]>([]);
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [rollbackVersion, setRollbackVersion] = useState<number | null>(null);

  // Search functionality
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const selectPrompt = useCallback((prompt: AIPrompt) => {
    setSelectedPrompt(prompt);
    setEditedContent(prompt.content);
    setChangeNotes('');
    setSuccess(null);
    setError(null);
    setViewMode('single');
  }, []);

  const loadPrompts = useCallback(async () => {
    // If no token, use mock data
    if (!token) {
      setPrompts(MOCK_PROMPTS);
      if (MOCK_PROMPTS.length > 0) {
        selectPrompt(MOCK_PROMPTS[0]);
      }
      return;
    }

    try {
      setLoading(true);
      const { data } = await promptServices.getAllPrompts(token);
      setPrompts(data);
      if (data.length > 0 && !selectedPrompt) {
        selectPrompt(data[0]);
      }
    } catch (err) {
      // If API fails, fall back to mock data
      console.warn('Failed to load prompts from API, using mock data:', err);
      setPrompts(MOCK_PROMPTS);
      if (MOCK_PROMPTS.length > 0) {
        selectPrompt(MOCK_PROMPTS[0]);
      }
    } finally {
      setLoading(false);
    }
  }, [token, selectedPrompt, selectPrompt]);

  // Load prompts on mount
  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const handleSave = async () => {
    if (!selectedPrompt || !token) {
      setError('Authentication required to save changes');
      return;
    }

    try {
      setLoading(true);
      setSuccess(null);
      setError(null);

      await promptServices.updatePrompt(
        selectedPrompt.promptKey,
        {
          content: editedContent,
          changeNotes,
        },
        token,
      );

      setSuccess(
        'Prompt updated successfully! Changes will take effect within 5 minutes.',
      );
      await loadPrompts();
      setChangeNotes('');
    } catch (err) {
      setError('Failed to update prompt');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async () => {
    if (!selectedPrompt || !token) {
      setError('Authentication required to view history');
      return;
    }

    try {
      setLoading(true);
      const { data } = await promptServices.getPromptHistory(
        selectedPrompt.promptKey,
        token,
      );
      setHistory(data);
      setHistoryOpen(true);
    } catch (err) {
      setError('Failed to load history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRollbackClick = (version: number) => {
    setRollbackVersion(version);
    setRollbackDialogOpen(true);
  };

  const handleRollbackConfirm = async () => {
    if (!selectedPrompt || !token || rollbackVersion === null) return;

    try {
      setLoading(true);
      await promptServices.rollbackToVersion(
        selectedPrompt.promptKey,
        { version: rollbackVersion },
        token,
      );
      setSuccess(`Rolled back to version ${rollbackVersion}`);
      setHistoryOpen(false);
      setRollbackDialogOpen(false);
      setRollbackVersion(null);
      await loadPrompts();
    } catch (err) {
      setError('Failed to rollback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDatabase = async () => {
    if (!token) {
      setError('Authentication required to update database');
      return;
    }

    try {
      setLoading(true);
      await promptServices.refreshCache(token);
      setSuccess('Database updated! Changes are now live.');
    } catch (err) {
      setError('Failed to update database');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();

    const newResults = prompts
      .map((prompt) => {
        const lines = prompt.content.split('\n');

        const newMatches = lines
          .map((line, index) => {
            if (line.toLowerCase().includes(query)) {
              const contextStart = Math.max(0, index - 1);
              const contextEnd = Math.min(lines.length - 1, index + 1);
              const context = lines
                .slice(contextStart, contextEnd + 1)
                .join('\n');

              return {
                lineNumber: index + 1,
                line: line.trim(),
                context,
              };
            }
            return null;
          })
          .filter(
            (match): match is NonNullable<typeof match> => match !== null,
          );

        if (newMatches.length > 0) {
          return {
            promptKey: prompt.promptKey,
            matches: newMatches,
          };
        }
        return null;
      })
      .filter(
        (result): result is NonNullable<typeof result> => result !== null,
      );

    setSearchResults(newResults);
    setViewMode('search');
  };

  const highlightSearchTerm = (text: string) => {
    if (!searchQuery.trim()) return text;

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));

    return (
      <>
        {parts.map((part, index) => {
          const key = `${part.substring(0, 10)}-${index}-${part.length}`;
          return part.toLowerCase() === searchQuery.toLowerCase() ? (
            <span key={key} className={classes.highlight}>
              {part}
            </span>
          ) : (
            <React.Fragment key={key}>{part}</React.Fragment>
          );
        })}
      </>
    );
  };

  const hasChanges = selectedPrompt && editedContent !== selectedPrompt.content;

  if (loading && prompts.length === 0) {
    return (
      <div className={classes.loadingWrapper}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h4" gutterBottom>
          AI Prompt Editor
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Edit AI Assistant prompts. Search across all prompts or edit
          individually.
        </Typography>
      </div>

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          style={{ marginBottom: '1rem' }}
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          style={{ marginBottom: '1rem' }}
        >
          {error}
        </Alert>
      )}

      {/* View Mode Toggle */}
      <div className={classes.viewModeToggle}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="single">SINGLE PROMPT</ToggleButton>
          <ToggleButton value="all">VIEW ALL</ToggleButton>
          <ToggleButton value="search">SEARCH</ToggleButton>
        </ToggleButtonGroup>
      </div>

      {/* Search Bar */}
      {(viewMode === 'search' || viewMode === 'all') && (
        <div className={classes.searchBar}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search across all prompts..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    onClick={handleSearch}
                    variant="contained"
                    size="small"
                  >
                    Search
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </div>
      )}

      {/* SINGLE PROMPT MODE */}
      {viewMode === 'single' && (
        <>
          <div className={classes.controlsWrapper}>
            <FormControl style={{ minWidth: 300 }}>
              <InputLabel>Select Prompt</InputLabel>
              <Select
                value={selectedPrompt?.promptKey || ''}
                onChange={(e) => {
                  const prompt = prompts.find(
                    (p) => p.promptKey === e.target.value,
                  );
                  if (prompt) selectPrompt(prompt);
                }}
                label="Select Prompt"
              >
                {prompts.map((prompt) => (
                  <MenuItem key={prompt.id} value={prompt.promptKey}>
                    {prompt.promptKey}
                    {prompt.category && (
                      <Chip
                        label={prompt.category}
                        size="small"
                        style={{ marginLeft: '0.5rem' }}
                      />
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={handleViewHistory}
              disabled={!selectedPrompt || loading || !token}
            >
              VIEW HISTORY
            </Button>

            <Button
              variant="outlined"
              onClick={handleUpdateDatabase}
              disabled={loading || !token}
              style={{
                color: '#00ACC1',
                borderColor: '#00ACC1',
              }}
            >
              UPDATE DATABASE
            </Button>
          </div>

          {selectedPrompt && (
            <Card className={classes.promptCard}>
              <CardContent>
                <Typography variant="h6">{selectedPrompt.promptKey}</Typography>
                {selectedPrompt.description && (
                  <Typography variant="body2" color="textSecondary">
                    {selectedPrompt.description}
                  </Typography>
                )}
                <div className={classes.metadataChips}>
                  <Chip
                    label={`Version ${selectedPrompt.version}`}
                    size="small"
                  />
                  {selectedPrompt.updatedBy && (
                    <Chip
                      label={`Updated by ${selectedPrompt.updatedBy}`}
                      size="small"
                    />
                  )}
                  <Chip
                    label={new Date(selectedPrompt.updatedAt).toLocaleString()}
                    size="small"
                  />
                </div>

                <TextField
                  fullWidth
                  multiline
                  rows={20}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  label="Prompt Content"
                  variant="outlined"
                  InputProps={{
                    className: classes.textField,
                  }}
                  style={{ marginBottom: '1rem' }}
                />

                <TextField
                  fullWidth
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  label="Change Notes (optional)"
                  placeholder="Describe what you changed and why"
                  variant="outlined"
                  style={{ marginBottom: '1rem' }}
                />

                <div className={classes.buttonGroup}>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={!hasChanges || loading || !token}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => selectPrompt(selectedPrompt)}
                    disabled={!hasChanges || loading}
                  >
                    Discard Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* SEARCH RESULTS MODE */}
      {viewMode === 'search' && searchResults.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Found &quot;{searchQuery}&quot; in {searchResults.length} prompt
            {searchResults.length !== 1 ? 's' : ''}
          </Typography>

          {searchResults.map((result) => {
            const prompt = prompts.find(
              (p) => p.promptKey === result.promptKey,
            );
            return (
              <Card key={result.promptKey} className={classes.searchResultCard}>
                <CardContent>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <Typography variant="h6">
                      {result.promptKey}{' '}
                      <Chip
                        label={`${result.matches.length} match${
                          result.matches.length !== 1 ? 'es' : ''
                        }`}
                        size="small"
                      />
                    </Typography>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => prompt && selectPrompt(prompt)}
                    >
                      Edit This Prompt
                    </Button>
                  </Box>

                  <List>
                    {result.matches.slice(0, 5).map((match) => (
                      <ListItem
                        key={`${result.promptKey}-${match.lineNumber}`}
                        divider
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              Line {match.lineNumber}:{' '}
                              {highlightSearchTerm(match.line)}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              component="pre"
                              style={{
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'monospace',
                              }}
                            >
                              {match.context}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                    {result.matches.length > 5 && (
                      <ListItem>
                        <Typography variant="body2" color="textSecondary">
                          ... and {result.matches.length - 5} more matches
                        </Typography>
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {viewMode === 'search' && searchResults.length === 0 && searchQuery && (
        <Alert severity="info">
          No results found for &quot;{searchQuery}&quot;. Try a different search
          term.
        </Alert>
      )}

      {/* VIEW ALL MODE */}
      {viewMode === 'all' && (
        <Box>
          <Typography variant="h6" gutterBottom>
            All Prompts (Read-Only View)
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {searchQuery
              ? `Showing all prompts with "${searchQuery}" highlighted`
              : 'Expand sections to view content. Click Edit to modify.'}
          </Typography>

          {prompts.map((prompt) => (
            <Accordion key={prompt.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginRight: '1rem',
                  }}
                >
                  <Typography variant="h6">{prompt.promptKey}</Typography>
                  <Chip label={prompt.category} size="small" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    {prompt.description}
                  </Typography>
                  <Box className={classes.accordionContent}>
                    {searchQuery
                      ? highlightSearchTerm(prompt.content)
                      : prompt.content}
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => selectPrompt(prompt)}
                    style={{ marginTop: '1rem' }}
                  >
                    Edit This Prompt
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Rollback Confirmation Dialog */}
      <Dialog
        open={rollbackDialogOpen}
        onClose={() => setRollbackDialogOpen(false)}
      >
        <DialogTitle>Confirm Rollback</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to rollback to version {rollbackVersion}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRollbackDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRollbackConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Version History: {selectedPrompt?.promptKey}</DialogTitle>
        <DialogContent>
          <List>
            {history.map((entry) => (
              <ListItem
                key={entry.id}
                divider
                secondaryAction={
                  <Button
                    size="small"
                    onClick={() => handleRollbackClick(entry.version)}
                  >
                    Rollback
                  </Button>
                }
              >
                <ListItemText
                  primary={`Version ${entry.version}`}
                  secondary={
                    <>
                      <Typography variant="body2">
                        {new Date(entry.changedAt).toLocaleString()}
                        {entry.changedBy && ` • ${entry.changedBy}`}
                      </Typography>
                      {entry.changeNotes && (
                        <Typography variant="body2" color="textSecondary">
                          {entry.changeNotes}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PromptsEditor;
