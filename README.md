# vInvoice

出差费用管理工具，支持多用户、多项目、多费用类型的统一化管理。

## 技术栈

- **前端**: React 18 + React Router v6 + Vite 5 + Tailwind CSS 3.4 + Lucide React
- **后端**: Express 4 + bcryptjs
- **数据库**: Neon PostgreSQL（Serverless）
- **部署**: Vercel（Serverless Functions + 静态托管）

## 主要功能

- 用户注册/登录（邀请码机制，密码 bcrypt 加密）
- 多命名空间隔离，数据完全独立
- 项目创建、提交、撤销，支持费用报销跟踪
- 费用记录：类型、金额、日期、描述、报销状态
- 统计面板：月度费用汇总 + 类型分布
- 自定义费用类型（支持图标选择，实时同步）
- 系统默认类型管理（SUBWAY/TAXI/HOTEL/TRAIN/BUS）
- 数据导出/导入（JSON 格式，用于备份和迁移）

## 本地开发

```bash
# 安装依赖
npm install
cd server && npm install && cd ..

# 配置环境变量（从 Vercel 拉取）
vercel link
vercel env pull .env.local

# 启动开发模式（前后端热更新）
npm run dev          # Vite 开发服务器 :5173，代理 /api → :3001
npm run server       # Express 服务器 :3001（另一个终端）

# 或使用构建模式
npm run build && npm run server
```

## Vercel 部署

### 前置条件

1. 安装 [Vercel CLI](https://vercel.com/docs/cli)：`npm i -g vercel`
2. 在 [Vercel Marketplace](https://vercel.com/marketplace) 安装 **Neon Postgres** 集成

### 部署步骤

```bash
# 1. 关联 Vercel 项目
vercel link

# 2. 添加 DATABASE_URL 环境变量
vercel env add DATABASE_URL
# 粘贴 Neon 连接字符串（格式：postgresql://user:pass@host.neon.tech/neondb）
# 选择 production、preview、development 三个环境

# 3. 部署
vercel deploy --prod
```

### 首次部署后

服务启动时会自动执行数据库初始化（建表 + 从 `server/*.json` 种子数据导入）。种子数据包括默认用户、邀请码和示例项目。

## 项目结构

```
├── api/
│   └── index.js              # Vercel Serverless 入口
├── server/
│   ├── server.js             # Express 应用
│   ├── routes.js             # API 路由
│   ├── db.js                 # 数据库查询层（Neon PostgreSQL）
│   ├── data.json             # 种子数据：命名空间 + 项目 + 费用
│   ├── user.json             # 种子数据：用户
│   └── invite_codes.json     # 种子数据：邀请码
├── src/
│   ├── App.jsx               # 路由配置
│   ├── context/
│   │   ├── ExpenseContext.jsx # 全局状态管理
│   │   └── expenseApi.js
│   ├── components/
│   │   ├── Layout.jsx         # 布局 + 底部导航
│   │   ├── ProjectModal.jsx   # 新建项目弹窗
│   │   └── ExpenseModal.jsx   # 添加/编辑费用弹窗
│   └── pages/
│       ├── Home.jsx           # 首页（项目列表 + 导出/导入）
│       ├── ProjectDetail.jsx  # 项目详情（费用列表）
│       ├── Statistics.jsx     # 统计面板
│       ├── Types.jsx          # 费用类型管理
│       └── Login.jsx          # 登录/注册
├── vercel.json               # Vercel 配置
└── package.json
```

## 数据库 Schema

| 表 | 字段 | 说明 |
|---|------|------|
| `users` | id, username, password, namespace_id | 用户（bcrypt 加密） |
| `namespaces` | id, name, created_at | 命名空间（用户隔离） |
| `namespace_custom_types` | namespace_id, key, label, icon | 自定义费用类型 |
| `projects` | id, namespace_id, name, description, created_at, submitted_at | 项目 |
| `expenses` | id, project_id, type, amount, date, description, reimbursed, pdf | 费用记录 |
| `invite_codes` | code, used | 邀请码 |

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/login | 登录 |
| POST | /api/register | 注册（需邀请码） |
| GET | /api | 获取当前命名空间数据 |
| GET | /api/namespaces | 列出命名空间 |
| POST | /api/namespaces | 创建命名空间 |
| POST | /api/custom-types | 添加自定义费用类型 |
| DELETE | /api/custom-types/:key | 删除自定义类型 |
| POST | /api/projects | 创建项目 |
| DELETE | /api/projects/:id | 删除项目 |
| PUT | /api/projects/:id/submit | 提交项目 |
| PUT | /api/projects/:id/revoke | 撤销提交 |
| POST | /api/projects/:id/expenses | 添加费用 |
| PUT | /api/projects/:id/expenses/:eid | 更新费用 |
| PUT | /api/projects/:id/expenses/:eid/toggle | 切换报销状态 |
| DELETE | /api/projects/:id/expenses/:eid | 删除费用 |
| GET | /api/export | 导出数据（JSON） |
| POST | /api/import | 导入数据（JSON） |
| GET | /api/health | 健康检查 |

