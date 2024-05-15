/* eslint-disable @typescript-eslint/no-var-requires */

const chokidar = require('chokidar');
const { camelCase, startCase } = require('lodash');
const fs = require('fs-extra');
const chalk = require('chalk');

const watcher = chokidar.watch('./src/**/*.json', {
  persistent: false,
  ignored: /\.md|\.ts|examples|\.js$/,
});

const createContent = (exportName, schema) => {
  return `/* eslint-disable */    

//! auto generated from json schema  
export const ${exportName} = ${schema} as const
`;
};

const getTsExportName = (id, path, postfix, def) => {
  const regex = /^https:\/\/card.time.com\/schema\/([a-z0-9-/]+)/gm;
  let namePath;
  let matchResult;
  while ((matchResult = regex.exec(id)) !== null) {
    namePath = matchResult[1];
  }
  if (!namePath) {
    throw `getTypeName error: ${path} (regex not found in id: ${id}))`;
  }
  if (postfix === 'Type') {
    if (def) {
      const names = namePath.split('/');
      const fileName = names[names.length - 1];
      return `${startCase(camelCase(fileName + ' ' + def))
        .split(' ')
        .join('')}${postfix}`;
    }
    return `${startCase(camelCase(namePath.replaceAll('/', ' ')))
      .split(' ')
      .join('')}${postfix}`;
  }
  return `${camelCase(namePath.replaceAll('/', ' '))}${postfix}`;
};

const addTsSchemaFile = path => {
  // 使用 regex 取得 dir 或 file name
  const regex = /^(src)\/(.+).json$/gm;
  let dirPath;
  let fileName;
  let matchResult;
  while ((matchResult = regex.exec(path)) !== null) {
    dirPath = matchResult[1];
    fileName = `${matchResult[2]}`;
  }
  const schema = fs.readJSONSync(path);
  const exportName = getTsExportName(schema.$id, path, 'Schema');
  const tsFile = createContent(exportName, JSON.stringify(schema));
  console.log(dirPath, fileName);
  fs.writeFileSync(`${dirPath}/${fileName}.const.ts`, tsFile);

  // return { filePath: `${dirPath}/${fileName}`, tsFile, }
};

watcher
  .on('add', path => {
    const newDataTime = new Date(Date.now()).toLocaleString();
    path = path.replaceAll('\\', '/');
    console.log(chalk.yellow(newDataTime), chalk.yellow.bold('add'), path);
    addTsSchemaFile(path);
    // addTypesFile(path)
  })
  .on('change', path => {
    const newDataTime = new Date(Date.now()).toLocaleString();
    path = path.replaceAll('\\', '/');
    console.log(chalk.blue(newDataTime), chalk.blue.bold('change'), path);
    addTsSchemaFile(path);
    // addTypesFile(path)
  })
  .on('unlink', path => {
    const newDataTime = new Date(Date.now()).toLocaleString();
    path = path.replaceAll('\\', '/');
    console.log(chalk.red(newDataTime), chalk.red.bold('remove'), path);
  });
