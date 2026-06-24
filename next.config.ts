import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Disabled because Next.js image optimization requires a server-side
    // process that isn't available inside Electron's static file serving.
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
