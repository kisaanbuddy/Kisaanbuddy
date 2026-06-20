import { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/blog-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://kisaanbuddy.com'
  const pages = [
    { url: '', changeScore: 1.0, changefreq: 'daily' as const },
    { url: '/weather', changeScore: 0.8, changefreq: 'daily' as const },
    { url: '/mandi', changeScore: 0.8, changefreq: 'daily' as const },
    { url: '/chatbot', changeScore: 0.7, changefreq: 'weekly' as const },
    { url: '/crop-predictor', changeScore: 0.7, changefreq: 'weekly' as const },
    { url: '/disease', changeScore: 0.7, changefreq: 'weekly' as const },
    { url: '/soil-health', changeScore: 0.7, changefreq: 'weekly' as const },
    { url: '/worker-connect', changeScore: 0.7, changefreq: 'weekly' as const },
    { url: '/khet-diary', changeScore: 0.7, changefreq: 'weekly' as const },
    { url: '/schemes', changeScore: 0.6, changefreq: 'weekly' as const },
    { url: '/about', changeScore: 0.6, changefreq: 'weekly' as const },
    { url: '/founders', changeScore: 0.5, changefreq: 'monthly' as const },
    { url: '/contact', changeScore: 0.5, changefreq: 'monthly' as const },
    { url: '/blog', changeScore: 0.8, changefreq: 'daily' as const },
    { url: '/impact', changeScore: 0.7, changefreq: 'weekly' as const },
    { url: '/privacy', changeScore: 0.3, changefreq: 'monthly' as const },
    { url: '/terms', changeScore: 0.3, changefreq: 'monthly' as const },
    { url: '/disclaimer', changeScore: 0.3, changefreq: 'monthly' as const },
    { url: '/cookie-policy', changeScore: 0.3, changefreq: 'monthly' as const },
  ]

  const blogPages = BLOG_POSTS.map((post) => ({
    url: `/blog/${post.slug}`,
    changeScore: 0.6,
    changefreq: 'weekly' as const,
  }))

  const allPages = [...pages, ...blogPages]

  return allPages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changefreq,
    priority: page.changeScore,
  }))
}
