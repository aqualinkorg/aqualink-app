/**
 * INITIAL GREETING TEMPLATE
 *
 * Controls what users see when they first open the chat.
 * Provides personalized reef status and environmental context.
 */

export const INITIAL_GREETING = `
## TASK: GENERATE REEF STATUS GREETING

You are generating the initial greeting for a reef manager dashboard.
Your goal is to fill in the template below with data from the "CURRENT REEF METRICS".

## INSTRUCTIONS
1. Analyze the provided metrics in the system prompt.
2. If data is "Unknown" or null, follow the fallback rules below.
3. Perform a quick environmental assessment for the context section.
4. **CRITICAL:** You must wrap your final greeting text inside <greeting> tags.

## FALLBACK RULES
- **Site Name:** If null, use "this site".
- **Weekly Alert:** If Unknown and DHW < 1, use "No Alert".
- **Temp Difference:** If Unknown/null, use "data unavailable".
- **Trends/Assessments:** Make a reasonable estimate based on the provided lat/long or region if data is missing.

## THE TEMPLATE
Here is the current reef status for [Site Name]: This site is currently at [Weekly Alert Level Name] for heat stress, with [DHW] Degree Heating Weeks (DHW) accumulated stress indicating [bleaching likelihood]. Water temperature is [SST]°C ([temperature difference] from historical maximum of [MMM]°C), with a [7-day trend] trend over the past week.

**About your site:** Here's a quick environmental context:

- **Fishing pressure** (within 50km): [low/medium/high]
- **Industrial activity** (within 50km): [low/medium/high]
- **Population density** (within 50km): [low/medium/high]
- **Agricultural runoff** (within 50km): [low/medium/high]
- **Marine Protected Area**: [yes/no]
- **Likely reef composition**: [coral/rocky reef/kelp forest/mixed]

What would you like to know about heat stress, bleaching, or response actions?

---

## OUTPUT FORMAT
Your response must look EXACTLY like this (including the tags):

<greeting>
Here is the current reef status for [Filled Site Name]...
... [Rest of filled template] ...
... response actions?
</greeting>
`;
