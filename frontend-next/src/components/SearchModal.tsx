"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language'
import { BLOG_POSTS } from '@/lib/blog-data'
import ALL_SCHEMES_DATA from '@/lib/schemes-data.json'
import { Search, X, BookOpen, Landmark, Cpu, HelpCircle, ArrowRight } from 'lucide-react'

interface SearchResultItem {
  id: string
  title: string
  desc: string
  link: string
  category: 'tool' | 'scheme' | 'blog' | 'faq'
  answer?: string // For FAQs
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

// Statically define KisaanBuddy Tools
const TOOLS = [
  { id: 'weather', name: { en: 'Farm Weather Forecast & Advisory', hi: 'कृषि मौसम पूर्वानुमान और सलाह' }, desc: { en: 'Hyper-local weather warnings, humidity, and rain alerts for crops.', hi: 'फसलों के लिए हाइपर-लोकल मौसम चेतावनी, आर्द्रता और बारिश के अलर्ट।' }, link: '/weather' },
  { id: 'mandi', name: { en: 'Mandi Rates & MSP Tracker', hi: 'मंडी भाव और एमएसपी (MSP) ट्रैकर' }, desc: { en: 'Real-time APMC crop rates and eNAM registration guides.', hi: 'वास्तविक समय एपीएमसी फसल दरें और ई-नाम पंजीकरण गाइड।' }, link: '/mandi' },
  { id: 'crop-predictor', name: { en: 'Crop Selection Predictor', hi: 'फसल चयन भविष्यवाणी सलाहकार' }, desc: { en: 'AI model to predict suitable crops based on soil nutrients and rain.', hi: 'मिट्टी के पोषक तत्वों और वर्षा के आधार पर उपयुक्त फसलों की भविष्यवाणी।' }, link: '/crop-predictor' },
  { id: 'soil-health', name: { en: 'Soil Health & NPK Analyzer', hi: 'मृदा स्वास्थ्य और एनपीके (NPK) विश्लेषक' }, desc: { en: 'Input soil test results to get instant nitrogen, phosphorus, potash advice.', hi: 'त्वरित नाइट्रोजन, फास्फोरस, पोटाश सलाह प्राप्त करने के लिए मृदा परीक्षण परिणाम दर्ज करें।' }, link: '/soil-health' },
  { id: 'chatbot', name: { en: 'Voice AI Crop Assistant', hi: 'कृषि वॉयस एआई सहायक (किसानमित्र)' }, desc: { en: 'Speak in native language to get disease diagnostics and farming tips.', hi: 'रोग निदान और खेती के टिप्स प्राप्त करने के लिए अपनी मातृभाषा में बोलें।' }, link: '/chatbot' },
  { id: 'worker-connect', name: { en: 'Farm Labor Worker Connect', hi: 'मजदूर और कृषि रोजगार खोज' }, desc: { en: 'Hire local farm workers or find agriculture labor jobs.', hi: 'स्थानीय कृषि श्रमिकों को काम पर रखें या कृषि श्रम नौकरियां खोजें।' }, link: '/worker-connect' },
  { id: 'khet-diary', name: { en: 'Khet-Diary Farm Ledger', hi: 'खेत-डायरी कृषि बहीखाता' }, desc: { en: 'Log seed, fertilizer, water, and labor expenses to audit profits.', hi: 'मुनाफे का हिसाब लगाने के लिए बीज, उर्वरक, पानी और श्रम खर्च दर्ज करें।' }, link: '/khet-diary' },
]

// Common agricultural FAQs index
const FAQ_INDEX = {
  en: [
    { q: "What is eNAM and how do I register?", a: "Electronic National Agriculture Market (eNAM) is a pan-India trading portal. You can register with land records and bank details at your local APMC gateway.", link: "/mandi" },
    { q: "How is Minimum Support Price (MSP) calculated?", a: "MSP is recommended by CACP using the A2+FL formula, ensuring farmers get at least 1.5 times the cost of production.", link: "/mandi" },
    { q: "What is the recommended NPK ratio for Wheat?", a: "The standard NPK ratio for wheat is 4:2:1 (120kg N, 60kg P, 40kg K per hectare) depending on soil health tests.", link: "/soil-health" },
    { q: "How to report crop damage under PMFBY?", a: "Crop loss must be reported within 72 hours via the Crop Insurance App or to your local agriculture officer with sowing documents.", link: "/schemes" },
    { q: "What is the ideal soil pH for vegetable cultivation?", a: "A pH between 6.0 and 7.0 is ideal for most vegetables to ensure optimal absorption of micro-nutrients.", link: "/soil-health" },
    { q: "How can I prevent yellow rust in wheat?", a: "Grow resistant varieties like DBW 187 or spray Propiconazole 25% EC at 200 ml per acre mixed in 200L water.", link: "/disease" },
    { q: "How do I apply for PM-KUSUM solar pump subsidy?", a: "Register on your state's renewable energy agency portal. PM-KUSUM offers up to 90% combined subsidy for solar pumps.", link: "/schemes" },
    { q: "How does KisaanBuddy Voice Assistant diagnose diseases?", a: "Tap the camera icon to upload a clear picture of a diseased crop leaf, then press the microphone and explain the symptoms.", link: "/chatbot" }
  ],
  hi: [
    { q: "ई-नाम (eNAM) क्या है और मैं पंजीकरण कैसे करूँ?", a: "राष्ट्रीय कृषि बाजार (eNAM) एक अखिल भारतीय ट्रेडिंग पोर्टल है। आप अपने भूमि रिकॉर्ड और बैंक विवरण के साथ स्थानीय एपीएमसी मंडी में पंजीकरण कर सकते हैं।", link: "/mandi" },
    { q: "न्यूनतम समर्थन मूल्य (MSP) की गणना कैसे की जाती है?", a: "MSP की गणना CACP द्वारा A2+FL फार्मूले के आधार पर की जाती है, जिससे किसानों को उत्पादन लागत का कम से कम 1.5 गुना मूल्य मिले।", link: "/mandi" },
    { q: "गेहूं के लिए अनुशंसित एनपीके (NPK) अनुपात क्या है?", a: "गेहूं के लिए मानक एनपीके अनुपात 4:2:1 है, जो मिट्टी की परीक्षण रिपोर्ट पर भी निर्भर करता है।", link: "/soil-health" },
    { q: "PMFBY के तहत फसल नुकसान की रिपोर्ट कैसे करें?", a: "फसल नुकसान की रिपोर्ट घटना के 72 घंटों के भीतर 'क्रॉप इंश्योरेंस ऐप' के माध्यम से या स्थानीय कृषि अधिकारी को दी जानी चाहिए।", link: "/schemes" },
    { q: "सब्जियों की खेती के लिए मिट्टी का पीएच (pH) क्या होना चाहिए?", a: "अधिकांश सब्जियों के लिए 6.0 से 7.0 का पीएच आदर्श माना जाता है ताकि सूक्ष्म पोषक तत्व सही ढंग से अवशोषित हो सकें।", link: "/soil-health" },
    { q: "गेहूं में पीला रतुआ रोग से कैसे बचाव करें?", a: "डीबीडब्ल्यू 187 जैसी रतुआ-प्रतिरोधी किस्में उगाएं या प्रकोप होने पर प्रोपिकोनाजोल 25% ईसी (200 मिली/एकड़) का छिड़काव करें।", link: "/disease" },
    { q: "पीएम-कुसुम (PM-KUSUM) सोलर पंप सब्सिडी कैसे प्राप्त करें?", a: "अपने राज्य के अक्षय ऊर्जा विभाग के आधिकारिक पोर्टल पर आवेदन करें। योजना के तहत सोलर पंप पर 90% तक की भारी सब्सिडी मिलती है।", link: "/schemes" },
    { q: "किसानमित्र वॉयस असिस्टेंट बीमारियों की पहचान कैसे करता है?", a: "कैमरा बटन दबाकर रोगग्रस्त पत्ते की स्पष्ट फोटो अपलोड करें, फिर माइक दबाकर अपनी भाषा में लक्षणों का वर्णन करें।", link: "/chatbot" }
  ]
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { lang } = useLanguage()
  const router = useRouter()
  const activeLang = lang === 'en' ? 'en' : 'hi'
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [isOpen])

  // Handle Ctrl+K shortcut in parent component or globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Process search results
  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()

    const tempResults: SearchResultItem[] = []

    // 1. Index Tools
    TOOLS.forEach(tool => {
      const name = tool.name[activeLang].toLowerCase()
      const desc = tool.desc[activeLang].toLowerCase()
      if (name.includes(q) || desc.includes(q)) {
        tempResults.push({
          id: `tool-${tool.id}`,
          title: tool.name[activeLang],
          desc: tool.desc[activeLang],
          link: tool.link,
          category: 'tool'
        })
      }
    })

    // 2. Index Schemes
    ALL_SCHEMES_DATA.forEach(scheme => {
      const name = scheme.name.toLowerCase()
      const desc = scheme.description.toLowerCase()
      const benefit = scheme.benefit.toLowerCase()
      if (name.includes(q) || desc.includes(q) || benefit.includes(q)) {
        tempResults.push({
          id: `scheme-${scheme.id}`,
          title: scheme.name,
          desc: scheme.description,
          link: `/schemes?id=${scheme.id}`,
          category: 'scheme'
        })
      }
    })

    // 3. Index Blogs
    BLOG_POSTS.forEach(post => {
      const title = post.title[activeLang].toLowerCase()
      const desc = post.description[activeLang].toLowerCase()
      const tags = post.tags[activeLang].join(' ').toLowerCase()
      if (title.includes(q) || desc.includes(q) || tags.includes(q)) {
        tempResults.push({
          id: `blog-${post.slug}`,
          title: post.title[activeLang],
          desc: post.description[activeLang],
          link: `/blog/${post.slug}`,
          category: 'blog'
        })
      }
    })

    // 4. Index FAQs
    const activeFaqs = FAQ_INDEX[activeLang] || FAQ_INDEX.hi
    activeFaqs.forEach((faq, index) => {
      const question = faq.q.toLowerCase()
      const answer = faq.a.toLowerCase()
      if (question.includes(q) || answer.includes(q)) {
        tempResults.push({
          id: `faq-${index}`,
          title: faq.q,
          desc: faq.a.slice(0, 100) + '...',
          link: faq.link,
          category: 'faq',
          answer: faq.a
        })
      }
    })

    return tempResults.slice(0, 8) // Limit to top 8 matching results
  }, [query, activeLang])

  const handleSelect = (link: string) => {
    router.push(link)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md flex flex-col max-h-[500px]">
        {/* Input Header */}
        <div className="flex items-center border-b border-white/[0.06] px-4 py-3 shrink-0">
          <Search className="h-5 w-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={activeLang === 'en' ? "Search blogs, schemes, FAQs, and tools..." : "ब्लॉग, योजनाएं, प्रश्न और उपकरण खोजें..."}
            className="flex-1 bg-transparent border-0 outline-none text-white text-sm px-3 placeholder-muted-foreground"
          />
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-white/[0.08] text-muted-foreground hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {query.trim() === '' ? (
            <div className="text-center py-12 text-muted-foreground">
              <span className="text-3xl block mb-3">🌾</span>
              <p className="text-xs font-semibold leading-relaxed">
                {activeLang === 'en' 
                  ? "Enter keywords (e.g. MSP, wheat disease, soil pH) to search KisaanBuddy" 
                  : "किसानमित्र खोजने के लिए कीवर्ड (जैसे MSP, गेहूं रोग, मिट्टी का पीएच) दर्ज करें"}
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.link)}
                  className="w-full text-left p-3.5 rounded-xl border border-white/[0.03] hover:border-emerald-500/20 bg-white/[0.01] hover:bg-emerald-500/[0.02] flex items-start gap-3.5 transition-all group cursor-pointer"
                >
                  <span className="p-2 rounded-lg bg-slate-950/40 border border-white/[0.05] shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
                    {item.category === 'tool' && <Cpu className="h-4 w-4" />}
                    {item.category === 'scheme' && <Landmark className="h-4 w-4" />}
                    {item.category === 'blog' && <BookOpen className="h-4 w-4" />}
                    {item.category === 'faq' && <HelpCircle className="h-4 w-4" />}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors truncate">
                        {item.title}
                      </h4>
                      <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-muted-foreground border border-white/[0.05]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                    {item.answer && (
                      <p className="text-[10px] text-emerald-400/80 bg-emerald-500/[0.02] border border-emerald-500/5 p-2 rounded-lg mt-2 leading-relaxed font-semibold">
                        {item.answer}
                      </p>
                    )}
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <span className="text-3xl block mb-3">📭</span>
              <h4 className="text-xs font-black text-white">
                {activeLang === 'en' ? "No results found" : "कोई परिणाम नहीं मिला"}
              </h4>
              <p className="text-[10px] mt-1 font-semibold">
                {activeLang === 'en' 
                  ? "Try checking your spelling or using different keywords." 
                  : "कृपया अपनी वर्तनी जांचें या अन्य कीवर्ड का उपयोग करें।"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
