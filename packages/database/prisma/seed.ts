import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEV_PASSWORD = "password123";

async function seedOwner() {
  const email = "owner@example.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.warn("Seed owner already exists:", email);
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: "Demo Owner",
      passwordHash: await hash(DEV_PASSWORD, 12),
      status: "ACTIVE",
      memberships: {
        create: {
          role: "OWNER",
          organization: {
            create: {
              name: "Demo Organization",
              slug: "demo-org",
              billingEmail: email,
            },
          },
        },
      },
    },
    include: {
      memberships: { include: { organization: true } },
    },
  });

  console.warn("Seeded owner:", user.email);
  console.warn("Organization:", user.memberships[0]?.organization.slug);
}

async function seedPlatformAdmin() {
  const email = "admin@example.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (!existing.platformRole) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { platformRole: "PLATFORM_SUPER" },
      });
      console.warn("Updated existing user to PLATFORM_SUPER:", email);
    } else {
      console.warn("Seed platform admin already exists:", email);
    }
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name: "Platform Super",
      passwordHash: await hash(DEV_PASSWORD, 12),
      status: "ACTIVE",
      platformRole: "PLATFORM_SUPER",
    },
  });

  console.warn("Seeded platform admin:", email);
}

async function main() {
  await seedOwner();
  await seedPlatformAdmin();
  console.warn("Dev password:", DEV_PASSWORD);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
