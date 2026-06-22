import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Parent home dir has another package-lock.json — pin root to this app
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
