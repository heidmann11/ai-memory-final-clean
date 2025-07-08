/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/route-optimizer',
        permanent: true, // 308 redirect
      },
    ];
  },

  // ← Remove any rewrites() block you added earlier.
};

module.exports = nextConfig;
