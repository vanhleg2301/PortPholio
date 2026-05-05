# PortPholio — Project Rules

Rules riêng của project này, bổ sung trên global rules.

## Stack
- Frontend: React + TypeScript + Vite + Tailwind + Framer Motion
- Backend: Node.js + Express + Drizzle ORM
- Database: Supabase (PostgreSQL)

## Supabase
- Dùng Supabase JS client cho queries, không connect trực tiếp DB.
- Migration chạy qua Supabase SQL Editor, không chạy bằng CLI.

## Deploy
- Branch `main` tự động trigger CI/CD qua GitHub Actions.
- Môi trường: frontend deploy riêng, backend deploy riêng (xem docker-compose.yml).
