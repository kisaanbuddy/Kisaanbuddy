'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Bug,
  Users,
  Landmark,
  CloudSun,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Mic,
  Calendar,
  IndianRupee,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useLanguage, type Lang } from '@/lib/language';
import { StaggerList, StaggerItem } from '@/components/motion/MotionComponents';

interface SectionI18n {
  eyebrow: string;
  heading: string;
  subtitle: string;
  mandi: {
    badge: string;
    title: string;
    desc: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    bullet4: string;
    cta: string;
  };
  cropDoctor: {
    badge: string;
    title: string;
    desc: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    bullet4: string;
    cta: string;
  };
  workers: {
    badge: string;
    title: string;
    desc: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    bullet4: string;
    cta: string;
  };
  schemes: {
    badge: string;
    title: string;
    desc: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    bullet4: string;
    cta: string;
  };
  weather: {
    badge: string;
    title: string;
    desc: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    bullet4: string;
    cta: string;
  };
  assistant: {
    badge: string;
    title: string;
    desc: string;
    voiceBadge: string;
    voiceDesc: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    bullet4: string;
    sampleQ1: string;
    sampleQ2: string;
    sampleQ3: string;
    cta: string;
  };
}

const SECTION_TRANSLATIONS: Record<string, SectionI18n> = {
  en: {
    eyebrow: 'CORE AGRICULTURAL SERVICES',
    heading: 'Everything You Need for Successful Farming',
    subtitle:
      'Engineered specifically for Indian farmers. Transparent market prices, instant crop protection, farm labour access, official subsidies, and multilingual voice advisory.',
    mandi: {
      badge: 'MARKET PRICES & DIRECT TRADE',
      title: 'Mandi Marketplace & Price Intelligence',
      desc: 'Transparent price discovery and direct trading opportunities to maximize your harvest earnings.',
      bullet1: 'Available mandi prices updated daily across 1,000+ APMC & e-NAM mandis',
      bullet2: 'Crop selling opportunities directly connecting you to verified traders',
      bullet3: 'Buyer discovery for wholesale commodities with direct contact',
      bullet4: 'Price comparison across district markets to select the best selling mandi',
      cta: 'Explore Mandi Prices',
    },
    cropDoctor: {
      badge: 'AI PLANT DIAGNOSTICS',
      title: 'Crop Doctor & Pest Protection',
      desc: 'Instant visual leaf health diagnosis trained on Indian crop diseases and local agronomic practices.',
      bullet1: 'Upload a crop photograph of affected leaves, stems, or fruits',
      bullet2: 'Identify potential crop diseases, fungal infections, and pest damage',
      bullet3: 'Provide treatment guidance with organic remedies and approved sprays',
      bullet4: 'Show relevant expert contacts and KVK advisors when verified & available',
      cta: 'Diagnose Crop Health',
    },
    workers: {
      badge: 'FARM LABOUR NETWORK',
      title: 'Worker Connect',
      desc: 'Connect directly with agricultural labour crews for seasonal sowing, weeding, and harvesting.',
      bullet1: 'Find agricultural labour crews for field transplantation and harvest operations',
      bullet2: 'Discover available farming jobs in nearby villages and districts',
      bullet3: 'View location, work dates, daily wages, and direct telephone contact',
      bullet4: 'Zero intermediary commission—direct farmer-to-worker agreements',
      cta: 'Find Farm Workers',
    },
    schemes: {
      badge: 'FARMER WELFARE & SUBSIDIES',
      title: 'Government Schemes Portal',
      desc: 'Clear, up-to-date information on central and state agricultural support initiatives.',
      bullet1: 'Discover relevant schemes including PM-KISAN, PMFBY insurance, and Soil Health Cards',
      bullet2: 'Show eligibility criteria translated into regional languages for easy understanding',
      bullet3: 'Display application deadlines when verified so you never miss financial support',
      bullet4: 'Direct links to official government application pages and departmental portals',
      cta: 'Explore Government Schemes',
    },
    weather: {
      badge: 'METEOROLOGICAL INTELLIGENCE',
      title: 'Weather Intelligence for Agriculture',
      desc: 'Hyper-local weather forecasts and rainfall projections tailored to practical farming operations.',
      bullet1: 'Display actual weather information including temperature, humidity, and wind speed',
      bullet2: 'Show rainfall forecasts with 7-day precipitation outlook for field planning',
      bullet3: 'Farming-relevant alerts for pesticide spraying, irrigation, and crop protection',
      bullet4: 'Seasonal advisory tailored to specific crop stages in your local region',
      cta: 'Check Weather Forecast',
    },
    assistant: {
      badge: 'MULTILINGUAL AI ADVISOR',
      title: 'AI Farming Assistant with Voice Support',
      desc: 'Instant farming answers in your mother tongue. Speak or type to receive verified agronomic recommendations.',
      voiceBadge: 'Voice Supported: Hindi, Kannada & English',
      voiceDesc: 'Tap the microphone and speak naturally in your regional language.',
      bullet1: 'Support for Hindi, English, and Kannada (plus 8 additional Indian languages)',
      bullet2: 'Provide agricultural guidance through the existing assistant integration',
      bullet3: 'Voice interaction easy to discover and designed for rural field usage',
      bullet4: 'Guidance on fertilizer dosage, pest control remedies, and sowing calendar',
      sampleQ1: 'टमाटर की पत्ती मुड़ने का क्या कारण है? (Hindi)',
      sampleQ2: 'ಟೊಮೇಟೊ ಎಲೆ ಸುರುಳಿಯಾಗಲು ಕಾರಣವೇನು? (Kannada)',
      sampleQ3: 'Best fertilizer schedule for wheat tillering? (English)',
      cta: 'Ask KisaanBuddy Assistant',
    },
  },
  hi: {
    eyebrow: 'प्रमुख कृषि सेवाएं',
    heading: 'सफल खेती के लिए सभी आवश्यक सेवाएं',
    subtitle:
      'भारतीय किसानों के लिए विशेष रूप से तैयार। पारदर्शी मंडी भाव, त्वरित फसल सुरक्षा, खेत मजदूर, सरकारी योजनाएं और क्षेत्रीय भाषा में वॉयस सहायता।',
    mandi: {
      badge: 'मंडी भाव और सीधा व्यापार',
      title: 'मंडी मार्केटप्लेस व मूल्य जानकारी',
      desc: 'अपनी उपज का सही मूल्य पाने के लिए सटीक भाव और सीधे खरीदारों से जुड़ने के अवसर।',
      bullet1: '1,000+ अधिकृत मंडियों और e-NAM से दैनिक उपलब्ध मंडी भाव',
      bullet2: 'बिना बिचौलियों के सीधे खरीदारों को फसल बेचने के सुगम अवसर',
      bullet3: 'सत्यापित व्यापारियों और थोक खरीदारों की तुरंत खोज',
      bullet4: 'आस-पास की मंडियों के भावों की तुलना करके सही बाजार का चुनाव',
      cta: 'मंडी भाव देखें',
    },
    cropDoctor: {
      badge: 'AI फसल निदान',
      title: 'क्रॉप डॉक्टर व रोग नियंत्रण',
      desc: 'भारतीय फसलों के लिए प्रशिक्षित सटीक रोग पहचान व व्यावहारिक उपचार समाधान।',
      bullet1: 'प्रभावित पत्ती, तने या फल की तस्वीर आसानी से अपलोड करें',
      bullet2: 'संभावित फसल रोगों, कीटों और फफूंद संक्रमण की तुरंत पहचान करें',
      bullet3: 'जैविक उपायों और अनुशंसित दवाओं के साथ उपचार मार्गदर्शन पाएं',
      bullet4: 'सत्यापित होने पर नजदीकी कृषि विज्ञान केंद्र (KVK) विशेषज्ञों के संपर्क सूत्र',
      cta: 'फसल स्वास्थ्य जांचें',
    },
    workers: {
      badge: 'कृषि श्रमिक नेटवर्क',
      title: 'वर्कर कनेक्ट (खेत मजदूर)',
      desc: 'रोपाई, निराई और कटाई के समय खेत के काम के लिए सीधे मजदूर दलों से जुड़ें।',
      bullet1: 'रोपाई व कटाई के लिए कुशल कृषि मजदूर और दल आसानी से खोजें',
      bullet2: 'आसपास के गांवों में उपलब्ध कृषि कार्यों और रोजगार की जानकारी',
      bullet3: 'कार्य स्थल, तारीख, दैनिक मजदूरी और सीधा फोन नंबर देखें',
      bullet4: 'शून्य कमीशन—किसान और मजदूर के बीच सीधा संपर्क',
      cta: 'खेत मजदूर खोजें',
    },
    schemes: {
      badge: 'सरकारी योजनाएं व सब्सिडी',
      title: 'सरकारी योजना पोर्टल',
      desc: 'केंद्र और राज्य सरकार की सभी प्रमुख कृषि योजनाओं की प्रामाणिक जानकारी।',
      bullet1: 'PM-किसान, फसल बीमा योजना (PMFBY) व मृदा स्वास्थ्य कार्ड खोजें',
      bullet2: 'अपनी भाषा में सरल शब्दों में पात्रता शर्तें समझें',
      bullet3: 'सत्यापित आवेदन की अंतिम तिथियां देखें ताकि कोई लाभ न छूटे',
      bullet4: 'आधिकारिक सरकारी आवेदन वेबसाइटों के सीधे लिंक',
      cta: 'सरकारी योजनाएं देखें',
    },
    weather: {
      badge: 'मौसम पूर्वानुमान',
      title: 'कृषि मौसम सूचना',
      desc: 'खेत के कार्यों, सिंचाई और छिड़काव की योजना के लिए सटीक मौसम पूर्वानुमान।',
      bullet1: 'तापमान, हवा की गति और आर्द्रता सहित वास्तविक मौसम की जानकारी',
      bullet2: 'आगामी 7 दिनों के वर्षा पूर्वानुमान के साथ खेत कार्यों की योजना',
      bullet3: 'कीटनाशक छिड़काव और सिंचाई के लिए खेती-उपयोगी मौसम अलर्ट',
      bullet4: 'फसल की अवस्था के अनुसार मौसमी सावधानियों की जानकारी',
      cta: 'मौसम पूर्वानुमान देखें',
    },
    assistant: {
      badge: 'वॉयस समर्थित AI सहायक',
      title: 'AI कृषि सहायक (बोलकर पूछें)',
      desc: 'अपनी मातृभाषा में बोलकर या लिखकर खेती से जुड़ा कोई भी सवाल पूछें।',
      voiceBadge: 'वॉयस सपोर्ट: हिंदी, कन्नड़ और अंग्रेजी',
      voiceDesc: 'माइक बटन दबाएं और अपनी भाषा में सहजता से बोलें।',
      bullet1: 'हिंदी, अंग्रेजी और कन्नड़ (व 8 अन्य भारतीय भाषाओं) में पूर्ण समर्थन',
      bullet2: 'उपलब्ध सहायक एकीकरण द्वारा सत्यापित कृषि मार्गदर्शन',
      bullet3: 'आसानी से दिखने वाली वॉयस सुविधा जो खेत में काम करते समय उपयोगी है',
      bullet4: 'उर्वरक की मात्रा, कीट नियंत्रण और बुवाई के सही समय की सलाह',
      sampleQ1: 'टमाटर की पत्ती मुड़ने का क्या कारण है? (हिंदी)',
      sampleQ2: 'ಟೊಮೇಟೊ ಎಲೆ ಸುರುಳಿಯಾಗಲು ಕಾರಣವೇನು? (ಕನ್ನಡ)',
      sampleQ3: 'Best fertilizer schedule for wheat tillering? (English)',
      cta: 'KisaanBuddy सहायक से पूछें',
    },
  },
  kn: {
    eyebrow: 'ಪ್ರಮುಖ ಕೃಷಿ ಸೇವೆಗಳು',
    heading: 'ಯಶಸ್ವಿ ಕೃಷಿಗಾಗಿ ನಿಮಗೆ ಬೇಕಾದ ಎಲ್ಲ ಸೇವೆಗಳು',
    subtitle:
      'ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ. ಪಾರದರ್ಶಕ ಮಂಡಿ ದರಗಳು, ತ್ವರಿತ ಬೆಳೆ ರೋಗ ಪತ್ತೆ, ಕೃಷಿ ಕಾರ್ಮಿಕರು, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಕನ್ನಡ ಧ್ವನಿ ಬೆಂಬಲ.',
    mandi: {
      badge: 'ಮಂಡಿ ದರ ಮತ್ತು ನೇರ ವ್ಯಾಪಾರ',
      title: 'ಮಂಡಿ ಮಾರುಕಟ್ಟೆ ಮತ್ತು ದರ ಮಾಹಿತಿ',
      desc: 'ನಿಮ್ಮ ಬೆಳೆಗೆ ಉತ್ತಮ ಬೆಲೆ ಪಡೆಯಲು ನಿಖರ ದರಗಳು ಮತ್ತು ನೇರ ಖರೀದಿದಾರರ ಸಂಪರ್ಕ.',
      bullet1: '1,000+ ಎಪಿಎಂಸಿ ಮತ್ತು ಇ-ನ್ಯಾಮ್ ಮಂಡಿಗಳಿಂದ ದೈನಂದಿನ ನೈಜ ಮಂಡಿ ದರಗಳು',
      bullet2: 'ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ನೇರವಾಗಿ ಖರೀದಿದಾರರಿಗೆ ಬೆಳೆ ಮಾರಾಟದ ಅವಕಾಶ',
      bullet3: 'ಸಗಟು ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಸಂಸ್ಕರಣಾಗಾರರ ತ್ವರಿತ ಶೋಧ',
      bullet4: 'ಉತ್ತಮ ಮಾರುಕಟ್ಟೆ ಆಯ್ಕೆ ಮಾಡಲು ನೆರೆಹೊರೆಯ ಜಿಲ್ಲೆಗಳ ದರಗಳ ಹೋಲಿಕೆ',
      cta: 'ಮಂಡಿ ದರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    },
    cropDoctor: {
      badge: 'AI ಬೆಳೆ ರೋಗ ತಪಾಸಣೆ',
      title: 'ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ & ರೋಗ ಸಂರಕ್ಷಣೆ',
      desc: 'ಭಾರತೀಯ ಬೆಳೆಗಳಿಗಾಗಿ ತರಬೇತಿ ಪಡೆದ ತಕ್ಷಣದ ಎಲೆ ರೋಗ ತಪಾಸಣಾ ಸಾಧನ.',
      bullet1: 'ಬಾಧಿತ ಎಲೆ, ಕಾಂಡ ಅಥವಾ ಹಣ್ಣಿನ ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      bullet2: 'ಸಂಭಾವ್ಯ ಬೆಳೆ ರೋಗಗಳು, ಶಿಲೀಂಧ್ರ ಮತ್ತು ಕೀಟ ಬಾಧೆಯನ್ನು ಪತ್ತೆಹಚ್ಚಿ',
      bullet3: 'ಸಾವಯವ ಪರಿಹಾರಗಳು ಮತ್ತು ಶಿಫಾರಸು ಮಾಡಿದ ಔಷಧಿಗಳ ಚಿಕಿತ್ಸಾ ಮಾರ್ಗದರ್ಶನ',
      bullet4: 'ದೃಢೀಕರಿಸಿದಾಗ ಹತ್ತಿರದ ಕೆವಿಕೆ (KVK) ಕೃಷಿ ತಜ್ಞರ ನೇರ ಸಂಪರ್ಕ ವಿವರ',
      cta: 'ಬೆಳೆ ಆರೋಗ್ಯ ತಪಾಸಿಸಿ',
    },
    workers: {
      badge: 'ಕೃಷಿ ಕಾರ್ಮಿಕರ ಜಾಲ',
      title: 'ವರ್ಕರ್ ಕನೆಕ್ಟ್ (ಕೃಷಿ ಕಾರ್ಮಿಕರು)',
      desc: 'ನಾಟಿ, ಕಳೆ ಕೀಳುವಿಕೆ ಮತ್ತು ಕೊಯ್ಲು ಕಾರ್ಯಕ್ಕಾಗಿ ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.',
      bullet1: 'ನಾಟಿ ಮತ್ತು ಕೊಯ್ಲು ಕೆಲಸಗಳಿಗಾಗಿ ಕೃಷಿ ಕಾರ್ಮಿಕರ ತಂಡಗಳನ್ನು ಹುಡುಕಿ',
      bullet2: 'ಹತ್ತಿರದ ಹಳ್ಳಿಗಳಲ್ಲಿ ಲಭ್ಯವಿರುವ ಕೃಷಿ ಉದ್ಯೋಗಗಳ ಮಾಹಿತಿ ಪಡೆಯಿರಿ',
      bullet3: 'ಸ್ಥಳ, ಕೆಲಸದ ದಿನಾಂಕ, ದೈನಂದಿನ ಕೂಲಿ ಮತ್ತು ನೇರ ಫೋನ್ ಸಂಖ್ಯೆ ವೀಕ್ಷಿಸಿ',
      bullet4: 'ಯಾವುದೇ ಕಮಿಷನ್ ಇಲ್ಲ—ರೈತರು ಮತ್ತು ಕಾರ್ಮಿಕರ ನಡುವೆ ನೇರ ಒಪ್ಪಂದ',
      cta: 'ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕಿ',
    },
    schemes: {
      badge: 'ರೈತರ ಕಲ್ಯಾಣ ಮತ್ತು ಸಬ್ಸಿಡಿ',
      title: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿ',
      desc: 'ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಸರ್ಕಾರಗಳ ಕೃಷಿ ಯೋಜನೆಗಳ ನಿಖರ ಹಾಗೂ ನವೀಕೃತ ಮಾಹಿತಿ.',
      bullet1: 'ಪಿಎಂ-ಕಿಸಾನ್, ಬೆಳೆ ವಿಮೆ (PMFBY), ಮತ್ತು ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಯೋಜನೆಗಳು',
      bullet2: 'ಸುಲಭವಾಗಿ ಅರ್ಥವಾಗುವಂತೆ ಪ್ರಾದೇಶಿಕ ಭಾಷೆಯಲ್ಲಿ ಅರ್ಹತಾ ಮಾನದಂಡಗಳು',
      bullet3: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಪರಿಶೀಲಿಸಿದ ಕೊನೆಯ ದಿನಾಂಕಗಳ ಪ್ರದರ್ಶನ',
      bullet4: 'ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಅರ್ಜಿ ಜಾಲತಾಣಗಳಿಗೆ ನೇರ ಲಿಂಕ್‌ಗಳು',
      cta: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ನೋಡಿ',
    },
    weather: {
      badge: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
      title: 'ಕೃಷಿ ಹವಾಮಾನ ಮಾಹಿತಿ',
      desc: 'ಕೃಷಿ ಕೆಲಸಗಳು, ನೀರಾವರಿ ಮತ್ತು ಸಿಂಪಡಣೆ ಯೋಜನೆಗಾಗಿ ಹೈಪರ್-ಲೋಕಲ್ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ.',
      bullet1: 'ತಾಪಮಾನ, ಗಾಳಿಯ ವೇಗ ಮತ್ತು ತೇವಾಂಶ ಸೇರಿದಂತೆ ನೈಜ ಹವಾಮಾನ ವಿವರ',
      bullet2: 'ಹೊಲದ ಯೋಜನೆಗಾಗಿ ಮುಂಬರುವ 7 ದಿನಗಳ ಮಳೆಯ ಮುನ್ಸೂಚನೆ',
      bullet3: 'ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಮತ್ತು ನೀರಾವರಿಗಾಗಿ ಕೃಷಿ-ಉಪಯುಕ್ತ ಎಚ್ಚರಿಕೆಗಳು',
      bullet4: 'ಸ್ಥಳೀಯ ಬೆಳೆ ಹಂತಗಳಿಗೆ ತಕ್ಕಂತೆ ಕಾಲೋಚಿತ ಹವಾಮಾನ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು',
      cta: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಪರಿಶೀಲಿಸಿ',
    },
    assistant: {
      badge: 'ಧ್ವನಿ ಬೆಂಬಲಿತ AI ಸಹಾಯಕ',
      title: 'AI ಕೃಷಿ ಸಹಾಯಕ (ಮಾತನಾಡಿ ಕೇಳಿ)',
      desc: 'ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡುವ ಮೂಲಕ ಅಥವಾ ಬರೆಯುವ ಮೂಲಕ ಕೃಷಿ ಸಲಹೆ ಪಡೆಯಿರಿ.',
      voiceBadge: 'ಧ್ವನಿ ಬೆಂಬಲ: ಕನ್ನಡ, ಹಿಂದಿ ಮತ್ತು ಇಂಗ್ಲಿಷ್',
      voiceDesc: 'ಮೈಕ್ರೊಫೋನ್ ಒತ್ತಿ ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಸರಳವಾಗಿ ಮಾತನಾಡಿ.',
      bullet1: 'ಕನ್ನಡ, ಹಿಂದಿ ಮತ್ತು ಇಂಗ್ಲಿಷ್ (ಹಾಗೂ 8 ಇತರೆ ಭಾಷೆಗಳಲ್ಲಿ) ಪೂರ್ಣ ಬೆಂಬಲ',
      bullet2: 'ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಸಹಾಯಕ ಏಕೀಕರಣದ ಮೂಲಕ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ',
      bullet3: 'ಸುಲಭವಾಗಿ ಗೋಚರಿಸುವ ಧ್ವನಿ ವೈಶಿಷ್ಟ್ಯ—ಹೊಲದಲ್ಲಿ ಕೆಲಸ ಮಾಡುವಾಗ ಅತ್ಯಂತ ಉಪಯುಕ್ತ',
      bullet4: 'ಗೊಬ್ಬರದ ಪ್ರಮಾಣ, ಕೀಟ ನಿಯಂತ್ರಣ ಮತ್ತು ಬಿತ್ತನೆ ವೇಳಾಪಟ್ಟಿಯ ನಿಖರ ಸಲಹೆ',
      sampleQ1: 'ಟೊಮೇಟೊ ಎಲೆ ಸುರುಳಿಯಾಗಲು ಕಾರಣವೇನು? (ಕನ್ನಡ)',
      sampleQ2: 'टमाटर की पत्ती मुड़ने का क्या कारण है? (हिंदी)',
      sampleQ3: 'Best fertilizer schedule for wheat tillering? (English)',
      cta: 'KisaanBuddy ಸಹಾಯಕನನ್ನು ಕೇಳಿ',
    },
  },
};

// Fallback mapping for other languages
SECTION_TRANSLATIONS.mr = SECTION_TRANSLATIONS.hi;
SECTION_TRANSLATIONS.te = SECTION_TRANSLATIONS.en;
SECTION_TRANSLATIONS.ta = SECTION_TRANSLATIONS.en;
SECTION_TRANSLATIONS.hi_en = SECTION_TRANSLATIONS.en;

export function FeatureShowcaseSection() {
  const { lang } = useLanguage();
  const t = SECTION_TRANSLATIONS[lang] || SECTION_TRANSLATIONS.en;

  return (
    <section
      id="features"
      className="relative w-full py-16 sm:py-24 bg-[#F7F9F4] dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 scroll-mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-stone-900 text-[#174B35] dark:text-[#78B957] text-xs font-bold uppercase tracking-wider border border-[#174B35]/20 dark:border-[#78B957]/30 shadow-xs mb-3">
            <span className="w-2 h-2 rounded-full bg-[#27834A]" />
            <span>{t.eyebrow}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#174B35] dark:text-white tracking-tight leading-[1.14]">
            {t.heading}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#68766C] dark:text-stone-300 leading-relaxed font-normal">
            {t.subtitle}
          </p>
        </div>

        {/* ASYMMETRICAL EDITORIAL GRID */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* ROW 1: Asymmetrical 7:5 Bento Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            
            {/* 1. Mandi Marketplace (lg:col-span-7) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-7 flex flex-col justify-between rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-[0_4px_24px_rgba(23,75,53,0.05)] hover:shadow-[0_12px_36px_rgba(23,75,53,0.1)] transition-all overflow-hidden group"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 h-full">
                {/* Photo half */}
                <div className="sm:col-span-5 relative h-56 sm:h-auto min-h-[220px] overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src="/images/mandi/grain-market-mandi.jpg"
                    alt="Indian Mandi Market Wholesale Trading"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#174B35]/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-white/95 dark:bg-stone-900/95 text-[#174B35] dark:text-[#78B957] border border-stone-200 shadow-xs">
                      <TrendingUp className="w-3 h-3 text-[#27834A]" />
                      {t.mandi.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-[11px] font-bold bg-[#174B35]/90 px-2 py-0.5 rounded text-emerald-100">
                      1,000+ Regulated Markets
                    </span>
                  </div>
                </div>

                {/* Content half */}
                <div className="sm:col-span-7 p-6 sm:p-7 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#174B35] dark:text-white leading-snug mb-2 group-hover:text-[#27834A] transition-colors">
                      {t.mandi.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#68766C] dark:text-stone-300 leading-relaxed mb-4">
                      {t.mandi.desc}
                    </p>

                    {/* 4 Core Features */}
                    <ul className="space-y-2 text-xs sm:text-sm text-[#1D2B22] dark:text-stone-200">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                        <span>{t.mandi.bullet1}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                        <span>{t.mandi.bullet2}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                        <span>{t.mandi.bullet3}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                        <span>{t.mandi.bullet4}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-5 mt-5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <Link
                      href="/mandi"
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#174B35] dark:text-[#78B957] hover:text-[#27834A] group/link"
                    >
                      <span>{t.mandi.cta}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. Crop Doctor (lg:col-span-5) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-[0_4px_24px_rgba(23,75,53,0.05)] hover:shadow-[0_12px_36px_rgba(23,75,53,0.1)] transition-all overflow-hidden group"
            >
              {/* Photo top */}
              <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img
                  src="/images/crop-doctor/powdery-mildew-leaf.jpg"
                  alt="Crop Leaf Disease Diagnostic Scan"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#174B35]/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-white/95 dark:bg-stone-900/95 text-[#174B35] dark:text-[#78B957] border border-stone-200 shadow-xs">
                    <Bug className="w-3 h-3 text-[#27834A]" />
                    {t.cropDoctor.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <span className="text-[11px] font-bold bg-[#174B35]/90 px-2 py-0.5 rounded text-emerald-100">
                    Instant AI Visual Scan
                  </span>
                </div>
              </div>

              {/* Content bottom */}
              <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xl font-bold text-[#174B35] dark:text-white leading-snug mb-2 group-hover:text-[#27834A] transition-colors">
                    {t.cropDoctor.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#68766C] dark:text-stone-300 leading-relaxed mb-4">
                    {t.cropDoctor.desc}
                  </p>

                  <ul className="space-y-2 text-xs sm:text-sm text-[#1D2B22] dark:text-stone-200">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.cropDoctor.bullet1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.cropDoctor.bullet2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.cropDoctor.bullet3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.cropDoctor.bullet4}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-5 mt-5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <Link
                    href="/disease"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#174B35] dark:text-[#78B957] hover:text-[#27834A] group/link"
                  >
                    <span>{t.cropDoctor.cta}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>

          {/* ROW 2: 3-Pillar Distinctive Grid (Worker Connect, Schemes, Weather) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* 3. Worker Connect */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="flex flex-col justify-between rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-[0_4px_24px_rgba(23,75,53,0.05)] hover:shadow-[0_12px_36px_rgba(23,75,53,0.1)] transition-all overflow-hidden group"
            >
              <div className="relative h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img
                  src="/images/farmers/farmer-field-tending.jpg"
                  alt="Indian Farmers Working in Field"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#174B35]/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-white/95 dark:bg-stone-900/95 text-[#174B35] dark:text-[#78B957] border border-stone-200 shadow-xs">
                    <Users className="w-3 h-3 text-[#27834A]" />
                    {t.workers.badge}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#174B35] dark:text-white leading-snug mb-2 group-hover:text-[#27834A] transition-colors">
                    {t.workers.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#68766C] dark:text-stone-300 leading-relaxed mb-4">
                    {t.workers.desc}
                  </p>

                  <ul className="space-y-2 text-xs sm:text-sm text-[#1D2B22] dark:text-stone-200">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.workers.bullet1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.workers.bullet2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.workers.bullet3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.workers.bullet4}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <Link
                    href="/worker-connect"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#174B35] dark:text-[#78B957] hover:text-[#27834A] group/link"
                  >
                    <span>{t.workers.cta}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* 4. Government Schemes */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="flex flex-col justify-between rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-[0_4px_24px_rgba(23,75,53,0.05)] hover:shadow-[0_12px_36px_rgba(23,75,53,0.1)] transition-all overflow-hidden group"
            >
              {/* Emblem Header Block */}
              <div className="p-6 bg-gradient-to-br from-[#174B35] to-[#27834A] text-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                    <Landmark className="w-3 h-3 text-[#F2B84B]" />
                    {t.schemes.badge}
                  </span>
                  <ShieldCheck className="w-5 h-5 text-[#78B957]" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {t.schemes.title}
                </h3>
                <p className="text-xs text-emerald-100 mt-1">
                  PM-KISAN, PMFBY, Soil Health Card & Subsidies
                </p>
              </div>

              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <p className="text-xs sm:text-sm text-[#68766C] dark:text-stone-300 leading-relaxed mb-4">
                    {t.schemes.desc}
                  </p>

                  <ul className="space-y-2 text-xs sm:text-sm text-[#1D2B22] dark:text-stone-200">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.schemes.bullet1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.schemes.bullet2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.schemes.bullet3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.schemes.bullet4}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <Link
                    href="/schemes"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#174B35] dark:text-[#78B957] hover:text-[#27834A] group/link"
                  >
                    <span>{t.schemes.cta}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* 5. Weather Intelligence */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="flex flex-col justify-between rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-[0_4px_24px_rgba(23,75,53,0.05)] hover:shadow-[0_12px_36px_rgba(23,75,53,0.1)] transition-all overflow-hidden group md:col-span-2 lg:col-span-1"
            >
              <div className="relative h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img
                  src="/images/weather/monsoon-farmland.jpg"
                  alt="Monsoon Farmland Rain Forecast"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#174B35]/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-white/95 dark:bg-stone-900/95 text-[#174B35] dark:text-[#78B957] border border-stone-200 shadow-xs">
                    <CloudSun className="w-3 h-3 text-[#27834A]" />
                    {t.weather.badge}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#174B35] dark:text-white leading-snug mb-2 group-hover:text-[#27834A] transition-colors">
                    {t.weather.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#68766C] dark:text-stone-300 leading-relaxed mb-4">
                    {t.weather.desc}
                  </p>

                  <ul className="space-y-2 text-xs sm:text-sm text-[#1D2B22] dark:text-stone-200">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.weather.bullet1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.weather.bullet2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.weather.bullet3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{t.weather.bullet4}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <Link
                    href="/weather"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#174B35] dark:text-[#78B957] hover:text-[#27834A] group/link"
                  >
                    <span>{t.weather.cta}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>

          {/* ROW 3: AI Farming Assistant (Full-Width Voice Advisory Banner) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl bg-gradient-to-br from-[#174B35] via-[#1c563e] to-[#27834A] text-white p-6 sm:p-8 md:p-10 shadow-[0_12px_40px_rgba(23,75,53,0.15)] relative overflow-hidden"
          >
            {/* Ambient decorative aura */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#78B957]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[#F2B84B]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Information & Voice Callout */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Voice Prominence Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-xs text-[#F2B84B] text-xs font-bold uppercase tracking-wider border border-white/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F2B84B] animate-ping" />
                  <Mic className="w-3.5 h-3.5" />
                  <span>{t.assistant.voiceBadge}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {t.assistant.title}
                </h3>

                <p className="text-sm sm:text-base text-emerald-100 max-w-xl leading-relaxed">
                  {t.assistant.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs sm:text-sm text-emerald-50">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#78B957] shrink-0 mt-0.5" />
                    <span>{t.assistant.bullet1}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#78B957] shrink-0 mt-0.5" />
                    <span>{t.assistant.bullet2}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#78B957] shrink-0 mt-0.5" />
                    <span>{t.assistant.bullet3}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#78B957] shrink-0 mt-0.5" />
                    <span>{t.assistant.bullet4}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/chatbot"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#F2B84B] hover:bg-[#e2aa3f] text-[#174B35] font-black text-sm sm:text-base shadow-md transition-all active:scale-95 group"
                  >
                    <Mic className="w-4 h-4 text-[#174B35]" />
                    <span>{t.assistant.cta}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Interactive Voice Question Preview Cards */}
              <div className="lg:col-span-5 space-y-3">
                <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-2">
                  Try asking in Hindi, Kannada or English:
                </p>

                <Link
                  href="/chatbot"
                  className="block p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-xs border border-white/15 transition-all text-xs sm:text-sm group"
                >
                  <div className="flex items-center justify-between text-[#F2B84B] font-bold text-[11px] mb-1">
                    <span className="flex items-center gap-1.5">
                      <Mic className="w-3 h-3" /> Hindi Voice
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-white font-medium">"{t.assistant.sampleQ1}"</p>
                </Link>

                <Link
                  href="/chatbot"
                  className="block p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-xs border border-white/15 transition-all text-xs sm:text-sm group"
                >
                  <div className="flex items-center justify-between text-[#78B957] font-bold text-[11px] mb-1">
                    <span className="flex items-center gap-1.5">
                      <Mic className="w-3 h-3" /> Kannada Voice
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-white font-medium">"{t.assistant.sampleQ2}"</p>
                </Link>

                <Link
                  href="/chatbot"
                  className="block p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-xs border border-white/15 transition-all text-xs sm:text-sm group"
                >
                  <div className="flex items-center justify-between text-emerald-300 font-bold text-[11px] mb-1">
                    <span className="flex items-center gap-1.5">
                      <Mic className="w-3 h-3" /> English Voice
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-white font-medium">"{t.assistant.sampleQ3}"</p>
                </Link>
              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
