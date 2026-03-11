# MANABU Redis Key Strategy

## Session and Auth
- `auth:session:{sessionId}` -> JWT session metadata (TTL 1h)
- `auth:refresh:{userId}:{tokenId}` -> refresh token tracking (TTL 30d)

## Caching
- `cache:quiz:questions:{topic}:{difficulty}:{version}` -> question bundle JSON (TTL 10m)
- `cache:learning:plan:{userId}` -> daily personalized plan (TTL 6h)
- `cache:user:profile:{userId}` -> profile aggregate (TTL 5m)

## Rate Limiting
- `rl:api:{route}:{userId}:{minute}` -> integer request count (TTL 120s)
- `rl:ai:{userId}:{minute}` -> AI endpoint count (TTL 120s)

## Leaderboards
- `zset:leaderboard:global:weekly` -> score sorted set
- `zset:leaderboard:global:monthly` -> score sorted set

## Offline Sync
- `sync:checkpoint:{userId}` -> latest server checkpoint token
- `sync:locks:{userId}` -> optimistic lock marker (TTL 30s)

## Notifications
- `queue:notifications:push` -> list stream for push jobs
- `queue:notifications:email` -> list stream for email jobs
