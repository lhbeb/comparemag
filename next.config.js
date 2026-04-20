/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: "export" to enable API routes for Supabase integration
  // If you need static export for deployment, use a different deployment strategy
  images: {
    unoptimized: false,
    qualities: [75, 85],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.imgix.net',
      },
    ],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },
  // Removed basePath and trailingSlash for cleaner URLs with API routes
}

module.exports = nextConfig
