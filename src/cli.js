import arg from 'arg';
import figlet from 'figlet';
import { Log } from './utils/log';
import prompt from './utils/prompt';
import angular from './angular';
import fse from 'fs-extra';
import { IS_EXIST_YARN_LOCK, getConfig } from './utils/config';
import linkWithConfig from './link-with-config';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--angular': Boolean,
      '--no-watch': Boolean,
      '--packages': String,
      '--sync-build': Boolean,
      '--yarn': Boolean,
      '-a': '--angular',
      '-y': '--yarn',
    },
    {
      argv: rawArgs,
    },
  );
  return {
    angular: args['--angular'],
    noWatch: args['--no-watch'],
    packages: args['--packages'],
    syncBuild: args['--sync-build'],
    yarn: args['--yarn'],
    command: args._[0] || '',
  };
}

export async function cli(args) {
  Log.primary(figlet.textSync('Symlink', { horizontalLayout: 'full' }));
  ('');
  const config = (await getConfig()) || {};

  let options = parseArgumentsIntoOptions(args);

  if (typeof options.yarn === 'undefined') {
    options.yarn = config.yarn || IS_EXIST_YARN_LOCK;
  }

  if (options.packages) {
    options.packages = options.packages.split(',').filter(pack => pack);
  }

  if (
    !(
      options.command.toLowerCase() === 'link' ||
      options.command.toLowerCase() === 'unlink' ||
      options.command.toLowerCase() === 'copy'
    )
  ) {
    options.command = (await prompt('command', ['Link', 'Unlink', 'Copy'], 'Please pick a command')).toLowerCase();
  }

  if (config.packages && config.packages.length && !options.angular) {
    await linkWithConfig(options, config);
    return;
  }

  if (!options.angular) {
    options.angular = await prompt(
      'angular',
      null,
      'For Angular? (Only supoorts created with "ng generate lib" libraries. If you are not sure, you may choose no.)',
      'confirm',
    );
  }

  if (options.angular) {
    await angular(options);
    return;
  }

  if (options.angular === false) {
    const choose = await prompt(
      'createConfigFile',
      null,
      'symlink.config.json not found. Would you like to crate an example symlink.config.json? You must fill this the json file.',
      'confirm',
    );

    if (choose) {
      await fse.writeJSON(
        './symlink.config.json',
        {
          yarn: true,
          packages: [
            {
              libraryFolderPath: 'packages/core',
              linkFolderPath: 'dist/core',
              buildCommand: 'ng build core',
              buildCommandRunPath: './',
              exclude: ['node_modules', 'dist'],
            },
          ],
        },
        { spaces: 2 },
      );

      Log.success('symlink.config.json created. Do not forget, you must fill the json file.');
      return;
    }
  }

  Log.primary(`I am sorry. I couldn't help you. Please try another options.`);
}
