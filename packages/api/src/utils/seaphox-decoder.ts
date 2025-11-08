/**
 * SeapHOx Data Decoder
 *
 * Decodes hex-encoded SeapHOx data from Sofar API and extracts measurements.
 * Based on SeapHOx V2 manual specification and working decoder implementation.
 *
 * SeapHOx OutputFormat=1 (decimal format, engineering units):
 * FrameSync, DateTime(UTC), Sample Number, Error Flags,
 * Temperature(Celsius), External pH(pH), Internal pH(pH), External pH(Volt),
 * Internal pH(Volt), pH Temperature(Celsius), Pressure(Decibar), Salinity(psu),
 * Conductivity(S/m), Oxygen(ml/L), Relative Humidity(%), Int Temperature(Celsius)
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
  let ascii = '';
  for (let i = 0; i < hexString.length; i += 2) {
    const hexByte = hexString.substring(i, i + 2);
    const byte = parseInt(hexByte, 16);
    // Stop at null bytes (padding)
    if (byte === 0) break;
    ascii += String.fromCharCode(byte);
  }
  return ascii;
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
      return isNaN(val) ? null : val;
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

  const seaphoxDataPoints: SeapHOxData[] = [];

  for (const dataPoint of sofarData) {
    // Check if this data point has bristlemouth data with hex value
    if (dataPoint.bristlemouth_node_id && dataPoint.value) {
      const parsed = parseSeapHoxData(dataPoint.value);
      if (parsed) {
        // Use the Sofar timestamp as primary, fallback to SeapHOx timestamp
        if (dataPoint.timestamp) {
          parsed.timestamp = dataPoint.timestamp;
        }
        seaphoxDataPoints.push(parsed);
      }
    }
  }

  return seaphoxDataPoints;
}

/**
 * Test function - remove this after testing
 */
export function testSeapHoxDecoder() {
  // Your actual data from the raw API response
  const testHex =
    '535350484f5830313035302c323032352d31302d32305431333a34393a30382c202031313938382c20303030302c2032362e393437362c372e393634302c372e393830382c2d302e3937393135392c2d312e3032393437362c2032362e393738352c202020322c362e3630392c202033342e393936342c2020352e35313230372c2020342e3339322c2034352e302c32372e31';

  const result = parseSeapHoxData(testHex);
  console.log('Test result:', result);

  // Expected output:
  // {
  //   timestamp: '2025-10-20T13:49:08',
  //   sampleNumber: 11988,
  //   errorFlags: '0000',
  //   temperature: 26.9476,
  //   externalPh: 7.9640,
  //   internalPh: 7.9808,
  //   externalPhVolt: -0.979159,
  //   internalPhVolt: -1.029476,
  //   phTemperature: 26.9785,
  //   pressure: 24.609,
  //   salinity: 34.9964,
  //   oxygen: 5.51207,
  //   conductivity: 4.392,
  //   relativeHumidity: 45.0,
  //   intTemperature: 27.1
  // }
}
