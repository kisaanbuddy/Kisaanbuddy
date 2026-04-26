/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
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
