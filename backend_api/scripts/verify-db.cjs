const path = require("node:path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const expectedTables = [
  "users",
  "quizzes",
  "questions",
  "quiz_attempts",
  "leaderboard",
  "admin_logs",
  "magic_link_tokens",
  "password_reset_tokens",
];

const retiredTables = ["email_otps"];

async function main() {
  const prisma = new PrismaClient();

  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY (ARRAY['users', 'quizzes', 'questions', 'quiz_attempts', 'leaderboard', 'admin_logs', 'magic_link_tokens', 'password_reset_tokens', 'email_otps'])
      ORDER BY table_name
    `);

    const foundTables = rows.map((row) => row.table_name);
    const missingTables = expectedTables.filter((table) => !foundTables.includes(table));
    const unexpectedTables = retiredTables.filter((table) => foundTables.includes(table));

    if (missingTables.length > 0) {
      console.error(`Missing public tables: ${missingTables.join(", ")}`);
      process.exitCode = 1;
      return;
    }

    if (unexpectedTables.length > 0) {
      console.error(`Retired tables still present: ${unexpectedTables.join(", ")}`);
      process.exitCode = 1;
      return;
    }

    console.log(`Verified public tables: ${foundTables.join(", ")}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
