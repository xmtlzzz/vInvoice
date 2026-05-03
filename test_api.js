const http = require('http');

function request(method, path, body, headers) {
  return new Promise((resolve, reject) => {
    const url = new URL('http://localhost:3001' + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
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
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  // Wait for server to be ready
  for (let i = 0; i < 10; i++) {
    try {
      await request('GET', '/api');
      break;
    } catch (e) {
      if (i === 9) { console.log('Server not ready'); return; }
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  const tests = [
    ['A: Login as sz', 'POST', '/api/login', '{"username":"sz","password":"sz123456"}', {}],
    ['B: Login as admin', 'POST', '/api/login', '{"username":"admin","password":"admin123"}', {}],
    ['C: Get sz projects', 'GET', '/api?namespace=ns_sz', null, { 'x-user-namespace': 'ns_sz' }],
    ['D: Add expense', 'POST', '/api/projects/proj_sz_001/expenses', '{"type":"TAXI","amount":50,"date":"2026-05-03","description":"test expense"}', {}],
    ['E: Create custom type', 'POST', '/api/custom-types', '{"key":"TEST_TYPE","label":"测试类型","icon":"Plane"}', { 'x-user-namespace': 'ns_sz' }],
    ['F: Delete custom type', 'DELETE', '/api/custom-types/TEST_TYPE', null, { 'x-user-namespace': 'ns_sz' }],
  ];

  for (const [name, method, path, body, headers] of tests) {
    console.log(`\n=== TEST ${name} ===`);
    try {
      const res = await request(method, path, body, headers);
      console.log('HTTP Status:', res.status);
      console.log('Response:', res.body);
    } catch (e) {
      console.log('ERROR:', e.message);
    }
  }
  console.log('\n=== ALL TESTS COMPLETE ===');
  process.exit(0);
}

run();
