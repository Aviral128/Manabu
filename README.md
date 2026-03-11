# MANABU

MANABU is a startup-grade AI learning platform monorepo with:

- `user_web_app` for learners on the web
- `admin_panel` for operators and moderation
- `mobile_app` built with Expo React Native
- `backend_api` for persistent auth, quizzes, profiles, leaderboard, and monitoring
- `backend_services` for the wider microservice ecosystem
- `ai_engine` for AI tutor and quiz-generation workflows

## Stack

- Frontend: Next.js, React, TypeScript
- Mobile: Expo, React Native, React Navigation
- Backend: Node.js, Express, Prisma, PostgreSQL, JWT
- Data: PostgreSQL, MongoDB schema docs, Redis strategy docs
- DevOps: PM2, Playwright, PowerShell local orchestration

## Repo Layout

- `backend_api/` shared persistent application backend
- `backend_services/` legacy/supporting microservices on ports `7000-7011`
- `admin_panel/` admin dashboard on port `3001`
- `user_web_app/` learner web app and admin-only developer portal on port `3000`
- `mobile_app/` Expo mobile app
- `scripts/` local startup, smoke, and validation scripts
- `tests/e2e/` Playwright end-to-end coverage
- `docs/` system design and contracts

## Verified Commands

Run these from the repo root:

- `npm install`
- `npm run build`
- `npm run lint`
- `npm run dev-all`
- `npm run smoke:api`
- `npm run smoke:ui`
- `npm run smoke:mobile`
- `npm run test:e2e`

## Local Startup

### Full stack

```powershell
npm run dev-all
```

This starts:

- `backend_api` on `http://127.0.0.1:7200`
- supporting microservices on `7000-7011`
- AI fallback on `7100`
- learner web app on `3000`
- admin panel on `3001`

Stop everything with:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/stop_local_stack.ps1
```

### Frontend only

```powershell
cd user_web_app
npm run dev
```

```powershell
cd admin_panel
npm run dev
```

### Mobile

```powershell
cd mobile_app
npm run start
```

Metro health:

- `http://127.0.0.1:8081/status`

## Default Local Credentials

- Admin: `aviral@manabu.app` / `StrongPass123`
- Learner: `learner@manabu.app` / `StrongPass123`

## Production-Focused Features Already Wired

- Persistent PostgreSQL-backed auth and profile storage
- Shared JWT auth across learner web, admin panel, and mobile
- Admin-only protection for `/dev` and admin controls
- Backend-backed quiz catalog and scoring
- Monitoring event ingestion for web and mobile failures
- Playwright coverage for login, signup, admin gating, and the Platform Admin dropdown
- PM2 production process map

## Validation Commands

### API smoke

```powershell
npm run smoke:api
```

### UI smoke

```powershell
npm run smoke:ui
```

### Mobile smoke

```powershell
npm run smoke:mobile
```

### End-to-end tests

```powershell
npm run test:e2e
```

## Documentation

- Architecture: [ARCHITECTURE.md](C:/Users/sulta/Downloads/Manabu/ARCHITECTURE.md)
- Contributing guide: [CONTRIBUTING.md](C:/Users/sulta/Downloads/Manabu/CONTRIBUTING.md)
- System blueprint: [docs/manabu_system_blueprint.md](C:/Users/sulta/Downloads/Manabu/docs/manabu_system_blueprint.md)
- API contracts: [docs/api_contracts.md](C:/Users/sulta/Downloads/Manabu/docs/api_contracts.md)
- PostgreSQL schema docs: [database/postgres/schema.sql](C:/Users/sulta/Downloads/Manabu/database/postgres/schema.sql)

## Deployment Direction

- Learner web app: Vercel or Node host
- Admin panel: Vercel or Node host
- Backend API: Railway, Render, Fly.io, or container platform
- Database: Neon, Supabase, or managed PostgreSQL
- Mobile: Expo EAS to Play Store

## Notes

- `backend_api` is the shared persistent app backend.
- `backend_services` remain available for wider platform modules and diagnostics.
- The developer portal at `/dev` is admin-only.
- The footer across web and mobile includes: `Created with ♥ by Aviral Sultaniya`.
