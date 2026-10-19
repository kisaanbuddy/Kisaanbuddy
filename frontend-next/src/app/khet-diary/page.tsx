"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Sparkles, Plus, Trash2, IndianRupee, TrendingUp, FileSpreadsheet, ShieldCheck, HelpCircle, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useLanguage, type Lang } from '@/lib/language'
import { KHET_DIARY_I18N } from '@/lib/khet-diary-i18n'
import { KHET_DIARY_GUIDE_I18N } from '@/lib/khet-diary-guide-i18n'
import { useAuth } from '@/lib/auth'
import { activitiesApi, fieldsApi, type FarmActivity, type FarmerField } from '@/lib/farmer-api'
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

function KhetDiaryContent() {
  const searchParams = useSearchParams()
  const { lang } = useLanguage()
  const [logs, setLogs] = useState<LogEntry[]>([])
  
  // Form states
  const [activity, setActivity] = useState('')
  const [category, setCategory] = useState<'expense' | 'income' | 'activity'>('expense')
  const [amount, setAmount] = useState('')
  const [crop, setCrop] = useState('')

  // A voice command may prepare an entry, but it never saves it. The farmer
  // reviews the real form and explicitly submits, preserving confirmation for
  // a record-writing operation.
  useEffect(() => {
    if (searchParams.get('voice') !== '1') return
    const requestedCrop = searchParams.get('crop')
    const requestedActivity = searchParams.get('activity')
    if (requestedCrop) setCrop(requestedCrop)
    if (requestedActivity) setActivity(requestedActivity)
  }, [searchParams])

  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadActivities = async () => {
    if (!user) {
      setLogs([
        { id: '1', date: '2026-06-18', activity: 'Sowing Wheat seeds (HD-3086)', category: 'activity', amount: 0, crop: 'Wheat' },
        { id: '2', date: '2026-06-18', activity: 'Purchased Urea & NPK fertilizers', category: 'expense', amount: 3200, crop: 'Wheat' },
        { id: '3', date: '2026-06-19', activity: 'Sold Mustard harvest in eNAM mandi', category: 'income', amount: 48000, crop: 'Mustard' }
      ])
      return
    }
    setLoading(true)
    try {
      const data = await activitiesApi.list()
      if (data && data.length > 0) {
        setLogs(data.map(d => ({
          id: String(d.id),
          date: d.activity_date,
          activity: d.title,
          category: d.category,
          amount: d.amount || 0,
          crop: d.notes || 'General'
        })))
      } else {
        setLogs([])
      }
    } catch {
      // Keep existing
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivities()
  }, [user])

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activity.trim() || !crop.trim()) return

    const numAmount = category === 'activity' ? 0 : Number(amount) || 0
    const todayStr = new Date().toISOString().split('T')[0]

    if (user) {
      setSubmitting(true)
      try {
        const saved = await activitiesApi.create({
          activity_date: todayStr,
          activity_type: category === 'activity' ? 'sowing' : category === 'expense' ? 'fertilizer_application' : 'harvesting',
          title: activity.trim(),
          category,
          amount: numAmount > 0 ? numAmount : undefined,
          notes: crop.trim(),
        })
        const newLog: LogEntry = {
          id: String(saved.id),
          date: saved.activity_date,
          activity: saved.title,
          category: saved.category,
          amount: saved.amount || 0,
          crop: saved.notes || crop.trim()
        }
        setLogs([newLog, ...logs])
      } catch (err) {
        // Fallback local
        const newLog: LogEntry = {
          id: Date.now().toString(),
          date: todayStr,
          activity: activity.trim(),
          category,
          amount: numAmount,
          crop: crop.trim()
        }
        setLogs([newLog, ...logs])
      } finally {
        setSubmitting(false)
      }
    } else {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        date: todayStr,
        activity: activity.trim(),
        category,
        amount: numAmount,
        crop: crop.trim()
      }
      setLogs([newLog, ...logs])
    }

    setActivity('')
    setAmount('')
    setCrop('')
  }

  const handleDelete = async (id: string) => {
    if (user && !isNaN(Number(id))) {
      try {
        await activitiesApi.delete(Number(id))
      } catch {}
    }
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

  const dict = KHET_DIARY_I18N[(lang as Lang) || 'en'] || KHET_DIARY_I18N.en

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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card p-6 md:p-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {dict.tag}
            </span>
          </div>
          <Link
            href="/farmer-profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 transition-colors w-fit"
          >
            <span>{dict.completeProfile}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-foreground">
          {dict.headingPrefix}<span className="text-emerald-600 dark:text-emerald-400">{dict.headingHighlight}</span>
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm mt-1.5 max-w-2xl leading-relaxed">
          {dict.description}
        </p>
      </motion.div>

      {/* Interactive Logbook Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column — Add Log Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-border/50 bg-card p-6 rounded-2xl shadow-sm">
            <div className="pb-4 mb-4 border-b border-border/40">
              <h3 className="text-base font-bold text-foreground font-display">
                {dict.addEntryTitle}
              </h3>
            </div>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {dict.cropName}
                </label>
                <input 
                  type="text" 
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  placeholder={dict.cropPlaceholder}
                  className="w-full h-10 rounded-xl bg-background border border-border/50 focus:border-emerald-500 px-3.5 text-sm text-foreground focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {dict.category}
                </label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-10 rounded-xl bg-background border border-border/50 focus:border-emerald-500 px-3 text-sm text-foreground focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="expense">{dict.categoryExpense}</option>
                  <option value="income">{dict.categoryIncome}</option>
                  <option value="activity">{dict.categoryActivity}</option>
                </select>
              </div>

              {category !== 'activity' && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    {dict.amount}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full h-10 rounded-xl bg-background border border-border/50 focus:border-emerald-500 pl-7 pr-3.5 text-sm text-foreground focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {dict.details}
                </label>
                <textarea 
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder={dict.detailsPlaceholder}
                  className="w-full h-20 rounded-xl bg-background border border-border/50 focus:border-emerald-500 p-3 text-sm text-foreground focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm">
                <Plus className="h-4 w-4" />
                {dict.saveBtn}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Columns — Logs List and Overview Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dashboard Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">{dict.totalExpense}</span>
                <p className="text-xl font-black text-rose-600 dark:text-rose-400 font-display mt-0.5">₹{totalExpense}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">{dict.totalIncome}</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-display mt-0.5">₹{totalIncome}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">{dict.netIncome}</span>
                <p className={`text-xl font-black font-display mt-0.5 ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  ₹{netProfit}
                </p>
              </div>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Logs View */}
          <div className="border border-border/50 bg-card p-6 rounded-2xl shadow-sm">
            <div className="pb-4 mb-4 border-b border-border/40 flex flex-row items-center justify-between">
              <h3 className="text-base font-bold text-foreground font-display">
                {dict.logbookTitle}
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full select-none">
                {dict.recordsCount(logs.length)}
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[360px] pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {logs.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    {dict.emptyLog}
                  </div>
                ) : (
                  logs.map(log => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3.5 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            log.category === 'expense' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                            log.category === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}>
                            {log.category === 'expense' ? dict.catBadgeExpense : log.category === 'income' ? dict.catBadgeIncome : dict.catBadgeTask}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium">{log.date}</span>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/15 px-2 py-0.5 rounded-full">{log.crop}</span>
                        </div>
                        <p className="text-xs font-medium text-foreground leading-relaxed">{log.activity}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {log.category !== 'activity' && (
                          <span className={`text-sm font-bold font-display ${log.category === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {log.category === 'income' ? '+' : '-'} ₹{log.amount}
                          </span>
                        )}
                        <button 
                          onClick={() => handleDelete(log.id)}
                          className="p-2 rounded-lg bg-background border border-border/40 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Educational Guide Section ── */}
      <section className="mt-12 border-t border-border/50 pt-10 select-none">
        {(() => {
          const guide = KHET_DIARY_GUIDE_I18N[lang as keyof typeof KHET_DIARY_GUIDE_I18N] || KHET_DIARY_GUIDE_I18N.en
          return (
            <div className="space-y-8 text-foreground">
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
                  {guide.title}
                </h2>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed max-w-4xl">
                  {guide.desc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-5 rounded-2xl border border-border/50 bg-card space-y-3 shadow-sm">
                  <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display">
                    {guide.card1_title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {guide.card1_desc}
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-border/50 bg-card space-y-3 shadow-sm">
                  <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display">
                    {guide.card2_title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {guide.card2_desc}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-display font-bold text-foreground">
                  {guide.faq_title}
                </h2>
                <div className="grid gap-3 md:grid-cols-2 text-xs text-muted-foreground">
                  {guide.faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                      <h4 className="font-semibold text-foreground">{faq.q}</h4>
                      <p>{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}
      </section>
    </div>
  )
}

export default function KhetDiaryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <KhetDiaryContent />
    </Suspense>
  )
}
