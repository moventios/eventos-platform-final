/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@eventos/ui',
    '@eventos/core',
    '@eventos/contracts',
    '@eventos/infrastructure',
    '@eventos/database',
  ],
  serverExternalPackages: ['@opentelemetry/auto-instrumentations-node'],
  outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
