'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShoppingBag, Store, Users, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function MarketplaceSection() {
  const { lang } = useLanguage();
  const isKn = lang === 'kn';
  const isHi = lang === 'hi';

  const sellerFeatures = [
    isKn 
      ? 'ದೃಢೀಕೃತ ಖರೀದಿದಾರರು, ಸ್ಥಳೀಯ ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು FPO ಗಳಿಗೆ ನೇರವಾಗಿ ನಿಮ್ಮ ಬೆಳೆಯ ವಿವರಗಳನ್ನು ತಲುಪಿಸಿ' 
      : isHi 
      ? 'सीधे खरीदार, व्यापारी और FPO तक अपनी फसल की जानकारी पहुंचाएं' 
      : 'Showcase your harvest directly to verified buyers, local traders, and FPOs',
    isKn 
      ? 'ಮಧ್ಯವರ್ತಿಗಳು ಮತ್ತು ಅನಗತ್ಯ ಕಮಿಷನ್ ಇಲ್ಲದೆ ಸೂಕ್ತ ಮಾರುಕಟ್ಟೆ ದರ ನಿಗದಿಪಡಿಸಿ' 
      : isHi 
      ? 'बिचौलियों और अनावश्यक कमीशन के बिना उचित दाम तय करें' 
      : 'Negotiate fair market rates without unexpected middleman commissions',
    isKn 
      ? 'ಬಳಸದ ಟ್ರ್ಯಾಕ್ಟರ್, ರೋಟಾವೇಟರ್ ಮತ್ತು ಸ್ಪ್ರೇಯರ್‌ಗಳನ್ನು ಬಾಡಿಗೆಗೆ ನೀಡುವ ಸೌಲಭ್ಯ' 
      : isHi 
      ? 'ट्रैक्टर, कंबाइन हार्वेस्टर व स्प्रेयर किराए पर देने की सुविधा' 
      : 'List unused tractors, rotavators, and sprayers for farm machinery rental',
  ];

  const buyerFeatures = [
    isKn 
      ? 'ರೈತರ ಜಮೀನಿನಿಂದಲೇ ನೇರವಾಗಿ ತಾಜಾ ಉತ್ಪನ್ನ ಮತ್ತು ಅಧಿಕೃತ ಗುಣಮಟ್ಟ' 
      : isHi 
      ? 'सीधे किसान के खेत से ताजी उपज और प्रामाणिक गुणवत्ता' 
      : 'Source fresh, graded produce directly from village farms at harvest',
    isKn 
      ? 'ಪ್ರಮಾಣ, ಬೆಳೆ ತಳಿ, ಕಟಾವು ದಿನಾಂಕ ಮತ್ತು ಜಿಲ್ಲೆಯ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ' 
      : isHi 
      ? 'मात्रा, फसल किस्म, कटाई की तारीख और स्थान का साफ विवरण' 
      : 'Filter by harvest date, quantity in quintals, crop variety, and district',
    isKn 
      ? 'ದೃಢೀಕೃತ ರೈತರ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಪಾರದರ್ಶಕ ನೇರ ಸಂಪರ್ಕ' 
      : isHi 
      ? 'सत्यापित किसान प्रोफाइल और पारदर्शी संपर्क' 
      : 'Contact verified farmers directly with transparent phone & WhatsApp links',
  ];

  return (
    <section id="marketplace" className="py-16 sm:py-24 bg-background relative border-b border-border/60 overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute right-0 bottom-0 w-[500px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isKn ? 'ರೈತರಿಂದ ಖರೀದಿದಾರರಿಗೆ ನೇರ ಸಂಪರ್ಕ' : isHi ? 'किसान से खरीदार सीधा संपर्क' : 'DIRECT AGRI TRADE'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15]">
            {isKn
              ? 'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಮಾರುಕಟ್ಟೆ ಅವಕಾಶಗಳಿಗೆ ನೇರವಾಗಿ ಜೋಡಿಸಿ.'
              : isHi
              ? 'अपनी फसल को सीधे बाजार के अवसरों से जोड़ें।'
              : 'Connect Your Harvest to Market Opportunities.'}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {isKn
              ? 'ಜಮೀನಿನಲ್ಲಿ ಬೆವರು ಸುರಿಸಿದ ನಂತರ ಬೆಳೆಗೆ ನ್ಯಾಯಯುತ ಬೆಲೆ ಪಡೆಯುವುದು ಪ್ರತಿ ರೈತನ ಹಕ್ಕು. KisaanBuddy ಮಾರುಕಟ್ಟೆಯು ನಿಮ್ಮನ್ನು ನೇರವಾಗಿ ಸಗಟು ಖರೀದಿದಾರರು ಮತ್ತು ಸ್ಥಳೀಯ ರೈತರೊಂದಿಗೆ ಜೋಡಿಸುತ್ತದೆ.'
              : isHi 
              ? 'खेत में पसीना बहाने के बाद उपज का सही मूल्य मिलना हर किसान का अधिकार है। KisaanBuddy मार्केटप्लेस आपको सीधे थोक खरीदारों और स्थानीय किसानों से जोड़ता है।'
              : 'Empowering farmers with open commercial access. List your harvested produce, discover bulk buyers, or lease agricultural machinery with zero hidden fees.'}
          </p>
        </div>

        {/* Dual Pathway Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-center mb-12">
          
          {/* Pathway 1: For Farmers (Sellers) */}
          <div className="lg:col-span-6 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    {isKn ? 'ರೈತರು ಮತ್ತು ಮಾರಾಟಗಾರರಿಗಾಗಿ' : isHi ? 'किसानों के लिए' : 'FOR FARMERS & SELLERS'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                    {isKn ? 'ಬೆಳೆ ಮಾರಾಟ ಮತ್ತು ಸಲಕರಣೆ ಬಾಡಿಗೆ' : isHi ? 'उपज व उपकरण लिस्ट करें' : 'Sell Produce & Rent Equipment'}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 font-normal">
                {isKn
                  ? 'ನಿಮ್ಮ ಕಟಾವು ಮಾಡಿದ ಬೆಳೆ ಅಥವಾ ಬಾಡಿಗೆಗೆ ಲಭ್ಯವಿರುವ ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ಸುಲಭವಾಗಿ ಪಟ್ಟಿ ಮಾಡಿ. ಖರೀದಿದಾರರು ನೇರವಾಗಿ ನಿಮ್ಮನ್ನು ಫೋನ್ ಮೂಲಕ ಸಂಪರ್ಕಿಸುತ್ತಾರೆ.'
                  : isHi 
                  ? 'अपनी कटी हुई फसल (गेहूं, धान, सब्जियां, फल) या किराए पर देने योग्य कृषि उपकरण आसानी से लिस्ट करें। खरीदार सीधे आपसे फोन पर संपर्क करेंगे।'
                  : 'List your harvested grains, vegetables, fruit lots, or rent out farm machinery. Receive inquiries directly from verified local buyers and aggregators.'}
              </p>

              <div className="space-y-3 pt-4 border-t border-border/50 mb-8">
                {sellerFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/85">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-all active:scale-[0.98]"
            >
              <span>{isKn ? 'ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಿ' : isHi ? 'मार्केटप्लेस में लिस्ट करें' : 'List on Marketplace'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Pathway 2: For Buyers & Aggregators */}
          <div className="lg:col-span-6 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    {isKn ? 'ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು FPO ಗಳಿಗಾಗಿ' : isHi ? 'खरीदारों व FPO के लिए' : 'FOR TRADERS & FPOs'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                    {isKn ? 'ಜಮೀನಿನಿಂದಲೇ ನೇರ ಸಗಟು ಖರೀದಿ' : isHi ? 'सीधे खेत से थोक खरीद' : 'Source Directly from Farms'}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 font-normal">
                {isKn
                  ? 'ಸ್ಥಳೀಯ ರೈತರು ನೇರವಾಗಿ ಪಟ್ಟಿ ಮಾಡಿರುವ ತಾಜಾ ಉತ್ಪನ್ನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ. ಪ್ರಮಾಣ, ತಳಿ ಮತ್ತು ಸ್ಥಳದ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ ಮೂಲದಿಂದಲೇ ನೇರವಾಗಿ ವ್ಯವಹರಿಸಿ.'
                  : isHi 
                  ? 'स्थानीय किसानों द्वारा सीधे सूचीबद्ध की गई ताजी उपज देखें। मात्रा, किस्म और स्थान के अनुसार फिल्टर करके स्रोत से सीधे डील करें।'
                  : 'Search farmer-listed lots across districts. Access detailed variety specifications, moisture estimations, and transparent harvest timelines.'}
              </p>

              <div className="space-y-3 pt-4 border-t border-border/50 mb-8">
                {buyerFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/85">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-bold text-sm shadow-xs transition-colors"
            >
              <span>{isKn ? 'ಲಭ್ಯವಿರುವ ಬೆಳೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : isHi ? 'उपलब्ध फसलें देखें' : 'Browse Available Produce'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

        {/* Real Authentic Photography Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-border shadow-lg">
          <img
            src="/images/marketplace/vegetable-mandi.jpg"
            alt="Farmers and traders weighing and trading freshly harvested vegetables at rural agricultural market"
            className="w-full h-56 sm:h-72 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent flex items-center p-6 sm:p-10">
            <div className="max-w-xl text-white">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>{isKn ? 'ಪಾರದರ್ಶಕ ಮತ್ತು ಸುರಕ್ಷಿತ' : isHi ? 'पारदर्शी व सुरक्षित' : 'Transparent & Verified'}</span>
              </span>
              <h4 className="text-xl sm:text-2xl font-bold font-display leading-tight mb-2">
                {isKn ? 'ನೈಜ ರೈತರನ್ನು ನೈಜ ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವುದು' : isHi ? 'सत्यापित किसान और वास्तविक उत्पादन' : 'Connecting Real Farmers with Real Buyers'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {isKn
                  ? 'ಯಾವುದೇ ನಕಲಿ ಬ್ರೋಕರ್‌ಗಳಿಲ್ಲ. ಪ್ರತಿಯೊಂದು ಪಟ್ಟಿಯು ದೃಢೀಕೃತ ರೈತ ಮತ್ತು ಅವರ ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್‌ನೊಂದಿಗೆ ಜೋಡಿಸಲ್ಪಟ್ಟಿರುತ್ತದೆ.'
                  : isHi 
                  ? 'कोई नकली ब्रोकर नहीं। हर लिस्टिंग वास्तविक किसान और उसके सत्यापित फार्म प्रोफाइल से जुड़ी होती है।'
                  : 'No phantom listings. Every batch is tied to verified grower profiles and local harvest seasons.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
