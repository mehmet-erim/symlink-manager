import arg from 'arg';
import figlet from 'figlet';
import { Log } from './utils/log';
import prompt from './utils/prompt';
import angular from './angular';
import { IS_EXIST_YARN_LOCK } from './utils/config';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--yarn': Boolean,
      '-y': '--yarn',
    },
    {
      argv: rawArgs,
    },
  );
  return {
    yarn: args['--yarn'],
    command: args._[0],
    forAngular: args._[1],
  };
}

export async function cli(args) {
  Log.primary(figlet.textSync('Symlink', { horizontalLayout: 'full' }));

  let options = parseArgumentsIntoOptions(args);

  if (typeof options.yarn === 'undefined') {
    options.yarn = IS_EXIST_YARN_LOCK;
  }

  if (!(options.command.toLowerCase() === 'link' || options.command.toLowerCase() === 'unlink')) {
    options.command = (await prompt('command', ['Link', 'Unlink'], 'Please pick a command')).toLowerCase();
  }

  if (!options.forAngular) {
    options.forAngular = await prompt('forAngular', ['Yes', 'No'], 'For Angular?', 'confirm');
  }

  if (options.forAngular) {
    await angular(options);
  }

  if (options.forAngular === false) {
    options.buildCommand = await prompt('buildCommand', null, '(Optional) Please type your build command:', 'input');
  }

  console.log(options);
}
