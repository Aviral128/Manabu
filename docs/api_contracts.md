# MANABU Service API Contracts (Initial)

## Gateway
- `GET /v1/routes`
- `GET /v1/status`

## Auth Service
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/password/recover`
- `POST /v1/auth/oauth/:provider`

## User Service
- `GET /v1/users/:id`
- `PUT /v1/users/:id/preferences`
- `GET /v1/users/:id/history`

## Quiz Service
- `POST /v1/quiz/sessions`
- `POST /v1/quiz/sessions/:sessionId/submit`
- `GET /v1/quiz/questions`

## Learning Service
- `GET /v1/learning/plan/:userId`
- `POST /v1/learning/weak-topics/analyze`
- `GET /v1/learning/knowledge-graph/:userId`

## Gamification Service
- `GET /v1/gamification/profile/:userId`
- `POST /v1/gamification/events/xp`
- `GET /v1/gamification/rewards/:userId`

## Social Service
- `GET /v1/social/friends/:userId`
- `POST /v1/social/battles`
- `GET /v1/social/leaderboard/global`

## Analytics Service
- `GET /v1/analytics/dashboard/:userId`
- `POST /v1/analytics/events`
- `GET /v1/analytics/retention`

## Content Service
- `POST /v1/content/questions`
- `GET /v1/content/courses/:courseId`
- `POST /v1/content/moderation/queue`

## Notification Service
- `POST /v1/notifications/daily-challenge`
- `POST /v1/notifications/reminders`
- `POST /v1/notifications/achievements`

## Sync Service
- `POST /v1/sync/offline-batch`
- `GET /v1/sync/conflicts/:userId`
- `POST /v1/sync/checkpoint/:userId`

## Recommendation Service
- `GET /v1/recommendations/next/:userId`
- `POST /v1/recommendations/feedback`

## AI Engine
- `POST /v1/ai/weak-topics`
- `POST /v1/ai/question-generation`
- `POST /v1/ai/tutor-explanation`
- `POST /v1/ai/personalized-plan`
- `POST /v1/ai/knowledge-graph`
