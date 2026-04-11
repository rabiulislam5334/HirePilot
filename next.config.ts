import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,

  // PPR (Partial Prerendering) + Cache Components enable করার জন্য
  cacheComponents: true,     // ← এটাই নতুন সঠিক উপায়
};

export default nextConfig;