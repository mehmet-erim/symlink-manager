import fse from 'fs-extra';

export const ANGULAR_FILE_PATH = './angular.json';

export const IS_EXIST_YARN_LOCK = fse.existsSync('yarn.lock');

export async function getConfig() {
  if (await fse.exists('./symlink.config.json')) {
    return await fse.readJSON('./symlink.config.json');
  }
}
