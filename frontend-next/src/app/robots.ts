import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kisaanbuddy.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/api',
          '/api/*',
          '/admin',
          '/admin/*',
          '/profile',
          '/profile/*',
          '/farmer-profile',
          '/farmer-profile/*',
          '/expert-dashboard',
          '/expert-dashboard/*',
          '/settings',
          '/settings/*',
          '/onboarding',
          '/onboarding/*',
          '/reports',
          '/reports/*',
          '/forgot-password',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
