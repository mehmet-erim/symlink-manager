import fse from 'fs-extra';
import { Log } from './log';

export default async function(outputFolderPath) {
  const packageJson = await fse.readJSON(`${outputFolderPath}/package.json`);
  const { name } = packageJson;
  const hasScope = name.indexOf('@') > -1;

  let nodeModulePath = name;
  if (hasScope) {
    const nameObj = parseScopedName(name);
    nodeModulePath = `${nameObj.scope}/${nameObj.name}`;
  }

  if (fse.existsSync(`node_modules/${nodeModulePath}`)) {
    await fse.remove(`node_modules/${nodeModulePath}`);
  }

  try {
    await fse.copy(outputFolderPath, `node_modules/${nodeModulePath}`, {});
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
