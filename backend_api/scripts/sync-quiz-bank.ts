import { PrismaClient } from "@prisma/client";

import { getSeedQuizzes } from "../prisma/quizBank";

const prisma = new PrismaClient();

async function syncQuizBank() {
  for (const quizData of getSeedQuizzes()) {
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
}

syncQuizBank()
  .then(async () => {
    console.log("Synchronized MANABU quiz bank.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
