/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for deployment
  output: 'standalone',

  // Only include allowedDevOrigins in development
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: [
      '192.168.1.158',
      '192.168.1.158:3000',
      '192.168.86.244',
      '192.168.86.244:3000',
      '192.168.12.121',
      '192.168.12.121:3000',
      '192.168.12.149',
      '192.168.12.149:3000',
      'localhost',
      'localhost:3000',
      'local-origin.dev',
      '*.local-origin.dev',
    ],
  }),

  // Image optimization configuration
  images: {
    // Disable remote patterns since we only use local images
    unoptimized: false,
    // Allow images from the public folder
    remotePatterns: [],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '0' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
