import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Event images are arbitrary admin-supplied URLs, so they are rendered with
  // a plain <img> + graceful fallback instead of next/image optimisation.
};

export default nextConfig;
