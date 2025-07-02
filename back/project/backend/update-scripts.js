import fs from 'fs';
import { readFile } from 'fs/promises';

// 读取package.json
const packageJsonContent = await readFile('./package.json', 'utf8');
const packageJson = JSON.parse(packageJsonContent);

// 更新scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "start": "node src/app.js",
  "dev": "nodemon src/app.js",
  "test": "jest",
  "lint": "eslint src/**/*.js"
};

// 寫回package.json，格式化為美觀的JSON
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
console.log('Scripts updated successfully'); 