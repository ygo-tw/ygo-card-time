const { execSync } = require('child_process');

if (!process.env.CI && process.env.NODE_ENV !== 'production') {
  execSync('npx husky install', { stdio: 'inherit' });
}
