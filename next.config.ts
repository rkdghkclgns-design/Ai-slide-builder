import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGitHubPages ? "/Ai-slide-builder" : "",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? "/Ai-slide-builder" : "",
  },
};

export default nextConfig;
