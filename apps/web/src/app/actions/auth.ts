"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import {
  assertAuthRateLimits,
  hashPassword,
  signIn,
  signOut,
} from "@mysimcha/auth";
import {
  assertUniqueOrganizationSlug,
  findUserByEmail,
  registerUserWithOrganization,
} from "@mysimcha/database";
import {
  loginSchema,
  RateLimitExceededError,
  registerSchema,
  slugifyOrganizationName,
} from "@mysimcha/shared";

export type AuthActionState = {
  ok: boolean;
  error?: string;
};

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

function rateLimitMessage(): string {
  return "Too many attempts. Please wait and try again.";
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    organizationName: formData.get("organizationName"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Please check your details and try again." };
  }

  try {
    await assertAuthRateLimits({
      kind: "register",
      ip: await clientIp(),
      email: parsed.data.email,
    });
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return { ok: false, error: rateLimitMessage() };
    }
    throw error;
  }

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const baseSlug = slugifyOrganizationName(parsed.data.organizationName);
  const slug = await assertUniqueOrganizationSlug(baseSlug);
  const passwordHash = await hashPassword(parsed.data.password);

  await registerUserWithOrganization({
    email: parsed.data.email,
    name: parsed.data.name,
    passwordHash,
    organizationName: parsed.data.organizationName,
    organizationSlug: slug,
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Account created, but sign-in failed. Please log in." };
    }
    throw error;
  }

  return { ok: true };
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid email or password." };
  }

  try {
    await assertAuthRateLimits({
      kind: "login",
      ip: await clientIp(),
      email: parsed.data.email,
    });
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return { ok: false, error: rateLimitMessage() };
    }
    throw error;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Invalid email or password." };
    }
    throw error;
  }

  return { ok: true };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
