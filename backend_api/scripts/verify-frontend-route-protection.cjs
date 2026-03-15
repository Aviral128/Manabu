const path = require("node:path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { spawn } = require("node:child_process");
const { PrismaClient, Role, UserStatus } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const WEB_PORT = 3100;
const WEB_BASE_URL = `http://127.0.0.1:${WEB_PORT}`;
const API_BASE_URL = process.env.API_BASE_URL || "https://manabu-production.up.railway.app";
const CMD_PATH = process.env.ComSpec || "C:\\Windows\\System32\\cmd.exe";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForWebServer() {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < 30_000) {
    try {
      const response = await fetch(`${WEB_BASE_URL}/login`, { redirect: "manual" });
      if (response.status >= 200) {
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await sleep(500);
  }

  throw lastError ?? new Error("Frontend server did not become ready in time.");
}

function buildAuthCookies(token) {
  return [
    `manabu_access_token=${token}`,
    "manabu_authenticated=1",
    "manabu_role=learner",
  ].join("; ");
}

async function request(pathname, cookies) {
  const response = await fetch(`${WEB_BASE_URL}${pathname}`, {
    redirect: "manual",
    headers: cookies ? { Cookie: cookies } : {},
  });
  return {
    status: response.status,
    location: response.headers.get("location"),
    setCookie: response.headers.get("set-cookie"),
    body: await response.text(),
  };
}

async function main() {
  const prisma = new PrismaClient();
  const email = `codex-frontend-route-${Date.now()}@example.com`;
  const password = "StrongPass123";
  let userId = "";
  let nextProcess = null;

  try {
    const user = await prisma.user.create({
      data: {
        name: "Frontend Route Smoke",
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: Role.LEARNER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
    });
    userId = user.id;

    nextProcess = spawn(CMD_PATH, ["/c", `npx next start -H 127.0.0.1 --port ${WEB_PORT}`], {
      cwd: path.resolve(__dirname, "../../user_web_app"),
      env: { ...process.env, API_BASE_URL },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let nextLogs = "";
    nextProcess.stdout.on("data", (chunk) => {
      nextLogs += chunk.toString();
    });
    nextProcess.stderr.on("data", (chunk) => {
      nextLogs += chunk.toString();
    });

    await waitForWebServer();

    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const loginBody = await loginResponse.json();
    if (loginResponse.status !== 200 || !loginBody.token) {
      throw new Error(`Failed to get learner token from backend: ${loginResponse.status} ${JSON.stringify(loginBody)}`);
    }

    const learnerCookies = buildAuthCookies(loginBody.token);

    const anonDashboard = await request("/dashboard");
    const anonQuiz = await request("/quiz");
    const anonAdmin = await request("/admin");
    const authDashboard = await request("/dashboard", learnerCookies);
    const authAdmin = await request("/admin", learnerCookies);
    const authLogin = await request("/login", learnerCookies);

    if (anonDashboard.status !== 307 || !anonDashboard.location?.includes("/login?next=%2Fdashboard")) {
      throw new Error(`Anonymous /dashboard guard failed: ${JSON.stringify(anonDashboard)}`);
    }
    if (anonQuiz.status !== 307 || !anonQuiz.location?.includes("/login?next=%2Fquiz")) {
      throw new Error(`Anonymous /quiz guard failed: ${JSON.stringify(anonQuiz)}`);
    }
    if (anonAdmin.status !== 307 || !anonAdmin.location?.includes("/login?next=%2Fadmin")) {
      throw new Error(`Anonymous /admin guard failed: ${JSON.stringify(anonAdmin)}`);
    }
    if (authDashboard.status !== 200) {
      throw new Error(`Authenticated /dashboard failed: ${JSON.stringify(authDashboard)}`);
    }
    if (authAdmin.status !== 403 || !/Unauthorized/i.test(authAdmin.body)) {
      throw new Error(`Learner /admin guard failed: ${JSON.stringify(authAdmin)}`);
    }
    const showsLoginControls = /Send login link|Continue with password|Google login coming soon/i.test(authLogin.body);
    const authLoginAccepted =
      (authLogin.status === 307 && authLogin.location === "/app/dashboard") ||
      (authLogin.status === 200 && !showsLoginControls && /Loading MANABU|Redirecting/i.test(authLogin.body));
    if (!authLoginAccepted) {
      throw new Error(`Authenticated /login guard failed: ${JSON.stringify(authLogin)}`);
    }

    console.log(
      `Verified frontend route protection: ${JSON.stringify({
        anonDashboard: { status: anonDashboard.status, location: anonDashboard.location },
        anonQuiz: { status: anonQuiz.status, location: anonQuiz.location },
        anonAdmin: { status: anonAdmin.status, location: anonAdmin.location },
        authDashboard: { status: authDashboard.status },
        authAdmin: { status: authAdmin.status, body: authAdmin.body },
        authLogin: { status: authLogin.status, location: authLogin.location, setCookie: authLogin.setCookie },
      })}`,
    );
  } finally {
    if (nextProcess && !nextProcess.killed) {
      nextProcess.kill();
    }

    if (userId) {
      await prisma.emailVerificationToken.deleteMany({ where: { userId } });
      await prisma.leaderboard.deleteMany({ where: { userId } });
    }
    await prisma.passwordResetToken.deleteMany({ where: { email } });
    await prisma.magicLinkToken.deleteMany({ where: { email } });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
