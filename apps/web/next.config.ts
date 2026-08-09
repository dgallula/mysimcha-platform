import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin tracing to the monorepo root (avoids a parent lockfile outside this repo)
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@mysimcha/auth", "@mysimcha/database", "@mysimcha/shared"],
};

export default nextConfig;
