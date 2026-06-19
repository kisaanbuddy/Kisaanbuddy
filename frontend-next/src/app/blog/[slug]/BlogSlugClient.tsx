"use client"

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/language'
import { BLOG_POSTS, BlogPost } from '@/lib/blog-data'
import { GlassCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, ArrowLeft, ArrowRight, BookOpen, Tag, CheckCircle2 } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface Props {
  slug: string
}

const CATEGORY_NAMES = {
  weather: { en: "Weather & Climate", hi: "मौसम और जलवायु" },
  schemes: { en: "Govt Schemes", hi: "सरकारी योजनाएं" },
  soil: { en: "Soil & Fertilizers", hi: "मिट्टी और उर्वरक" },
  mandi: { en: "Mandi Rates & Trade", hi: "मंडी भाव और व्यापार" },
  disease: { en: "Crop Diseases", hi: "फसल रोग प्रबंधन" }
}

export default function BlogSlugClient({ slug }: Props) {
  const { lang } = useLanguage()
  const activeLang = lang === 'en' ? 'en' : 'hi'

  const categories = ['weather', 'schemes', 'soil', 'mandi', 'disease']
  const isCategory = categories.includes(slug)

  // Accordion state for FAQs
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  // Find posts belonging to the category
  const categoryPosts = useMemo(() => {
    if (!isCategory) return []
    return BLOG_POSTS.filter(post => post.category === slug)
  }, [isCategory, slug])

  // Find target post
  const post = useMemo(() => {
    if (isCategory) return null
    return BLOG_POSTS.find(p => p.slug === slug)
  }, [isCategory, slug])

  // Track blog read analytics event on load
  useEffect(() => {
    if (post) {
      trackEvent({
        type: 'blog_read',
        slug: post.slug,
        title: post.title.en,
        category: post.category
      })
    }
  }, [post])

  // Get related articles
  const relatedPosts = useMemo(() => {
    if (!post) return []
    return BLOG_POSTS.filter(p => post.relatedArticles.includes(p.slug))
  }, [post])

  // Construct JSON-LD schema objects for the post
  const jsonLd = useMemo(() => {
    if (!post) return null

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title[activeLang],
      "image": [post.featuredImage],
      "datePublished": post.publishedDate,
      "dateModified": post.updatedDate,
      "author": {
        "@type": "Person",
        "name": post.author[activeLang]
      },
      "description": post.description[activeLang],
      "publisher": {
        "@type": "Organization",
        "name": "KisaanBuddy",
        "logo": {
          "@type": "ImageObject",
          "url": "https://kisaanbuddy.in/favicon.ico"
        }
      }
    }

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": post.faq[activeLang].map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.a
        }
      }))
    }

    return { articleSchema, faqSchema }
  }, [post, activeLang])

  // Render Category page
  if (isCategory) {
    const catName = CATEGORY_NAMES[slug as keyof typeof CATEGORY_NAMES][activeLang]
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-400 font-bold mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {activeLang === 'en' ? "Back to All Topics" : "सभी विषयों पर वापस जाएं"}
        </Link>

        <div className="relative rounded-3xl overflow-hidden mb-12 p-8 md:p-12 bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 border border-white/[0.06] shadow-2xl flex flex-col items-center text-center">
          <span className="text-4xl mb-4">
            {slug === 'weather' && "🌧️"}
            {slug === 'schemes' && "📜"}
            {slug === 'soil' && "🌱"}
            {slug === 'mandi' && "💰"}
            {slug === 'disease' && "🐛"}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight font-display tracking-tight mb-4">
            {catName}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed font-semibold">
            {activeLang === 'en' 
              ? `Expert guides, practical advisories, and real farming examples related to ${catName}.`
              : `${catName} से संबंधित विशेषज्ञ गाइड, व्यावहारिक सलाह और वास्तविक खेती के उदाहरण।`}
          </p>
        </div>

        {categoryPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryPosts.map((p) => (
              <GlassCard key={p.slug} className="flex flex-col overflow-hidden border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-300 group rounded-2xl bg-slate-900/10">
                <div className="relative h-48 overflow-hidden shrink-0">
                  <img src={p.featuredImage} alt={p.title[activeLang]} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1"><User className="h-3 w-3 text-emerald-400" />{p.author[activeLang]}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-emerald-400" />{p.publishedDate}</span>
                    </div>
                    <h2 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors leading-tight font-display">
                      {p.title[activeLang]}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-semibold">
                      {p.description[activeLang]}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {p.tags[activeLang].slice(0, 2).map(t => (
                        <span key={t} className="text-[9px] font-bold text-muted-foreground bg-white/[0.02] px-2 py-0.5 rounded-md border border-white/[0.04]">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <Link href={`/blog/${p.slug}`} className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-300">
                      {activeLang === 'en' ? "Read Guide" : "गाइड पढ़ें"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/[0.01] border border-white/[0.04] rounded-3xl p-6">
            <h3 className="text-sm font-black text-white">
              {activeLang === 'en' ? "Coming soon" : "जल्द आ रहा है"}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto font-semibold">
              {activeLang === 'en' 
                ? "We are preparing detailed guides for this category. Stay tuned!" 
                : "हम इस श्रेणी के लिए विस्तृत गाइड तैयार कर रहे हैं। बने रहें!"}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Render Post Detail page
  if (!post) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Dynamic JSON-LD Head Injection */}
      {jsonLd && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.articleSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.faqSchema) }}
          />
        </>
      )}

      {/* Back Link */}
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-400 font-bold mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {activeLang === 'en' ? "Back to All Articles" : "सभी लेखों पर वापस जाएं"}
      </Link>

      <article className="space-y-8">
        {/* Post Header */}
        <div className="space-y-4">
          <Link href={`/blog/${post.category}`} className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
            {CATEGORY_NAMES[post.category][activeLang]}
          </Link>
          
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight font-display tracking-tight">
            {post.title[activeLang]}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-semibold pt-2 border-b border-white/[0.04] pb-4">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-emerald-400" />
              {post.author[activeLang]}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-emerald-400" />
              {activeLang === 'en' ? "Published: " : "प्रकाशित: "}{post.publishedDate}
            </span>
            {post.updatedDate !== post.publishedDate && (
              <span className="text-[10px] bg-white/[0.02] px-2 py-0.5 rounded-md border border-white/[0.04]">
                {activeLang === 'en' ? "Updated: " : "संशोधित: "}{post.updatedDate}
              </span>
            )}
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative h-64 md:h-[400px] rounded-3xl overflow-hidden border border-white/[0.08] shadow-xl">
          <img src={post.featuredImage} alt={post.title[activeLang]} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
        </div>

        {/* Post Content */}
        <div className="prose prose-invert max-w-none text-muted-foreground text-sm md:text-base leading-relaxed space-y-6 font-medium">
          {post.content[activeLang].split('\n\n').map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Trust signal statement */}
        <div className="p-4.5 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex gap-3 items-start mt-8">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed font-semibold">
            <span className="text-white block mb-1">
              {activeLang === 'en' ? "Verified Agricultural Education" : "सत्यापित कृषि शिक्षा"}
            </span>
            {activeLang === 'en'
              ? "This guide contains actual package of practices recommended by Indian State Agricultural Universities and has been checked by certified extension workers."
              : "इस गाइड में भारतीय राज्य कृषि विश्वविद्यालयों द्वारा अनुशंसित वास्तविक प्रथाओं के पैकेज शामिल हैं और प्रमाणित विस्तार कार्यकर्ताओं द्वारा इसकी जांच की गई है।"}
          </div>
        </div>

        {/* Tags Block */}
        <div className="flex flex-wrap gap-2 pt-4">
          {post.tags[activeLang].map(tag => (
            <span key={tag} className="text-xs font-bold text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-xl border border-emerald-500/10">
              #{tag}
            </span>
          ))}
        </div>

        {/* Accordion FAQ Section */}
        <div className="border-t border-white/[0.06] pt-8 space-y-4">
          <h2 className="text-xl md:text-2xl font-black text-white font-display">
            {activeLang === 'en' ? "Frequently Asked Questions" : "अक्सर पूछे जाने वाले प्रश्न"}
          </h2>
          <div className="space-y-3">
            {post.faq[activeLang].map((item, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div key={index} className="rounded-2xl border border-white/[0.04] bg-white/[0.01] overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left p-4.5 flex justify-between items-center text-xs md:text-sm font-black text-white hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <span className="text-muted-foreground text-base shrink-0 ml-2">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-4.5 pt-0 border-t border-white/[0.03] text-xs md:text-sm text-muted-foreground leading-relaxed bg-white/[0.005] font-medium animate-fade-in">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-white/[0.06] pt-8 space-y-6">
            <h2 className="text-xl md:text-2xl font-black text-white font-display">
              {activeLang === 'en' ? "Related Articles" : "संबंधित लेख"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map(p => (
                <GlassCard key={p.slug} className="flex gap-4 p-4 border border-white/[0.04] hover:border-emerald-500/20 transition-all rounded-2xl bg-slate-900/10">
                  <img src={p.featuredImage} alt={p.title[activeLang]} className="w-20 h-20 object-cover rounded-xl border border-white/[0.06] shrink-0" />
                  <div className="flex flex-col justify-between">
                    <h3 className="text-xs font-black text-white line-clamp-2 hover:text-emerald-400 transition-colors leading-tight">
                      <Link href={`/blog/${p.slug}`}>{p.title[activeLang]}</Link>
                    </h3>
                    <span className="text-[9px] text-muted-foreground font-semibold">
                      {p.publishedDate}
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
