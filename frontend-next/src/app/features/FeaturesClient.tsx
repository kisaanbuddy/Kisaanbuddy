"use client";
import { MobileServicesPage } from "@/components/mobile/MobileHomeScreen";

import Link from "next/link";
import {
  Sparkles,
  Layers,
  Bug,
  CloudSun,
  FlaskConical,
  TrendingUp,
  Store,
  Landmark,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Languages,
  Cpu,
  Users,
  Tractor,
  Sprout,
  Mic,
} from "lucide-react";
import { useLanguage } from "@/lib/language";
import { FEATURES_PAGE_I18N } from "@/lib/features-i18n";

export function FeaturesClient() {
  const { lang } = useLanguage();
  const curI18n = FEATURES_PAGE_I18N[lang] || FEATURES_PAGE_I18N.en;

  const features = [
    {
      icon: TrendingUp,
      title: curI18n.feature6Title,
      category: curI18n.feature6Cat,
      image: "/images/mandi/grain-market-mandi.jpg",
      imageAlt: "Wholesale grain market with bags of harvested crops",
      description: curI18n.feature6Desc,
      href: "/mandi",
      cta: curI18n.feature6Cta,
      accent: "text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300",
    },
    {
      icon: Store,
      title: curI18n.feature7Title,
      category: curI18n.feature7Cat,
      image: "/images/marketplace/vegetable-mandi.jpg",
      imageAlt: "Vegetable mandi vendor with fresh crates of farm produce",
      description: curI18n.feature7Desc,
      href: "/marketplace",
      cta: curI18n.feature7Cta,
      accent: "text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300",
    },
    {
      icon: Users,
      title: lang === 'hi' ? 'AgriLabour (कृषि मजदूर)' : lang === 'kn' ? 'AgriLabour' : 'AgriLabour - Farm Labour & Crews',
      category: lang === 'hi' ? 'कार्यबल' : lang === 'kn' ? 'ಕಾರ್ಮಿಕರು' : 'Labour & Crews',
      image: "/images/farmers/farmer-field-tending.jpg",
      imageAlt: "Indian farm workers tending crops in agricultural field",
      description: lang === 'hi'
        ? 'धान रोपाई, निराई, कटाई और कंबाइन हार्वेस्टर ऑपरेटरों के सत्यापित समूहों से बिना किसी कमीशन के सीधे संपर्क करें।'
        : 'Hire verified farm labour collectives for paddy transplantation, sugarcane harvest, weeding, and combine harvester operators.',
      href: "/worker-connect",
      cta: lang === 'hi' ? 'श्रमिक खोजें' : 'Hire Workers',
      accent: "text-teal-700 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-300",
    },
    {
      icon: Tractor,
      title: lang === 'hi' ? 'कृषि उपकरण व मशीनरी' : lang === 'kn' ? 'ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ' : 'Farm Equipment & Machinery',
      category: lang === 'hi' ? 'यंत्रीकरण' : lang === 'kn' ? 'ಯಾಂತ್ರೀಕರಣ' : 'Mechanization',
      image: "/images/marketplace/tractors/swaraj-744.png",
      imageAlt: "High-horsepower tractor and agricultural equipment",
      description: lang === 'hi'
        ? 'ट्रैक्टर, रोटावेटर, लेजर लेवलर और ड्रोन स्प्रेयर के प्रामाणिक तकनीकी विनिर्देश और स्थानीय किराए के विकल्प।'
        : 'Explore verified specifications and local rental options for high-horsepower tractors, rotavators, laser levellers, and boom sprayers.',
      href: "/marketplace?tab=equipment",
      cta: lang === 'hi' ? 'उपकरण देखें' : 'Explore Machinery',
      accent: "text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300",
    },
    {
      icon: Bug,
      title: curI18n.feature3Title,
      category: curI18n.feature3Cat,
      image: "/images/crop-doctor/powdery-mildew-leaf.jpg",
      imageAlt: "Close-up of crop leaf diagnosed with fungal mildew",
      description: curI18n.feature3Desc,
      href: "/disease",
      cta: curI18n.feature3Cta,
      accent: "text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300",
    },
    {
      icon: Mic,
      title: curI18n.feature1Title,
      category: curI18n.feature1Cat,
      image: "/images/hero/hero-indian-farmer.jpg",
      imageAlt: "Authentic Indian farmer using mobile voice assistant",
      description: curI18n.feature1Desc,
      href: "/chatbot",
      cta: curI18n.feature1Cta,
      accent: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
    {
      icon: Sprout,
      title: lang === 'hi' ? 'वैज्ञानिक फसल चयन सलाह' : lang === 'kn' ? 'ವೈಜ್ಞಾನಿಕ ಬೆಳೆ ಸಲಹೆ' : 'Scientific Crop Advisory',
      category: lang === 'hi' ? 'फसल योजना' : lang === 'kn' ? 'ಬೆಳೆ ಯೋಜನೆ' : 'Agronomy AI',
      image: "/images/crops/indian-paddy-field.jpg",
      imageAlt: "Lush green agricultural crop field in rural India",
      description: lang === 'hi'
        ? 'मिट्टी के पोषक तत्वों, वर्षा पूर्वानुमान और बाज़ार मांग के आधार पर अपनी जमीन के लिए सबसे उपयुक्त और लाभदायक फसल चुनें।'
        : 'Select optimal, high-yielding crop varieties based on soil nutrients, rainfall forecasts, and historical regional market demand.',
      href: "/crop-predictor",
      cta: lang === 'hi' ? 'फसल सलाह लें' : 'Get Crop Advice',
      accent: "text-green-700 bg-green-50 dark:bg-green-950/60 dark:text-green-300",
    },
    {
      icon: FlaskConical,
      title: curI18n.feature5Title,
      category: curI18n.feature5Cat,
      image: "/images/soil/soil-ph-testing.jpg",
      imageAlt: "Scientific field soil pH and nutrient test with color chart",
      description: curI18n.feature5Desc,
      href: "/soil-health",
      cta: curI18n.feature5Cta,
      accent: "text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300",
    },
    {
      icon: BookOpen,
      title: curI18n.feature9Title,
      category: curI18n.feature9Cat,
      image: "/images/crops/punjab-wheat-field.jpg",
      imageAlt: "Healthy wheat crop field in Phagwara Punjab",
      description: curI18n.feature9Desc,
      href: "/khet-diary",
      cta: curI18n.feature9Cta,
      accent: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
    {
      icon: Landmark,
      title: curI18n.feature8Title,
      category: curI18n.feature8Cat,
      image: "/images/hero/hero-indian-farmer.jpg",
      imageAlt: "Indian farmer in field accessing agricultural subsidies",
      description: curI18n.feature8Desc,
      href: "/schemes",
      cta: curI18n.feature8Cta,
      accent: "text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300",
    },
    {
      icon: Sparkles,
      title: lang === 'hi' ? 'विशिष्ट फसल व मशरूम उत्पादन' : lang === 'kn' ? 'ವಿಶೇಷ ಬೆಳೆ ಮತ್ತು ಅಣಬೆ ಕೃಷಿ' : 'Specialized & High-Margin Farming',
      category: lang === 'hi' ? 'अतिरिक्त आय' : lang === 'kn' ? 'ಹೆಚ್ಚುವರಿ ಆದಾಯ' : 'Diversification',
      image: "/images/mushrooms/mushroom-cultivation.jpg",
      imageAlt: "Indoor substrate bag cultivation of oyster mushrooms in Indian climate conditions",
      description: lang === 'hi'
        ? 'व्यावसायिक ऑयस्टर मशरूम उत्पादन और संरक्षित बागवानी के चरणबद्ध मार्गदर्शन से अपने खेत की आय बढ़ाएं।'
        : 'Step-by-step guides for commercial oyster mushroom cultivation, vermicomposting, and high-margin protected horticulture.',
      href: "/crops",
      cta: lang === 'hi' ? 'गाइड देखें' : 'View Crop Guide',
      accent: "text-teal-700 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-300",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: curI18n.step1Title,
      description: curI18n.step1Desc,
    },
    {
      step: "02",
      title: curI18n.step2Title,
      description: curI18n.step2Desc,
    },
    {
      step: "03",
      title: curI18n.step3Title,
      description: curI18n.step3Desc,
    },
    {
      step: "04",
      title: curI18n.step4Title,
      description: curI18n.step4Desc,
    },
  ];

  return (
    <>
    <MobileServicesPage />
    <div className="hidden md:block space-y-16 pb-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto pt-4 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {curI18n.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {curI18n.heroTitle}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          {curI18n.heroDesc}
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-500/50 transition duration-200"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur shadow-xs border border-white/20">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${item.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}
