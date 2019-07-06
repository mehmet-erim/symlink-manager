import fse from 'fs-extra';
import { ANGULAR_FILE_PATH } from './utils/config';
import { Log } from './utils/log';
import prompt from './utils/prompt';
import path from 'path';

export default async function(options) {
  let angularPath = path.normalize(`${__dirname}/../${ANGULAR_FILE_PATH}`);
  let angularJson;

  if (await fse.pathExists(angularPath)) {
    angularJson = await fse.readJSON(angularPath, { throws: false });
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
      projectNames.push(key);
      return { ...angularJson.projects[key] };
    })
    .filter(({ projectType }) => projectType === 'library');

  const packageNames = libraries.map(library => {
    try {
      return fse.readJSONSync(path.normalize(`${__dirname}/../${library.root}/package.json`)).name;
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
  }));

  const selectedPackages = await prompt('packages', packageNames, 'Please choose packages:', 'checkbox');

  console.log(libraries);

  if (!selectedPackages.length) {
    Log.error('You must choose at least one package');
    return;
  }

  if (options.command === 'Link') {
    selectedPackages.forEach(async packName => {
      const spinner = Log.spinner('Processing...');

      try {
        spinner.start();

        await execa('ng', ['build', libraries.find(library => library.packageName === packName).projectName]);
        Log.success(`\n ${pack.name} successfully built.`, 'green');
      } catch (err) {
        spinner.stop();
        Log.error(err);
        return;
      }
    });
  }
}
