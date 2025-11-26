import axios from 'axios';
import { buildPromptWithContext } from './prompts';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-4-fast-reasoning'; // Fast and cost-effective

interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GrokResponse {
  choices: Array<{
    message: { role: string; content: string };
    /* eslint-disable-next-line camelcase */
    finish_reason: string;
  }>;
  usage: {
    /* eslint-disable-next-line camelcase */
    prompt_tokens: number;
    /* eslint-disable-next-line camelcase */
    completion_tokens: number;
    /* eslint-disable-next-line camelcase */
    total_tokens: number;
  };
}

/**
 * Call the Grok API with a prompt
 */
export async function callGrokAPI(
  userMessage: string,
  siteContext: string,
  conversationHistory?: Array<{ sender: string; text: string }>,
  isFirstMessage?: boolean,
): Promise<string> {
  const apiKey = process.env.GROK_API_KEY;

  if (!apiKey) {
    throw new Error('GROK_API_KEY is not configured in environment variables');
  }

  // Build the complete prompt with context
  const systemPrompt = buildPromptWithContext(
    userMessage,
    siteContext,
    conversationHistory,
    isFirstMessage,
  );

  // Format for Grok API (no mutations)
  const systemMessage: GrokMessage = {
    role: 'system',
    content: `${systemPrompt}\n\n**OUTPUT FORMAT REQUIREMENT**: Provide only your final response to the user. Do not include reasoning steps, internal thoughts, or assessment processes. Output should be clean, polished, and ready for the user to read.`,
  };

  const userMessageObj: GrokMessage | null =
    userMessage && userMessage.trim() && !isFirstMessage
      ? {
          role: 'user',
          content: userMessage,
        }
      : null;

  const messages: GrokMessage[] = [
    systemMessage,
    ...(userMessageObj ? [userMessageObj] : []),
  ];

  try {
    const response = await axios.post<GrokResponse>(
      GROK_API_URL,
      {
        model: GROK_MODEL,
        messages,
        temperature: 0.3, // Lower temperature for more deterministic, focused output
        max_tokens: 1500, // Limit response length
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      },
    );

    if (
      !response.data.choices ||
      response.data.choices.length === 0 ||
      !response.data.choices[0].message
    ) {
      throw new Error('Invalid response from Grok API');
    }

    const rawMessage = response.data.choices[0].message.content;

    // Strip reasoning if present (functional approach - no mutations)
    const reasoningMarkers = [
      'First, the system prompt',
      'First, ',
      'I must output ONLY',
      'Now, fill in',
      'Quick mental',
      'Instructions say',
      'Looking at',
      'The prompt says',
      'I need to',
      'The greeting template',
    ];

    const cleanedMessage = reasoningMarkers.reduce((message, marker) => {
      if (message.includes(marker)) {
        const contentStart = message.indexOf('Here is');
        return contentStart !== -1 ? message.substring(contentStart) : message;
      }
      return message;
    }, rawMessage);

    return cleanedMessage.trim();
  } catch (error) {
    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // API returned an error response
        console.error('Grok API error:', error.response.data);
        throw new Error(
          `Grok API error: ${
            error.response.data.error?.message || 'Unknown error'
          }`,
        );
      } else if (error.request) {
        // Request made but no response received
        console.error('No response from Grok API');
        throw new Error('Failed to connect to Grok API');
      }
    }

    // Generic error
    console.error('Unexpected error calling Grok:', error);
    const underlying = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get AI response: ${underlying}`);
  }
}

/**
 * Health check for Grok API
 */
export async function checkGrokAPIHealth(): Promise<boolean> {
  const apiKey = process.env.GROK_API_KEY;

  if (!apiKey) {
    return false;
  }

  try {
    // Try a simple API call
    const response = await axios.post(
      GROK_API_URL,
      {
        model: GROK_MODEL,
        messages: [
          {
            role: 'user',
            content: 'test',
          },
        ],
        max_tokens: 5,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      },
    );

    return response.status === 200;
  } catch (error) {
    return false;
  }
}
