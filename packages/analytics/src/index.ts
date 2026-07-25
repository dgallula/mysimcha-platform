/**
 * @mysimcha/analytics — PostHog tracking boundary.
 */

export type AnalyticsIdentify = {
  userId: string;
  properties?: Record<string, unknown>;
};

export type AnalyticsCapture = {
  event: string;
  distinctId?: string;
  organizationId?: string;
  brandSlug?: string;
  properties?: Record<string, unknown>;
};

export const ANALYTICS_EVENTS = {
  userSignedUp: "user_signed_up",
  eventCreated: "event_created",
  eventPublished: "event_published",
  rsvpSubmitted: "rsvp_submitted",
  checkoutStarted: "checkout_started",
  subscriptionActive: "subscription_active",
} as const;
