import { spawn } from 'child_process';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = join(__dirname, 'server');

function httpRequest(method, path, body, headers) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('Timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

async function waitForServer() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await httpRequest('GET', '/api');
      if (res) return true;
    } catch (e) {
      if (i === 19) throw new Error('Server did not start: ' + e.message);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  console.log('Starting Express server...');

  const server = spawn('node', ['server.js'], {
    cwd: SERVER_DIR,
    stdio: 'pipe',
    detached: false,
  });

  server.stdout.on('data', (data) => {
    process.stdout.write('[server] ' + data.toString());
  });
  server.stderr.on('data', (data) => {
    process.stderr.write('[server-err] ' + data.toString());
  });

  server.on('error', (err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });

  // Wait for server to be ready
  console.log('Waiting for server to be ready...');
  await waitForServer();
  console.log('Server is ready!\n');

  // Run all tests
  const tests = [
    { name: 'A: Login as sz', method: 'POST', path: '/api/login', body: JSON.stringify({ username: 'sz', password: 'sz123456' }), headers: {} },
    { name: 'B: Login as admin', method: 'POST', path: '/api/login', body: JSON.stringify({ username: 'admin', password: 'admin123' }), headers: {} },
    { name: 'C: Get sz projects', method: 'GET', path: '/api?namespace=ns_sz', body: null, headers: { 'x-user-namespace': 'ns_sz' } },
    { name: 'D: Add expense', method: 'POST', path: '/api/projects/proj_sz_001/expenses', body: JSON.stringify({ type: 'TAXI', amount: 50, date: '2026-05-03', description: 'test expense' }), headers: {} },
    { name: 'E: Create custom type', method: 'POST', path: '/api/custom-types', body: JSON.stringify({ key: 'TEST_TYPE', label: '测试类型', icon: 'Plane' }), headers: { 'x-user-namespace': 'ns_sz' } },
    { name: 'F: Delete custom type', method: 'DELETE', path: '/api/custom-types/TEST_TYPE', body: null, headers: { 'x-user-namespace': 'ns_sz' } },
  ];

  for (const test of tests) {
    console.log(`=== TEST ${test.name} ===`);
    try {
      const res = await httpRequest(test.method, test.path, test.body, test.headers);
      console.log('HTTP Status:', res.status);
      console.log('Response:', res.body);
    } catch (e) {
      console.log('ERROR:', e.message);
    }
    console.log('');
  }

  console.log('=== ALL TESTS COMPLETE ===');

  // Cleanup
  server.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
