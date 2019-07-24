import fse from 'fs-extra';

export default async function(outputFolderPath) {
  const packageJson = await fse.readJSON(`${outputFolderPath}/package.json`);
  console.log(packageJson);
}

function getScope(packageName) {}
