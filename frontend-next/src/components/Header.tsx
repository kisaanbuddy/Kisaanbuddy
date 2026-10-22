'use client';

import Link from 'next/link';
import {
  Menu, X, LogOut, User as UserIcon,
  LayoutDashboard, CloudSun, Sprout, Bug,
  TrendingUp, Users, Mic, Star, ChevronDown,
  FlaskConical, Landmark, Search, Sparkles, Globe, Shield,
  Store, BarChart3, Settings
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dropdownVariants } from '@/lib/motion';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage, LANG_NAMES, LANG_DETAILS, SELECTABLE_LANGS, type Lang } from '@/lib/language';
import { useAuth, logoutUser } from '@/lib/auth';
import SearchModal from '@/components/SearchModal';
import { trackEvent } from '@/lib/analytics';

const NAV_LINK_LABELS: Record<string, Record<string, string>> = {
  '/dashboard': {
    en: 'Dashboard', hi: 'डैशबोर्ड', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', ta: 'டாஷ்போர்டு', te: 'డాష్‌బోర్డ్',
    ml: 'ഡാഷ്‌ബോർഡ്', mr: 'डॅशबोर्ड', bn: 'ড্যাশবোর্ড', pa: 'ਡੈਸ਼ਬੋਰਡ', gu: 'ડેશબોર્ડ', hi_en: 'Dashboard',
  },
  '/profile': {
    en: 'My Farm', hi: 'मेरा खेत', kn: 'ನನ್ನ ಜಮೀನು', ta: 'என் பண்ணை', te: 'నా పొలం',
    ml: 'എന്റെ കൃഷിയിടം', mr: 'माझे शेत', bn: 'আমার খামার', pa: 'ਮੇਰਾ ਖੇਤ', gu: 'મારું ખેતર', hi_en: 'Mera Khet',
  },
  '/chatbot': {
    en: 'AI Advisor', hi: 'AI सलाहकार', kn: 'AI ಸಲಹೆಗಾರ', ta: 'AI ஆலோசகர்', te: 'AI సలహాదారు',
    ml: 'AI ഉപദേശകൻ', mr: 'AI सल्लागार', bn: 'AI উপদেষ্টা', pa: 'AI ਸਲਾਹਕਾਰ', gu: 'AI સલાહકાર', hi_en: 'AI Advisor',
  },
  '/disease': {
    en: 'Crop Doctor', hi: 'फसल डॉक्टर', kn: 'ಬೆಳೆ ವೈದ್ಯ', ta: 'பயிர் மருத்துவர்', te: 'పంట డాక్టర్',
    ml: 'വിള ഡോക്ടർ', mr: 'पीक डॉक्टर', bn: 'ফসল ডাক্তার', pa: 'ਫਸਲ ਡਾਕਟਰ', gu: 'પાક ડૉક્ટર', hi_en: 'Crop Doctor',
  },
  '/marketplace': {
    en: 'Marketplace for Farmer', hi: 'किसान मार्केटप्लेस', kn: 'ರೈತರ ಮಾರುಕಟ್ಟೆ', ta: 'விவசாயிகள் சந்தை', te: 'రైతు మార్కెట్',
    ml: 'കർഷക വിപണി', mr: 'शेतकरी मार्केटप्लेस', bn: 'কৃষক মার্কেটপ্লেস', pa: 'ਕਿਸਾਨ ਮਾਰਕੀਟ', gu: 'ખેડૂત માર્કેટપ્લેસ', hi_en: 'Marketplace for Farmer',
  },
  '/mandi': {
    en: 'Mandi Rates', hi: 'मंडी भाव', kn: 'ಮಂಡಿ ದರಗಳು', ta: 'மண்டி விலைகள்', te: 'మండి ధరలు',
    ml: 'മണ്ടി നിരക്കുകൾ', mr: 'मंडी दर', bn: 'মান্ডি দর', pa: 'ਮੰਡੀ ਰੇਟ', gu: 'મંડી દર', hi_en: 'Mandi Rates',
  },
  '/weather': {
    en: 'Weather', hi: 'मौसम', kn: 'ಹವಾಮಾನ', ta: 'வானிலை', te: 'వాతావరణం',
    ml: 'കാലാവസ്ഥ', mr: 'हवामान', bn: 'আবহাওয়া', pa: 'ਮੌਸਮ', gu: 'હવામાન', hi_en: 'Mausam',
  },
  '/soil-health': {
    en: 'Soil Health', hi: 'मिट्टी स्वास्थ्य', kn: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ', ta: 'மண் ஆரோக்கியம்', te: 'నేల ఆరోగ్యం',
    ml: 'മണ്ണ് ആരോഗ്യം', mr: 'माती आरोग्य', bn: 'মাটির স্বাস্থ্য', pa: 'ਮਿੱਟੀ ਦੀ ਸਿਹਤ', gu: 'જમીન આરોગ્ય', hi_en: 'Mitti Health',
  },
  '/khet-diary': {
    en: 'Farm Diary', hi: 'खेत डायरी', kn: 'ಕೃಷಿ ಡೈರಿ', ta: 'பண்ணை நாட்குறிப்பு', te: 'వ్యవసాయ డైరీ',
    ml: 'ഫാം ഡയറി', mr: 'शेत डायरी', bn: 'খামার ডায়েরি', pa: 'ਖੇਤ ਡਾਇਰੀ', gu: 'ખેતર ડાયરી', hi_en: 'Khet Diary',
  },
  '/reports': {
    en: 'Reports', hi: 'रिपोर्ट्स', kn: 'ವರದಿಗಳು', ta: 'அறிக்கைகள்', te: 'నివేదికలు',
    ml: 'റിപ്പോർട്ടുകൾ', mr: 'अहवाल', bn: 'প্রতিবেদন', pa: 'ਰਿਪੋਰਟਾਂ', gu: 'અહેવાલો', hi_en: 'Reports',
  },
  '/schemes': {
    en: 'Schemes', hi: 'योजनाएं', kn: 'ಯೋಜನೆಗಳು', ta: 'திட்டங்கள்', te: 'పథకాలు',
    ml: 'പദ്ധതികൾ', mr: 'योजना', bn: 'প্রকল্প', pa: 'ਯੋਜਨਾਵਾਂ', gu: 'યોજનાઓ', hi_en: 'Schemes',
  },
  '/worker-connect': {
    en: 'Worker Connect', hi: 'वर्कर कनेक्ट', kn: 'ವರ್ಕರ್ ಕನೆಕ್ಟ್', ta: 'பணியாளர் இணைப்பு', te: 'వర్కర్ కనెక్ట్',
    ml: 'വർക്കർ കണക്ട്', mr: 'कामगार कनेक्ट', bn: 'শ্রমিক সংযোগ', pa: 'ਵਰਕਰ ਕਨੈਕਟ', gu: 'વર્કર કનેક્ટ', hi_en: 'Worker Connect',
  },
  '/settings': {
    en: 'Settings', hi: 'सेटिंग्स', kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', ta: 'அமைப்புகள்', te: 'సెట్టింగ్‌లు',
    ml: 'ക്രമീകരണങ്ങൾ', mr: 'सेटिंग्ज', bn: 'সেটিংস', pa: 'ਸੈਟਿੰਗਾਂ', gu: 'સેટિંગ્સ', hi_en: 'Settings',
  },
};

const PUBLIC_NAV_LABELS: Record<string, Record<string, string>> = {
  features: {
    en: "Features", hi: "सुविधाएं", kn: "ವೈಶಿಷ್ಟ್ಯಗಳು", ta: "அம்சங்கள்", te: "ఫీచర్లు",
    ml: "സവിശേഷതകൾ", mr: "वैशिष्ट्ये", bn: "বৈশিষ্ট্য", pa: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ", gu: "વિશેષતાઓ", hi_en: "Features",
  },
  how_it_works: {
    en: "How It Works", hi: "कैसे काम करता है", kn: "ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ", ta: "எவ்வாறு செயல்படுகிறது", te: "ఎలా పనిచేస్తుంది",
    ml: "എങ്ങനെ പ്രവർത്തിക്കുന്നു", mr: "कसे कार्य करते", bn: "কীভাবে কাজ করে", pa: "ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ", gu: "કેવી રીતે કાર્ય કરે છે", hi_en: "How It Works",
  },
  marketplace: {
    en: "Marketplace for Farmer", hi: "किसान मार्केटप्लेस", kn: "ರೈತರ ಮಾರುಕಟ್ಟೆ", ta: "விவசாயிகள் சந்தை", te: "రైతు మార్కెట్",
    ml: "കർഷക വിപണി", mr: "शेतकरी मार्केटप्लेस", bn: "কৃষক মার্কেটপ্লেস", pa: "ਕਿਸਾਨ ਮਾਰਕੀਟ", gu: "ખેડૂત માર્કેટપ્લેસ", hi_en: "Marketplace for Farmer",
  },
  marketplace_for_farmer: {
    en: "Marketplace for Farmer", hi: "किसान मार्केटप्लेस", kn: "ರೈತರ ಮಾರುಕಟ್ಟೆ", ta: "விவசாயிகள் சந்தை", te: "రైతు మార్కెట్",
    ml: "കർഷക വിപണി", mr: "शेतकरी मार्केटप्लेस", bn: "কৃষক মার্কেটপ্লেস", pa: "ਕਿਸਾਨ ਮਾਰਕੀਟ", gu: "ખેડૂત માર્કેટપ્લેસ", hi_en: "Marketplace for Farmer",
  },
  worker_connect: {
    en: "Worker Connect", hi: "वर्कर कनेक्ट", kn: "ವರ್ಕರ್ ಕನೆಕ್ಟ್", ta: "பணியாளர் இணைப்பு", te: "వర్కర్ కనెక్ట్",
    ml: "വർക്കർ കണക്ട്", mr: "कामगार कनेक्ट", bn: "শ্রমিক সংযোগ", pa: "ਵਰਕਰ ਕਨੈਕਟ", gu: "વર્કર કનેક્ટ", hi_en: "Worker Connect",
  },
  mandi: {
    en: "Mandi Prices", hi: "मंडी भाव", kn: "ಮಂಡಿ ದರಗಳು", ta: "மண்டி விலைகள்", te: "மండి ధరలు",
    ml: "മണ്ടി നിരക്കുകൾ", mr: "मंडी दर", bn: "মান্ডি দর", pa: "ਮੰਡੀ ਰੇਟ", gu: "મંડી દર", hi_en: "Mandi Rates",
  },
  weather: {
    en: "Weather", hi: "मौसम", kn: "ಹವಾಮಾನ", ta: "வானிலை", te: "వాతావరణం",
    ml: "കാലാവസ്ഥ", mr: "हवामान", bn: "আবহাওয়া", pa: "ਮੌਸਮ", gu: "હવામાન", hi_en: "Mausam",
  },
  about: {
    en: "About", hi: "हमारे बारे में", kn: "ನಮ್ಮ ಬಗ್ಗೆ", ta: "எங்களை பற்றி", te: "మా గురించి",
    ml: "ഞങ്ങളെ കുറിച്ച്", mr: "आमच्याबद्दल", bn: "আমাদের সম্পর্কে", pa: "ਸਾਡੇ ਬਾਰੇ", gu: "અમારા વિશે", hi_en: "About",
  },
  get_started: {
    en: "Get Started", hi: "शुरू करें", kn: "ಪ್ರಾರಂಭಿಸಿ", ta: "தொடங்குங்கள்", te: "ప్రారంਭించండి",
    ml: "ആരംഭിക്കുക", mr: "सुरू करा", bn: "শুরু করুন", pa: "ਸ਼ੁਰੂ ਕਰੋ", gu: "શરૂ કરો", hi_en: "Shuru Karein",
  },
  farmer_profile: {
    en: "Farmer Profile", hi: "किसान प्रोफाइल", kn: "ರೈತರ ಪ್ರೊಫೈಲ್", ta: "விவசாயி சுயவிவரம்", te: "రైతు ప్రొఫైల్",
    ml: "കർഷക പ്രൊഫൈൽ", mr: "शेतकरी प्रोफाइल", bn: "কৃষক প্রোফাইল", pa: "ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ", gu: "ખેડૂત પ્રોફાઇલ", hi_en: "Farmer Profile",
  },
  account: {
    en: "Account", hi: "अकाउंट", kn: "ಖಾತೆ", ta: "கணக்கு", te: "ఖాతా",
    ml: "അക്കൗണ്ട്", mr: "खाते", bn: "অ্যাকাউন্ট", pa: "ਖਾਤਾ", gu: "ખાતું", hi_en: "Account",
  },
  more_tools: {
    en: "More tools", hi: "और टूल", kn: "ಇನ್ನಷ್ಟು ಪರಿಕರಗಳು", ta: "கூடுதல் கருவிகள்", te: "మరిన్ని సాధనాలు",
    ml: "കൂടുതൽ ടൂളുകൾ", mr: "आणखी टूल्स", bn: "আরও সরঞ্জাম", pa: "ਹੋਰ ਸੰਦ", gu: "વધુ ટૂલ્સ", hi_en: "More tools",
  },
};

const NAV_LINK_DEFS = [
  { href: '/dashboard',      icon: LayoutDashboard },
  { href: '/profile',        icon: Sprout          },
  { href: '/chatbot',        icon: Mic             },
  { href: '/disease',        icon: Bug             },
  { href: '/marketplace',    icon: Store           },
  { href: '/worker-connect', icon: Users           },
  { href: '/mandi',          icon: TrendingUp      },
  { href: '/weather',        icon: CloudSun        },
  { href: '/soil-health',    icon: FlaskConical },
  { href: '/reports',        icon: BarChart3       },
  { href: '/schemes',        icon: Landmark        },
  { href: '/settings',       icon: Settings        },
] as const;

const PUBLIC_ROUTES = [
  '/',
  '/features',
  '/login',
  '/signup',
  '/onboarding',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/cookie-policy',
];



export function Header() {
  const [open, setOpen]           = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const pathname                  = usePathname();
  const router                    = useRouter();
  const { user, ready }           = useAuth();
  const { lang, setLang, t }        = useLanguage();
  const [langOpen, setLangOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toolsOpen, setToolsOpen]   = useState(false);
  const NAV_LINKS = NAV_LINK_DEFS.map(d => ({
    href: d.href,
    label: NAV_LINK_LABELS[d.href]?.[lang] || NAV_LINK_LABELS[d.href]?.en || 'Menu',
    icon: d.icon,
  }));

  /* close drawer on route change */
  useEffect(() => { setOpen(false); setToolsOpen(false); }, [pathname]);

  /* Ctrl+K keyboard shortcut to toggle search modal */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* body scroll lock when drawer open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* scroll monitor */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isPublic    = PUBLIC_ROUTES.includes(pathname || '');
  const showFullNav = !isPublic;

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href) ?? false;
  }

  async function handleLogout() {
    await logoutUser();
    setOpen(false);
    router.replace('/login');
  }

  /* user initials for avatar */
  const initials = user
    ? (user.name || user.email || 'U')
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
          scrolled
            ? 'bg-background/90 backdrop-blur-md border-border/80 shadow-2xs'
            : 'bg-background/70 backdrop-blur-xs border-border/60'
        }`}
      >
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* ── Logo ── */}
          <Link
            href={user ? '/dashboard' : '/'}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 shrink-0 group select-none"
          >
          <img
            src="/logo.jpeg"
            alt="KisaanBuddy Logo"
           className="w-7 h-7 object-contain"
          />
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg md:text-xl tracking-tight">
                <span className="font-extrabold text-foreground">Kisaan</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Buddy</span>
              </span>
              {isPublic && !user && (
                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  Smart Farming
                </span>
              )}
            </div>
          </Link>

          {/* ── Desktop Nav (Prioritizing Mandi, Marketplace for Farmer, Worker Connect, Features, AI Assistant) ── */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold" aria-label="Main Navigation">
            <Link
              href="/mandi"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors duration-150 ${
                isActive('/mandi')
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/20'
                  : 'text-stone-700 dark:text-stone-300 hover:text-emerald-700 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{PUBLIC_NAV_LABELS.mandi[lang] || "Mandi"}</span>
            </Link>

            <Link
              href="/marketplace"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors duration-150 ${
                isActive('/marketplace')
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/20'
                  : 'text-stone-700 dark:text-stone-300 hover:text-emerald-700 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Store className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{PUBLIC_NAV_LABELS.marketplace_for_farmer[lang] || "Marketplace for Farmer"}</span>
            </Link>

            <Link
              href="/worker-connect"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors duration-150 ${
                isActive('/worker-connect')
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/20'
                  : 'text-stone-700 dark:text-stone-300 hover:text-emerald-700 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Users className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{PUBLIC_NAV_LABELS.worker_connect[lang] || "Worker Connect"}</span>
            </Link>

            <Link
              href="/features"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors duration-150 ${
                isActive('/features')
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/20'
                  : 'text-stone-700 dark:text-stone-300 hover:text-emerald-700 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{PUBLIC_NAV_LABELS.features[lang] || "Features"}</span>
            </Link>

            <Link
              href="/chatbot"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors duration-150 ${
                isActive('/chatbot')
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/20'
                  : 'text-stone-700 dark:text-stone-300 hover:text-emerald-700 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Mic className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{lang === 'hi' ? 'AI सहायक' : lang === 'kn' ? 'AI ಸಹಾಯಕ' : 'AI Assistant'}</span>
            </Link>

            {/* More Tools Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setToolsOpen((v) => !v)}
                aria-expanded={toolsOpen}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-stone-600 dark:text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-foreground"
              >
                <span>{PUBLIC_NAV_LABELS.more_tools[lang] || "More"}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {toolsOpen && (
                  <>
                    <button type="button" aria-label="Close tools menu" onClick={() => setToolsOpen(false)} className="fixed inset-0 z-40 cursor-default" />
                    <motion.div
                      variants={dropdownVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="absolute right-0 top-9 z-50 grid w-56 grid-cols-1 gap-1 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2 shadow-xl"
                    >
                    <Link href="/dashboard" onClick={() => setToolsOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                      <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                      <span>Dashboard</span>
                    </Link>
                    <Link href="/crop-predictor" onClick={() => setToolsOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                      <Sprout className="h-4 w-4 text-emerald-600" />
                      <span>{lang === 'hi' ? 'फसल सलाह' : lang === 'kn' ? 'ಬೆಳೆ ಸಲಹೆ' : 'Crop Advisory'}</span>
                    </Link>
                    <Link href="/profile" onClick={() => setToolsOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                      <Sprout className="h-4 w-4 text-emerald-600" />
                      <span>{PUBLIC_NAV_LABELS.farmer_profile[lang] || "Farmer Profile"}</span>
                    </Link>
                    <Link href="/disease" onClick={() => setToolsOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                      <Bug className="h-4 w-4 text-rose-600" />
                      <span>Crop Doctor</span>
                    </Link>
                    <Link href="/soil-health" onClick={() => setToolsOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                      <FlaskConical className="h-4 w-4 text-amber-600" />
                      <span>Soil Health</span>
                    </Link>
                    <Link href="/schemes" onClick={() => setToolsOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                      <Landmark className="h-4 w-4 text-indigo-600" />
                      <span>Govt Schemes</span>
                    </Link>
                    <div className="border-t border-stone-200 dark:border-stone-800 my-1" />
                    <Link href="/about" onClick={() => setToolsOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                      <span>About KisaanBuddy</span>
                    </Link>
                  </motion.div>
                </>
              )}
              </AnimatePresence>
            </div>
          </nav>

          {/* ── Right side controls ── */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Quick Search */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              title={t("ui.search.title")}
              className="hidden md:flex h-8 items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-[11px]">{t("ui.search.label")}</span>
              <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-muted/60 px-1 font-mono text-[9px] text-muted-foreground">
                ⌘K
              </kbd>
            </button>
            
            <div className="hidden sm:flex items-center"><ThemeToggle /></div>

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-1.5 h-8 rounded-lg border border-border/70 bg-card/60 px-2.5 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors"
                aria-expanded={langOpen}
              >
                <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">{LANG_NAMES[lang]}</span>
                <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-150 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <>
                    <button className="fixed inset-0 z-40 cursor-default" onClick={() => setLangOpen(false)} aria-label={t("header.close")} />
                    <motion.div
                      variants={dropdownVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="absolute right-0 top-10 z-50 w-48 max-h-80 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg p-1.5 space-y-0.5"
                    >
                    {SELECTABLE_LANGS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          trackEvent({ type: 'language_switch', from: lang, to: l });
                          setLang(l);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                          lang === l
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-foreground hover:bg-muted/70 font-medium"
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-xs">{LANG_NAMES[l]}</span>
                          <span className="text-[10px] text-muted-foreground">{LANG_DETAILS[l]?.en}</span>
                        </div>
                        {lang === l && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
              </AnimatePresence>
            </div>

            {/* Logged-out Login + Start Free CTAs */}
            {ready && !user && isPublic && pathname !== '/login' && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/80 border border-border/70 transition-all"
                >
                  {t("loginLabel")}
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-8 items-center justify-center rounded-lg bg-[#14532D] hover:bg-[#166534] px-3.5 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  {PUBLIC_NAV_LABELS.get_started[lang] || PUBLIC_NAV_LABELS.get_started.en}
                </Link>
              </div>
            )}

            {/* Logged-in user badge */}
            {ready && user && showFullNav && (
              <div className="hidden md:flex items-center gap-1">
                {user.role === "Admin" && (
                  <Link
                    href="/admin"
                    title="Admin Portal"
                    className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/60 px-2 py-1 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-muted/60 transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="hidden xl:inline">Admin</span>
                  </Link>
                )}
                <Link
                  href="/farmer-profile"
                  title={PUBLIC_NAV_LABELS.farmer_profile[lang] || PUBLIC_NAV_LABELS.farmer_profile.en}
                  className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary hover:border-primary/40 hover:bg-primary/10 transition-colors"
                >
                  <Sprout className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">{PUBLIC_NAV_LABELS.farmer_profile[lang] || PUBLIC_NAV_LABELS.farmer_profile.en}</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg border border-border/80 bg-card/60 px-2 py-1 text-xs hover:border-primary/40 hover:bg-muted/60 transition-colors"
                >
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={t("header.profile")}
                      className="h-5 w-5 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                      {initials}
                    </div>
                  )}
                  <span className="font-medium text-foreground max-w-[90px] truncate">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title={t("header.sign_out")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            {(showFullNav || (!user && isPublic && pathname !== '/login')) && (
              <button
                type="button"
                aria-label={open ? t("ui.navigation.close_menu") : t("ui.navigation.open_menu")}
                aria-expanded={open}
                onClick={() => setOpen(v => !v)}
                className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-card/60 text-foreground hover:bg-muted transition-colors"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              aria-label={t("header.close_menu")}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden cursor-default"
              onClick={() => setOpen(false)}
            />

            <motion.nav
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-16 left-3 right-3 z-50 lg:hidden rounded-2xl border border-border bg-card p-4 shadow-xl flex flex-col gap-1.5 max-h-[82vh] overflow-y-auto"
              aria-label={t("header.mobile_navigation")}
            >
            {showFullNav ? (
              <>
                {/* User Info Row */}
                <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                  <Link
                    href="/farmer-profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Sprout className="h-3.5 w-3.5" />
                    <span>{PUBLIC_NAV_LABELS.farmer_profile[lang] || "Farmer Profile"}</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-muted/50 border border-border/60 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{PUBLIC_NAV_LABELS.account[lang] || "Account"}</span>
                  </Link>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-2.5 mb-1 rounded-xl bg-muted/50 border border-border/60 hover:bg-muted transition-colors"
                >
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={t("header.profile")}
                      className="h-8 w-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">{user?.phone_number || user?.email}</span>
                  </div>
                </Link>

                {/* Nav Links */}
                <div className="grid grid-cols-1 gap-1 my-1">
                  {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                          active
                            ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                        <span>{label}</span>
                        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                      </Link>
                    );
                  })}
                </div>

                {user?.role === "Admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <Shield className="h-4 w-4 shrink-0 text-primary" />
                    <span>Admin Portal</span>
                  </Link>
                )}

                <Link
                  href="/founders"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <Star className="h-4 w-4 shrink-0 text-amber-500 fill-amber-500/20" />
                  <span>{t("founders")}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors mt-1"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>{t("logout")}</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-1 pt-1">
                <Link
                  href="/mandi"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 transition-colors"
                >
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span>{PUBLIC_NAV_LABELS.mandi[lang] || "Mandi Rates"}</span>
                </Link>

                <Link
                  href="/marketplace"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <Store className="h-4 w-4 text-emerald-600" />
                  <span>{PUBLIC_NAV_LABELS.marketplace_for_farmer[lang] || "Marketplace for Farmer"}</span>
                </Link>

                <Link
                  href="/worker-connect"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span>{PUBLIC_NAV_LABELS.worker_connect[lang] || "Worker Connect"}</span>
                </Link>

                <Link
                  href="/features"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>{PUBLIC_NAV_LABELS.features[lang] || "Features"}</span>
                </Link>

                <Link
                  href="/chatbot"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <Mic className="h-4 w-4 text-emerald-600" />
                  <span>{lang === 'hi' ? 'AI खेती सहायक' : lang === 'kn' ? 'AI ಸಹಾಯಕ' : 'AI Assistant'}</span>
                </Link>

                <div className="border-t border-stone-200 dark:border-stone-800 my-1" />

                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <Link
                    href="/crop-predictor"
                    onClick={() => setOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    {lang === 'hi' ? 'फसल सलाह' : 'Crop Advisory'}
                  </Link>
                  <Link
                    href="/disease"
                    onClick={() => setOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    Crop Doctor
                  </Link>
                  <Link
                    href="/soil-health"
                    onClick={() => setOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    Soil Health
                  </Link>
                  <Link
                    href="/schemes"
                    onClick={() => setOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    Govt Schemes
                  </Link>
                </div>

                <div className="border-t border-border/80 pt-2.5 mt-1 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-center text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    {t("loginLabel")}
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-[#14532D] hover:bg-[#166534] px-4 py-2.5 text-center text-xs font-bold text-white shadow-xs transition-colors"
                  >
                    {PUBLIC_NAV_LABELS.get_started[lang] || "Get Started"}
                  </Link>
                </div>
              </div>
            )}
          </motion.nav>
        </>
      )}
      </AnimatePresence>

      {/* Global Search Modal Overlay */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
