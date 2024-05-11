module.exports = {
  '*.{js,jsx,ts,tsx,json,css,scss,md,vue}': ['prettier --write'],
  '*.{js,jsx,ts,tsx,vue}': ['eslint --fix'],
  '*.{js,jsx,ts,tsx,vue}': ['jest --findRelatedTests'],
};
