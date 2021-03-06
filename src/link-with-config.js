import prompt from './utils/prompt';
import fse from 'fs-extra';
import execa from 'execa';
import chokidar from 'chokidar';
import { Log } from './utils/log';
import * as _ from 'lodash';
import path from 'path';
import copy from './utils/copy';
import { Subject, from, of } from 'rxjs';
import { switchMap, takeUntil, take } from 'rxjs/operators';

export default async function (options, config) {
  const packageNames = getPackageNames(config);

  if (!packageNames.length) {
    Log.error(
      'No packages found. Check symlink.config.json. Focus the libraryPathFolder property. Must have package.json in this folder and name property is required.',
    );
    process.exit(1);
  }

  let message = '';
  if (options.command === 'link') {
    message = 'create symbolic link';
  } else if (options.command === 'link') {
    message = 'remove symbolic link';
  } else if (options.command === 'copy') {
    message = 'copy';
  }

  const logSelectedPackages = (selectedPackages) =>
    Log.info(
      `Selected packages: ${JSON.stringify(selectedPackages)
        .replace(/\[|\]|\"/g, '')
        .replace(/\,/g, ', ')}`,
    );

  let selectedPackages = [];
  if (options.packages && options.packages.length && !options.allPackages) {
    selectedPackages = options.packages.filter((pack) => packageNames.indexOf((pack || '').toLowerCase()) > -1);
    logSelectedPackages(selectedPackages);
  } else if (options.allPackages) {
    selectedPackages = [...packageNames];

    if (options.excludedPackages) {
      const excluded = options.excludedPackages.split(',');
      selectedPackages = selectedPackages.filter((x) => !excluded.includes(x));
    }

    logSelectedPackages(selectedPackages);
  }

  if (!selectedPackages.length) {
    selectedPackages = await prompt('packages', packageNames, `Please choose packages for ${message}:`, 'checkbox');
  }

  if (!selectedPackages.length) {
    Log.error('You must choose at least one package');
    process.exit(1);
  }

  const spinner = Log.spinner('Processing...');
  const packageManager = options.yarn ? 'yarn' : 'npm';

  selectedPackages.forEach(async (packName) => {
    const index = packageNames.indexOf(packName);
    const pack = config.packages[index];

    spinner.start();

    const buildCommandArr = (pack.buildCommand || '').split(' ');

    if (options.command === 'link' || options.command === 'copy') {
      if (pack.buildCommand) {
        try {
          if (options.syncBuild) {
            execa.sync(buildCommandArr[0], buildCommandArr.slice(1), {
              cwd: pack.buildCommandRunPath || './',
            });
          } else {
            await execa(buildCommandArr[0], buildCommandArr.slice(1), {
              cwd: pack.buildCommandRunPath || './',
            });
          }
          Log.success(`\n${packName} successfully built.`);
        } catch (error) {
          spinner.stop();
          Log.error(error.stderr);
          process.exit(1);
          return;
        }
      }

      try {
        if (options.command === 'link') {
          if (options.syncBuild) {
            execa.sync(packageManager, ['link'], { cwd: pack.linkFolderPath });
            execa.sync(packageManager, ['link', packName]);
          } else {
            await execa(packageManager, ['link'], { cwd: pack.linkFolderPath });
            await execa(packageManager, ['link', packName]);
          }
        } else if (options.command === 'copy') {
          if (options.syncBuild) {
            copy(pack.linkFolderPath, true);
          } else {
            await copy(pack.linkFolderPath);
          }
        }
      } catch (error) {
        spinner.stop();
        Log.error(`\nAn error occured. While linking dependency. Error: ${error}`);
        process.exit(1);
        return;
      }

      spinner.stop();

      if (options.command === 'link') {
        Log.success(`Symbolic link to ${packName} has been successfully created.`);
      } else if (options.command === 'copy') {
        Log.success(`${packName} has been successfully copied to node_modules.`);
      }

      if (pack.buildCommand && !options.noWatch) {
        Log.info(`${packName} is watching...`);
        let destroy$ = new Subject();
        let subscribe = {};

        const ignored = pack.exclude && pack.exclude.length ? new RegExp(pack.exclude.join('|')) : null;

        chokidar.watch(path.normalize(pack.libraryFolderPath), { ignored }).on(
          'change',
          _.debounce(async () => {
            if (subscribe.closed === false) {
              destroy$.next();
              Log.info(`${packName} build process stopped.`);
            }

            Log.info(`\n${packName} build has been started.`);

            subscribe = from(
              execa(buildCommandArr[0], buildCommandArr.slice(1), {
                cwd: pack.buildCommandRunPath || './',
              }),
            )
              .pipe(
                switchMap(() => (options.command === 'copy' ? from(copy(pack.linkFolderPath)) : of(null))),
                takeUntil(destroy$),
                take(1),
              )
              .subscribe({
                next: () => {
                  Log.success(`${packName} successfully built.`);
                  if (options.command === 'copy') {
                    Log.success(`The output files successfully copied.`);
                  }
                },
                error: (error) => {
                  Log.error(error.stderr);
                },
              });
          }, 200),
        );
      }
    } else {
      try {
        spinner.start();

        await execa(packageManager, ['unlink', packName]);
        await execa(packageManager, ['unlink'], { cwd: pack.linkFolderPath });

        spinner.stop();
        Log.info(`\nSymbolic link to ${packName} has been successfully deleted.`);
      } catch (error) {
        spinner.stop();
        Log.primary(`\n${packName} have not symbolic link`);
        return;
      }
    }
  });
}

function getPackageNames(config) {
  const names = [];

  config.packages.forEach(async (pack) => {
    const packageJson = fse.readJSONSync(`${pack.libraryFolderPath}/package.json`, {
      throws: false,
    });

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
