/**
 * Shared HTTP security headers for Next.js apps.
 * HSTS is production-only so local HTTP keeps working.
 */

export type SecurityHeader = { key: string; value: string };

export type NextSecurityHeadersOptions = {
  isProduction?: boolean;
  noIndex?: boolean;
};

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export function securityHeaders(options: NextSecurityHeadersOptions = {}): SecurityHeader[] {
  const isProduction = options.isProduction ?? process.env.NODE_ENV === "production";

  const headers: SecurityHeader[] = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-DNS-Prefetch-Control", value: "on" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    },
    { key: "Content-Security-Policy", value: CSP },
  ];

  if (options.noIndex) {
    headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
  }

  if (isProduction) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}

export function nextSecurityHeaders(options: NextSecurityHeadersOptions = {}) {
  return [
    {
      source: "/:path*",
      headers: securityHeaders(options),
    },
  ];
}
