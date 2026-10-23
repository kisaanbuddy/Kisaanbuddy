'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Smartphone, Sprout } from 'lucide-react';
import { useLanguage } from '@/lib/language';

const CTA_CONTENT: Record<string, Record<string, string>> = {
  eyebrow: {
    en: 'DEDICATED TO INDIAN AGRICULTURE',
    hi: 'भारतीय किसानों के लिए समर्पित',
    kn: 'ಭಾರತೀಯ ಕೃಷಿಗೆ ಸಮರ್ಪಿತ',
    mr: 'भारतीय शेतीसाठी समर्पित',
    te: 'భారతీయ వ్యవసాయానికి అంకితం',
    ta: 'இந்திய விவசாயத்திற்கு அர்ப்பணிக்கப்பட்டது',
    gu: 'ભારતીય કૃષિને સમર્પિત',
    bn: 'ভারতীয় কৃষির প্রতি নিবেদিত',
    pa: 'ਭਾਰਤੀ ਖੇਤੀ ਨੂੰ ਸਮਰਪਿਤ',
    ml: 'ഭാരതീയ കാർഷിക മേഖലയ്ക്കായി സമർപ്പിച്ചത്',
    hi_en: 'Bharatiya Kisanon ke liye Samarpit',
  },
  title: {
    en: 'Start Making More Informed Farming Decisions.',
    hi: 'खेती के बेहतर और सुरक्षित फैसले लेना शुरू करें।',
    kn: 'ಕೃಷಿಯಲ್ಲಿ ಹೆಚ್ಚು ಮಾಹಿತಿಯುತ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ಪ್ರಾರಂಭಿಸಿ.',
    mr: 'शेतीचे अधिक माहितीपूर्ण आणि योग्य निर्णय घेण्यास सुरुवात करा.',
    te: 'వ్యవసాయంలో మరింత సరైన నిర్ణయాలు తీసుకోవడం ప్రారంభించండి.',
    ta: 'விவசாயத்தில் சிறந்த மற்றும் தகவலறிந்த முடிவுகளை எடுக்கத் தொடங்குங்கள்.',
    gu: 'ખેતીમાં વધુ સચોટ અને યોગ્ય નિર્ણયો લેવાનું શરૂ કરો.',
    bn: 'কৃষিতে আরও সঠিক এবং তথ্যভিত্তিক সিদ্ধান্ত নেওয়া শুরু করুন।',
    pa: 'ਖੇਤੀ ਵਿੱਚ ਵਧੇਰੇ ਸਹੀ ਫੈਸਲੇ ਲੈਣੇ ਸ਼ੁਰੂ ਕਰੋ।',
    ml: 'കൃഷിയിൽ കൂടുതൽ അറിവോടെയുള്ള തീരുമാനങ്ങൾ എടുക്കാൻ തുടങ്ങുക.',
    hi_en: 'Kheti ke behtar aur safe faisle lena shuru karein.',
  },
  subtitle: {
    en: 'Create your free Farmer Profile in 2 minutes. Receive localized weather alerts, AI crop diagnosis, soil guidance, and mandi rates tailored specifically to your land.',
    hi: 'सिर्फ 2 मिनट में अपना निःशुल्क फार्म प्रोफाइल बनाएं। अपने खेत की मिट्टी, मौसम, और फसल के अनुसार सटीक सलाह और मंडी भाव पाएं।',
    kn: 'ಕೇವಲ 2 ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಉಚಿತ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ. ನಿಮ್ಮ ಜಮೀನಿನ ಮಣ್ಣು, ಹವಾಮಾನ ಮತ್ತು ಬೆಳೆಗೆ ಅನುಗುಣವಾಗಿ ಸ್ಥಳೀಯ ಎಚ್ಚರಿಕೆಗಳು, AI ಬೆಳೆ ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ಮಂಡಿ ದರಗಳನ್ನು ಪಡೆಯಿರಿ.',
    mr: 'फक्त २ मिनिटांत तुमचे मोफत शेतकरी प्रोफाइल बनवा. तुमच्या जमिनीनुसार स्थानिक हवामान, AI पीक रोग निदान, माती सल्ला आणि बाजारभाव मिळवा.',
    te: 'కేవలం 2 నిమిషాల్లో మీ ఉచిత రైతు ప్రొఫైల్‌ను సృష్టించండి. మీ పొలానికి అనుగుణంగా వాతావరణ హెచ్చరికలు, AI పంట వ్యాధి నిర్ధారణ, నేల సలహా మరియు మార్కెట్ ధరలను పొందండి.',
    ta: '2 நிமிடங்களில் உங்கள் இலவச விவசாயி சுயவிவரத்தை உருவாக்குங்கள். உங்கள் நிலத்திற்கேற்ற வானிலை எச்சரிக்கைகள், AI பயிர் நோய் கண்டறிதல், மண் வழிகாட்டுதல் மற்றும் மண்டி விலைகளைப் பெறுங்கள்.',
    gu: 'માત્ર 2 મિનિટમાં તમારું મફત ખેડૂત પ્રોફાઇલ બનાવો. તમારા ખેતર મુજબ સ્થાનિક હવામાન, AI પાક રોગ નિદાન, જમીન માર્ગદર્શન અને મંડી ભાવ મેળવો.',
    bn: 'মাত্র ২ মিনিটে আপনার বিনামূল্যে কৃষক প্রোফাইল তৈরি করুন। আপনার জমির জন্য আবহাওয়া সতর্কতা, AI ফসলের রোগ নির্ণয়, মাটির নির্দেশিকা এবং মান্ডি দর পান।',
    pa: 'ਸਿਰਫ਼ 2 ਮਿੰਟਾਂ ਵਿੱਚ ਆਪਣਾ ਮੁਫ਼ਤ ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ। ਆਪਣੇ ਖੇਤ ਲਈ ਮੌਸਮ ਚਿਤਾਵਨੀਆਂ, AI ਫਸਲ ਬਿਮਾਰੀ ਜਾਂਚ, ਮਿੱਟੀ ਸਲਾਹ ਅਤੇ ਮੰਡੀ ਦੇ ਭਾਅ ਪ੍ਰਾਪਤ ਕਰੋ।',
    ml: '2 മിനിറ്റിനുള്ളിൽ നിങ്ങളുടെ സൗജന്യ കർഷക പ്രൊഫൈൽ സൃഷ്ടിക്കുക. കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ, AI വിള രോഗനിർണയം, മണ്ണ് മാർഗ്ഗനിർദ്ദേശം, വിപണി നിരക്കുകൾ എന്നിവ നേടുക.',
    hi_en: 'Sirf 2 minute me apna free farm profile banayein. Apne khet ke anusar weather alerts, AI crop doctor, aur mandi rates paayein.',
  },
  cta_setup: {
    en: 'Set Up My Farm Profile',
    hi: 'अपना फार्म प्रोफाइल बनाएं',
    kn: 'ನನ್ನ ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ',
    mr: 'माझे फार्म प्रोफाइल तयार करा',
    te: 'నా ఫార్మ్ ప్రొఫైల్ సృష్టించండి',
    ta: 'என் பண்ணை சுயவிவரத்தை அமைக்குக',
    gu: 'મારું ફાર્મ પ્રોફાઇલ બનાવો',
    bn: 'আমার খামার প্রোফাইল তৈরি করুন',
    pa: 'ਆਪਣਾ ਫਾਰਮ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ',
    ml: 'എന്റെ ഫാം പ്രൊഫൈൽ നിർമ്മിക്കുക',
    hi_en: 'Apna Farm Profile Banayein',
  },
  cta_explore: {
    en: 'Explore Features',
    hi: 'सभी टूल्स देखें',
    kn: 'ಎಲ್ಲಾ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    mr: 'सर्व वैशिष्ट्ये पहा',
    te: 'అన్ని ఫీచర్లను చూడండి',
    ta: 'அனைத்து அம்சங்களையும் காண்க',
    gu: 'બધા સાધનો જુઓ',
    bn: 'সব বৈশিষ্ট্য দেখুন',
    pa: 'ਸਾਰੇ ਫੀਚਰ ਵੇਖੋ',
    ml: 'എല്ലാ സവിശേഷതകളും കാണുക',
    hi_en: 'Sabhi Features Dekhein',
  },
  badge_free: {
    en: '100% Free For Farmers',
    hi: 'किसानों के लिए 100% निःशुल्क',
    kn: 'ರೈತರಿಗಾಗಿ 100% ಉಚಿತ',
    mr: 'शेतकऱ्यांसाठी १००% मोफत',
    te: 'రైతుల కోసం 100% ఉచితం',
    ta: 'விவசாயிகளுக்கு 100% இலவசம்',
    gu: 'ખેડૂતો માટે 100% મફત',
    bn: 'কৃষকদের জন্য ১০০% বিনামূল্যে',
    pa: 'ਕਿਸਾਨਾਂ ਲਈ 100% ਮੁਫ਼ਤ',
    ml: 'കർഷകർക്കായി 100% സൗജന്യം',
    hi_en: 'Kisanon ke liye 100% Free',
  },
  badge_mobile: {
    en: 'Works On Any Mobile Device',
    hi: 'हर मोबाइल फोन पर समर्थित',
    kn: 'ಪ್ರತಿ ಮೊಬೈಲ್‌ನಲ್ಲೂ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    mr: 'प्रत्येक मोबाईल फोनवर चालते',
    te: 'ప్రతి మొబైల్ పరికరంలో పనిచేస్తుంది',
    ta: 'எல்லா மொபைல் போனிலும் வேலை செய்யும்',
    gu: 'દરેક મોબાઇલ ફોન પર ચાલે છે',
    bn: 'যেকোনো মোবাইল ডিভাইসে কাজ করে',
    pa: 'ਹਰ ਮੋਬਾਈਲ ਫੋਨ ਤੇ ਕੰਮ ਕਰਦਾ ਹੈ',
    ml: 'ഏത് മൊബൈലിലും പ്രവർത്തിക്കും',
    hi_en: 'Har Mobile par Chalta Hai',
  },
  badge_languages: {
    en: 'Available In 10+ Indian Languages',
    hi: '10+ भारतीय भाषाओं में उपलब्ध',
    kn: 'ಕನ್ನಡ, ಹಿಂದಿ ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳಲ್ಲಿ',
    mr: 'मराठीसह १०+ भारतीय भाषांमध्ये',
    te: 'తెలుగు సహా 10+ భారతీయ భాషల్లో',
    ta: 'தமிழ் உட்பட 10+ இந்திய மொழிகளில்',
    gu: 'ગુજરાતી સહિત 10+ ભારતીય ભાષાઓમાં',
    bn: 'বাংলা সহ ১০+ ভারতীয় ভাষায়',
    pa: 'ਪੰਜਾਬੀ ਸਮੇਤ 10+ ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ',
    ml: 'മലയാളം ഉൾപ്പെടെ 10+ ഇന്ത്യൻ ഭാഷകളിൽ',
    hi_en: '10+ Indian Languages me Uplabdh',
  },
};

export function FinalCTA() {
  const { lang } = useLanguage();
  const txt = (key: string): string => CTA_CONTENT[key]?.[lang] || CTA_CONTENT[key]?.en || '';

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 text-center bg-background relative overflow-hidden">
      {/* Background Graphic Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-card via-card/95 to-emerald-500/[0.04] p-8 sm:p-14 lg:p-16 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient top bar */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[400px] h-[160px] bg-gradient-to-r from-emerald-500/20 via-amber-500/10 to-teal-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Eyebrow */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-6 select-none">
          <Sprout className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{txt('eyebrow')}</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15] mb-4">
          {txt('title')}
        </h2>
        
        {/* Subheading */}
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8 font-medium">
          {txt('subtitle')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-3.5 pt-2">
          <Link href="/signup">
            <button className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-12 px-8 shadow-lg shadow-emerald-900/25 flex items-center gap-2.5 transition-all duration-200 active:scale-[0.98] text-sm cursor-pointer">
              <span>{txt('cta_setup')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link href="/features">
            <button className="rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground font-semibold h-12 px-7 flex items-center gap-2 text-sm shadow-xs transition-all duration-200 active:scale-[0.98] cursor-pointer">
              <span>{txt('cta_explore')}</span>
            </button>
          </Link>
        </div>

        {/* 3 Real Guarantees */}
        <div className="flex flex-wrap justify-center items-center gap-6 mt-10 pt-8 border-t border-border/50 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{txt('badge_free')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{txt('badge_mobile')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{txt('badge_languages')}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
