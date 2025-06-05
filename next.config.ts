import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    transpilePackages: ['matrix-js-sdk'],
};

export default nextConfig;


