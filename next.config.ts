import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Custom server handles the HTTP layer — Next.js is used as a framework only.
  // Do not set output: 'standalone' without updating the server entrypoint.

  experimental: {
    // Opt into React 19 server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
}

export default nextConfig
