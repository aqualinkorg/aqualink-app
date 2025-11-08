import { sofarSensor } from './src/utils/sofar';
import { extractSeapHoxFromSofarData } from './src/utils/seaphox-decoder';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  const end = new Date();
  const start = new Date();
  start.setHours(start.getHours() - 2);
  
  const response = await sofarSensor('SPOT-31498C', process.env.SOFAR_API_TOKEN, start.toISOString(), end.toISOString());
  const decoded = extractSeapHoxFromSofarData(response.data);
  
  console.log('Decoded:', decoded.length, 'measurements');
  if (decoded[0]) console.log('Sample:', decoded[0]);
}

test().catch(console.error);
