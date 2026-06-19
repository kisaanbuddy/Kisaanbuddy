"use client"

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/language'
import { BLOG_POSTS, BlogPost } from '@/lib/blog-data'
import { GlassCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Calendar, User, ArrowRight, Tag, BookOpen } from 'lucide-react'

const CATEGORY_NAMES = {
  all: { en: "All Topics", hi: "सभी विषय" },
  weather: { en: "Weather & Climate", hi: "मौसम और जलवायु" },
  schemes: { en: "Govt Schemes", hi: "सरकारी योजनाएं" },
  soil: { en: "Soil & Fertilizers", hi: "मिट्टी और उर्वरक" },
  mandi: { en: "Mandi Rates & Trade", hi: "मंडी भाव और व्यापार" },
  disease: { en: "Crop Diseases", hi: "फसल रोग प्रबंधन" }
}

export default function BlogClient() {
  const { lang } = useLanguage()
  const activeLang = lang === 'en' ? 'en' : 'hi'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
      
      const titleText = post.title[activeLang].toLowerCase()
      const descText = post.description[activeLang].toLowerCase()
      const authorText = post.author[activeLang].toLowerCase()
      const tagsText = post.tags[activeLang].join(' ').toLowerCase()
      const query = searchQuery.toLowerCase()

      const matchesSearch = titleText.includes(query) || 
                            descText.includes(query) || 
                            authorText.includes(query) ||
                            tagsText.includes(query)

      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery, activeLang])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-12 p-8 md:p-12 bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 border border-white/[0.06] shadow-2xl flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4 animate-pulse">
          <BookOpen className="h-3 w-3" />
          {activeLang === 'en' ? "Knowledge Center" : "ज्ञान केंद्र"}
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight font-display tracking-tight mb-4">
          {activeLang === 'en' ? "KisaanBuddy Krishi Blog" : "किसानमित्र कृषि ब्लॉग"}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed font-semibold">
          {activeLang === 'en' 
            ? "Bilingual expert advice, weather tips, market insights, and crop disease management. Written by agricultural educators."
            : "द्विभाषी विशेषज्ञ सलाह, मौसम के टिप्स, बाजार की जानकारी, और फसल रोग प्रबंधन। कृषि शिक्षकों द्वारा लिखित।"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Navigation Categories & Search */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search Box Card */}
          <GlassCard className="p-5 border border-white/[0.08] backdrop-blur-md rounded-2xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-3">
              {activeLang === 'en' ? "Search Articles" : "लेख खोजें"}
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeLang === 'en' ? "Type to search..." : "खोजने के लिए लिखें..."}
                className="w-full bg-slate-900/60 border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-emerald-500/30 transition-all font-medium"
              />
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
            </div>
          </GlassCard>

          {/* Category Filter Card */}
          <GlassCard className="p-5 border border-white/[0.08] backdrop-blur-md rounded-2xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-4">
              {activeLang === 'en' ? "Categories" : "श्रेणियां"}
            </h3>
            <div className="flex flex-col gap-2">
              {Object.entries(CATEGORY_NAMES).map(([key, value]) => {
                const isActive = selectedCategory === key
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-between cursor-pointer ${
                      isActive 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "hover:bg-white/[0.02] text-muted-foreground hover:text-white"
                    }`}
                  >
                    <span>{value[activeLang]}</span>
                    {key !== 'all' && (
                      <span className="text-[10px] text-muted-foreground/60">
                        {key === 'weather' && "🌧️"}
                        {key === 'schemes' && "📜"}
                        {key === 'soil' && "🌱"}
                        {key === 'mandi' && "💰"}
                        {key === 'disease' && "🐛"}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Blog Posts Grid */}
        <div className="lg:col-span-3">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <GlassCard key={post.slug} className="flex flex-col overflow-hidden border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-300 group rounded-2xl bg-slate-900/10">
                  {/* Card Image */}
                  <div className="relative h-48 overflow-hidden shrink-0">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title[activeLang]} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-950/80 text-emerald-400 border border-white/[0.08] backdrop-blur-md">
                      {CATEGORY_NAMES[post.category][activeLang]}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Meta info */}
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-emerald-400" />
                          {post.author[activeLang]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-emerald-400" />
                          {post.publishedDate}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors leading-tight font-display">
                        {post.title[activeLang]}
                      </h2>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-semibold">
                        {post.description[activeLang]}
                      </p>
                    </div>

                    {/* Footer read action */}
                    <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {post.tags[activeLang].slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] font-bold text-muted-foreground bg-white/[0.02] px-2 py-0.5 rounded-md border border-white/[0.04]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-300 group-hover:translate-x-0.5 transition-all">
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
              <span className="text-4xl">🔍</span>
              <h3 className="text-sm font-black text-white mt-4">
                {activeLang === 'en' ? "No articles found" : "कोई लेख नहीं मिला"}
              </h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto font-semibold">
                {activeLang === 'en' 
                  ? "We couldn't find any articles matching your filters. Try clearing your search." 
                  : "हमें आपके फ़िल्टर से मेल खाता कोई लेख नहीं मिला। कृपया पुनः प्रयास करें।"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
