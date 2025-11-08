// Test script to manually trigger SeapHOx data processing
// Place this in your scripts/ directory and run with: ts-node -r dotenv/config scripts/test-seaphox-worker.ts

import { DataSource } from 'typeorm';
import { runSpotterTimeSeriesUpdate } from '../src/workers/spotterTimeSeries';

async function testSeapHOxWorker() {
  // Initialize your data source (adjust this based on your app's config)
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Database connected');

  try {
    console.log(
      'Running spotter time series update with skipDistanceCheck=true...',
    );

    // Run with skipDistanceCheck=true to bypass distance filtering
    await runSpotterTimeSeriesUpdate(dataSource, true);

    console.log('Spotter update completed!');

    // Query to check if SeapHOx data was saved
    const seaphoxCount = await dataSource.query(`
      SELECT COUNT(*) as count 
      FROM "TimeSeries" 
      WHERE source = 'seaphox'
    `);

    console.log('SeapHOx records in database:', seaphoxCount[0].count);

    // Show latest SeapHOx records
    const latestRecords = await dataSource.query(`
      SELECT * 
      FROM "TimeSeries" 
      WHERE source = 'seaphox'
      ORDER BY timestamp DESC
      LIMIT 5
    `);

    console.log(
      'Latest SeapHOx records:',
      JSON.stringify(latestRecords, null, 2),
    );
  } catch (error) {
    console.error('Error running worker:', error);
  } finally {
    await dataSource.destroy();
  }
}

testSeapHOxWorker().catch(console.error);
