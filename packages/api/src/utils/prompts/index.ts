/**
 * PROMPT SYSTEM BUILDER
 *
 * Combines all prompt modules into the complete system prompt.
 * Handles prompt assembly and context injection.
 *
 * This file orchestrates how all prompts work together.
 * Usually doesn't need editing unless changing the prompt structure.
 */

import { SYSTEM_PROMPT } from './system';
import { GUARDRAILS } from './guardrails';
import { SURVEY_GUIDE } from './survey-guide';
import { BLEACHING_RESPONSE_GUIDE } from './bleaching-response';
import { FAQ_KNOWLEDGE } from './faq';
import { DATA_GUIDE } from './data-guide';
import { INITIAL_GREETING } from './greeting';
import { README_KNOWLEDGE } from './readme-knowledge';

/**
 * Complete system prompt combining all modules
 */
export const COMPLETE_SYSTEM_PROMPT = `
${SYSTEM_PROMPT}

${GUARDRAILS}

${INITIAL_GREETING}

${DATA_GUIDE}

${SURVEY_GUIDE}

${BLEACHING_RESPONSE_GUIDE}

${FAQ_KNOWLEDGE}

${README_KNOWLEDGE}

## CURRENT SITE CONTEXT:
(This section will be populated with real-time data for each query)
`;

/**
 * Build a complete prompt with site context and conversation history
 */
export function buildPromptWithContext(
  userMessage: string,
  siteContext: string,
  conversationHistory?: Array<{ sender: string; text: string }>,
  isFirstMessage?: boolean,
): string {
  let prompt = COMPLETE_SYSTEM_PROMPT;

  // Add site-specific context
  prompt += `\n\n${siteContext}`;

  // Add conversation history if available
  if (conversationHistory && conversationHistory.length > 0) {
    prompt += '\n\n## CONVERSATION HISTORY:\n';
    conversationHistory.forEach((msg) => {
      const role = msg.sender === 'user' ? 'User' : 'Assistant';
      prompt += `${role}: ${msg.text}\n`;
    });
  }

  // Special instructions for first message
  const isOpeningMessage =
    isFirstMessage || !conversationHistory || conversationHistory.length === 0;

  if (isOpeningMessage) {
    prompt += `\n\n## CRITICAL: THIS IS THE INITIAL GREETING
You are responding to the opening of a new conversation. You MUST generate the contextual greeting exactly as specified in the "INITIAL GREETING FOR NEW CONVERSATIONS" section above.

DO NOT respond to the user message as a question. Instead, provide the greeting with the AI-generated site summary.

Generate the greeting now with real assessments for:
- Fishing: [assess and answer: low/medium/high]
- Industrial: [assess and answer: low/medium/high]
- Population: [assess and answer: low/medium/high]
- Agriculture: [assess and answer: low/medium/high]
- Marine Protected Area: [assess and answer: yes/no]
- Reef composition: [assess and answer: 1-2 words]

Use the site context provided above and web search if needed (max 2 searches) to make these assessments.`;
  }

  // Add current user message
  if (userMessage && userMessage.trim()) {
    prompt += `\n\n## CURRENT USER QUESTION:\n${userMessage}\n\nPlease provide a helpful, accurate response using the site data and context above.`;
  }

  return prompt;
}

/**
 * Export individual modules for potential separate use
 */
export {
  SYSTEM_PROMPT,
  GUARDRAILS,
  SURVEY_GUIDE,
  BLEACHING_RESPONSE_GUIDE,
  FAQ_KNOWLEDGE,
  DATA_GUIDE,
  INITIAL_GREETING,
  README_KNOWLEDGE,
};
