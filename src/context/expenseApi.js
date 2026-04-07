const DEFAULT_ADD_EXPENSE_ERROR = 'Failed to add expense';
const DEFAULT_NETWORK_ERROR = 'Failed to connect to server';

function getFallbackErrorMessage(response, fallbackMessage) {
  return `${fallbackMessage} (HTTP ${response.status})`;
}

async function readJsonResponse(response, fallbackMessage) {
  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error(getFallbackErrorMessage(response, fallbackMessage));
      }

      throw new Error('Invalid server response');
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || getFallbackErrorMessage(response, fallbackMessage));
  }

  return data;
}

export async function createExpenseRequest({
  apiBase,
  projectId,
  expense,
  headers = {},
  fetchImpl = fetch,
}) {
  let response;

  try {
    response = await fetchImpl(`${apiBase}/projects/${projectId}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(expense),
    });
  } catch {
    throw new Error(DEFAULT_NETWORK_ERROR);
  }

  return readJsonResponse(response, DEFAULT_ADD_EXPENSE_ERROR);
}

export function getExpenseFormState(expense, today = new Date().toISOString().split('T')[0]) {
  return {
    type: expense?.type || 'SUBWAY',
    amount: expense?.amount?.toString() || '',
    date: expense?.date || today,
    description: expense?.description || '',
  };
}
