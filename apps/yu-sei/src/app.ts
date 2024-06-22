import { config } from 'dotenv';
import { resolve } from 'path';

export const envRunner = () => {
  config({ path: resolve(__dirname, '../../../config/.env.common') });
  config({ path: resolve(__dirname, '../../../config/.env.service') });
};

// 生產環境下加載 yu-sei 目錄下的 .env 文件
export const loadEnv = () => {
  // 首先加載根目錄下的 .env 文件
  config();

  // 如果沒有設置 NODE_ENV，默認設置為開發環境
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }

  // 如果是開發環境，則加載 .env.common 和 .env.service
  if (process.env.NODE_ENV !== 'production') {
    envRunner();
  }
};
