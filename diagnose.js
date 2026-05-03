// Diagnose: check what data is actually in the database
import { neon } from '@neondatabase/serverless';
import { readFileSync, existsSync } from 'fs';

const url = process.env.DATABASE_URL || readFileSync('.env.local', 'utf-8').match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];
if (!url) {
  console.error('DATABASE_URL not found!');
  process.exit(1);
}

const sql = neon(url);

async function main() {
  console.log('=== Database Diagnosis ===\n');

  // Namespaces
  const ns = await sql`SELECT id, name FROM namespaces ORDER BY id`;
  console.log(`Namespaces (${ns.length}):`);
  ns.forEach(n => console.log(`  - ${n.id}: ${n.name}`));

  // Users
  const users = await sql`SELECT id, username, namespace_id FROM users ORDER BY id`;
  console.log(`\nUsers (${users.length}):`);
  users.forEach(u => console.log(`  - ${u.id}: ${u.username} → ns=${u.namespace_id}`));

  // Invite codes
  const codes = await sql`SELECT code, used FROM invite_codes ORDER BY code`;
  console.log(`\nInvite Codes (${codes.length}):`);
  codes.forEach(c => console.log(`  - ${c.code}: used=${c.used}`));

  // Projects
  const projects = await sql`SELECT id, namespace_id, name FROM projects ORDER BY id`;
  console.log(`\nProjects (${projects.length}):`);
  projects.forEach(p => console.log(`  - ${p.id}: "${p.name}" → ns=${p.namespace_id}`));

  // Expenses
  const expenses = await sql`SELECT id, project_id, type, amount FROM expenses ORDER BY id`;
  console.log(`\nExpenses (${expenses.length}):`);
  expenses.forEach(e => console.log(`  - ${e.id}: ${e.type} ¥${e.amount} → project=${e.project_id}`));

  console.log('\n=== Diagnosis Complete ===');
  await sql`SELECT 1`; // close connection
}

main().catch(e => console.error('Diagnosis error:', e));
