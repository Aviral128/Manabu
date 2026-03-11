const path = require("node:path");

const root = __dirname;

function service(name, relativePath, port) {
  return {
    name,
    cwd: path.join(root, "backend_services", "services", relativePath),
    script: "node",
    args: "dist/index.js",
    env: {
      NODE_ENV: "production",
      PORT: String(port),
    },
    env_production: {
      NODE_ENV: "production",
      PORT: String(port),
    },
  };
}

function nextApp(name, relativePath, port) {
  return {
    name,
    cwd: path.join(root, relativePath),
    script: path.join(root, relativePath, "node_modules", "next", "dist", "bin", "next"),
    args: `start -H 0.0.0.0 --port ${port}`,
    env: {
      NODE_ENV: "production",
      PORT: String(port),
    },
    env_production: {
      NODE_ENV: "production",
      PORT: String(port),
    },
  };
}

module.exports = {
  apps: [
    {
      name: "backend-api",
      cwd: path.join(root, "backend_api"),
      script: "node",
      args: "dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: "7200",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: "7200",
      },
    },
    service("api-gateway", "api-gateway", 7000),
    service("auth-service", "auth-service", 7001),
    service("user-service", "user-service", 7002),
    service("quiz-service", "quiz-service", 7003),
    service("learning-service", "learning-service", 7004),
    service("gamification-service", "gamification-service", 7005),
    service("social-service", "social-service", 7006),
    service("analytics-service", "analytics-service", 7007),
    service("content-service", "content-service", 7008),
    service("notification-service", "notification-service", 7009),
    service("sync-service", "sync-service", 7010),
    service("recommendation-service", "recommendation-service", 7011),
    {
      name: "ai-engine-fallback",
      cwd: path.join(root, "ai_engine"),
      script: "python",
      args: "local_server.py",
      interpreter: "none",
      env: {
        PYTHONUNBUFFERED: "1",
      },
      env_production: {
        PYTHONUNBUFFERED: "1",
      },
    },
    nextApp("admin-panel", "admin_panel", 3001),
    nextApp("user-web-app", "user_web_app", 3000),
  ],
};
