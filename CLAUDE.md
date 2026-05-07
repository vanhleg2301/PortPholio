# PortPholio — CLAUDE.md

Project-specific rules and codebase documentation for AI assistants.

---

## Project Overview

**PortPholio** is a personal portfolio and LeetCode-style coding challenge platform for Hoang Cao Viet Anh. It features a portfolio/resume site, a coding problem library, multi-language code execution via Judge0, and Supabase-backed user progress tracking.

---

## Repository Structure

```
PortPholio/                          # npm workspaces monorepo
├── frontend/                        # React + Vite SPA
├── backend/                         # Hono API server
├── packages/shared/                 # Shared TypeScript types & constants
├── supabase/migrations/             # SQL migrations (run via Supabase SQL Editor)
├── .github/workflows/               # CI (ci.yml) + Deploy (deploy.yml)
└── docker-compose.yml               # Local full-stack container setup
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React + TypeScript | 19.1.0 / 5.8.3 |
| Build tool | Vite | 6.3.3 |
| Styling | Tailwind CSS | 4.1.5 |
| Animation | Framer Motion | 12.9.4 |
| Routing | React Router | 7.5.3 |
| State management | Zustand | 5.0.4 |
| Data fetching | TanStack React Query | 5.74.4 |
| UI primitives | Radix UI (dialog, tabs, dropdown, tooltip, avatar) | latest |
| Code editor | Monaco Editor | 0.52.2 |
| Backend framework | **Hono** (not Express) | 4.7.7 |
| ORM | Drizzle ORM | 0.43.1 |
| Database | PostgreSQL via Supabase | — |
| DB client | postgres (native) | 3.4.5 |
| Validation | Zod | 3.24.4 |
| Auth | Supabase Auth + JWT (jose) | — |
| Code execution | Judge0 (external API) | — |
| Containerization | Docker (multi-stage) | — |
| Frontend deploy | Vercel | — |
| Backend deploy | Railway | — |

> **Important:** The backend uses **Hono**, not Express. Do not suggest Express APIs or middleware.

---

## Development Setup

```bash
# Install all workspaces from root
npm install

# Run frontend + backend concurrently (root)
npm run dev

# Individual services
cd frontend && npm run dev     # http://localhost:5173
cd backend  && npm run dev     # http://localhost:3000

# Type checking
npm run typecheck              # Runs across all workspaces

# Lint
npm run lint

# Build
npm run build

# Docker (full stack)
docker-compose up              # backend :3000, frontend :80
```

The frontend dev server proxies `/api/*` → `http://localhost:3000` (configured in `frontend/vite.config.ts`).

---

## Environment Variables

### Frontend (`frontend/.env.example`)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3000
```

### Backend (`backend/.env.example`)
```
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project.supabase.co:5432/postgres
FRONTEND_URL=http://localhost:5173
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-rapidapi-key
```

---

## Frontend Structure (`frontend/src/`)

```
main.tsx              # App entry: BrowserRouter + QueryClientProvider + ThemeProvider
App.tsx               # Routes + Framer Motion page transitions
components/
  HireModal.tsx
  layout/
    Navbar.tsx
    Footer.tsx
    ThemeProvider.tsx  # Class-based dark mode
pages/
  portfolio/HomePage.tsx
  ResumePage.tsx
  NotFoundPage.tsx
lib/
  utils.ts             # cn() and other utilities
```

**Path alias:** `@/` → `./src/` (configured in both `vite.config.ts` and `tsconfig.json`).

**Routes:**
- `/` → `HomePage`
- `/resume` → `ResumePage`
- `*` → `NotFoundPage`

---

## Backend Structure (`backend/src/`)

```
index.ts              # Hono server: CORS, logger, routes, health check
middleware/
  auth.ts             # JWT auth middleware
services/
  judge.ts            # Judge0 API integration
lib/
  supabase.ts         # Supabase client (service role)
db/
  index.ts            # Drizzle ORM instance (postgres client)
  schema.ts           # All table & enum definitions
  migrate.ts          # Migration runner
routes/
  auth.ts             # POST /api/auth/*
  problems.ts         # GET /api/problems (list, filter, pagination)
  submissions.ts      # POST /api/submissions
```

**API base:** All routes are prefixed with `/api`.

---

## Shared Package (`packages/shared/src/index.ts`)

Exports used by both frontend and backend:
- **Types:** `Difficulty`, `Language`, `SubmissionStatus`
- **Interfaces:** `ProblemExample`, `ProblemListItem`, `ProblemDetail`, `SubmitPayload`, `SubmitResult`
- **Constants:** `LANGUAGES`, `DIFFICULTIES`, `DIFFICULTY_COLORS`

Import as: `import { ... } from '@portpholio/shared'`

---

## Database Schema (Drizzle ORM)

Schema file: `backend/src/db/schema.ts`

**Enums:**
- `difficulty`: `'easy' | 'medium' | 'hard'`
- `language`: `'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'go'`
- `submission_status`: `'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error' | 'compile_error'`

**Tables:**
- `problems` — coding challenges (UUID PK, slug, title, description, difficulty, examples JSONB, starter_code JSONB, solution_code JSONB, acceptance_rate, is_published)
- `tags` — category labels
- `problem_tags` — junction table (problem_id, tag_id)
- `submissions` — user code submissions (user_id, problem_id FK, language, code, status, runtime_ms, memory_kb, error_message)
- `user_progress` — per-user per-problem tracking (is_solved, attempts, last_language, last_code)

---

## Supabase Rules

- Use the **Supabase JS client** for all DB queries — never connect directly to PostgreSQL from application code.
- **Migrations run via Supabase SQL Editor** (or paste `supabase/full_setup.sql`). Do not use Supabase CLI or `drizzle-kit migrate` against production.
- `drizzle-kit` commands (`db:generate`, `db:studio`) are for local development / schema introspection only.
- Row-level security (RLS) is defined in `supabase/migrations/002_rls_policies.sql` — always respect RLS when writing queries.
- The backend uses the **service role key** (bypasses RLS for server-side operations). The frontend uses the **anon key** (respects RLS).

---

## CI/CD & Deployment

**Branch rules:**
- `main` → triggers both CI and deploy pipelines
- `develop` → triggers CI only (typecheck + build, no Docker push)
- PRs to `main` → triggers CI

**CI (`.github/workflows/ci.yml`):**
1. Typecheck frontend (Node 22)
2. Typecheck backend
3. Build frontend (requires `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` secrets)
4. Build backend
5. Docker multi-stage build → push to DockerHub (main branch only)

**Deploy (`.github/workflows/deploy.yml`):**
- Frontend → Vercel (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
- Backend → Railway (`RAILWAY_TOKEN`)

**GitHub Secrets required:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `RAILWAY_TOKEN`

---

## Key Conventions

### TypeScript
- Strict mode is enabled everywhere — no `any` without justification.
- Use types from `@portpholio/shared` for cross-layer data structures.
- Path alias `@/` is available in frontend; use it consistently.

### Styling
- Tailwind CSS 4.x syntax (no `theme()` config function — use CSS variables directly).
- Dark mode uses class strategy (`dark:` prefix). `ThemeProvider` manages the `dark` class on `<html>`.
- No inline styles unless Framer Motion requires it.

### State & Data Fetching
- **Server state** → TanStack React Query (`useQuery`, `useMutation`).
- **Client/UI state** → Zustand stores.
- Do not put server-fetched data in Zustand.

### Backend (Hono)
- Use `zod-validator` middleware for all route input validation.
- Use `c.json()` for all responses.
- Auth middleware in `middleware/auth.ts` — apply to protected routes.
- Never expose the service role key to clients.

### Code Execution
- Code submission flow: frontend → `POST /api/submissions` → `services/judge.ts` → Judge0 API.
- Judge0 returns `runtime_ms`, `memory_kb`, and status — map to `submission_status` enum.

### Git
- `main` branch is protected and auto-deploys to production.
- Never force-push `main`.
- Develop features on `develop` or feature branches.

---

## Common Commands Reference

```bash
# Monorepo
npm run dev          # Start frontend + backend
npm run build        # Build all workspaces
npm run typecheck    # Type-check all workspaces
npm run lint         # Lint all workspaces

# Backend DB (local only)
cd backend
npm run db:generate  # Generate migration SQL from schema changes
npm run db:studio    # Open Drizzle Studio at http://local.drizzle.studio

# Docker
docker-compose up --build   # Rebuild and start containers
docker-compose down         # Stop containers
```
