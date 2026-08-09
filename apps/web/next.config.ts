import path from "node:path";
import type { NextConfig } from "next";
import { nextSecurityHeaders } from "@mysimcha/config";

process.env.AUTH_URL ??= "http://localhost:3000";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: [
    "@mysimcha/auth",
    "@mysimcha/database",
    "@mysimcha/shared",
    "@mysimcha/branding",
    "@mysimcha/ui",
    "@mysimcha/config",
  ],
  async headers() {
    return nextSecurityHeaders({ noIndex: true });
  },
};

export default nextConfig;
