import yargs from 'yargs';
import AqualinkDataSource from '../ormconfig';
import { checkVideoStreams } from '../src/workers/check-video-streams';

const { argv } = yargs
  .scriptName('check-video-streams')
  .usage('$0 <cmd> [args]')
  .option('p', {
    alias: 'project',
    describe: 'Specify the projectId',
    type: 'string',
    default: 'local',
  })
  .help();

async function run() {
  const { p: projectId } = argv;

  const connection = await AqualinkDataSource.initialize();

  await checkVideoStreams(connection, projectId);
}

run();
