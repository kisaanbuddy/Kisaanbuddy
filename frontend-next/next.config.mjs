/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://adservice.google.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://plus.unsplash.com https://pagead2.googlesyndication.com; connect-src 'self' https://pagead2.googlesyndication.com https://krishiai-api.onrender.com; frame-src 'self' https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com;"
          }
        ]
      }
    ];
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    return [
      // Auth
      {
        source: '/api/auth/:path*/',
        destination: `${backendUrl}/api/auth/:path*/`
      },
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/api/auth/:path*`
      },
      // Weather
      {
        source: '/api/weather/:path*/',
        destination: `${backendUrl}/api/weather/:path*/`
      },
      {
        source: '/api/weather/:path*',
        destination: `${backendUrl}/api/weather/:path*`
      },
      // ML
      {
        source: '/api/ml/:path*/',
        destination: `${backendUrl}/api/ml/:path*/`
      },
      {
        source: '/api/ml/:path*',
        destination: `${backendUrl}/api/ml/:path*`
      },
      // Chat
      {
        source: '/api/chat/:path*/',
        destination: `${backendUrl}/api/chat/:path*/`
      },
      {
        source: '/api/chat/:path*',
        destination: `${backendUrl}/api/chat/:path*`
      },
      // Worker Connect
      {
        source: '/api/worker-connect/:path*/',
        destination: `${backendUrl}/api/worker-connect/:path*/`
      },
      {
        source: '/api/worker-connect/:path*',
        destination: `${backendUrl}/api/worker-connect/:path*`
      },
      // Sensor
      {
        source: '/api/sensor/:path*/',
        destination: `${backendUrl}/api/sensor/:path*/`
      },
      {
        source: '/api/sensor/:path*',
        destination: `${backendUrl}/api/sensor/:path*`
      }
    ]
  }
}

export default nextConfig
