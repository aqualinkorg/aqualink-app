# Aqualink AI Assistant Prompts

This folder contains the modular prompt system for Aqualink's AI assistant.

## Structure

```
prompts/
├── index.ts                 # Combines all prompts, exports buildPromptWithContext()
├── system.ts                # Core identity, personality, and behaviors
├── guardrails.ts            # Scope boundaries: what AI can/cannot answer
├── greeting.ts              # Initial conversation greeting template
├── data-guide.ts            # Technical data sources and API documentation
├── survey-guide.ts          # How to conduct Aqualink surveys
├── bleaching-response.ts    # Emergency bleaching protocols
├── faq.ts                   # FAQ knowledge from aqualink.org/faq
└── README.md                # This file
```

## Philosophy

### Why Modular?

1. **Maintainability**: Update individual sections without breaking the whole system
2. **Clarity**: Each file has a single, clear purpose
3. **Collaboration**: Different team members can own different sections
4. **Testing**: Easy to test changes to specific areas
5. **Versioning**: Track changes to specific prompt components

### Design Principles

- **Actionable over comprehensive**: Focus on what users should DO
- **Data-driven**: Reference actual metrics and observations
- **Empowering**: Give users confidence to act
- **Honest**: Acknowledge limitations and uncertainty
- **Concise**: Default to brevity, elaborate when requested

## File Descriptions

### `system.ts`

**Owner**: Core team  
**Update frequency**: Rarely (only for fundamental changes)

Defines the AI's identity and core behaviors:

- Who the AI is and its purpose
- Core capabilities and expertise
- Data source priority (Spotter > Satellite)
- Response principles and structure
- Tone and user experience guidelines

### `guardrails.ts`

**Owner**: Product/Safety team  
**Update frequency**: As needed when scope changes

Strict boundaries on what the AI can and cannot answer:

- In-scope topics (Aqualink, reef health, bleaching response)
- Out-of-scope topics (general tech support, unrelated subjects)
- Edge cases and how to handle them
- Safety principles
- Response templates for redirecting

**Testing**: Regularly test with boundary questions to ensure guardrails hold.

### `greeting.ts`

**Owner**: UX team  
**Update frequency**: When greeting template needs adjustment

Template for first message in conversations:

- Welcome structure
- Contextual site summary generation
- Assessment guidelines (fishing, population, MPA, etc.)
- Research efficiency guidelines

### `data-guide.ts`

**Owner**: Data/Engineering team  
**Update frequency**: When API changes or new data sources added

Technical documentation:

- API endpoints and structure
- Data source hierarchy (Spotter vs Satellite)
- Accuracy considerations
- Temperature stratification
- Troubleshooting common data issues

**Maintenance**: Update when API endpoints change or new features launch.

### `survey-guide.ts`

**Owner**: Science/Community team  
**Update frequency**: When survey methods updated

Instructions for conducting surveys:

- Survey types (rapid, photo point, Reef Check)
- Bleaching assessment methods
- Frequency guidelines by alert level
- Upload instructions
- Best practices and tips

**Maintenance**: Update based on user feedback and evolving best practices.

### `bleaching-response.ts`

**Owner**: Science team  
**Update frequency**: Based on latest marine science

Emergency protocols:

- 5 phases: Preparation → Early Warning → Active Bleaching → Severe → Recovery
- DHW-based action triggers
- Monitoring protocols
- Mitigation strategies
- Documentation requirements

**Maintenance**: Update based on latest coral bleaching research and response best practices.

### `faq.ts`

**Owner**: Support/Documentation team  
**Update frequency**: When website FAQ changes

Embedded FAQ knowledge:

- Common questions and answers
- Technical troubleshooting
- Account and access info
- Partnership information

**IMPORTANT**: Keep in sync with aqualink.org/faq. Set up process to update this when website FAQ changes.

## Usage

### In Your API Service

```typescript
import { buildPromptWithContext } from './prompts';

// Build complete prompt with context
const systemPrompt = buildPromptWithContext(
  userMessage,
  siteContext,
  conversationHistory,
  isFirstMessage,
);

// Send to AI API
const response = await callAI(systemPrompt);
```

### For Development

```typescript
// Import individual modules for testing
import { GUARDRAILS, SURVEY_GUIDE } from './prompts';

// Test specific sections
console.log(GUARDRAILS);
```

## Maintenance Checklist

### Regular Updates (Monthly)

- [ ] Review FAQ.ts against website FAQ
- [ ] Check for new data sources or API changes
- [ ] Test guardrails with edge cases
- [ ] Review user feedback for prompt improvements

### After Major Changes

- [ ] API endpoints change → Update data-guide.ts
- [ ] New survey methods → Update survey-guide.ts
- [ ] Bleaching science updates → Update bleaching-response.ts
- [ ] Website FAQ changes → Update faq.ts
- [ ] Scope changes → Update guardrails.ts

### Testing New Prompts

1. Test with real user conversations
2. Try boundary-pushing questions
3. Verify data source priority is respected
4. Check response length and tone
5. Ensure greeting works for different site types

## Best Practices

### Writing Prompts

- Use clear, direct language
- Provide examples where helpful
- Structure with headers and bullets
- Explain the "why" behind guidelines
- Include edge cases

### Updating Prompts

- Test changes thoroughly before deploying
- Document what changed and why (git commit messages)
- Consider backward compatibility
- Update related sections if needed

### Version Control

- Commit prompt changes separately from code
- Use descriptive commit messages
- Tag major prompt updates
- Keep changelog of significant changes

## Common Issues

### "AI responses are too long"

→ Adjust response length guidelines in `system.ts`

### "AI going off-topic"

→ Strengthen guardrails in `guardrails.ts`

### "AI not prioritizing Spotter data"

→ Emphasize in `system.ts` and `data-guide.ts`

### "Initial greeting not working"

→ Check logic in `greeting.ts` and `index.ts`

### "FAQ knowledge outdated"

→ Update `faq.ts` from website

## Future Enhancements

Potential additions:

- [ ] `restoration-guide.ts` - Coral restoration protocols
- [ ] `species-guide.ts` - Coral species identification
- [ ] `crisis-comms.ts` - Communication templates for stakeholders
- [ ] `research-integration.ts` - How to contribute to research studies
- [ ] Language-specific versions for international users

## Resources

- Aqualink Website: https://www.aqualink.org
- Aqualink FAQ: https://www.aqualink.org/faq
- NOAA Coral Reef Watch: https://coralreefwatch.noaa.gov/
- Support Email: admin@aqualink.org

## Questions?

Contact the AI team or email admin@aqualink.org
