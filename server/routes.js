import { loadData, saveData, loadUsers, saveUsers, loadInviteCodes, saveInviteCodes } from './db.js';

const LOG_ENDPOINT = 'http://127.0.0.1:7472/ingest/0a9d034e-1e76-432e-94d3-4c7f241917a3';
const SESSION_ID = '737a65';

function debugLog(hypothesisId, location, message, data = {}) {
  fetch(LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': SESSION_ID },
    body: JSON.stringify({ sessionId: SESSION_ID, hypothesisId, location, message, data, timestamp: Date.now() })
  }).catch(() => {});
}

export function applyRoutes(app) {
  // POST /api/login - Login
  app.post('/api/login', (req, res) => {
    try {
      const { username, password } = req.body;
      debugLog('A', 'routes.js:login_entry', 'login request', { username, hasPassword: !!password });
      if (!username || !password) {
        debugLog('A', 'routes.js:login_validation', 'validation failed: empty fields');
        return res.status(400).json({ error: '用户名和密码不能为空' });
      }
      const users = loadUsers();
      debugLog('B', 'routes.js:login_loadUsers', 'loadUsers result', { count: users.length });
      const user = users.find(u => u.username === username && u.password === password);
      if (!user) {
        debugLog('A', 'routes.js:login_userNotFound', 'user not found or wrong password');
        return res.status(401).json({ error: '用户名或密码错误' });
      }
      debugLog('A', 'routes.js:login_success', 'login success', { userId: user.id });
      res.json({ id: user.id, username: user.username, namespaceId: user.namespaceId });
    } catch (e) {
      debugLog('A', 'routes.js:login_error', 'login exception', { error: e.message, stack: e.stack });
      res.status(500).json({ error: '登录失败' });
    }
  });

  // POST /api/register - Register
  app.post('/api/register', (req, res) => {
    try {
      const { username, password, inviteCode } = req.body;
      debugLog('C', 'routes.js:register_entry', 'register request', { username, hasPassword: !!password, hasInviteCode: !!inviteCode });
      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
      }
      if (!inviteCode) {
        return res.status(400).json({ error: '邀请码不能为空' });
      }
      const codes = loadInviteCodes();
      debugLog('D', 'routes.js:register_loadCodes', 'loadInviteCodes result', { count: codes.length, inviteCode });
      const validCode = codes.find(c => c.code === inviteCode && !c.used);
      if (!validCode) {
        debugLog('D', 'routes.js:register_badCode', 'invalid or used invite code');
        return res.status(403).json({ error: '邀请码无效或已使用' });
      }
      const users = loadUsers();
      debugLog('E', 'routes.js:register_loadUsers', 'loadUsers result', { count: users.length });
      if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: '用���名已存在' });
      }
      const data = loadData();
      debugLog('C', 'routes.js:register_loadData', 'loadData result', { namespaces: data.namespaces.length, projects: data.projects.length });
      const nsId = `ns_${username}_${Date.now()}`;
      const user = {
        id: Date.now().toString(),
        username,
        password,
        namespaceId: nsId,
      };
      users.push(user);
      saveUsers(users);
      debugLog('E', 'routes.js:register_saveUsers', 'saveUsers called');
      // Mark invite code as used
      validCode.used = true;
      saveInviteCodes(codes);
      debugLog('D', 'routes.js:register_saveCodes', 'saveInviteCodes called');
      data.namespaces.push({ id: nsId, name: `${username} 的空间`, createdAt: new Date().toISOString() });
      saveData(data);
      debugLog('C', 'routes.js:register_saveData', 'saveData called');
      res.status(201).json({ id: user.id, username: user.username, namespaceId: user.namespaceId });
    } catch (e) {
      debugLog('C', 'routes.js:register_error', 'register exception', { error: e.message, stack: e.stack });
      res.status(500).json({ error: '注册失败' });
    }
  });

  // GET /api/namespaces - List all namespaces
  app.get('/api/namespaces', (req, res) => {
    try {
      const data = loadData();
      res.json(data.namespaces);
    } catch (e) {
      res.status(500).json({ error: 'Failed to load namespaces' });
    }
  });

  // POST /api/namespaces - Create a new namespace
  app.post('/api/namespaces', (req, res) => {
    try {
      const data = loadData();
      const { name } = req.body;
      if (!name?.trim()) {
        return res.status(400).json({ error: 'Namespace name is required' });
      }
      const namespace = {
        id: Date.now().toString(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };
      data.namespaces.push(namespace);
      saveData(data);
      res.status(201).json(namespace);
    } catch (e) {
      res.status(500).json({ error: 'Failed to create namespace' });
    }
  });

  // DELETE /api/namespaces/:id - Delete a namespace
  app.delete('/api/namespaces/:id', (req, res) => {
    try {
      const data = loadData();
      if (req.params.id === 'default') {
        return res.status(400).json({ error: 'Cannot delete default namespace' });
      }
      data.namespaces = data.namespaces.filter(n => n.id !== req.params.id);
      data.projects = data.projects.filter(p => p.namespaceId !== req.params.id);
      saveData(data);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete namespace' });
    }
  });

  // GET /api - Get projects for a namespace
  app.get('/api', (req, res) => {
    try {
      const data = loadData();
      // If user is logged in, force their namespace
      const userNamespace = req.headers['x-user-namespace'];
      const namespaceId = userNamespace || req.query.namespace || 'default';
      const filteredProjects = data.projects.filter(p => p.namespaceId === namespaceId);
      const namespaces = userNamespace ? data.namespaces.filter(n => n.id === userNamespace) : data.namespaces;
      res.json({ namespaces, projects: filteredProjects });
    } catch (e) {
      res.status(500).json({ error: 'Failed to load data' });
    }
  });

  // POST /api/projects - Create a new project in a namespace
  app.post('/api/projects', (req, res) => {
    try {
      const data = loadData();
      debugLog('F', 'routes.js:projects_loadData', 'loadData result', { namespaces: data.namespaces.length, projects: data.projects.length });
      const { name, description, namespaceId } = req.body;
      debugLog('F', 'routes.js:projects_entry', 'create project request', { name, description, namespaceId });
      if (!name?.trim()) {
        return res.status(400).json({ error: 'Project name is required' });
      }
      const nsId = namespaceId || 'default';
      if (!data.namespaces.find(n => n.id === nsId)) {
        debugLog('F', 'routes.js:projects_badNs', 'namespace not found', { nsId, availableNs: data.namespaces.map(n => n.id) });
        return res.status(400).json({ error: 'Namespace not found' });
      }
      const project = {
        id: Date.now().toString(),
        namespaceId: nsId,
        name: name.trim(),
        description: description || '',
        createdAt: new Date().toISOString().split('T')[0],
        submittedAt: null,
        expenses: [],
      };
      data.projects.push(project);
      saveData(data);
      debugLog('F', 'routes.js:projects_success', 'project created', { projectId: project.id });
      res.status(201).json(project);
    } catch (e) {
      debugLog('F', 'routes.js:projects_error', 'create project exception', { error: e.message, stack: e.stack });
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  // DELETE /api/projects/:id - Delete a project
  app.delete('/api/projects/:id', (req, res) => {
    try {
      const data = loadData();
      const idx = data.projects.findIndex(p => p.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Project not found' });
      data.projects.splice(idx, 1);
      saveData(data);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });

  // PUT /api/projects/:id/submit - Submit a project
  app.put('/api/projects/:id/submit', (req, res) => {
    try {
      const data = loadData();
      const idx = data.projects.findIndex(p => p.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Project not found' });
      data.projects[idx].submittedAt = new Date().toISOString();
      saveData(data);
      res.json(data.projects[idx]);
    } catch (e) {
      res.status(500).json({ error: 'Failed to submit project' });
    }
  });

  // PUT /api/projects/:id/revoke - Revoke submission
  app.put('/api/projects/:id/revoke', (req, res) => {
    try {
      const data = loadData();
      const idx = data.projects.findIndex(p => p.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Project not found' });
      data.projects[idx].submittedAt = null;
      saveData(data);
      res.json(data.projects[idx]);
    } catch (e) {
      res.status(500).json({ error: 'Failed to revoke submission' });
    }
  });

  // POST /api/projects/:id/expenses - Add an expense
  app.post('/api/projects/:id/expenses', (req, res) => {
    try {
      const data = loadData();
      const project = data.projects.find(p => p.id === req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      if (project.submittedAt) return res.status(400).json({ error: 'Cannot add expense to submitted project' });

      const { type, amount, date, description } = req.body;
      if (!type || amount == null || !date) {
        return res.status(400).json({ error: 'type, amount, and date are required' });
      }

      const expense = {
        id: Date.now().toString(),
        type,
        amount: parseFloat(amount),
        date,
        description: description || '',
        reimbursed: false,
        pdf: null,
      };
      project.expenses.push(expense);
      saveData(data);
      res.status(201).json(expense);
    } catch (e) {
      res.status(500).json({ error: 'Failed to add expense' });
    }
  });

  // PUT /api/projects/:id/expenses/:eid/toggle - Toggle reimbursed
  app.put('/api/projects/:id/expenses/:eid/toggle', (req, res) => {
    try {
      const data = loadData();
      const project = data.projects.find(p => p.id === req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      const expense = project.expenses.find(e => e.id === req.params.eid);
      if (!expense) return res.status(404).json({ error: 'Expense not found' });
      expense.reimbursed = !expense.reimbursed;
      saveData(data);
      res.json(expense);
    } catch (e) {
      res.status(500).json({ error: 'Failed to toggle reimbursed' });
    }
  });

  // PUT /api/projects/:id/expenses/:eid - Update an expense
  app.put('/api/projects/:id/expenses/:eid', (req, res) => {
    try {
      const data = loadData();
      const project = data.projects.find(p => p.id === req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      if (project.submittedAt) return res.status(400).json({ error: 'Cannot update expense in submitted project' });
      const expense = project.expenses.find(e => e.id === req.params.eid);
      if (!expense) return res.status(404).json({ error: 'Expense not found' });

      const { type, amount, date, description, reimbursed } = req.body;
      if (type) expense.type = type;
      if (amount != null) expense.amount = parseFloat(amount);
      if (date) expense.date = date;
      if (description !== undefined) expense.description = description;
      if (reimbursed !== undefined) expense.reimbursed = reimbursed;

      saveData(data);
      res.json(expense);
    } catch (e) {
      res.status(500).json({ error: 'Failed to update expense' });
    }
  });

  // DELETE /api/projects/:id/expenses/:eid - Delete an expense
  app.delete('/api/projects/:id/expenses/:eid', (req, res) => {
    try {
      const data = loadData();
      const project = data.projects.find(p => p.id === req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      if (project.submittedAt) return res.status(400).json({ error: 'Cannot delete expense from submitted project' });
      project.expenses = project.expenses.filter(e => e.id !== req.params.eid);
      saveData(data);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  });
}
