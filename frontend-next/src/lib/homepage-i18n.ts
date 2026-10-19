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
      badge: "AGRICULTURAL COMMERCE & INTELLIGENCE",
      title: "Your Farm. Your Market. Better Opportunities.",
      subtitle: "Discover mandi prices, connect with buyers, sell your produce and access the agricultural services you need — all in one place.",
      ctaMandi: "Explore Mandi Prices",
      ctaSell: "Sell Your Produce",
      ctaBuyers: "Find Verified Buyers",
      ctaWorkers: "Hire Workers & Find Jobs",
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
      sourceLabel: "Official Data Source: Directorate of Marketing & Inspection (DMI) / e-NAM",
      viewAllMandi: "View Full Mandi Intelligence (1000+ Markets)",
      noResults: "No mandi records matching your current filter.",
      noResultsDesc: "Try selecting All States or searching for a broader commodity name.",
      disclaimer: "Mandi prices represent reported daily wholesale arrivals and model trading rates at APMC yards. They serve as transparent market benchmarks and not individual purchase guarantees.",
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
      title: "Find Farm Workers. Find Farming Jobs.",
      subtitle: "Connect farmers who need agricultural labour with workers looking for farming opportunities.",
      cardWorkersTitle: "Hire Farm Workers & Harvesting Crews",
      cardWorkersDesc: "Find skilled labour groups, machine operators, and harvester teams for paddy transplantation (Ropai), weeding, spraying, and harvest.",
      cardWorkersCta: "Find Farm Workers",
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
      badge: "कृषि व्यापार व मंडी भाव मंच",
      title: "आपका खेत। आपका बाज़ार। बेहतर अवसर।",
      subtitle: "मंडी के सही भाव जानें, सीधे खरीदारों से जुड़ें, अपनी उपज बेचें और सभी आवश्यक कृषि सेवाएं एक ही मंच पर पाएं।",
      ctaMandi: "मंडी भाव देखें",
      ctaSell: "अपनी फसल बेचें",
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
      sourceLabel: "अधिकृत स्रोत: विपणन एवं निरीक्षण निदेशालय (DMI) / e-NAM",
      viewAllMandi: "संपूर्ण मंडी भाव देखें (1,000+ मंडियां)",
      noResults: "चयनित फिल्टर में कोई मंडी रिकॉर्ड नहीं मिला।",
      noResultsDesc: "कृपया 'सभी राज्य' चुनें या फसल का नाम दोबारा लिखकर खोजें।",
      disclaimer: "मंडी भाव APMC यार्ड में दैनिक थोक आवक और मॉडल दरों पर आधारित हैं। यह पारदर्शी बेंचमार्क हैं, किसी व्यक्तिगत खरीदार की गारंटी नहीं।",
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
      badge: "ಕೃಷಿ ವ್ಯಾಪಾರ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ವೇದಿಕೆ",
      title: "ನಿಮ್ಮ ಜಮೀನು. ನಿಮ್ಮ ಮಾರುಕಟ್ಟೆ. ಉತ್ತಮ ಅವಕಾಶಗಳು.",
      subtitle: "ಮಂಡಿ ದರಗಳನ್ನು ತಿಳಿಯಿರಿ, ಖರೀದಿದಾರರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕ ಸಾಧಿಸಿ, ನಿಮ್ಮ ಬೆಳೆ ಮಾರಾಟ ಮಾಡಿ ಮತ್ತು ಕೃಷಿ ಸೇವೆಗಳನ್ನು ಒಂದೇ ಸೂರಿನಡಿ ಪಡೆಯಿರಿ.",
      ctaMandi: "ಮಂಡಿ ದರಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
      ctaSell: "ನಿಮ್ಮ ಬೆಳೆ ಮಾರಾಟ ಮಾಡಿ",
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
      sourceLabel: "ಅಧಿಕೃತ ಮೂಲ: DMI / e-NAM",
      viewAllMandi: "ಸಂಪೂರ್ಣ ಮಂಡಿ ದರಗಳನ್ನು ವೀಕ್ಷಿಸಿ (1,000+ ಮಾರುಕಟ್ಟೆಗಳು)",
      noResults: "ಆಯ್ಕೆಮಾಡಿದ ಫಿಲ್ಟರ್‌ನಲ್ಲಿ ಯಾವುದೇ ಮಂಡಿ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
      noResultsDesc: "ದಯವಿಟ್ಟು 'ಎಲ್ಲಾ ರಾಜ್ಯಗಳು' ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಬೆಳೆಯ ಹೆಸರನ್ನು ಮತ್ತೆ ನಮೂದಿಸಿ.",
      disclaimer: "ಮಂಡಿ ದರಗಳು APMC ಯಾರ್ಡ್‌ಗಳಲ್ಲಿನ ದೈನಂದಿನ ಸಗಟು ವಹಿವಾಟುಗಳನ್ನು ಆಧರಿಸಿವೆ. ಇವು ಪಾರದರ್ಶಕ ಮಾರುಕಟ್ಟೆ ಬೆಂಚ್‌ಮಾರ್ಕ್‌ಗಳಾಗಿವೆ.",
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
