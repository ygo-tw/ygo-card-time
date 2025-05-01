// bcrypt-hash.js
import bcrypt from 'bcrypt';

// 獲取命令行參數
const password = process.argv[2];

if (!password) {
  console.error('請提供要加密的密碼作為參數');
  process.exit(1);
}

const saltRounds = 10;

bcrypt
  .hash(password, saltRounds)
  .then(hash => {
    console.log(hash);
    process.exit(0);
  })
  .catch(err => {
    console.error('加密錯誤:', err);
    process.exit(1);
  });
