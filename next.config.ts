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

    // 👇 Cấu hình thêm webpack loader cho SVG
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            issuer: /\.[jt]sx?$/,
            use: [
                {
                    loader: "@svgr/webpack",
                    options: {
                        icon: true,
                        svgoConfig: {
                            plugins: [
                                {
                                    name: "preset-default",
                                    params: {
                                        overrides: {
                                            removeViewBox: false,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            ],
        });

        return config;
    },
};

export default nextConfig;
