/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Only known image hosts are whitelisted
    // Admin-managed thumbnails should use Supabase storage or pre-approved hosts
    // Add new hosts here when needed - wildcard bypasses security
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "www.organicbutchery.co.uk" },
      { protocol: "https", hostname: "www.allrecipes.com" },
      { protocol: "https", hostname: "bromfieldsbutchers.co.uk" },
      { protocol: "https", hostname: "cdn.britannica.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "funcakes.com" },
      { protocol: "https", hostname: "healthyrecipesblogs.com" },
      { protocol: "https", hostname: "images.getrecipekit.com" },
      { protocol: "https", hostname: "www.connoisseurusveg.com" },
      { protocol: "https", hostname: "www.thetakeout.com" },
    ],
    minimumCacheTTL: 3600,
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};

export default nextConfig;
