import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Cloudflare Pages-də statik sayt kimi işləməsi üçün vacibdir
  images: {
    unoptimized: true, // Statik export zamanı şəkillər üçün bu lazımdır
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
