/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },

  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  //   // buildExcludes: [/.map$/],
  //   disable: process.env.NODE_ENV === 'development'
  //   // swSrc: 'service-worker.js'
  // },

  async redirects() {
    return [
      {
        source: '/clients/:clientId',
        destination: '/clients',
        permanent: true
      },
      {
        source: '/clients/:clientId/projects',
        destination: '/projects',
        permanent: true
      },
      {
        source: '/clients/:clientId/projects/:projectId/localizations',
        destination: '/clients/:clientId/projects/:projectId',
        permanent: true
      },
      {
        source: '/clients/:clientId/projects/:projectId/localizations/:localizationId',
        destination: '/clients/:clientId/projects/:projectId',
        permanent: true
      },
      {
        source: '/localizations/:localizationId/tasks',
        destination: '/localizations/:localizationId',
        permanent: true
      }
    ];
  }
};

module.exports = withPWA(nextConfig);
