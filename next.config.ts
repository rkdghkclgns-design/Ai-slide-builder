import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.GITHUB_PAGES === "true" ? "/Ai-slide-builder" : "",
  },
};

export default nextConfig;
