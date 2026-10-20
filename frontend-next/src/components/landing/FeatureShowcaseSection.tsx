'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Store,
  Users,
  Bug,
  Landmark,
  Sparkles,
  CloudSun,
  Wrench,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';
import { useLanguage, type Lang } from '@/lib/language';

interface FeatureCardData {
  id: string;
  category: string;
  title: string;
  description: string;
  cta: string;
  link: string;
  image: string;
  alt: string;
  icon: LucideIcon;
}

interface ShowcaseI18n {
  eyebrow: string;
  heading: string;
  subtitle: string;
  cards: Record<string, {
    category: string;
    title: string;
    description: string;
    cta: string;
  }>;
}

const SHOWCASE_TRANSLATIONS: Record<string, ShowcaseI18n> = {
  en: {
    eyebrow: 'CORE AGRICULTURAL SERVICES',
    heading: 'Everything You Can Do on KisaanBuddy.',
    subtitle:
      'Designed for Indian farmers, smallholders, and rural producers. Explore transparent market prices, connect with buyers, hire labour, diagnose leaf health, and access official schemes.',
    cards: {
      mandi: {
        category: 'MARKET PRICES',
        title: 'Know the Right Price for Your Crops',
        description:
          'Check available mandi prices, compare markets, and use price information to make better selling decisions.',
        cta: 'Check Mandi Prices',
      },
      marketplace: {
        category: 'BUYERS & SELLERS',
        title: 'Find Buyers for Your Produce',
        description:
          'Explore opportunities to connect with agricultural buyers, traders, and input suppliers through the marketplace.',
        cta: 'Explore Marketplace',
      },
      workers: {
        category: 'FARM LABOUR',
        title: 'Find Workers for Your Farm',
        description:
          'Find agricultural workers and labour crews for paddy transplantation, sowing, harvesting, weeding, and other farm work.',
        cta: 'Find Farm Workers',
      },
      disease: {
        category: 'CROP HEALTH',
        title: 'Identify Crop Problems Early',
        description:
          'Upload a crop photograph to access the available crop disease diagnosis functionality and receive relevant guidance.',
        cta: 'Check Crop Health',
      },
      schemes: {
        category: 'FARMER BENEFITS',
        title: 'Discover Government Schemes',
        description:
          'Explore relevant agricultural schemes, eligibility criteria, application instructions, and official government resources.',
        cta: 'Explore Schemes',
      },
      assistant: {
        category: 'AI ADVISORY',
        title: 'Get Farming Guidance in Your Language',
        description:
          'Ask farming questions and get assistance through the existing KisaanBuddy AI assistant, with support for available languages.',
        cta: 'Ask KisaanBuddy',
      },
      weather: {
        category: 'WEATHER INTELLIGENCE',
        title: 'Plan Your Farming Around Weather',
        description:
          'Access the available weather information to help plan field activities, irrigation, and other farming operations.',
        cta: 'Check Weather',
      },
      inputs: {
        category: 'FARM INPUTS',
        title: 'Explore Agricultural Inputs',
        description:
          'Explore available agricultural input suppliers and relevant products or services through the existing marketplace.',
        cta: 'Explore Inputs',
      },
    },
  },
  hi: {
    eyebrow: 'प्रमुख कृषि सेवाएं',
    heading: 'खेती के हर काम के लिए KisaanBuddy की सेवाएं।',
    subtitle:
      'भारतीय किसानों और उत्पादकों के लिए समर्पित मंच। सही मंडी भाव जानें, खरीदार ढूंढें, मजदूर रखें, फसल स्वास्थ्य जांचें और सरकारी योजनाएं खोजें।',
    cards: {
      mandi: {
        category: 'मंडी भाव',
        title: 'फसलों का सही भाव जानें',
        description:
          'दैनिक मंडी भाव देखें, विभिन्न बाज़ारों की तुलना करें और सही मूल्य की जानकारी से बेहतर बिक्री निर्णय लें।',
        cta: 'मंडी भाव देखें',
      },
      marketplace: {
        category: 'खरीदार व विक्रेता',
        title: 'अपनी फसल के लिए खरीदार पाएं',
        description:
          'मार्केटप्लेस के माध्यम से कृषि खरीदारों, व्यापारियों और सामग्री आपूर्तिकर्ताओं से सीधे जुड़ने के अवसर खोजें।',
        cta: 'मार्केटप्लेस देखें',
      },
      workers: {
        category: 'कृषि श्रमिक',
        title: 'अपने खेत के लिए मजदूर पाएं',
        description:
          'धान रोपाई, बुवाई, कटाई, निराई और खेत के अन्य कार्यों के लिए कृषि श्रमिक और मजदूर दल खोजें।',
        cta: 'खेत मजदूर खोजें',
      },
      disease: {
        category: 'फसल स्वास्थ्य',
        title: 'फसल रोगों की समय पर पहचान करें',
        description:
          'फसल की तस्वीर अपलोड करके उपलब्ध रोग पहचान सुविधा का उपयोग करें और व्यावहारिक मार्गदर्शन प्राप्त करें।',
        cta: 'फसल स्वास्थ्य जांचें',
      },
      schemes: {
        category: 'सरकारी लाभ',
        title: 'सरकारी योजनाएं खोजें',
        description:
          'प्रासंगिक कृषि योजनाओं, पात्रता मानदंडों, आवेदन के नियमों और आधिकारिक सरकारी संसाधनों की जानकारी पाएं।',
        cta: 'योजनाएं देखें',
      },
      assistant: {
        category: 'AI कृषि परामर्श',
        title: 'अपनी भाषा में खेती की सलाह पाएं',
        description:
          'उपलब्ध भाषाओं में KisaanBuddy AI सहायक से खेती के सवाल पूछें और तुरंत सहायता प्राप्त करें।',
        cta: 'KisaanBuddy से पूछें',
      },
      weather: {
        category: 'मौसम सूचना',
        title: 'मौसम के अनुसार खेती की योजना बनाएं',
        description:
          'खेत कार्यों, सिंचाई और अन्य कृषि गतिविधियों की सही योजना बनाने के लिए उपलब्ध मौसम जानकारी देखें।',
        cta: 'मौसम देखें',
      },
      inputs: {
        category: 'कृषि इनपुट',
        title: 'कृषि इनपुट व उपकरण खोजें',
        description:
          'मार्केटप्लेस के माध्यम से उपलब्ध कृषि इनपुट आपूर्तिकर्ताओं, उत्पादों और सेवाओं का पता लगाएं।',
        cta: 'इनपुट देखें',
      },
    },
  },
  kn: {
    eyebrow: 'ಪ್ರಮುಖ ಕೃಷಿ ಸೇವೆಗಳು',
    heading: 'KisaanBuddy ಮೂಲಕ ರೈತರು ಮಾಡಬಹುದಾದ ಪ್ರಮುಖ ಕಾರ್ಯಗಳು.',
    subtitle:
      'ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ. ಮಂಡಿ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಖರೀದಿದಾರರನ್ನು ಕಂಡುಕೊಳ್ಳಿ, ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ನೇಮಿಸಿಕೊಳ್ಳಿ ಮತ್ತು ಬೆಳೆ ರೋಗಗಳನ್ನು ಗುರುತಿಸಿ.',
    cards: {
      mandi: {
        category: 'ಮಾರುಕಟ್ಟೆ ದರಗಳು',
        title: 'ನಿಮ್ಮ ಬೆಳೆಗೆ ಸರಿಯಾದ ಮಂಡಿ ದರ ತಿಳಿಯಿರಿ',
        description:
          'ಲಭ್ಯವಿರುವ ಮಂಡಿ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಮಾರುಕಟ್ಟೆಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ ಮತ್ತು ಉತ್ತಮ ಮಾರಾಟದ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.',
        cta: 'ಮಂಡಿ ದರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
      },
      marketplace: {
        category: 'ಖರೀದಿದಾರರು & ಮಾರಾಟಗಾರರು',
        title: 'ನಿಮ್ಮ ಬೆಳೆಗೆ ನೇರ ಖರೀದಿದಾರರನ್ನು ಹುಡುಕಿ',
        description:
          'ಮಾರುಕಟ್ಟೆಯ ಮೂಲಕ ಕೃಷಿ ಖರೀದಿದಾರರು, ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಪರಿಕರ ಪೂರೈಕೆದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸುವ ಅವಕಾಶಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.',
        cta: 'ಮಾರುಕಟ್ಟೆ ಅನ್ವೇಷಿಸಿ',
      },
      workers: {
        category: 'ಕೃಷಿ ಕಾರ್ಮಿಕರು',
        title: 'ನಿಮ್ಮ ಜಮೀನಿಗೆ ಕೃಷಿ ಕೆಲಸಗಾರರನ್ನು ಪಡೆಯಿರಿ',
        description:
          'ಭತ್ತದ ನಾಟಿ, ಬಿತ್ತನೆ, ಕಟಾವು, ಕಳೆ ಕೀಳುವುದು ಮತ್ತು ಇತರ ಕೃಷಿ ಕೆಲಸಗಳಿಗಾಗಿ ನುರಿತ ಕೃಷಿ ಕಾರ್ಮಿಕರ ತಂಡಗಳನ್ನು ಹುಡುಕಿ.',
        cta: 'ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕಿ',
      },
      disease: {
        category: 'ಬೆಳೆ ಆರೋಗ್ಯ',
        title: 'ಬೆಳೆ ರೋಗಗಳನ್ನು ಮೊದಲೇ ಪತ್ತೆಹಚ್ಚಿ',
        description:
          'ಲಭ್ಯವಿರುವ ಬೆಳೆ ರೋಗ ಪತ್ತೆಹಚ್ಚುವಿಕೆ ವೈಶಿಷ್ಟ್ಯವನ್ನು ಬಳಸಲು ಮತ್ತು ಸೂಕ್ತ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಲು ಬೆಳೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
        cta: 'ಬೆಳೆ ಆರೋಗ್ಯ ಪರಿಶೀಲಿಸಿ',
      },
      schemes: {
        category: 'ರೈತ ಸೌಲಭ್ಯಗಳು',
        title: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ',
        description:
          'ಅರ್ಹತಾ ಮಾನದಂಡಗಳು, ಅರ್ಜಿ ಸೂಚನೆಗಳು ಮತ್ತು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಒಳಗೊಂಡ ಪ್ರಮುಖ ಕೃಷಿ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.',
        cta: 'ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
      },
      assistant: {
        category: 'AI ಕೃಷಿ ಸಲಹೆಗಾರ',
        title: 'ನಿಮ್ಮದೇ ಭಾಷೆಯಲ್ಲಿ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ',
        description:
          'ಲಭ್ಯವಿರುವ ಭಾಷೆಗಳ ಬೆಂಬಲದೊಂದಿಗೆ KisaanBuddy AI ಸಹಾಯಕ ಮೂಲಕ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ ಮತ್ತು ಸಹಾಯ ಪಡೆಯಿರಿ.',
        cta: 'KisaanBuddy AI ಕೇಳಿ',
      },
      weather: {
        category: 'ಹವಾಮಾನ ಬುದ್ಧಿಮತ್ತೆ',
        title: 'ಹವಾಮಾನಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಕೃಷಿ ಯೋಜನೆ ರೂಪಿಸಿ',
        description:
          'ಕೃಷಿ ಚಟುವಟಿಕೆಗಳು, ನೀರಾವರಿ ಮತ್ತು ಇತರ ಕಾರ್ಯಾಚರಣೆಗಳನ್ನು ಯೋಜಿಸಲು ಲಭ್ಯವಿರುವ ಹವಾಮಾನ ಮಾಹಿತಿಯನ್ನು ಪ್ರವೇಶಿಸಿ.',
        cta: 'ಹವಾಮಾನ ಪರಿಶೀಲಿಸಿ',
      },
      inputs: {
        category: 'ಕೃಷಿ ಪರಿಕರಗಳು',
        title: 'ಕೃಷಿ ಪರಿಕರಗಳು ಮತ್ತು ಯಂತ್ರೋಪಕರಣಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
        description:
          'ಮಾರುಕಟ್ಟೆಯ ಮೂಲಕ ಲಭ್ಯವಿರುವ ಕೃಷಿ ಪರಿಕರ ಪೂರೈಕೆದಾರರು ಮತ್ತು ಸೂಕ್ತ ಉತ್ಪನ್ನಗಳು ಅಥವಾ ಸೇವೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.',
        cta: 'ಪರಿಕರಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
      },
    },
  },
  mr: {
    eyebrow: 'प्रमुख कृषी सेवा',
    heading: 'KisaanBuddy वरील शेतकऱ्यांसाठी आवश्यक सेवा.',
    subtitle:
      'भारतीय शेतकऱ्यांसाठी डिझाइन केलेले मंच. थेट बाजारभाव तपासा, खरेदीदारांशी संपर्क साधा, शेतमजूर मिळवा आणि पीक आरोग्य तपासा.',
    cards: {
      mandi: {
        category: 'बाजारभाव',
        title: 'पिकांसाठी योग्य बाजारभाव जाणून घ्या',
        description:
          'दैनिक बाजारभाव तपासा, बाजारांची तुलना करा आणि चांगल्या विक्री निर्णयांसाठी माहिती वापरा.',
        cta: 'मंडी भाव तपासा',
      },
      marketplace: {
        category: 'खरेदीदार व विक्रेते',
        title: 'आपल्या पिकासाठी खरेदीदार शोधा',
        description:
          'मार्केटप्लेसच्या माध्यमातून कृषी खरेदीदार, व्यापारी आणि पुरवठादारांशी जोडण्याच्या संधी शोधा.',
        cta: 'मार्केटप्लेस पहा',
      },
      workers: {
        category: 'शेतमजूर',
        title: 'आपल्या शेतीसाठी मजूर मिळवा',
        description:
          'भात लावणी, पेरणी, कापणी, निंदणी आणि इतर कामांसाठी कृषी कामगार व मजूर गट शोधा.',
        cta: 'शेतमजूर शोधा',
      },
      disease: {
        category: 'पीक आरोग्य',
        title: 'पिकांच्या समस्यांची वेळेवर ओळख',
        description:
          'रोग निदान सुविधेचा वापर करण्यासाठी पिकाचा फोटो अपलोड करा आणि योग्य मार्गदर्शन मिळवा.',
        cta: 'पीक आरोग्य तपासा',
      },
      schemes: {
        category: 'शासकीय योजना',
        title: 'शासकीय कृषी योजना शोधा',
        description:
          'पात्रता निकष, अर्ज प्रक्रिया आणि अधिकृत सरकारी संसाधनांसह संबंधित कृषी योजनांची माहिती घ्या.',
        cta: 'योजना पहा',
      },
      assistant: {
        category: 'AI कृषी सल्लागार',
        title: 'आपल्या भाषेत शेती मार्गदर्शन मिळवा',
        description:
          'उपलब्ध भाषांमध्ये KisaanBuddy AI सहाय्यकाला शेतीविषयक प्रश्न विचारा आणि अचूक मदत मिळवा.',
        cta: 'KisaanBuddy ला विचारा',
      },
      weather: {
        category: 'हवामान माहिती',
        title: 'हवामानानुसार शेतीचे नियोजन करा',
        description:
          'शेतीची कामे, सिंचन आणि इतर कामांचे नियोजन करण्यासाठी हवामान माहितीचा वापर करा.',
        cta: 'हवामान तपासा',
      },
      inputs: {
        category: 'कृषी निविष्ठा',
        title: 'कृषी उपकरणे व निविष्ठा शोधा',
        description:
          'मार्केटप्लेसच्या माध्यमातून उपलब्ध कृषी उपकरणे आणि निविष्ठा पुरवठादारांचा शोध घ्या.',
        cta: 'निविष्ठा पहा',
      },
    },
  },
  te: {
    eyebrow: 'ప్రధాన వ్యవసాయ సేవలు',
    heading: 'KisaanBuddy లో రైతుల కోసం అందుబాటులో ఉన్న సేవలు.',
    subtitle:
      'భారతీయ రైతుల కోసం రూపొందించబడింది. మార్కెట్ ధరలు తనిఖీ చేయండి, కొనుగోలుదారులను కనుగొనండి, కూలీలను నియమించుకోండి మరియు పంట ఆరోగ్యాన్ని రక్షించండి.',
    cards: {
      mandi: {
        category: 'మార్కెట్ ధరలు',
        title: 'మీ పంటలకు సరైన మార్కెట్ ధరను తెలుసుకోండి',
        description:
          'మండి ధరలను తనిఖీ చేయండి, మార్కెట్లను పోల్చండి మరియు సరైన విక్రయ నిర్ణయాలు తీసుకోండి.',
        cta: 'మండి ధరలు చూడండి',
      },
      marketplace: {
        category: 'కొనుగోలుదారులు & విక్రేతలు',
        title: 'మీ పంటలకు కొనుగోలుదారులను కనుగొనండి',
        description:
          'మార్కెట్‌ప్లేస్ ద్వారా వ్యవసాయ కొనుగోలుదారులు, వ్యాపారులు మరియు సరఫరాదారులతో కనెక్ట్ అవ్వండి.',
        cta: 'మార్కెట్‌ప్లేస్ చూడండి',
      },
      workers: {
        category: 'వ్యవసాయ కూలీలు',
        title: 'మీ పొలం కోసం కూలీలను కనుగొనండి',
        description:
          'వరి నాట్లు, విత్తనాలు వేయడం, పంట కోత, కలుపు తీత పనుల కోసం నైపుణ్యం కలిగిన కూలీల బృందాలను కనుగొనండి.',
        cta: 'కూలీలను కనుగొనండి',
      },
      disease: {
        category: 'పంట ఆరోగ్యం',
        title: 'పంట సమస్యలను ముందుగానే గుర్తించండి',
        description:
          'రోగ నిర్ధారణ ఫీచర్‌ను ఉపయోగించడానికి మరియు తగిన మార్గదర్శకత్వం పొందడానికి పంట ఫోటోను అప్‌లోడ్ చేయండి.',
        cta: 'పంట ఆరోగ్యం తనిఖీ చేయండి',
      },
      schemes: {
        category: 'రైతు ప్రయోజనాలు',
        title: 'ప్రభుత్వ పథకాలను కనుగొనండి',
        description:
          'అర్హత ప్రమాణాలు, దరఖాస్తు సూచనలు మరియు అధికారిక వనరులతో వ్యవసాయ పథకాలను అన్వేషించండి.',
        cta: 'పథకాలను అన్వేషించండి',
      },
      assistant: {
        category: 'AI వ్యవసాయ సలహాదారు',
        title: 'మీ భాషలోనే వ్యవసాయ మార్గదర్శకత్వం పొందండి',
        description:
          'అందుబాటులో ఉన్న భాషల్లో KisaanBuddy AI సహాయకుడిని ప్రశ్నలు అడిగి మార్గదర్శకత్వం పొందండి.',
        cta: 'KisaanBuddy ని అడగండి',
      },
      weather: {
        category: 'వాతావరణ నిఘా',
        title: 'వాతావరణం ఆధారంగా వ్యవసాయ పనులను ప్లాన్ చేయండి',
        description:
          'పొలం పనులు, నీటిపారుదల మరియు ఇతర కార్యకలాపాలను ప్లాన్ చేసుకోవడానికి వాతావరణ సమాచారాన్ని ఉపయోగించండి.',
        cta: 'వాతావరణం చూడండి',
      },
      inputs: {
        category: 'వ్యవసాయ పరికరాలు',
        title: 'వ్యవసాయ పరికరాలు & ఇన్‌పుట్‌లను అన్వేషించండి',
        description:
          'మార్కెట్‌ప్లేస్ ద్వారా అందుబాటులో ఉన్న వ్యవసాయ పరికరాలు మరియు ఉత్పత్తులను కనుగొనండి.',
        cta: 'పరికరాలను చూడండి',
      },
    },
  },
  ta: {
    eyebrow: 'முக்கிய விவசாய சேவைகள்',
    heading: 'KisaanBuddy மூலம் விவசாயிகள் செய்யக்கூடிய சேவைகள்.',
    subtitle:
      'இந்திய விவசாயிகளுக்காக பிரத்யேகமாக உருவாக்கப்பட்டது. மண்டி விலைகளை சரிபார்க்கவும், வாங்குபவர்களைக் கண்டறியவும், பண்ணை தொழிலாளர்களை பெறவும்.',
    cards: {
      mandi: {
        category: 'சந்தை விலைகள்',
        title: 'உங்கள் பயிர்களுக்கான சரியான விலையை அறிந்து கொள்ளுங்கள்',
        description:
          'கிடைக்கக்கூடிய மண்டி விலைகளை சரிபார்த்து, சந்தைகளை ஒப்பிட்டு சிறந்த விற்பனை முடிவுகளை எடுங்கள்.',
        cta: 'மண்டி விலைகளை சரிபார்க்கவும்',
      },
      marketplace: {
        category: 'வாங்குவோர் & விற்போர்',
        title: 'உங்கள் விளைபொருட்களுக்கான வாங்குபவர்களைக் கண்டறியுங்கள்',
        description:
          'சந்தை மூலம் விவசாய வாங்குபவர்கள், வர்த்தகர்கள் மற்றும் சப்ளையர்களுடன் நேரடியாக இணையுங்கள்.',
        cta: 'சந்தையை காண்க',
      },
      workers: {
        category: 'பண்ணைத் தொழிலாளர்கள்',
        title: 'உங்கள் பண்ணைக்கு தொழிலாளர்களைக் கண்டறியுங்கள்',
        description:
          'நாற்று நடுதல், விதைத்தல், அறுவடை, களை எடுத்தல் போன்ற பணிகளுக்கு பண்ணை தொழிலாளர்களை கண்டறியுங்கள்.',
        cta: 'தொழிலாளர்களை கண்டறியுங்கள்',
      },
      disease: {
        category: 'பயிர் ஆரோக்கியம்',
        title: 'பயிர் நோய்களை முன்கூட்டியே கண்டறியுங்கள்',
        description:
          'பயிர் நோய் கண்டறிதல் அம்சத்தை அணுகவும் தகுந்த வழிகாட்டுதலைப் பெறவும் பயிர் புகைப்படத்தை பதிவேற்றவும்.',
        cta: 'பயிர் ஆரோக்கியத்தை சரிபார்க்கவும்',
      },
      schemes: {
        category: 'விவசாயிகள் சலுகைகள்',
        title: 'அரசுத் திட்டங்களைக் கண்டறியுங்கள்',
        description:
          'விவசாய திட்டங்கள், தகுதி வரம்புகள், விண்ணப்ப வழிமுறைகள் மற்றும் அதிகாரப்பூர்வ அரசாங்க ஆதாரங்களை அறியுங்கள்.',
        cta: 'திட்டங்களை காண்க',
      },
      assistant: {
        category: 'AI விவசாய ஆலோசகர்',
        title: 'உங்கள் தாய்மொழியில் விவசாய வழிகாட்டுதலைப் பெறுங்கள்',
        description:
          'KisaanBuddy AI உதவியாளர் மூலம் விவசாய கேள்விகளைக் கேட்டு உடனடி வழிகாட்டுதல் பெறுங்கள்.',
        cta: 'KisaanBuddy-யிடம் கேளுங்கள்',
      },
      weather: {
        category: 'வானிலை தகவல்',
        title: 'வானிலைக்கு ஏற்ப விவசாயத்தை திட்டமிடுங்கள்',
        description:
          'களப் பணிகள் மற்றும் பாசனத்தை திட்டமிட கிடைக்கக்கூடிய வானிலை தகவல்களைப் பயன்படுத்துங்கள்.',
        cta: 'வானிலை சரிபார்க்கவும்',
      },
      inputs: {
        category: 'விவசாய உபகரணங்கள்',
        title: 'விவசாய உபகரணங்கள் மற்றும் உள்ளீடுகளை காண்க',
        description:
          'சந்தை மூலம் கிடைக்கக்கூடிய விவசாய உள்ளீட்டு சப்ளையர்கள் மற்றும் சேவைகளை கண்டறியுங்கள்.',
        cta: 'உபகரணங்களை காண்க',
      },
    },
  },
  hi_en: {
    eyebrow: 'CORE AGRICULTURAL SERVICES',
    heading: 'Everything You Can Do on KisaanBuddy.',
    subtitle:
      'Designed for Indian farmers, smallholders, and rural producers. Explore transparent market prices, connect with buyers, hire labour, diagnose leaf health, and access official schemes.',
    cards: {
      mandi: {
        category: 'MARKET PRICES',
        title: 'Know the Right Price for Your Crops',
        description:
          'Check available mandi prices, compare markets, and use price information to make better selling decisions.',
        cta: 'Check Mandi Prices',
      },
      marketplace: {
        category: 'BUYERS & SELLERS',
        title: 'Find Buyers for Your Produce',
        description:
          'Explore opportunities to connect with agricultural buyers, traders, and input suppliers through the marketplace.',
        cta: 'Explore Marketplace',
      },
      workers: {
        category: 'FARM LABOUR',
        title: 'Find Workers for Your Farm',
        description:
          'Find agricultural workers and labour crews for paddy transplantation, sowing, harvesting, weeding, and other farm work.',
        cta: 'Find Farm Workers',
      },
      disease: {
        category: 'CROP HEALTH',
        title: 'Identify Crop Problems Early',
        description:
          'Upload a crop photograph to access the available crop disease diagnosis functionality and receive relevant guidance.',
        cta: 'Check Crop Health',
      },
      schemes: {
        category: 'FARMER BENEFITS',
        title: 'Discover Government Schemes',
        description:
          'Explore relevant agricultural schemes, eligibility criteria, application instructions, and official government resources.',
        cta: 'Explore Schemes',
      },
      assistant: {
        category: 'AI ADVISORY',
        title: 'Get Farming Guidance in Your Language',
        description:
          'Ask farming questions and get assistance through the existing KisaanBuddy AI assistant, with support for available languages.',
        cta: 'Ask KisaanBuddy',
      },
      weather: {
        category: 'WEATHER INTELLIGENCE',
        title: 'Plan Your Farming Around Weather',
        description:
          'Access the available weather information to help plan field activities, irrigation, and other farming operations.',
        cta: 'Check Weather',
      },
      inputs: {
        category: 'FARM INPUTS',
        title: 'Explore Agricultural Inputs',
        description:
          'Explore available agricultural input suppliers and relevant products or services through the existing marketplace.',
        cta: 'Explore Inputs',
      },
    },
  },
};

export function FeatureShowcaseSection() {
  const { lang } = useLanguage();
  const dict = SHOWCASE_TRANSLATIONS[lang] || SHOWCASE_TRANSLATIONS.en;
  const enCards = SHOWCASE_TRANSLATIONS.en.cards;

  const getCard = (key: keyof typeof enCards) => {
    return dict.cards[key] || enCards[key];
  };

  const featureCards: FeatureCardData[] = [
    {
      id: 'mandi-price-intelligence',
      category: getCard('mandi').category,
      title: getCard('mandi').title,
      description: getCard('mandi').description,
      cta: getCard('mandi').cta,
      link: '/mandi',
      image: '/images/mandi/grain-market-mandi.jpg',
      alt: 'Authentic Indian farmer at grain wholesale mandi market',
      icon: TrendingUp,
    },
    {
      id: 'direct-marketplace',
      category: getCard('marketplace').category,
      title: getCard('marketplace').title,
      description: getCard('marketplace').description,
      cta: getCard('marketplace').cta,
      link: '/marketplace',
      image: '/images/marketplace/vegetable-mandi.jpg',
      alt: 'Agricultural produce vendor in traditional vegetable mandi',
      icon: Store,
    },
    {
      id: 'worker-connect',
      category: getCard('workers').category,
      title: getCard('workers').title,
      description: getCard('workers').description,
      cta: getCard('workers').cta,
      link: '/worker-connect',
      image: '/images/crops/indian-paddy-field.jpg',
      alt: 'Indian rural paddy field during transplanting and crop season',
      icon: Users,
    },
    {
      id: 'crop-disease-diagnosis',
      category: getCard('disease').category,
      title: getCard('disease').title,
      description: getCard('disease').description,
      cta: getCard('disease').cta,
      link: '/disease',
      image: '/images/crop-doctor/powdery-mildew-leaf.jpg',
      alt: 'Crop leaf diagnosed with agricultural plant disease',
      icon: Bug,
    },
    {
      id: 'government-schemes',
      category: getCard('schemes').category,
      title: getCard('schemes').title,
      description: getCard('schemes').description,
      cta: getCard('schemes').cta,
      link: '/schemes',
      image: '/images/hero/hero-indian-farmer.jpg',
      alt: 'Indian farmer in agricultural field discovering schemes',
      icon: Landmark,
    },
    {
      id: 'ai-farming-assistant',
      category: getCard('assistant').category,
      title: getCard('assistant').title,
      description: getCard('assistant').description,
      cta: getCard('assistant').cta,
      link: '/chatbot',
      image: '/images/farmers/farmer-field-tending.jpg',
      alt: 'Farmer tending crop field with agronomic advisory',
      icon: Sparkles,
    },
    {
      id: 'weather-farm-planning',
      category: getCard('weather').category,
      title: getCard('weather').title,
      description: getCard('weather').description,
      cta: getCard('weather').cta,
      link: '/weather',
      image: '/images/weather/monsoon-farmland.jpg',
      alt: 'Monsoon rainclouds over agricultural farmland',
      icon: CloudSun,
    },
    {
      id: 'agricultural-inputs',
      category: getCard('inputs').category,
      title: getCard('inputs').title,
      description: getCard('inputs').description,
      cta: getCard('inputs').cta,
      link: '/marketplace',
      image: '/images/crops/punjab-wheat-field.jpg',
      alt: 'Lush agricultural wheat field and farm equipment in India',
      icon: Wrench,
    },
  ];

  return (
    <section
      id="features"
      className="relative w-full py-16 sm:py-24 bg-[#faf9f5] dark:bg-stone-950 border-b border-stone-200/80 dark:border-stone-800 scroll-mt-12"
    >
      {/* Background subtle agrarian tint */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b98108_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/10 text-emerald-900 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-700/20 mb-3 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{dict.eyebrow}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f241d] dark:text-white tracking-tight leading-[1.16]">
            {dict.heading}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
            {dict.subtitle}
          </p>
        </div>

        {/* 8-Card Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.id}
                href={card.link}
                className="group flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Real Agricultural Photograph with Small Category Badge */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={card.image}
                    alt={card.alt}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

                  {/* Small category badge over the image */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-white/95 dark:bg-stone-900/95 text-[#0f241d] dark:text-stone-200 border border-stone-200/80 dark:border-stone-700 shadow-xs backdrop-blur-xs">
                      {card.category}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Feature title with a small icon */}
                    <div className="flex items-start gap-2.5 mb-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/70 dark:border-emerald-800/70 mt-0.5 group-hover:bg-emerald-700 group-hover:text-white transition-colors duration-200">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg text-[#0f241d] dark:text-stone-100 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-200">
                        {card.title}
                      </h3>
                    </div>

                    {/* Short, farmer-friendly description */}
                    <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm leading-relaxed mb-4">
                      {card.description}
                    </p>
                  </div>

                  {/* Bottom action link with a right arrow */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 mt-auto flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                    <span>{card.cta}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
