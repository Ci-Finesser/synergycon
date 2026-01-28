/** @type {import('next').NextConfig} */

const nextConfig = {
  // Image optimization
  images: {
    unoptimized: process.env.NODE_ENV === 'development' ? true : false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    // Cache images for better performance
    minimumCacheTTL: 60,
  },

  // React optimizations
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compress: true,
  output: 'standalone',

  // Turbopack configuration
  turbopack: {},

  // Compilation optimizations
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  
  // PWA Configuration
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache icons for better performance
      {
        source: '/icon-:size(.*)\\.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Development optimization
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 60 * 1000, // 60 seconds
      pagesBufferLength: 5,
    },
  }),

  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['@radix-ui/react-*'],
  },
}

export default nextConfig
