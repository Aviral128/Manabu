import bcrypt from "bcryptjs";
import { PrismaClient, Role, UserStatus } from "@prisma/client";

import { getSeedQuizzes } from "./quizBank";

const prisma = new PrismaClient();

async function upsertUser(name: string, email: string, password: string, role: Role) {
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role, status: UserStatus.ACTIVE, isEmailVerified: true },
    create: { name, email, passwordHash, role, status: UserStatus.ACTIVE, isEmailVerified: true },
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
  const admin = await upsertUser(
    "Aviral Sultaniya",
    "codemva2025@gmail.com",
    "StrongPass123",
    Role.ADMIN
  );

  const adminTwo = await upsertUser(
    "Aviral Sultaniya",
    "sultaniyaaviral@gmail.com",
    "StrongPass123",
    Role.ADMIN
  );

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

  await seedLeaderboard(admin.id, 540, 9, ["Founder", "Admin"]);
  await seedLeaderboard(adminTwo.id, 480, 7, ["Founder", "Admin"]);
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
