'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mic, Bug, Sprout, FlaskConical, BookOpen, Landmark,
  ArrowRight, Sparkles, TrendingUp, Store, Users, CloudSun,
  Tractor, Layers
} from 'lucide-react';
import { useLanguage } from '@/lib/language';

interface FeatureCard {
  key: string;
  icon: any;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  desc: Record<string, string>;
  category: Record<string, string>;
  categoryType: 'market' | 'labour' | 'ai' | 'farm';
  image: string;
  imageAlt: string;
  href: string;
  badge: Record<string, string>;
  badgeColor: string;
}

const ALL_FEATURES: FeatureCard[] = [
  {
    key: 'mandi',
    icon: TrendingUp,
    title: {
      en: 'Mandi Prices & Trends',
      hi: 'लाइव मंडी भाव व विश्लेषण',
      kn: 'ಲೈವ್ ಮಂಡಿ ಬೆಲೆಗಳು',
    },
    subtitle: {
      en: 'Real-time e-NAM & APMC data',
      hi: 'e-NAM और APMC की दैनिक दरें',
      kn: 'ನೈಜ ಸಮಯದ APMC ಮಂಡಿ ದರಗಳು',
    },
    desc: {
      en: 'Track daily modal prices, arrivals, and price trajectories across 2,400+ APMC mandis to negotiate the best rates.',
      hi: 'देश भर की 2,400+ मंडियों के दैनिक मॉडल भाव और आवक ट्रैक करें ताकि आप अपनी उपज का सही दाम पा सकें।',
      kn: '2,400+ ಎಪಿಎಂಸಿ ಮಂಡಿಗಳ ದೈನಂದಿನ ದರ ಮತ್ತು ಬೆಲೆ ಏರಿಳಿತಗಳನ್ನು ವೀಕ್ಷಿಸಿ.',
    },
    category: {
      en: 'Market Intelligence',
      hi: 'बाज़ार बुद्धिमत्ता',
      kn: 'ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ',
    },
    categoryType: 'market',
    image: '/images/mandi/grain-market-mandi.jpg',
    imageAlt: 'Authentic Indian wholesale grain market mandi with farmers and harvest heaps',
    href: '/mandi',
    badge: {
      en: 'Live APMC Data',
      hi: 'लाइव APMC डेटा',
      kn: 'ಲೈವ್ APMC ಡೇಟಾ',
    },
    badgeColor: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20',
  },
  {
    key: 'marketplace',
    icon: Store,
    title: {
      en: 'Direct Produce Marketplace',
      hi: 'फसल खरीद व बिक्री बाज़ार',
      kn: 'ನೇರ ಬೆಳೆ ಮಾರುಕಟ್ಟೆ',
    },
    subtitle: {
      en: 'Zero middleman commission',
      hi: 'बिचौलियों और कमीशन से पूरी मुक्ति',
      kn: 'ಶೂನ್ಯ ಮಧ್ಯವರ್ತಿ ಕಮಿಷನ್',
    },
    desc: {
      en: 'Sell wheat, paddy, pulses, fruits and vegetables directly to verified wholesale buyers, retailers, and FPOs.',
      hi: 'अपनी फसल को सत्यापित थोक खरीदारों, व्यापारियों और FPOs को बिना किसी बिचौलिए के सीधे बेचें।',
      kn: 'ಧಾನ್ಯ, ತರಕಾರಿ ಮತ್ತು ಹಣ್ಣುಗಳನ್ನು ನೇರವಾಗಿ ದೃಢೀಕೃತ ಖರೀದಿದಾರರಿಗೆ ಮಾರಾಟ ಮಾಡಿ.',
    },
    category: {
      en: 'Trade & Commerce',
      hi: 'व्यापार व मंडी',
      kn: 'ವ್ಯಾಪಾರ ಮತ್ತು ಮಾರಾಟ',
    },
    categoryType: 'market',
    image: '/images/marketplace/vegetable-mandi.jpg',
    imageAlt: 'Indian vegetable mandi vendor with fresh crates of farm harvest',
    href: '/marketplace',
    badge: {
      en: '0% Commission',
      hi: '0% कमीशन',
      kn: '0% ಕಮಿಷನ್',
    },
    badgeColor: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20',
  },
  {
    key: 'worker_connect',
    icon: Users,
    title: {
      en: 'Worker Connect & Labour Crews',
      hi: 'श्रमिक कनेक्ट व हार्वेस्टर दल',
      kn: 'ಕೃಷಿ ಕಾರ್ಮಿಕರ ಸಂಪರ್ಕ',
    },
    subtitle: {
      en: 'Skilled labour groups & machine operators',
      hi: 'रोपाई, कटाई और मशीन ऑपरेटर समूह',
      kn: 'ಕುಶಲ ಕೃಷಿ ಕಾರ್ಮಿಕರ ತಂಡಗಳು',
    },
    desc: {
      en: 'Hire verified farm labour collectives for paddy transplantation, sugarcane harvest, weeding, and combine operators.',
      hi: 'धान रोपाई, निराई, कटाई और कंबाइन हार्वेस्टर चलाने के लिए अनुभवी श्रमिक समूहों से सीधे संपर्क करें।',
      kn: 'ಭತ್ತ ನಾಟಿ, ಕಳೆ ಕೀಳುವುದು ಮತ್ತು ಕಟಾವಿಗೆ ಪರಿಣಿತ ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ನೇರವಾಗಿ ನೇಮಿಸಿಕೊಳ್ಳಿ.',
    },
    category: {
      en: 'Farm Labour',
      hi: 'कृषि श्रमिक',
      kn: 'ಕೃಷಿ ಕಾರ್ಮಿಕರು',
    },
    categoryType: 'labour',
    image: '/images/farmers/farmer-field-tending.jpg',
    imageAlt: 'Authentic Indian farmer working in the agricultural field managing crop inputs',
    href: '/worker-connect',
    badge: {
      en: 'Verified Crews',
      hi: 'सत्यापित दल',
      kn: 'ದೃಢೀಕೃತ ತಂಡಗಳು',
    },
    badgeColor: 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/20',
  },
  {
    key: 'equipment',
    icon: Tractor,
    title: {
      en: 'Machinery & Equipment Catalogue',
      hi: 'कृषि उपकरण व ट्रैक्टर कैटलॉग',
      kn: 'ಕೃಷಿ ಯಂತ್ರೋಪಕರಣಗಳ ಕ್ಯಾಟಲಾಗ್',
    },
    subtitle: {
      en: 'Tractors, rotavators & harvesters',
      hi: 'ट्रैक्टर, रोटावेटर और हार्वेस्टर मशीनें',
      kn: 'ಟ್ರಾಕ್ಟರ್, ರೋಟಾವೇಟರ್ ಮತ್ತು ಉಪಕರಣಗಳು',
    },
    desc: {
      en: 'Explore specifications and local rental options for high-performance tractors, drone sprayers, laser levellers, and seed drills.',
      hi: 'ट्रैक्टर, ड्रोन स्प्रेयर, रोटावेटर और लेजर लेवलर के प्रामाणिक विनिर्देश और स्थानीय किराए के विकल्प देखें।',
      kn: 'ಟ್ರಾಕ್ಟರ್, ಡ್ರೋನ್ ಸ್ಪ್ರೇಯರ್ ಮತ್ತು ಆಧುನಿಕ ಕೃಷಿ ಯಂತ್ರಗಳ ವಿವರಗಳು ಮತ್ತು ಬಾಡಿಗೆ ಆಯ್ಕೆಗಳು.',
    },
    category: {
      en: 'Mechanization',
      hi: 'कृषि यंत्रीकरण',
      kn: 'ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ',
    },
    categoryType: 'farm',
    image: '/images/marketplace/tractors/swaraj-744.png',
    imageAlt: 'Swaraj 744 agricultural tractor used in Indian farming operations',
    href: '/marketplace?tab=equipment',
    badge: {
      en: 'Mechanization',
      hi: 'यंत्रीकरण',
      kn: 'ಯಾಂತ್ರೀಕರಣ',
    },
    badgeColor: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/20',
  },
  {
    key: 'disease',
    icon: Bug,
    title: {
      en: 'Crop Doctor & Leaf Disease Scan',
      hi: 'फसल डॉक्टर - पत्ती रोग पहचान',
      kn: 'ಬೆಳೆ ವೈದ್ಯ - ರೋಗ ತಪಾಸಣೆ',
    },
    subtitle: {
      en: 'Instant AI computer vision diagnosis',
      hi: 'फोटो खींचकर तुरंत बीमारी पहचानें',
      kn: 'ಫೋಟೋ ಮೂಲಕ ತಕ್ಷಣದ ರೋಗ ಪತ್ತೆ',
    },
    desc: {
      en: 'Upload crop leaf photos for instant diagnosis of 80+ crop diseases and certified organic/chemical treatments.',
      hi: 'प्रभावित पत्ती की फोटो अपलोड करके 80+ फसल रोगों की तुरंत पहचान और प्रमाणित जैविक व रासायनिक उपचार पाएं।',
      kn: 'ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ 80+ ಬೆಳೆ ರೋಗಗಳನ್ನು ಮತ್ತು ನಿಖರ ಪರಿಹಾರ ಕ್ರಮಗಳನ್ನು ತಕ್ಷಣವೇ ತಿಳಿಯಿರಿ.',
    },
    category: {
      en: 'AI Diagnostics',
      hi: 'AI रोग निदान',
      kn: 'AI ರೋಗ ಪತ್ತೆ',
    },
    categoryType: 'ai',
    image: '/images/crop-doctor/powdery-mildew-leaf.jpg',
    imageAlt: 'Close-up of infected crop leaf diagnosed with powdery mildew fungal disease',
    href: '/disease',
    badge: {
      en: 'Vision AI',
      hi: 'विज़न AI',
      kn: 'ವಿಷನ್ AI',
    },
    badgeColor: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20',
  },
  {
    key: 'chatbot',
    icon: Mic,
    title: {
      en: 'AI Voice & Multilingual Assistant',
      hi: 'AI आवाज व बहुभाषी खेती सहायक',
      kn: 'AI ಧ್ವನಿ ಕೃಷಿ ಸಹಾಯಕ',
    },
    subtitle: {
      en: 'Speak in Hindi, Kannada, Telugu & more',
      hi: 'हिंदी, कन्नड़, तेलुगु में बोलकर पूछें',
      kn: 'ಕನ್ನಡ, ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ',
    },
    desc: {
      en: 'Voice-first agricultural advisor providing instant agronomic answers tailored to your crop, soil, and microclimate.',
      hi: 'अपनी भाषा में बोलकर अपनी फसल, कीट नियंत्रण, खाद की सही मात्रा और सिंचाई के बारे में तुरंत सलाह लें।',
      kn: 'ನಿಮ್ಮ ಮಾತಿನಲ್ಲೇ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳಿಗೆ ತಜ್ಞ ಕೃಷಿ ಸಲಹೆಗಾರರಿಂದ ತಕ್ಷಣದ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ.',
    },
    category: {
      en: 'Conversational AI',
      hi: 'वॉयस AI सहायक',
      kn: 'ಧ್ವನಿ AI',
    },
    categoryType: 'ai',
    image: '/images/hero/hero-indian-farmer.jpg',
    imageAlt: 'Authentic Indian farmer in agricultural field using smartphone voice advisory',
    href: '/chatbot',
    badge: {
      en: 'Voice AI 10+ Langs',
      hi: '10+ भारतीय भाषाएं',
      kn: '10+ ಭಾಷೆಗಳು',
    },
    badgeColor: 'bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/20',
  },
  {
    key: 'crop_advisory',
    icon: Sprout,
    title: {
      en: 'Scientific Crop Advisory',
      hi: 'वैज्ञानिक फसल सलाह व योजना',
      kn: 'ವೈಜ್ಞಾನಿಕ ಬೆಳೆ ಸಲಹೆ',
    },
    subtitle: {
      en: 'Soil, rainfall & climate matched crops',
      hi: 'मिट्टी और जलवायु के अनुकूल फसल चयन',
      kn: 'ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನಕ್ಕೆ ಸೂಕ್ತ ಬೆಳೆಗಳು',
    },
    desc: {
      en: 'Select high-yielding crop varieties based on soil nutrients, rainfall forecasts, and historical regional market demand.',
      hi: 'अपनी मिट्टी के पोषक तत्वों, बारिश के पूर्वानुमान और बाज़ार मांग के आधार पर सबसे उपयुक्त और लाभदायक फसल चुनें।',
      kn: 'ಮಣ್ಣಿನ ಪೋಷಕಾಂಶ ಮತ್ತು ಮಳೆ ಮುನ್ಸೂಚನೆ ಆಧರಿಸಿ ಅತ್ಯುತ್ತಮ ಇಳುವರಿ ನೀಡುವ ಬೆಳೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    },
    category: {
      en: 'Agronomy AI',
      hi: 'फसल विज्ञान',
      kn: 'ಕೃಷಿ ವಿಜ್ಞಾನ',
    },
    categoryType: 'ai',
    image: '/images/crops/indian-paddy-field.jpg',
    imageAlt: 'Lush green agricultural paddy crop field in rural India',
    href: '/crop-predictor',
    badge: {
      en: 'Decision Support',
      hi: 'वैज्ञानिक योजना',
      kn: 'ನಿರ್ಧಾರ ಬೆಂಬಲ',
    },
    badgeColor: 'bg-green-500/10 text-green-800 dark:text-green-300 border-green-500/20',
  },
  {
    key: 'soil_health',
    icon: FlaskConical,
    title: {
      en: 'Soil Health & Fertilizer Calculator',
      hi: 'मिट्टी स्वास्थ्य व उर्वरक कैलकुलेटर',
      kn: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಮತ್ತು ರಸಗೊಬ್ಬರ ಲೆಕ್ಕಾಚಾರ',
    },
    subtitle: {
      en: 'Accurate Urea, DAP & Potash dosage',
      hi: 'यूरिया, डीएपी और पोटाश की सटीक मात्रा',
      kn: 'ಯೂರಿಯಾ, ಡಿಎಪಿ ಮತ್ತು ಪೊಟ್ಯಾಶ್ ನಿಖರ ಪ್ರಮಾಣ',
    },
    desc: {
      en: 'Translate Soil Health Card NPK parameters into precise chemical and organic nutrient dosages per acre to prevent fertilizer waste.',
      hi: 'सोइल हेल्थ कार्ड के NPK आंकड़ों से प्रति एकड़ यूरिया, DAP और पोटाश की सटीक मात्रा निकालें और अनावश्यक खर्च बचाएं।',
      kn: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಆಧಾರದ ಮೇಲೆ ಪ್ರತಿ ಎಕರೆಗೆ ಬೇಕಾದ ನಿಖರ ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣವನ್ನು ಲೆಕ್ಕ ಹಾಕಿ.',
    },
    category: {
      en: 'Soil Science',
      hi: 'मृदा विज्ञान',
      kn: 'ಮಣ್ಣು ವಿಜ್ಞಾನ',
    },
    categoryType: 'farm',
    image: '/images/soil/soil-ph-testing.jpg',
    imageAlt: 'Scientific field soil pH and nutrient test with genuine color comparison chart',
    href: '/soil-health',
    badge: {
      en: 'NPK Dosage Matrix',
      hi: 'उर्वरक मात्रा मैट्रिक्स',
      kn: 'ರಸಗೊಬ್ಬರ ಮ್ಯಾಟ್ರಿಕ್ಸ್',
    },
    badgeColor: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20',
  },
  {
    key: 'weather',
    icon: CloudSun,
    title: {
      en: 'Agro-Weather & Spray Radar',
      hi: 'मौसम रडार व छिड़काव परामर्श',
      kn: 'ಕೃಷಿ ಹವಾಮಾನ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಲಹೆ',
    },
    subtitle: {
      en: 'Hyperlocal rainfall & temperature alerts',
      hi: 'स्थानीय बारिश, पाला व तेज धूप की चेतावनी',
      kn: 'ನಿಖರ ಮಳೆ ಮತ್ತು ತಾಪಮಾನ ಮುನ್ಸೂಚನೆ',
    },
    desc: {
      en: 'Hyperlocal hourly forecasts paired with agricultural operational advice: ideal spray windows, rain alerts, and heat stress mitigation.',
      hi: 'दैनिक व साप्ताहिक मौसम पूर्वानुमान के साथ कीटनाशक छिड़काव की सही खिड़की और बारिश से फसल सुरक्षा के निर्देश।',
      kn: 'ಕೃಷಿ ಕಾರ್ಯಾಚರಣೆಗಳಿಗೆ ತಕ್ಕಂತೆ ಸಿಂಪಡಣೆ ಸಮಯ, ಮಳೆ ಎಚ್ಚರಿಕೆ ಮತ್ತು ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ತಿಳಿಯಿರಿ.',
    },
    category: {
      en: 'Agro-Climate',
      hi: 'कृषि मौसम',
      kn: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
    },
    categoryType: 'farm',
    image: '/images/weather/monsoon-farmland.jpg',
    imageAlt: 'Monsoon clouds rolling over lush green agricultural farmland in rural India',
    href: '/weather',
    badge: {
      en: 'Operational Radar',
      hi: 'छिड़काव अलर्ट',
      kn: 'ಹವಾಮಾನ ರೇಡಾರ್',
    },
    badgeColor: 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20',
  },
  {
    key: 'khet_diary',
    icon: BookOpen,
    title: {
      en: 'Khet Diary (Farm Ledger)',
      hi: 'डिजिटल खेत डायरी व बहीखाता',
      kn: 'ಕೃಷಿ ಡೈರಿ ಮತ್ತು ಲೆಕ್ಕಪತ್ರ',
    },
    subtitle: {
      en: 'Input cost & harvest revenue tracker',
      hi: 'लागत, मजदूरी और शुद्ध मुनाफे का हिसाब',
      kn: 'ವೆಚ್ಚ ಮತ್ತು ಆದಾಯದ ನಿಖರ ಲೆಕ್ಕ',
    },
    desc: {
      en: 'Track seed, fertilizer, irrigation and labour expenses per plot to calculate net season profitability and harvest records.',
      hi: 'बीज, खाद, पानी और जुताई-मजदूरी के खर्च को दर्ज करें और सीजन के अंत में अपनी शुद्ध कमाई का सही हिसाब लगाएं।',
      kn: 'ಪ್ರತಿ ಜಮೀನಿನ ಬಿತ್ತನೆ, ಗೊಬ್ಬರ, ಕೂಲಿ ವೆಚ್ಚ ಮತ್ತು ಆದಾಯವನ್ನು ಸುಲಭವಾಗಿ ದಾಖಲಿಸಿ.',
    },
    category: {
      en: 'Farm Accounting',
      hi: 'खेत हिसाब-किताब',
      kn: 'ಕೃಷಿ ಲೆಕ್ಕಪತ್ರ',
    },
    categoryType: 'farm',
    image: '/images/crops/punjab-wheat-field.jpg',
    imageAlt: 'Healthy wheat crop field in Phagwara Punjab ready for harvest accounting',
    href: '/khet-diary',
    badge: {
      en: 'Profit Ledger',
      hi: 'मुनाफा बहीखाता',
      kn: 'ಆದಾಯ ಲೆಡ್ಜರ್',
    },
    badgeColor: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20',
  },
  {
    key: 'schemes',
    icon: Landmark,
    title: {
      en: 'Government Schemes & Subsidies',
      hi: 'सरकारी योजनाएं व सब्सिडी',
      kn: 'ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳು',
    },
    subtitle: {
      en: 'PM-KISAN, PMFBY & mechanization DBT',
      hi: 'पीएम किसान, फसल बीमा और सरकारी सब्सिडी',
      kn: 'ಪಿಎಂ-ಕಿಸಾನ್, ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಸಬ್ಸಿಡಿ',
    },
    desc: {
      en: 'Explore verified central and state agriculture programs, solar pump subsidies, micro-irrigation grants, and claim procedures.',
      hi: 'केंद्र और राज्य सरकार की सभी प्रमुख कृषि योजनाओं, सोलर पंप सब्सिडी और ड्रिप सिंचाई अनुदान की प्रामाणिक जानकारी।',
      kn: 'ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಸರ್ಕಾರಗಳ ಅಧಿಕೃತ ಯೋಜನೆಗಳು, ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಸಬ್ಸಿಡಿ ಮಾಹಿತಿಗಳನ್ನು ಪಡೆಯಿರಿ.',
    },
    category: {
      en: 'Government Support',
      hi: 'सरकारी सहायता',
      kn: 'ಸರ್ಕಾರಿ ನೆರವು',
    },
    categoryType: 'market',
    image: '/images/hero/hero-indian-farmer.jpg',
    imageAlt: 'Indian farmer accessing official government agricultural schemes and DBT subsidies',
    href: '/schemes',
    badge: {
      en: 'Direct Benefit Transfer',
      hi: 'DBT प्रत्यक्ष लाभ',
      kn: 'ನೇರ ಸೌಲಭ್ಯ ವರ್ಗಾವಣೆ',
    },
    badgeColor: 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/20',
  },
  {
    key: 'specialty',
    icon: Sparkles,
    title: {
      en: 'Specialized Farming Guides',
      hi: 'विशिष्ट फसल व मशरूम उत्पादन',
      kn: 'ವಿಶೇಷ ಬೆಳೆ ಮತ್ತು ಅಣಬೆ ಕೃಷಿ',
    },
    subtitle: {
      en: 'High-value horticulture & mushrooms',
      hi: 'मशरूम और अधिक मुनाफे वाली बागवानी',
      kn: 'ಹೆಚ್ಚು ಆದಾಯ ತರುವ ಕೃಷಿ ವಿಧಾನಗಳು',
    },
    desc: {
      en: 'Step-by-step guides for commercial oyster mushroom cultivation, organic vermicomposting, and high-margin protected crops.',
      hi: 'ऑयस्टर मशरूम उत्पादन, केंचुआ खाद और संरक्षित बागवानी की व्यावहारिक तकनीकों से अतिरिक्त आमदनी बनाएं।',
      kn: 'ವಾಣಿಜ್ಯ ಅಣಬೆ ಕೃಷಿ, ಎರೆಹುಳು ಗೊಬ್ಬರ ಮತ್ತು ಲಾಭದಾಯಕ ತೋಟಗಾರಿಕೆ ವಿಧಾನಗಳನ್ನು ಕಲಿಯಿರಿ.',
    },
    category: {
      en: 'Diversification',
      hi: 'अतिरिक्त आय',
      kn: 'ಹೆಚ್ಚುವರಿ ಆದಾಯ',
    },
    categoryType: 'farm',
    image: '/images/mushrooms/mushroom-cultivation.jpg',
    imageAlt: 'Indoor substrate bag cultivation of oyster mushrooms in Indian climate conditions',
    href: '/features',
    badge: {
      en: 'High-Margin Agro',
      hi: 'उच्च मुनाफा',
      kn: 'ಹೆಚ್ಚಿನ ಆದಾಯ',
    },
    badgeColor: 'bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/20',
  },
];

export function FarmingIntelligenceSection() {
  const { lang } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | 'market' | 'labour' | 'ai' | 'farm'>('all');

  const filteredFeatures = activeFilter === 'all'
    ? ALL_FEATURES
    : ALL_FEATURES.filter((f) => f.categoryType === activeFilter);

  const getLabel = (record: Record<string, string>) => record[lang as string] || record['en'] || '';

  const filterLabels: Record<'all' | 'market' | 'labour' | 'ai' | 'farm', Record<string, string>> = {
    all: { en: 'All Features', hi: 'सभी सुविधाएं', kn: 'ಎಲ್ಲಾ ಸೌಲಭ್ಯಗಳು' },
    market: { en: 'Mandi & Marketplace', hi: 'मंडी व बाज़ार', kn: 'ಮಂಡಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ' },
    labour: { en: 'Workers & Labour', hi: 'श्रमिक व कार्यबल', kn: 'ಕಾರ್ಮಿಕರು' },
    ai: { en: 'AI & Diagnostics', hi: 'AI व रोग निदान', kn: 'AI ಮತ್ತು ರೋಗ ಪತ್ತೆ' },
    farm: { en: 'Field & Equipment', hi: 'उपकरण व खेत कार्य', kn: 'ಉಪಕರಣ ಮತ್ತು ಜಮೀನು' },
  };

  const headerText: Record<string, Record<string, string>> = {
    badge: {
      en: 'KISAANBUDDY COMPLETE PLATFORM',
      hi: 'किसान बडी की संपूर्ण सुविधाएं',
      kn: 'ಕಿಸಾನ್ ಬಡ್ಡಿಯ ಸಮಗ್ರ ಸೌಲಭ್ಯಗಳು',
    },
    title: {
      en: 'Every Essential Feature for Indian Farming',
      hi: 'भारतीय किसानों के लिए हर जरूरी सुविधा — वास्तविक कृषि पर आधारित',
      kn: 'ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ಪ್ರತಿಯೊಂದು ಅಗತ್ಯ ಸೌಲಭ್ಯ',
    },
    subtitle: {
      en: 'Real-time market rates, verified farm labour, equipment access, and AI agronomy — built with authentic field photography.',
      hi: 'मंडी भाव, खरीद-बिक्री, श्रमिक दल, आधुनिक उपकरण और AI फसल विज्ञान — हर फीचर असली भारतीय खेतों की तस्वीरों के साथ।',
      kn: 'ಮಂಡಿ ದರ, ಕಾರ್ಮಿಕರ ಸಂಪರ್ಕ, ಆಧುನಿಕ ಯಂತ್ರೋಪಕರಣ ಮತ್ತು AI ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ಒಂದೇ ವೇದಿಕೆಯಲ್ಲಿ ಪಡೆಯಿರಿ.',
    },
    launch: {
      en: 'Explore Feature',
      hi: 'सुविधा देखें',
      kn: 'ಸೌಲಭ್ಯ ನೋಡಿ',
    },
  };

  return (
    <section
      id="features"
      className="w-full py-12 sm:py-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 scroll-mt-16"
    >
      {/* Anchor for backward compatibility with #farming-intelligence */}
      <span id="farming-intelligence" className="block -mt-16 pt-16 invisible" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{getLabel(headerText.badge)}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              {getLabel(headerText.title)}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
              {getLabel(headerText.subtitle)}
            </p>
          </div>

          <Link
            href="/features"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 transition shadow-2xs hover:shadow-xs self-start md:self-auto shrink-0"
          >
            <span>{lang === 'hi' ? 'सभी 12 सुविधाएं देखें' : lang === 'kn' ? 'ಎಲ್ಲಾ 12 ಸೌಲಭ್ಯಗಳು' : 'View Full Feature Suite'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {(['all', 'market', 'labour', 'ai', 'farm'] as const).map((filterKey) => (
            <button
              key={filterKey}
              type="button"
              onClick={() => setActiveFilter(filterKey)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                activeFilter === filterKey
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {getLabel(filterLabels[filterKey])}
            </button>
          ))}
        </div>

        {/* Real-World Photo Grid with Priority Focus */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.key}
                href={tool.href}
                className="group rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-emerald-500/60 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Real-World Photo Container (Top Priority Visual) */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img
                      src={tool.image}
                      alt={tool.imageAlt}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Category Overlay Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-stone-900/85 text-white backdrop-blur shadow-xs border border-white/10">
                        {getLabel(tool.category)}
                      </span>
                    </div>

                    {/* Operational Badge */}
                    <div className="absolute bottom-2.5 left-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur bg-white/90 dark:bg-stone-900/90 shadow-2xs border ${tool.badgeColor}`}>
                        {getLabel(tool.badge)}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                          {getLabel(tool.title)}
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-700/80 dark:text-emerald-400/80">
                          {getLabel(tool.subtitle)}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                      {getLabel(tool.desc)}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 py-3 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/60 dark:bg-stone-850 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300">
                  <span>{getLabel(headerText.launch)}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
