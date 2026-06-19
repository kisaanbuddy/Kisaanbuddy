import type { Metadata } from 'next'
import BlogClient from './BlogClient'

export const metadata: Metadata = {
  title: 'KisaanBuddy Krishi Blog | AI for Every Farmer',
  description: 'Read expert agricultural advice, government schemes, soil health guides, weather-smart farming, and mandi reports on KisaanBuddy.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'KisaanBuddy Krishi Blog | AI for Every Farmer',
    description: 'Read expert agricultural advice, government schemes, soil health guides, weather-smart farming, and mandi reports on KisaanBuddy.',
    url: '/blog',
    type: 'website',
  },
}

export default function BlogPage() {
  return <BlogClient />
}
