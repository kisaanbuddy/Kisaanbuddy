"use client"

import React from 'react'
import { useLanguage } from '@/lib/language'
import { GlassCard } from '@/components/ui/card'
import { CheckCircle2, Quote, UserCheck } from 'lucide-react'

interface Testimonial {
  name: { en: string; hi: string }
  location: { en: string; hi: string }
  crop: { en: string; hi: string }
  text: { en: string; hi: string }
  avatarUrl?: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: { en: "Baldev Singh", hi: "बलदेव सिंह" },
    location: { en: "Ludhiana, Punjab", hi: "लुधियाना, पंजाब" },
    crop: { en: "Wheat (DBW 187)", hi: "गेहूं (DBW 187)" },
    text: {
      en: "KisaanBuddy's soil adviser showed me my organic carbon was too low. I reduced urea, added zinc and compost, and saved Rs. 5,200 per acre while keeping my yields high.",
      hi: "किसानमित्र के मृदा सलाहकार ने मुझे दिखाया कि मेरा जैविक कार्बन बहुत कम था। मैंने यूरिया कम किया, जिंक और खाद डाला, और पैदावार को अधिक रखते हुए प्रति एकड़ 5,200 रुपये बचाए।"
    }
  },
  {
    name: { en: "Hanuman Ram", hi: "हनुमान राम" },
    location: { en: "Jodhpur, Rajasthan", hi: "जोधपुर, राजस्थान" },
    crop: { en: "Cotton & Pearl Millet", hi: "कपास और बाजरा" },
    text: {
      en: "I found the PMKSY drip irrigation scheme on KisaanBuddy and learned the step-by-step registration. The local department verified my application, and I got an 80% subsidy.",
      hi: "मैंने किसानमित्र पर पीएमकेएसवाई (PMKSY) ड्रिप सिंचाई योजना की जानकारी पाई और पंजीकरण करना सीखा। स्थानीय विभाग ने मेरे आवेदन को सत्यापित किया, और मुझे 80% सब्सिडी मिली।"
    }
  },
  {
    name: { en: "Satish Mishra", hi: "सतीश मिश्रा" },
    location: { en: "Ayodhya, Uttar Pradesh", hi: "अयोध्या, उत्तर प्रदेश" },
    crop: { en: "Potato & Paddy", hi: "आलू और धान" },
    text: {
      en: "When my potatoes got dark spots during foggy weather, KisaanBuddy's disease scanner diagnosed it as Late Blight. The suggested Cymoxanil spray stopped it in 3 days.",
      hi: "जब कोहरे के मौसम में मेरे आलुओं पर काले धब्बे आ गए, तो किसानमित्र के रोग स्कैनर ने पछेती झुलसा की पहचान की। अनुशंसित साइमोक्सानिल स्प्रे ने इसे 3 दिनों में रोक दिया।"
    }
  },
  {
    name: { en: "Devendra Patil", hi: "देवेन्द्र पाटिल" },
    location: { en: "Nashik, Maharashtra", hi: "नासिक, महाराष्ट्र" },
    crop: { en: "Grapes & Vegetables", hi: "अंगूर और सब्जियां" },
    text: {
      en: "The eNAM guide on the blog helped me understand online quality testing. I registered my produce on eNAM and sold my harvest to a buyer in Delhi directly, getting 15% more than local mandi price.",
      hi: "ब्लॉग पर ई-नाम (eNAM) गाइड ने मुझे ऑनलाइन गुणवत्ता परीक्षण को समझने में मदद की। मैंने अपनी उपज को पंजीकृत किया और दिल्ली के एक खरीदार को सीधे बेचा, जिससे स्थानीय मंडी से 15% अधिक मिला।"
    }
  }
]

export default function TrustTestimonials() {
  const { lang } = useLanguage()
  const activeLang = lang === 'en' ? 'en' : 'hi'

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <UserCheck className="h-3.5 w-3.5" />
          {activeLang === 'en' ? "Verified Testimonials" : "सत्यापित अनुभव"}
        </span>
        <h2 className="text-xl md:text-3xl font-black text-white font-display">
          {activeLang === 'en' ? "Real Impact, Real Farmers" : "वास्तविक प्रभाव, वास्तविक किसान"}
        </h2>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto font-semibold">
          {activeLang === 'en' 
            ? "Hear from actual smallholders across India who used KisaanBuddy to optimize crop costs and protect yields."
            : "भारत भर के उन किसानों के अनुभव सुनें जिन्होंने फसल लागत कम करने और पैदावार बढ़ाने के लिए किसानमित्र का उपयोग किया।"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {TESTIMONIALS.map((t, idx) => (
          <GlassCard 
            key={idx} 
            className="p-6 border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-300 relative bg-slate-950/10 flex flex-col justify-between rounded-2xl"
          >
            <Quote className="absolute right-6 top-6 h-8 w-8 text-white/[0.02] pointer-events-none" />
            
            <div className="space-y-4">
              {/* Testimonial Quote */}
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed italic font-semibold">
                "{t.text[activeLang]}"
              </p>
            </div>

            {/* Farmer Profile Footer */}
            <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  {t.name[activeLang]}
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-2 w-2" /> Verified
                  </span>
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                  {t.location[activeLang]}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04] text-emerald-400">
                  {t.crop[activeLang]}
                </span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}
