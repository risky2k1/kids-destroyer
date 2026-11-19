import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Voice answers (≤ 60s audio, bucket limit 2 MB) are uploaded through a server action.
  experimental: { serverActions: { bodySizeLimit: '3mb' } },
};

export default nextConfig;
