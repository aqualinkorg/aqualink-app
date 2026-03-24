import axios from 'axios';
import { buildPromptWithContext } from './prompts';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-4-fast-reasoning'; // Fast and cost-effective

interface GrokMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  /* eslint-disable-next-line camelcase */
  tool_calls?: GrokToolCall[];
  /* eslint-disable-next-line camelcase */
  tool_call_id?: string;
  name?: string;
}

interface GrokToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

interface GrokResponse {
  choices: Array<{
    message: {
      role: string;
      content: string | null;
      /* eslint-disable-next-line camelcase */
      tool_calls?: GrokToolCall[];
    };
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

const QUERY_TIME_SERIES_TOOL = {
  type: 'function',
  function: {
    name: 'query_time_series',
    description: `Query aggregated historical sensor data for this site.

WHEN TO CALL THIS TOOL:
- User asks about trends, averages, or patterns over any time period
- User asks about "last week", "last month", "past X days", or any specific date range
- User asks for min/max values over a period
- User asks to compare conditions at two different points in time
- User asks for an analysis or summary that requires more data than the current reading
- The 7-day or 30-day summaries already in your context do not cover the date range or metric the user is asking about

WHEN NOT TO CALL THIS TOOL:
- User asks about current conditions (already in your context)
- User asks a question fully answered by the 7-day or 30-day summaries in your context
- User asks about surveys, Reef Check data, or forecast data (different data sources)
- User asks a general question that does not require sensor data

METRIC REFERENCE — use these exact string values in the metrics array:
Temperature:
  top_temperature          — water temperature at 1m depth (Spotter surface sensor)
  bottom_temperature       — water temperature at seafloor depth (Spotter bottom sensor)
  satellite_temperature    — sea surface temperature from NOAA Coral Reef Watch satellite
  surface_temperature      — sea surface temperature (model/alternative source)
  air_temperature          — air temperature at buoy
  internal_temperature     — SeapHOx internal housing temperature

Heat stress:
  dhw                      — degree heating weeks (accumulated heat stress over 12 weeks)
  sst_anomaly              — sea surface temperature anomaly from historical baseline
  temp_alert               — daily bleaching alert level (0–4)
  temp_weekly_alert        — weekly bleaching alert level (0–4), matches dashboard display

Wind & waves:
  wind_speed               — wind speed in m/s
  wind_direction           — wind direction in degrees
  wind_gust_speed          — wind gust speed in m/s
  significant_wave_height  — wave height in meters
  wave_mean_period         — mean wave period in seconds
  wave_peak_period         — peak wave period in seconds
  wave_mean_direction      — mean wave direction in degrees
  precipitation            — precipitation

Pressure:
  barometric_pressure_top         — atmospheric pressure at top of buoy (hPa)
  barometric_pressure_bottom      — atmospheric pressure at bottom of buoy (hPa)
  barometric_pressure_top_diff    — pressure differential

Water quality — Sonde sensor:
  ph                       — seawater pH
  ph_mv                    — pH in millivolts
  ph_temperature           — temperature used for pH calibration
  salinity                 — water salinity (PSU/ppt)
  conductivity             — electrical conductivity (µS/cm)
  specific_conductance     — specific conductance (µS/cm)
  tds                      — total dissolved solids (mg/L)
  turbidity                — water clarity / turbidity (NTU); higher = cloudier
  total_suspended_solids   — total suspended solids (mg/L)
  odo_saturation           — optical dissolved oxygen saturation (%)
  odo_concentration        — optical dissolved oxygen concentration (mg/L)
  cholorophyll_rfu         — chlorophyll in relative fluorescence units (RFU)
  cholorophyll_concentration — chlorophyll concentration (µg/L)
  water_depth              — water depth from pressure sensor (m)
  rh                       — relative humidity (%)
  pressure                 — water pressure (dbar)

Water quality — HUI (Hui O Ka Wai Ola, Maui-specific):
  nitrogen_total           — total nitrogen concentration (µg/L)
  phosphorus_total         — total phosphorus concentration (µg/L)
  phosphorus               — phosphate / orthophosphate (µg/L)
  silicate                 — silicate concentration (µg/L)
  nitrate_plus_nitrite     — nitrate + nitrite nitrogen, also called NNN (µg/L)
  ammonium                 — ammonium concentration (µg/L)

Water quality — SeapHOx sensor:
  dissolved_oxygen         — dissolved oxygen (SeapHOx, µmol/kg)
  internal_ph              — SeapHOx internal pH measurement
  external_ph_volt         — SeapHOx external pH electrode voltage
  internal_ph_volt         — SeapHOx internal pH electrode voltage
  relative_humidity        — relative humidity inside SeapHOx housing`,
    parameters: {
      type: 'object',
      properties: {
        metrics: {
          type: 'array',
          items: { type: 'string' },
          description:
            'One or more metric string values from the METRIC REFERENCE above.',
        },
        startDate: {
          type: 'string',
          description:
            'Start of the query window in ISO 8601 format, e.g. 2026-02-01T00:00:00Z',
        },
        endDate: {
          type: 'string',
          description:
            'End of the query window in ISO 8601 format. Defaults to now if omitted.',
        },
        aggregation: {
          type: 'string',
          enum: ['hourly', 'daily', 'weekly'],
          description: `Temporal resolution of results.
- hourly: use for windows up to 7 days
- daily:  use for windows from 7 to 90 days
- weekly: use for windows longer than 90 days`,
        },
      },
      required: ['metrics', 'startDate', 'aggregation'],
    },
  },
};

export type ToolExecutor = (
  toolName: string,
  args: Record<string, unknown>,
) => Promise<string>;

// 1. Tag-based extraction (Primary Strategy)
// Matches content between <greeting> and </greeting>, handling newlines/formatting
function extractFinalResponse(rawMessage: string): string {
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
}

async function callGrokRaw(
  apiKey: string,
  messages: GrokMessage[],
  includeTools: boolean,
): Promise<GrokResponse> {
  try {
    const toolParams = includeTools
      ? { tools: [QUERY_TIME_SERIES_TOOL], tool_choice: 'auto' }
      : {};

    const response = await axios.post<GrokResponse>(
      GROK_API_URL,
      {
        model: GROK_MODEL,
        messages,
        // Lower temperature for more deterministic, focused output (0.1 is best for strict templates)
        temperature: 0.1,
        max_tokens: 2500, // Accommodate reasoning + output
        stream: false,
        ...toolParams,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // Extended for tool-calling round trips
      },
    );

    if (
      !response.data.choices ||
      response.data.choices.length === 0 ||
      !response.data.choices[0].message
    ) {
      throw new Error('Invalid response from Grok API');
    }

    return response.data;
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

const executeToolCall = async (
  toolCall: GrokToolCall,
  toolExecutor: ToolExecutor,
): Promise<GrokMessage> => {
  try {
    const args = JSON.parse(toolCall.function.arguments) as Record<
      string,
      unknown
    >;
    const content = await toolExecutor(toolCall.function.name, args);
    return {
      role: 'tool',
      tool_call_id: toolCall.id,
      name: toolCall.function.name,
      content,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      role: 'tool',
      tool_call_id: toolCall.id,
      name: toolCall.function.name,
      content: JSON.stringify({ error: `Tool execution failed: ${msg}` }),
    };
  }
};

// Recursive tool-calling loop — avoids await-in-loop and for loop restrictions.
// Grok may request a tool call before producing its final text response.
// We recurse up to MAX_TOOL_ITERATIONS times before giving up.
const MAX_TOOL_ITERATIONS = 3;

const runToolLoop = async (
  apiKey: string,
  messages: GrokMessage[],
  toolExecutor: ToolExecutor | undefined,
  iterationsLeft: number,
): Promise<string> => {
  if (iterationsLeft === 0) {
    const lastContent = messages[messages.length - 1].content;
    return typeof lastContent === 'string'
      ? extractFinalResponse(lastContent)
      : 'Unable to generate a response. Please try again.';
  }

  const response = await callGrokRaw(apiKey, messages, !!toolExecutor);
  const choice = response.choices[0];

  if (
    choice.finish_reason === 'tool_calls' &&
    choice.message.tool_calls &&
    choice.message.tool_calls.length > 0 &&
    toolExecutor
  ) {
    const assistantMessage: GrokMessage = {
      role: 'assistant',
      content: choice.message.content ?? null,
      tool_calls: choice.message.tool_calls,
    };

    const toolResultMessages = await Promise.all(
      choice.message.tool_calls.map((toolCall) =>
        executeToolCall(toolCall, toolExecutor),
      ),
    );

    return runToolLoop(
      apiKey,
      [...messages, assistantMessage, ...toolResultMessages],
      toolExecutor,
      iterationsLeft - 1,
    );
  }

  return extractFinalResponse(choice.message.content ?? '');
};

/**
 * Call the Grok API with optional tool-calling support.
 *
 * @param toolExecutor  Async function that runs a tool and returns a JSON
 *                      string result. Provided by the NestJS service layer
 *                      so this file stays free of DB dependencies.
 */
export async function callGrokAPI(
  userMessage: string,
  siteContext: string,
  conversationHistory?: Array<{ sender: string; text: string }>,
  isFirstMessage?: boolean,
  toolExecutor?: ToolExecutor,
): Promise<string> {
  const apiKey = process.env.GROK_API_KEY;

  if (!apiKey) {
    throw new Error('GROK_API_KEY is not configured in environment variables');
  }

  // Build the complete prompt with context
  const systemPrompt = await buildPromptWithContext(
    userMessage,
    siteContext,
    conversationHistory,
    isFirstMessage,
  );

  // Format for Grok API
  const userMessageObj: GrokMessage | null =
    userMessage && userMessage.trim() && !isFirstMessage
      ? {
          role: 'user',
          content: userMessage,
        }
      : null;

  const messages: GrokMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(userMessageObj ? [userMessageObj] : []),
  ];

  return runToolLoop(apiKey, messages, toolExecutor, MAX_TOOL_ITERATIONS);
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
    console.error('Grok API health check failed:', error);
    return false;
  }
}
