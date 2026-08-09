import path from "node:path";
import type { NextConfig } from "next";
import { nextSecurityHeaders } from "@mysimcha/config";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@mysimcha/config"],
  async headers() {
    return nextSecurityHeaders({ noIndex: true });
  },
};

export default nextConfig;
