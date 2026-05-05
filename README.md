# PortPholio

Personal portfolio & resume SPA for **Hoang Cao Viet Anh** — CTO of NullifyMatter.

## Tech Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | React + TypeScript + Vite + Tailwind CSS  |
| Animation| Framer Motion                             |
| Backend  | Node.js + Express + Drizzle ORM           |
| Database | Supabase (PostgreSQL)                     |
| Deploy   | Docker + GitHub Actions CI/CD             |

## Project Structure

```
PortPholio/
├── frontend/          # React SPA (portfolio + resume pages)
├── backend/           # Express API server
├── packages/shared/   # Shared types between frontend & backend
├── supabase/          # Database migrations
├── .github/workflows/ # CI/CD pipelines
└── docker-compose.yml # Local development stack
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker (optional, for full stack)
- Supabase account

### Frontend (dev mode)

```bash
cd frontend
npm install
cp .env.example .env   # fill in your Supabase keys
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DB connection string
npm run dev
```

### Full stack with Docker

```bash
docker-compose up
```

## Environment Variables

**frontend/.env**
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**backend/.env**
```
DATABASE_URL=...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
```

## Deployment

Push to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`).

---

Built with ❤️ by [Hoang Cao Viet Anh](https://github.com/vanhleg2301)
