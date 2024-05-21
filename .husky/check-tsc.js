const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);

args.forEach(file => {
  // 找到文件所在的子專案
  const projectDir = file.startsWith('apps/')
    ? 'apps/yu-sei'
    : file.split(path.sep)[0];
  const tsconfigPath = path.join(projectDir, 'tsconfig.json');

  try {
    console.log(`Checking ${file} with ${tsconfigPath}`);
    execSync(`tsc --noEmit -p ${tsconfigPath}`, { stdio: 'inherit' });
  } catch (error) {
    process.exit(1);
  }
});
