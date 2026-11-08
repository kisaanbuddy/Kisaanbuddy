import { Lang } from './language';

export interface HomepageI18n {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaMandi: string;
    ctaSell: string;
    ctaBuyers: string;
    ctaWorkers: string;
    trustPoint1: string;
    trustPoint2: string;
    trustPoint3: string;
    trustPointWorkers: string;
  };
  mandi: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allStates: string;
    allCrops: string;
    minPrice: string;
    maxPrice: string;
    modalPrice: string;
    unit: string;
    arrival: string;
    reportedOn: string;
    sourceLabel: string;
    viewAllMandi: string;
    noResults: string;
    noResultsDesc: string;
    disclaimer: string;
  };
  buySell: {
    badge: string;
    title: string;
    subtitle: string;
    sellerTab: string;
    sellerTitle: string;
    sellerDesc: string;
    sellerCta: string;
    sellerPoint1: string;
    sellerPoint2: string;
    sellerPoint3: string;
    buyerTab: string;
    buyerTitle: string;
    buyerDesc: string;
    buyerCta: string;
    buyerPoint1: string;
    buyerPoint2: string;
    buyerPoint3: string;
    recentListingsTitle: string;
    recentRequirementsTitle: string;
    verifiedTag: string;
    disclaimer: string;
  };
  workers: {
    badge: string;
    title: string;
    subtitle: string;
    cardWorkersTitle: string;
    cardWorkersDesc: string;
    cardWorkersCta: string;
    cardWorkersPoints: [string, string, string];
    cardJobsTitle: string;
    cardJobsDesc: string;
    cardJobsCta: string;
    cardJobsPoints: [string, string, string];
    sampleWorkersTitle: string;
    sampleJobsTitle: string;
  };
  equipment: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
    hpLabel: string;
    specsLabel: string;
    categoryLabel: string;
    disclaimer: string;
  };
  advisory: {
    badge: string;
    title: string;
    subtitle: string;
    launchTool: string;
  };
  schemes: {
    badge: string;
    title: string;
    subtitle: string;
    viewAllSchemes: string;
    officialPortal: string;
  };
  trust: {
    badge: string;
    title: string;
    subtitle: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    pillar4Title: string;
    pillar4Desc: string;
  };
}

export const HOMEPAGE_STRINGS: Record<string, HomepageI18n> = {
  en: {
    hero: {
      badge: "YOUR COMPLETE FARMING COMPANION",
      title: "Everything You Need to Farm Smarter.",
      subtitle: "From checking mandi prices and finding buyers to hiring farm workers, diagnosing crop diseases, and discovering government schemes, KisaanBuddy brings essential farming services together in one place.",
      ctaMandi: "Explore Farming Services",
      ctaSell: "Ask KisaanBuddy AI",
      ctaBuyers: "Find Verified Buyers",
      ctaWorkers: "Hire AgriLabour & Find Jobs",
      trustPoint1: "Official APMC & e-NAM Mandi Benchmarks",
      trustPoint2: "Verified Farmers & Institutional Buyers",
      trustPoint3: "Zero Intermediary Commissions",
      trustPointWorkers: "Labour Bureau Verified Wage Benchmarks",
    },
    mandi: {
      badge: "MARKET INTELLIGENCE",
      title: "Mandi Bhav & Market Intelligence",
      subtitle: "Compare agricultural market prices and discover selling opportunities for your crops.",
      searchPlaceholder: "Search crop (Wheat, Paddy, Soybean, Cotton, Tomato...)",
      allStates: "All States",
      allCrops: "All Commodities",
      minPrice: "Min Price",
      maxPrice: "Max Price",
      modalPrice: "Modal Price",
      unit: "/ quintal",
      arrival: "Arrivals",
      reportedOn: "Reported",
      sourceLabel: "Source: AGMARKNET / e-NAM",
      viewAllMandi: "View All Mandi Prices (1,000+ Markets)",
      noResults: "No mandi records matching your current filter.",
      noResultsDesc: "Try selecting All States or searching for a broader commodity name.",
      disclaimer: "Daily APMC wholesale arrival rates",
    },
    buySell: {
      badge: "DIRECT AGRI COMMERCE",
      title: "Buy & Sell Agricultural Produce",
      subtitle: "Connect farmers, FPOs, traders and agricultural buyers.",
      sellerTab: "For Farmers & Sellers",
      sellerTitle: "Sell Your Produce Directly",
      sellerDesc: "List your harvested grains, pulses, oilseeds, or vegetables directly to institutional buyers and FPOs at transparent market prices.",
      sellerCta: "List Your Crop",
      sellerPoint1: "Display variety, available quantity in quintals, and harvest date",
      sellerPoint2: "Receive direct buyer inquiries without undisclosed broker cuts",
      sellerPoint3: "Upload crop lot photos and harvest location details",
      buyerTab: "For Traders & Buyers",
      buyerTitle: "Source Directly from Farms & FPOs",
      buyerDesc: "Browse verified crop lots across agricultural districts with verified crop specifications, moisture levels, and farm-gate pickup terms.",
      buyerCta: "Explore Marketplace",
      buyerPoint1: "Direct farm-origin procurement with batch trace and location",
      buyerPoint2: "Filter by district, variety, quantity and ready harvest date",
      buyerPoint3: "Submit buyer requirements for bulk seasonal procurement",
      recentListingsTitle: "Recent Farmer Produce Listings",
      recentRequirementsTitle: "Active Institutional Buyer Requirements",
      verifiedTag: "Verified FPO / Buyer",
      disclaimer: "All transactions are directly conducted between growers, FPOs, and buyers with mutual consent. KisaanBuddy does not hold funds or deduct broker fees.",
    },
    workers: {
      badge: "LABOUR & EMPLOYMENT",
      title: "Find AgriLabour. Find Farming Jobs.",
      subtitle: "Connect farmers who need agricultural labour with workers looking for farming opportunities.",
      cardWorkersTitle: "Hire AgriLabour & Harvesting Crews",
      cardWorkersDesc: "Find skilled labour groups, machine operators, and harvester teams for paddy transplantation (Ropai), weeding, spraying, and harvest.",
      cardWorkersCta: "Find AgriLabour",
      cardWorkersPoints: [
        "Search individual workers or registered labour collectives (FPOs/CHCs)",
        "Filter by district, activity, verified phone status, and wage rates",
        "Direct consent-based contact workflow with zero commission",
      ],
      cardJobsTitle: "Discover Open Agricultural Jobs",
      cardJobsDesc: "Explore genuine farm work opportunities posted directly by farm owners, with transparent daily wages, duration, and stay facilities.",
      cardJobsCta: "Find Farming Jobs",
      cardJobsPoints: [
        "Browse open seasonal farm jobs across Karnataka, Punjab, Maharashtra & more",
        "View daily wage rates aligned with official Labour Bureau benchmarks",
        "Apply directly or call farm owners with complete job details",
      ],
      sampleWorkersTitle: "Verified Labour Collectives & Machinery Crews",
      sampleJobsTitle: "Active Agricultural Job Requirements",
    },
    equipment: {
      badge: "MECHANIZATION & MACHINERY",
      title: "Agricultural Equipment & Machinery",
      subtitle: "Explore verified tractors, power weeders, rotavators, and sprayers with genuine manufacturer specifications.",
      cta: "Explore Equipment Catalogue",
      hpLabel: "Horsepower",
      specsLabel: "Verified Specifications",
      categoryLabel: "Implement Type",
      disclaimer: "Product catalogue items display genuine manufacturer specifications. Equipment available for rent from local farmers is listed separately with clear location details.",
    },
    advisory: {
      badge: "FARMING INTELLIGENCE",
      title: "Farming Intelligence & AI Advisory",
      subtitle: "Actionable decision support tools to protect crops, diagnose diseases, and maximize yield.",
      launchTool: "Open Tool",
    },
    schemes: {
      badge: "OFFICIAL RESOURCES",
      title: "Government Schemes & Official Support",
      subtitle: "Access verified central and state agriculture programs, financial subsidies, and direct benefit transfers.",
      viewAllSchemes: "Explore All Government Schemes",
      officialPortal: "Official Portal",
    },
    trust: {
      badge: "TRANSPARENCY & INTEGRITY",
      title: "Built on Trust, Transparency & Verified Public Data",
      subtitle: "KisaanBuddy connects real farmers with real markets through verified data sources, consent-based communication, and zero inflated metrics.",
      pillar1Title: "Official Mandi & Wage Data",
      pillar1Desc: "Data sourced directly from Agmarknet, e-NAM, and Labour Bureau WRRI reports.",
      pillar2Title: "Zero Fabricated Metrics",
      pillar2Desc: "No fake user numbers, no fictitious trading volumes, and no artificial price spikes.",
      pillar3Title: "Farmer Privacy Protection",
      pillar3Desc: "Phone numbers are masked by default. Contact is unlocked only through mutual consent.",
      pillar4Title: "Accessible in 10+ Languages",
      pillar4Desc: "Built for every farmer across India with full voice and regional script support.",
    },
  },
  hi: {
    hero: {
      badge: "आपका संपूर्ण खेती साथी",
      title: "खेती को बेहतर बनाने के लिए सब कुछ एक जगह।",
      subtitle: "मंडी भाव देखने और खरीदार ढूंढने से लेकर खेत मजदूर रखने, फसल रोगों की पहचान करने और सरकारी योजनाओं की जानकारी तक—KisaanBuddy सभी जरूरी कृषि सेवाओं को एक मंच पर लाता है।",
      ctaMandi: "खेती सेवाएं देखें",
      ctaSell: "KisaanBuddy AI से पूछें",
      ctaBuyers: "सत्यापित खरीदार ढूंढें",
      ctaWorkers: "मज़दूर खोजें एवं काम पाएं",
      trustPoint1: "सरकारी APMC व e-NAM अधिकृत मंडी भाव",
      trustPoint2: "सत्यापित किसान और संस्थागत खरीदार",
      trustPoint3: "बिचौलियों और कमीशन से पूरी मुक्ति",
      trustPointWorkers: "लेबर ब्यूरो अधिकृत न्यूनतम मजदूरी दरें",
    },
    mandi: {
      badge: "मंडी भाव विश्लेषण",
      title: "मंडी भाव व बाज़ार विश्लेषण",
      subtitle: "कृषि मंडियों के दैनिक भावों की तुलना करें और अपनी उपज का सही मूल्य प्राप्त करें।",
      searchPlaceholder: "फसल खोजें (गेहूं, धान, सोयाबीन, कपास, टमाटर...)",
      allStates: "सभी राज्य",
      allCrops: "सभी फसलें",
      minPrice: "न्यूनतम भाव",
      maxPrice: "अधिकतम भाव",
      modalPrice: "मॉडल भाव",
      unit: "/ क्विंटल",
      arrival: "आवक",
      reportedOn: "तारीख",
      sourceLabel: "स्रोत: AGMARKNET / e-NAM",
      viewAllMandi: "संपूर्ण मंडी भाव देखें (1,000+ मंडियां)",
      noResults: "चयनित फिल्टर में कोई मंडी रिकॉर्ड नहीं मिला।",
      noResultsDesc: "कृपया 'सभी राज्य' चुनें या फसल का नाम दोबारा लिखकर खोजें।",
      disclaimer: "दैनिक APMC थोक आवक दरें",
    },
    buySell: {
      badge: "सीधा कृषि व्यापार",
      title: "कृषि उपज क्रय-विक्रय (Buy & Sell)",
      subtitle: "किसान, FPO, व्यापारी और थोक खरीदारों का सीधा विश्वसनीय संपर्क।",
      sellerTab: "किसानों व विक्रेताओं के लिए",
      sellerTitle: "अपनी फसल सीधे खेत से बेचें",
      sellerDesc: "अपनी कटी हुई फसल (अनाज, दलहन, तिलहन, फल व सब्जियां) उचित मूल्य पर संस्थागत खरीदारों और FPO को बेचें।",
      sellerCta: "फसल लिस्ट करें",
      sellerPoint1: "किस्म, क्विंटल में उपलब्ध मात्रा और कटाई की तारीख दर्ज करें",
      sellerPoint2: "सीधे खरीदारों से कॉल और व्हाट्सएप पर बात करें, कोई दलाली नहीं",
      sellerPoint3: "खेत का स्थान और फसल की वास्तविक तस्वीरें जोड़ें",
      buyerTab: "व्यापारियों व खरीदारों के लिए",
      buyerTitle: "सीधे किसानों और FPO से थोक खरीद",
      buyerDesc: "विभिन्न जिलों के सत्यापित किसानों द्वारा लिस्ट की गई ताजी उपज देखें और अपनी मांग के अनुसार सीधे संपर्क करें।",
      buyerCta: "मार्केटप्लेस देखें",
      buyerPoint1: "सीधे खेत से ताजी, जांची-परखी उपज की प्राप्ति",
      buyerPoint2: "फसल किस्म, मात्रा और स्थान के अनुसार त्वरित फिल्टर",
      buyerPoint3: "बड़ी मौसमी खरीद के लिए अपनी मांग (Buyer Requirement) पोस्ट करें",
      recentListingsTitle: "किसानों द्वारा हाल ही में लिस्ट की गई फसलें",
      recentRequirementsTitle: "थोक व संस्थागत खरीदारों की सक्रिय मांग",
      verifiedTag: "सत्यापित FPO / खरीदार",
      disclaimer: "सभी सौदे किसानों और खरीदारों के बीच आपसी सहमति से होते हैं। KisaanBuddy कोई कमीशन नहीं लेता।",
    },
    workers: {
      badge: "कृषि श्रम शक्ति व रोजगार",
      title: "खेती के लिए मजदूर पाएं। खेती में काम पाएं।",
      subtitle: "मजदूरों की जरूरत वाले किसानों को काम की तलाश कर रहे कृषि श्रमिकों से जोड़ें।",
      cardWorkersTitle: "खेती के लिए मजदूर व हार्वेस्टर टीम रखें",
      cardWorkersDesc: "धान रोपाई, निराई, बुवाई, स्प्रे और फसल कटाई के लिए कुशल कृषि मजदूर समूह या ट्रैक्टर ऑपरेटर खोजें।",
      cardWorkersCta: "मजदूर खोजें",
      cardWorkersPoints: [
        "व्यक्तिगत मजदूर या पंजीकृत FPO/कस्टम हायरिंग सेंटर समूह खोजें",
        "जिला, कार्य का प्रकार, सत्यापित फोन और दैनिक मजदूरी अनुसार फिल्टर करें",
        "पारस्परिक सहमति आधारित सुरक्षित संपर्क, शून्य कमीशन",
      ],
      cardJobsTitle: "खेती में उपलब्ध काम देखें (रोजगार)",
      cardJobsDesc: "खेत मालिकों द्वारा पोस्ट किए गए काम के अवसर देखें, जिसमें दैनिक मजदूरी, रहने और यात्रा की साफ जानकारी होती है।",
      cardJobsCta: "कृषि काम खोजें",
      cardJobsPoints: [
        "कर्नाटक, पंजाब, महाराष्ट्र और अन्य राज्यों में खुले काम के अवसर",
        "लेबर ब्यूरो (Labour Bureau) के अधिकृत बेंचमार्क के अनुरूप मजदूरी",
        "खेत मालिक के सीधे विवरण के साथ तुरंत आवेदन करें",
      ],
      sampleWorkersTitle: "सत्यापित कृषि मजदूर समूह व कस्टम हायरिंग दल",
      sampleJobsTitle: "खेत मालिकों द्वारा हाल ही में पोस्ट किए गए काम",
    },
    equipment: {
      badge: "कृषि यंत्रीकरण व उपकरण",
      title: "कृषि उपकरण व मशीनरी",
      subtitle: "सत्यापित निर्माताओं और स्थानीय किराएदारों के ट्रैक्टर, पावर वीडर, रोटावेटर और स्प्रेयर देखें।",
      cta: "उपकरण कैटलॉग देखें",
      hpLabel: "हॉर्सपावर (HP)",
      specsLabel: "सत्यापित विनिर्देश",
      categoryLabel: "उपकरण श्रेणी",
      disclaimer: "कैटलॉग में वास्तविक निर्माताओं के तकनीकी विवरण दर्शाए गए हैं। स्थानीय किसानों द्वारा किराए पर दिए जाने वाले उपकरण अलग से सूचीबद्ध हैं।",
    },
    advisory: {
      badge: "कृषि बुद्धिमत्ता",
      title: "कृषि बुद्धिमत्ता व AI परामर्श",
      subtitle: "फसल सुरक्षा, रोग पहचान और अधिकतम उत्पादन के लिए व्यावहारिक वैज्ञानिक उपकरण।",
      launchTool: "टूल खोलें",
    },
    schemes: {
      badge: "सरकारी सहायता",
      title: "सरकारी कृषि योजनाएं व आधिकारिक सहायता",
      subtitle: "केंद्र व राज्य सरकार की प्रमुख योजनाओं, अनुदान और डीबीटी (DBT) लाभों की प्रामाणिक जानकारी।",
      viewAllSchemes: "सभी सरकारी योजनाएं देखें",
      officialPortal: "आधिकारिक पोर्टल",
    },
    trust: {
      badge: "पारदर्शिता व प्रामाणिकता",
      title: "विश्वसनीयता, पारदर्शिता और वास्तविक डेटा पर आधारित",
      subtitle: "KisaanBuddy बिना किसी बनावटी आंकड़े के भारतीय किसानों को वास्तविक बाज़ार और सेवाओं से जोड़ता है।",
      pillar1Title: "अधिकृत सरकारी डेटा स्रोत",
      pillar1Desc: "Agmarknet, e-NAM और लेबर ब्यूरो की आधिकारिक रिपोर्टों से सत्यापित आंकड़े।",
      pillar2Title: "शून्य बनावटी आंकड़े",
      pillar2Desc: "कोई नकली यूजर संख्या, फर्जी ट्रेडिंग वॉल्यूम या कृत्रिम मूल्य वृद्धि नहीं।",
      pillar3Title: "किसान डेटा व गोपनीयता सुरक्षा",
      pillar3Desc: "फोन नंबर सुरक्षित और मास्क रहते हैं। संपर्क केवल आपसी सहमति से खुलता है।",
      pillar4Title: "10+ भारतीय भाषाओं में सुलभ",
      pillar4Desc: "आवाज और क्षेत्रीय भाषा समर्थन के साथ देश के हर किसान के लिए उपयोगी।",
    },
  },
  kn: {
    hero: {
      badge: "ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಕೃಷಿ ಒಡನಾಡಿ",
      title: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿಗಾಗಿ ನಿಮಗೆ ಬೇಕಾದ ಎಲ್ಲವೂ ಒಂದೇ ಸೂರಿನಡಿ.",
      subtitle: "ಮಂಡಿ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸುವುದು ಮತ್ತು ಖರೀದಿದಾರರನ್ನು ಹುಡುಕುವುದರಿಂದ ಹಿಡಿದು ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ನೇಮಿಸಿಕೊಳ್ಳುವುದು, ಬೆಳೆ ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚುವುದು ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಕೊಳ್ಳುವವರೆಗೆ—KisaanBuddy ಎಲ್ಲಾ ಅಗತ್ಯ ಕೃಷಿ ಸೇವೆಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ತರುತ್ತದೆ.",
      ctaMandi: "ಕೃಷಿ ಸೇವೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
      ctaSell: "KisaanBuddy AI ಕೇಳಿ",
      ctaBuyers: "ದೃಢೀಕೃತ ಖರೀದಿದಾರರನ್ನು ಹುಡುಕಿ",
      ctaWorkers: "ಕೃಷಿ ಕಾರ್ಮಿಕರು & ಕೆಲಸಗಳು",
      trustPoint1: "ಸರ್ಕಾರಿ APMC ಮತ್ತು e-NAM ಅಧಿಕೃತ ಮಂಡಿ ದರಗಳು",
      trustPoint2: "ದೃಢೀಕೃತ ರೈತರು ಮತ್ತು ಸಂಸ್ಥೆಯ ಖರೀದಿದಾರರು",
      trustPoint3: "ಮಧ್ಯವರ್ತಿಗಳು ಮತ್ತು ಕಮಿಷನ್ ಇಲ್ಲ",
      trustPointWorkers: "ಲೇಬರ್ ಬ್ಯೂರೋ ಅಧಿಕೃತ ಗ್ರಾಮೀಣ ಕೂಲಿ ದರಗಳು",
    },
    mandi: {
      badge: "ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ",
      title: "ಮಂಡಿ ದರಗಳು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ",
      subtitle: "ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ದರಗಳನ್ನು ಹೋಲಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಬೆಳೆಗೆ ಸೂಕ್ತ ಮಾರಾಟದ ಅವಕಾಶಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ.",
      searchPlaceholder: "ಬೆಳೆ ಹುಡುಕಿ (ಗೋಧಿ, ಭತ್ತ, ಸೋಯಾಬೀನ್, ಹತ್ತಿ, ಟೊಮೇಟೊ...)",
      allStates: "ಎಲ್ಲಾ ರಾಜ್ಯಗಳು",
      allCrops: "ಎಲ್ಲಾ ಬೆಳೆಗಳು",
      minPrice: "ಕನಿಷ್ಠ ದರ",
      maxPrice: "ಗರಿಷ್ಠ ದರ",
      modalPrice: "ಮಾದರಿ ದರ",
      unit: "/ ಕ್ವಿಂಟಾಲ್",
      arrival: "ಆವಕ",
      reportedOn: "ದಿನಾಂಕ",
      sourceLabel: "ಮೂಲ: AGMARKNET / e-NAM",
      viewAllMandi: "ಎಲ್ಲಾ ಮಂಡಿ ದರಗಳನ್ನು ವೀಕ್ಷಿಸಿ (1,000+ ಮಾರುಕಟ್ಟೆಗಳು)",
      noResults: "ಆಯ್ಕೆಮಾಡಿದ ಫಿಲ್ಟರ್‌ನಲ್ಲಿ ಯಾವುದೇ ಮಂಡಿ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
      noResultsDesc: "ದಯವಿಟ್ಟು 'ಎಲ್ಲಾ ರಾಜ್ಯಗಳು' ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಬೆಳೆಯ ಹೆಸರನ್ನು ಮತ್ತೆ ನಮೂದಿಸಿ.",
      disclaimer: "ದೈನಂದಿನ APMC ಸಗಟು ದರಗಳು",
    },
    buySell: {
      badge: "ನೇರ ಕೃಷಿ ವಾಣಿಜ್ಯ",
      title: "ಕೃಷಿ ಉತ್ಪನ್ನಗಳ ಖರೀದಿ ಮತ್ತು ಮಾರಾಟ (Buy & Sell)",
      subtitle: "ರೈತರು, FPO ಗಳು, ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಸಗಟು ಖರೀದಿದಾರರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸುತ್ತದೆ.",
      sellerTab: "ರೈತರು ಮತ್ತು ಮಾರಾಟಗಾರರಿಗಾಗಿ",
      sellerTitle: "ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಜಮೀನಿನಿಂದಲೇ ನೇರವಾಗಿ ಮಾರಾಟ ಮಾಡಿ",
      sellerDesc: "ಕಟಾವು ಮಾಡಿದ ಧಾನ್ಯ, ದ್ವಿದಳ ಧಾನ್ಯ, ತೈಲಬೀಜ ಅಥವಾ ತರಕಾರಿಗಳನ್ನು ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ಸಗಟು ಖರೀದಿದಾರರಿಗೆ ಮಾರಾಟ ಮಾಡಿ.",
      sellerCta: "ಬೆಳೆ ಪಟ್ಟಿ ಮಾಡಿ",
      sellerPoint1: "ತಳಿ, ಲಭ್ಯವಿರುವ ಕ್ವಿಂಟಾಲ್ ಪ್ರಮಾಣ ಮತ್ತು ಕಟಾವು ದಿನಾಂಕ ನಮೂದಿಸಿ",
      sellerPoint2: "ಖರೀದಿದಾರರಿಂದ ನೇರ ವಿಚಾರಣೆಗಳನ್ನು ಪಡೆಯಿರಿ, ಯಾವುದೇ ಕಮಿಷನ್ ಇಲ್ಲ",
      sellerPoint3: "ಜಮೀನಿನ ಸ್ಥಳ ಮತ್ತು ಬೆಳೆಯ ನೈಜ ಚಿತ್ರಗಳನ್ನು ಸೇರಿಸಿ",
      buyerTab: "ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಖರೀದಿದಾರರಿಗಾಗಿ",
      buyerTitle: "ಜಮೀನುಗಳಿಂದ ನೇರ ಸಗಟು ಖರೀದಿ",
      buyerDesc: "ಸ್ಥಳೀಯ ರೈತರು ಪಟ್ಟಿ ಮಾಡಿರುವ ತಾಜಾ ಉತ್ಪನ್ನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ ಮತ್ತು ಮೂಲದಿಂದಲೇ ನೇರವಾಗಿ ವ್ಯವಹರಿಸಿ.",
      buyerCta: "ಮಾರುಕಟ್ಟೆ ವೀಕ್ಷಿಸಿ",
      buyerPoint1: "ಜಮೀನಿನಿಂದಲೇ ನೇರ ತಾಜಾ ಉತ್ಪನ್ನಗಳ ಸಂಗ್ರಹಣೆ",
      buyerPoint2: "ಬೆಳೆ ತಳಿ, ಪ್ರಮಾಣ ಮತ್ತು ಸ್ಥಳದ ಪ್ರಕಾರ ತ್ವರಿತ ಫಿಲ್ಟರ್",
      buyerPoint3: "ದೊಡ್ಡ ಕಾಲೋಚಿತ ಖರೀದಿಗಾಗಿ ನಿಮ್ಮ ಬೇಡಿಕೆಯನ್ನು (Buyer Requirement) ಸಲ್ಲಿಸಿ",
      recentListingsTitle: "ರೈತರು ಇತ್ತೀಚೆಗೆ ಪಟ್ಟಿ ಮಾಡಿರುವ ಬೆಳೆಗಳು",
      recentRequirementsTitle: "ಸಂಸ್ಥೆಯ ಖರೀದಿದಾರರ ಸಕ್ರಿಯ ಬೇಡಿಕೆಗಳು",
      verifiedTag: "ದೃಢೀಕೃತ FPO / ಖರೀದಿದಾರ",
      disclaimer: "ಎಲ್ಲಾ ವ್ಯವಹಾರಗಳು ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರ ನಡುವೆ ಪರಸ್ಪರ ಒಪ್ಪಿಗೆಯೊಂದಿಗೆ ನಡೆಯುತ್ತವೆ.",
    },
    workers: {
      badge: "ಕೃಷಿ ಕಾರ್ಮಿಕರು ಮತ್ತು ಉದ್ಯೋಗ",
      title: "ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕಿ. ಕೃಷಿ ಕೆಲಸಗಳನ್ನು ಹುಡುಕಿ.",
      subtitle: "ಕೃಷಿ ಕೆಲಸಗಾರರ ಅಗತ್ಯವಿರುವ ರೈತರನ್ನು ಉದ್ಯೋಗ ಹುಡುಕುತ್ತಿರುವ ಕೃಷಿ ಕಾರ್ಮಿಕರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ.",
      cardWorkersTitle: "ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ನೇಮಿಸಿಕೊಳ್ಳಿ",
      cardWorkersDesc: "ಭತ್ತದ ನಾಟಿ, ಕಳೆ ಕೀಳುವುದು, ಬಿತ್ತನೆ ಮತ್ತು ಕಟಾವು ಕೆಲಸಗಳಿಗಾಗಿ ನುರಿತ ಕಾರ್ಮಿಕರನ್ನು ಅಥವಾ ಯಂತ್ರ ನಿರ್ವಾಹಕರನ್ನು ಹುಡುಕಿ.",
      cardWorkersCta: "ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕಿ",
      cardWorkersPoints: [
        "ವೈಯಕ್ತಿಕ ಕೆಲಸಗಾರರು ಅಥವಾ ನೋಂದಾಯಿತ FPO ಕಾರ್ಮಿಕ ಗುಂಪುಗಳನ್ನು ಹುಡುಕಿ",
        "ಜಿಲ್ಲೆ, ಕೃಷಿ ಚಟುವಟಿಕೆ, ದೃಢೀಕೃತ ಫೋನ್ ಮತ್ತು ಕೂಲಿ ದರದ ಆಧಾರದ ಮೇಲೆ ಫಿಲ್ಟರ್ ಮಾಡಿ",
        "ಪರಸ್ಪರ ಒಪ್ಪಿಗೆಯ ಆಧಾರದ ಮೇಲೆ ಸುರಕ್ಷಿತ ನೇರ ಸಂಪರ್ಕ",
      ],
      cardJobsTitle: "ಕೃಷಿ ಉದ್ಯೋಗಾವಕಾಶಗಳು",
      cardJobsDesc: "ಜಮೀನು ಮಾಲೀಕರು ನೇರವಾಗಿ ಪೋಸ್ಟ್ ಮಾಡಿರುವ ನೈಜ ಕೃಷಿ ಕೆಲಸಗಳನ್ನು ಅನ್ವೇಷಿಸಿ, ಇದರಲ್ಲಿ ಕೂಲಿ ಮತ್ತು ವಾಸ್ತವ್ಯದ ಮಾಹಿತಿ ಇರುತ್ತದೆ.",
      cardJobsCta: "ಕೃಷಿ ಕೆಲಸಗಳನ್ನು ಹುಡುಕಿ",
      cardJobsPoints: [
        "ಕರ್ನಾಟಕ, ಪಂಜಾಬ್, ಮಹಾರಾಷ್ಟ್ರ ಮತ್ತು ಇತರ ರಾಜ್ಯಗಳಲ್ಲಿನ ಕೃಷಿ ಕೆಲಸಗಳು",
        "ಲೇಬರ್ ಬ್ಯೂರೋ ಅಧಿಕೃತ ಬೆಂಚ್‌ಮಾರ್ಕ್‌ಗಳಿಗೆ ಅನುಗುಣವಾದ ಕೂಲಿ ದರಗಳು",
        "ಜಮೀನು ಮಾಲೀಕರ ಸಂಪೂರ್ಣ ವಿವರಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
      ],
      sampleWorkersTitle: "ದೃಢೀಕೃತ ಕೃಷಿ ಕಾರ್ಮಿಕ ಸಂಘಗಳು ಮತ್ತು ಕಟಾವು ತಂಡಗಳು",
      sampleJobsTitle: "ಜಮೀನು ಮಾಲೀಕರು ಪೋಸ್ಟ್ ಮಾಡಿರುವ ಸಕ್ರಿಯ ಕೃಷಿ ಕೆಲಸಗಳು",
    },
    equipment: {
      badge: "ಕೃಷಿ ಯಂತ್ರೋಪಕರಣಗಳು",
      title: "ಕೃಷಿ ಉಪಕರಣಗಳು ಮತ್ತು ಯಂತ್ರಗಳು",
      subtitle: "ದೃಢೀಕೃತ ತಯಾರಕರಿಂದ ಟ್ರ್ಯಾಕ್ಟರ್, ಪವರ್ ವೀಡರ್, ರೋಟಾವೇಟರ್ ಮತ್ತು ಸ್ಪ್ರೇಯರ್‌ಗಳ ಅಧಿಕೃತ ವಿವರಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
      cta: "ಉಪಕರಣ ಕ್ಯಾಟಲಾಗ್ ವೀಕ್ಷಿಸಿ",
      hpLabel: "ಅಶ್ವಶಕ್ತಿ (HP)",
      specsLabel: "ದೃಢೀಕೃತ ವಿಶೇಷತೆಗಳು",
      categoryLabel: "ಉಪಕರಣದ ಪ್ರಕಾರ",
      disclaimer: "ಉತ್ಪನ್ನ ಕ್ಯಾಟಲಾಗ್ ತಯಾರಕರ ಅಧಿಕೃತ ವಿವರಗಳನ್ನು ತೋರಿಸುತ್ತದೆ.",
    },
    advisory: {
      badge: "ಕೃಷಿ ಬುದ್ಧಿಮತ್ತೆ",
      title: "ಕೃಷಿ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು AI ಸಲಹೆ",
      subtitle: "ಬೆಳೆ ರಕ್ಷಣೆ, ರೋಗ ಪತ್ತೆ ಮತ್ತು ಗರಿಷ್ಠ ಇಳುವರಿಗಾಗಿ ವೈಜ್ಞಾನಿಕ ನಿರ್ಧಾರ ಬೆಂಬಲ ಪರಿಕರಗಳು.",
      launchTool: "ಪರಿಕರ ತೆರೆಯಿರಿ",
    },
    schemes: {
      badge: "ಸರ್ಕಾರಿ ನೆರವು",
      title: "ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳು ಮತ್ತು ಅಧಿಕೃತ ಬೆಂಬಲ",
      subtitle: "ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಸರ್ಕಾರದ ಪ್ರಮುಖ ಕೃಷಿ ಯೋಜನೆಗಳು, ಸಬ್ಸಿಡಿಗಳು ಮತ್ತು ಡಿಬಿಟಿ ಸೌಲಭ್ಯಗಳ ಅಧಿಕೃತ ಮಾಹಿತಿ.",
      viewAllSchemes: "ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
      officialPortal: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್",
    },
    trust: {
      badge: "ಪಾರದರ್ಶಕತೆ ಮತ್ತು ಪ್ರಾಮಾಣಿಕತೆ",
      title: "ನೈಜತೆ, ಪಾರದರ್ಶಕತೆ ಮತ್ತು ಅಧಿಕೃತ ಸಾರ್ವಜನಿಕ ಡೇಟಾದ ಮೇಲೆ ನಿರ್ಮಿಸಲಾಗಿದೆ",
      subtitle: "KisaanBuddy ಯಾವುದೇ ಕೃತಕ ಸಂಖ್ಯೆಗಳಿಲ್ಲದೆ ಭಾರತೀಯ ರೈತರನ್ನು ನೈಜ ಮಾರುಕಟ್ಟೆಗಳು ಮತ್ತು ಸೇವೆಗಳೊಂದಿಗೆ ಜೋಡಿಸುತ್ತದೆ.",
      pillar1Title: "ಅಧಿಕೃತ ಮಂಡಿ ಮತ್ತು ವೇತನ ಡೇಟಾ",
      pillar1Desc: "Agmarknet, e-NAM ಮತ್ತು ಲೇಬರ್ ಬ್ಯೂರೋ ವರದಿಗಳಿಂದ ನೇರವಾಗಿ ಪಡೆದ ಅಧಿಕೃತ ಡೇಟಾ.",
      pillar2Title: "ಶೂನ್ಯ ಕೃತಕ ಅಂಕಿಅಂಶಗಳು",
      pillar2Desc: "ಯಾವುದೇ ನಕಲಿ ಬಳಕೆದಾರರ ಸಂಖ್ಯೆಗಳಿಲ್ಲ ಮತ್ತು ಕೃತಕ ಬೆಲೆ ಏರಿಕೆಗಳಿಲ್ಲ.",
      pillar3Title: "ರೈತರ ಗೌಪ್ಯತೆ ರಕ್ಷಣೆ",
      pillar3Desc: "ಫೋನ್ ಸಂಖ್ಯೆಗಳನ್ನು ಮುಚ್ಚಿಡಲಾಗುತ್ತದೆ. ಪರಸ್ಪರ ಒಪ್ಪಿಗೆಯ ನಂತರವೇ ನೇರ ಸಂಪರ್ಕ ದೊರೆಯುತ್ತದೆ.",
      pillar4Title: "10+ ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಲಭ್ಯ",
      pillar4Desc: "ಧ್ವನಿ ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಭಾಷೆಯ ಬೆಂಬಲದೊಂದಿಗೆ ಪ್ರತಿಯೊಬ್ಬ ರೈತನಿಗೂ ಸುಲಭ.",
    },
  },
};

export function getHomepageI18n(lang: Lang): HomepageI18n {
  return HOMEPAGE_STRINGS[lang] || HOMEPAGE_STRINGS.en;
}



export interface HomePageTranslations {
  liveBar: {
    officialData: string;
    yourRegion: string;
  };
  voiceCard: {
    badge: string;
    greeting: string;
    subtitle: string;
    voiceBtn: string;
    faqPromptHeading: string;
    prompts: Array<{ text: string; icon: string }>;
  };
  cardsHeading: string;
  cardsSubheading: string;
  cards: {
    cropDoctor: {
      title: string;
      badge: string;
      desc: string;
      cta: string;
    };
    mandi: {
      title: string;
      badge: string;
      desc: string;
      cta: string;
    };
    weather: {
      title: string;
      badge: string;
      desc: string;
      cta: string;
    };
    machinery: {
      title: string;
      badge: string;
      desc: string;
      cta: string;
    };
    agrilabour: {
      title: string;
      badge: string;
      desc: string;
      cta: string;
    };
    aiAdvisor: {
      title: string;
      badge: string;
      desc: string;
      cta: string;
    };
  };
  advisory: {
    title: string;
    source: string;
    weatherStatusTitle: string;
    weatherStatusDesc: string;
    mandiTipTitle: string;
    mandiTipDesc: string;
  };
  whatsapp: {
    title: string;
    desc: string;
    cta: string;
    messageText: string;
  };
  howItWorks: {
    heading: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    footerNote: string;
  };
}

export const HOME_I18N: Record<Lang, HomePageTranslations> = {
  hi: {
    liveBar: {
      officialData: "सरकारी AGMARKNET मंडी भाव • IMD मौसम",
      yourRegion: "आपका क्षेत्र",
    },
    voiceCard: {
      badge: "🎙️ किसान वॉइस असिस्टेंट (बोलकर पूछें)",
      greeting: "नमस्ते किसान भाई! आज आपकी खेती में क्या मदद चाहिए?",
      subtitle: "टाइप करने की जरूरत नहीं है — बस नीचे दिए गए हरे माइक बटन को दबाएं और अपनी भाषा में कोई भी सवाल बोलकर पूछें।",
      voiceBtn: "बोलें / Speak",
      faqPromptHeading: "किसान भाई अक्सर ये सवाल पूछते हैं (टैप करें और तुरंत सुनें):",
      prompts: [
        { text: "गेहूं का आज का मंडी भाव क्या है?", icon: "🌾" },
        { text: "टमाटर की पत्ती पर पीले धब्बे हैं, क्या दवा डालें?", icon: "🍃" },
        { text: "क्या आज बारिश होगी, दवा छिड़क सकते हैं?", icon: "🌧️" },
        { text: "कटाई के लिए मजदूर कहां मिलेंगे?", icon: "👥" },
      ],
    },
    cardsHeading: "सीधे इस्तेमाल करें (Select Service)",
    cardsSubheading: "एक क्लिक में सेवा शुरू करें",
    cards: {
      cropDoctor: {
        title: "1. फसल डॉक्टर",
        badge: "फोटो खींचें",
        desc: "पत्ती की फोटो खींचकर रोग पहचानें और सही दवा व खुराक जानें।",
        cta: "जांच शुरू करें →",
      },
      mandi: {
        title: "2. आज का मंडी भाव",
        badge: "Live AGMARKNET",
        desc: "अपनी नज़दीकी मंडी के गेहूं, सरसों, चना और अन्य फसलों के ताज़ा रेट देखें।",
        cta: "भाव देखें →",
      },
      weather: {
        title: "3. मौसम व बारिश",
        badge: "3 दिन का अनुमान",
        desc: "बारिश कब होगी और कीटनाशक छिड़काव के लिए आज सही समय है या नहीं।",
        cta: "मौसम देखें →",
      },
      machinery: {
        title: "4. ट्रैक्टर व मशीनरी",
        badge: "किराया व खरीद",
        desc: "ट्रैक्टर, रोटावेटर और हार्वेस्टर किराए पर लें। सीधे मालिक से बात करें।",
        cta: "उपकरण खोजें →",
      },
      agrilabour: {
        title: "5. खेत मजदूर (AgriLabour)",
        badge: "मजदूर खोजें",
        desc: "फसल कटाई, रोपाई और छिड़काव के लिए अनुभवी मजदूर खोजें या पंजीकरण करें।",
        cta: "मजदूर देखें →",
      },
      aiAdvisor: {
        title: "6. AI कृषि सलाहकार",
        badge: "24x7 सेवा",
        desc: "खाद की मात्रा, बीज उपचार और बुवाई से कटाई तक कोई भी सवाल पूछें।",
        cta: "चैट शुरू करें →",
      },
    },
    advisory: {
      title: "आज की खेती सलाह (Field Advisory)",
      source: "IMD & कृषि विभाग द्वारा",
      weatherStatusTitle: "छिड़काव के लिए स्थिति: अनुकूल",
      weatherStatusDesc: "आज आपके क्षेत्र में तेज़ बारिश की संभावना नहीं है। कीटनाशक या खाद का छिड़काव सुबह 10 बजे से पहले या शाम 4 बजे के बाद करें।",
      mandiTipTitle: "मंडी भाव सुझाव: गेहूं व सरसों",
      mandiTipDesc: "आज प्रमुख मंडियों में गेहूं की औसत दर ₹2,275 और सरसों ₹5,450 प्रति क्विंटल है। फसल बेचने से पहले नज़दीकी 2 मंडियों के भाव ज़रूर मिला लें।",
    },
    whatsapp: {
      title: "फोन चलाने में कोई परेशानी आ रही है?",
      desc: "हमारे WhatsApp पर सीधे जुड़ें। अपनी फसल का फोटो या वॉइस मैसेज भेजें।",
      cta: "WhatsApp पर पूछें →",
      messageText: "नमस्ते KisaanBuddy! मुझे खेती से जुड़ी जानकारी चाहिए।",
    },
    howItWorks: {
      heading: "KisaanBuddy का उपयोग करना बहुत आसान है:",
      step1Title: "1. बोलें",
      step1Desc: "माइक का बटन दबाएं और अपनी फसल या मंडी के बारे में बोलकर पूछें।",
      step2Title: "2. फोटो भेजें",
      step2Desc: "अगर फसल में रोग है, तो पत्ते की फोटो खींचकर तुरंत सही दवा जानें।",
      step3Title: "3. समाधान पाएं",
      step3Desc: "सरकारी प्रमाणित मंडी भाव, मौसम अलर्ट और सही सलाह सीधे अपनी स्क्रीन पर देखें।",
      footerNote: "✓ 100% निःशुल्क सेवा • ✓ कोई ऐप डाउनलोड करने की जरूरत नहीं • ✓ भारत सरकार AGMARKNET व IMD प्रमाणित",
    },
  },

  en: {
    liveBar: {
      officialData: "Official AGMARKNET Mandi Rates • IMD Weather",
      yourRegion: "Your Farm Region",
    },
    voiceCard: {
      badge: "🎙️ Farmer Voice Assistant (Tap to Speak)",
      greeting: "Namaste Farmer Friend! What help do you need with your farm today?",
      subtitle: "No need to type — simply tap the green microphone button below and ask any farming question in your language.",
      voiceBtn: "Speak / बोलें",
      faqPromptHeading: "Common questions farmers ask (Tap to ask):",
      prompts: [
        { text: "What is today's wheat mandi rate?", icon: "🌾" },
        { text: "Yellow spots on tomato leaf, which medicine to spray?", icon: "🍃" },
        { text: "Will it rain today? Is it safe to spray pesticides?", icon: "🌧️" },
        { text: "Where can I find workers for harvesting?", icon: "👥" },
      ],
    },
    cardsHeading: "Direct Access (Select Service)",
    cardsSubheading: "Open any service in one tap",
    cards: {
      cropDoctor: {
        title: "1. Crop Doctor",
        badge: "Snap Photo",
        desc: "Photograph sick leaves to identify diseases and receive exact ICAR medicine dosages.",
        cta: "Start Diagnosis →",
      },
      mandi: {
        title: "2. Today's Mandi Rates",
        badge: "Live AGMARKNET",
        desc: "Track real-time modal prices for wheat, mustard, chana, and vegetables in nearby mandis.",
        cta: "Check Prices →",
      },
      weather: {
        title: "3. Weather & Rain Alert",
        badge: "3-Day Forecast",
        desc: "Check when it will rain and know the safe operational hours for pesticide spraying.",
        cta: "View Forecast →",
      },
      machinery: {
        title: "4. Tractor & Machinery",
        badge: "Rent or Buy",
        desc: "Rent tractors, rotavators, and combine harvesters directly from verified owners.",
        cta: "Find Equipment →",
      },
      agrilabour: {
        title: "5. Farm Labour (AgriLabour)",
        badge: "Find Workers",
        desc: "Connect with experienced agricultural labour for harvesting, sowing, and spraying.",
        cta: "View Workers →",
      },
      aiAdvisor: {
        title: "6. AI Agriculture Advisor",
        badge: "24x7 Assistance",
        desc: "Ask any question about fertilizer schedules, seed treatment, and crop lifecycle.",
        cta: "Start Chat →",
      },
    },
    advisory: {
      title: "Today's Field Advisory",
      source: "Sourced from IMD & Agriculture Dept",
      weatherStatusTitle: "Spray Condition: Favorable",
      weatherStatusDesc: "No heavy rain expected in your area today. Spray pesticides before 10 AM or after 4 PM for maximum efficacy.",
      mandiTipTitle: "Mandi Selling Insight: Wheat & Mustard",
      mandiTipDesc: "Today's average modal rate is ₹2,275/qtl for wheat and ₹5,450/qtl for mustard. Compare 2 nearby mandis before selling.",
    },
    whatsapp: {
      title: "Finding it difficult to use the phone?",
      desc: "Connect directly with our team on WhatsApp. Send a leaf photo or voice note.",
      cta: "Ask on WhatsApp →",
      messageText: "Hello KisaanBuddy! I need agricultural assistance for my farm.",
    },
    howItWorks: {
      heading: "Using KisaanBuddy is extremely simple:",
      step1Title: "1. Speak",
      step1Desc: "Tap the microphone and ask questions about your crops or mandi rates.",
      step2Title: "2. Snap Photo",
      step2Desc: "If your crop is diseased, snap a clear leaf photo for instant diagnosis.",
      step3Title: "3. Get Solution",
      step3Desc: "Receive verified mandi rates, weather alerts, and treatment dosages right on your screen.",
      footerNote: "✓ 100% Free for Farmers • ✓ No app download required • ✓ Official AGMARKNET & IMD verified",
    },
  },

  hi_en: {
    liveBar: {
      officialData: "Official AGMARKNET Mandi Bhav • IMD Mausam",
      yourRegion: "Aapka Area",
    },
    voiceCard: {
      badge: "🎙️ Kisaan Voice Assistant (Bolkar Poochein)",
      greeting: "Namaste Kisaan Bhai! Aaj kheti mein kya madad chahiye?",
      subtitle: "Type karne ki zaroorat nahi hai — bas green mic button dabayein aur apni bhasha mein bolkar sawal poochein.",
      voiceBtn: "Bolein / Speak",
      faqPromptHeading: "Kisaan bhai aksar yeh sawal poochte hain (Tap karein):",
      prompts: [
        { text: "Gehun ka aaj ka mandi bhav kya hai?", icon: "🌾" },
        { text: "Tamatar ke patte par peele daag hain, kaunsi dawa dalein?", icon: "🍃" },
        { text: "Kya aaj baarish hogi? Spray karna safe hai?", icon: "🌧️" },
        { text: "Katai ke liye majdoor kahan milenge?", icon: "👥" },
      ],
    },
    cardsHeading: "Direct Access (Service Chunein)",
    cardsSubheading: "Ek tap mein service shuru karein",
    cards: {
      cropDoctor: {
        title: "1. Fasal Doctor",
        badge: "Photo Kheencho",
        desc: "Patte ki photo kheenchkar bimari pehchanein aur sahi dawa aur dosage jaanein.",
        cta: "Jaanch Shuru Karein →",
      },
      mandi: {
        title: "2. Aaj Ka Mandi Bhav",
        badge: "Live AGMARKNET",
        desc: "Apni nazdeeki mandi ke gehun, sarson, chana ke fresh rates check karein.",
        cta: "Bhav Dekhein →",
      },
      weather: {
        title: "3. Mausam aur Baarish",
        badge: "3 Din Ka Forecast",
        desc: "Baarish kab hogi aur spray karne ka sahi samay kab hai.",
        cta: "Mausam Dekhein →",
      },
      machinery: {
        title: "4. Tractor aur Upkaran",
        badge: "Kiraya aur Kharid",
        desc: "Tractor, rotavator aur harvester kiraye par lein. Seedhe maalik se baat karein.",
        cta: "Upkaran Khojein →",
      },
      agrilabour: {
        title: "5. Khet Majdoor (AgriLabour)",
        badge: "Majdoor Khojein",
        desc: "Katai, ropayi aur spray ke liye tajurbe-kaar majdoor khojein ya register karein.",
        cta: "Majdoor Dekhein →",
      },
      aiAdvisor: {
        title: "6. AI Krishi Salahkar",
        badge: "24x7 Sahayata",
        desc: "Khaad ki matra, beej upchar aur kheti ka koi bhi sawal poochein.",
        cta: "Chat Shuru Karein →",
      },
    },
    advisory: {
      title: "Aaj Ki Kheti Salah (Field Advisory)",
      source: "IMD aur Krishi Vibhag Dwara",
      weatherStatusTitle: "Spray Karne Ke Liye: Anukool",
      weatherStatusDesc: "Aaj aapke area mein tez baarish ki sambhavna nahi hai. Subah 10 baje se pehle ya sham 4 baje ke baad spray karein.",
      mandiTipTitle: "Mandi Bhav Tip: Gehun aur Sarson",
      mandiTipDesc: "Aaj gehun ka average modal bhav ₹2,275 aur sarson ₹5,450/qtl hai. Fasal bechne se pehle 2 mandiyon ke rate zaroor compare karein.",
    },
    whatsapp: {
      title: "Phone chalane mein koi pareshani aa rahi hai?",
      desc: "Hamare WhatsApp par seedhe judein. Patte ki photo ya voice note bhejein.",
      cta: "WhatsApp Par Poochein →",
      messageText: "Namaste KisaanBuddy! Mujhe kheti se judi jaankari chahiye.",
    },
    howItWorks: {
      heading: "KisaanBuddy use karna bahut aasan hai:",
      step1Title: "1. Bolein",
      step1Desc: "Mic button dabayein aur apni fasal ya mandi ke baare mein bolkar poochein.",
      step2Title: "2. Photo Bhejein",
      step2Desc: "Agar fasal mein bimari hai, toh patte ki photo kheenchkar sahi dawa jaanein.",
      step3Title: "3. Samadhan Paayein",
      step3Desc: "Sarkari verified mandi bhav, weather alert aur sahi salah screen par dekhein.",
      footerNote: "✓ 100% Free Kisaan Seva • ✓ Koi app download ki zaroorat nahi • ✓ Sarkari AGMARKNET aur IMD Verified",
    },
  },

  kn: {
    liveBar: {
      officialData: "ಅಧಿಕೃತ AGMARKNET ಮಂಡಿ ಬೆಲೆಗಳು • IMD ಹವಾಮಾನ",
      yourRegion: "ನಿಮ್ಮ ಜಮೀನಿನ ಪ್ರದೇಶ",
    },
    voiceCard: {
      badge: "🎙️ ರೈತ ಧ್ವನಿ ಸಹಾಯಕ (ಮಾತನಾಡಿ ಕೇಳಿ)",
      greeting: "ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ! ಇಂದು ನಿಮ್ಮ ಕೃಷಿಗೆ ಯಾವ ಸಹಾಯ ಬೇಕು?",
      subtitle: "ಟೈಪ್ ಮಾಡುವ ಅಗತ್ಯವಿಲ್ಲ — ಕೆಳಗಿನ ಹಸಿರು ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ ಕೇಳಿ.",
      voiceBtn: "ಮಾತನಾಡಿ / Speak",
      faqPromptHeading: "ರೈತರು ಹೆಚ್ಚಾಗಿ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು (ಟ್ಯಾಪ್ ಮಾಡಿ):",
      prompts: [
        { text: "ಇಂದಿನ ಗೋಧಿ ಮತ್ತು ಭತ್ತದ ಮಂಡಿ ಬೆಲೆ ಎಷ್ಟು?", icon: "🌾" },
        { text: "ಟೊಮೆಟೊ ಎಲೆ ಹಳದಿ ಚುಕ್ಕೆ ರೋಗಕ್ಕೆ ಯಾವ ಔಷಧಿ ಸಿಂಪಡಿಸಬೇಕು?", icon: "🍃" },
        { text: "ಇಂದು ಮಳೆ ಬರುತ್ತದೆಯೇ? ಔಷಧಿ ಸಿಂಪಡಣೆ ಮಾಡಬಹುದೇ?", icon: "🌧️" },
        { text: "ಬೆಳೆ ಕಟಾವಿಗೆ ಕೂಲಿ ಆಳುಗಳು ಎಲ್ಲಿ ಸಿಗುತ್ತಾರೆ?", icon: "👥" },
      ],
    },
    cardsHeading: "ನೇರ ಸೇವೆಗಳು (Service ಆಯ್ಕೆಮಾಡಿ)",
    cardsSubheading: "ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಸೇವೆ ಆರಂಭಿಸಿ",
    cards: {
      cropDoctor: {
        title: "1. ಬೆಳೆ ವೈದ್ಯ (Crop Doctor)",
        badge: "ಫೋಟೋ ತೆಗೆಯಿರಿ",
        desc: "ರೋಗಪೀಡಿತ ಎಲೆಯ ಫೋಟೋ ತೆಗೆದು ರೋಗ ಗುರುತಿಸಿ ಮತ್ತು ನಿಖರ ಔಷಧ ಪ್ರಮಾಣ ತಿಳಿಯಿರಿ.",
        cta: "ತಪಾಸಣೆ ಪ್ರಾರಂಭಿಸಿ →",
      },
      mandi: {
        title: "2. ಇಂದಿನ ಮಂಡಿ ದರಗಳು",
        badge: "Live AGMARKNET",
        desc: "ನಿಮ್ಮ ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ ಗೋಧಿ, ಭತ್ತ, ಹತ್ತಿ, ತರಕಾರಿಗಳ ಇಂದಿನ ದರ ನೋಡಿ.",
        cta: "ದರಗಳನ್ನು ನೋಡಿ →",
      },
      weather: {
        title: "3. ಹವಾಮಾನ & ಮಳೆ ಮುನ್ಸೂಚನೆ",
        badge: "3 ದಿನದ ಹವಾಮಾನ",
        desc: "ಮಳೆ ಯಾವಾಗ ಬರುತ್ತದೆ ಮತ್ತು ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಗೆ ಸೂಕ್ತ ಸಮಯವನ್ನು ತಿಳಿಯಿರಿ.",
        cta: "ಹವಾಮಾನ ನೋಡಿ →",
      },
      machinery: {
        title: "4. ಟ್ರ್ಯಾಕ್ಟರ್ & ಕೃಷಿ ಯಂತ್ರಗಳು",
        badge: "ಬಾಡಿಗೆ & ಖರೀದಿ",
        desc: "ಟ್ರ್ಯಾಕ್ಟರ್, ರೋಟಾವೇಟರ್, ಹಾರ್ವೆಸ್ಟರ್ ಬಾಡಿಗೆಗೆ ಪಡೆಯಿರಿ. ನೇರವಾಗಿ ಮಾಲೀಕರೊಂದಿಗೆ ಮಾತನಾಡಿ.",
        cta: "ಯಂತ್ರಗಳನ್ನು ಹುಡುಕಿ →",
      },
      agrilabour: {
        title: "5. ಕೃಷಿ ಕೂಲಿ ಕಾರ್ಮಿಕರು",
        badge: "ಆಳುಗಳನ್ನು ಹುಡುಕಿ",
        desc: "ನಾಟಿ, ಕಳೆ ಕೀಳಲು ಮತ್ತು ಕಟಾವಿಗೆ ಅನುಭವಿ ಕೃಷಿ ಕೂಲಿ ಕಾರ್ಮಿಕರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
        cta: "ಕಾರ್ಮಿಕರನ್ನು ನೋಡಿ →",
      },
      aiAdvisor: {
        title: "6. AI ಕೃಷಿ ಸಲಹೆಗಾರ",
        badge: "24x7 ಸೇವೆ",
        desc: "ಗೊಬ್ಬರದ ಪ್ರಮಾಣ, ಬೀಜೋಪಚಾರ ಮತ್ತು ಕೃಷಿಯ ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.",
        cta: "ಸಲಹೆ ಪಡೆಯಿರಿ →",
      },
    },
    advisory: {
      title: "ಇಂದಿನ ಕೃಷಿ ಸಲಹೆ (Field Advisory)",
      source: "IMD & ಕೃಷಿ ಇಲಾಖೆಯಿಂದ ಅಧಿಕೃತ ಮಾಹಿತಿ",
      weatherStatusTitle: "ಔಷಧ ಸಿಂಪಡಣೆಗೆ: ಅನುಕೂಲಕರ",
      weatherStatusDesc: "ಇಂದು ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಭಾರಿ ಮಳೆಯ ಸಾಧ್ಯತೆಯಿಲ್ಲ. ಬೆಳಿಗ್ಗೆ 10 ಗಂಟೆಯೊಳಗೆ ಅಥವಾ ಸಂಜೆ 4 ರ ನಂತರ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಿ.",
      mandiTipTitle: "ಮಂಡಿ ಮಾರಾಟ ಸಲಹೆ",
      mandiTipDesc: "ಫಸಲನ್ನು ಮಾರಾಟ ಮಾಡುವ ಮೊದಲು ಕನಿಷ್ಠ 2 ಹತ್ತಿರದ ಮಂಡಿಗಳಲ್ಲಿ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    },
    whatsapp: {
      title: "ಫೋನ್ ಬಳಸಲು ತೊಂದರೆಯಾಗುತ್ತಿದೆಯೇ?",
      desc: "ನಮ್ಮ WhatsApp ನಲ್ಲಿ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ. ಎಲೆಯ ಫೋಟೋ ಅಥವಾ ಧ್ವನಿ ಸಂದೇಶ ಕಳುಹಿಸಿ.",
      cta: "WhatsApp ನಲ್ಲಿ ಕೇಳಿ →",
      messageText: "ನಮಸ್ಕಾರ KisaanBuddy! ನನಗೆ ಕೃಷಿ ಸಂಬಂಧಿತ ಮಾಹಿತಿ ಬೇಕು.",
    },
    howItWorks: {
      heading: "KisaanBuddy ಬಳಸುವುದು ತುಂಬಾ ಸುಲಭ:",
      step1Title: "1. ಮಾತನಾಡಿ",
      step1Desc: "ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ನಿಮ್ಮ ಬೆಳೆ ಅಥವಾ ಮಂಡಿ ಬೆಲೆಯ ಬಗ್ಗೆ ಮಾತನಾಡಿ ಕೇಳಿ.",
      step2Title: "2. ಫೋಟೋ ಕಳುಹಿಸಿ",
      step2Desc: "ಬೆಳೆಯಲ್ಲಿ ರೋಗವಿದ್ದರೆ, ಎಲೆಯ ಫೋಟೋ ತೆಗೆದು ಸರಿಯಾದ ಔಷಧ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.",
      step3Title: "3. ಪರಿಹಾರ ಪಡೆಯಿರಿ",
      step3Desc: "ಅಧಿಕೃತ ಮಂಡಿ ಬೆಲೆ, ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಸಲಹೆಗಳನ್ನು ನೇರವಾಗಿ ಪರದೆಯ ಮೇಲೆ ನೋಡಿ.",
      footerNote: "✓ ರೈತರಿಗೆ 100% ಉಚಿತ ಸೇವೆ • ✓ ಯಾವುದೇ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡುವ ಅಗತ್ಯವಿಲ್ಲ • ✓ ಸರ್ಕಾರಿ AGMARKNET & IMD ಪ್ರಮಾಣೀಕೃತ",
    },
  },

  pa: {
    liveBar: {
      officialData: "ਸਰਕਾਰੀ AGMARKNET ਮੰਡੀ ਭਾਅ • IMD ਮੌਸਮ",
      yourRegion: "ਤੁਹਾਡਾ ਇਲਾਕਾ",
    },
    voiceCard: {
      badge: "🎙️ ਕਿਸਾਨ ਵੌਇਸ ਅਸਿਸਟੈਂਟ (ਬੋਲ ਕੇ ਪੁੱਛੋ)",
      greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਅੱਜ ਖੇਤੀ ਵਿੱਚ ਕੀ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
      subtitle: "ਟਾਈਪ ਕਰਨ ਦੀ ਲੋੜ ਨਹੀਂ — ਹੇਠਾਂ ਦਿੱਤੇ ਹਰੇ ਮਾਈਕ ਬਟਨ ਨੂੰ ਦਬਾਓ ਅਤੇ ਆਪਣੀ ਬੋਲੀ ਵਿੱਚ ਸਵਾਲ ਪੁੱਛੋ।",
      voiceBtn: "ਬੋਲੋ / Speak",
      faqPromptHeading: "ਕਿਸਾਨ ਅਕਸਰ ਇਹ ਸਵਾਲ ਪੁੱਛਦੇ ਹਨ (ਟੈਪ ਕਰੋ):",
      prompts: [
        { text: "ਕਣਕ ਦਾ ਅੱਜ ਦਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ?", icon: "🌾" },
        { text: "ਕਣਕ ਵਿੱਚ ਪੀਲੀ ਕੁੰਗੀ ਦਾ ਕੀ ਇਲਾਜ ਹੈ?", icon: "🍃" },
        { text: "ਕੀ ਅੱਜ ਮੀਂਹ ਪਵੇਗਾ, ਸਪਰੇਅ ਕਰ ਸਕਦੇ ਹਾਂ?", icon: "🌧️" },
        { text: "ਵਾਢੀ ਲਈ ਮਜ਼ਦੂਰ ਕਿੱਥੇ ਮਿਲਣਗੇ?", icon: "👥" },
      ],
    },
    cardsHeading: "ਸਿੱਧੀ ਵਰਤੋਂ ਕਰੋ (ਸੇਵਾ ਚੁਣੋ)",
    cardsSubheading: "ਇੱਕ ਕਲਿੱਕ ਵਿੱਚ ਸੇਵਾ ਸ਼ੁਰੂ ਕਰੋ",
    cards: {
      cropDoctor: {
        title: "1. ਫਸਲ ਡਾਕਟਰ (Crop Doctor)",
        badge: "ਫੋਟੋ ਖਿੱਚੋ",
        desc: "ਪੱਤੇ ਦੀ ਫੋਟੋ ਖਿੱਚ ਕੇ ਬਿਮਾਰੀ ਪਛਾਣੋ ਅਤੇ ਸਹੀ ਦਵਾਈ ਤੇ ਖੁਰਾਕ ਜਾਣੋ।",
        cta: "ਜਾਂਚ ਸ਼ੁਰੂ ਕਰੋ →",
      },
      mandi: {
        title: "2. ਅੱਜ ਦਾ ਮੰਡੀ ਭਾਅ",
        badge: "Live AGMARKNET",
        desc: "ਆਪਣੀ ਨੇੜਲੀ ਮੰਡੀ ਦੇ ਕਣਕ, ਸਰ੍ਹੋਂ, ਝੋਨੇ ਦੇ ਤਾਜ਼ਾ ਭਾਅ ਵੇਖੋ।",
        cta: "ਭਾਅ ਵੇਖੋ →",
      },
      weather: {
        title: "3. ਮੌਸਮ ਅਤੇ ਮੀਂਹ",
        badge: "3 ਦਿਨਾਂ ਦਾ ਅਨੁਮਾਨ",
        desc: "ਮੀਂਹ ਕਦੋਂ ਪਵੇਗਾ ਅਤੇ ਸਪਰੇਅ ਕਰਨ ਦਾ ਸਹੀ ਸਮਾਂ ਜਾਣੋ।",
        cta: "ਮੌਸਮ ਵੇਖੋ →",
      },
      machinery: {
        title: "4. ਟਰੈਕਟਰ ਅਤੇ ਮਸ਼ੀਨਰੀ",
        badge: "ਕਿਰਾਇਆ ਅਤੇ ਖਰੀਦ",
        desc: "ਟਰੈਕਟਰ, ਰੋਟਾਵੇਟਰ ਅਤੇ ਕੰਬਾਈਨ ਕਿਰਾਏ 'ਤੇ ਲਵੋ। ਸਿੱਧਾ ਮਾਲਕ ਨਾਲ ਗੱਲ ਕਰੋ।",
        cta: "ਮਸ਼ੀਨਰੀ ਲੱਭੋ →",
      },
      agrilabour: {
        title: "5. ਖੇਤ ਮਜ਼ਦੂਰ (AgriLabour)",
        badge: "ਮਜ਼ਦੂਰ ਲੱਭੋ",
        desc: "ਵਾਢੀ, ਬਿਜਾਈ ਅਤੇ ਸਪਰੇਅ ਲਈ ਮਜ਼ਦੂਰ ਲੱਭੋ ਜਾਂ ਰਜਿਸਟਰ ਕਰੋ।",
        cta: "ਮਜ਼ਦੂਰ ਵੇਖੋ →",
      },
      aiAdvisor: {
        title: "6. AI ਖੇਤੀ ਸਲਾਹਕਾਰ",
        badge: "24x7 ਸੇਵਾ",
        desc: "ਖਾਦ ਦੀ ਮਾਤਰਾ, ਬੀਜ ਸੋਧ ਅਤੇ ਖੇਤੀ ਦਾ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛੋ।",
        cta: "ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ →",
      },
    },
    advisory: {
      title: "ਅੱਜ ਦੀ ਖੇਤੀ ਸਲਾਹ",
      source: "IMD ਅਤੇ ਖੇਤੀਬਾੜੀ ਵਿਭਾਗ ਵੱਲੋਂ",
      weatherStatusTitle: "ਸਪਰੇਅ ਲਈ ਮੌਸਮ: ਅਨੁਕੂਲ",
      weatherStatusDesc: "ਅੱਜ ਤੁਹਾਡੇ ਇਲਾਕੇ ਵਿੱਚ ਤੇਜ਼ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਨਹੀਂ ਹੈ। ਸਵੇਰੇ 10 ਵਜੇ ਤੋਂ ਪਹਿਲਾਂ ਜਾਂ ਸ਼ਾਮ 4 ਵਜੇ ਤੋਂ ਬਾਅਦ ਸਪਰੇਅ ਕਰੋ।",
      mandiTipTitle: "ਮੰਡੀ ਵੇਚਣ ਦੀ ਸਲਾਹ",
      mandiTipDesc: "ਫਸਲ ਵੇਚਣ ਤੋਂ ਪਹਿਲਾਂ ਨੇੜਲੀਆਂ 2 ਮੰਡੀਆਂ ਦੇ ਭਾਅ ਜ਼ਰੂਰ ਮਿਲਾ ਲਵੋ।",
    },
    whatsapp: {
      title: "ਫੋਨ ਚਲਾਉਣ ਵਿੱਚ ਕੋਈ ਮੁਸ਼ਕਲ ਆ ਰਹੀ ਹੈ?",
      desc: "ਸਾਡੇ WhatsApp 'ਤੇ ਸਿੱਧਾ ਜੁੜੋ। ਪੱਤੇ ਦੀ ਫੋਟੋ ਜਾਂ ਵੌਇਸ ਮੈਸੇਜ ਭੇਜੋ।",
      cta: "WhatsApp 'ਤੇ ਪੁੱਛੋ →",
      messageText: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ KisaanBuddy! ਮੈਨੂੰ ਖੇਤੀ ਬਾਰੇ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਹੈ।",
    },
    howItWorks: {
      heading: "KisaanBuddy ਵਰਤਣਾ ਬਹੁਤ ਆਸਾਨ ਹੈ:",
      step1Title: "1. ਬੋਲੋ",
      step1Desc: "ਮਾਈਕ ਬਟਨ ਦਬਾਓ ਅਤੇ ਆਪਣੀ ਫਸਲ ਜਾਂ ਮੰਡੀ ਬਾਰੇ ਬੋਲ ਕੇ ਪੁੱਛੋ।",
      step2Title: "2. ਫੋਟੋ ਭੇਜੋ",
      step2Desc: "ਜੇਕਰ ਫਸਲ ਵਿੱਚ ਰੋਗ ਹੈ, ਤਾਂ ਪੱਤੇ ਦੀ ਫੋਟੋ ਖਿੱਚ ਕੇ ਦਵਾਈ ਜਾਣੋ।",
      step3Title: "3. ਹੱਲ ਪਾਓ",
      step3Desc: "ਸਰਕਾਰੀ ਪ੍ਰਮਾਣਿਤ ਮੰਡੀ ਭਾਅ ਅਤੇ ਮੌਸਮ ਅਲਰਟ ਸਿੱਧਾ ਸਕ੍ਰੀਨ 'ਤੇ ਵੇਖੋ।",
      footerNote: "✓ 100% ਮੁਫਤ ਸੇਵਾ • ✓ ਕੋਈ ਐਪ ਡਾਊਨਲੋਡ ਕਰਨ ਦੀ ਲੋੜ ਨਹੀਂ • ✓ ਸਰਕਾਰੀ AGMARKNET & IMD ਪ੍ਰਮਾਣਿਤ",
    },
  },

  mr: {
    liveBar: {
      officialData: "शासकीय AGMARKNET बाजार भाव • IMD हवामान",
      yourRegion: "तुमचा परिसर",
    },
    voiceCard: {
      badge: "🎙️ शेतकरी व्हॉईस असिस्टंट (बोलून विचारा)",
      greeting: "नमस्कार शेतकरी मित्र! आज शेतीत काय मदत हवी आहे?",
      subtitle: "टाईप करण्याची गरज नाही — खालील हिरवे माइक बटण दाबा आणि आपल्या भाषेत कोणताही प्रश्न बोला.",
      voiceBtn: "बोला / Speak",
      faqPromptHeading: "शेतकरी अनेकदा हे प्रश्न विचारतात (टॅप करा):",
      prompts: [
        { text: "सोयाबीन आणि कापसाचा आजचा बाजार भाव काय आहे?", icon: "🌾" },
        { text: "टोमॅटोच्या पानांवर काळे ठिपके आहेत, काय फवारणी करावी?", icon: "🍃" },
        { text: "आज पाऊस पडेल का? फवारणी करणे सुरक्षित आहे का?", icon: "🌧️" },
        { text: "कापणीसाठी मजूर कुठे मिळतील?", icon: "👥" },
      ],
    },
    cardsHeading: "थेट सेवा निवडा (Select Service)",
    cardsSubheading: "एका क्लिकवर सेवा सुरू करा",
    cards: {
      cropDoctor: {
        title: "1. पीक डॉक्टर (Crop Doctor)",
        badge: "फोटो काढा",
        desc: "आजारी पानाचा फोटो काढून रोग ओळखा आणि योग्य औषध व प्रमाण जाणून घ्या.",
        cta: "तपासणी सुरू करा →",
      },
      mandi: {
        title: "2. आजचे बाजार भाव",
        badge: "Live AGMARKNET",
        desc: "जवळच्या बाजार समितीतील सोयाबीन, कापूस, हरभरा आणि इतर पिकांचे ताजे दर पहा.",
        cta: "भाव पहा →",
      },
      weather: {
        title: "3. हवामान व पाऊस",
        badge: "3 दिवसांचा अंदाज",
        desc: "पाऊस कधी येईल आणि कीटकनाशक फवारणीसाठी योग्य वेळ कोणती ते जाणून घ्या.",
        cta: "हवामान पहा →",
      },
      machinery: {
        title: "4. ट्रॅक्टर व अवजारे",
        badge: "भाडे व खरेदी",
        desc: "ट्रॅक्टर, रोटाव्हेटर आणि हार्वेस्टर भाड्याने घ्या. थेट मालकांशी संपर्क साधा.",
        cta: "अवजारे शोधा →",
      },
      agrilabour: {
        title: "5. शेतमजूर (AgriLabour)",
        badge: "मजूर शोधा",
        desc: "कापणी, खुरपणी आणि फवारणीसाठी कुशल शेतमजूर शोधा किंवा नोंदणी करा.",
        cta: "मजूर पहा →",
      },
      aiAdvisor: {
        title: "6. AI कृषी सल्लागार",
        badge: "24x7 सेवा",
        desc: "खतांचे प्रमाण, बीज प्रक्रिया आणि शेतीविषयक कोणताही प्रश्न विचारा.",
        cta: "सल्ला घ्या →",
      },
    },
    advisory: {
      title: "आजचा कृषी सल्ला",
      source: "IMD व कृषी विभागाद्वारे",
      weatherStatusTitle: "फवारणीसाठी स्थिती: अनुकूल",
      weatherStatusDesc: "आज जोरदार पावसाची शक्यता नाही. सकाळी 10 पूर्वी किंवा संध्याकाळी 4 नंतर फवारणी करा.",
      mandiTipTitle: "बाजार भाव सल्ला",
      mandiTipDesc: "माल विकण्यापूर्वी जवळच्या किमान 2 बाजार समित्यांमधील भाव नक्की तपासा.",
    },
    whatsapp: {
      title: "फोन वापरताना काही अडचण येत आहे का?",
      desc: "आमच्या WhatsApp वर थेट संपर्क साधा. पानाचा फोटो किंवा व्हॉईस मेसेज पाठवा.",
      cta: "WhatsApp वर विचारा →",
      messageText: "नमस्कार KisaanBuddy! मला शेतीविषयक माहिती हवी आहे.",
    },
    howItWorks: {
      heading: "KisaanBuddy वापरणे अतिशय सोपे आहे:",
      step1Title: "1. बोला",
      step1Desc: "माइक बटण दाबा आणि पिकाबद्दल किंवा बाजार भावाबद्दल बोलून विचारा.",
      step2Title: "2. फोटो पाठवा",
      step2Desc: "पिकावर रोग असल्यास, पानाचा फोटो काढून योग्य औषध जाणून घ्या.",
      step3Title: "3. उपाय मिळवा",
      step3Desc: "शासकीय प्रमाणित बाजार भाव, हवामान अंदाज आणि सल्ला स्क्रीनवर पहा.",
      footerNote: "✓ शेतकऱ्यांसाठी 100% मोफत • ✓ कोणतेही ॲप डाउनलोड करण्याची गरज नाही • ✓ शासकीय AGMARKNET & IMD प्रमाणित",
    },
  },

  gu: {
    liveBar: {
      officialData: "સરકારી AGMARKNET બજાર ભાવ • IMD હવામાન",
      yourRegion: "તમારો વિસ્તાર",
    },
    voiceCard: {
      badge: "🎙️ ખેડૂત વૉઇસ સહાયક (બોલીને પૂછો)",
      greeting: "નમસ્તે ખેડૂત મિત્ર! આજે ખેતીમાં શું મદદ જોઈએ છે?",
      subtitle: "ટાઈપ કરવાની જરૂર નથી — ફક્ત નીચેનું લીલું માઈક બટન દબાવો અને બોલીને પ્રશ્ન પૂછો.",
      voiceBtn: "બોલો / Speak",
      faqPromptHeading: "ખેડૂતો વારંવાર આ પ્રશ્નો પૂછે છે (ટેપ કરો):",
      prompts: [
        { text: "કપાસ અને મગફળીનો આજનો બજાર ભાવ શું છે?", icon: "🌾" },
        { text: "જીરામાં ચરમી રોગ માટે કઈ દવા છાંટવી?", icon: "🍃" },
        { text: "શું આજે વરસાદ પડશે? દવા છાંટવી યોગ્ય છે?", icon: "🌧️" },
        { text: "લણણી માટે મજૂરો ક્યાં મળશે?", icon: "👥" },
      ],
    },
    cardsHeading: "સીધો ઉપયોગ કરો (સેવા પસંદ કરો)",
    cardsSubheading: "એક ક્લિકમાં સેવા શરૂ કરો",
    cards: {
      cropDoctor: {
        title: "1. પાક ડૉક્ટર (Crop Doctor)",
        badge: "ફોટો પાડો",
        desc: "રોગિષ્ઠ પાનનો ફોટો પાડી રોગ ઓળખો અને યોગ્ય દવા તથા પ્રમાણ જાણો.",
        cta: "તપાસ શરૂ કરો →",
      },
      mandi: {
        title: "2. આજના બજાર ભાવ",
        badge: "Live AGMARKNET",
        desc: "નજીકના માર્કેટ યાર્ડના કપાસ, મગફળી, ઘઉંના તાજા ભાવ જુઓ.",
        cta: "ભાવ જુઓ →",
      },
      weather: {
        title: "3. હવામાન અને વરસાદ",
        badge: "3 દિવસની આગાહી",
        desc: "વરસાદ ક્યારે પડશે અને જંતુનાશક દવાનો છંટકાવ કરવાનો યોગ્ય સમય જાણો.",
        cta: "હવામાન જુઓ →",
      },
      machinery: {
        title: "4. ટ્રેક્ટર અને ઓજારો",
        badge: "ભાડે અને ખરીદી",
        desc: "ટ્રેક્ટર, રોટાવેટર અને થ્રેશર ભાડે મેળવો. સીધા માલિક સાથે વાત કરો.",
        cta: "ઓજારો શોધો →",
      },
      agrilabour: {
        title: "5. ખેત મજૂર (AgriLabour)",
        badge: "મજૂરો શોધો",
        desc: "વાવણી, નિંદામણ અને લણણી માટે અનુભવી ખેત મજૂરો મેળવો.",
        cta: "મજૂરો જુઓ →",
      },
      aiAdvisor: {
        title: "6. AI કૃષિ સલાહકાર",
        badge: "24x7 સેવા",
        desc: "ખાતરનું પ્રમાણ, બીજ માવજત અને ખેતી સંબંધિત કોઈપણ પ્રશ્ન પૂછો.",
        cta: "સલાહ મેળવો →",
      },
    },
    advisory: {
      title: "આજની ખેતી સલાહ",
      source: "IMD અને કૃષિ વિભાગ દ્વારા",
      weatherStatusTitle: "દવા છંટકાવ માટે: અનુકૂળ",
      weatherStatusDesc: "આજે ભારે વરસાદની શક્યતા નથી. સવારે 10 વાગ્યા પહેલા અથવા સાંજે 4 પછી દવા છાંટો.",
      mandiTipTitle: "બજાર ભાવ સલાહ",
      mandiTipDesc: "માલ વેચતા પહેલા નજીકના 2 માર્કેટ યાર્ડના ભાવ જરૂર સરખાવો.",
    },
    whatsapp: {
      title: "ફોન વાપરવામાં કોઈ તકલીફ થાય છે?",
      desc: "અમારા WhatsApp પર સીધા સંપર્ક કરો. પાનનો ફોટો અથવા વૉઇસ મેસેજ મોકલો.",
      cta: "WhatsApp પર પૂછો →",
      messageText: "નમસ્તે KisaanBuddy! મને ખેતી સંબંધિત માહિતી જોઈએ છે.",
    },
    howItWorks: {
      heading: "KisaanBuddy વાપરવું ખૂબ સરળ છે:",
      step1Title: "1. બોલો",
      step1Desc: "માઈક બટન દબાવો અને પાક કે બજાર ભાવ વિશે બોલીને પૂછો.",
      step2Title: "2. ફોટો મોકલો",
      step2Desc: "જો પાકમાં રોગ હોય તો પાનનો ફોટો પાડીને સાચી દવા જાણો.",
      step3Title: "3. ઉકેલ મેળવો",
      step3Desc: "સરકારી પ્રમાણિત ભાવ અને હવામાન અપડેટ સ્ક્રીન પર જુઓ.",
      footerNote: "✓ ખેડૂતો માટે 100% મફત • ✓ કોઈ એપ ડાઉનલોડ કરવાની જરૂર નથી • ✓ સરકારી AGMARKNET & IMD પ્રમાણિત",
    },
  },

  ta: {
    liveBar: {
      officialData: "அரசு AGMARKNET மண்டி விலைகள் • IMD வானிலை",
      yourRegion: "உங்கள் பண்ணை பகுதி",
    },
    voiceCard: {
      badge: "🎙️ விவசாயி குரல் உதவியாளர் (பேசி கேளுங்கள்)",
      greeting: "வணக்கம் உழவர் தோழரே! இன்று உங்கள் விவசாயத்திற்கு என்ன உதவி தேவை?",
      subtitle: "டைப் செய்ய தேவையில்லை — கீழே உள்ள பச்சை மைக் பொத்தானை அழுத்தி உங்கள் மொழியில் பேசி கேளுங்கள்.",
      voiceBtn: "பேசுங்கள் / Speak",
      faqPromptHeading: "விவசாயிகள் அடிக்கடி கேட்கும் கேள்விகள் (தட்டவும்):",
      prompts: [
        { text: "இன்றைய நெல் மற்றும் பருத்தி மண்டி விலை என்ன?", icon: "🌾" },
        { text: "தக்காளி இலை கருகல் நோய்க்கு என்ன மருந்து தெளிக்க வேண்டும்?", icon: "🍃" },
        { text: "இன்று மழை பெய்யுமா? பூச்சிக்கொல்லி தெளிக்கலாமா?", icon: "🌧️" },
        { text: "அறுவடைக்கு கூலி ஆட்கள் எங்கு கிடைப்பார்கள்?", icon: "👥" },
      ],
    },
    cardsHeading: "நேரடி சேவைகள் (Service தேர்ந்தெடுக்கவும்)",
    cardsSubheading: "ஒரே தட்டலில் சேவையை தொடங்கவும்",
    cards: {
      cropDoctor: {
        title: "1. பயிர் மருத்துவர் (Crop Doctor)",
        badge: "படம் எடுக்கவும்",
        desc: "நோயுற்ற இலையை புகைப்படம் எடுத்து நோய் மற்றும் சரியான மருந்து அளவை அறியவும்.",
        cta: "பரிசோதிக்கவும் →",
      },
      mandi: {
        title: "2. இன்றைய மண்டி விலைகள்",
        badge: "Live AGMARKNET",
        desc: "அருகிலுள்ள ஒழுங்குமுறை விற்பனைக்கூடங்களின் நெல், மக்காச்சோள விலைகளை பார்க்கவும்.",
        cta: "விலைகளை பார்க்க →",
      },
      weather: {
        title: "3. வானிலை & மழை நிலவரம்",
        badge: "3 நாள் நிலவரம்",
        desc: "மழை எப்போது பெய்யும் மற்றும் மருந்து தெளிக்க சரியான நேரத்தை அறியவும்.",
        cta: "வானிலை பார்க்க →",
      },
      machinery: {
        title: "4. டிராக்டர் & இயந்திரங்கள்",
        badge: "வாடகை & விற்பனை",
        desc: "டிராக்டர், ரோட்டவேட்டர் வாடகைக்கு பெறவும். நேரடியாக உரிமையாளரிடம் பேசவும்.",
        cta: "இயந்திரங்களை தேட →",
      },
      agrilabour: {
        title: "5. விவசாய கூலி ஆட்கள்",
        badge: "ஆட்கள் தேட",
        desc: "நடவு, களையெடுப்பு மற்றும் அறுவடைக்கு அனுபவமிக்க கூலி தொழிலாளர்களை கண்டறியவும்.",
        cta: "ஆட்களை பார்க்க →",
      },
      aiAdvisor: {
        title: "6. AI விவசாய ஆலோசகர்",
        badge: "24x7 சேவை",
        desc: "உர மேலாண்மை, விதை நேர்த்தி மற்றும் விவசாயம் சார்ந்த சந்தேகங்களை கேளுங்கள்.",
        cta: "ஆலோசனை பெற →",
      },
    },
    advisory: {
      title: "இன்றைய விவசாய ஆலோசனை",
      source: "IMD & வேளாண்மை துறை தகவல்",
      weatherStatusTitle: "மருந்து தெளிப்பு: சாதகமானது",
      weatherStatusDesc: "இன்று பலத்த மழைக்கு வாய்ப்பில்லை. காலை 10 மணிக்குள் அல்லது மாலை 4 மணிக்கு மேல் தெளிக்கவும்.",
      mandiTipTitle: "மண்டி விற்பனை குறிப்பு",
      mandiTipDesc: "பயிர்களை விற்பனை செய்வதற்கு முன் 2 அருகிலுள்ள சந்தை விலைகளை ஒப்பிடவும்.",
    },
    whatsapp: {
      title: "போன் பயன்படுத்த சிரமமாக உள்ளதா?",
      desc: "எங்கள் WhatsApp மூலம் நேரடியாக தொடர்பு கொள்ளவும். இலை படம் அல்லது குரல் செய்தி அனுப்பவும்.",
      cta: "WhatsApp-ல் கேட்க →",
      messageText: "வணக்கம் KisaanBuddy! எனக்கு விவசாயம் சார்ந்த தகவல் தேவை.",
    },
    howItWorks: {
      heading: "KisaanBuddy பயன்படுத்துவது மிகவும் எளிது:",
      step1Title: "1. பேசுங்கள்",
      step1Desc: "மைக் பொத்தானை அழுத்தி பயிர் அல்லது மண்டி விலை பற்றி பேசி கேளுங்கள்.",
      step2Title: "2. படம் அனுப்பவும்",
      step2Desc: "பயிரில் நோய் இருந்தால் இலையின் படத்தை அனுப்பி மருந்து அறியவும்.",
      step3Title: "3. தீர்வு பெறவும்",
      step3Desc: "அரசு சான்றளிக்கப்பட்ட விலை மற்றும் வானிலை எச்சரிக்கைகளை திரையில் பார்க்கவும்.",
      footerNote: "✓ விவசாயிகளுக்கு 100% இலவசம் • ✓ ஆப் பதிவிறக்கம் தேவையில்லை • ✓ அரசு AGMARKNET & IMD சான்றளிக்கப்பட்டது",
    },
  },

  te: {
    liveBar: {
      officialData: "ప్రభుత్వ AGMARKNET మార్కెట్ ధరలు • IMD వాతావరణం",
      yourRegion: "మీ వ్యవసాయ ప్రాంతం",
    },
    voiceCard: {
      badge: "🎙️ రైతు వాయిస్ అసిస్టెంట్ (మాట్లాడి అడగండి)",
      greeting: "నమస్కారం రైతు మిత్రమా! ఈరోజు మీ వ్యవసాయానికి ఏ సహాయం కావాలి?",
      subtitle: "టైప్ చేయాల్సిన అవసరం లేదు — కింద ఉన్న ఆకుపచ్చ మైక్ బటన్ నొక్కి మీ భాషలో మాట్లాడి అడగండి.",
      voiceBtn: "మాట్లాడండి / Speak",
      faqPromptHeading: "రైతులు తరచుగా అడిగే ప్రశ్నలు (ట్యాప్ చేయండి):",
      prompts: [
        { text: "ఈరోజు వరి మరియు పత్తి మార్కెట్ ధర ఎంత?", icon: "🌾" },
        { text: "మిరప ఆకు ముడత తెగులుకు ఏ మందు పిచికారీ చేయాలి?", icon: "🍃" },
        { text: "ఈరోజు వర్షం పడుతుందా? మందు పిచికారీ చేయవచ్చా?", icon: "🌧️" },
        { text: "కోత కోయడానికి కూలీలు ఎక్కడ దొరుకుతారు?", icon: "👥" },
      ],
    },
    cardsHeading: "నేరుగా ఉపయోగించండి (Service ఎంచుకోండి)",
    cardsSubheading: "ఒకే క్లిక్‌తో సేవ ప్రారంభించండి",
    cards: {
      cropDoctor: {
        title: "1. పంట డాక్టర్ (Crop Doctor)",
        badge: "ఫోటో తీయండి",
        desc: "తెగులు సోకిన ఆకు ఫోటో తీసి వ్యాధిని గుర్తించి సరైన మందు మోతాదు తెలుసుకోండి.",
        cta: "పరీక్ష ప్రారంభించండి →",
      },
      mandi: {
        title: "2. నేటి మార్కెట్ ధరలు",
        badge: "Live AGMARKNET",
        desc: "సమీప మార్కెట్లలో వరి, పత్తి, మిర్చి, మొక్కజొన్న తాజా ధరలు చూడండి.",
        cta: "ధరలు చూడండి →",
      },
      weather: {
        title: "3. వాతావరణం & వర్షం",
        badge: "3 రోజుల అంచనా",
        desc: "వర్షం ఎప్పుడు పడుతుంది మరియు పురుగుమందులు పిచికారీ చేయడానికి సరైన సమయం తెలుసుకోండి.",
        cta: "వాతావరణం చూడండి →",
      },
      machinery: {
        title: "4. ట్రాక్టర్ & యంత్రాలు",
        badge: "అద్దె & కొనుగోలు",
        desc: "ట్రాక్టర్, రోటవేటర్, హార్వెస్టర్ అద్దెకు తీసుకోండి. యజమానులతో నేరుగా మాట్లాడండి.",
        cta: "యంత్రాలను వెతకండి →",
      },
      agrilabour: {
        title: "5. వ్యవసాయ కూలీలు (AgriLabour)",
        badge: "కూలీలను వెతకండి",
        desc: "నాట్లు, కలుపు తీత మరియు కోతల కోసం అనుభవజ్ఞులైన కూలీలను సంప్రదించండి.",
        cta: "కూలీలను చూడండి →",
      },
      aiAdvisor: {
        title: "6. AI వ్యవసాయ సలహాదారు",
        badge: "24x7 సేవ",
        desc: "ఎరువుల మోతాదు, విత్తన శుద్ధి మరియు వ్యవసాయ సందేహాలను అడగండి.",
        cta: "సలహా పొందండి →",
      },
    },
    advisory: {
      title: "నేటి వ్యవసాయ సలహా",
      source: "IMD & వ్యవసాయ శాఖ సమాచారం",
      weatherStatusTitle: "మందు పిచికారీకి: అనుకూలం",
      weatherStatusDesc: "ఈరోజు భారీ వర్ష సూచన లేదు. ఉదయం 10 గంటల లోపు లేదా సాయంత్రం 4 తర్వాత పిచికారీ చేయండి.",
      mandiTipTitle: "మార్కెట్ అమ్మకపు సూచన",
      mandiTipDesc: "పంట అమ్మే ముందు సమీపంలోని కనీసం 2 మార్కెట్లలో ధరలను సరిపోల్చండి.",
    },
    whatsapp: {
      title: "ఫోన్ వాడటం కష్టంగా ఉందా?",
      desc: "మా WhatsApp లో నేరుగా సంప్రదించండి. ఆకు ఫోటో లేదా వాయిస్ మెసేజ్ పంపండి.",
      cta: "WhatsApp లో అడగండి →",
      messageText: "నమస్కారం KisaanBuddy! నాకు వ్యవసాయ సమాచారం కావాలి.",
    },
    howItWorks: {
      heading: "KisaanBuddy ఉపయోగించడం చాలా సులభం:",
      step1Title: "1. మాట్లాడండి",
      step1Desc: "మైక్ బటన్ నొక్కి పంట లేదా మార్కెట్ ధరల గురించి మాట్లాడి అడగండి.",
      step2Title: "2. ఫోటో పంపండి",
      step2Desc: "పంటకు తెగులు సోకితే ఆకు ఫోటో తీసి సరైన మందు వివరాలు తెలుసుకోండి.",
      step3Title: "3. పరిష్కారం పొందండి",
      step3Desc: "ప్రభుత్వ ధృవీకరించిన ధరలు మరియు వాతావరణ హెచ్చరికలను స్క్రీన్‌పై చూడండి.",
      footerNote: "✓ రైతులకు 100% ఉచితం • ✓ యాప్ డౌన్‌లోడ్ అవసరం లేదు • ✓ ప్రభుత్వ AGMARKNET & IMD ధృవీకృతం",
    },
  },

  bn: {
    liveBar: {
      officialData: "সরকারি AGMARKNET মান্ডি দর • IMD আবহাওয়া",
      yourRegion: "আপনার অঞ্চল",
    },
    voiceCard: {
      badge: "🎙️ কৃষক ভয়েস সহকারী (মুখে বলে জিজ্ঞাসা করুন)",
      greeting: "নমস্কার কৃষক ভাই! আজ আপনার কৃষিকাজে কী সাহায্য লাগবে?",
      subtitle: "টাইপ করার কোনো প্রয়োজন নেই — নিচের সবুজ মাইক বোতাম টিপুন এবং নিজের ভাষায় মুখে বলে জিজ্ঞাসা করুন।",
      voiceBtn: "বলুন / Speak",
      faqPromptHeading: "কৃষকরা প্রায়শই এই প্রশ্নগুলি করেন (ট্যাপ করুন):",
      prompts: [
        { text: "আজকের ধান এবং পাটের মান্ডি দর কত?", icon: "🌾" },
        { text: "আলু বা টমেটোর পাতায় দাগ হলে কী ওষুধ দেব?", icon: "🍃" },
        { text: "আজ কি বৃষ্টি হবে? কীটনাশক স্প্রে করা যাবে?", icon: "🌧️" },
        { text: "ফসল কাটার জন্য মজুর কোথায় পাব?", icon: "👥" },
      ],
    },
    cardsHeading: "সরাসরি ব্যবহার করুন (সার্ভিস বাছুন)",
    cardsSubheading: "এক ক্লিকে পরিষেবা শুরু করুন",
    cards: {
      cropDoctor: {
        title: "1. ফসল ডাক্তার (Crop Doctor)",
        badge: "ছবি তুলুন",
        desc: "আক্রান্ত পাতার ছবি তুলে রোগ শনাক্ত করুন এবং সঠিক ওষুধের পরিমাণ জানুন।",
        cta: "পরীক্ষা শুরু করুন →",
      },
      mandi: {
        title: "2. আজকের মান্ডি দর",
        badge: "Live AGMARKNET",
        desc: "কাছের মান্ডির ধান, পাট, সরিষা ও সবজির তাজা দর দেখুন।",
        cta: "দর দেখুন →",
      },
      weather: {
        title: "3. আবহাওয়া ও বৃষ্টি",
        badge: "3 দিনের পূর্বাভাস",
        desc: "বৃষ্টি কখন হবে এবং ওষুধ স্প্রে করার সঠিক সময় জেনে নিন।",
        cta: "আবহাওয়া দেখুন →",
      },
      machinery: {
        title: "4. ট্রাক্টর ও যন্ত্রপাতি",
        badge: "ভাড়া ও ক্রয়",
        desc: "ট্রাক্টর, রোটাভেটর ও হারভেস্টার ভাড়া নিন। সরাসরি মালিকের সাথে কথা বলুন।",
        cta: "যন্ত্রপাতি খুঁজুন →",
      },
      agrilabour: {
        title: "5. খেতমজুর (AgriLabour)",
        badge: "মজুর খুঁজুন",
        desc: "ফসল কাটা, রোপণ ও স্প্রে করার জন্য অভিজ্ঞ খেতমজুর খুঁজুন।",
        cta: "মজুর দেখুন →",
      },
      aiAdvisor: {
        title: "6. AI কৃষি উপদেষ্টা",
        badge: "24x7 সেবা",
        desc: "সারের পরিমাণ, বীজ শোধন ও কৃষিকাজের যেকোনো প্রশ্ন জিজ্ঞাসা করুন।",
        cta: "পরামর্শ নিন →",
      },
    },
    advisory: {
      title: "আজকের কৃষিকাজের পরামর্শ",
      source: "IMD ও কৃষি দপ্তর সূত্রে",
      weatherStatusTitle: "স্প্রে করার পরিস্থিতি: অনুকূল",
      weatherStatusDesc: "আজ ভারী বৃষ্টির সম্ভাবনা নেই। সকাল ১০টার আগে বা বিকেল ৪টের পর স্প্রে করুন।",
      mandiTipTitle: "মান্ডি বিক্রির পরামর্শ",
      mandiTipDesc: "ফসল বিক্রির আগে অন্তত ২টি কাছের মান্ডির দর মিলিয়ে নিন।",
    },
    whatsapp: {
      title: "ফোন ব্যবহার করতে অসুবিধা হচ্ছে?",
      desc: "আমাদের WhatsApp-এ সরাসরি যোগাযোগ করুন। পাতার ছবি বা ভয়েস মেসেজ পাঠান।",
      cta: "WhatsApp-এ জিজ্ঞাসা করুন →",
      messageText: "নমস্কার KisaanBuddy! আমার কৃষিকাজ সংক্রান্ত তথ্য প্রয়োজন।",
    },
    howItWorks: {
      heading: "KisaanBuddy ব্যবহার করা খুব সহজ:",
      step1Title: "1. মুখে বলুন",
      step1Desc: "মাইক বোতাম টিপুন এবং ফসল বা মান্ডি দর সম্পর্কে মুখে বলে জিজ্ঞাসা করুন।",
      step2Title: "2. ছবি পাঠান",
      step2Desc: "ফসলে রোগ থাকলে পাতার ছবি তুলে সঠিক ওষুধ জানুন।",
      step3Title: "3. সমাধান পান",
      step3Desc: "সরকারি যাচাইকৃত দর ও আবহাওয়া সতর্কতা সরাসরি স্ক্রিনে দেখুন।",
      footerNote: "✓ কৃষকদের জন্য ১০০% বিনামূল্যে • ✓ কোনো অ্যাপ ডাউনলোডের প্রয়োজন নেই • ✓ সরকারি AGMARKNET & IMD যাচাইকৃত",
    },
  },

  ml: {
    liveBar: {
      officialData: "ഔദ്യോഗിക AGMARKNET മാർക്കറ്റ് നിരക്കുകൾ • IMD കാലാവസ്ഥ",
      yourRegion: "നിങ്ങളുടെ പ്രദേശം",
    },
    voiceCard: {
      badge: "🎙️ കർഷക വോയ്‌സ് അസിസ്റ്റന്റ് (സംസാരിച്ച് ചോദിക്കൂ)",
      greeting: "നമസ്കാരം കർഷക സുഹൃത്തേ! ഇന്ന് നിങ്ങളുടെ കൃഷിക്ക് എന്ത് സഹായമാണ് വേണ്ടത്?",
      subtitle: "ടൈപ്പ് ചെയ്യേണ്ടതില്ല — താഴെയുള്ള പച്ച മൈക്ക് ബട്ടൺ അമർത്തി നിങ്ങളുടെ ഭാഷയിൽ സംസാരിച്ച് ചോദിക്കൂ.",
      voiceBtn: "സംസാരിക്കൂ / Speak",
      faqPromptHeading: "കർഷകർ സാധാരണ ചോദിക്കുന്ന ചോദ്യങ്ങൾ (ടാപ്പ് ചെയ്യുക):",
      prompts: [
        { text: "ഇന്നത്തെ നെല്ല്, നാളികേരം വിപണി വില എത്രയാണ്?", icon: "🌾" },
        { text: "ഇല മഞ്ഞളിക്കുന്ന രോഗത്തിന് എന്ത് മരുന്ന് തളിക്കണം?", icon: "🍃" },
        { text: "ഇന്ന് മഴ പെയ്യുമോ? കീടനാശിനി തളിക്കാമോ?", icon: "🌧️" },
        { text: "വിളവെടുപ്പിന് തൊഴിലാളികളെ എവിടെ ലഭിക്കും?", icon: "👥" },
      ],
    },
    cardsHeading: "നേരിട്ട് ഉപയോഗിക്കുക (Service തിരഞ്ഞെടുക്കുക)",
    cardsSubheading: "ഒറ്റ ക്ലിക്കിൽ സേവനം ആരംഭിക്കുക",
    cards: {
      cropDoctor: {
        title: "1. വിള ഡോക്ടർ (Crop Doctor)",
        badge: "ഫോട്ടോ എടുക്കൂ",
        desc: "രോഗം ബാധിച്ച ഇലയുടെ ഫോട്ടോ എടുത്ത് രോഗവും കൃത്യമായ മരുന്നിന്റെ അളവും അറിയുക.",
        cta: "പരിശോധന തുടങ്ങൂ →",
      },
      mandi: {
        title: "2. ഇന്നത്തെ വിപണി വില",
        badge: "Live AGMARKNET",
        desc: "അടുത്തുള്ള മാർക്കറ്റുകളിലെ നെല്ല്, കുരുമുളക്, പച്ചക്കറി നിരക്കുകൾ കാണുക.",
        cta: "വില പരിശോധിക്കൂ →",
      },
      weather: {
        title: "3. കാലാവസ്ഥ & മഴ മുന്നറിയിപ്പ്",
        badge: "3 ദിവസത്തെ പ്രവചനം",
        desc: "മഴ എപ്പോൾ പെയ്യുമെന്നും മരുന്ന് തളിക്കാൻ അനുയോജ്യമായ സമയവും അറിയുക.",
        cta: "കാലാവസ്ഥ കാണൂ →",
      },
      machinery: {
        title: "4. ട്രാക്ടർ & ഉപകരണങ്ങൾ",
        badge: "വാടകയ്ക്കും വിൽപ്പനയ്ക്കും",
        desc: "ട്രാക്ടർ, റോട്ടവേറ്റർ വാടകയ്ക്ക് എടുക്കുക. ഉടമസ്ഥരുമായി നേരിട്ട് സംസാരിക്കുക.",
        cta: "ഉപകരണങ്ങൾ തിരയൂ →",
      },
      agrilabour: {
        title: "5. കൃഷി തൊഴിലാളികൾ (AgriLabour)",
        badge: "തൊഴിലാളികളെ കണ്ടെത്തൂ",
        desc: "ഞാറുനടീൽ, വിളവെടുപ്പ് എന്നിവയ്ക്കായി പരിചയസമ്പന്നരായ തൊഴിലാളികളെ കണ്ടെത്തുക.",
        cta: "തൊഴിലാളികളെ കാണൂ →",
      },
      aiAdvisor: {
        title: "6. AI കാർഷിക ഉപദേശകൻ",
        badge: "24x7 സേവനം",
        desc: "വളപ്രయోగം, വിത്ത് സംസ്കരണം എന്നിവയെക്കുറിച്ചുള്ള ചോദ്യങ്ങൾ ചോദിക്കുക.",
        cta: "ഉപദേശം തേടൂ →",
      },
    },
    advisory: {
      title: "ഇന്നത്തെ കാർഷിക നിർദ്ദേശം",
      source: "IMD & കൃഷി വകുപ്പ് റിപ്പോർട്ട്",
      weatherStatusTitle: "മരുന്ന് തളിക്കാൻ: അനുയോജ്യമായ സമയം",
      weatherStatusDesc: "ഇന്ന് ശക്തമായ മഴയ്ക്ക് സാധ്യതയില്ല. രാവിലെ 10 മണിക്ക് മുൻപോ വൈകുന്നേരം 4 ന് ശേഷമോ മരുന്ന് തളിക്കുക.",
      mandiTipTitle: "വിപണി വിൽപ്പന നിർദ്ദേശം",
      mandiTipDesc: "വിളകൾ വിൽക്കുന്നതിന് മുൻപ് അടുത്തുള്ള 2 മാർക്കറ്റുകളിലെ നിരക്കുകൾ താരതമ്യം ചെയ്യുക.",
    },
    whatsapp: {
      title: "ഫോൺ ഉപയോഗിക്കാൻ ബുദ്ധിമുട്ടുണ്ടോ?",
      desc: "ഞങ്ങളുടെ WhatsApp ലേക്ക് നേരിട്ട് ബന്ധപ്പെടുക. ഇലയുടെ ഫോട്ടോയോ വോയ്‌സ് മെസ്സേജോ അയക്കൂ.",
      cta: "WhatsApp-ൽ ചോദിക്കൂ →",
      messageText: "നമസ്കാരം KisaanBuddy! എനിക്ക് കൃഷിയുമായി ബന്ധപ്പെട്ട വിവരം വേണം.",
    },
    howItWorks: {
      heading: "KisaanBuddy ഉപയോഗിക്കാൻ വളരെ എളുപ്പമാണ്:",
      step1Title: "1. സംസാരിക്കൂ",
      step1Desc: "മൈക്ക് ബട്ടൺ അമർത്തി നിങ്ങളുടെ വിളയെക്കുറിച്ചോ മാർക്കറ്റ് നിരക്കിനെക്കുറിച്ചോ സംസാരിക്കൂ.",
      step2Title: "2. ഫോട്ടോ അയക്കൂ",
      step2Desc: "വിളയ്ക്ക് രോഗമുണ്ടെങ്കിൽ ഇലയുടെ ഫോട്ടോ എടുത്ത് ശരിയായ മരുന്ന് അറിയുക.",
      step3Title: "3. പരിഹാരം നേടൂ",
      step3Desc: "ഔദ്യോഗിക നിരക്കുകളും കാലാവസ്ഥ മുന്നറിയിപ്പുകളും സ്ക്രീനിൽ നേരിട്ട് കാണുക.",
      footerNote: "✓ കർഷകർക്ക് 100% സൗജന്യം • ✓ ആപ്പ് ഡൗൺലോഡ് ചെയ്യേണ്ടതില്ല • ✓ സർക്കാർ AGMARKNET & IMD അംഗീകൃതം",
    },
  },
};
