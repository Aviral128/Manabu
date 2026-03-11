import { prisma } from "../lib/prisma";

export async function logAdminAction(input: {
  actorId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: unknown;
}) {
  await prisma.adminLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata as object | undefined,
    },
  });
}

export async function createMonitoringEvent(input: {
  actorId?: string;
  source: "user_web" | "admin_panel" | "mobile_app" | "backend";
  level: "error" | "warning" | "info";
  message: string;
  metadata?: unknown;
}) {
  await prisma.adminLog.create({
    data: {
      actorId: input.actorId,
      action: `monitoring.${input.level}`,
      targetType: "monitoring",
      targetId: input.source,
      metadata: {
        source: input.source,
        level: input.level,
        message: input.message,
        ...(typeof input.metadata === "object" && input.metadata !== null ? (input.metadata as object) : {}),
      },
    },
  });
}

export async function listAdminLogs() {
  const rows = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: true },
  });

  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    targetType: row.targetType,
    targetId: row.targetId,
    metadata: row.metadata,
    createdAt: row.createdAt,
    actor: row.actor
      ? {
          userId: row.actor.id,
          displayName: row.actor.name,
          email: row.actor.email,
        }
      : null,
  }));
}

export async function getAdminSummary() {
  const [users, activeUsers, suspendedUsers, quizzes, attempts, monitoringEvents] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.quiz.count(),
    prisma.quizAttempt.count(),
    prisma.adminLog.count({ where: { targetType: "monitoring" } }),
  ]);

  return {
    users,
    activeUsers,
    suspendedUsers,
    quizzes,
    attempts,
    monitoringEvents,
    generatedAt: new Date().toISOString(),
  };
}
