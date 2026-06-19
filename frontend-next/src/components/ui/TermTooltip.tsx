"use client"

import React, { useState } from 'react'
import { Info } from 'lucide-react'

const TERMS_DATA: Record<string, { en: string; hi: string }> = {
  NPK: {
    en: "Nitrogen (N), Phosphorus (P), Potassium (K) - The three primary nutrients vital for crop growth.",
    hi: "नाइट्रोजन (N), फास्फोरस (P), पोटेशियम (K) - फसलों की वृद्धि के लिए आवश्यक तीन मुख्य पोषक तत्व।"
  },
  MSP: {
    en: "Minimum Support Price - The guaranteed price at which the government purchases crops from farmers.",
    hi: "न्यूनतम समर्थन मूल्य - वह न्यूनतम दर जिस पर सरकार किसानों से फसल खरीदती है।"
  },
  eNAM: {
    en: "Electronic National Agriculture Market - An online trading platform that connects mandi networks across India.",
    hi: "राष्ट्रीय कृषि बाजार - भारत भर की मंडियों को जोड़ने वाला ऑनलाइन व्यापार मंच।"
  },
  pH: {
    en: "Potential of Hydrogen - Measures how acidic or alkaline the soil is (ideal range is 6.0 to 7.0 for most crops).",
    hi: "हाइड्रोजन की क्षमता - मिट्टी की अम्लता या क्षारीयता का माप (अधिकांश फसलों के लिए 6.0 से 7.0 आदर्श है)।"
  },
  Kharif: {
    en: "Monsoon crops sown in June-July and harvested in September-October (e.g. Rice, Rice Paddy, Maize, Cotton).",
    hi: "मानसून की फसलें जो जून-जुलाई में बोई जाती हैं और सितंबर-अक्टूबर में काटी जाती हैं (जैसे धान, मक्का, कपास)।"
  },
  Rabi: {
    en: "Winter crops sown in October-November and harvested in March-April (e.g. Wheat, Mustard, Gram).",
    hi: "सर्दियों की फसलें जो अक्टूबर-नवंबर में बोई जाती हैं और मार्च-अप्रैल में काटी जाती हैं (जैसे गेहूं, सरसों, चना)।"
  }
}

interface TermTooltipProps {
  term: keyof typeof TERMS_DATA
  children?: React.ReactNode
  lang?: 'en' | 'hi' | string
}

export function TermTooltip({ term, children, lang = 'hi' }: TermTooltipProps) {
  const [visible, setVisible] = useState(false)
  const activeLang = lang === 'en' ? 'en' : 'hi'
  const data = TERMS_DATA[term] || { en: term, hi: term }

  return (
    <span 
      className="relative inline-flex items-center gap-1 cursor-help border-b border-dotted border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold select-none"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
    >
      {children || term}
      <Info className="h-3 w-3 shrink-0 opacity-80" />
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-emerald-500/20 z-50 animate-fade-in font-medium leading-relaxed text-center">
          {data[activeLang]}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
        </span>
      )}
    </span>
  )
}
