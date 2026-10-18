'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Bug, CloudSun, FlaskConical, TrendingUp, 
  CheckCircle2, Sparkles, AlertTriangle, Droplets, Shield
} from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function ProductShowcase() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const [activeTab, setActiveTab] = useState<'doctor' | 'soil' | 'weather' | 'mandi'>('doctor');

  const tabs = [
    {
      id: 'doctor' as const,
      label: isHi ? 'फसल डॉक्टर' : 'AI Crop Doctor',
      icon: Bug,
      badge: isHi ? 'रोग पहचान' : 'Vision Diagnostics',
      headline: isHi ? 'पत्ती की तस्वीर लें, तुरंत रोग और जैविक उपचार जानें' : 'Scan Leaf Symptoms. Receive Proven Organic & Chemical Remedies.',
      description: isHi 
        ? 'अपने फोन के कैमरे से प्रभावित पत्ती या फल की तस्वीर लें। हमारा कृषि मॉडल पत्ती धब्बा, रतुआ, झुलसा या कीट प्रकोप को तुरंत पहचानकर ICAR-प्रमाणित उपाय बताता है।'
        : 'Capture a photo of distressed foliage or fruit. Our computer vision model identifies fungal, bacterial, and pest damage within seconds and prescribes ICAR-aligned remedies.',
      image: '/images/crop-doctor/powdery-mildew-leaf.jpg',
      imageAlt: 'Agronomist closely inspecting distressed leaf symptoms for accurate diagnosis',
      href: '/disease',
      buttonText: isHi ? 'फसल डॉक्टर खोलें' : 'Launch Crop Doctor',
      points: [
        isHi ? 'पीला रतुआ, ब्लास्ट, शीथ ब्लाइट और माहू की पहचान' : 'Identifies Yellow Rust, Leaf Blast, Sheath Blight & Aphids',
        isHi ? 'रासायनिक के साथ-साथ नीम तेल व जैविक नियंत्रण विकल्प' : 'Provides biological alternatives (Neem oil, Trichoderma) alongside chemical dosages',
        isHi ? 'दवा छिड़काव की सही मात्रा और पानी का अनुपात' : 'Precise per-acre dosage instructions with dilution ratios'
      ]
    },
    {
      id: 'soil' as const,
      label: isHi ? 'मृदा स्वास्थ्य' : 'Soil Health & NPK',
      icon: FlaskConical,
      badge: isHi ? 'पोषण प्रबंधन' : 'Nutrient Matrix',
      headline: isHi ? 'अंधाधुंध खाद डालना बंद करें, वैज्ञानिक मात्रा अपनाएं' : 'Eliminate Guesswork in Fertilizer Application.',
      description: isHi 
        ? 'मिट्टी के pH और NPK स्तर के अनुसार खेत को आवश्यक खाद दें। यूरिया की बचत करें, फसल की लागत घटाएं और मिट्टी की प्राकृतिक उर्वरता बढ़ाएं।'
        : 'Tailor urea, DAP, and potash application to your Soil Health Card test values. Cut input costs while boosting soil organic carbon and crop yield.',
      image: '/images/soil/soil-ph-testing.jpg',
      imageAlt: 'Agricultural soil testing laboratory analyzing soil health card metrics',
      href: '/soil-health',
      buttonText: isHi ? 'मृदा स्वास्थ्य जांचें' : 'Analyze Soil Health',
      points: [
        isHi ? 'NPK अनुपात के आधार पर कस्टमाइज्ड बेसल व टॉप-ड्रेसिंग' : 'Customized basal and top-dressing plans for specific crop stages',
        isHi ? 'जिप्सम और चूना उपचार द्वारा अम्लीय व क्षारीय मिट्टी का सुधार' : 'pH correction advice using agricultural gypsum or agricultural lime',
        isHi ? 'सॉयल हेल्थ कार्ड अपलोड या मैन्युअल इनपुट दोनों समर्थित' : 'Supports Soil Health Card upload or quick manual field estimates'
      ]
    },
    {
      id: 'weather' as const,
      label: isHi ? 'खेत का मौसम' : 'Hyperlocal Weather',
      icon: CloudSun,
      badge: isHi ? 'स्प्रे रडार' : 'Precision Radar',
      headline: isHi ? 'मौसम के अनुसार सिंचाई और कीटनाशक छिड़काव की योजना बनाएं' : 'Know When to Irrigate, Spray, or Harvest.',
      description: isHi 
        ? 'बारिश से ठीक पहले छिड़काव करने से महंगी दवा धुल जाती है। KisaanBuddy आपको 7-दिवसीय रडार और उपयुक्त स्प्रे विंडो बताता है।'
        : 'Spraying pesticides right before sudden downpours wastes expensive inputs. Our hyperlocal hourly forecast advises the safest windows for spraying and harvesting.',
      image: '/images/weather/monsoon-farmland.jpg',
      imageAlt: 'Rain clouds gathering over Indian agricultural fields showing localized weather pattern',
      href: '/weather',
      buttonText: isHi ? 'मौसम पूर्वानुमान देखें' : 'Check Farm Weather',
      points: [
        isHi ? 'घंटे-दर-घंटे बारिश की संभावना और हवा की गति' : 'Hourly precipitation probability and wind speed for safe drift-free spraying',
        isHi ? 'लू (हीटवेव) और पाला (फ्रॉस्ट) के लिए पहले से चेतावनी' : 'Proactive alerts for heatwaves, sudden frost, and unseasonal rainfall',
        isHi ? 'खेत के पिन कोड के आधार पर 7 दिनों का पूर्वानुमान' : 'PIN-code based 7-day agricultural forecast synced with IMD radar'
      ]
    },
    {
      id: 'mandi' as const,
      label: isHi ? 'मंडी भाव व ट्रेंड' : 'Mandi Prices & Trends',
      icon: TrendingUp,
      badge: isHi ? 'eNAM लाइव रेट्स' : 'AGMARKNET Feeds',
      headline: isHi ? 'अपनी उपज बेचने से पहले 1,000+ मंडियों के ताज़ा भाव तुलना करें' : 'Sell When and Where You Get Maximum Value.',
      description: isHi 
        ? 'पास की मंडियों में आज का न्यूनतम, अधिकतम और मॉडल भाव देखें। आढ़तियों पर निर्भर रहने के बजाय वास्तविक मंडी भाव के साथ मोलभाव करें।'
        : 'Compare modal, minimum, and maximum rates across government APMC yards and eNAM platforms. Track 7-day arrivals and historical price shifts before transporting your crop.',
      image: '/images/mandi/grain-market-mandi.jpg',
      imageAlt: 'Farmers and traders gathered at an Indian APMC agricultural wholesale mandi yard',
      href: '/mandi',
      buttonText: isHi ? 'मंडी भाव देखें' : 'View Mandi Rates',
      points: [
        isHi ? 'गेहूं, धान, सरसों, कपास, आलू व 120+ फसलों के दैनिक भाव' : 'Daily rates for 120+ commodities across APMCs and eNAM centers',
        isHi ? 'आस-पास की मंडियों के बीच दूरी व मूल्य की सीधी तुलना' : 'Proximity-sorted comparisons between district mandis to calculate transport ROI',
        isHi ? 'पिछले 7 से 30 दिनों का मूल्य रुझान और आवक डेटा' : '7-day price direction indicators and mandi arrival volume tracking'
      ]
    }
  ];

  const current = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <section id="product-showcase" className="py-16 sm:py-24 bg-muted/20 dark:bg-card/30 border-b border-border/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isHi ? 'व्यावहारिक कृषि टूल्स' : 'FIELD-READY AGRICULTURAL SUITE'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15]">
            {isHi ? 'आपकी वास्तविक खेती की जरूरतों के लिए निर्मित।' : 'Built Around Your Real Farming Needs.'}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {isHi 
              ? 'हर टूल को भारतीय किसानों की जमीनी हकीकत को ध्यान में रखकर तैयार किया गया है—साफ भाषा, प्रामाणिक आंकड़े और सीधा फायदा।'
              : 'Each core capability is engineered for the ground realities of Indian agriculture—high offline tolerance, verified institutional sources, and clear actionable steps.'}
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 max-w-3xl mx-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/25'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border/80 hover:bg-muted/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-emerald-200' : 'text-muted-foreground'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Card Presentation */}
        <div className="rounded-3xl border border-border/90 bg-card overflow-hidden shadow-xl">
          <div className="grid lg:grid-cols-12 items-stretch">
            
            {/* Left Col: Explanations and verified points */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20 mb-4">
                  <span>{current.badge}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground leading-snug tracking-tight">
                  {current.headline}
                </h3>

                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {current.description}
                </p>

                {/* Key Bullet Points */}
                <div className="mt-8 space-y-3.5">
                  {current.points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
                        {pt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 mt-6 border-t border-border/60">
                <Link
                  href={current.href}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-all active:scale-[0.98]"
                >
                  <span>{current.buttonText}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Col: High Quality Authentic Photography Display */}
            <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-muted/40 border-t lg:border-t-0 lg:border-l border-border/70 overflow-hidden">
              <img
                src={current.image}
                alt={current.imageAlt}
                className="w-full h-full object-cover object-center absolute inset-0 transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                    {isHi ? 'वास्तविक कृषि संदर्भ' : 'REAL AGRICULTURAL CONTEXT'}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-100">
                    {current.imageAlt}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
