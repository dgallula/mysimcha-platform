import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "owner@example.com";
  const passwordHash = await hash("password123", 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Seed user already exists:", email);
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: "Demo Owner",
      passwordHash,
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

  console.log("Seeded user:", user.email);
  console.log("Organization:", user.memberships[0]?.organization.slug);
  console.log("Password: password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
