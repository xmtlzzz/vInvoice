import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, 'server', 'server.js');

function test(name, opts) {
  const { method = 'GET', path, body, headers = {} } = opts;
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path,
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            console.log(name + ': ' + res.statusCode + ' ' + JSON.stringify(JSON.parse(d)));
          } catch (e) {
            console.log(name + ': ' + res.statusCode + ' ' + d);
          }
          resolve();
        });
      }
    );
    req.on('error', (e) => {
      console.log(name + ': ERR ' + e.message);
      resolve();
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function waitForServer(retries = 30) {
  return new Promise((resolve, reject) => {
    function check(n) {
      if (n <= 0) return reject(new Error('Server did not start'));
      http.get('http://localhost:3001/api/namespaces', (res) => {
        resolve();
      }).on('error', () => {
        setTimeout(() => check(n - 1), 500);
      });
    }
    check(retries);
  });
}

console.log('Starting vInvoice server...');
const server = spawn('node', [serverPath], {
  cwd: join(__dirname, 'server'),
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' },
});

waitForServer().then(async () => {
  console.log('Server is ready.\n');
  console.log('=== TESTING vInvoice API ENDPOINTS ===\n');

  // Test 1: Login as sz
  await test('1. Login sz', { method: 'POST', path: '/api/login', body: { username: 'sz', password: 'sz123456' } });

  // Test 2: Login as admin (plaintext password)
  await test('2. Login admin', { method: 'POST', path: '/api/login', body: { username: 'admin', password: 'admin123' } });

  // Test 3: Get namespace data for sz
  await test('3. Get namespace (x-user-namespace: ns_sz)', {
    path: '/api?namespace=ns_sz',
    headers: { 'x-user-namespace': 'ns_sz' },
  });

  // Test 4: Get namespace data for admin
  await test('4. Get namespace (x-user-namespace: ns_admin)', {
    path: '/api',
    headers: { 'x-user-namespace': 'ns_admin' },
  });

  // Test 5: Add expense to proj_sz_001
  await test('5. Add expense (TAXI 50 to proj_sz_001)', {
    method: 'POST',
    path: '/api/projects/proj_sz_001/expenses',
    body: { type: 'TAXI', amount: 50, date: '2026-05-03', description: 'test taxi ride' },
  });

  // Test 6: Add custom type to ns_sz
  const customKey = 'QT_' + Date.now();
  await test('6. Add custom type (' + customKey + ')', {
    method: 'POST',
    path: '/api/custom-types',
    headers: { 'x-user-namespace': 'ns_sz' },
    body: { key: customKey, label: '快速测试', icon: 'Plane' },
  });

  // Test 7: List all namespaces
  await test('7. List all namespaces', { path: '/api/namespaces' });

  // Test 8: Toggle reimbursed
  await test('8. Toggle reimbursed (exp_hotel_001)', {
    method: 'PUT',
    path: '/api/projects/proj_sz_001/expenses/exp_hotel_001/toggle',
  });

  // Test 9: Submit project
  await test('9. Submit project (proj_sz_001)', {
    method: 'PUT',
    path: '/api/projects/proj_sz_001/submit',
  });

  // Test 10: Revoke project
  await test('10. Revoke project (proj_sz_001)', {
    method: 'PUT',
    path: '/api/projects/proj_sz_001/revoke',
  });

  // Test 11: Delete the custom type we just created
  await test('11. Delete custom type (' + customKey + ')', {
    method: 'DELETE',
    path: '/api/custom-types/' + customKey,
    headers: { 'x-user-namespace': 'ns_sz' },
  });

  // Test 12: Login with wrong password (negative test)
  await test('12. Login wrong password', { method: 'POST', path: '/api/login', body: { username: 'sz', password: 'wrong' } });

  // Test 13: Register without invite code (negative test)
  await test('13. Register no invite code', { method: 'POST', path: '/api/register', body: { username: 'testuser', password: 'test123' } });

  // Test 14: Delete expense (cleanup)
  await test('14. Delete expense (exp_taxi_001)', {
    method: 'DELETE',
    path: '/api/projects/proj_sz_001/expenses/exp_taxi_001',
  });

  console.log('\n=== ALL TESTS COMPLETE ===');
  server.kill();
  process.exit(0);
}).catch((e) => {
  console.error('Error:', e.message);
  server.kill();
  process.exit(1);
});
