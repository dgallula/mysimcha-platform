/**
 * @mysimcha/config — shared tooling presets and env schema contracts.
 */

import { z } from "zod";

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  DEFAULT_BRAND: z.string().default("mybatmitzvah"),
  DEFAULT_LOCALE: z.string().default("en"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(env: NodeJS.ProcessEnv = process.env): ServerEnv {
  return serverEnvSchema.parse(env);
}
