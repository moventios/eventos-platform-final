/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@movent/ui',
    '@movent/core',
    '@movent/contracts',
    '@movent/infrastructure',
    '@movent/database',
  ],
  serverExternalPackages: ['@opentelemetry/auto-instrumentations-node'],
  outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/facilities',
        destination: '/venues',
        permanent: true,
      },
      {
        source: '/facilities/:id',
        destination: '/venues/:id',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
