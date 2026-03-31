import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'data.json');

const initialData = {
  namespaces: [
    { id: 'default', name: '默认空间', createdAt: new Date().toISOString() }
  ],
  projects: [
  ]
};

function loadData() {
  try {
    if (existsSync(DATA_FILE)) {
      return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to read data file, using defaults:', e.message);
  }
  const data = initialData;
  saveData(data); // Create the file with initial data
  return data;
}

function saveData(data) {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write data file:', e.message);
    throw e;
  }
}

export { loadData, saveData };
