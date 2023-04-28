import AqualinkDataSource from '../ormconfig';
import { runDailyUpdate } from '../src/workers/dailyData';

async function main() {
  const conn = await AqualinkDataSource.initialize();
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
