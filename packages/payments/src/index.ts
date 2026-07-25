/**
 * @mysimcha/payments — Stripe integration boundary.
 * No live API calls in foundation; defines contracts and env keys.
 */

export const STRIPE_API_VERSION = "2024-11-20.acacia" as const;

export type StripeEnv = {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
};

export type CheckoutSessionInput = {
  organizationId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
};

export type Entitlement = {
  feature: string;
  enabled: boolean;
  limit?: number;
};

/**
 * Map plan feature JSON → entitlements.
 * Implemented when billing features land.
 */
export function emptyEntitlements(): Entitlement[] {
  return [];
}
