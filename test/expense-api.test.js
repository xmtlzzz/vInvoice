import assert from 'node:assert/strict';
import test from 'node:test';

import { createExpenseRequest, getExpenseFormState } from '../src/context/expenseApi.js';

test('createExpenseRequest returns the created expense payload', async () => {
  const expense = {
    id: 'exp_1',
    type: 'SUBWAY',
    amount: 88.5,
    date: '2026-04-07',
    description: 'metro',
    reimbursed: false,
  };

  const result = await createExpenseRequest({
    apiBase: '/api',
    projectId: 'proj_1',
    expense,
    fetchImpl: async (url, options) => {
      assert.equal(url, '/api/projects/proj_1/expenses');
      assert.equal(options.method, 'POST');
      assert.equal(options.headers['Content-Type'], 'application/json');
      assert.equal(options.body, JSON.stringify(expense));

      return new Response(JSON.stringify(expense), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  assert.deepEqual(result, expense);
});

test('createExpenseRequest throws the server error for failed requests', async () => {
  await assert.rejects(
    () =>
      createExpenseRequest({
        apiBase: '/api',
        projectId: 'proj_1',
        expense: {
          type: 'SUBWAY',
          amount: 88.5,
          date: '2026-04-07',
          description: 'metro',
        },
        fetchImpl: async () =>
          new Response(JSON.stringify({ error: 'Cannot add expense to submitted project' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }),
      }),
    /Cannot add expense to submitted project/,
  );
});

test('createExpenseRequest converts network failures into a stable error', async () => {
  await assert.rejects(
    () =>
      createExpenseRequest({
        apiBase: '/api',
        projectId: 'proj_1',
        expense: {
          type: 'SUBWAY',
          amount: 88.5,
          date: '2026-04-07',
          description: 'metro',
        },
        fetchImpl: async () => {
          throw new TypeError('fetch failed');
        },
      }),
    /Failed to connect to server/,
  );
});

test('getExpenseFormState returns a blank create form by default', () => {
  const today = '2026-04-07';

  assert.deepEqual(getExpenseFormState(null, today), {
    type: 'SUBWAY',
    amount: '',
    date: today,
    description: '',
  });
});

test('getExpenseFormState prefills edit values from the current expense', () => {
  assert.deepEqual(
    getExpenseFormState(
      {
        type: 'HOTEL',
        amount: 320,
        date: '2026-04-01',
        description: 'hotel',
      },
      '2026-04-07',
    ),
    {
      type: 'HOTEL',
      amount: '320',
      date: '2026-04-01',
      description: 'hotel',
    },
  );
});
