import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

let _sql;
function sql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

// ─── Schema initialization ───────────────────────────────
let schemaReady = false;
async function ensureSchema() {
  if (schemaReady) return;
  const s = sql();

  await s`CREATE TABLE IF NOT EXISTS namespaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await s`CREATE TABLE IF NOT EXISTS namespace_custom_types (
    namespace_id TEXT NOT NULL REFERENCES namespaces(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    icon TEXT NOT NULL,
    PRIMARY KEY (namespace_id, key)
  )`;

  await s`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    namespace_id TEXT REFERENCES namespaces(id) ON DELETE SET NULL
  )`;

  await s`CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    namespace_id TEXT NOT NULL REFERENCES namespaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    submitted_at TIMESTAMPTZ
  )`;

  await s`CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    date TEXT NOT NULL,
    description TEXT DEFAULT '',
    reimbursed BOOLEAN DEFAULT FALSE,
    pdf TEXT
  )`;

  await s`CREATE TABLE IF NOT EXISTS invite_codes (
    code TEXT PRIMARY KEY,
    used BOOLEAN DEFAULT FALSE
  )`;

  schemaReady = true;
}

// ─── Bcrypt helpers ──────────────────────────────────────
const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function isBcryptHash(str) {
  return typeof str === 'string' && str.startsWith('$2');
}

// ─── Users ───────────────────────────────────────────────
async function findUserByUsername(username) {
  await ensureSchema();
  const rows = await sql()`SELECT * FROM users WHERE username = ${username}`;
  return rows[0] || null;
}

async function createUser(user) {
  await ensureSchema();
  await sql()`INSERT INTO users (id, username, password, namespace_id)
    VALUES (${user.id}, ${user.username}, ${user.password}, ${user.namespaceId})`;
}

async function updateUserPassword(userId, hashedPassword) {
  await ensureSchema();
  await sql()`UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}`;
}

// ─── Namespaces ──────────────────────────────────────────
async function getNamespaces() {
  await ensureSchema();
  const s = sql();
  const ns = await s`SELECT id, name, created_at FROM namespaces ORDER BY created_at`;
  const ids = ns.map(n => n.id);
  let typesMap = {};
  if (ids.length) {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const types = await s.query(`SELECT * FROM namespace_custom_types WHERE namespace_id IN (${placeholders})`, ids);
    for (const t of types) {
      if (!typesMap[t.namespace_id]) typesMap[t.namespace_id] = [];
      typesMap[t.namespace_id].push({ key: t.key, label: t.label, icon: t.icon });
    }
  }
  return ns.map(n => ({
    id: n.id,
    name: n.name,
    createdAt: n.created_at instanceof Date ? n.created_at.toISOString() : n.created_at,
    customTypes: typesMap[n.id] || [],
  }));
}

async function getNamespaceById(id) {
  await ensureSchema();
  const rows = await sql()`SELECT id, name, created_at FROM namespaces WHERE id = ${id}`;
  if (!rows[0]) return null;
  const n = rows[0];
  const types = await sql()`SELECT key, label, icon FROM namespace_custom_types WHERE namespace_id = ${id}`;
  return {
    id: n.id,
    name: n.name,
    createdAt: n.created_at instanceof Date ? n.created_at.toISOString() : n.created_at,
    customTypes: types,
  };
}

async function createNamespace(namespace) {
  await ensureSchema();
  await sql()`INSERT INTO namespaces (id, name) VALUES (${namespace.id}, ${namespace.name})`;
}

async function deleteNamespace(id) {
  await ensureSchema();
  await sql()`DELETE FROM namespaces WHERE id = ${id}`;
}

async function addCustomType(namespaceId, customType) {
  await ensureSchema();
  await sql()`INSERT INTO namespace_custom_types (namespace_id, key, label, icon)
    VALUES (${namespaceId}, ${customType.key}, ${customType.label}, ${customType.icon})`;
}

async function deleteCustomType(namespaceId, key) {
  await ensureSchema();
  await sql()`DELETE FROM namespace_custom_types WHERE namespace_id = ${namespaceId} AND key = ${key}`;
}

async function isCustomTypeUsed(namespaceId, key) {
  await ensureSchema();
  const rows = await sql()`SELECT 1 FROM expenses e
    JOIN projects p ON e.project_id = p.id
    WHERE p.namespace_id = ${namespaceId} AND e.type = ${key} LIMIT 1`;
  return rows.length > 0;
}

async function getValidTypes(namespaceId) {
  await ensureSchema();
  const DEFAULT_TYPES = ['SUBWAY', 'TAXI', 'HOTEL', 'TRAIN', 'BUS'];
  const customs = await sql()`SELECT key FROM namespace_custom_types WHERE namespace_id = ${namespaceId}`;
  return [...DEFAULT_TYPES, ...customs.map(t => t.key)];
}

// ─── Projects ────────────────────────────────────────────

function formatProject(p, expenses) {
  return {
    id: p.id,
    namespaceId: p.namespace_id,
    name: p.name,
    description: p.description || '',
    createdAt: p.created_at,
    submittedAt: p.submitted_at ? new Date(p.submitted_at).toISOString() : null,
    expenses: (expenses || []).map(formatExpense),
  };
}

function formatExpense(e) {
  return {
    id: e.id,
    type: e.type,
    amount: typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount,
    date: e.date,
    description: e.description || '',
    reimbursed: !!e.reimbursed,
    pdf: e.pdf,
  };
}

async function getProjectsByNamespace(namespaceId) {
  await ensureSchema();
  const projects = await sql()`SELECT * FROM projects WHERE namespace_id = ${namespaceId} ORDER BY created_at DESC`;
  const ids = projects.map(p => p.id);
  const s = sql();
  let expenseMap = {};
  if (ids.length) {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const expenses = await s.query(`SELECT * FROM expenses WHERE project_id IN (${placeholders}) ORDER BY date`, ids);
    for (const e of expenses) {
      if (!expenseMap[e.project_id]) expenseMap[e.project_id] = [];
      expenseMap[e.project_id].push(e);
    }
  }
  return projects.map(p => formatProject(p, expenseMap[p.id]));
}

async function getProjectById(id) {
  await ensureSchema();
  const rows = await sql()`SELECT * FROM projects WHERE id = ${id}`;
  if (!rows[0]) return null;
  const expenses = await sql()`SELECT * FROM expenses WHERE project_id = ${id} ORDER BY date`;
  return formatProject(rows[0], expenses);
}

async function createProject(project) {
  await ensureSchema();
  await sql()`INSERT INTO projects (id, namespace_id, name, description, created_at)
    VALUES (${project.id}, ${project.namespaceId}, ${project.name}, ${project.description || ''}, ${project.createdAt})`;
}

async function deleteProject(id) {
  await ensureSchema();
  await sql()`DELETE FROM projects WHERE id = ${id}`;
}

async function submitProject(id) {
  await ensureSchema();
  await sql()`UPDATE projects SET submitted_at = NOW() WHERE id = ${id}`;
}

async function revokeProject(id) {
  await ensureSchema();
  await sql()`UPDATE projects SET submitted_at = NULL WHERE id = ${id}`;
}

async function projectHasExpenses(id) {
  await ensureSchema();
  const rows = await sql()`SELECT 1 FROM expenses WHERE project_id = ${id} LIMIT 1`;
  return rows.length > 0;
}

// ─── Expenses ────────────────────────────────────────────
async function addExpense(projectId, expense) {
  await ensureSchema();
  await sql()`INSERT INTO expenses (id, project_id, type, amount, date, description, reimbursed)
    VALUES (${expense.id}, ${projectId}, ${expense.type}, ${expense.amount}, ${expense.date}, ${expense.description || ''}, ${expense.reimbursed || false})`;
}

async function updateExpense(expenseId, fields) {
  await ensureSchema();
  const s = sql();
  const setClauses = [];
  const values = [];
  for (const [key, val] of Object.entries(fields)) {
    setClauses.push(`${key} = $${setClauses.length + 1}`);
    values.push(val);
  }
  values.push(expenseId);
  await s.query(`UPDATE expenses SET ${setClauses.join(', ')} WHERE id = $${values.length}`, values);
}

async function deleteExpense(projectId, expenseId) {
  await ensureSchema();
  await sql()`DELETE FROM expenses WHERE project_id = ${projectId} AND id = ${expenseId}`;
}

async function toggleExpenseReimbursed(expenseId) {
  await ensureSchema();
  const rows = await sql()`UPDATE expenses SET reimbursed = NOT reimbursed WHERE id = ${expenseId} RETURNING *`;
  return rows[0] ? formatExpense(rows[0]) : null;
}

// ─── Import helpers ─────────────────────────────────────
async function importProject(project) {
  await ensureSchema();
  await sql()`INSERT INTO projects (id, namespace_id, name, description, created_at)
    VALUES (${project.id}, ${project.namespaceId}, ${project.name}, ${project.description || ''}, ${project.createdAt})
    ON CONFLICT (id) DO NOTHING`;
}

async function importExpense(projectId, expense) {
  await ensureSchema();
  await sql()`INSERT INTO expenses (id, project_id, type, amount, date, description, reimbursed)
    VALUES (${expense.id}, ${projectId}, ${expense.type}, ${expense.amount}, ${expense.date}, ${expense.description || ''}, ${expense.reimbursed || false})
    ON CONFLICT (id) DO NOTHING`;
}

async function getExpense(projectId, expenseId) {
  await ensureSchema();
  const rows = await sql()`SELECT * FROM expenses WHERE project_id = ${projectId} AND id = ${expenseId}`;
  return rows[0] ? formatExpense(rows[0]) : null;
}

// ─── Invite codes ────────────────────────────────────────
async function getInviteCodes() {
  await ensureSchema();
  return sql()`SELECT code, used FROM invite_codes`;
}

async function findValidInviteCode(code) {
  await ensureSchema();
  const rows = await sql()`SELECT * FROM invite_codes WHERE code = ${code} AND used = FALSE`;
  return rows[0] || null;
}

async function markInviteCodeUsed(code) {
  await ensureSchema();
  await sql()`UPDATE invite_codes SET used = TRUE WHERE code = ${code}`;
}

// ─── Seeding ─────────────────────────────────────────────
async function seedIfEmpty() {
  await ensureSchema();
  // Always attempt seeding — ON CONFLICT DO NOTHING ensures idempotency
  // Seed order: 1. namespaces → 2. custom_types → 3. projects → 4. expenses → 5. users → 6. invite_codes
  const { readFileSync, existsSync } = await import('fs');
  const { fileURLToPath } = await import('url');
  const { dirname, join } = await import('path');
  const __dirname = dirname(fileURLToPath(import.meta.url));

  // Seed namespaces + projects from data.json
  const dataFile = join(__dirname, 'data.json');
  if (existsSync(dataFile)) {
    const data = JSON.parse(readFileSync(dataFile, 'utf-8'));
    for (const ns of data.namespaces || []) {
      await sql()`INSERT INTO namespaces (id, name, created_at) VALUES (${ns.id}, ${ns.name}, ${ns.createdAt || new Date().toISOString()}) ON CONFLICT (id) DO NOTHING`;
      for (const ct of ns.customTypes || []) {
        await sql()`INSERT INTO namespace_custom_types (namespace_id, key, label, icon) VALUES (${ns.id}, ${ct.key}, ${ct.label}, ${ct.icon}) ON CONFLICT (namespace_id, key) DO NOTHING`;
      }
    }
    for (const p of data.projects || []) {
      await sql()`INSERT INTO projects (id, namespace_id, name, description, created_at, submitted_at) VALUES (${p.id}, ${p.namespaceId}, ${p.name}, ${p.description || ''}, ${p.createdAt}, ${p.submittedAt ? new Date(p.submittedAt).toISOString() : null}) ON CONFLICT (id) DO NOTHING`;
      for (const e of p.expenses || []) {
        await sql()`INSERT INTO expenses (id, project_id, type, amount, date, description, reimbursed, pdf) VALUES (${e.id}, ${p.id}, ${e.type}, ${e.amount}, ${e.date}, ${e.description || ''}, ${e.reimbursed || false}, ${e.pdf}) ON CONFLICT (id) DO NOTHING`;
      }
    }
  }

  // Seed users from user.json
  const userFile = join(__dirname, 'user.json');
  if (existsSync(userFile)) {
    const users = JSON.parse(readFileSync(userFile, 'utf-8'));
    for (const u of users) {
      await sql()`INSERT INTO users (id, username, password, namespace_id) VALUES (${u.id}, ${u.username}, ${u.password}, ${u.namespaceId}) ON CONFLICT (id) DO NOTHING`;
    }
  }

  // Seed invite codes
  const inviteFile = join(__dirname, 'invite_codes.json');
  if (existsSync(inviteFile)) {
    const codes = JSON.parse(readFileSync(inviteFile, 'utf-8'));
    for (const c of codes) {
      await sql()`INSERT INTO invite_codes (code, used) VALUES (${c.code}, ${c.used || false}) ON CONFLICT (code) DO NOTHING`;
    }
  }

  console.log('[seed] Data sync complete');
}

export {
  ensureSchema,
  seedIfEmpty,
  // Users
  findUserByUsername,
  createUser,
  updateUserPassword,
  // Auth helpers
  hashPassword,
  verifyPassword,
  isBcryptHash,
  // Namespaces
  getNamespaces,
  getNamespaceById,
  createNamespace,
  deleteNamespace,
  addCustomType,
  deleteCustomType,
  isCustomTypeUsed,
  getValidTypes,
  // Projects
  getProjectsByNamespace,
  getProjectById,
  createProject,
  deleteProject,
  submitProject,
  revokeProject,
  projectHasExpenses,
  // Expenses
  addExpense,
  updateExpense,
  deleteExpense,
  toggleExpenseReimbursed,
  getExpense,
  importProject,
  importExpense,
  // Invite codes
  getInviteCodes,
  findValidInviteCode,
  markInviteCodeUsed,
};
