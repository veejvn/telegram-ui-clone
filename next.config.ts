import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    transpilePackages: ['matrix-js-sdk'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'matrix.org',
                pathname: '/_matrix/media/**',
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;


