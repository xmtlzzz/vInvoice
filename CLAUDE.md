# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend dev server (Vite, port 5173, proxies /api to :3001)
npm run dev

# Backend server (Express, port 3001 by default, serves built frontend from dist/)
npm run server

# Build frontend only (outputs to dist/)
npm run build

# Build + start backend (single command)
npm start

# Run tests (Node built-in test runner)
npm test
```

There is no lint or type-check command configured. The project uses plain React (no TypeScript).

## Architecture

### Stack
- **Frontend**: React 18, React Router DOM v6, Vite 5, Tailwind CSS 3.4, Lucide React icons, clsx
- **Backend**: Express 4, bcryptjs, cors
- **Storage**: JSON files on disk (`server/data.json`, `server/user.json`, `server/invite_codes.json`)
- **No database** — all persistence is synchronous read/write of JSON files via `server/db.js`

### Dual runtime: local vs Vercel
The Express app (`server/server.js`) runs in two modes:
- **Local**: listens on `PORT` (default 3001), serves `dist/` as static files, handles SPA fallback
- **Vercel**: exported as a serverless function via `api/index.js` (which re-exports `server/server.js`). On Vercel, `NODE_ENV=production` and `VERCEL=true`, so the server skips `app.listen()` and static file serving (Vercel's `vercel.json` rewrites handle that instead). Data files are written to `/tmp` on Vercel.

The Vite dev server proxies `/api` to `localhost:3001` (same as the production port).

### Data model & multi-tenancy

```
Namespace (user space, isolated)
  └── Project
        ├── name, description, createdAt, submittedAt
        └── Expense[]
              ├── type (SUBWAY|TAXI|HOTEL|TRAIN|BUS + custom types)
              ├── amount, date, description
              ├── reimbursed (boolean)
              └── pdf (unused, reserved for future)
```

Each user belongs to exactly one namespace. Registration creates a namespace automatically. The `x-user-namespace` header (set automatically by the frontend context) scopes all API requests to the user's namespace.

### Auth flow
- Login/register via `/api/login` and `/api/register`
- Passwords hashed with bcrypt (auto-upgrades plaintext passwords on login)
- Registration requires an invite code (stored in `server/invite_codes.json`)
- User session stored in `localStorage` under key `vinvoice_user`
- `ExpenseContext` reads user from localStorage on init, provides `login()`/`logout()` functions

### Frontend structure

```
src/
  main.jsx              — ReactDOM entry
  App.jsx               — Router setup, auth gate (redirects to /login if no user)
  context/
    ExpenseContext.jsx  — Global state: user, data (namespaces+projects), API methods
    expenseApi.js       — Reusable fetch helpers (createExpenseRequest, getExpenseFormState)
  components/
    Layout.jsx          — Shell: sticky header, bottom tab nav (Home, Statistics), user dropdown
    ProjectModal.jsx    — "New project" modal form
    ExpenseModal.jsx    — "Add/Edit expense" modal form + custom expense type creation
  pages/
    Home.jsx            — Project list with summary cards
    ProjectDetail.jsx   — Single project: expense list with type/date filters, submit/revoke
    Statistics.jsx      — Monthly stats with type breakdown bars
    Login.jsx           — Login/register form
```

### API endpoints (all under `/api`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/login | Login |
| POST | /api/register | Register (requires invite code) |
| GET | /api | List namespaces + projects for user's namespace |
| GET | /api/namespaces | List all namespaces |
| POST | /api/namespaces | Create namespace |
| DELETE | /api/namespaces/:id | Delete namespace |
| POST | /api/custom-types | Add custom expense type to namespace |
| DELETE | /api/custom-types/:key | Delete custom expense type |
| POST | /api/projects | Create project |
| DELETE | /api/projects/:id | Delete project |
| PUT | /api/projects/:id/submit | Submit project (locks expenses) |
| PUT | /api/projects/:id/revoke | Revoke submission |
| POST | /api/projects/:id/expenses | Add expense |
| PUT | /api/projects/:id/expenses/:eid | Update expense |
| PUT | /api/projects/:id/expenses/:eid/toggle | Toggle reimbursed |
| DELETE | /api/projects/:id/expenses/:eid | Delete expense |

### Key conventions
- All IDs are `Date.now().toString()` timestamps
- Dates in API are `YYYY-MM-DD` strings
- Custom expense type keys must match `/^[A-Z_]+$/`
- Submitted projects (`submittedAt !== null`) block adding/editing/deleting expenses
- Chinese UI strings throughout (error messages, labels)
- `VITE_API_BASE` env var controls API URL (defaults to `/api`)


### Git Commit
After each modification of the project, it is necessary to verify whether the project can run normally and whether the functional modules can meet the user's needs. Proactively git push this update while ensuring code quality is not a problem

The summary generated by git push is short in Chinese, mainly containing the summary information of this update