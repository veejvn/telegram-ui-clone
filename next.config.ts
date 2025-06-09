import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    transpilePackages: ['matrix-js-sdk'],
};

export default nextConfig;


