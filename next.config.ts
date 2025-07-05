import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    transpilePackages: ["matrix-js-sdk"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "matrix.org",
                pathname: "/_matrix/media/**",
            },
            {
                protocol: "https",
                hostname: "*.matrix.org",
            },
            {
                protocol: "https",
                hostname: "matrix-client.matrix.org",
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
