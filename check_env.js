// Quick script to check Vercel env vars for DATABASE_URL
import { execSync } from 'child_process';

console.log('=== Checking Vercel Environment Variables ===\n');

try {
  // List all env vars
  console.log('--- All environments ---');
  const all = execSync('vercel env ls', { encoding: 'utf-8', stdio: 'pipe' });
  console.log(all);
} catch (e) {
  console.error('vercel env ls failed:', e.stderr || e.message);
}

console.log('\n=== Checking local .env files ===');
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const files = ['.env.local', '.env', 'server/.env.local'];
for (const f of files) {
  const path = join(process.cwd(), f);
  if (existsSync(path)) {
    console.log(`\n${f} keys:`);
    const content = readFileSync(path, 'utf-8');
    const lines = content.split('\n').filter(l => l && !l.startsWith('#'));
    for (const line of lines) {
      const key = line.split('=')[0];
      console.log(`  - ${key}`);
    }
  } else {
    console.log(`\n${f}: not found`);
  }
}
