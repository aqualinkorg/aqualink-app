import { sofarSensor } from './src/utils/sofar';
import { extractSeapHoxFromSofarData } from './src/utils/seaphox-decoder';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from the correct location
dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
  console.log('🔄 Testing SeapHOx decoder...\n');

  // Debug: Check if token is loaded
  const token = process.env.SOFAR_API_TOKEN;
  if (!token) {
    console.error('❌ SOFAR_API_TOKEN not found in environment!');
    console.log(
      'Available env vars:',
      Object.keys(process.env).filter((k) => k.includes('SOFAR')),
    );
    return;
  }
  console.log('✅ Token loaded (length:', token.length, ')\n');

  const end = new Date();
  const start = new Date();
  start.setHours(start.getHours() - 2);

  console.log('📡 Fetching from Sofar API...');
  console.log('   Spotter ID: SPOT-31498C');
  console.log('   Time range:', start.toISOString(), 'to', end.toISOString());

  try {
    const response = await sofarSensor(
      'SPOT-31498C',
      token,
      start.toISOString(),
      end.toISOString(),
    );

    if (!response?.data) {
      console.log('❌ No data in response');
      return;
    }

    console.log(`✅ Got ${response.data.length} data points\n`);

    // Check for Bristlemouth
    const bristlemouth = response.data.filter(
      (d: any) => d.bristlemouth_node_id === '0x3fe044d4a9e8f229',
    );

    console.log(`🔍 Found ${bristlemouth.length} Bristlemouth points\n`);

    if (bristlemouth.length > 0) {
      console.log('Sample Bristlemouth:');
      console.log('  Timestamp:', bristlemouth[0].timestamp);
      console.log('  Hex (first 60):', bristlemouth[0].value?.substring(0, 60));
      console.log();
    }

    // Decode
    console.log('🔓 Decoding...');
    const decoded = extractSeapHoxFromSofarData(response.data);

    console.log(`✅ Decoded ${decoded.length} measurements\n`);

    if (decoded.length > 0) {
      console.log('Sample decoded:');
      console.log('  Timestamp:', decoded[0].timestamp);
      console.log('  Temperature:', decoded[0].temperature, '°C');
      console.log('  External pH:', decoded[0].externalPh);
      console.log('  Oxygen:', decoded[0].oxygen, 'mg/L');
      console.log('  Salinity:', decoded[0].salinity, 'PSU');
    } else {
      console.log('❌ Decoder returned nothing!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

test().catch(console.error);
