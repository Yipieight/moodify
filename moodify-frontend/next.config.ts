import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during builds to allow warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Configure headers for security and CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        // CORS configuration for API routes
        source: '/api/:path*',
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
          { key: "Access-Control-Max-Age", value: "86400" }, // 24 hours
        ]
      },
      {
        // Special CORS configuration for health endpoint (public)
        source: '/api/health',
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
          { key: "Access-Control-Max-Age", value: "86400" }, // 24 hours
        ]
      },
    ]
  },
};

export default nextConfig;
