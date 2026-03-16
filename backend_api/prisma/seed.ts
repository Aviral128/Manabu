import bcrypt from "bcryptjs";
import { PrismaClient, Role, UserStatus } from "@prisma/client";

import { getSeedQuizzes } from "./quizBank";

const prisma = new PrismaClient();

const ADMIN_PASSWORD = "Sultaniya128";
const ADMIN_ACCOUNTS = [
  { name: "Aviral Sultaniya", email: "sultaniyaaviral@gmail.com" },
  { name: "Aviral Sultaniya", email: "codemva2025@gmail.com" },
];

async function ensureAdminAccount(input: { name: string; email: string }) {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const normalizedEmail = input.email.trim().toLowerCase();

  return prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    },
    create: {
      name: input.name,
      email: normalizedEmail,
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    },
  });
}

async function upsertUser(name: string, email: string, password: string, role: Role) {
  const passwordHash = await bcrypt.hash(password, 10);
  const normalizedEmail = email.trim().toLowerCase();

  return prisma.user.upsert({
    where: { email: normalizedEmail },
    update: { name, passwordHash, role, status: UserStatus.ACTIVE, isEmailVerified: true },
    create: { name, email: normalizedEmail, passwordHash, role, status: UserStatus.ACTIVE, isEmailVerified: true },
  });
}

async function seedLeaderboard(userId: string, points: number, streak: number, badges: string[]) {
  await prisma.leaderboard.upsert({
    where: { userId },
    update: {
      points,
      level: Math.max(1, Math.floor(points / 150) + 1),
      streak,
      badges,
    },
    create: {
      userId,
      points,
      level: Math.max(1, Math.floor(points / 150) + 1),
      badges,
      streak,
    },
  });
}

async function ensureLeaderboard(userId: string, points: number, streak: number, badges: string[]) {
  await prisma.leaderboard.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      points,
      level: Math.max(1, Math.floor(points / 150) + 1),
      badges,
      streak,
    },
  });
}

async function seedQuiz(quizData: ReturnType<typeof getSeedQuizzes>[number]) {
  const existing = await prisma.quiz.findUnique({
    where: { slug: quizData.slug },
  });

  if (existing) {
    await prisma.question.deleteMany({
      where: { quizId: existing.id },
    });
  }

  await prisma.quiz.upsert({
    where: { slug: quizData.slug },
    update: {
      title: quizData.title,
      description: quizData.description,
      category: quizData.category,
      difficulty: quizData.difficulty,
      estimatedMinutes: quizData.estimatedMinutes,
      isSpecial: quizData.isSpecial,
      tags: quizData.tags,
      questions: { create: quizData.questions },
    },
    create: {
      title: quizData.title,
      slug: quizData.slug,
      description: quizData.description,
      category: quizData.category,
      difficulty: quizData.difficulty,
      estimatedMinutes: quizData.estimatedMinutes,
      isSpecial: quizData.isSpecial,
      tags: quizData.tags,
      questions: { create: quizData.questions },
    },
  });
}

async function main() {
  const [admin, adminTwo] = await Promise.all(ADMIN_ACCOUNTS.map((account) => ensureAdminAccount(account)));

  const learner = await upsertUser(
    "Learner Demo",
    "learner@manabu.app",
    "StrongPass123",
    Role.LEARNER
  );

  const learnerTwo = await upsertUser(
    "Curious Scholar",
    "scholar@manabu.app",
    "StrongPass123",
    Role.LEARNER
  );

  await ensureLeaderboard(admin.id, 540, 9, ["Founder", "Admin"]);
  await ensureLeaderboard(adminTwo.id, 480, 7, ["Founder", "Admin"]);
  await seedLeaderboard(learner.id, 220, 4, ["Starter", "Quiz Sprint"]);
  await seedLeaderboard(learnerTwo.id, 170, 2, ["Starter"]);

  for (const quiz of getSeedQuizzes()) {
    await seedQuiz(quiz);
  }

  console.log("Seeded MANABU backend API data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
