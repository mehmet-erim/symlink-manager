import fse from 'fs-extra';
import { ANGULAR_FILE_PATH } from './utils/config';
import { Log } from './utils/log';
import prompt from './utils/prompt';
import path from 'path';
import execa from 'execa';
import * as _ from 'lodash';
import chokidar from 'chokidar';
import copy from './utils/copy';

export default async function(options) {
  let angularPath = ANGULAR_FILE_PATH;
  let angularJson;

  if (await fse.pathExists(angularPath)) {
    angularJson = await fse.readJSON(angularPath);
  } else {
    angularPath = await prompt('angularPath', null, 'Please choose your angular.json file', 'file-tree-selection');

    if (!(await fse.pathExists(angularPath))) {
      Log.error('angular.json not found');
      return;
    }

    angularJson = await fse.readJSON(angularPath, { throws: false });
  }

  const projectNames = [];

  let libraries = Object.keys(angularJson.projects)
    .map(key => {
      if (angularJson.projects[key].projectType === 'library') {
        projectNames.push(key);
      }

      return { ...angularJson.projects[key] };
    })
    .filter(({ projectType }) => projectType === 'library');

  const packageNames = libraries.map(library => {
    try {
      return fse.readJSONSync(`${library.root}/package.json`).name;
    } catch (error) {
      Log.error(
        `${
          library.root
        }/package.json not found. Did you create the library with "ng g lib" command. Please check your file structure.`,
      );
      return;
    }
  });

  libraries = libraries.map((library, index) => ({
    ...library,
    packageName: packageNames[index],
    projectName: projectNames[index],
    outputFolderPath: getOutputFolder(library.architect.build.options.project),
  }));
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
    const { projectName, outputFolderPath, root } = libraries.find(library => library.packageName === packName);
    if (options.command === 'link' || options.command === 'copy') {
      try {
        spinner.start();

        try {
          await build(packageManager, projectName);
        } catch (error) {
          await build(packageManager, projectName, { stdio: 'inherit' });
          process.exit(1);
        }

        if (options.command === 'link') {
          await execa(packageManager, ['link'], { cwd: outputFolderPath });
          await execa(packageManager, ['link', packName]);
        } else if (options.command === 'copy') {
          await copy(outputFolderPath);
        }

        spinner.stop();

        Log.success(`\n${packName} successfully built.`);

        if (options.command === 'link') {
          Log.success(`Symbolic link to ${packName} is successfully created.`);
        } else if (options.command === 'copy') {
          Log.success(`${packName} is successfully copied to node_modules.`);
        }

        Log.info(`${packName} is watching...`);
        chokidar.watch(root, { ignored: /node_modules/ }).on(
          'change',
          _.debounce(async () => {
            Log.info(`\n${packName} build has been started.`);

            try {
              await build(packageManager, projectName);
            } catch (error) {
              Log.error(error);
              await build(packageManager, projectName, { stdio: 'inherit' });
              return;
            }

            Log.success(`${packName} successfully built.`);
          }, 500),
        );
      } catch (err) {
        spinner.stop();
        Log.error(err);
        process.exit(1);
      }
    } else {
      try {
        spinner.start();

        await execa(packageManager, ['unlink', packName]);
        await execa(packageManager, ['unlink'], { cwd: outputFolderPath });

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

function getOutputFolder(ngPackagePath) {
  const ngPackage = fse.readJSONSync(ngPackagePath);

  return path.normalize(`${ngPackagePath}/../${ngPackage.dest}`);
}

async function build(packageManager, projectName, params) {
  await execa(packageManager, [...(packageManager === 'npm' ? ['run'] : []), 'ng', 'build', projectName], params);
}
