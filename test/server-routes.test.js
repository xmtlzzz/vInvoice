import assert from 'node:assert/strict';
import test from 'node:test';

test('server routes module loads and exports applyRoutes', async () => {
  const routes = await import('../server/routes.js');

  assert.equal(typeof routes.applyRoutes, 'function');
});
