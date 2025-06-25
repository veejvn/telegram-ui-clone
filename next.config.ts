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
};

export default nextConfig;


