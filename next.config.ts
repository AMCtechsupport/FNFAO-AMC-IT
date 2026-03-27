import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' https://*.clerk.dev https://*.clerk.accounts.dev;
              style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
              img-src 'self' data: blob: https:;
              connect-src 'self' https://*.clerk.dev https://*.clerk.accounts.dev https://*.supabase.co;
              frame-src https://*.clerk.accounts.dev;
              object-src 'none';
              frame-ancestors 'none';
            `.replace(/\s+/g, " ").trim(),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
