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

  // Format for Grok API
  const systemMessage: GrokMessage = {
    role: 'system',
    content: systemPrompt,
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
        // Lower temperature for more deterministic, focused output (0.1 is best for strict templates)
        temperature: 0.1,
        max_tokens: 2500, // Accommodate reasoning + output
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

    // --- PARSING LOGIC ---

    // 1. Tag-based extraction (Primary Strategy)
    // Matches content between <greeting> and </greeting>, handling newlines/formatting
    const tagMatch = rawMessage.match(/<greeting>([\s\S]*?)<\/greeting>/i);

    if (tagMatch && tagMatch[1]) {
      return tagMatch[1].trim();
    }

    // 2. Fallback extraction (Secondary Strategy)
    // If the model forgot tags but included the standard start phrase
    const greetingStartPhrase = 'Here is the current reef status';
    const startIndex = rawMessage.indexOf(greetingStartPhrase);

    if (startIndex !== -1) {
      return rawMessage.substring(startIndex).trim();
    }

    // 3. Last Resort
    // If we can't find tags or the start phrase, return raw message
    // but clean obvious reasoning markers if they exist at the very start.
    return rawMessage
      .replace(/^[\s\S]*?internal_processing[\s\S]*?(\n|$)/, '')
      .trim();
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
