# MANABU - Production Architecture and Implementation Blueprint

## 1. Product Foundation

### 1.1 Core Mission
MANABU is an AI learning ecosystem for long-term mastery, not one-off exam prep. The platform combines adaptive practice, guided instruction, social reinforcement, and measurable progression.

### 1.2 Primary User Personas
- Learner: consumes lessons, quizzes, and AI tutoring.
- Educator: curates content and reviews quality.
- Moderator: enforces safety/content policy.
- Admin: manages platform operations and analytics.

### 1.3 Learning Lifecycle
1. User onboarding and baseline diagnostics.
2. Weak-topic detection from interaction history.
3. Personalized daily plan generation.
4. Adaptive practice and AI tutor support.
5. Gamification and social reinforcement.
6. Retention analysis and plan recalibration.

## 2. Architectural Style

### 2.1 Clean Architecture in Each Service
Each microservice follows:
- Domain layer: business entities and policies.
- Application layer: use cases (commands/queries).
- Interface layer: REST handlers and DTO mapping.
- Infrastructure layer: DB adapters, external providers.

### 2.2 Microservices Topology
- API Gateway
- Auth Service
- User Service
- Quiz Service
- Learning Service
- Gamification Service
- Social Service
- Analytics Service
- Content Service
- Notification Service
- Sync Service
- Recommendation Service
- AI Engine (Python FastAPI)

### 2.3 Data Ownership
- PostgreSQL: source of truth for users, progress, game state.
- MongoDB: flexible lesson blocks, AI-generated drafts, tutor threads.
- Redis: ephemeral session/cache/rate-limit/leaderboard data.

### 2.4 Event Flow (CQRS + Async)
Synchronous writes are kept in bounded contexts; events power cross-context reactions.
Example:
- Quiz Service emits `quiz.completed`.
- Learning Service updates mastery.
- Gamification Service awards XP.
- Analytics Service updates aggregates.
- Notification Service triggers achievement push.

## 3. Monorepo Structure

```
/mobile_app
/backend_services
/ai_engine
/database
/admin_panel
/devops
/tests
/docs
```

## 4. Backend Services Design

### 4.1 API Gateway
Responsibilities:
- Unified public API entrypoint.
- Authentication and rate-limit checks.
- Request correlation and tracing propagation.
- Canary routing and version pinning.

Key Endpoints:
- `GET /v1/routes`
- `GET /v1/status`

### 4.2 Auth Service
Responsibilities:
- Registration/login.
- Password recovery.
- OAuth flows.
- Token issuance and rotation.

Security:
- Argon2id password hashing.
- JWT with rotating refresh tokens.
- Device fingerprint validation.

### 4.3 User Service
Responsibilities:
- Profile management.
- Preference storage.
- Learning history retrieval.

Data:
- `users`, `user_preferences`, history projections.

### 4.4 Quiz Service
Responsibilities:
- Question retrieval and randomization.
- Timed quiz execution.
- Scoring and attempt recording.
- Difficulty scaling hooks.

Algorithms:
- Weighted sampling by difficulty and recency.
- Repeat avoidance via rolling question windows.

### 4.5 Learning Service
Responsibilities:
- Weak-topic analysis orchestration.
- Plan composition from AI signals.
- Knowledge-graph state projection.

### 4.6 Gamification Service
Responsibilities:
- XP, level, streak.
- Badge awarding.
- Reward unlock rules.

Mechanics:
- XP per action with anti-farm caps.
- Streak grace windows by timezone.

### 4.7 Social Service
Responsibilities:
- Friends and social graph.
- Multiplayer battle orchestration.
- Leaderboard retrieval.

Scale Strategy:
- Leaderboards in Redis sorted sets.
- Periodic durable snapshots in PostgreSQL.

### 4.8 Analytics Service
Responsibilities:
- Event ingestion.
- KPI aggregates.
- Dashboards and cohort metrics.

Pipeline:
- Stream ingestion -> windowed aggregates -> warehouse.

### 4.9 Content Service
Responsibilities:
- Question editor APIs.
- Course builder APIs.
- Moderation queue management.

Controls:
- Draft/publish workflow.
- Multi-level approvals.

### 4.10 Notification Service
Responsibilities:
- Daily challenge sends.
- Reminder scheduling.
- Achievement notifications.

Channels:
- Push (FCM/APNS)
- Email
- In-app inbox

### 4.11 Sync Service (Offline)
Responsibilities:
- Offline event ingestion.
- Conflict detection and resolution.
- Checkpoint token management.

Conflict Policies:
- Last-write-wins for low-risk entities.
- Merge strategy for additive entities.
- Manual escalation for stateful conflicts.

### 4.12 Recommendation Service
Responsibilities:
- Next best action feed.
- Feedback loop ingestion.
- Model-scored ranking.

Ranking Inputs:
- Mastery gaps.
- Session fatigue.
- Engagement recency.
- Learning objective deadlines.

## 5. AI Engine Architecture

### 5.1 Service Components
- Weak Topic Detector pipeline.
- Question Generator pipeline.
- AI Tutor Explanation pipeline.
- Personalized Plan Builder pipeline.
- Knowledge Graph Recommender.

### 5.2 Model Strategy
- Hybrid approach:
  - Classical models (Scikit-learn) for tabular risk scoring.
  - Deep models (PyTorch/TensorFlow) for content generation/ranking.
  - Rule-based safety guardrails for explainability and control.

### 5.3 Inference Gateway
- FastAPI endpoints under `/v1/ai/*`.
- Payload schemas validated via Pydantic.
- Structured logging and request IDs for traceability.

### 5.4 AI Safety and Quality
- Toxicity and prompt-injection checks.
- Hallucination risk score thresholds.
- Human moderation path for generated content.

### 5.5 Retraining Loop
1. Collect anonymized feedback.
2. Build feature dataset.
3. Offline evaluation (AUC, NDCG, Brier).
4. Shadow deployment.
5. Canary rollout.

## 6. Database Design

### 6.1 PostgreSQL Transactional Model
Implemented in `/database/postgres/schema.sql`:
- Identity and auth: `users`, `user_preferences`.
- Course graph: `courses`, `course_units`, `topics`.
- Quiz core: `questions`, `quiz_sessions`, `quiz_attempt_answers`.
- Learning progression: `topic_mastery`, `learning_plans`.
- Study tools: `flashcard_sets`, `flashcards`, `study_plans`.
- Gamification: `gamification_profiles`, `badges`, `user_badges`.
- Social: `friends`, `battle_sessions`, `battle_participants`, `leaderboard_snapshots`.
- Notifications and sync: `notification_events`, `offline_sync_jobs`.
- Analytics ingestion: `analytics_events`.

### 6.2 MongoDB Content Model
Implemented in `/database/mongo/collections.json`:
- `ai_generated_questions`
- `learning_content_blocks`
- `ai_tutor_conversations`

### 6.3 Redis Runtime Model
Implemented in `/database/redis/key_strategy.md`:
- Session keys
- Cache keys
- Rate limit counters
- Leaderboard sorted sets
- Offline sync checkpoint and locks

## 7. Mobile Application Design (React Native)

### 7.1 Layering
- `src/core`: API client, storage, tokens, design system.
- `src/features/auth`: login/register/session.
- `src/features/quiz`: adaptive quiz sessions.
- `src/features/learning`: plan and mastery views.
- `src/features/gamification`: XP/levels/streak UI.
- `src/features/social`: friends/battles/leaderboards.
- `src/features/offline`: queueing and background sync.

### 7.2 Offline-first Strategy
- All user actions append to offline queue.
- Background sync flushes queue when online.
- Sync Service returns conflict payloads.
- UI presents user-resolvable conflicts when needed.

### 7.3 UX Principles
- Daily mission card on home screen.
- Progress ring and topic heatmap.
- AI tutor chat integrated with each mistake.

## 8. Admin Panel System

### 8.1 Core Modules
- Content Studio: question/course authoring.
- Moderation Console: queue triage + policy action.
- Analytics Console: KPI and cohort analysis.

### 8.2 Access Control
- RBAC policies for `educator`, `moderator`, `admin`.
- Audit logs for all content state transitions.

### 8.3 Publishing Pipeline
- Draft -> Review -> Approved -> Published.
- AI-generated content requires safety and educator approval.

## 9. DevOps and Cloud

### 9.1 Containerization
- Node services built with `backend.Dockerfile`.
- AI service built with `ai.Dockerfile`.
- Local orchestration with `docker-compose.yml`.

### 9.2 Kubernetes
- Deployments + Services per workload.
- HPA for CPU-based autoscaling.
- Ingress for external routing.

### 9.3 CI/CD (GitHub Actions)
- Lint/test gates.
- Multi-service build workflow.
- Artifact/image publication.
- Progressive deployment stages (dev/staging/prod).

### 9.4 Observability
- Prometheus scraping.
- Structured JSON logs (Pino/Python logging).
- Alert thresholds:
  - p95 latency > 500ms
  - error rate > 2%
  - AI timeout > 3%

## 10. Security Architecture

### 10.1 API Security
- JWT auth with refresh rotation.
- RBAC/ABAC policy checks.
- Input validation on every boundary.
- WAF + bot detection at edge.

### 10.2 Data Security
- TLS in transit.
- Encryption at rest.
- PII minimization and field-level masking.
- Audit trails for admin actions.

### 10.3 Compliance-ready Controls
- GDPR deletion workflows.
- COPPA/FERPA policy boundaries (if operating in those jurisdictions).
- Consent tracking for analytics and AI personalization.

## 11. Scalability and Reliability

### 11.1 Horizontal Scaling
- Stateless services replicated under K8s.
- Redis and DB read replicas for hot read paths.
- AI workers split by model family.

### 11.2 Partitioning and Sharding
- Tenant-region partition strategy for users/events.
- Event table partitioning by month.
- Mongo shard key on `(courseSlug, topicKey)` for content.

### 11.3 Resilience Patterns
- Retry with jitter.
- Circuit breakers between gateway and downstream services.
- Dead-letter queues for notification and sync pipelines.
- Idempotency keys for write operations.

### 11.4 Performance Targets
- Login p95 < 250ms.
- Quiz submit p95 < 300ms.
- Recommendation feed p95 < 400ms.
- AI explanation p95 < 1200ms.

## 12. Testing Framework

### 12.1 Test Pyramid
- Unit: core logic (detectors, scoring, policy rules).
- Integration: service-to-service contracts.
- E2E: learner journeys and admin workflows.

### 12.2 Current Scaffold
- `backend_services/services/auth-service/src/routes.test.ts`
- `backend_services/services/quiz-service/src/routes.test.ts`
- `ai_engine/tests/test_weak_topic_detector.py`
- `tests/integration/auth_user_flow.test.ts`
- `tests/integration/offline_sync_contract.test.ts`
- `tests/e2e/learner_journey.feature`

### 12.3 Release Gates
- Contract test pass for gateway + downstream.
- Security scan pass (SAST + dependency audit).
- Load test baseline pass for critical APIs.

## 13. Module-by-Module Debugging Playbook

### 13.1 User System
Common Errors:
- Duplicate email registration.
- OAuth callback state mismatch.
- Corrupted user preference payload.

Debugging Steps:
1. Inspect auth-service and user-service logs by request ID.
2. Validate incoming payload against schema errors.
3. Check DB uniqueness constraints and transaction rollback logs.
4. Verify OAuth provider token and callback URL mapping.

Test Cases:
- Register with existing email -> expects conflict.
- OAuth login with expired provider token -> expects unauthorized.
- Preference update with invalid goal minutes -> expects bad request.

Logging:
- Include `requestId`, `userId`, `provider`, `route`, `latencyMs`.

### 13.2 Quiz Engine
Common Errors:
- Empty question pool for selected difficulty.
- Timeout during timed quiz finalization.
- Score mismatch due to stale answer key.

Debugging Steps:
1. Query question availability by topic+difficulty.
2. Validate session TTL and timing in Redis/PostgreSQL.
3. Compare answer key version in session metadata vs question store.
4. Replay submission payload against scoring function.

Test Cases:
- Create quiz with small pool fallback.
- Submit after expiry -> expected graceful timeout response.
- Randomization stability with deterministic seed in tests.

Logging:
- `quizSessionId`, `topicId`, `difficulty`, `questionCount`, `scoreComputationMs`.

### 13.3 AI Learning Engine
Common Errors:
- Weak-topic model false positives from sparse data.
- Hallucinated/generated invalid answer options.
- Tutor explanation latency spikes.

Debugging Steps:
1. Inspect feature vector completeness and null handling.
2. Validate generated question schema and moderation score.
3. Inspect model version, prompt version, and inference timeout.
4. Compare online vs offline evaluation drift metrics.

Test Cases:
- Sparse history weak-topic detection confidence bounds.
- Generated question structural validity.
- Tutor response under large input prompt.

Logging:
- `modelVersion`, `promptTemplate`, `inferenceMs`, `safetyScore`, `fallbackUsed`.

### 13.4 Gamification System
Common Errors:
- XP not awarded after quiz completion.
- Streak reset incorrectly across timezone boundaries.
- Duplicate badge grant race condition.

Debugging Steps:
1. Verify event receipt from quiz completion bus.
2. Compare user timezone and event timestamp normalization.
3. Check unique constraints in user_badges and retry semantics.
4. Inspect idempotency key for XP award transaction.

Test Cases:
- Single event replay should not duplicate XP.
- Midnight boundary streak tests in multiple timezones.
- Badge grant idempotency in concurrent requests.

Logging:
- `userId`, `eventId`, `xpDelta`, `levelBefore`, `levelAfter`, `streakDays`.

### 13.5 Learning Tools
Common Errors:
- Flashcard due-date scheduler drift.
- Study planner over-allocation of minutes.
- Mastery trend graph gaps.

Debugging Steps:
1. Validate spaced repetition interval calculations.
2. Recompute planner budget and activity allocations.
3. Backfill missing events and recalculate aggregates.
4. Cross-check UI timezone conversion vs server UTC.

Test Cases:
- SM-2 interval update scenarios.
- Planner generation under low/high available time.
- Mastery graph continuity on missing-day data.

Logging:
- `flashcardId`, `intervalDays`, `easeFactor`, `planDate`, `targetMinutes`.

### 13.6 Social System
Common Errors:
- Friend request loop/duplicate edges.
- Battle matchmaker imbalance.
- Leaderboard stale rankings.

Debugging Steps:
1. Validate friendship unique constraints and statuses.
2. Inspect matchmaking queue and ELO windows.
3. Compare Redis sorted set score vs snapshot pipeline.
4. Trigger leaderboard rebuild job for suspect periods.

Test Cases:
- Bidirectional friend request race handling.
- Matchmaking under sparse users.
- Snapshot consistency after score updates.

Logging:
- `battleId`, `queueWaitMs`, `matchSkillDelta`, `leaderboardPeriod`, `rebuildJobId`.

### 13.7 Analytics System
Common Errors:
- Event drops under burst traffic.
- Duplicate event ingestion.
- Miscomputed retention cohorts.

Debugging Steps:
1. Check queue lag and consumer offsets.
2. Validate idempotency/event hash dedupe.
3. Verify cohort assignment SQL logic with sample users.
4. Compare raw events and materialized aggregates.

Test Cases:
- Burst ingestion load tests.
- Duplicate event replay tests.
- Cohort integrity fixtures.

Logging:
- `eventName`, `eventId`, `ingestLagMs`, `consumerOffset`, `warehouseBatchId`.

### 13.8 CMS
Common Errors:
- Draft not progressing to published state.
- Broken lesson block schema.
- Unsafe content slipping moderation.

Debugging Steps:
1. Audit state-machine transitions and actor permissions.
2. Validate JSON schema for block payload.
3. Run moderation score explanation and threshold checks.
4. Inspect approval logs and rollback operation.

Test Cases:
- Unauthorized publish attempt.
- Invalid content block insertion.
- Moderation false-negative regression tests.

Logging:
- `contentId`, `previousState`, `nextState`, `actorId`, `moderationScore`.

### 13.9 Notification System
Common Errors:
- Delayed daily challenge notifications.
- Push token invalidation spikes.
- Duplicate achievement sends.

Debugging Steps:
1. Inspect scheduler job execution and clock skew.
2. Verify FCM/APNS response codes and token cleanup.
3. Ensure dedupe key on event-based notifications.
4. Review retry/DLQ behavior for failures.

Test Cases:
- Scheduler reliability around daylight saving changes.
- Token invalidation and renewal flow.
- Dedupe on repeated achievement events.

Logging:
- `notificationId`, `channel`, `providerResponseCode`, `retryCount`, `dedupeKey`.

### 13.10 Offline Learning System
Common Errors:
- Sync conflicts unresolved.
- Lost local events after app restart.
- Partial batch application server-side.

Debugging Steps:
1. Validate local queue persistence in storage.
2. Inspect sync job state transitions.
3. Reconcile server checkpoint and client checkpoint tokens.
4. Replay failed batch with conflict simulation.

Test Cases:
- App offline -> online queue flush.
- Conflict resolution for concurrent progress updates.
- Crash recovery preserving unsynced events.

Logging:
- `syncJobId`, `checkpointClient`, `checkpointServer`, `conflictCount`, `appliedEventCount`.

## 14. Debugging Toolchain

- Correlation IDs across gateway and all services.
- Central log aggregation (CloudWatch/OpenSearch).
- Distributed traces with OpenTelemetry.
- Metrics dashboards for latency, error rates, queue lag.
- Profiling:
  - Node CPU/heap snapshots for API services.
  - Python cProfile/py-spy for AI inference bottlenecks.

## 15. Expansion Roadmap to 100K+ LOC

### Phase 1 (Foundation)
- Implement strict domain entities and repositories per service.
- Add DB migrations with versioned scripts.
- Add OpenAPI specs for every service.

### Phase 2 (Feature Complete)
- Full mobile screens and state management.
- Real-time battles with WebSockets.
- AI tutor long-context session memory.

### Phase 3 (Scale + Intelligence)
- Multi-region active-active deployment.
- Online learning-to-rank with bandit feedback.
- Experiment platform with feature flags and A/B allocation.

### Phase 4 (Enterprise Hardening)
- Tenant isolation and admin policy engine.
- Advanced audit and compliance evidence exports.
- Cost-aware autoscaling and model inference routing.
