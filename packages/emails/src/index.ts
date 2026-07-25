/**
 * @mysimcha/emails — Resend + React Email template registry.
 */

export type EmailTemplateKey =
  | "auth.magic-link"
  | "org.invite"
  | "event.invitation"
  | "event.rsvp-confirmation"
  | "billing.invoice";

export type SendEmailInput = {
  to: string | string[];
  template: EmailTemplateKey;
  locale?: string;
  brandSlug?: string;
  variables: Record<string, unknown>;
};

export type SendEmailResult = {
  id: string;
  provider: "resend";
};

/** Template keys registered for the platform — bodies added in feature phase. */
export const EMAIL_TEMPLATES: readonly EmailTemplateKey[] = [
  "auth.magic-link",
  "org.invite",
  "event.invitation",
  "event.rsvp-confirmation",
  "billing.invoice",
] as const;
