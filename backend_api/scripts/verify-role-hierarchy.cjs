const path = require("node:path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { PrismaClient, Role, UserStatus } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const { createApp } = require("../dist/app");
  const { signToken } = require("../dist/utils/jwt");
  const prisma = new PrismaClient();
  const app = createApp();
  const timestamp = Date.now();
  const presetAdminEmails = ["codemva2025@gmail.com", "sultaniyaaviral@gmail.com"];
  const managerEmail = `codex-manager-${timestamp}@example.com`;
  const learnerEmail = `codex-learner-${timestamp}@example.com`;
  const learnerTwoEmail = `codex-learner-two-${timestamp}@example.com`;
  let createdAdminUserId = null;
  let managerUserId = null;
  let learnerUserId = null;
  let learnerTwoUserId = null;

  try {
    let adminUser = null;
    for (const email of presetAdminEmails) {
      adminUser = await prisma.user.findUnique({ where: { email } });
      if (adminUser) break;
    }

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: "Preset Admin",
          email: presetAdminEmails[0],
          passwordHash: await bcrypt.hash("StrongPass123", 10),
          role: Role.ADMIN,
          status: UserStatus.ACTIVE,
          isEmailVerified: true,
        },
      });
      createdAdminUserId = adminUser.id;
    }

    const managerUser = await prisma.user.create({
      data: {
        name: "Manager Smoke",
        email: managerEmail,
        passwordHash: await bcrypt.hash("StrongPass123", 10),
        role: Role.MANAGER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
    });
    managerUserId = managerUser.id;

    const learnerUser = await prisma.user.create({
      data: {
        name: "Learner Smoke",
        email: learnerEmail,
        passwordHash: await bcrypt.hash("StrongPass123", 10),
        role: Role.LEARNER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
    });
    learnerUserId = learnerUser.id;

    const learnerTwoUser = await prisma.user.create({
      data: {
        name: "Learner Two Smoke",
        email: learnerTwoEmail,
        passwordHash: await bcrypt.hash("StrongPass123", 10),
        role: Role.LEARNER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
    });
    learnerTwoUserId = learnerTwoUser.id;

    const adminToken = signToken({ userId: adminUser.id, email: adminUser.email, role: "admin" });
    const managerToken = signToken({ userId: managerUser.id, email: managerUser.email, role: "manager" });

    const payload = await new Promise((resolve, reject) => {
      const server = app.listen(0, "127.0.0.1", async () => {
        const address = server.address();

        try {
          const promoteResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/users/${learnerUser.id}`, {
            method: "PATCH",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ role: "manager" }),
          });

          const promoteBody = await promoteResponse.json();
          if (promoteResponse.status !== 200 || promoteBody.user?.role !== "manager") {
            throw new Error(`Admin promotion to manager failed: ${JSON.stringify(promoteBody)}`);
          }

          const listResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/users`, {
            method: "GET",
            headers: {
              authorization: `Bearer ${managerToken}`,
            },
          });

          const listBody = await listResponse.json();
          if (listResponse.status !== 200 || !Array.isArray(listBody)) {
            throw new Error(`Manager list-users access failed: ${JSON.stringify(listBody)}`);
          }

          const managerPromoteResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/users/${learnerTwoUser.id}`, {
            method: "PATCH",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${managerToken}`,
            },
            body: JSON.stringify({ role: "manager" }),
          });

          const managerPromoteBody = await managerPromoteResponse.json();
          if (managerPromoteResponse.status !== 403) {
            throw new Error(`Manager was incorrectly allowed to assign manager role: ${JSON.stringify(managerPromoteBody)}`);
          }

          const managerStatusResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/users/${learnerTwoUser.id}`, {
            method: "PATCH",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${managerToken}`,
            },
            body: JSON.stringify({ status: "suspended" }),
          });

          const managerStatusBody = await managerStatusResponse.json();
          if (managerStatusResponse.status !== 200 || managerStatusBody.user?.status !== "suspended") {
            throw new Error(`Manager status update failed: ${JSON.stringify(managerStatusBody)}`);
          }

          const managerDeleteResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/users/${learnerTwoUser.id}`, {
            method: "DELETE",
            headers: {
              authorization: `Bearer ${managerToken}`,
            },
          });

          const managerDeleteBody = await managerDeleteResponse.json();
          if (managerDeleteResponse.status !== 403) {
            throw new Error(`Manager was incorrectly allowed to delete users: ${JSON.stringify(managerDeleteBody)}`);
          }

          resolve({
            adminPromote: { status: promoteResponse.status, body: promoteBody },
            managerList: { status: listResponse.status, count: listBody.length },
            managerPromoteBlocked: { status: managerPromoteResponse.status, body: managerPromoteBody },
            managerUpdate: { status: managerStatusResponse.status, body: managerStatusBody },
            managerDeleteBlocked: { status: managerDeleteResponse.status, body: managerDeleteBody },
          });
        } catch (error) {
          reject(error);
        } finally {
          server.close();
        }
      });
    });

    console.log(`Verified role hierarchy flow: ${JSON.stringify(payload)}`);
  } finally {
    const targetIds = [managerUserId, learnerUserId, learnerTwoUserId].filter(Boolean);
    if (targetIds.length > 0) {
      await prisma.adminLog.deleteMany({
        where: {
          OR: [
            { actorId: { in: targetIds } },
            { targetId: { in: targetIds } },
          ],
        },
      }).catch(() => undefined);
    }

    await prisma.leaderboard.deleteMany({
      where: {
        user: {
          email: {
            in: [managerEmail, learnerEmail, learnerTwoEmail],
          },
        },
      },
    }).catch(() => undefined);

    await prisma.emailVerificationToken.deleteMany({
      where: {
        user: {
          email: {
            in: [managerEmail, learnerEmail, learnerTwoEmail],
          },
        },
      },
    }).catch(() => undefined);

    await prisma.passwordResetToken.deleteMany({
      where: { email: { in: [managerEmail, learnerEmail, learnerTwoEmail] } },
    }).catch(() => undefined);

    await prisma.magicLinkToken.deleteMany({
      where: { email: { in: [managerEmail, learnerEmail, learnerTwoEmail] } },
    }).catch(() => undefined);

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            managerEmail,
            learnerEmail,
            learnerTwoEmail,
            ...(createdAdminUserId ? [presetAdminEmails[0]] : []),
          ],
        },
      },
    }).catch(() => undefined);

    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
