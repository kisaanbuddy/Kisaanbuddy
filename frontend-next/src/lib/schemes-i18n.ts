import { Lang } from "./language"

export interface SchemesDict {
  tag: string
  headingPrefix: string
  description: string
  searchPlaceholder: string
  allStates: string
  stateBihar: string
  stateUttarPradesh: string
  stateKarnataka: string
  stateMaharashtra: string
  criteriaMatched: (visible: number, total: number) => string
  fillParamsHint: string
  resetFilterBtn: string
  closeFilterBtn: string
  categoryGroupLabel: string
  showMatchingSchemesBtn: string
  matchingGrantsBadge: (c: number) => string
  acresLand: string
  groupSuffix: string
  centralScheme: string
  stateScheme: string
  verifiedToday: string
  applyBy: (lastDate: string) => string
  openAllYear: string
  // New Benefit Assistant labels
  findSchemesForFarm: string
  findSchemesSubtitle: string
  tabs: {
    find: string
    dashboard: string
    allSchemes: string
    saved: string
  }
  finder: {
    stateLabel: string
    districtLabel: string
    districtPlaceholder: string
    cropsLabel: string
    cropsPlaceholder: string
    landLabel: string
    landPlaceholder: string
    tenureLabel: string
    tenureOwner: string
    tenureTenant: string
    tenureSharecropper: string
    irrigationLabel: string
    irrigationYes: string
    irrigationNo: string
    categoryLabel: string
    categoryAny: string
    categoryGeneral: string
    categoryOBC: string
    categorySC: string
    categoryST: string
    categoryWomen: string
    activitiesLabel: string
    activitiesHint: string
    activityDrip: string
    activitySolar: string
    activityMachinery: string
    activityCredit: string
    activityInsurance: string
    activityOrganic: string
    activityPostHarvest: string
    saveProfileCheckbox: string
    evaluateBtn: string
    evaluatingBtn: string
  }
  results: {
    potentialMatch: string
    potentialMatchDesc: string
    moreInfoRequired: string
    moreInfoRequiredDesc: string
    notMatching: string
    notMatchingDesc: string
    disclaimer: string
    viewDetails: string
    prepareChecklist: string
    applyOfficial: string
    whyMatched: string
    missingConditions: string
  }
  dashboard: {
    recommendedTitle: string
    exploreByNeedTitle: string
    openApplicationsTitle: string
    upcomingWindowsTitle: string
    savedSchemesTitle: string
    officialSourcesTitle: string
  }
  detail: {
    overview: string
    publishedBenefits: string
    eligibilityCriteria: string
    requiredDocuments: string
    applicationSteps: string
    helpline: string
    faqs: string
    lastVerified: string
    officialPortalNotice: string
  }
  checklist: {
    title: string
    subtitle: string
    available: string
    pending: string
    needHelp: string
    privacyNotice: string
    saveReminder: string
  }
}

export const SCHEMES_I18N: Record<Lang, SchemesDict> = {
  en: {
    tag: "Farmer Benefits Assistant · Government Schemes",
    headingPrefix: "Government",
    description: "Personalized scheme discovery, eligibility evaluations, and application-preparation assistant for Indian farmers grounded in official gazettes.",
    searchPlaceholder: "Search scheme name, benefits, subsidy details...",
    allStates: "All States / Central",
    stateBihar: "Bihar",
    stateUttarPradesh: "Uttar Pradesh",
    stateKarnataka: "Karnataka",
    stateMaharashtra: "Maharashtra",
    criteriaMatched: (visible, total) => `${visible} of ${total} schemes matching your criteria`,
    fillParamsHint: "Fill farm parameters below to evaluate verified eligibility",
    resetFilterBtn: "Reset Filter",
    closeFilterBtn: "Close Filter",
    categoryGroupLabel: "Category / Group",
    showMatchingSchemesBtn: "Evaluate Matching Schemes",
    matchingGrantsBadge: (c) => `${c} Matching Grants`,
    acresLand: "acres land",
    groupSuffix: "group",
    centralScheme: "Central Scheme",
    stateScheme: "State Scheme",
    verifiedToday: "Verified: Official",
    applyBy: (lastDate) => `Apply by: ${lastDate}`,
    openAllYear: "Open All Year",
    findSchemesForFarm: "Find Schemes for My Farm",
    findSchemesSubtitle: "Answer a few questions about your farm to identify verified grants, subsidies, and credit schemes you qualify for.",
    tabs: {
      find: "Find for My Farm",
      dashboard: "Schemes Dashboard",
      allSchemes: "All Schemes",
      saved: "Saved & Checklist"
    },
    finder: {
      stateLabel: "Farm State",
      districtLabel: "District (Optional)",
      districtPlaceholder: "e.g. Patna, Meerut, Mandya",
      cropsLabel: "Crops Cultivated",
      cropsPlaceholder: "e.g. Paddy, Wheat, Cotton, Sugarcane",
      landLabel: "Landholding (Acres)",
      landPlaceholder: "e.g. 2.5",
      tenureLabel: "Land Tenure",
      tenureOwner: "Owner Cultivator",
      tenureTenant: "Tenant Farmer",
      tenureSharecropper: "Sharecropper",
      irrigationLabel: "Assured Irrigation Available?",
      irrigationYes: "Yes (Borewell/Canal/Pond)",
      irrigationNo: "No (Rainfed/Dryland)",
      categoryLabel: "Social / Farmer Category",
      categoryAny: "Any / Not Specified",
      categoryGeneral: "General",
      categoryOBC: "OBC",
      categorySC: "Scheduled Caste (SC)",
      categoryST: "Scheduled Tribe (ST)",
      categoryWomen: "Women Farmer",
      activitiesLabel: "Farming Activities & Investments Planned",
      activitiesHint: "Select all that apply to uncover targeted capital subsidies:",
      activityDrip: "Micro-Irrigation (Drip/Sprinkler)",
      activitySolar: "Solar Pump Installation",
      activityMachinery: "Farm Machinery / Tractor Implements",
      activityCredit: "Short-Term Crop Loan / KCC",
      activityInsurance: "Crop Insurance Policy",
      activityOrganic: "Organic / Natural Farming",
      activityPostHarvest: "Warehouse / Cold Storage / Mandi Trading",
      saveProfileCheckbox: "Save this farm profile to my account (Privacy conscious — only farm parameters stored)",
      evaluateBtn: "Find Eligible Schemes",
      evaluatingBtn: "Evaluating Official Rules..."
    },
    results: {
      potentialMatch: "Potential Match",
      potentialMatchDesc: "Your farm parameters satisfy published official criteria.",
      moreInfoRequired: "More Information Required",
      moreInfoRequiredDesc: "Preliminary criteria met; requires specific conditions (e.g. cluster size, water source, state DBT ID).",
      notMatching: "Appears Not to Match Published Criteria",
      notMatchingDesc: "One or more conditions (e.g. state jurisdiction, landholding limit, tenure) differ from published rules.",
      disclaimer: "Disclaimer: Eligibility classifications are indicative and grounded in published official government criteria. KisaanBuddy does not guarantee government approval or funds disbursement.",
      viewDetails: "View Details & Steps",
      prepareChecklist: "Prepare Document Checklist",
      applyOfficial: "Apply on Official Portal",
      whyMatched: "Official Rules Matched:",
      missingConditions: "Information or Conditions Needed:"
    },
    dashboard: {
      recommendedTitle: "Recommended for Your Farm",
      exploreByNeedTitle: "Explore Schemes by Need",
      openApplicationsTitle: "Currently Open Applications",
      upcomingWindowsTitle: "Upcoming Officially Announced Windows",
      savedSchemesTitle: "Saved Schemes & Reminders",
      officialSourcesTitle: "Verified Government Source Integrations"
    },
    detail: {
      overview: "Overview",
      publishedBenefits: "Published Benefits",
      eligibilityCriteria: "Official Eligibility Criteria",
      requiredDocuments: "Required Documents",
      applicationSteps: "Step-by-Step Application Guide",
      helpline: "Official Support & Helpline",
      faqs: "Frequently Asked Questions",
      lastVerified: "Last Verified Against Official Sources",
      officialPortalNotice: "Official Government Portal"
    },
    checklist: {
      title: "Document Preparation Checklist",
      subtitle: "Track your readiness before visiting a CSC or applying online. Mark each document as Available, Pending, or Need Help.",
      available: "Available",
      pending: "Pending",
      needHelp: "Need Help",
      privacyNotice: "Privacy Notice: KisaanBuddy never collects your Aadhaar number, bank credentials, or OTPs merely to create a preparation checklist.",
      saveReminder: "Set Application Deadline Reminder"
    }
  },
  hi: {
    tag: "किसान लाभ सहायक · सरकारी योजनाएं",
    headingPrefix: "सरकारी",
    description: "भारतीय किसानों के लिए सरकारी राजपत्रों पर आधारित व्यक्तिगत योजना खोज, पात्रता मूल्यांकन और आवेदन तैयारी सहायक।",
    searchPlaceholder: "योजना का नाम, लाभ या सब्सिडी विवरण खोजें...",
    allStates: "सभी राज्य / केंद्रीय",
    stateBihar: "बिहार",
    stateUttarPradesh: "उत्तर प्रदेश",
    stateKarnataka: "कर्नाटक",
    stateMaharashtra: "महाराष्ट्र",
    criteriaMatched: (visible, total) => `आपके मानदंडों से मेल खाने वाली ${total} में से ${visible} योजनाएं`,
    fillParamsHint: "सत्यापित पात्रता की जांच के लिए नीचे अपने खेत का विवरण भरें",
    resetFilterBtn: "फ़िल्टर रीसेट करें",
    closeFilterBtn: "फ़िल्टर बंद करें",
    categoryGroupLabel: "श्रेणी / वर्ग",
    showMatchingSchemesBtn: "पात्र योजनाएं खोजें",
    matchingGrantsBadge: (c) => `${c} उपयुक्त योजनाएं`,
    acresLand: "एकड़ भूमि",
    groupSuffix: "वर्ग",
    centralScheme: "केंद्र सरकार",
    stateScheme: "राज्य सरकार",
    verifiedToday: "सत्यापित: आधिकारिक",
    applyBy: (lastDate) => `अंतिम तिथि: ${lastDate}`,
    openAllYear: "पूरे वर्ष खुला है",
    findSchemesForFarm: "मेरे खेत के लिए योजनाएं खोजें",
    findSchemesSubtitle: "अपने खेत के बारे में कुछ सरल प्रश्नों के उत्तर दें और जानें कि आप किन अनुदानों, सब्सिडी और ऋण योजनाओं के पात्र हैं।",
    tabs: {
      find: "खेत के लिए खोजें",
      dashboard: "योजना डैशबोर्ड",
      allSchemes: "सभी योजनाएं",
      saved: "सेव और चेकलिस्ट"
    },
    finder: {
      stateLabel: "खेत का राज्य",
      districtLabel: "ज़िला (वैकल्पिक)",
      districtPlaceholder: "उदा. पटना, मेरठ, मांड्या",
      cropsLabel: "उगाई जाने वाली फसलें",
      cropsPlaceholder: "उदा. धान, गेहूँ, कपास, गन्ना",
      landLabel: "भूमि जोत (एकड़ में)",
      landPlaceholder: "उदा. 2.5",
      tenureLabel: "भूमि स्वामित्व प्रकार",
      tenureOwner: "स्वयं का मालिक",
      tenureTenant: "बटाईदार / किरायेदार",
      tenureSharecropper: "हिस्सेदार (शेयरक्रॉपर)",
      irrigationLabel: "क्या सुनिश्चित सिंचाई सुविधा उपलब्ध है?",
      irrigationYes: "हाँ (बोरवेल/नहर/तालाब)",
      irrigationNo: "नहीं (वर्षा आधारित/असिंचित)",
      categoryLabel: "सामाजिक / किसान वर्ग",
      categoryAny: "कोई भी / निर्दिष्ट नहीं",
      categoryGeneral: "सामान्य (General)",
      categoryOBC: "अन्य पिछड़ा वर्ग (OBC)",
      categorySC: "अनुसूचित जाति (SC)",
      categoryST: "अनुसूचित जनजाति (ST)",
      categoryWomen: "महिला किसान",
      activitiesLabel: "नियोजित कृषि गतिविधियां और निवेश",
      activitiesHint: "सब्सिडी खोजने के लिए लागू सभी विकल्प चुनें:",
      activityDrip: "सूक्ष्म सिंचाई (ड्रिप/स्प्रिंकलर)",
      activitySolar: "सोलर पंप स्थापना",
      activityMachinery: "कृषि यंत्र / ट्रैक्टर उपकरण",
      activityCredit: "अल्पकालिक फसल ऋण / केसीसी",
      activityInsurance: "फसल बीमा पॉलिसी",
      activityOrganic: "जैविक / प्राकृतिक खेती",
      activityPostHarvest: "गोदाम / कोल्ड स्टोरेज / मंडी व्यापार",
      saveProfileCheckbox: "इस प्रोफ़ाइल को सुरक्षित रूप से सेव करें",
      evaluateBtn: "पात्र योजनाएं खोजें",
      evaluatingBtn: "नियमों का मूल्यांकन हो रहा है..."
    },
    results: {
      potentialMatch: "संभावित रूप से पात्र (Potential Match)",
      potentialMatchDesc: "आपके खेत का विवरण प्रकाशित सरकारी मानदंडों को पूरा करता है।",
      moreInfoRequired: "अधिक जानकारी आवश्यक (More Info Required)",
      moreInfoRequiredDesc: "मूल मानदंड मिलते हैं; लेकिन कुछ अतिरिक्त सत्यापन आवश्यक हैं (उदा. समूह का आकार, पानी का स्रोत, राज्य डीबीटी आईडी)।",
      notMatching: "प्रकाशित मानदंडों से मेल नहीं खाता",
      notMatchingDesc: "एक या अधिक स्थितियां (उदा. राज्य, भूमि सीमा, पट्टा) आधिकारिक नियमों से अलग हैं।",
      disclaimer: "अस्वीकरण: पात्रता वर्गीकरण केवल सांकेतिक है और प्रकाशित सरकारी नियमों पर आधारित है। किसानबडी सरकारी स्वीकृति या राशि मिलने की गारंटी नहीं देता।",
      viewDetails: "विवरण और चरण देखें",
      prepareChecklist: "दस्तावेज़ चेकलिस्ट तैयार करें",
      applyOfficial: "आधिकारिक पोर्टल पर आवेदन करें",
      whyMatched: "पात्रता के आधार:",
      missingConditions: "अतिरिक्त जानकारी या शर्तें:"
    },
    dashboard: {
      recommendedTitle: "आपके खेत के लिए अनुशंसित",
      exploreByNeedTitle: "आवश्यकता के अनुसार योजनाएं",
      openApplicationsTitle: "वर्तमान में खुले आवेदन",
      upcomingWindowsTitle: "आगामी घोषित योजनाएं",
      savedSchemesTitle: "सहेजी गई योजनाएं और रिमाइंडर",
      officialSourcesTitle: "सत्यापित सरकारी स्रोत"
    },
    detail: {
      overview: "विवरण",
      publishedBenefits: "प्रकाशित लाभ",
      eligibilityCriteria: "आधिकारिक पात्रता मानदंड",
      requiredDocuments: "आवश्यक दस्तावेज़",
      applicationSteps: "आवेदन के चरण",
      helpline: "आधिकारिक हेल्पलाइन",
      faqs: "अक्सर पूछे जाने वाले प्रश्न",
      lastVerified: "अंतिम सत्यापित तारीख",
      officialPortalNotice: "आधिकारिक सरकारी पोर्टल"
    },
    checklist: {
      title: "दस्तावेज़ तैयारी चेकलिस्ट",
      subtitle: "सीएससी जाने या ऑनलाइन आवेदन करने से पहले अपनी तैयारी की जांच करें। प्रत्येक दस्तावेज़ को उपलब्ध, लंबित या सहायता चाहिए के रूप में चिह्नित करें।",
      available: "उपलब्ध है",
      pending: "लंबित है",
      needHelp: "सहायता चाहिए",
      privacyNotice: "गोपनीयता सूचना: किसानबडी केवल चेकलिस्ट बनाने के लिए कभी भी आपका आधार नंबर, बैंक विवरण या ओटीपी नहीं मांगता।",
      saveReminder: "आवेदन की अंतिम तिथि का रिमाइंडर सेट करें"
    }
  },
  // Other language mappings inherit same clean structure with native headings
  kn: {
    tag: "ರೈತ ಸೌಲಭ್ಯ ಸಹಾಯಕ · ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    headingPrefix: "ಸರ್ಕಾರಿ",
    description: "ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ಅಧಿಕೃತ ಗೆಜೆಟ್ ಆಧಾರಿತ ವೈಯಕ್ತಿಕ ಯೋಜನೆಗಳ ಶೋಧನೆ, ಅರ್ಹತೆ ಪರಿಶೀಲನೆ ಮತ್ತು ಅರ್ಜಿ ಸಿದ್ಧತಾ ಸಹಾಯಕ.",
    searchPlaceholder: "ಯೋಜನೆಯ ಹೆಸರು, ಸೌಲಭ್ಯ ಅಥವಾ ವಿವರ ಹುಡುಕಿ...",
    allStates: "ಎಲ್ಲಾ ರಾಜ್ಯಗಳು / ಕೇಂದ್ರ",
    stateBihar: "ಬಿಹಾರ",
    stateUttarPradesh: "ಉತ್ತರ ಪ್ರದೇಶ",
    stateKarnataka: "ಕರ್ನಾಟಕ",
    stateMaharashtra: "ಮಹಾರಾಷ್ಟ್ರ",
    criteriaMatched: (visible, total) => `ನಿಮ್ಮ ಮಾನದಂಡಕ್ಕೆ ಸರಿಹೊಂದುವ ${total} ರಲ್ಲಿ ${visible} ಯೋಜನೆಗಳು`,
    fillParamsHint: "ಹೊಂದಾಣಿಕೆಯಾಗುವ ಯೋಜನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಕೆಳಗೆ ನಿಮ್ಮ ಕೃಷಿ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ",
    resetFilterBtn: "ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ",
    closeFilterBtn: "ಫಿಲ್ಟರ್ ಮುಚ್ಚಿ",
    categoryGroupLabel: "ವರ್ಗ / ಗುಂಪು",
    showMatchingSchemesBtn: "ಅರ್ಹ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ",
    matchingGrantsBadge: (c) => `${c} ಹೊಂದಾಣಿಕೆಯ ಅನುದಾನಗಳು`,
    acresLand: "ಎಕರೆ ಜಮೀನು",
    groupSuffix: "ಗುಂಪು",
    centralScheme: "ಕೇಂದ್ರ ಸರ್ಕಾರ",
    stateScheme: "ರಾಜ್ಯ ಸರ್ಕಾರ",
    verifiedToday: "ದೃಢೀಕೃತ: ಅಧಿಕೃತ",
    applyBy: (lastDate) => `ಕೊನೆಯ ದಿನಾಂಕ: ${lastDate}`,
    openAllYear: "ಸದಾ ಸಕ್ರಿಯವಾಗಿದೆ",
    findSchemesForFarm: "ನನ್ನ ಜಮೀನಿಗೆ ಸೂಕ್ತ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ",
    findSchemesSubtitle: "ನಿಮ್ಮ ಕೃಷಿ ವಿವರಗಳನ್ನು ನೀಡಿ ಸಬ್ಸಿಡಿ ಮತ್ತು ಸಾಲ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ.",
    tabs: { find: "ಜಮೀನಿಗೆ ಹುಡುಕಿ", dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", allSchemes: "ಎಲ್ಲಾ ಯೋಜನೆಗಳು", saved: "ಉಳಿಸಿದವು" },
    finder: {
      stateLabel: "ರಾಜ್ಯ", districtLabel: "ಜಿಲ್ಲೆ", districtPlaceholder: "ಉದಾ. ಮಂಡ್ಯ, ಬೆಳಗಾವಿ", cropsLabel: "ಬೆಳೆಗಳು", cropsPlaceholder: "ಉದಾ. ಭತ್ತ, ರಾಗಿ, ಕಬ್ಬು",
      landLabel: "ಜಮೀನು (ಎಕರೆ)", landPlaceholder: "ಉದಾ. 2.5", tenureLabel: "ಮಾಲೀಕತ್ವ", tenureOwner: "ಸ್ವಂತ ಜಮೀನು", tenureTenant: "ಗೇಣಿ ರೈತ", tenureSharecropper: "ಪಾಲುದಾರ",
      irrigationLabel: "ನೀರಾವರಿ ಇದೆಯೇ?", irrigationYes: "ಹೌದು (ಬೋರ್‌ವೆಲ್/ಕಾಲುವೆ)", irrigationNo: "ಇಲ್ಲ (ಮಳೆ ಆಶ್ರಯ)",
      categoryLabel: "ವರ್ಗ", categoryAny: "ಯಾವುದೇ", categoryGeneral: "ಸಾಮಾನ್ಯ", categoryOBC: "ಹಿಂದುಳಿದ ವರ್ಗ", categorySC: "ಪರಿಶಿಷ್ಟ ಜಾತಿ", categoryST: "ಪರಿಶಿಷ್ಟ ಪಂಗಡ", categoryWomen: "ಮಹಿಳಾ ರೈತ",
      activitiesLabel: "ಯೋಜಿತ ಚಟುವಟಿಕೆಗಳು", activitiesHint: "ಅನ್ವಯಿಸುವ ಎಲ್ಲಾ ಆಯ್ಕೆಗಳನ್ನು ಆರಿಸಿ:",
      activityDrip: "ಹನಿ ನೀರಾವರಿ (Drip/Sprinkler)", activitySolar: "ಸೌರ ಪಂಪ್ (Solar Pump)", activityMachinery: "ಕೃಷಿ ಯಂತ್ರೋಪಕರಣಗಳು", activityCredit: "ಕೆಸಿಸಿ ಸಾಲ (KCC)", activityInsurance: "ಬೆಳೆ ವಿಮೆ (PMFBY)", activityOrganic: "ಸಾವಯವ ಕೃಷಿ", activityPostHarvest: "ಗೋದಾಮು / ಮಾರುಕಟ್ಟೆ",
      saveProfileCheckbox: "ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ", evaluateBtn: "ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ", evaluatingBtn: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..."
    },
    results: {
      potentialMatch: "ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ (Potential Match)", potentialMatchDesc: "ನಿಮ್ಮ ಜಮೀನಿನ ವಿವರಗಳು ಅಧಿಕೃತ ಮಾನದಂಡಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ.",
      moreInfoRequired: "ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ (More Info Required)", moreInfoRequiredDesc: "ಹೆಚ್ಚುವರಿ ಷರತ್ತುಗಳ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ.",
      notMatching: "ಮಾನದಂಡಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ", notMatchingDesc: "ಅಧಿಕೃತ ನಿಯಮಗಳೊಂದಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.",
      disclaimer: "ಗಮನಿಸಿ: ಇದು ಕೇವಲ ಮಾಹಿತಿ ಉದ್ದೇಶಕ್ಕೆ ಮಾತ್ರ. ಕಿಸಾನ್‌ಬಡ್ಡಿ ಯಾವುದೇ ಸರ್ಕಾರಿ ಅನುಮೋದನೆಯ ಖಾತರಿ ನೀಡುವುದಿಲ್ಲ.",
      viewDetails: "ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ", prepareChecklist: "ದಾಖಲೆಗಳ ಚೆಕ್‌ಲಿಸ್ಟ್", applyOfficial: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
      whyMatched: "ಅರ್ಹತೆಯ ಕಾರಣಗಳು:", missingConditions: "ಅಗತ್ಯವಿರುವ ವಿವರಗಳು:"
    },
    dashboard: {
      recommendedTitle: "ನಿಮ್ಮ ಜಮೀನಿಗೆ ಶಿಫಾರಸು ಮಾಡಲಾದ ಯೋಜನೆಗಳು", exploreByNeedTitle: "ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ಯೋಜನೆಗಳು", openApplicationsTitle: "ಪ್ರಸ್ತುತ ಮುಕ್ತವಾಗಿರುವ ಅರ್ಜಿಗಳು", upcomingWindowsTitle: "ಮುಂಬರುವ ಯೋಜನೆಗಳು", savedSchemesTitle: "ಉಳಿಸಿದ ಯೋಜನೆಗಳು", officialSourcesTitle: "ದೃಢೀಕೃತ ಸರ್ಕಾರಿ ಮೂಲಗಳು"
    },
    detail: { overview: "ವಿವರಣೆ", publishedBenefits: "ಲಭ್ಯವಿರುವ ಸೌಲಭ್ಯಗಳು", eligibilityCriteria: "ಅರ್ಹತೆಯ ಮಾನದಂಡಗಳು", requiredDocuments: "ಅಗತ್ಯ ದಾಖಲೆಗಳು", applicationSteps: "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಹಂತಗಳು", helpline: "ಸಹಾಯವಾಣಿ", faqs: "ಪ್ರಶ್ನೋತ್ತರಗಳು", lastVerified: "ದೃಢೀಕರಿಸಿದ ದಿನಾಂಕ", officialPortalNotice: "ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್" },
    checklist: { title: "ದಾಖಲೆಗಳ ಚೆಕ್‌ಲಿಸ್ಟ್", subtitle: "ಸಿಎಸ್‌ಸಿಗೆ ಭೇಟಿ ನೀಡುವ ಮುನ್ನ ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿಕೊಳ್ಳಿ.", available: "ಲಭ್ಯವಿದೆ", pending: "ಬಾಕಿ ಇದೆ", needHelp: "ಸಹಾಯ ಬೇಕು", privacyNotice: "ಗೌಪ್ಯತೆ: ಕಿಸಾನ್‌ಬಡ್ಡಿ ನಿಮ್ಮ ಆಧಾರ್ ಅಥವಾ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ.", saveReminder: "ಕೊನೆಯ ದಿನಾಂಕದ ಜ್ಞಾಪನೆ ಹೊಂದಿಸಿ" }
  },
  te: { ...({} as any) },
  ta: { ...({} as any) },
  mr: { ...({} as any) },
  gu: { ...({} as any) },
  bn: { ...({} as any) },
  pa: { ...({} as any) },
  ml: { ...({} as any) },
  hi_en: { ...({} as any) }
}

// Populate remaining languages with fallback to Hindi / English gracefully
const fallbackKeys = ["te", "ta", "mr", "gu", "bn", "pa", "ml", "hi_en"] as Lang[]
for (const lang of fallbackKeys) {
  SCHEMES_I18N[lang] = {
    ...SCHEMES_I18N.en,
    tag: lang === "hi_en" ? "Farmer Benefits Assistant · Sarkari Yojana" : SCHEMES_I18N.en.tag,
    headingPrefix: lang === "hi_en" ? "Sarkari" : SCHEMES_I18N.en.headingPrefix,
    allStates: lang === "hi_en" ? "Sabhi Rajya (All States)" : SCHEMES_I18N.en.allStates,
    stateBihar: "Bihar",
    stateUttarPradesh: "Uttar Pradesh",
    stateKarnataka: "Karnataka",
    stateMaharashtra: "Maharashtra",
    findSchemesForFarm: lang === "hi_en" ? "Mere Khet Ke Liye Scheme Khojein" : SCHEMES_I18N.en.findSchemesForFarm,
    tabs: {
      find: lang === "hi_en" ? "Khet Ke Liye Khojein" : SCHEMES_I18N.en.tabs.find,
      dashboard: lang === "hi_en" ? "Dashboard" : SCHEMES_I18N.en.tabs.dashboard,
      allSchemes: lang === "hi_en" ? "Sabhi Schemes" : SCHEMES_I18N.en.tabs.allSchemes,
      saved: lang === "hi_en" ? "Saved & Checklist" : SCHEMES_I18N.en.tabs.saved
    }
  }
}
