import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const LOG_ENDPOINT = 'http://127.0.0.1:7472/ingest/0a9d034e-1e76-432e-94d3-4c7f241917a3';
const SESSION_ID = '737a65';

function debugLog(hypothesisId, location, message, data = {}) {
  fetch(LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': SESSION_ID },
    body: JSON.stringify({ sessionId: SESSION_ID, hypothesisId, location, message, data, timestamp: Date.now() })
  }).catch(() => {});
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || __dirname;
debugLog('G', 'db.js:init', 'DATA_DIR resolved', { DATA_DIR, __dirname });

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
  debugLog('C', 'db.js:saveData_entry', 'saveData called', { namespaces: data.namespaces.length, projects: data.projects.length });
  try {
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    debugLog('C', 'db.js:saveData_success', 'saveData success');
  } catch (e) {
    debugLog('C', 'db.js:saveData_error', 'saveData failed', { DATA_FILE, error: e.message, code: e.code });
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
    console.error('Failed to read user file, resetting to []:', e.message);
  }
  saveUsers([]);
  return [];
}

function saveUsers(users) {
  debugLog('E', 'db.js:saveUsers_entry', 'saveUsers called', { count: users.length });
  try {
    writeFileSync(USER_FILE, JSON.stringify(users, null, 2), 'utf-8');
    debugLog('E', 'db.js:saveUsers_success', 'saveUsers success');
  } catch (e) {
    debugLog('E', 'db.js:saveUsers_error', 'saveUsers failed', { USER_FILE, error: e.message, code: e.code });
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
    console.error('Failed to read invite codes file, resetting to []:', e.message);
  }
  saveInviteCodes([]);
  return [];
}

function saveInviteCodes(codes) {
  debugLog('D', 'db.js:saveInviteCodes_entry', 'saveInviteCodes called', { count: codes.length });
  try {
    writeFileSync(INVITE_FILE, JSON.stringify(codes, null, 2), 'utf-8');
    debugLog('D', 'db.js:saveInviteCodes_success', 'saveInviteCodes success');
  } catch (e) {
    debugLog('D', 'db.js:saveInviteCodes_error', 'saveInviteCodes failed', { INVITE_FILE, error: e.message, code: e.code });
    console.error('Failed to write invite codes file:', e.message);
    throw e;
  }
}

export { loadData, saveData, loadUsers, saveUsers, loadInviteCodes, saveInviteCodes };
