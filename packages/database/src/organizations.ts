/**
 * Organization and membership accessors.
 * All org-scoped business reads must go through membership checks in @mysimcha/auth.
 */

import type { MembershipRole, Prisma } from "@prisma/client";
import { prisma } from "./client";
import { requireOrganizationId } from "./tenant";

export type CreateOrganizationWithOwnerInput = {
  name: string;
  slug: string;
  ownerUserId: string;
  billingEmail?: string | null;
  locale?: string;
};

export async function createOrganizationWithOwner(
  input: CreateOrganizationWithOwnerInput,
  tx: Prisma.TransactionClient = prisma,
) {
  const organization = await tx.organization.create({
    data: {
      name: input.name,
      slug: input.slug,
      billingEmail: input.billingEmail ?? null,
      locale: input.locale ?? "en",
      memberships: {
        create: {
          userId: input.ownerUserId,
          role: "OWNER",
        },
      },
    },
    include: {
      memberships: true,
    },
  });

  return organization;
}

export async function findMembership(organizationId: string, userId: string) {
  return prisma.membership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: requireOrganizationId(organizationId),
        userId,
      },
    },
    include: {
      organization: true,
    },
  });
}

export async function listMembershipsForUser(userId: string) {
  return prisma.membership.findMany({
    where: { userId },
    include: {
      organization: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPrimaryMembership(userId: string) {
  const memberships = await listMembershipsForUser(userId);
  return memberships[0] ?? null;
}

export async function assertUniqueOrganizationSlug(slug: string): Promise<string> {
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (!existing) return slug;

  for (let i = 2; i < 1000; i += 1) {
    const candidate = `${slug}-${i}`;
    const taken = await prisma.organization.findUnique({ where: { slug: candidate } });
    if (!taken) return candidate;
  }

  throw new Error("Unable to allocate unique organization slug");
}

export async function updateMembershipRole(
  organizationId: string,
  userId: string,
  role: MembershipRole,
) {
  return prisma.membership.update({
    where: {
      organizationId_userId: {
        organizationId: requireOrganizationId(organizationId),
        userId,
      },
    },
    data: { role },
  });
}
