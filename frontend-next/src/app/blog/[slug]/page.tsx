import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BLOG_POSTS } from '@/lib/blog-data'
import BlogSlugClient from './BlogSlugClient'

interface Props {
  params: { slug: string }
}

const CATEGORY_META = {
  weather: {
    title: 'Weather & Climate Guides | KisaanBuddy',
    desc: 'Expert bilingual advice on farm weather preparedness, monsoon updates, and climate resilient crops.'
  },
  schemes: {
    title: 'Government Schemes & Subsidies | KisaanBuddy',
    desc: 'Step-by-step guides on applying for PM-Kisan, PM-KUSUM, crop insurance (PMFBY), and farm tool subsidies.'
  },
  soil: {
    title: 'Soil Health & Fertilizer Management | KisaanBuddy',
    desc: 'Learn about organic carbon, balanced NPK ratios, soil testing procedures, and micro-nutrient correction.'
  },
  mandi: {
    title: 'Mandi Rates & Trade Guides | KisaanBuddy',
    desc: 'Historical mandi price arrivals analysis, seasonal crop price trend forecasting, and selling via eNAM.'
  },
  disease: {
    title: 'Crop Diseases & Treatment | KisaanBuddy',
    desc: 'Bilingual diagnostic symptoms and treatment guides for wheat yellow rust, rice blast, and potato late blight.'
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  const categories = ['weather', 'schemes', 'soil', 'mandi', 'disease']
  const isCategory = categories.includes(slug)

  if (isCategory) {
    const meta = CATEGORY_META[slug as keyof typeof CATEGORY_META]
    return {
      title: meta?.title || 'KisaanBuddy Blog',
      description: meta?.desc || 'Agricultural advice',
      alternates: { canonical: `/blog/${slug}` }
    }
  }

  const post = BLOG_POSTS.find(p => p.slug === slug)
  if (!post) {
    return {
      title: 'Article Not Found | KisaanBuddy'
    }
  }

  return {
    title: `${post.title.en} | KisaanBuddy Blog`,
    description: post.description.en,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title.en,
      description: post.description.en,
      url: `/blog/${slug}`,
      type: 'article',
      images: [{ url: post.featuredImage, alt: post.title.en }],
      publishedTime: post.publishedDate,
      modifiedTime: post.updatedDate
    }
  }
}

export async function generateStaticParams() {
  const categories = ['weather', 'schemes', 'soil', 'mandi', 'disease']
  const postSlugs = BLOG_POSTS.map(post => post.slug)
  return [...categories, ...postSlugs].map(slug => ({ slug }))
}

export default function BlogSlugPage({ params }: Props) {
  const { slug } = params
  const categories = ['weather', 'schemes', 'soil', 'mandi', 'disease']
  const isCategory = categories.includes(slug)
  const post = BLOG_POSTS.find(p => p.slug === slug)

  if (!isCategory && !post) {
    notFound()
  }

  return <BlogSlugClient slug={slug} />
}
