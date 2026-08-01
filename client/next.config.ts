import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
      {
        protocol: 'https',
        hostname: 'vimeo.com',
      },
      {
        protocol: 'http',
        hostname: 'alween.com',
      },
      {
        protocol: 'https',
        hostname: 'alween.com',
      }
    ],
  },
};

export default nextConfig;
