# MANABU Architecture

## System Shape

MANABU uses a hybrid architecture:

- `backend_api` provides the shared persistent startup backend
- `backend_services` provide surrounding platform microservices
- `user_web_app`, `admin_panel`, and `mobile_app` are the user-facing clients
- `ai_engine` provides AI tutor and generation endpoints

## Core Request Flow

1. A learner or admin signs in from web or mobile.
2. The client calls `backend_api` auth endpoints.
3. `backend_api` verifies credentials, issues JWT, and returns the persisted user profile.
4. Web apps store the session in HTTP-only cookies; mobile stores the token in SecureStore.
5. Protected routes and role checks gate learner, admin, and developer experiences.

## Persistent Backend

`backend_api` owns:

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `GET /api/quizzes`
- `GET /api/quizzes/:slug`
- `POST /api/quizzes/:slug/attempts`
- `GET /api/admin/summary`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId`
- `DELETE /api/admin/users/:userId`
- `GET /api/admin/quizzes`
- `POST /api/admin/quizzes`
- `PATCH /api/admin/quizzes/:quizId`
- `DELETE /api/admin/quizzes/:quizId`
- `GET /api/admin/logs`
- `POST /api/monitoring/events`

## Data Model

PostgreSQL tables modeled through Prisma:

- `users`
- `quizzes`
- `questions`
- `quiz_attempts`
- `leaderboard`
- `admin_logs`

## Frontend Boundaries

### `user_web_app`

- public marketing pages
- auth flows
- learner dashboard
- quiz hub and quiz player
- recommendations, social, gamification
- admin-only developer portal at `/dev`

### `admin_panel`

- admin dashboard
- user management
- quiz management
- moderation and analytics views
- system status and admin controls

### `mobile_app`

- Expo learner application
- secure auth storage
- dashboard, quiz catalog, quiz player
- about admin screen
- admin summary screen for admin users

## Supporting Microservices

The `backend_services` layer still powers:

- gateway routing
- analytics feeds
- learning plans
- gamification
- social modules
- notifications
- sync workflows
- recommendation endpoints

These services remain important for ecosystem breadth, while `backend_api` delivers the persistent startup-grade core used by the main apps.

## Monitoring

Monitoring hooks are installed in:

- learner web app
- admin panel
- mobile app

Client failures are forwarded to `backend_api` and stored in `admin_logs`.

## Security

- JWT authentication
- admin route protection
- role-based UI visibility
- password hashing with bcrypt
- rate limiting and hardened Express middleware
- SecureStore token handling on mobile

## Validation Strategy

- TypeScript build checks across all apps
- root lint/build orchestration
- API smoke validation
- UI smoke validation
- mobile Metro and bundle validation
- Playwright E2E for login, signup, admin gating, and Platform Admin dropdown interaction
