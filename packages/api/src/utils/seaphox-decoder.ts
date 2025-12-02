/**
 * SeapHOx Data Decoder
 * Decodes hex-encoded SeapHOx data from Sofar API
 *
 * Example:
 * "SSPHOX01050,2025-10-20T13:49:08, 11988, 0000, 26.9476,7.9640,7.9808,-0.979159,-1.029476, 26.9785,   24.609,   34.9964,   5.51207,   4.392, 45.0,27.1"
 */

export interface SeapHOxData {
  timestamp: string;
  sampleNumber: number;
  errorFlags: string;
  temperature: number | null;
  externalPh: number | null;
  internalPh: number | null;
  externalPhVolt: number | null;
  internalPhVolt: number | null;
  phTemperature: number | null;
  pressure: number | null;
  salinity: number | null;
  oxygen: number | null;
  conductivity: number | null;
  relativeHumidity: number | null;
  intTemperature: number | null;
}

/**
 * Decodes hex-encoded string to ASCII
 */
function hexToAscii(hexString: string): string {
  return (
    hexString
      .match(/.{1,2}/g)
      ?.map((hexByte) => parseInt(hexByte, 16))
      .filter((byte) => byte !== 0)
      .map((byte) => String.fromCharCode(byte))
      .join('') || ''
  );
}

/**
 * Parses a single SeapHOx CSV line into structured data
 * This follows the exact format from the SeapHOx V2 manual
 */
export function parseSeapHoxData(hexValue: string): SeapHOxData | null {
  try {
    // Decode hex to ASCII
    const asciiData = hexToAscii(hexValue);

    // Split by comma and trim whitespace (SeapHOx data has extra spaces)
    const values = asciiData.split(',').map((v) => v.trim());

    // Validate minimum required values (16 total: frame sync + 15 data fields)
    if (values.length < 16) {
      console.warn(`SeapHOx data has insufficient values: ${values.length}/16`);
      return null;
    }

    // Parse according to SeapHOx V2 specification
    // Index 0: FrameSync (e.g., "SSPHOX01050") - we skip this
    // Index 1: DateTime (ISO format or "MM/DD/YYYY HH:MM:SS")
    // Index 2-15: Data fields

    const timestamp = values[1];
    const sampleNumber = parseInt(values[2], 10);
    const errorFlags = values[3];

    // Parse floating point values - return null if invalid
    const parseValue = (str: string): number | null => {
      const val = parseFloat(str);
      return Number.isNaN(val) ? null : val;
    };

    const temperature = parseValue(values[4]);
    const externalPh = parseValue(values[5]);
    const internalPh = parseValue(values[6]);
    const externalPhVolt = parseValue(values[7]);
    const internalPhVolt = parseValue(values[8]);
    const phTemperature = parseValue(values[9]);
    const pressure = parseValue(values[10]);
    const salinity = parseValue(values[11]);
    const conductivity = parseValue(values[12]);
    const oxygen = parseValue(values[13]);
    const relativeHumidity = parseValue(values[14]);
    const intTemperature = parseValue(values[15]);

    return {
      timestamp,
      sampleNumber,
      errorFlags,
      temperature,
      externalPh,
      internalPh,
      externalPhVolt,
      internalPhVolt,
      phTemperature,
      pressure,
      salinity,
      oxygen,
      conductivity,
      relativeHumidity,
      intTemperature,
    };
  } catch (error) {
    console.error('Error parsing SeapHOx data:', error, 'Raw hex:', hexValue);
    return null;
  }
}

/**
 * Extracts SeapHOx data from Sofar API response
 * Handles the response format you showed: { bristlemouth_node_id, value, timestamp, ... }
 */
export function extractSeapHoxFromSofarData(sofarData: any[]): SeapHOxData[] {
  if (!sofarData || !Array.isArray(sofarData)) {
    return [];
  }

  const results = sofarData
    .filter((item) => item.bristlemouth_node_id && item.value)
    .map((item) => {
      const parsed = parseSeapHoxData(item.value);
      if (!parsed) {
        return null;
      }

      if (item.timestamp) {
        return { ...parsed, timestamp: item.timestamp };
      }
      return parsed;
    })
    .filter((item): item is SeapHOxData => item !== null);

  return results;
}
