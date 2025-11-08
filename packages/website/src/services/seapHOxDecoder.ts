/**
 * SeapHOx Hex Decoder (Aligned with Bristlemouth Explorer)
 * Matches the stringToStruct approach from Bristlemouth Explorer
 *
 * Input format:
 * "535350484f5830313035302c323032352d31302d31375432303a30393a30382c202031313739312c20303030302c..."
 *
 * Output format:
 * {
 *   name: "SSPHOX01050",
 *   dateTime: "2025-10-17T20:09:08",
 *   sampleNumber: "11791",
 *   errorFlags: "0000",
 *   temperature: "27.2112",
 *   ...
 * }
 */

interface SeapHOxRawData {
  name: string;
  dateTime: string;
  sampleNumber: string;
  errorFlags: string;
  temperature: string;
  externalPh: string;
  internalPh: string;
  externalPhVolt: string;
  internalPhVolt: string;
  phTemperature: string;
  pressure: string;
  salinity: string;
  conductivity: string;
  oxygen: string;
  relativeHumidity: string;
  intTemperature: string;
}

interface SeapHOxData {
  name: string;
  dateTime: string;
  sampleNumber: number;
  errorFlags: string;
  temperature: number;
  externalPh: number;
  internalPh: number;
  externalPhVolt: number;
  internalPhVolt: number;
  phTemperature: number;
  pressure: number;
  salinity: number;
  conductivity: number;
  oxygen: number;
  relativeHumidity: number;
  intTemperature: number;
}

/**
 * Removes trailing null bytes (padding) from hex string
 */
function removePadding(hexString: string): string {
  let cleaned = hexString;
  while (cleaned.endsWith('00')) {
    return removePadding(cleaned.slice(0, -2));
  }
  return cleaned;
}

/**
 * Decodes SeapHOx hex data using the same approach as Bristlemouth Explorer
 * This matches the stringToStruct() function from their decoder
 */
export function decodeSeapHOxHex(hexString: string): SeapHOxData | null {
  try {
    // Remove any whitespace and trailing padding
    const cleanHex = removePadding(hexString.replace(/\s+/g, ''));

    // Convert hex to ASCII (same as Bristlemouth Explorer)
    const ascii = Buffer.from(cleanHex, 'hex').toString('utf8');

    // Split by comma (splitChar from SeapHOxV2Decoder config)
    const values = ascii.split(',').map((v) => v.trim());

    if (values.length < 16) {
      console.error('Invalid SeapHOx data format - insufficient fields');
      return null;
    }

    // Map values to struct keys (matches SeapHOxV2Struct order)
    const raw: SeapHOxRawData = {
      name: values[0],
      dateTime: values[1],
      sampleNumber: values[2],
      errorFlags: values[3],
      temperature: values[4],
      externalPh: values[5],
      internalPh: values[6],
      externalPhVolt: values[7],
      internalPhVolt: values[8],
      phTemperature: values[9],
      pressure: values[10],
      salinity: values[11],
      conductivity: values[12],
      oxygen: values[13],
      relativeHumidity: values[14],
      intTemperature: values[15].replace(/\r/g, ''),
    };

    // Parse numeric values
    return {
      name: raw.name,
      dateTime: raw.dateTime,
      sampleNumber: parseInt(raw.sampleNumber, 10),
      errorFlags: raw.errorFlags,
      temperature: parseFloat(raw.temperature),
      externalPh: parseFloat(raw.externalPh),
      internalPh: parseFloat(raw.internalPh),
      externalPhVolt: parseFloat(raw.externalPhVolt),
      internalPhVolt: parseFloat(raw.internalPhVolt),
      phTemperature: parseFloat(raw.phTemperature),
      pressure: parseFloat(raw.pressure),
      salinity: parseFloat(raw.salinity),
      conductivity: parseFloat(raw.conductivity),
      oxygen: parseFloat(raw.oxygen),
      relativeHumidity: parseFloat(raw.relativeHumidity),
      intTemperature: parseFloat(raw.intTemperature),
    };
  } catch (error) {
    console.error('Error decoding SeapHOx hex data:', error);
    return null;
  }
}

/**
 * Convert decoded SeapHOx data to LatestData format for database storage
 */
export function seapHOxToLatestData(
  decoded: SeapHOxData,
  siteId: number,
  bristlemouthNodeId: string,
): Array<{
  siteId: number;
  metric: string;
  value: number;
  timestamp: string;
  source: string;
  metadata?: Record<string, any>;
}> {
  const timestamp = decoded.dateTime;
  const source = 'bristlemouth';

  return [
    {
      siteId,
      metric: 'seaphox_temperature',
      value: decoded.temperature,
      timestamp,
      source,
      metadata: { nodeId: bristlemouthNodeId, sensorName: decoded.name },
    },
    {
      siteId,
      metric: 'seaphox_external_ph',
      value: decoded.externalPh,
      timestamp,
      source,
    },
    {
      siteId,
      metric: 'seaphox_internal_ph',
      value: decoded.internalPh,
      timestamp,
      source,
    },
    {
      siteId,
      metric: 'seaphox_external_ph_volt',
      value: decoded.externalPhVolt,
      timestamp,
      source,
    },
    {
      siteId,
      metric: 'seaphox_internal_ph_volt',
      value: decoded.internalPhVolt,
      timestamp,
      source,
    },
    {
      siteId,
      metric: 'seaphox_ph_temperature',
      value: decoded.phTemperature,
      timestamp,
      source,
    },
    {
      siteId,
      metric: 'seaphox_pressure',
      value: decoded.pressure,
      timestamp,
      source,
    },
    {
      siteId,
      metric: 'seaphox_salinity',
      value: decoded.salinity,
      timestamp,
      source,
    },
    {
      siteId,
      metric: 'seaphox_conductivity',
      value: decoded.conductivity,
      timestamp,
      source,
    },
    {
      siteId,
      metric: 'seaphox_oxygen',
      value: decoded.oxygen,
      timestamp,
      source,
    },
    {
      siteId,
      metric: 'seaphox_relative_humidity',
      value: decoded.relativeHumidity,
      timestamp,
      source,
    },
    {
      siteId,
      metric: 'seaphox_sample_number',
      value: decoded.sampleNumber,
      timestamp,
      source,
    },
    {
      siteId,
      metric: 'seaphox_error_flags',
      value: parseInt(decoded.errorFlags, 10) || 0,
      timestamp,
      source,
    },
    {
      siteId,
      metric: 'seaphox_int_temperature',
      value: decoded.intTemperature,
      timestamp,
      source,
    },
  ];
}

/**
 * Example usage:
 *
 * const hexData = "535350484f5830313035302c323032352d31302d31375432303a30393a30382c202031313739312c20303030302c2032372e323131322c372e393735312c372e393936302c2d302e3937383237362c2d312e3032383432332c2032372e323330332c20202032342e3530302c202033352e303734322c2020352e35353038302c2020342e3631372c2034342e392c32372e330d320d";
 *
 * const decoded = decodeSeapHOxHex(hexData);
 * console.log(decoded);
 * // {
 * //   name: "SSPHOX01050",
 * //   dateTime: "2025-10-17T20:09:08",
 * //   temperature: 27.2112,
 * //   externalPh: 7.9751,
 * //   ...
 * // }
 *
 * const latestDataEntries = seapHOxToLatestData(decoded, 123, "0x3fe044d4a9e8f229");
 * // Store in database
 */
