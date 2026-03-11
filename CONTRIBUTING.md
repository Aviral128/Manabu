# Contributing

## Principles

- Keep learner, admin, mobile, and backend responsibilities clearly separated.
- Prefer backend-backed data over frontend-only fixtures.
- Preserve admin-only access for moderation and developer tooling.
- Validate changes with build, lint, and smoke commands before handing off.

## Setup

1. Install dependencies:
   - `npm install`
2. Start the local stack:
   - `npm run dev-all`
3. Stop the stack when finished:
   - `powershell -ExecutionPolicy Bypass -File scripts/stop_local_stack.ps1`

## Required Validation

Before shipping changes, run:

1. `npm run build`
2. `npm run lint`
3. `npm run smoke:api`
4. `npm run smoke:ui`
5. `npm run smoke:mobile`
6. `npm run test:e2e`

## Auth and Role Rules

- Learner-facing features belong in `user_web_app`.
- Admin-only pages belong in `admin_panel` or protected `/dev` routes.
- Shared auth persistence lives in `backend_api`.
- Do not expose developer tooling to non-admin users.

## UI Rules

- Reuse existing design-system components before creating new primitives.
- Maintain accessible labels for forms, buttons, dropdowns, and tables.
- Keep dark and light themes both usable.

## Backend Rules

- `backend_api` owns persistent auth, profile, quiz, leaderboard, and monitoring records.
- Add schema changes through Prisma updates and reseed when local test data changes.
- Keep API responses typed and human-readable.

## Mobile Rules

- Use the shared API layer under `mobile_app/src/services`.
- Store auth tokens with SecureStore, not AsyncStorage.
- Keep navigation changes typed through the navigation definitions.
