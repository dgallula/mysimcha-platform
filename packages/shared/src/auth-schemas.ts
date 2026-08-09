import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320).transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(128),
  organizationName: z.string().trim().min(1).max(120),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email().max(320).transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

export function slugifyOrganizationName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base.length > 0 ? base : "org";
}
