'use client';

import Link from 'next/link';
import { 
  ArrowRight, BookOpen, Bug, CloudSun, FlaskConical, 
  Landmark, MessageSquare, ShoppingBag, Sparkles, UserCheck 
} from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function Features() {
  const { lang } = useLanguage();
  const isKn = lang === 'kn';
  const isHi = lang === 'hi';

  const tools = [
    {
      icon: UserCheck,
      href: '/profile',
      tag: isKn ? 'ಡಿಜಿಟಲ್ ಗುರುತು' : isHi ? 'डिजिटल पहचान' : 'Farm Identity',
      title: isKn ? 'ರೈತ ಮತ್ತು ಜಮೀನು ಪ್ರೊಫೈಲ್' : isHi ? 'किसान व खेत प्रोफाइल' : 'Farmer & Farm Profile',
      desc: isKn
        ? 'ನಿಮ್ಮ ಎಲ್ಲಾ ಜಮೀನುಗಳ ವಿಸ್ತೀರ್ಣ, ಮಣ್ಣಿನ ಪ್ರಕಾರ, ಲಭ್ಯವಿರುವ ನೀರಾವರಿ ಮತ್ತು ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ದಾಖಲಿಸಿ.'
        : isHi 
        ? 'अपने सभी खेतों का रकबा, मिट्टी प्रकार, उपलब्ध सिंचाई व उपकरण सुरक्षित दर्ज रखें।' 
        : 'Store plot acreage, soil types, irrigation infrastructure, and equipment for permanent farm memory.',
      topGradient: 'from-emerald-500 to-green-600',
      accent: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    },
    {
      icon: Bug,
      href: '/disease',
      tag: isKn ? 'ಕಂಪ್ಯೂಟರ್ ವಿಷನ್' : isHi ? 'कंप्यूटर विजन' : 'Computer Vision',
      title: isKn ? 'ಬೆಳೆ ಡಾಕ್ಟರ್ AI' : isHi ? 'फसल डॉक्टर AI' : 'AI Crop Doctor',
      desc: isKn
        ? 'ರೋಗಪೀಡಿತ ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ. AI ತಕ್ಷಣವೇ ಶಿಲೀಂಧ್ರ, ಕೀಟ ಅಥವಾ ಪೋಷಕಾಂಶಗಳ ಕೊರತೆಯನ್ನು ಗುರುತಿಸಿ ಜೈವಿಕ ಪರಿಹಾರ ನೀಡುತ್ತದೆ.'
        : isHi 
        ? 'बीमार पत्ती की फोटो खींचें। AI तुरंत फफूंद, कीट या पोषक तत्व कमी पहचानकर जैविक उपाय देगा।' 
        : 'Instant visual leaf diagnosis identifying fungal blights, rusts, and pests with ICAR-approved remedies.',
      topGradient: 'from-rose-500 to-red-600',
      accent: 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/25',
    },
    {
      icon: MessageSquare,
      href: '/chatbot',
      tag: isKn ? 'ಧ್ವನಿ ಮತ್ತು ಚಾಟ್ AI' : isHi ? 'आवाज व चैट' : 'Voice & Text AI',
      title: isKn ? 'AI ಕೃಷಿ ಸಹಾಯಕ' : isHi ? 'AI कृषि सहायक' : 'Multilingual Farm Advisor',
      desc: isKn
        ? 'ಕನ್ನಡದಲ್ಲಿ ಧ್ವನಿ ಅಥವಾ ಪಠ್ಯದ ಮೂಲಕ ಕೃಷಿಗೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಮುಕ್ತವಾಗಿ ಕೇಳಿ.'
        : isHi 
        ? 'हिंदी या अपनी क्षेत्रीय भाषा में बोलकर या लिखकर खेती का कोई भी सवाल पूछें।' 
        : 'Ask agronomic questions naturally by voice or text in Hindi and major regional Indian languages.',
      topGradient: 'from-teal-500 to-emerald-600',
      accent: 'text-teal-700 dark:text-teal-400 bg-teal-500/10 border-teal-500/25',
    },
    {
      icon: FlaskConical,
      href: '/soil-health',
      tag: isKn ? 'NPK ಮ್ಯಾಟ್ರಿಕ್ಸ್' : isHi ? 'NPK मैट्रिक्स' : 'NPK Matrix',
      title: isKn ? 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ' : isHi ? 'मृदा स्वास्थ्य विश्लेषण' : 'Soil Health Intelligence',
      desc: isKn
        ? 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಪ್ರಕಾರ ಯೂರಿಯಾ, ಡಿಎಪಿ ಮತ್ತು ಪೊಟ್ಯಾಷ್‌ನ ನಿಖರ ಪ್ರಮಾಣವನ್ನು ತಿಳಿಯಿರಿ.'
        : isHi 
        ? 'मृदा स्वास्थ्य कार्ड के अनुसार यूरिया, डीएपी और पोटाश की सटीक मात्रा जानें।' 
        : 'Balanced fertilizer calculator based on Soil Health Card metrics, cutting waste and optimizing yields.',
      topGradient: 'from-amber-500 to-emerald-600',
      accent: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
    },
    {
      icon: CloudSun,
      href: '/weather',
      tag: isKn ? 'ಸ್ಪ್ರೇ ರಾಡಾರ್' : isHi ? 'स्प्रे रडार' : 'Hyperlocal Radar',
      title: isKn ? 'ಹವಾಮಾನ ಮತ್ತು ಸ್ಪ್ರೇ ಸಲಹೆ' : isHi ? 'मौसम व स्प्रे एडवाइजरी' : 'Weather & Spray Radar',
      desc: isKn
        ? 'ಗಂಟೆ-ಗಂಟೆಯ ಮಳೆ ಸಾಧ್ಯತೆ ಮತ್ತು ಗಾಳಿಯ ವೇಗವನ್ನು ನೋಡಿ ಕೀಟನಾಶಕ ಸಿಂಪರಣೆಗೆ ಸರಿಯಾದ ಸಮಯವನ್ನು ಆರಿಸಿ.'
        : isHi 
        ? 'घंटे-दर-घंटे बारिश की संभावना और हवा की गति से कीटनाशक छिड़काव का सही समय चुनें।' 
        : 'Pinpoint hourly rain probabilities and wind speeds to determine safe pesticide and irrigation windows.',
      topGradient: 'from-sky-500 to-blue-600',
      accent: 'text-sky-700 dark:text-sky-400 bg-sky-500/10 border-sky-500/25',
    },
    {
      icon: ShoppingBag,
      href: '/mandi',
      tag: isKn ? '1,000+ ಮಂಡಿಗಳು' : isHi ? '1,000+ मंडियां' : 'eNAM Live',
      title: isKn ? 'ದೈನಂದಿನ ಮಂಡಿ ದರಗಳು ಮತ್ತು ಟ್ರೆಂಡ್' : isHi ? 'दैनिक मंडी भाव व ट्रेंड' : 'Live Mandi Rates & Trends',
      desc: isKn
        ? '120+ ಬೆಳೆಗಳ ಕನಿಷ್ಠ, ಗರಿಷ್ಠ ಮತ್ತು ಮಾದರಿ ದರಗಳು. 7 ದಿನಗಳ ಬೆಲೆ ಟ್ರೆಂಡ್‌ನೊಂದಿಗೆ ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ಮಾರಾಟ ಮಾಡಿ.'
        : isHi 
        ? '120+ फसलों के न्यूनतम, अधिकतम और मॉडल भाव। 7-दिवसीय मूल्य रुझान के साथ सही समय पर बेचें।' 
        : 'Daily APMC modal prices, arrival volumes, and 7-day trend indicators across government mandis.',
      topGradient: 'from-amber-500 to-orange-500',
      accent: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
    },
    {
      icon: Landmark,
      href: '/schemes',
      tag: isKn ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು' : isHi ? 'सरकारी लाभ' : 'Govt Subsidies',
      title: isKn ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿ' : isHi ? 'सरकारी योजनाएं व सब्सिडी' : 'Government Schemes Matcher',
      desc: isKn
        ? 'ಪಿಎಂ-ಕಿಸಾನ್, ಬೆಳೆ ವಿಮೆ, ಸೋಲಾರ್ ಪಂಪ್ ಮತ್ತು ಹನಿ ನೀರಾವರಿ ಸಬ್ಸಿಡಿಗಳ ಅರ್ಹತೆ ಹಾಗೂ ಅರ್ಜಿ ವಿಧಾನ ತಿಳಿಯಿರಿ.'
        : isHi 
        ? 'PM-किसान, फसल बीमा, सोलर पंप और ड्रिप सब्सिडी के लिए पात्रता और आवेदन प्रक्रिया जानें।' 
        : 'Discover central and state agricultural schemes with clear eligibility criteria and direct links.',
      topGradient: 'from-indigo-500 to-purple-600',
      accent: 'text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
    },
    {
      icon: ShoppingBag,
      href: '/marketplace',
      tag: isKn ? 'ನೇರ ಖರೀದಿ-ಮಾರಾಟ' : isHi ? 'सीधी खरीद-बिक्री' : 'Direct Trade',
      title: isKn ? 'ಕೃಷಿ ಮಾರುಕಟ್ಟೆ' : isHi ? 'किसान मार्केटप्लेस' : 'Agricultural Marketplace',
      desc: isKn
        ? 'ನಿಮ್ಮ ಬೆಳೆ, ಬೀಜ ಅಥವಾ ಬಾಡಿಗೆ ಉಪಕರಣಗಳನ್ನು ಇತರ ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರೊಂದಿಗೆ ನೇರವಾಗಿ ಹಂಚಿಕೊಳ್ಳಿ.'
        : isHi 
        ? 'अपनी फसल, बीज या किराए के उपकरण सीधे अन्य किसानों और खरीदारों के साथ साझा करें।' 
        : 'Connect directly with local buyers, FPOs, and fellow farmers to trade produce and lease machinery.',
      topGradient: 'from-emerald-600 to-teal-500',
      accent: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    },
    {
      icon: BookOpen,
      href: '/khet-diary',
      tag: isKn ? 'ಡಿಜಿಟಲ್ ಕೃಷಿ ಖಾತೆ' : isHi ? 'डिजिटल बहीखाता' : 'Farm Ledger',
      title: isKn ? 'ಖೇತ್ ಡೈರಿ ಮತ್ತು ವೆಚ್ಚ ದಾಖಲೆ' : isHi ? 'खेत डायरी व खर्च रिकॉर्ड' : 'Khet Diary & Field Logs',
      desc: isKn
        ? 'ಬೀಜ, ಗೊಬ್ಬರ, ಔಷಧಿ ಮತ್ತು ಕೂಲಿ ವೆಚ್ಚಗಳನ್ನು ದಾಖಲಿಸಿ. ಪ್ರತಿ ಸೀಸನ್‌ನ ಲಾಭ-ನಷ್ಟದ ನಿಖರ ಲೆಕ್ಕವಿಡಿ.'
        : isHi 
        ? 'बीज, खाद, दवाई और मजदूरी का खर्च लिखें। हर सीजन के मुनाफे का साफ हिसाब रखें।' 
        : 'Log daily farm activities, fertilizer applications, and operational expenses for clear seasonal profitability.',
      topGradient: 'from-green-600 to-emerald-700',
      accent: 'text-green-700 dark:text-green-400 bg-green-500/10 border-green-500/25',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-background relative border-b border-border/60">
      
      {/* Background glow */}
      <div className="absolute inset-x-0 top-1/4 h-[400px] bg-emerald-500/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isKn ? 'ಸಮಗ್ರ ಕೃಷಿ-ತಂತ್ರಜ್ಞಾನ ಪರಿಸರ ವ್ಯವಸ್ಥೆ' : isHi ? 'खेती के हर चरण के लिए टूल्स' : 'COMPLETE AGRI-TECH ECOSYSTEM'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15]">
            {isKn
              ? 'ಕೃಷಿಯ ಪ್ರತಿ ಹಂತಕ್ಕೂ ಸೂಕ್ತ ಪರಿಹಾರಗಳು.'
              : isHi
              ? 'खेती के हर चरण के लिए समर्पित समाधान।'
              : 'Tools for Every Stage of Farming.'}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {isKn
              ? 'ಬಿತ್ತನೆ ಪೂರ್ವ ಭೂಮಿ ಸಿದ್ಧತೆಯಿಂದ ಹಿಡಿದು ಮಂಡಿಯಲ್ಲಿ ಮಾರಾಟದವರೆಗೆ — ಭಾರತೀಯ ಕೃಷಿ ಪರಿಸ್ಥಿತಿಗಾಗಿ ನಿರ್ಮಿಸಲಾದ 9 ಪರಿಕರಗಳು.'
              : isHi 
              ? 'बुवाई से लेकर मंडी में बिक्री तक—KisaanBuddy के 9 कोर टूल्स आपको हर कदम पर वैज्ञानिक व व्यावहारिक सहायता प्रदान करते हैं।'
              : 'From pre-sowing soil preparation to harvest sales in the wholesale mandi, explore 9 purpose-built tools designed for Indian farming conditions.'}
          </p>
        </div>

        {/* 9-Tool Grid */}
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <Link
                key={idx}
                href={tool.href}
                className="group relative rounded-2xl border border-border/80 bg-card p-6 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Top Accent Gradient Bar */}
                <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${tool.topGradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

                <div>
                  {/* Icon & Category Tag Header */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border group-hover:scale-105 transition-transform duration-200 ${tool.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-muted border border-border/60 text-muted-foreground text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide">
                      {tool.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mb-2 text-lg font-display font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {tool.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                    {tool.desc}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-5 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>{isKn ? 'ಪರಿಕರ ತೆರೆಯಿರಿ' : isHi ? 'उपयोग करें' : 'Launch Tool'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
