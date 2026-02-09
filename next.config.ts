import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly set to server-side rendering (SSR) mode
  output: 'standalone',

  // Enable experimental features for better SSR performance
  images: {
    minimumCacheTTL: 60,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' && {
      exclude: ['error', 'warn'],
    },
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'lodash', 'recharts'],
  },
  async rewrites() {
    // Use API_URL (server-side only) to hide backend URL from client
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      console.warn('⚠️ API_URL not set, API proxy disabled')
      return []
    }
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
  // Security headers are handled in middleware.ts
};

export default nextConfig;
