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
          {
              protocol: 'https',
              hostname: '*.matrix.org',
          },
          {
              protocol: 'https',
              hostname: 'matrix-client.matrix.org',
          },
      ],
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  eslint: {
      ignoreDuringBuilds: true,
  },
  assetPrefix: '/chat-static',
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/chat-static/_next/:path+',
          destination: '/_next/:path+',
        },
      ],
    }
  },
  // experimental: {
  //   serverActions: {
  //     allowedOrigins: ['http://localhost:3000'],
  //   },
  // },
};

export default nextConfig;


