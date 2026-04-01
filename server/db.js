import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || __dirname;

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const DATA_FILE = join(DATA_DIR, 'data.json');
const USER_FILE = join(DATA_DIR, 'user.json');
const INVITE_FILE = join(DATA_DIR, 'invite_codes.json');

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

function loadUsers() {
  try {
    if (existsSync(USER_FILE)) {
      return JSON.parse(readFileSync(USER_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to read user file:', e.message);
  }
  return [];
}

function saveUsers(users) {
  try {
    writeFileSync(USER_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write user file:', e.message);
    throw e;
  }
}

function loadInviteCodes() {
  try {
    if (existsSync(INVITE_FILE)) {
      return JSON.parse(readFileSync(INVITE_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to read invite codes file:', e.message);
  }
  return [];
}

function saveInviteCodes(codes) {
  try {
    writeFileSync(INVITE_FILE, JSON.stringify(codes, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write invite codes file:', e.message);
    throw e;
  }
}

export { loadData, saveData, loadUsers, saveUsers, loadInviteCodes, saveInviteCodes };
