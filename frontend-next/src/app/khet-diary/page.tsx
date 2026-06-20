"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Sparkles, Plus, Trash2, IndianRupee, TrendingUp, FileSpreadsheet, ShieldCheck, HelpCircle } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import { GlassCard, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type LogEntry = {
  id: string
  date: string
  activity: string
  category: 'expense' | 'income' | 'activity'
  amount: number
  crop: string
}

export default function KhetDiaryPage() {
  const { lang } = useLanguage()
  const [logs, setLogs] = useState<LogEntry[]>([])
  
  // Form states
  const [activity, setActivity] = useState('')
  const [category, setCategory] = useState<'expense' | 'income' | 'activity'>('expense')
  const [amount, setAmount] = useState('')
  const [crop, setCrop] = useState('')

  useEffect(() => {
    // Load mock initial logs
    setLogs([
      { id: '1', date: '2026-06-18', activity: 'Sowing Wheat seeds (HD-3086)', category: 'activity', amount: 0, crop: 'Wheat' },
      { id: '2', date: '2026-06-18', activity: 'Purchased Urea & NPK fertilizers', category: 'expense', amount: 3200, crop: 'Wheat' },
      { id: '3', date: '2026-06-19', activity: 'Sold Mustard harvest in eNAM mandi', category: 'income', amount: 48000, crop: 'Mustard' }
    ])
  }, [])

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activity.trim() || !crop.trim()) return

    const newLog: LogEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      activity: activity.trim(),
      category,
      amount: category === 'activity' ? 0 : Number(amount) || 0,
      crop: crop.trim()
    }

    setLogs([newLog, ...logs])
    setActivity('')
    setAmount('')
    setCrop('')
  }

  const handleDelete = (id: string) => {
    setLogs(logs.filter(l => l.id !== id))
  }

  const totalExpense = logs.filter(l => l.category === 'expense').reduce((sum, l) => sum + l.amount, 0)
  const totalIncome = logs.filter(l => l.category === 'income').reduce((sum, l) => sum + l.amount, 0)
  const netProfit = totalIncome - totalExpense

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy Khet Diary",
    "url": "https://kisaanbuddy.com/khet-diary",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "description": "Digital Farm Logbook and Ledger. Record daily farm tasks, input costs (seeds, fertilizers, diesel), harvest sales revenues, and calculate crop net profit."
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What entries should be made in Khet Diary?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Record sowing dates, fertilizer/pesticide costs, irrigation and fuel bills, harvest yields, and APMC mandi sale prices."
        }
      },
      {
        "@type": "Question",
        "name": "Can you export Khet Diary data to Excel or PDF?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, upcoming features in KisaanBuddy will allow one-click PDF and Excel ledger report downloads."
        }
      },
      {
        "@type": "Question",
        "name": "Does the digital ledger assist in getting bank credit (KCC)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, having structured farming logs of production costs and cash flows builds bank credibility and facilitates loan processing."
        }
      },
      {
        "@type": "Question",
        "name": "Is my farm ledger data shared publicly?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, your farm diary entries are private, encrypted, and accessible only on your personal KisaanBuddy account."
        }
      }
    ]
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[20%] w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[250px] h-[250px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-emerald-950/20 via-slate-950 to-teal-950/15 p-6 md:p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            {lang === 'hi' ? 'खेत डायरी — डिजिटल रिकॉर्ड' : 'Khet Diary — Digital Records'}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white">
          {lang === 'hi' ? 'मेरा डिजिटल ' : 'My Digital '}<span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{lang === 'hi' ? 'बहीखाता' : 'Farm Logbook'}</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
          {lang === 'hi' 
            ? 'अपने खेत के खर्चों, आय, और दैनिक गतिविधियों को ट्रैक करें। बैंक लोन और सरकारी योजनाओं के दस्तावेज़ीकरण के लिए बेहद उपयोगी।' 
            : 'Track your farm expenses, income, and daily agricultural activities. Essential for bank loans and government crop documentation.'}
        </p>
      </motion.div>

      {/* Interactive Logbook Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column — Add Log Form */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="border border-white/[0.08] bg-slate-950/40 p-6 rounded-2xl shadow-xl">
            <CardHeader className="p-0 pb-4 mb-4 border-b border-white/[0.06]">
              <CardTitle className="text-lg font-bold text-white font-display">
                {lang === 'hi' ? 'नयी प्रविष्टि जोड़ें' : 'Add New Entry'}
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {lang === 'hi' ? 'फसल का नाम' : 'Crop Name'}
                </label>
                <input 
                  type="text" 
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  placeholder={lang === 'hi' ? 'जैसे: गेहूँ, धान, टमाटर' : 'e.g. Wheat, Rice, Tomato'}
                  className="w-full h-11 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-emerald-500/50 px-4 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {lang === 'hi' ? 'श्रेणी' : 'Category'}
                </label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-11 rounded-xl bg-slate-900 border border-white/[0.08] focus:border-emerald-500/50 px-3 text-sm text-white focus:outline-none transition-colors"
                >
                  <option value="expense">{lang === 'hi' ? 'खर्च (Expense)' : 'Expense'}</option>
                  <option value="income">{lang === 'hi' ? 'आय (Income)' : 'Income'}</option>
                  <option value="activity">{lang === 'hi' ? 'गतिविधि (Task Log)' : 'Activity/Task Log'}</option>
                </select>
              </div>

              {category !== 'activity' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {lang === 'hi' ? 'रुपये (राशि)' : 'Amount (₹)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full h-11 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-emerald-500/50 pl-8 pr-4 text-sm text-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {lang === 'hi' ? 'विवरण' : 'Details'}
                </label>
                <textarea 
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder={lang === 'hi' ? 'जैसे: यूरिया खाद का छिड़काव किया' : 'e.g. Sprayed neem oil pesticide'}
                  className="w-full h-20 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-emerald-500/50 p-4 text-sm text-white focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10">
                <Plus className="h-4 w-4" />
                {lang === 'hi' ? 'डायरी में सहेजें' : 'Save to Diary'}
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* Right Columns — Logs List and Overview Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dashboard Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{lang === 'hi' ? 'कुल व्यय' : 'Total Expense'}</span>
                <p className="text-xl font-black text-rose-400 font-display mt-0.5">₹{totalExpense}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{lang === 'hi' ? 'कुल आय' : 'Total Income'}</span>
                <p className="text-xl font-black text-emerald-400 font-display mt-0.5">₹{totalIncome}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{lang === 'hi' ? 'शुद्ध लाभ' : 'Net Income'}</span>
                <p className={`text-xl font-black font-display mt-0.5 ${netProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                  ₹{netProfit}
                </p>
              </div>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${netProfit >= 0 ? 'bg-teal-500/10 text-teal-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Logs View */}
          <GlassCard className="border border-white/[0.08] bg-slate-950/40 p-6 rounded-2xl shadow-xl">
            <CardHeader className="p-0 pb-4 mb-4 border-b border-white/[0.06] flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-white font-display">
                {lang === 'hi' ? 'बहीखाता रिकॉर्ड' : 'Logbook Entries'}
              </CardTitle>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full select-none">
                {logs.length} {lang === 'hi' ? 'रिकॉर्ड' : 'Records'}
              </span>
            </CardHeader>

            <div className="space-y-3 overflow-y-auto max-h-[360px] pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {logs.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    {lang === 'hi' ? 'कोई प्रविष्टि नहीं है। बायीं तरफ से जोड़ें।' : 'No entries found. Add your first record from the form.'}
                  </div>
                ) : (
                  logs.map(log => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.005] hover:bg-white/[0.01] flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${
                            log.category === 'expense' ? 'bg-rose-500/10 text-rose-400' :
                            log.category === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {log.category === 'expense' ? (lang === 'hi' ? 'खर्च' : 'Expense') :
                             log.category === 'income' ? (lang === 'hi' ? 'आय' : 'Income') : (lang === 'hi' ? 'कार्य' : 'Task')}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold">{log.date}</span>
                          <span className="text-[10px] text-teal-400 font-bold bg-teal-500/5 border border-teal-500/10 px-2 rounded-full">{log.crop}</span>
                        </div>
                        <p className="text-xs font-semibold text-white leading-relaxed">{log.activity}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {log.category !== 'activity' && (
                          <span className={`text-sm font-black font-display ${log.category === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {log.category === 'income' ? '+' : '-'} ₹{log.amount}
                          </span>
                        )}
                        <button 
                          onClick={() => handleDelete(log.id)}
                          className="p-2 rounded-lg bg-white/5 border border-white/[0.04] text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ── Educational Guide Section ── */}
      <section className="mt-12 border-t border-white/[0.08] pt-10 select-none">
        {lang === "hi" ? (
          <div className="space-y-8 text-foreground">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white">🌾 खेत डायरी क्या है और डिजिटल रिकॉर्ड क्यों आवश्यक हैं?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
                खेत डायरी (Khet Diary) किसानों के लिए एक डिजिटल बहीखाता (Ledger) प्रणाली है। पारंपरिक खेती में किसान अपने खर्चों, खाद की खरीद, पानी की लागत और अंत में प्राप्त उपज (Yield) का सटीक हिसाब नहीं रख पाते हैं, जिससे फसल की वास्तविक उत्पादन लागत और मुनाफे का आंकलन करना मुश्किल हो जाता है। डिजिटल रिकॉर्ड रखने से खेती एक सुनियोजित व्यवसाय का रूप लेती है।
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-3">
                <h3 className="text-lg font-bold text-emerald-400 font-display">📈 व्यय और उपज का सटीक ट्रैकिंग गाइड</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>व्यय ट्रैकिंग (Expense Tracking):</strong> बीज खरीद, जुताई (डीजल खर्च), उर्वरक (यूरिया, डीएपी), कीटनाशकों और मजदूरों के दैनिक भुगतान का तत्काल हिसाब रखें। इससे पता चलता है कि किस इनपुट पर अनावश्यक पैसा खर्च हो रहा है।<br />
                  <strong>उपज ट्रैकिंग (Yield Tracking):</strong> फसल कटाई के बाद कुल प्राप्त मात्रा (क्विंटल में) और मंडी में मिले प्रति क्विंटल भाव का रिकॉर्ड सहेजें। इससे आपको प्रति एकड़ शुद्ध आय (Net profit) की सटीक गणना करने में मदद मिलती है।
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-3">
                <h3 className="text-lg font-bold text-emerald-400 font-display">📁 सरकारी दस्तावेज़ीकरण और डिजिटल रिकॉर्ड के लाभ</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>लोन और बैंक सहायता:</strong> जब किसान फसल ऋण (KCC - किसान क्रेडिट कार्ड) के लिए आवेदन करते हैं, तो बैंकों द्वारा पिछले 2-3 वर्षों के खेती रिकॉर्ड मांगे जाते हैं। डिजिटल खेत डायरी का रिकॉर्ड बैंक अधिकारियों को दिखाने से ऋण स्वीकृति आसान होती है।<br />
                  <strong>फसल बीमा दावे:</strong> सूखा, बाढ़ या बेमौसम बारिश से हुए नुकसान का दावा करने के लिए बुवाई की तारीख, बीज बिल और सिंचाई की तारीखों का डिजिटल प्रमाण बीमा कंपनियों द्वारा आसानी से स्वीकार कर लिया जाता है।
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-extrabold text-white">❓ खेत डायरी और रिकॉर्ड रखने के बारे में FAQs</h2>
              <div className="grid gap-4 md:grid-cols-2 text-xs text-muted-foreground">
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q1. खेत डायरी में मुझे क्या-क्या जानकारी लिखनी चाहिए?</h4>
                  <p>आपको बुवाई की तारीख, खाद और कीटनाशक की मात्रा व कीमत, सिंचाई का खर्च, जुताई का किराया, कटाई का कुल खर्च और कुल बिक्री आय लिखनी चाहिए।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q2. क्या मैं इस डेटा को एक्सेल (Excel) या पीडीएफ (PDF) में डाउनलोड कर सकता हूँ?</h4>
                  <p>हाँ, KisaanBuddy में भविष्य के अपडेट में आपके डिजिटल बहीखाते को एक क्लिक में रिपोर्ट (PDF/Excel) के रूप में डाउनलोड करने की सुविधा दी जाएगी।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q3. क्या यह रिकॉर्ड फसल ऋण (KCC) प्राप्त करने में मदद करेगा?</h4>
                  <p>हाँ, बैंक अधिकारी किसान की वित्तीय स्थिरता और कृषि खर्चों के अनुशासन को देखकर केसीसी ऋण सीमा आसानी से बढ़ा देते हैं।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q4. क्या केसीसी (KCC) लोन के लिए फसल चक्र का रिकॉर्ड रखना जरूरी है?</h4>
                  <p>हाँ, बैंक यह देखना चाहते हैं कि किसान भूमि की उर्वरता बनाए रखने के लिए फसल चक्र बदल रहा है या नहीं, इससे ऋण चुकाने की क्षमता प्रभावित होती है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q5. फसल बीमा (Fasal Bima) क्लेम में यह डायरी कैसे उपयोगी है?</h4>
                  <p>प्राकृतिक आपदा आने पर बीमा अधिकारी बुवाई और खर्चों के दस्तावेजी प्रमाण मांगते हैं। आपकी डायरी का डेटा नुकसान के मूल्यांकन में सहायक बनता है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q6. क्या मेरी डायरी का विवरण अन्य किसानों को दिखाई देगा?</h4>
                  <p>नहीं, आपका व्यक्तिगत खेत बहीखाता पूरी तरह से सुरक्षित और निजी है। इसे केवल आप ही देख सकते हैं।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q7. उत्पादन लागत (Cost of Production) की गणना कैसे करें?</h4>
                  <p>फसल बोने से लेकर बेचने तक के सभी खर्चों (बीज, खाद, पानी, मजदूरी) को जोड़कर कुल उपज (क्विंटल) से भाग देने पर प्रति क्विंटल उत्पादन लागत पता चलती है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q8. क्या मैं एक साथ कई अलग-अलग खेतों (मेड़ों) का हिसाब रख सकता हूँ?</h4>
                  <p>हाँ, प्रविष्टि दर्ज करते समय आप फसल के नाम के साथ खेत संख्या या खसरा संख्या जोड़कर अलग-अलग खेतों का बहीखाता अलग रख सकते हैं।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q9. क्या डिजिटल रिकॉर्ड रखने से टैक्स (कर) में कोई छूट मिलती है?</h4>
                  <p>भारत में प्रत्यक्ष कृषि आय कर-मुक्त है। हालांकि, संगठित तरीके से हिसाब रखने पर आपको व्यापारिक कृषि ऋणों और ब्याज सब्सिडी दावों में लाभ मिलता है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q10. क्या KisaanBuddy का ऑफलाइन बहीखाता उपलब्ध है?</h4>
                  <p>हाँ, KisaanBuddy ऐप आपके द्वारा दर्ज डेटा को स्थानीय फोन स्टोरेज में सुरक्षित रखता है ताकि खराब नेटवर्क में भी आपकी डायरी काम करती रहे।</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 text-foreground">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white">🌾 What is Khet Diary and Why Are Digital Records Vital?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
                Khet Diary is a digital farm logbook and ledger designed specifically for modern cultivators. In traditional farming, growers frequently struggle to tally their total operational costs, fertilizer purchases, diesel leases, and harvest yields, making it difficult to calculate true production cost and net profits. Keeping digital records turns farming into a structured, databased business.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-3">
                <h3 className="text-lg font-bold text-emerald-400 font-display">📈 Expense and Yield Tracking Guidelines</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Expense Tracking:</strong> Tally up seed purchase costs, plowing rentals, fertilizer quantities (Urea, DAP, NPK), pesticides, and daily wages paid to workers. Identifying these figures prevents resource leakages.<br />
                  <strong>Yield Tracking:</strong> Tally up the total harvested volume (in quintals or metric tonnes) and the selling rate obtained per unit inside the mandi. Subtracting total expenses from sales revenue delivers your true net returns.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-3">
                <h3 className="text-lg font-bold text-emerald-400 font-display">📁 Government Documentation and Digital Advantages</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Bank Credit and KCC Loans:</strong> To secure crop credit cards (KCC), banks inspect financial discipline and agricultural outputs. Presenting a digital logbook speeds up validation and credit limits.<br />
                  <strong>Crop Insurance (Fasal Bima):</strong> To process damage claims from weather disasters, insurers verify sowing logs and input purchase bills. Digital logs provide verifiable proof to support your claim.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-extrabold text-white">❓ Farm Logbook & Ledger FAQs</h2>
              <div className="grid gap-4 md:grid-cols-2 text-xs text-muted-foreground">
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q1. What specific entries should I write down in Khet Diary?</h4>
                  <p>Record sowing dates, fertilizer/pesticide prices, irrigation charges, diesel fuel leases, labor wages, and harvesting sales revenue.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q2. Can I export my digital records to Excel or PDF format?</h4>
                  <p>Yes. KisaanBuddy features a future export tool to generate downloadable Excel sheets and PDF ledgers directly from your phone.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q3. Does the ledger assist in bank loans?</h4>
                  <p>Yes, presenting systematic production costs and cash flows builds bank trust, facilitating credit card clearances.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q4. Is crop cycle history verified for KCC updates?</h4>
                  <p>Yes, rotating nitrogen-fixing legumes prevents soil exhaustion, which is factored into regional bank farm credit ratings.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q5. How does this help in crop insurance claims?</h4>
                  <p>It acts as evidence of crop planting times, inputs, and investments if fields get waterlogged or affected by drought.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q6. Is my farm ledger data shared publicly?</h4>
                  <p>No, your farm diary entries are completely encrypted, private, and visible only to you on your registered account.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q7. How do I calculate my crop's unit production cost?</h4>
                  <p>Sum all input costs (seed, chemicals, labor, irrigation) and divide by the total yield volume (in quintals) to get the cost per unit.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q8. Can I manage multiple fields inside the same diary?</h4>
                  <p>Yes, you can tag entries with specific survey numbers or land descriptors to split accounts between different plots.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q9. Are agricultural profits subject to tax in India?</h4>
                  <p>Direct agricultural profits are tax-free under section 10(1). However, audit logs are valuable for checking commercial credit subsidies.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q10. Can I write entries without a network connection?</h4>
                  <p>Yes. KisaanBuddy caches entries locally and synchronizes them to your cloud backup once your mobile signal is restored.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
