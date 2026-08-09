/**
 * User accessors for credentials auth.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "./client";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function findActiveUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      status: "ACTIVE",
      deletedAt: null,
    },
  });
}

export type CreateUserWithPasswordInput = {
  email: string;
  name: string;
  passwordHash: string;
  locale?: string;
};

export async function createUserWithPassword(
  input: CreateUserWithPasswordInput,
  tx: Prisma.TransactionClient = prisma,
) {
  return tx.user.create({
    data: {
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash: input.passwordHash,
      locale: input.locale ?? "en",
      status: "ACTIVE",
    },
  });
}

export async function registerUserWithOrganization(input: {
  email: string;
  name: string;
  passwordHash: string;
  organizationName: string;
  organizationSlug: string;
  locale?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const user = await createUserWithPassword(
      {
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
        locale: input.locale,
      },
      tx,
    );

    const organization = await tx.organization.create({
      data: {
        name: input.organizationName,
        slug: input.organizationSlug,
        billingEmail: input.email.toLowerCase(),
        locale: input.locale ?? "en",
        memberships: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        memberships: true,
      },
    });

    return { user, organization, membership: organization.memberships[0]! };
  });
}
