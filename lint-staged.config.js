module.exports = {
  '*.{js,jsx,ts,tsx,json,css,scss,md,vue}': ['prettier --write'],
  '*.{js,jsx,ts,tsx,vue}': [
    'eslint --fix',
    'jest --findRelatedTests --passWithNoTests',
  ],
  '*.{ts,tsx}': ['node ./.husky/check-tsc.js'],
};
