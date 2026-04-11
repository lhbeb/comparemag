/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' to enable API routes for Supabase integration
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false, // Enable image optimization
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
  },
}

export default nextConfig
