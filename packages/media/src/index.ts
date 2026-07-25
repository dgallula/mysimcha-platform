/**
 * @mysimcha/media — Cloudinary (primary) media boundary.
 */

export type MediaUploadSignInput = {
  organizationId: string;
  eventId?: string;
  folder?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
};

export type MediaUploadSignResult = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

export type TransformOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit";
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif";
};

export function buildOrgFolder(organizationId: string, eventId?: string): string {
  const base = `mysimcha/org/${organizationId}`;
  return eventId ? `${base}/events/${eventId}` : base;
}
