import fse from 'fs-extra';
import { Log } from './log';
import * as path from 'path';

export default async function(outputFolderPath, sync) {
  let packageJson;
  if (sync) {
    packageJson = fse.readJSONSync(`${outputFolderPath}/package.json`);
  } else {
    packageJson = await fse.readJSON(`${outputFolderPath}/package.json`);
  }
  const { name } = packageJson;
  const hasScope = name.indexOf('@') > -1;

  let nodeModulePath = name;
  if (hasScope) {
    const nameObj = parseScopedName(name);
    nodeModulePath = `${nameObj.scope}/${nameObj.name}`;
  }

  if (fse.existsSync(path.resolve(`node_modules/${nodeModulePath}`))) {
    if (sync) {
      fse.removeSync(path.resolve(`node_modules/${nodeModulePath}`));
    } else {
      await fse.remove(path.resolve(`node_modules/${nodeModulePath}`));
    }
  }

  try {
    if (sync) {
      fse.copySync(path.resolve(outputFolderPath), path.resolve(`node_modules/${nodeModulePath}`), { overwrite: true });
    } else {
      await fse.copy(path.resolve(outputFolderPath), path.resolve(`node_modules/${nodeModulePath}`), {
        overwrite: true,
      });
    }
  } catch (error) {
    Log.error(`An error occured. While copying process. Error: ${error}`);
  }
}

function parseScopedName(packageName) {
  const splitted = packageName.split('/');
  return {
    scope: splitted[0],
    name: splitted[1],
  };
}
