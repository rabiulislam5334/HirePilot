import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',        
  poweredByHeader: false,
  experimental: {
    ppr: 'incremental',
  },
};

export default nextConfig;