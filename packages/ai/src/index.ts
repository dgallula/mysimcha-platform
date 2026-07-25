/**
 * @mysimcha/ai — provider-agnostic AI gateway contracts.
 */

export type AiProvider = "openai" | "anthropic";

export type AiGenerateInput = {
  organizationId: string;
  eventId?: string;
  purpose: string;
  prompt: string;
  locale?: string;
  brandSlug?: string;
  provider?: AiProvider;
};

export type AiGenerateResult = {
  output: string;
  provider: AiProvider;
  model: string;
  tokensIn?: number;
  tokensOut?: number;
  promptHash: string;
};
