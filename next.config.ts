import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:;
            worker-src 'self' blob:;
            style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
            img-src 'self' data: blob: https:;
            frame-src 'self' blob:;
            connect-src 'self';
            object-src 'none';
            frame-ancestors 'none';
          `.replace(/\s+/g, " ").trim(),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
