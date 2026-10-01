import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This web/ app lives inside the Python repo; pin the Turbopack root to this
  // folder so Next doesn't try to resolve lockfiles from the repo root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
