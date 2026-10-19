'use client';

import Link from 'next/link';
import { Sprout, TrendingUp, Users, Languages } from 'lucide-react';
import { useLanguage } from '@/lib/language';

const STATS_DATA = [
  {
    icon: Sprout,
    href: '/disease',
    iconColor: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
    metric: {
      en: 'Crop Doctor', hi: 'फसल डॉक्टर', kn: 'ಬೆಳೆ ಡಾಕ್ಟರ್',
      mr: 'पीक डॉक्टर', te: 'పంట డాక్టర్', ta: 'பயிர் மருத்துவர்',
      gu: 'પાક ડોક્ટર', bn: 'ফসল ডাক্তার', pa: 'ਫਸਲ ਡਾਕਟਰ', ml: 'വിള ഡോക്ടർ', hi_en: 'Crop Doctor',
    },
    label: {
      en: 'AI disease checks & remedies', hi: 'रोग पहचान व जैविक उपचार', kn: 'ರೋಗ ಪತ್ತೆ ಮತ್ತು ಜೈವಿಕ ಪರಿಹಾರ',
      mr: 'रोग निदान व जैविक उपाय', te: 'తెగుళ్ల గుర్తింపు & నివారణ', ta: 'நோய் கண்டறிதல் & இயற்கை தீர்வுகள்',
      gu: 'રોગ ઓળખ અને કુદરતી ઉપચાર', bn: 'রোগ নির্ণয় ও জৈব প্রতিকার', pa: 'ਬਿਮਾਰੀ ਜਾਂਚ ਅਤੇ ਜੈਵਿਕ ਇਲਾਜ', ml: 'രോഗനിർണയവും ജൈവ പരിഹാരങ്ങളും', hi_en: 'Disease checks & remedies',
    },
  },
  {
    icon: TrendingUp,
    href: '/mandi',
    iconColor: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    metric: {
      en: 'Mandi Rates', hi: 'मंडी भाव', kn: 'ಮಂಡಿ ದರಗಳು',
      mr: 'बाजारभाव', te: 'మార్కెట్ ధరలు', ta: 'மண்டி விலைகள்',
      gu: 'મંડી ભાવ', bn: 'মান্ডি দর', pa: 'ਮੰਡੀ ਦੇ ਭਾਅ', ml: 'വിപണി നിരക്കുകൾ', hi_en: 'Mandi Rates',
    },
    label: {
      en: 'Daily eNAM wholesale prices', hi: 'दैनिक eNAM थोक मंडी भाव', kn: 'ದೈನಂದಿನ eNAM ಸಗಟು ದರಗಳು',
      mr: 'दैनिक eNAM घाऊक बाजारभाव', te: 'రోజువారీ eNAM మార్కెట్ ధరలు', ta: 'தினசரி eNAM மொத்த விற்பனை விலை',
      gu: 'દૈનિક eNAM જથ્થાબંધ મંડી ભાવ', bn: 'দৈনিক eNAM পাইকারি মান্ডি দর', pa: 'ਰੋਜ਼ਾਨਾ eNAM ਥੋਕ ਮੰਡੀ ਰੇਟ', ml: 'പ്രതിദിന eNAM മൊത്തവിലകൾ', hi_en: 'Daily eNAM wholesale rates',
    },
  },
  {
    icon: Users,
    href: '/worker-connect',
    iconColor: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
    metric: {
      en: 'Workers Connect', hi: 'वर्कर कनेक्ट', kn: 'ವರ್ಕರ್ ಕನೆಕ್ಟ್',
      mr: 'वर्कर्स कनेक्ट', te: 'వర్కర్స్ కనెక్ట్', ta: 'வர்க்கர்ஸ் கனெக்ட்',
      gu: 'વર્કર્સ કનેક્ટ', bn: 'ওয়ার্কার্স কানেক্ট', pa: 'ਵਰਕਰ ਕਨੈਕਟ', ml: 'വർക്കേഴ്സ് കണക്ട്', hi_en: 'Workers Connect',
    },
    label: {
      en: 'Farm labour & jobs near you', hi: 'मजदूर खोजें या काम पाएं', kn: 'ಕೃಷಿ ಕಾರ್ಮಿಕರು & ಉದ್ಯೋಗಗಳು',
      mr: 'शेतासाठी मजूर व कामे', te: 'వ్యవసాయ కూలీలు & పనులు', ta: 'பண்ணைத் தொழிலாளர்கள் & வேலைகள்',
      gu: 'ખેત મજૂરો અને રોજગાર', bn: 'কৃষি শ্রমিক ও কাজ খুঁজুন', pa: 'ਖੇਤ ਮਜ਼ਦੂਰ ਅਤੇ ਕੰਮ', ml: 'കാർഷിക തൊഴിലാളികളും ജോലികളും', hi_en: 'Mazdoor hire karein ya kaam paayein',
    },
  },
  {
    icon: Languages,
    href: '#',
    iconColor: 'text-violet-600 bg-violet-500/10 border-violet-500/20',
    metric: {
      en: '10+ Languages', hi: '10+ भाषाएं', kn: '10+ ಭಾಷೆಗಳು',
      mr: '१०+ भाषा', te: '10+ భాషలు', ta: '10+ மொழிகள்',
      gu: '10+ ભાષાઓ', bn: '১০+ ভাষা', pa: '10+ ਭਾਸ਼ਾਵਾਂ', ml: '10+ ഭാഷകൾ', hi_en: '10+ Languages',
    },
    label: {
      en: '10+ Indian regional languages', hi: 'भारतीय भाषाओं में उपलब्ध', kn: 'ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಲಭ್ಯವಿದೆ',
      mr: 'भारतीय प्रादेशिक भाषांमध्ये उपलब्ध', te: 'భారతీయ ప్రాంతీయ భాషల్లో', ta: 'இந்திய பிராந்திய மொழிகளில்',
      gu: 'ભારતીય પ્રાદેશિક ભાષાઓમાં', bn: 'ভারতীয় আঞ্চলিক ভাষা সমূহে', pa: 'ਭਾਰਤੀ ਖੇਤਰੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ', ml: 'ഇന്ത്യൻ പ്രാദേശിക ഭാഷകളിൽ', hi_en: 'Indian regional languages me',
    },
  },
];

export function TrustPanel() {
  const { lang } = useLanguage();

  return (
    <section className="relative z-20 py-6 sm:py-8 border-b border-border/60 bg-muted/10">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {STATS_DATA.map((item, idx) => {
            const Icon = item.icon;
            const metric = item.metric[lang] || item.metric.en;
            const label = item.label[lang] || item.label.en;

            return (
              <Link
                key={idx}
                href={item.href}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 sm:p-5 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/40 hover:shadow-sm transition-all duration-200 group"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border group-hover:scale-105 transition-transform duration-200 ${item.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm sm:text-base font-display font-bold text-foreground tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
                    {metric}
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-normal mt-0.5 leading-tight">
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
