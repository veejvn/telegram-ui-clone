import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    basePath: '/chat',
    reactStrictMode: true,
    transpilePackages: ['matrix-js-sdk'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'matrix.teknix.dev',
                pathname: '/_matrix/media/**',
            },
            {
                protocol: 'https',
                hostname: '*.matrix.teknix.dev',
            },
            {
                protocol: 'https',
                hostname: 'matrix-client.matrix.teknix.dev',
            },
            {
            protocol: 'https',
            hostname: 'www.google.com',
            pathname: '/s2/favicons**',
            },
        ],
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Đã xoá custom webpack cho SVG!
};

export default nextConfig;
