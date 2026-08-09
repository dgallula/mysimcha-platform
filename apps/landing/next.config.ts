import path from "node:path";
import type { NextConfig } from "next";
import { nextSecurityHeaders } from "@mysimcha/config";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@mysimcha/branding", "@mysimcha/ui", "@mysimcha/config", "@mysimcha/shared"],
  async headers() {
    return nextSecurityHeaders({ noIndex: false });
  },
};

export default nextConfig;
