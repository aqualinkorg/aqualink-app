const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, 'build/index.html');
const workerPath = path.resolve(__dirname, 'src/worker.ts');
const workerDir = path.resolve(__dirname, 'worker');
const workerIndexTsPath = path.join(workerDir, 'index.ts');

if (!fs.existsSync(workerDir)) {
  fs.mkdirSync(workerDir, { recursive: true });
}

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const workerContent = fs.readFileSync(workerPath, 'utf8');

const updatedWorkerContent = workerContent.replace(
  'BUILD_INJECTION',
  htmlContent,
);

fs.writeFileSync(workerIndexTsPath, updatedWorkerContent);
