import fse from 'fs-extra';

export const ANGULAR_FILE_PATH = './angular.json';

export const IS_EXIST_YARN_LOCK = fse.existsSync('yarn.lock');
