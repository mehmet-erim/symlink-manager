import prompt from './utils/prompt';
import fse from 'fs-extra';
import execa from 'execa';
import chokidar from 'chokidar';
import { Log } from './utils/log';
import * as _ from 'lodash';
import path from 'path';

export default async function(options, config) {
  const packageNames = getPackageNames(config);

  if (!packageNames.length) {
    Log.error(
      'No packages found. Check symlink.config.json. Focus the libraryPathFolder property. Must have package.json in this folder and name property is required.',
    );
    process.exit(1);
  }

  const selectedPackages = await prompt(
    'packages',
    packageNames,
    'Please choose packages for create symbolic link:',
    'checkbox',
  );

  if (!selectedPackages.length) {
    Log.error('You must choose at least one package');
    process.exit(1);
  }

  const spinner = Log.spinner('Processing...');
  const packageManager = options.yarn ? 'yarn' : 'npm';

  selectedPackages.forEach(async packName => {
    const index = packageNames.indexOf(packName);
    const pack = config.packages[index];

    spinner.start();

    if (options.command === 'link') {
      if (pack.buildCommand) {
        try {
          await execa(pack.buildCommand, null, { cwd: pack.buildCommandRunPath || './' });
          Log.success(`\n${packName} successfully built.`);
        } catch (error) {
          spinner.stop();
          await execa(pack.buildCommand, null, { cwd: pack.buildCommandRunPath || './', stdio: 'inherit' });
          process.exit(1);
        }
      }

      try {
        await execa(packageManager, ['link'], { cwd: pack.linkFolderPath });
        await execa(packageManager, ['link', packName]);
      } catch (error) {
        spinner.stop();
        Log.error(`\nAn error occured. While linking dependency. Error: ${error}`);
        process.exit(1);
      }

      spinner.stop();
      Log.success(`\nSymbolic link to ${packName} is successfully created.`);

      if (pack.buildCommand) {
        Log.info(`${packName} is watching...`);
        chokidar.watch(path.normalize(pack.libraryFolderPath), { ignored: /node_modules/ }).on(
          'change',
          _.debounce(async () => {
            Log.info(`\n${packName} build has been started.`);

            try {
              await execa(pack.buildCommand, null, { cwd: pack.buildCommandRunPath || './' });
            } catch (error) {
              Log.error(error);
              await execa(pack.buildCommand, null, { cwd: pack.buildCommandRunPath || './', stdio: 'inherit' });
              return;
            }

            Log.success(`${packName} successfully built.`);
          }, 500),
        );
      }
    } else {
      try {
        spinner.start();

        await execa(packageManager, ['unlink', packName]);
        await execa(packageManager, ['unlink'], { cwd: pack.linkFolderPath });

        spinner.stop();
        Log.info(`\nSymbolic link to ${packName} is successfully deleted.`);
      } catch (error) {
        spinner.stop();
        Log.error(error);
        process.exit(1);
      }
    }
  });
}

function getPackageNames(config) {
  const names = [];

  config.packages.forEach(async pack => {
    const packageJson = fse.readJSONSync(`${pack.libraryFolderPath}/package.json`, { throws: false });

    if (!packageJson) {
      Log.error(
        'package.json not found. Check your libraryFolderPath config. libraryFolderPath must be a dependency package.',
      );
      process.exit(1);
    }
    names.push(packageJson.name);
  });

  return names;
}
