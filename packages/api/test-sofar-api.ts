// Script to test Sofar API and see raw SeapHOx data
// Run with: ts-node -r dotenv/config scripts/test-sofar-api.ts

import axios from 'axios';

async function testSofarAPI() {
  const SOFAR_API_TOKEN = process.env.SOFAR_API_TOKEN;
  const SPOTTER_ID = 'SPOT-YOUR-DEVICE-ID'; // Replace with your spotter ID

  if (!SOFAR_API_TOKEN) {
    console.error('SOFAR_API_TOKEN not found in environment');
    return;
  }

  try {
    console.log(`Fetching data for spotter: ${SPOTTER_ID}`);

    // Fetch latest data from Sofar API
    const response = await axios.get(
      `https://api.sofarocean.com/api/latest-data`,
      {
        headers: {
          Authorization: `Bearer ${SOFAR_API_TOKEN}`,
        },
        params: {
          spotterId: SPOTTER_ID,
          includeSmartMooringData: true, // This might be needed for SeapHOx
        },
      },
    );

    console.log('\n=== RAW SOFAR API RESPONSE ===');
    console.log(JSON.stringify(response.data, null, 2));

    // Check for SeapHOx data in the response
    if (response.data.data) {
      const seaphoxData = response.data.data.find(
        (d: any) =>
          d.sensorType === 'seaphox' ||
          d.type === 'seaphox' ||
          Object.keys(d).some((k) => k.toLowerCase().includes('seaphox')),
      );

      if (seaphoxData) {
        console.log('\n=== FOUND SEAPHOX DATA ===');
        console.log(JSON.stringify(seaphoxData, null, 2));
      } else {
        console.log('\n⚠️  No SeapHOx data found in response');
        console.log(
          'Available data types:',
          response.data.data.map((d: any) => d.sensorType || d.type),
        );
      }
    }
  } catch (error) {
    console.error('Error fetching from Sofar API:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
    }
  }
}

testSofarAPI().catch(console.error);
