import fse from 'fs-extra';
import { Log } from './log';
import * as path from 'path';

export default async function(outputFolderPath) {
  const packageJson = await fse.readJSON(`${outputFolderPath}/package.json`);
  const { name } = packageJson;
  const hasScope = name.indexOf('@') > -1;

  let nodeModulePath = name;
  if (hasScope) {
    const nameObj = parseScopedName(name);
    nodeModulePath = `${nameObj.scope}/${nameObj.name}`;
  }

  if (fse.existsSync(path.resolve(`node_modules/${nodeModulePath}`))) {
    await fse.remove(path.resolve(`node_modules/${nodeModulePath}`));
  }

  try {
    await fse.copy(path.resolve(outputFolderPath), path.resolve(`node_modules/${nodeModulePath}`), { overwrite: true });
  } catch (error) {
    Log.error(`An error occured. While copying process. Error: ${error}`);
    process.exit(1);
  }
}

function parseScopedName(packageName) {
  const splitted = packageName.split('/');
  return {
    scope: splitted[0],
    name: splitted[1],
  };
}
