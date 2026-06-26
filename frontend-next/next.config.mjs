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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://adservice.google.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://plus.unsplash.com https://pagead2.googlesyndication.com;   connect-src 'self' https://pagead2.googlesyndication.com; https://krishiai-api.onrender.com; frame-src 'self' https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com;"
          }
        ]
      }
    ];
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    return [
      {
        source: '/api/:path*/',
        destination: `${backendUrl}/api/:path*/` // Preserve trailing slash
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*` // Proxy to backend
      }
    ]
  }
}

export default nextConfig
