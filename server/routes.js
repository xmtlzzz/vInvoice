import {
  findUserByUsername, createUser, updateUserPassword,
  hashPassword, verifyPassword, isBcryptHash,
  getNamespaces, getNamespaceById, createNamespace, deleteNamespace,
  addCustomType, deleteCustomType, isCustomTypeUsed, getValidTypes,
  getProjectsByNamespace, getProjectById, createProject, deleteProject,
  submitProject, revokeProject,
  addExpense, updateExpense, deleteExpense, toggleExpenseReimbursed, getExpense,
  findValidInviteCode, markInviteCodeUsed,
} from './db.js';

function isValidDate(str) {
  if (!str || typeof str !== 'string') return false;
  const d = new Date(str);
  return d instanceof Date && !isNaN(d) && /^\d{4}-\d{2}-\d{2}$/.test(str);
}

export function applyRoutes(app) {
  // POST /api/login
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
      }
      const user = await findUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      let valid = false;
      if (isBcryptHash(user.password)) {
        valid = await verifyPassword(password, user.password);
      } else {
        valid = password === user.password;
        if (valid) {
          const hashed = await hashPassword(password);
          await updateUserPassword(user.id, hashed);
        }
      }

      if (!valid) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }
      res.json({ id: user.id, username: user.username, namespaceId: user.namespace_id });
    } catch (e) {
      console.error('Login error:', e);
      res.status(500).json({ error: '登录失败' });
    }
  });

  // POST /api/register
  app.post('/api/register', async (req, res) => {
    try {
      const { username, password, inviteCode } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
      }
      if (username.length > 50) {
        return res.status(400).json({ error: '用户名不能超过50个字符' });
      }
      if (!inviteCode) {
        return res.status(400).json({ error: '邀请码不能为空' });
      }
      const validCode = await findValidInviteCode(inviteCode);
      if (!validCode) {
        return res.status(403).json({ error: '邀请码无效或已使用' });
      }
      const existing = await findUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: '用户名已存在' });
      }
      const nsId = `ns_${username}_${Date.now()}`;
      const user = {
        id: Date.now().toString(),
        username,
        password: await hashPassword(password),
        namespaceId: nsId,
      };
      await createUser(user);
      await markInviteCodeUsed(inviteCode);
      await createNamespace({ id: nsId, name: `${username} 的空间` });
      res.status(201).json({ id: user.id, username: user.username, namespaceId: user.namespaceId });
    } catch (e) {
      console.error('Register error:', e);
      res.status(500).json({ error: '注册失败' });
    }
  });

  // GET /api/namespaces
  app.get('/api/namespaces', async (req, res) => {
    try {
      const namespaces = await getNamespaces();
      res.json(namespaces);
    } catch (e) {
      console.error('List namespaces error:', e);
      res.status(500).json({ error: 'Failed to load namespaces' });
    }
  });

  // POST /api/namespaces
  app.post('/api/namespaces', async (req, res) => {
    try {
      const { name } = req.body;
      if (!name?.trim()) {
        return res.status(400).json({ error: 'Namespace name is required' });
      }
      const namespace = {
        id: Date.now().toString(),
        name: name.trim(),
      };
      await createNamespace(namespace);
      res.status(201).json({
        id: namespace.id,
        name: namespace.name,
        createdAt: new Date().toISOString(),
        customTypes: [],
      });
    } catch (e) {
      console.error('Create namespace error:', e);
      res.status(500).json({ error: 'Failed to create namespace' });
    }
  });

  // DELETE /api/namespaces/:id
  app.delete('/api/namespaces/:id', async (req, res) => {
    try {
      if (req.params.id === 'default') {
        return res.status(400).json({ error: 'Cannot delete default namespace' });
      }
      await deleteNamespace(req.params.id);
      res.json({ success: true });
    } catch (e) {
      console.error('Delete namespace error:', e);
      res.status(500).json({ error: 'Failed to delete namespace' });
    }
  });

  // POST /api/custom-types
  app.post('/api/custom-types', async (req, res) => {
    try {
      const userNamespace = req.headers['x-user-namespace'];
      const namespaceId = userNamespace || 'default';
      const ns = await getNamespaceById(namespaceId);
      if (!ns) return res.status(404).json({ error: 'Namespace not found' });

      const { key, label, icon } = req.body;
      if (!key?.trim() || !label?.trim() || !icon?.trim()) {
        return res.status(400).json({ error: 'key, label, and icon are required' });
      }
      if (!/^[A-Z][A-Z0-9_]*$/.test(key.trim())) {
        return res.status(400).json({ error: 'key必须以大写字母开头，只能包含大写字母、数字和下划线' });
      }
      if (label.trim().length > 20) {
        return res.status(400).json({ error: '类型名称不能超过20个字符' });
      }

      const existingTypes = ns.customTypes || [];
      if (existingTypes.find(t => t.key === key.trim())) {
        return res.status(400).json({ error: '该类型key已存在' });
      }

      const customType = { key: key.trim(), label: label.trim(), icon: icon.trim() };
      await addCustomType(namespaceId, customType);
      res.status(201).json(customType);
    } catch (e) {
      console.error('Add custom type error:', e);
      res.status(500).json({ error: 'Failed to add custom type' });
    }
  });

  // DELETE /api/custom-types/:key
  app.delete('/api/custom-types/:key', async (req, res) => {
    try {
      const userNamespace = req.headers['x-user-namespace'];
      const namespaceId = userNamespace || 'default';
      const ns = await getNamespaceById(namespaceId);
      if (!ns) return res.status(404).json({ error: 'Namespace not found' });

      const existingTypes = ns.customTypes || [];
      if (!existingTypes.find(t => t.key === req.params.key)) {
        return res.status(404).json({ error: 'Custom type not found' });
      }

      const used = await isCustomTypeUsed(namespaceId, req.params.key);
      if (used) {
        return res.status(400).json({ error: '该类型已被费用使用，无法删除' });
      }

      await deleteCustomType(namespaceId, req.params.key);
      res.json({ success: true });
    } catch (e) {
      console.error('Delete custom type error:', e);
      res.status(500).json({ error: 'Failed to delete custom type' });
    }
  });

  // GET /api
  app.get('/api', async (req, res) => {
    try {
      const userNamespace = req.headers['x-user-namespace'];
      const namespaceId = userNamespace || req.query.namespace || 'default';
      const projects = await getProjectsByNamespace(namespaceId);
      const namespaces = userNamespace
        ? [await getNamespaceById(userNamespace)].filter(Boolean)
        : await getNamespaces();
      res.json({ namespaces, projects });
    } catch (e) {
      console.error('Get data error:', e);
      res.status(500).json({ error: 'Failed to load data' });
    }
  });

  // POST /api/projects
  app.post('/api/projects', async (req, res) => {
    try {
      const { name, description, namespaceId } = req.body;
      if (!name?.trim()) {
        return res.status(400).json({ error: 'Project name is required' });
      }
      if (name.trim().length > 100) {
        return res.status(400).json({ error: '项目名称不能超过100个字符' });
      }
      if (description && description.length > 500) {
        return res.status(400).json({ error: '项目描述不能超过500个字符' });
      }
      const nsId = namespaceId || 'default';
      const ns = await getNamespaceById(nsId);
      if (!ns) {
        return res.status(400).json({ error: 'Namespace not found' });
      }
      const project = {
        id: Date.now().toString(),
        namespaceId: nsId,
        name: name.trim(),
        description: description || '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      await createProject(project);
      res.status(201).json({
        ...project,
        submittedAt: null,
        expenses: [],
      });
    } catch (e) {
      console.error('Create project error:', e);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  // DELETE /api/projects/:id
  app.delete('/api/projects/:id', async (req, res) => {
    try {
      const project = await getProjectById(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      await deleteProject(req.params.id);
      res.json({ success: true });
    } catch (e) {
      console.error('Delete project error:', e);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });

  // PUT /api/projects/:id/submit
  app.put('/api/projects/:id/submit', async (req, res) => {
    try {
      const project = await getProjectById(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      if (!project.expenses || project.expenses.length === 0) {
        return res.status(400).json({ error: '项目没有费用记录，无法提交' });
      }
      await submitProject(req.params.id);
      const updated = await getProjectById(req.params.id);
      res.json(updated);
    } catch (e) {
      console.error('Submit project error:', e);
      res.status(500).json({ error: 'Failed to submit project' });
    }
  });

  // PUT /api/projects/:id/revoke
  app.put('/api/projects/:id/revoke', async (req, res) => {
    try {
      const project = await getProjectById(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      await revokeProject(req.params.id);
      const updated = await getProjectById(req.params.id);
      res.json(updated);
    } catch (e) {
      console.error('Revoke project error:', e);
      res.status(500).json({ error: 'Failed to revoke submission' });
    }
  });

  // POST /api/projects/:id/expenses
  app.post('/api/projects/:id/expenses', async (req, res) => {
    try {
      const project = await getProjectById(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      if (project.submittedAt) return res.status(400).json({ error: 'Cannot add expense to submitted project' });

      const { type, amount, date, description } = req.body;
      if (!type || amount == null || !date) {
        return res.status(400).json({ error: 'type, amount, and date are required' });
      }
      const validTypes = await getValidTypes(project.namespaceId);
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: '无效的费用类型' });
      }
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 99999999.99) {
        return res.status(400).json({ error: '金额无效，请输入有效的正数' });
      }
      if (!isValidDate(date)) {
        return res.status(400).json({ error: '日期格式无效' });
      }
      if (description && description.length > 200) {
        return res.status(400).json({ error: '描述不能超过200个字符' });
      }

      const expense = {
        id: Date.now().toString(),
        type,
        amount: parsedAmount,
        date,
        description: description || '',
        reimbursed: false,
      };
      await addExpense(req.params.id, expense);
      res.status(201).json({ ...expense, pdf: null });
    } catch (e) {
      console.error('Add expense error:', e);
      res.status(500).json({ error: 'Failed to add expense' });
    }
  });

  // PUT /api/projects/:id/expenses/:eid/toggle
  app.put('/api/projects/:id/expenses/:eid/toggle', async (req, res) => {
    try {
      const project = await getProjectById(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      const existing = await getExpense(req.params.id, req.params.eid);
      if (!existing) return res.status(404).json({ error: 'Expense not found' });
      const updated = await toggleExpenseReimbursed(req.params.eid);
      res.json(updated);
    } catch (e) {
      console.error('Toggle expense error:', e);
      res.status(500).json({ error: 'Failed to toggle reimbursed' });
    }
  });

  // PUT /api/projects/:id/expenses/:eid
  app.put('/api/projects/:id/expenses/:eid', async (req, res) => {
    try {
      const project = await getProjectById(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      if (project.submittedAt) return res.status(400).json({ error: 'Cannot update expense in submitted project' });
      const existing = await getExpense(req.params.id, req.params.eid);
      if (!existing) return res.status(404).json({ error: 'Expense not found' });

      const { type, amount, date, description, reimbursed } = req.body;
      const fields = {};

      if (type) {
        const validTypes = await getValidTypes(project.namespaceId);
        if (!validTypes.includes(type)) {
          return res.status(400).json({ error: '无效的费用类型' });
        }
        fields.type = type;
      }
      if (amount != null) {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 99999999.99) {
          return res.status(400).json({ error: '金额无效，请输入有效的正数' });
        }
        fields.amount = parsedAmount;
      }
      if (date) {
        if (!isValidDate(date)) {
          return res.status(400).json({ error: '日期格式无效' });
        }
        fields.date = date;
      }
      if (description !== undefined) {
        if (description.length > 200) {
          return res.status(400).json({ error: '描述不能超过200个字符' });
        }
        fields.description = description;
      }
      if (reimbursed !== undefined) fields.reimbursed = reimbursed;

      await updateExpense(req.params.eid, fields);

      const updated = { ...existing, ...fields };
      res.json(updated);
    } catch (e) {
      console.error('Update expense error:', e);
      res.status(500).json({ error: 'Failed to update expense' });
    }
  });

  // DELETE /api/projects/:id/expenses/:eid
  app.delete('/api/projects/:id/expenses/:eid', async (req, res) => {
    try {
      const project = await getProjectById(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      if (project.submittedAt) return res.status(400).json({ error: 'Cannot delete expense from submitted project' });
      await deleteExpense(req.params.id, req.params.eid);
      res.json({ success: true });
    } catch (e) {
      console.error('Delete expense error:', e);
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  });
}
