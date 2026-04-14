/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: "export" to enable API routes for Supabase integration
  // If you need static export for deployment, use a different deployment strategy
  images: {
    unoptimized: false, // Enable image optimization for better performance
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co", // Allow Supabase storage images
      },
    ],
    // Disable optimization for Supabase images to avoid private IP resolution issues
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
