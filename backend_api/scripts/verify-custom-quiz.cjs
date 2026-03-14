const path = require("node:path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { PrismaClient, Role, UserStatus } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const { createApp } = require("../dist/app");
  const prisma = new PrismaClient();
  const email = `codex-custom-quiz-${Date.now()}@example.com`;
  const password = "StrongPass123";
  const app = createApp();

  try {
    await prisma.user.create({
      data: {
        name: "Custom Quiz Smoke",
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: Role.LEARNER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
    });

    const quiz = await prisma.quiz.findFirst({
      where: { slug: "biology-explorer" },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    if (!quiz || quiz.questions.length < 8) {
      throw new Error("Biology quiz bank is not available with enough questions for custom-quiz verification.");
    }

    const selectedQuestions = quiz.questions.slice(0, 7);

    const payload = await new Promise((resolve, reject) => {
      const server = app.listen(0, "127.0.0.1", async () => {
        const address = server.address();

        try {
          const loginResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const loginBody = await loginResponse.json();
          if (loginResponse.status !== 200 || loginBody.success !== true || !loginBody.token) {
            throw new Error(`Custom quiz login failed with status ${loginResponse.status}: ${JSON.stringify(loginBody)}`);
          }

          const attemptResponse = await fetch(`http://127.0.0.1:${address.port}/api/quizzes/${quiz.id}/attempts`, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${loginBody.token}`,
            },
            body: JSON.stringify({
              questionIds: selectedQuestions.map((question) => question.id),
              answers: selectedQuestions.map((question) => question.answerIndex),
            }),
          });

          const attemptBody = await attemptResponse.json();
          if (
            attemptResponse.status !== 201 ||
            attemptBody.success !== true ||
            attemptBody.totalQuestions !== selectedQuestions.length ||
            attemptBody.correctAnswers !== selectedQuestions.length
          ) {
            throw new Error(`Custom quiz attempt failed with status ${attemptResponse.status}: ${JSON.stringify(attemptBody)}`);
          }

          resolve({
            login: { status: loginResponse.status, body: loginBody },
            attempt: { status: attemptResponse.status, body: attemptBody },
          });
        } catch (error) {
          reject(error);
        } finally {
          server.close();
        }
      });
    });

    console.log(`Verified custom quiz flow: ${JSON.stringify(payload)}`);
  } finally {
    await prisma.quizAttempt.deleteMany({ where: { user: { email } } });
    await prisma.leaderboard.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
