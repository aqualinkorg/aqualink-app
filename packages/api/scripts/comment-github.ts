import yargs from 'yargs';
import Commenter from 'circleci-pr-commenter';

// Initialize command definition
const { argv } = yargs
  .scriptName('github-pr-comment')
  .usage('$0 <cmd> [args]')
  .example(
    '$0 -f data/file.xml -s 1006 -p 3 -t sonde',
    'This command will create or update a comment on github. It is used for automated comments.',
  )
  .option('m', {
    alias: 'message',
    describe: 'Message of the comment',
    demandOption: true,
    type: 'string',
  })
  .wrap(yargs.terminalWidth());

const SURGE_COMMENT_KEY = 'SURGE_COMMENT_KEY';

async function run() {
  const { m: message } = argv;
  // eslint-disable-next-line fp/no-mutation
  process.env.GITHUB_TOKEN = process.env.GH_TOKEN;
  // eslint-disable-next-line fp/no-mutation
  process.env.GITHUB_TOKEN_USERNAME = process.env.GH_USER;

  const commenter = new Commenter();

  await commenter.createOrUpdateComment(SURGE_COMMENT_KEY, message);
}

run();
