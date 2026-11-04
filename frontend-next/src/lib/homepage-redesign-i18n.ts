import type { Lang } from "./language";

export interface RedesignCopy {
  hero: {
    greeting: string;
    subtitle: string;
  };
  voice: {
    title: string;
    subtitle: string;
    buttonText: string;
    listening: string;
    prompts: [string, string, string];
  };
  essential: {
    heading: string;
    subtitle: string;
    cropDisease: {
      title: string;
      desc: string;
    };
    mandiPrices: {
      title: string;
      desc: string;
    };
    weather: {
      title: string;
      desc: string;
    };
    sellCrops: {
      title: string;
      desc: string;
    };
  };
  weather: {
    heading: string;
    rainExpected: string;
    clearWeather: string;
    viewForecast: string;
    rainChance: string;
  };
  moreServices: {
    heading: string;
    subtitle: string;
    viewAll: string;
    showLess: string;
    allFilter: string;
  };
  footnote: string;
}

export const REDESIGN_I18N: Record<Lang, RedesignCopy> = {
  hi: {
    hero: {
      greeting: "नमस्ते किसान भाई!",
      subtitle: "आज आपके खेत में क्या मदद चाहिए?",
    },
    voice: {
      title: "Ask KisaanBuddy",
      subtitle: "अपनी भाषा में बोलकर पूछें।",
      buttonText: "बोलने के लिए दबाएं (Tap to Speak)",
      listening: "सुन रहे हैं... कृपया बोलिए",
      prompts: [
        "गेहूं का आज का मंडी भाव क्या है?",
        "टमाटर के पत्ते पीले क्यों पड़ रहे हैं?",
        "क्या कल बारिश होगी?",
      ],
    },
    essential: {
      heading: "आपको किस काम में मदद चाहिए?",
      subtitle: "नीचे दी गई सेवा चुनें या ऊपर माइक दबाकर बोलें।",
      cropDisease: {
        title: "फसल रोग (Crop Disease)",
        desc: "अपनी फसल की बीमारी और सही इलाज जानें।",
      },
      mandiPrices: {
        title: "आज के मंडी भाव (Mandi Prices)",
        desc: "अपनी नजदीकी मंडियों के ताजा भाव देखें।",
      },
      weather: {
        title: "मौसम (Weather)",
        desc: "अपने क्षेत्र के मौसम का सटीक हाल जानें।",
      },
      sellCrops: {
        title: "फसल बेचें (Sell Your Crops)",
        desc: "अपनी उपज के लिए सीधे खरीदार खोजें।",
      },
    },
    weather: {
      heading: "आपके क्षेत्र का मौसम (Weather in Your Area)",
      rainExpected: "बारिश की संभावना है। कटी हुई फसल को सुरक्षित रखें और जल निकासी सुनिश्चित करें।",
      clearWeather: "आज बारिश की संभावना नहीं है — सिंचाई या कीटनाशक छिड़काव के लिए सही समय है।",
      viewForecast: "पूरा 3-दिन का मौसम देखें",
      rainChance: "बारिश",
    },
    moreServices: {
      heading: "खेती की अन्य सुविधाएं (Explore More Farming Services)",
      subtitle: "फसल सलाह, मशीनरी किराया, मजदूर, खेत डायरी और सरकारी योजनाएं",
      viewAll: "सभी सेवाएं देखें (View All Services)",
      showLess: "कम दिखाएं (Show Less)",
      allFilter: "सभी सेवाएं",
    },
    footnote: "मंडी भाव: AGMARKNET • मौसम रिपोर्ट: IMD • आधिकारिक कृषि डेटा",
  },

  en: {
    hero: {
      greeting: "Namaste, Farmer Friend!",
      subtitle: "How can we help you with your farming today?",
    },
    voice: {
      title: "Ask KisaanBuddy",
      subtitle: "Speak in your own language.",
      buttonText: "Tap to Speak",
      listening: "Listening... Please speak",
      prompts: [
        "What is today's wheat price?",
        "Why are my tomato leaves turning yellow?",
        "Will it rain tomorrow?",
      ],
    },
    essential: {
      heading: "What would you like help with?",
      subtitle: "Choose an essential service below or tap the microphone above to speak.",
      cropDisease: {
        title: "Crop Disease",
        desc: "Find out what is wrong with your crop.",
      },
      mandiPrices: {
        title: "Today's Mandi Prices",
        desc: "Check the latest crop market prices.",
      },
      weather: {
        title: "Weather",
        desc: "Check weather information for your area.",
      },
      sellCrops: {
        title: "Sell Your Crops",
        desc: "Find buyers for your agricultural produce.",
      },
    },
    weather: {
      heading: "Weather in Your Area",
      rainExpected: "Rain expected soon. Protect harvested crops and ensure field drainage.",
      clearWeather: "No rain expected today. Good condition for field irrigation or spray.",
      viewForecast: "View 3-day forecast",
      rainChance: "Rain",
    },
    moreServices: {
      heading: "Explore More Farming Services",
      subtitle: "Crop care, mandi business, farm management, workers, machinery and schemes",
      viewAll: "View All Services",
      showLess: "Show Less",
      allFilter: "All Services",
    },
    footnote: "Market rates from AGMARKNET • Weather reports from IMD • Official Agricultural Data",
  },

  kn: {
    hero: {
      greeting: "ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ!",
      subtitle: "ಇಂದು ನಿಮ್ಮ ಜಮೀನಿಗೆ ಯಾವ ಸಹಾಯ ಬೇಕು?",
    },
    voice: {
      title: "Ask KisaanBuddy",
      subtitle: "ನಿಮ್ಮ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ.",
      buttonText: "ಮಾತನಾಡಲು ಒತ್ತಿ (Tap to Speak)",
      listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ದಯವಿಟ್ಟು ಮಾತನಾಡಿ",
      prompts: [
        "ಇಂದಿನ ಗೋಧಿ ಮಂಡಿ ಬೆಲೆ ಎಷ್ಟು?",
        "ಟೊಮೆಟೊ ಎಲೆಗಳು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತಿರುವುದು ಏಕೆ?",
        "ನಾಳೆ ಮಳೆಯಾಗುತ್ತಾ?",
      ],
    },
    essential: {
      heading: "ನಿಮಗೆ ಯಾವ ಕೆಲಸದಲ್ಲಿ ಸಹಾಯ ಬೇಕು?",
      subtitle: "ಕೆಳಗಿನ ಸೇವೆಯನ್ನು ಆರಿಸಿ ಅಥವಾ ಮಾತನಾಡಲು ಮೈಕ್ರೊಫೋನ್ ಒತ್ತಿರಿ.",
      cropDisease: {
        title: "ಬೆಳೆ ರೋಗ (Crop Disease)",
        desc: "ನಿಮ್ಮ ಬೆಳೆಗೆ ಏನಾಗಿದೆ ಎಂದು ತಿಳಿಯಿರಿ.",
      },
      mandiPrices: {
        title: "ಇಂದಿನ ಮಂಡಿ ಬೆಲೆಗಳು (Mandi Prices)",
        desc: "ಇತ್ತೀಚಿನ ಮಂಡಿ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      },
      weather: {
        title: "ಹವಾಮಾನ (Weather)",
        desc: "ನಿಮ್ಮ ಪ್ರದೇಶದ ಹವಾಮಾನ ಮಾಹಿತಿ ನೋಡಿ.",
      },
      sellCrops: {
        title: "ಬೆಳೆ ಮಾರಾಟ (Sell Your Crops)",
        desc: "ನಿಮ್ಮ ಕೃಷಿ ಬೆಳೆಗೆ ಖರೀದಿದಾರರನ್ನು ಹುಡುಕಿ.",
      },
    },
    weather: {
      heading: "ನಿಮ್ಮ ಪ್ರದೇಶದ ಹವಾಮಾನ (Weather in Your Area)",
      rainExpected: "ಶೀಘ್ರದಲ್ಲೇ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ. ಕೊಯ್ಲು ಮಾಡಿದ ಬೆಳೆಯನ್ನು ರಕ್ಷಿಸಿ.",
      clearWeather: "ಇಂದು ಮಳೆಯ ಸಾಧ್ಯತೆ ಇಲ್ಲ — ಔಷಧ ಸಿಂಪಡಣೆ ಅಥವಾ ನೀರಾವರಿಗೆ ಸೂಕ್ತ ಸಮಯ.",
      viewForecast: "ಮುಂದಿನ 3 ದಿನಗಳ ಪೂರ್ಣ ಹವಾಮಾನ ನೋಡಿ",
      rainChance: "ಮಳೆ",
    },
    moreServices: {
      heading: "ಇತರ ಕೃಷಿ ಸೇವೆಗಳು (Explore More Farming Services)",
      subtitle: "ಬೆಳೆ ಸಲಹೆ, ಮಾರುಕಟ್ಟೆ, ಜಮೀನಿನ ಲೆಕ್ಕ, ಕಾರ್ಮಿಕರು ಮತ್ತು ಯೋಜನೆಗಳು",
      viewAll: "ಎಲ್ಲಾ ಸೇವೆಗಳನ್ನು ನೋಡಿ (View All Services)",
      showLess: "ಕಡಿಮೆ ತೋರಿಸಿ (Show Less)",
      allFilter: "ಎಲ್ಲಾ ಸೇವೆಗಳು",
    },
    footnote: "ಮಂಡಿ ದರಗಳು: AGMARKNET • ಹವಾಮಾನ: IMD • ಅಧಿಕೃತ ಕೃಷಿ ಮಾಹಿತಿ",
  },

  ta: {
    hero: {
      greeting: "வணக்கம் விவசாய பெருமக்களே!",
      subtitle: "இன்று உங்கள் விவசாயத்திற்கு என்ன உதவி தேவை?",
    },
    voice: {
      title: "Ask KisaanBuddy",
      subtitle: "உங்கள் சொந்த மொழியில் பேசுங்கள்.",
      buttonText: "பேச தட்டவும் (Tap to Speak)",
      listening: "கேட்கிறது... தயவுசெய்து பேசுங்கள்",
      prompts: [
        "இன்றைய கோதுமை விலை என்ன?",
        "தக்காளி இலைகள் ஏன் மஞ்சளாகின்றன?",
        "நாளை மழை பெய்யுமா?",
      ],
    },
    essential: {
      heading: "உங்களுக்கு எதில் உதவி தேவை?",
      subtitle: "கீழே உள்ள சேவையைத் தேர்வு செய்யவும் அல்லது பேச மைக் தொடவும்.",
      cropDisease: {
        title: "பயிர் நோய் (Crop Disease)",
        desc: "உங்கள் பயிருக்கு என்ன பிரச்சனை என்று தெரிந்து கொள்ளுங்கள்.",
      },
      mandiPrices: {
        title: "இன்றைய மண்டி விலைகள் (Mandi Prices)",
        desc: "சமீபத்திய சந்தை விலைகளை சரிபார்க்கவும்.",
      },
      weather: {
        title: "வானிலை (Weather)",
        desc: "உங்கள் பகுதிக்கான வானிலை தகவலைப் பார்க்கவும்.",
      },
      sellCrops: {
        title: "பயிர்களை விற்க (Sell Your Crops)",
        desc: "உங்கள் விளைபொருட்களுக்கு வாங்குபவர்களைக் கண்டறியவும்.",
      },
    },
    weather: {
      heading: "உங்கள் பகுதி வானிலை (Weather in Your Area)",
      rainExpected: "விரைவில் மழை எதிர்பார்க்கப்படுகிறது. அறுவடை செய்த பயிர்களைப் பாதுகாக்கவும்.",
      clearWeather: "இன்று மழை இல்லை — நீர் பாசனம் மற்றும் உரம் தெளிக்க ஏற்ற நேரம்.",
      viewForecast: "3-நாள் வானிலை முன்னறிவிப்பு",
      rainChance: "மழை",
    },
    moreServices: {
      heading: "மேலும் விவசாய சேவைகள் (Explore More Services)",
      subtitle: "பயிர் மருத்துவர், சந்தை, பண்ணை கணக்கு, தொழிலாளர்கள் மற்றும் திட்டங்கள்",
      viewAll: "அனைத்து சேவைகளையும் பார்க்கவும் (View All)",
      showLess: "குறைவாகக் காட்டு",
      allFilter: "அனைத்து சேவைகள்",
    },
    footnote: "மண்டி விலைகள்: AGMARKNET • வானிலை: IMD • அதிகாரப்பூர்வ தரவு",
  },

  te: {
    hero: {
      greeting: "నమస్కారం రైతు సోదరులారా!",
      subtitle: "ఈరోజు మీ వ్యవసాయానికి ఏ సహాయం కావాలి?",
    },
    voice: {
      title: "Ask KisaanBuddy",
      subtitle: "మీ స్వంత భాషలో మాట్లాడండి.",
      buttonText: "మాట్లాడటానికి నొక్కండి (Tap to Speak)",
      listening: "వింటున్నాము... దయచేసి మాట్లాడండి",
      prompts: [
        "ఈరోజు గోధుమ ధర ఎంత?",
        "టమోటా ఆకులు ఎందుకు పసుపు రంగులోకి మారుతున్నాయి?",
        "రేపు వర్షం పడుతుందా?",
      ],
    },
    essential: {
      heading: "మీకు దేనిలో సహాయం కావాలి?",
      subtitle: "కింది సేవను ఎంచుకోండి లేదా మాట్లాడటానికి మైక్ నొక్కండి.",
      cropDisease: {
        title: "పంట తెగుళ్లు (Crop Disease)",
        desc: "మీ పంటకు ఏమి జరిగిందో తెలుసుకోండి.",
      },
      mandiPrices: {
        title: "ఈరోజు మండి ధరలు (Mandi Prices)",
        desc: "తాజా మార్కెట్ ధరలను తనిఖీ చేయండి.",
      },
      weather: {
        title: "వాతావరణం (Weather)",
        desc: "మీ ప్రాంత వాతావరణ సమాచారాన్ని చూడండి.",
      },
      sellCrops: {
        title: "పంటను అమ్మండి (Sell Your Crops)",
        desc: "మీ పంటకు సరైన కొనుగోలుదారులను కనుగొనండి.",
      },
    },
    weather: {
      heading: "మీ ప్రాంత వాతావరణం (Weather in Your Area)",
      rainExpected: "త్వరలో వర్షం పడే అవకాశం ఉంది. కోసిన పంటను రక్షించండి.",
      clearWeather: "ఈరోజు వర్షం లేదు — నీటిపారుదల లేదా మందుల పిచికారీకి అనుకూలం.",
      viewForecast: "3 రోజుల వాతావరణ నివేదిక",
      rainChance: "వర్షం",
    },
    moreServices: {
      heading: "ఇతర వ్యవసాయ సేవలు (Explore More Services)",
      subtitle: "పంట సంరక్షణ, మార్కెట్, పొలం డైరీ, కూలీలు మరియు ప్రభుత్వ పథకాలు",
      viewAll: "అన్ని సేవలను చూడండి (View All)",
      showLess: "తక్కువగా చూపించు",
      allFilter: "అన్ని సేవలు",
    },
    footnote: "మార్కెట్ ధరలు: AGMARKNET • వాతావరణం: IMD • అధికారిక సమాచారం",
  },

  mr: {
    hero: {
      greeting: "नमस्कार शेतकरी मित्रा!",
      subtitle: "आज तुमच्या शेतीसाठी काय मदत हवी आहे?",
    },
    voice: {
      title: "Ask KisaanBuddy",
      subtitle: "तुमच्या स्वतःच्या भाषेत बोला.",
      buttonText: "बोलण्यासाठी टॅप करा (Tap to Speak)",
      listening: "ऐकत आहोत... कृपया बोला",
      prompts: [
        "गव्हाचा आजचा भाव काय आहे?",
        "टोमॅटोची पाने पिवळी का पडत आहेत?",
        "उद्या पाऊस पडेल का?",
      ],
    },
    essential: {
      heading: "तुम्हाला कशात मदत हवी आहे?",
      subtitle: "खालील सेवा निवडा किंवा बोलण्यासाठी माइक टॅप करा.",
      cropDisease: {
        title: "पीक रोग (Crop Disease)",
        desc: "तुमच्या पिकाला काय झाले आहे ते जाणून घ्या.",
      },
      mandiPrices: {
        title: "आजचे मंडी दर (Mandi Prices)",
        desc: "बाजारातील ताजे दर तपासा.",
      },
      weather: {
        title: "हवामान (Weather)",
        desc: "तुमच्या भागातील हवामानाची माहिती तपासा.",
      },
      sellCrops: {
        title: "पीक विका (Sell Your Crops)",
        desc: "तुमच्या शेतमालासाठी थेट खरेदीदार शोधा.",
      },
    },
    weather: {
      heading: "तुमच्या भागातील हवामान (Weather in Your Area)",
      rainExpected: "लवकरच पावसाची शक्यता आहे. काढणी केलेले पीक सुरक्षित ठेवा.",
      clearWeather: "आज पावसाची शक्यता नाही — फवारणी किंवा सिंचनासाठी योग्य वेळ आहे.",
      viewForecast: "३ दिवसांचा हवामान अंदाज",
      rainChance: "पाऊस",
    },
    moreServices: {
      heading: "इतर शेती सेवा (Explore More Services)",
      subtitle: "पीक सल्ला, मंडी दर, शेत डायरी, मजूर आणि शासकीय योजना",
      viewAll: "सर्व सेवा पहा (View All Services)",
      showLess: "कमी दाखवा",
      allFilter: "सर्व सेवा",
    },
    footnote: "मंडी दर: AGMARKNET • हवामान: IMD • अधिकृत कृषी डेटा",
  },

  gu: {
    hero: {
      greeting: "નમસ્તે ખેડૂત મિત્રો!",
      subtitle: "આજે તમારા ખેતરમાં શું મદદ જોઈએ છે?",
    },
    voice: {
      title: "Ask KisaanBuddy",
      subtitle: "તમારી પોતાની ભાષામાં બોલો.",
      buttonText: "બોલવા માટે દબાવો (Tap to Speak)",
      listening: "સાંભળી રહ્યા છીએ... કૃપા કરીને બોલો",
      prompts: [
        "ઘઉંનો આજનો ભાવ શું છે?",
        "ટામેટાના પાન કેમ પીળા પડી રહ્યા છે?",
        "કાલે વરસાદ પડશે?",
      ],
    },
    essential: {
      heading: "તમારે શેમાં મદદ જોઈએ છે?",
      subtitle: "નીચેની સેવા પસંદ કરો અથવા બોલવા માટે માઇક દબાવો.",
      cropDisease: {
        title: "પાક રોગ (Crop Disease)",
        desc: "તમારા પાકમાં શું ખામી છે તે જાણો.",
      },
      mandiPrices: {
        title: "આજના મંડી દર (Mandi Prices)",
        desc: "નવીનતમ બજાર ભાવો તપાસો.",
      },
      weather: {
        title: "હવામાન (Weather)",
        desc: "તમારા વિસ્તારની હવામાન માહિતી તપાસો.",
      },
      sellCrops: {
        title: "પાક વેચો (Sell Your Crops)",
        desc: "તમારા પાક માટે ખરીદદારો શોધો.",
      },
    },
    weather: {
      heading: "તમારા વિસ્તારનું હવામાન (Weather in Your Area)",
      rainExpected: "વરસાદની શક્યતા છે. કાપેલા પાકને સુરક્ષિત રાખો.",
      clearWeather: "આજે વરસાદની શક્યતા નથી — સિંચાઈ કે દવા છંટકાવ માટે યોગ્ય સમય છે.",
      viewForecast: "૩ દિવસનું હવામાન જુઓ",
      rainChance: "વરસાદ",
    },
    moreServices: {
      heading: "અન્ય ખેતી સેવાઓ (Explore More Services)",
      subtitle: "પાક સલાહ, મંડી, ખેતર ડાયરી, મજૂરો અને સરકારી યોજનાઓ",
      viewAll: "બધી સેવાઓ જુઓ (View All)",
      showLess: "ઓછું બતાવો",
      allFilter: "બધી સેવાઓ",
    },
    footnote: "મંડી ભાવ: AGMARKNET • હવામાન: IMD • સત્તાવાર કૃષિ ડેટા",
  },

  bn: {
    hero: {
      greeting: "নমস্কার কৃষক বন্ধু!",
      subtitle: "আজ আপনার কৃষিকাজে কী সাহায্য প্রয়োজন?",
    },
    voice: {
      title: "Ask KisaanBuddy",
      subtitle: "আপনার নিজের ভাষায় বলুন।",
      buttonText: "বলতে ট্যাপ করুন (Tap to Speak)",
      listening: "শুনছি... অনুগ্রহ করে বলুন",
      prompts: [
        "আজকের গমের দাম কত?",
        "টমেটো পাতা হলুদ হয়ে যাচ্ছে কেন?",
        "কাল কি বৃষ্টি হবে?",
      ],
    },
    essential: {
      heading: "আপনার কী বিষয়ে সাহায্য প্রয়োজন?",
      subtitle: "নিচের পরিষেবা বেছে নিন বা কথা বলতে মাইক চাপুন।",
      cropDisease: {
        title: "ফসলের রোগ (Crop Disease)",
        desc: "ফসলে কী সমস্যা হয়েছে তা জানুন।",
      },
      mandiPrices: {
        title: "আজকের মান্ডি দর (Mandi Prices)",
        desc: "সর্বশেষ বাজার দর দেখে নিন।",
      },
      weather: {
        title: "আবহাওয়া (Weather)",
        desc: "আপনার এলাকার আবহাওয়ার তথ্য দেখুন।",
      },
      sellCrops: {
        title: "ফসল বিক্রি করুন (Sell Your Crops)",
        desc: "উৎপাদিত ফসলের সঠিক ক্রেতা খুঁজুন।",
      },
    },
    weather: {
      heading: "আপনার এলাকার আবহাওয়া (Weather in Your Area)",
      rainExpected: "শীঘ্রই বৃষ্টির সম্ভাবনা রয়েছে। কাটা ফসল রক্ষা করুন।",
      clearWeather: "আজ বৃষ্টির সম্ভাবনা নেই — সেচ বা কীটনাশক স্প্রে করার জন্য ভালো সময়।",
      viewForecast: "৩ দিনের আবহাওয়া পূর্বাভাস",
      rainChance: "বৃষ্টি",
    },
    moreServices: {
      heading: "অন্যান্য কৃষি পরিষেবা (Explore More Services)",
      subtitle: "ফসল পরামর্শ, বাজার দর, খামার হিসাব, শ্রমিক ও সরকারি প্রকল্প",
      viewAll: "সব পরিষেবা দেখুন (View All)",
      showLess: "কম দেখান",
      allFilter: "সব পরিষেবা",
    },
    footnote: "মান্ডি দর: AGMARKNET • আবহাওয়া: IMD • অফিসিয়াল কৃষি তথ্য",
  },

  pa: {
    hero: {
      greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ!",
      subtitle: "ਅੱਜ ਤੁਹਾਡੀ ਖੇਤੀ ਵਿੱਚ ਕੀ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
    },
    voice: {
      title: "Ask KisaanBuddy",
      subtitle: "ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਬੋਲੋ।",
      buttonText: "ਬੋਲਣ ਲਈ ਦਬਾਓ (Tap to Speak)",
      listening: "ਸੁਣ ਰਹੇ ਹਾਂ... ਕਿਰਪਾ ਕਰਕੇ ਬੋਲੋ",
      prompts: [
        "ਅੱਜ ਕਣਕ ਦਾ ਰੇਟ ਕੀ ਹੈ?",
        "ਟਮਾਟਰ ਦੇ ਪੱਤੇ ਪੀਲੇ ਕਿਉਂ ਹੋ ਰਹੇ ਹਨ?",
        "ਕੀ ਕੱਲ੍ਹ ਮੀਂਹ ਪਵੇਗਾ?",
      ],
    },
    essential: {
      heading: "ਤੁਹਾਨੂੰ ਕਿਸ ਕੰਮ ਵਿੱਚ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
      subtitle: "ਹੇਠਾਂ ਦਿੱਤੀ ਸੇਵਾ ਚੁਣੋ ਜਾਂ ਬੋਲਣ ਲਈ ਮਾਈਕ ਦਬਾਓ।",
      cropDisease: {
        title: "ਫਸਲ ਦੀ ਬਿਮਾਰੀ (Crop Disease)",
        desc: "ਆਪਣੀ ਫਸਲ ਦੀ ਬਿਮਾਰੀ ਅਤੇ ਇਲਾਜ ਜਾਣੋ।",
      },
      mandiPrices: {
        title: "ਅੱਜ ਦੇ ਮੰਡੀ ਰੇਟ (Mandi Prices)",
        desc: "ਤਾਜ਼ਾ ਮੰਡੀ ਰੇਟ ਦੇਖੋ।",
      },
      weather: {
        title: "ਮੌਸਮ (Weather)",
        desc: "ਆਪਣੇ ਇਲਾਕੇ ਦਾ ਮੌਸਮ ਜਾਣੋ।",
      },
      sellCrops: {
        title: "ਫਸਲ ਵੇਚੋ (Sell Your Crops)",
        desc: "ਆਪਣੀ ਫਸਲ ਲਈ ਸਹੀ ਖਰੀਦਦਾਰ ਲੱਭੋ।",
      },
    },
    weather: {
      heading: "ਤੁਹਾਡੇ ਖੇਤਰ ਦਾ ਮੌਸਮ (Weather in Your Area)",
      rainExpected: "ਮੀਂਹ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਵੱਢੀ ਹੋਈ ਫਸਲ ਨੂੰ ਸੰਭਾਲੋ।",
      clearWeather: "ਅੱਜ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਨਹੀਂ ਹੈ — ਸਪਰੇਅ ਜਾਂ ਸਿੰਚਾਈ ਲਈ ਵਧੀਆ ਸਮਾਂ ਹੈ।",
      viewForecast: "੩ ਦਿਨਾਂ ਦਾ ਮੌਸਮ ਦੇਖੋ",
      rainChance: "ਮੀਂਹ",
    },
    moreServices: {
      heading: "ਹੋਰ ਖੇਤੀ ਸੇਵਾਵਾਂ (Explore More Services)",
      subtitle: "ਫਸਲ ਸਲਾਹ, ਮੰਡੀ ਰੇਟ, ਖੇਤ ਡਾਇਰੀ, ਮਜ਼ਦੂਰ ਅਤੇ ਸਰਕਾਰੀ ਸਕੀਮਾਂ",
      viewAll: "ਸਾਰੀਆਂ ਸੇਵਾਵਾਂ ਦੇਖੋ (View All)",
      showLess: "ਘੱਟ ਦਿਖਾਓ",
      allFilter: "ਸਾਰੀਆਂ ਸੇਵਾਵਾਂ",
    },
    footnote: "ਮੰਡੀ ਰੇਟ: AGMARKNET • ਮੌਸਮ: IMD • ਸਰਕਾਰੀ ਖੇਤੀ ਡਾਟਾ",
  },

  ml: {
    hero: {
      greeting: "നമസ്കാരം കർഷക സുഹൃത്തേ!",
      subtitle: "ഇന്ന് നിങ്ങളുടെ കൃഷിയിൽ എന്ത് സഹായമാണ് വേണ്ടത്?",
    },
    voice: {
      title: "Ask KisaanBuddy",
      subtitle: "നിങ്ങളുടെ സ്വന്തം ഭാഷയിൽ സംസാരിക്കൂ.",
      buttonText: "സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക (Tap to Speak)",
      listening: "കേൾക്കുന്നു... സംസാരിക്കൂ",
      prompts: [
        "ഇന്നത്തെ ഗോതമ്പ് വില എത്രയാണ്?",
        "തക്കാളി ഇലകൾ മഞ്ഞനിറമാകുന്നത് എന്തുകൊണ്ട്?",
        "നാളെ മഴ പെയ്യുമോ?",
      ],
    },
    essential: {
      heading: "നിങ്ങൾക്ക് എന്തിലാണ് സഹായം വേണ്ടത്?",
      subtitle: "താഴെയുള്ള സേവനം തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ സംസാരിക്കാൻ മൈക്ക് അമർത്തുക.",
      cropDisease: {
        title: "വിള രോഗങ്ങൾ (Crop Disease)",
        desc: "വിളയ്ക്ക് എന്ത് പ്രശ്നമാണെന്ന് അറിയുക.",
      },
      mandiPrices: {
        title: "ഇന്നത്തെ മണ്ടി നിരക്കുകൾ (Mandi Prices)",
        desc: "ഏറ്റവും പുതിയ നിരക്കുകൾ പരിശോധിക്കുക.",
      },
      weather: {
        title: "കാലാവസ്ഥ (Weather)",
        desc: "നിങ്ങളുടെ പ്രദേശത്തെ കാലാവസ്ഥ അറിയുക.",
      },
      sellCrops: {
        title: "വിളകൾ വിൽക്കുക (Sell Your Crops)",
        desc: "ഉൽപന്നങ്ങൾക്ക് വാങ്ങുന്നവരെ കണ്ടെത്തുക.",
      },
    },
    weather: {
      heading: "നിങ്ങളുടെ പ്രദേശത്തെ കാലാവസ്ഥ (Weather in Your Area)",
      rainExpected: "മഴയ്ക്ക് സാധ്യതയുണ്ട്. വിളവെടുപ്പ് സാധനങ്ങൾ സംരക്ഷിക്കുക.",
      clearWeather: "ഇന്ന് മഴയ്ക്ക് സാധ്യതയില്ല — നനയ്ക്കാനും മരുന്ന് തളിക്കാനും അനുയോജ്യമാണ്.",
      viewForecast: "3 ദിവസത്തെ കാലാവസ്ഥ കാണുക",
      rainChance: "മഴ",
    },
    moreServices: {
      heading: "മറ്റ് കൃഷി സേവനങ്ങൾ (Explore More Services)",
      subtitle: "വിള ഉപദേശം, വിപണി നിരക്കുകൾ, തൊഴിലാളികൾ, സർക്കാർ പദ്ധതികൾ",
      viewAll: "എല്ലാ സേവനങ്ങളും കാണുക (View All)",
      showLess: "കുറച്ച് കാണിക്കുക",
      allFilter: "എല്ലാ സേവനങ്ങളും",
    },
    footnote: "മണ്ടി നിരക്കുകൾ: AGMARKNET • കാലാവസ്ഥ: IMD • ഔദ്യോഗിക വിവരങ്ങൾ",
  },

  hi_en: {
    hero: {
      greeting: "Namaste Farmer Friend!",
      subtitle: "Aaj aapke khet mein kya madad chahiye?",
    },
    voice: {
      title: "Ask KisaanBuddy",
      subtitle: "Apni bhasha mein bolkar poochhein.",
      buttonText: "Bolne ke liye dabayein (Tap to Speak)",
      listening: "Sun rahe hain... please boliye",
      prompts: [
        "Aaj ka gehu ka mandi bhav kya hai?",
        "Tamatar ke patte peele kyu pad rahe hain?",
        "Kya kal barish hogi?",
      ],
    },
    essential: {
      heading: "Aapko kis kaam mein madad chahiye?",
      subtitle: "Neeche di gayi service chunein ya upar mic dabakar bolein.",
      cropDisease: {
        title: "Crop Disease (फसल रोग)",
        desc: "Apni fasal ki bimari aur sahi ilaj jaanein.",
      },
      mandiPrices: {
        title: "Today's Mandi Prices (मंडी भाव)",
        desc: "Apni nazdeeki mandiyon ke taaza rates dekhein.",
      },
      weather: {
        title: "Weather (मौसम)",
        desc: "Apne ilake ka mausam aur rain forecast jaanein.",
      },
      sellCrops: {
        title: "Sell Your Crops (फसल बेचें)",
        desc: "Apni upaj ke liye seedhe buyers dhoondhein.",
      },
    },
    weather: {
      heading: "Weather in Your Area",
      rainExpected: "Barish ki sambhavna hai. Kati hui fasal ko surakshit rakhein.",
      clearWeather: "Aaj barish nahi hogi — sinchai ya spray ke liye badhiya din hai.",
      viewForecast: "Poora 3-day mausam dekhein",
      rainChance: "Barish",
    },
    moreServices: {
      heading: "Explore More Farming Services",
      subtitle: "Fasal salah, mandi, khet diary, mazdoor aur sarkari yojanaein",
      viewAll: "View All Services (सभी सुविधाएं)",
      showLess: "Show Less (कम दिखाएं)",
      allFilter: "All Services",
    },
    footnote: "Market rates from AGMARKNET • Weather reports from IMD • Official Agricultural Data",
  },
};
