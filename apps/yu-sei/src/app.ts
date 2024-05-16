import { config } from 'dotenv';
import { resolve } from 'path';

export const envRunner = () => {
  config({ path: resolve(__dirname, '../../../config/.env.common') });
  config({ path: resolve(__dirname, '../../../config/.env.yusei') });
};
