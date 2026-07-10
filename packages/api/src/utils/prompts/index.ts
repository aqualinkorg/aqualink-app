/**
 * PROMPT SYSTEM BUILDER
 *
 * Combines all prompt modules into the complete system prompt.
 * Handles prompt assembly and context injection.
 */

export interface PromptMap {
  system: string;
  guardrails: string;
  'survey-guide': string;
  'bleaching-response': string;
  faq: string;
  'data-guide': string;
  greeting: string;
  'readme-knowledge': string;
}

/**
 * Build a complete prompt with site context and conversation history
 */
export function buildPromptWithContext(
  userMessage: string,
  siteContext: string,
  prompts: PromptMap,
  conversationHistory?: Array<{ sender: string; text: string }>,
  isFirstMessage?: boolean,
): string {
  const completeSystemPrompt = `
${prompts.system}

${prompts.guardrails}

${prompts['data-guide']}

${prompts['survey-guide']}

${prompts['bleaching-response']}

${prompts.faq}

${prompts['readme-knowledge']}

## CURRENT SITE CONTEXT:
(This section will be populated with real-time data for each query)
`;

  const isOpeningMessage =
    isFirstMessage || !conversationHistory || conversationHistory.length === 0;

  const historySection =
    conversationHistory && conversationHistory.length > 0
      ? `\n\n## CONVERSATION HISTORY:\n${conversationHistory
          .map((msg) => {
            const role = msg.sender === 'user' ? 'User' : 'Assistant';
            return `${role}: ${msg.text}`;
          })
          .join('\n')}`
      : '';

  const openingSection = isOpeningMessage
    ? `\n\n${prompts.greeting}\n\n## CRITICAL: THIS IS THE INITIAL GREETING
You are responding to the opening of a new conversation. You MUST generate the contextual greeting exactly as specified in the initial greeting template above.

DO NOT respond to the user message as a question. Instead, provide the greeting with the AI-generated site summary.

Generate the greeting now with real assessments for:
- Fishing: [assess and answer: low/medium/high]
- Industrial: [assess and answer: low/medium/high]
- Population: [assess and answer: low/medium/high]
- Agriculture: [assess and answer: low/medium/high]
- Marine Protected Area: [assess and answer: yes/no]
- Reef composition: [assess and answer: 1-2 words]

Use the site context provided above and web search if needed (max 2 searches) to make these assessments.`
    : '';

  const userMessageSection =
    userMessage && userMessage.trim()
      ? `\n\n## CURRENT USER QUESTION:\n${userMessage}\n\nPlease provide a helpful, accurate response using the site data and context above.`
      : '';

  return `${completeSystemPrompt}\n\n${siteContext}${historySection}${openingSection}${userMessageSection}`;
}
