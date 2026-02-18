/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply charset=UTF-8 explicitly to all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Content-Type', value: 'application/json; charset=UTF-8' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
