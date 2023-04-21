import { DataSource } from 'typeorm';
import { runDailyUpdate } from '../src/workers/dailyData';

const dbConfig = require('../ormconfig');

async function main() {
  const dataSource = new DataSource(dbConfig);
  const conn = await dataSource.initialize();
  try {
    await runDailyUpdate(conn);
  } catch (err) {
    console.error(`Daily data update failed:\n${err}`);
    process.exit(1);
  } finally {
    conn.destroy();
  }
  process.exit(0);
}

main();
