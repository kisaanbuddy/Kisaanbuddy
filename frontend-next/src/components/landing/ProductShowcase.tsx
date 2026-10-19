'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Bug, CloudSun, FlaskConical, TrendingUp, 
  CheckCircle2, Sparkles 
} from 'lucide-react';
import { useLanguage } from '@/lib/language';

type TabData = {
  label: string;
  badge: string;
  headline: string;
  description: string;
  buttonText: string;
  points: [string, string, string];
};

type ShowcaseContent = {
  sectionBadge: string;
  sectionTitle: string;
  sectionDesc: string;
  realContext: string;
  tabs: {
    doctor: TabData;
    soil: TabData;
    weather: TabData;
    mandi: TabData;
  };
};

const SHOWCASE_I18N: Record<string, ShowcaseContent> = {
  en: {
    sectionBadge: 'FIELD-READY AGRICULTURAL SUITE',
    sectionTitle: 'Built Around Your Real Farming Needs.',
    sectionDesc: 'Each core capability is engineered for the ground realities of Indian agriculture—high offline tolerance, verified institutional sources, and clear actionable steps.',
    realContext: 'REAL AGRICULTURAL CONTEXT',
    tabs: {
      doctor: {
        label: 'AI Crop Doctor',
        badge: 'Vision Diagnostics',
        headline: 'Scan Leaf Symptoms. Receive Proven Organic & Chemical Remedies.',
        description: 'Capture a photo of distressed foliage or fruit. Our computer vision model identifies fungal, bacterial, and pest damage within seconds and prescribes ICAR-aligned remedies.',
        buttonText: 'Launch Crop Doctor',
        points: [
          'Identifies Yellow Rust, Leaf Blast, Sheath Blight & Aphids',
          'Provides biological alternatives (Neem oil, Trichoderma) alongside chemical dosages',
          'Precise per-acre dosage instructions with dilution ratios'
        ]
      },
      soil: {
        label: 'Soil Health & NPK',
        badge: 'Nutrient Matrix',
        headline: 'Eliminate Guesswork in Fertilizer Application.',
        description: 'Tailor urea, DAP, and potash application to your Soil Health Card test values. Cut input costs while boosting soil organic carbon and crop yield.',
        buttonText: 'Analyze Soil Health',
        points: [
          'Customized basal and top-dressing plans for specific crop stages',
          'pH correction advice using agricultural gypsum or agricultural lime',
          'Supports Soil Health Card upload or quick manual field estimates'
        ]
      },
      weather: {
        label: 'Hyperlocal Weather',
        badge: 'Precision Radar',
        headline: 'Know When to Irrigate, Spray, or Harvest.',
        description: 'Spraying pesticides right before sudden downpours wastes expensive inputs. Our hyperlocal hourly forecast advises the safest windows for spraying and harvesting.',
        buttonText: 'Check Farm Weather',
        points: [
          'Hourly precipitation probability and wind speed for safe drift-free spraying',
          'Proactive alerts for heatwaves, sudden frost, and unseasonal rainfall',
          'PIN-code based 7-day agricultural forecast synced with IMD radar'
        ]
      },
      mandi: {
        label: 'Mandi Prices & Trends',
        badge: 'AGMARKNET Feeds',
        headline: 'Sell When and Where You Get Maximum Value.',
        description: 'Compare modal, minimum, and maximum rates across government APMC yards and eNAM platforms. Track 7-day arrivals and historical price shifts before transporting your crop.',
        buttonText: 'View Mandi Rates',
        points: [
          'Daily rates for 120+ commodities across APMCs and eNAM centers',
          'Proximity-sorted comparisons between district mandis to calculate transport ROI',
          '7-day price direction indicators and mandi arrival volume tracking'
        ]
      }
    }
  },
  hi: {
    sectionBadge: 'व्यावहारिक कृषि टूल्स',
    sectionTitle: 'आपकी वास्तविक खेती की जरूरतों के लिए निर्मित।',
    sectionDesc: 'हर टूल को भारतीय किसानों की जमीनी हकीकत को ध्यान में रखकर तैयार किया गया है—साफ भाषा, प्रामाणिक आंकड़े और सीधा फायदा।',
    realContext: 'वास्तविक कृषि संदर्भ',
    tabs: {
      doctor: {
        label: 'फसल डॉक्टर',
        badge: 'रोग पहचान',
        headline: 'पत्ती की तस्वीर लें, तुरंत रोग और जैविक उपचार जानें',
        description: 'अपने फोन के कैमरे से प्रभावित पत्ती या फल की तस्वीर लें। हमारा कृषि मॉडल पत्ती धब्बा, रतुआ, झुलसा या कीट प्रकोप को तुरंत पहचानकर ICAR-प्रमाणित उपाय बताता है।',
        buttonText: 'फसल डॉक्टर खोलें',
        points: [
          'पीला रतुआ, ब्लास्ट, शीथ ब्लाइट और माहू की पहचान',
          'रासायनिक के साथ-साथ नीम तेल व जैविक नियंत्रण विकल्प',
          'दवा छिड़काव की सही मात्रा और पानी का अनुपात'
        ]
      },
      soil: {
        label: 'मृदा स्वास्थ्य',
        badge: 'पोषण प्रबंधन',
        headline: 'अंधाधुंध खाद डालना बंद करें, वैज्ञानिक मात्रा अपनाएं',
        description: 'मिट्टी के pH और NPK स्तर के अनुसार खेत को आवश्यक खाद दें। यूरिया की बचत करें, फसल की लागत घटाएं और मिट्टी की प्राकृतिक उर्वरता बढ़ाएं।',
        buttonText: 'मृदा स्वास्थ्य जांचें',
        points: [
          'NPK अनुपात के आधार पर कस्टमाइज्ड बेसल व टॉप-ड्रेसिंग',
          'जिप्सम और चूना उपचार द्वारा अम्लीय व क्षारीय मिट्टी का सुधार',
          'सॉयल हेल्थ कार्ड अपलोड या मैन्युअल इनपुट दोनों समर्थित'
        ]
      },
      weather: {
        label: 'खेत का मौसम',
        badge: 'स्प्रे रडार',
        headline: 'मौसम के अनुसार सिंचाई और कीटनाशक छिड़काव की योजना बनाएं',
        description: 'बारिश से ठीक पहले छिड़काव करने से महंगी दवा धुल जाती है। KisaanBuddy आपको 7-दिवसीय रडार और उपयुक्त स्प्रे विंडो बताता है।',
        buttonText: 'मौसम पूर्वानुमान देखें',
        points: [
          'घंटे-दर-घंटे बारिश की संभावना और हवा की गति',
          'लू (हीटवेव) और पाला (फ्रॉस्ट) के लिए पहले से चेतावनी',
          'खेत के पिन कोड के आधार पर 7 दिनों का पूर्वानुमान'
        ]
      },
      mandi: {
        label: 'मंडी भाव व ट्रेंड',
        badge: 'eNAM लाइव रेट्स',
        headline: 'अपनी उपज बेचने से पहले 1,000+ मंडियों के ताज़ा भाव तुलना करें',
        description: 'पास की मंडियों में आज का न्यूनतम, अधिकतम और मॉडल भाव देखें। आढ़तियों पर निर्भर रहने के बजाय वास्तविक मंडी भाव के साथ मोलभाव करें।',
        buttonText: 'मंडी भाव देखें',
        points: [
          'गेहूं, धान, सरसों, कपास, आलू व 120+ फसलों के दैनिक भाव',
          'आस-पास की मंडियों के बीच दूरी व मूल्य की सीधी तुलना',
          'पिछले 7 से 30 दिनों का मूल्य रुझान और आवक डेटा'
        ]
      }
    }
  },
  kn: {
    sectionBadge: 'ಪ್ರಾಯೋಗಿಕ ಕೃಷಿ ಪರಿಕರಗಳು',
    sectionTitle: 'ನಿಮ್ಮ ನೈಜ ಕೃಷಿ ಅಗತ್ಯಗಳಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ.',
    sectionDesc: 'ಭಾರತೀಯ ರೈತರ ವಾಸ್ತವಿಕ ಪರಿಸ್ಥಿತಿಯನ್ನು ಗಮನದಲ್ಲಿಟ್ಟುಕೊಂಡು ಪ್ರತಿ ಪರಿಕರವನ್ನು ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ — ಸರಳ ಭಾಷೆ, ವಿಶ್ವಾಸಾರ್ಹ ಅಂಕಿಅಂಶಗಳು ಮತ್ತು ನೇರ ಪ್ರಯೋಜನ.',
    realContext: 'ನೈಜ ಕೃಷಿ ಸಂದರ್ಭ',
    tabs: {
      doctor: {
        label: 'ಬೆಳೆ ಡಾಕ್ಟರ್',
        badge: 'ರೋಗ ಪತ್ತೆ',
        headline: 'ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ, ತಕ್ಷಣವೇ ರೋಗ ಮತ್ತು ಸಾವಯವ ಪರಿಹಾರ ತಿಳಿಯಿರಿ',
        description: 'ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಿಂದ ಬಾಧಿತ ಎಲೆ ಅಥವಾ ಹಣ್ಣಿನ ಚಿತ್ರವನ್ನು ತೆಗೆಯಿರಿ. ನಮ್ಮ AI ಮಾದರಿಯು ಎಲೆ ಚುಕ್ಕೆ, ತುಕ್ಕು ರೋಗ, ರಸ ಹೀರುವ ಕೀಟಗಳನ್ನು ತಕ್ಷಣ ಗುರುತಿಸಿ ICAR-ದೃಢೀಕೃತ ಪರಿಹಾರಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ.',
        buttonText: 'ಬೆಳೆ ಡಾಕ್ಟರ್ ತೆರೆಯಿರಿ',
        points: [
          'ಹಳದಿ ತುಕ್ಕು, ಬ್ಲಾಸ್ಟ್, ಶೀತ್ ಬ್ಲೈಟ್ ಮತ್ತು ಸಸ್ಯಹೇನುಗಳ ಪತ್ತೆ',
          'ರಾಸಾಯನಿಕ ಜತೆಗೆ ಬೇವಿನ ಎಣ್ಣೆ ಹಾಗೂ ಜೈವಿಕ ನಿಯಂತ್ರಣ ಆಯ್ಕೆಗಳು',
          'ಔಷಧಿ ಸಿಂಪರಣೆಯ ನಿಖರ ಪ್ರಮಾಣ ಮತ್ತು ನೀರಿನ ಅನುಪಾತ'
        ]
      },
      soil: {
        label: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ',
        badge: 'ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆ',
        headline: 'ಅಂದಾಜಿನ ಮೇಲೆ ರಸಗೊಬ್ಬರ ಹಾಕುವುದನ್ನು ನಿಲ್ಲಿಸಿ, ವೈಜ್ಞಾನಿಕ ಪ್ರಮಾಣ ಬಳಸಿ',
        description: 'ಮಣ್ಣಿನ pH ಮತ್ತು NPK ಮಟ್ಟಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಗೊಬ್ಬರ ನೀಡಿ. ಯೂರಿಯಾ ಉಳಿಸಿ, ಉತ್ಪಾದನಾ ವೆಚ್ಚ ಕಡಿಮೆ ಮಾಡಿ ಮತ್ತು ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸಿ.',
        buttonText: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಪರೀಕ್ಷಿಸಿ',
        points: [
          'NPK ಅನುಪಾತದ ಆಧಾರದ ಮೇಲೆ ಕಸ್ಟಮೈಸ್ ಮಾಡಿದ ಗೊಬ್ಬರದ ವೇಳಾಪಟ್ಟಿ',
          'ಜಿಪ್ಸಮ್ ಮತ್ತು ಸುಣ್ಣದ ಚಿಕಿತ್ಸೆಯಿಂದ ಆಮ್ಲೀಯ ಹಾಗೂ ಕ್ಷಾರೀಯ ಮಣ್ಣಿನ ಸುಧಾರಣೆ',
          'ಸಾಯಿಲ್ ಹೆಲ್ತ್ ಕಾರ್ಡ್ ಅಪ್ಲೋಡ್ ಅಥವಾ ಅಂದಾಜು ನಮೂದು ಎರಡಕ್ಕೂ ಬೆಂಬಲ'
        ]
      },
      weather: {
        label: 'ಜಮೀನಿನ ಹವಾಮಾನ',
        badge: 'ಸ್ಪ್ರೇ ರಾಡಾರ್',
        headline: 'ಹವಾಮಾನಕ್ಕೆ ಅನುಗುಣವಾಗಿ ನೀರಾವರಿ ಮತ್ತು ಕೀಟನಾಶಕ ಸಿಂಪರಣೆ ಯೋಜನೆ',
        description: 'ಮಳೆಗೆ ಮುಂಚೆ ಸಿಂಪಡಿಸಿದರೆ ದುಬಾರಿ ಔಷಧಿ ವ್ಯರ್ಥವಾಗುತ್ತದೆ. KisaanBuddy ನಿಮಗೆ 7 ದಿನಗಳ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಸೂಕ್ತ ಸ್ಪ್ರೇ ಅವಧಿಯನ್ನು ತಿಳಿಸುತ್ತದೆ.',
        buttonText: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ನೋಡಿ',
        points: [
          'ಗಂಟೆ-ಗಂಟೆಯ ಮಳೆ ಸಾಧ್ಯತೆ ಮತ್ತು ಗಾಳಿಯ ವೇಗ',
          'ಬಿಸಿಗಾಳಿ (ಹೀಟ್‌ವೇವ್) ಮತ್ತು ಹಿಮಪಾತದ ಮುಂಚಿತ ಮುನ್ನೆಚ್ಚರಿಕೆ',
          'ಜಮೀನಿನ ಪಿನ್ ಕೋಡ್ ಆಧಾರದ ಮೇಲೆ 7 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ'
        ]
      },
      mandi: {
        label: 'ಮಂಡಿ ದರಗಳು ಮತ್ತು ಟ್ರೆಂಡ್‌ಗಳು',
        badge: 'eNAM ಲೈವ್ ದರಗಳು',
        headline: 'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಮಾರಾಟ ಮಾಡುವ ಮುನ್ನ 1,000+ ಮಂಡಿಗಳ ಇತ್ತೀಚಿನ ದರಗಳನ್ನು ಹೋಲಿಸಿ',
        description: 'ಹತ್ತಿರದ ಮಂಡಿಗಳಲ್ಲಿ ಇಂದಿನ ಕನಿಷ್ಠ, ಗರಿಷ್ಠ ಮತ್ತು ಮಾದರಿ ದರಗಳನ್ನು ನೋಡಿ. ಮಧ್ಯವರ್ತಿಗಳನ್ನು ಅವಲಂಬಿಸುವ ಬದಲು ನೈಜ ಮಂಡಿ ದರಗಳೊಂದಿಗೆ ಚೌಕಾಶಿ ಮಾಡಿ.',
        buttonText: 'ಮಂಡಿ ದರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
        points: [
          'ಗೋಧಿ, ಭತ್ತ, ಸಾಸಿವೆ, ಹತ್ತಿ, ಆಲೂಗಡ್ಡೆ ಹಾಗೂ 120+ ಬೆಳೆಗಳ ದೈನಂದಿನ ದರಗಳು',
          'ಹತ್ತಿರದ ಮಂಡಿಗಳ ನಡುವೆ ಸಾರಿಗೆ ವೆಚ್ಚ ಮತ್ತು ದರಗಳ ನೇರ ಹೋಲಿಕೆ',
          'ಕಳೆದ 7 ರಿಂದ 30 ದಿನಗಳ ಬೆಲೆ ಟ್ರೆಂಡ್ ಮತ್ತು ಒಳಹರಿವು ಡೇಟಾ'
        ]
      }
    }
  },
  mr: {
    sectionBadge: 'शेतीसाठी सज्ज टूल्स',
    sectionTitle: 'तुमच्या प्रत्यक्ष शेतीच्या गरजांसाठी तयार केलेले.',
    sectionDesc: 'प्रत्येक टूल भारतीय शेतकऱ्यांच्या जमिनीवरील गरजा लक्षात घेऊन तयार केले गेले आहे - सोपी भाषा, विश्वसनीय डेटा आणि थेट फायदा.',
    realContext: 'वास्तविक शेती संदर्भ',
    tabs: {
      doctor: {
        label: 'पीक डॉक्टर',
        badge: 'रोग निदान',
        headline: 'पानाचा फोटो घ्या, त्वरित रोग आणि सेंद्रिय उपाय जाणून घ्या',
        description: 'आपल्या फोनच्या कॅमेऱ्याने बाधित पानाचा किंवा फळाचा फोटो काढा. आमचे AI मॉडेल तांबेरा, करपा, कीड त्वरित ओळखून ICAR-प्रमाणित उपाय देते.',
        buttonText: 'पीक डॉक्टर उघडा',
        points: [
          'पिवळा तांबेरा, ब्लास्ट, शेंदरी बोंडअळी व मावा यांची अचूक ओळख',
          'रासायनिक सोबतच निंबोळी अर्क व जैविक नियंत्रणाचे पर्याय',
          'औषध फवारणीचे एकरी अचूक प्रमाण आणि पाण्याचे प्रमाण'
        ]
      },
      soil: {
        label: 'माती आरोग्य व NPK',
        badge: 'पोषण व्यवस्थापन',
        headline: 'अंदाजाने खते देणे थांबवा, वैज्ञानिक प्रमाण वापरा',
        description: 'मातीच्या pH आणि NPK पातळीनुसार खतांची योग्य मात्रा द्या. युरियाची बचत करा, उत्पादन खर्च कमी करा आणि जमिनीची सुपीकता वाढवा.',
        buttonText: 'माती आरोग्य तपासा',
        points: [
          'NPK गुणोत्तरावर आधारित पिकांच्या टप्प्यांनुसार खत व्यवस्थापन',
          'जिप्सम व चुना उपचाराद्वारे आम्ल किंवा क्षारयुक्त माती सुधारणा',
          'सॉइल हेल्थ कार्ड अपलोड किंवा जलद मॅन्युअल इनपुट'
        ]
      },
      weather: {
        label: 'शेतातील हवामान',
        badge: 'स्प्रे रडार',
        headline: 'हवामानानुसार पाणी आणि फवारणीचे नियोजन करा',
        description: 'पावसाच्या आधी फवारणी केल्यास महागडी औषधे वाहून जातात. KisaanBuddy तुम्हाला ७ दिवसांचा अंदाज आणि फवारणीची योग्य वेळ सांगते.',
        buttonText: 'हवामान अंदाज पहा',
        points: [
          'तासागणिक पावसाची शक्यता आणि सुरक्षित फवारणीसाठी वाऱ्याचा वेग',
          'उष्णतेची लाट व अवकाळी पावसाची पूर्वसूचना',
          'पिन कोडनुसार ७ दिवसांचा स्थानिक हवामान अंदाज'
        ]
      },
      mandi: {
        label: 'बाजारभाव व ट्रेंड',
        badge: 'eNAM थेट दर',
        headline: 'माल विकण्यापूर्वी १,०००+ बाजार समित्यांचे आजचे भाव तपासा',
        description: 'जवळच्या बाजार समित्यांमधील आजचे किमान, कमाल आणि सरासरी भाव पहा. दलालांवर अवलंबून न राहता थेट अचूक भावासह व्यवहार करा.',
        buttonText: 'बाजारभाव पहा',
        points: [
          'कांदा, सोयाबीन, कापूस, गहू यांसह १२०+ पिकांचे दैनिक भाव',
          'जवळच्या बाजारांमधील अंतर व दरांची थेट तुलना',
          'मागील ७ ते ३० दिवसांचे बाजारभाव कल व आवक'
        ]
      }
    }
  },
  te: {
    sectionBadge: 'ప్రాక్టికల్ వ్యవసాయ టూల్స్',
    sectionTitle: 'మీ వాస్తవ వ్యవసాయ అవసరాల కోసం రూపొందించబడింది.',
    sectionDesc: 'భారతీయ రైతుల క్షేత్రస్థాయి అవసరాలకు అనుగుణంగా ప్రతి సాధనం రూపొందించబడింది - సరళమైన భాష, విశ్వసనీయ డేటా మరియు ప్రత్యక్ష ప్రయోజనం.',
    realContext: 'వాస్తవ వ్యవసాయ సందర్భం',
    tabs: {
      doctor: {
        label: 'పంట డాక్టర్',
        badge: 'వ్యాధి నిర్ధారణ',
        headline: 'ఆకు ఫోటో తీయండి, వెంటనే వ్యాధి మరియు నివారణ మార్గాలు తెలుసుకోండి',
        description: 'మీ ఫోన్ కెమెరాతో తెగులు సోకిన ఆకు లేదా కాయ ఫోటో తీయండి. మా AI మోడల్ తెగుళ్లు, పురుగుల నష్టాన్ని సెకన్లలో గుర్తించి ICAR ఆధారిత పరిష్కారాలను సూచిస్తుంది.',
        buttonText: 'పంట డాక్టర్ ప్రారంభించండి',
        points: [
          'తుప్పు తెగులు, బ్లాస్ట్, అగ్గి తెగులు మరియు పేనుబంక గుర్తింపు',
          'రసాయన మందులతో పాటు వేప నూనె, ట్రైకోడెర్మా వంటి సేంద్రీయ ఎంపికలు',
          'ఎకరానికి పిచికారీ చేయాల్సిన ఖచ్చితమైన మోతాదు మరియు నీటి నిష్పత్తి'
        ]
      },
      soil: {
        label: 'నేల ఆరోగ్యం & NPK',
        badge: 'పోషకాల నిర్వహణ',
        headline: 'అంచనాతో ఎరువులు వేయడం ఆపండి, శాస్త్రీయ పద్ధతి పాటించండి',
        description: 'నేల pH మరియు NPK స్థాయిలకు అనుగుణంగా ఎరువులు వేయండి. యూరియా వాడకాన్ని తగ్గించి, పెట్టుబడి ఖర్చులను ఆదా చేయండి.',
        buttonText: 'నేల ఆరోగ్యం పరిశీలించండి',
        points: [
          'NPK నిష్పత్తి ఆధారంగా పంట దశలవారీ ఎరువుల ప్రణాళిక',
          'జిప్సం మరియు సున్నం చికిత్స ద్వారా ఆమ్ల, క్షార నేలల పునరుద్ధరణ',
          'సాయిల్ హెల్త్ కార్డ్ అప్‌లోడ్ లేదా శీఘ్ర ఫీల్డ్ నమోదు'
        ]
      },
      weather: {
        label: 'పొలం వాతావరణం',
        badge: 'స్ప్రే రాడార్',
        headline: 'వాతావరణం ప్రకారం నీటి పారుదల మరియు మందుల పిచికారీ ప్లాన్ చేయండి',
        description: 'వర్షం పడే ముందు పిచికారీ చేస్తే మందు వృధా అవుతుంది. KisaanBuddy 7 రోజుల సూచన మరియు సురక్షితమైన పిచికారీ సమయాన్ని తెలుపుతుంది.',
        buttonText: 'వాతావరణం చూడండి',
        points: [
          'గంటవారీ వర్షపాత సంభావ్యత మరియు గాలి వేగం',
          'తీవ్ర ఎండలు మరియు అకాల వర్షాల ముందస్తు హెచ్చరికలు',
          'పిన్ కోడ్ ఆధారంగా 7 రోజుల వ్యవసాయ వాతావరణ సూచన'
        ]
      },
      mandi: {
        label: 'మార్కెట్ ధరలు & ట్రెండ్స్',
        badge: 'eNAM లైవ్ రేట్లు',
        headline: 'మీ పంట అమ్మే ముందు 1,000+ మార్కెట్ల తాజా ధరలను పోల్చండి',
        description: 'సమీప మార్కెట్లలో నేటి కనీస, గరిష్ట మరియు సగటు ధరలను చూడండి. దళారుల ప్రమేయం లేకుండా సరైన ధరతో వ్యాపారం చేయండి.',
        buttonText: 'మార్కెట్ ధరలు చూడండి',
        points: [
          'వరి, పత్తి, మిరప, మొక్కజొన్న సహా 120+ పంటల రోజువారీ ధరలు',
          'సమీప మార్కెట్ల మధ్య రవాణా ఖర్చు మరియు ధరల పోలిక',
          'గత 7 నుండి 30 రోజుల ధరల సరళి మరియు రాక డేటా'
        ]
      }
    }
  },
  ta: {
    sectionBadge: 'நடைமுறை விவசாய கருவிகள்',
    sectionTitle: 'உங்கள் உண்மையான விவசாயத் தேவைகளுக்காக உருவாக்கப்பட்டது.',
    sectionDesc: 'இந்திய விவசாயிகளின் கள யதார்த்தங்களை மனதில் கொண்டு ஒவ்வொரு கருவியும் வடிவமைக்கப்பட்டுள்ளது — எளிய மொழி, நம்பகமான தரவு மற்றும் நேரடி பலன்.',
    realContext: 'உண்மையான விவசாய சூழல்',
    tabs: {
      doctor: {
        label: 'பயிர் டாக்டர்',
        badge: 'நோய் கண்டறிதல்',
        headline: 'இலையை படம் பிடியுங்கள், உடனே நோய் மற்றும் இயற்கை தீர்வுகளை அறியுங்கள்',
        description: 'உங்கள் மொபைல் கேமரா மூலம் பாதிக்கப்பட்ட இலை அல்லது காயை படம் எடுங்கள். எங்கள் AI மாதிரி பூஞ்சை, பாக்டீரியா மற்றும் பூச்சித் தாக்குதல்களை உடனடியாகக் கண்டறிந்து ICAR தீர்வளிக்கிறது.',
        buttonText: 'பயிர் டாக்டரை திறக்கவும்',
        points: [
          'மஞ்சள் துரு, பிளாஸ்ட், இலைக்கருகல் மற்றும் அசுவினி பூச்சிகளை கண்டறியும்',
          'இரசாயன மருந்துகளுடன் வேப்ப எண்ணெய் மற்றும் உயிரியல் கட்டுப்பாட்டு முறைகள்',
          'ஏக்கருக்கான சரியான தெளிப்பு அளவு மற்றும் நீர் விகிதம்'
        ]
      },
      soil: {
        label: 'மண் வளம் & NPK',
        badge: 'ஊட்டச்சத்து மேலாண்மை',
        headline: 'தோராயமாக உரமிடுவதை நிறுத்துங்கள், அறிவியல் அளவைப் பின்பற்றுங்கள்',
        description: 'மண்ணின் pH மற்றும் NPK அளவுக்கு ஏற்ப உரமிடுங்கள். யூரியாவை மிச்சப்படுத்துங்கள், சாகுபடி செலவைக் குறைத்து நிலத்தின் வளத்தை பெருக்குங்கள்.',
        buttonText: 'மண் வளத்தை சோதிக்கவும்',
        points: [
          'NPK விகிதத்தின் அடிப்படையில் பயிர் நிலைகளுக்கான தனிப்பயன் உர திட்டம்',
          'ஜிப்சம் மற்றும் சுண்ணாம்பு மூலம் அமில மற்றும் கார மண்ணை சீரமைத்தல்',
          'மண் வள அட்டை பதிவேற்றம் அல்லது நேரடி உள்ளீட்டு வசதி'
        ]
      },
      weather: {
        label: 'பண்ணை வானிலை',
        badge: 'தெளிப்பு ரேடார்',
        headline: 'வானிலைக்கு ஏற்ப பாசனம் மற்றும் மருந்து தெளிப்பை திட்டமிடுங்கள்',
        description: 'மழைக்கு முன் தெளித்தால் மருந்துகள் வீணாகிவிடும். KisaanBuddy உங்களுக்கு 7 நாள் முன்னறிவிப்பு மற்றும் சரியான தெளிப்பு நேரத்தை வழங்குகிறது.',
        buttonText: 'வானிலை முன்னறிவிப்பு',
        points: [
          'மணிநேர மழை வாய்ப்பு மற்றும் பாதுகாப்பான தெளிப்புக்கான காற்றின் வேகம்',
          'வெப்ப அலை மற்றும் எதிர்பாராத மழைக் குறித்த முன்கூட்டிய எச்சரிக்கைகள்',
          'பின்கோடு அடிப்படையிலான 7 நாள் விரிவான வானிலை முன்னறிவிப்பு'
        ]
      },
      mandi: {
        label: 'மண்டி விலைகள் & போக்குகள்',
        badge: 'eNAM நேரலை விலைகள்',
        headline: 'பயிரை விற்பனை செய்வதற்கு முன் 1,000+ மண்டிகளின் விலைகளை ஒப்பிடுங்கள்',
        description: 'அருகிலுள்ள மண்டிகளில் இன்றைய குறைந்தபட்ச, அதிகபட்ச மற்றும் மாதிரி விலைகளைக் காண்க. இடைத்தரகர்களை நம்பாமல் உண்மையான விலையை அறிந்து பேரம் பேசுங்கள்.',
        buttonText: 'மண்டி விலைகளைக் காண்க',
        points: [
          'நெல், பருத்தி, கரும்பு, காய்கறிகள் உள்ளிட்ட 120+ பயிர்களின் தினசரி விலை',
          'அருகிலுள்ள மண்டிகளுக்கு இடையிலான தூரம் மற்றும் விலைகளின் நேரடி ஒப்பீடு',
          'கடந்த 7 முதல் 30 நாட்களின் விலை போக்கு மற்றும் வரத்து விவரங்கள்'
        ]
      }
    }
  },
  gu: {
    sectionBadge: 'વ્યવહારુ કૃષિ સાધનો',
    sectionTitle: 'તમારી વાસ્તવિક ખેતીની જરૂરિયાતો માટે નિર્મિત.',
    sectionDesc: 'દરેક ટૂલ ભારતીય ખેડૂતોની જમીની વાસ્તવિકતાને ધ્યાનમાં રાખીને બનાવવામાં આવ્યું છે — સરળ ભાષા, પ્રમાણિત આંકડા અને સીધો ફાયદો.',
    realContext: 'વાસ્તવિક કૃષિ સંદર્ભ',
    tabs: {
      doctor: {
        label: 'પાક ડૉક્ટર',
        badge: 'રોગ નિદાન',
        headline: 'પાનનો ફોટો લો, તરત જ રોગ અને જૈવિક ઉપચાર જાણો',
        description: 'મોબાઈલ કેમેરાથી રોગગ્રસ્ત પાન અથવા ફળનો ફોટો લો. અમારું AI મોડેલ ફંગલ, બેક્ટેરિયલ અને જીવાતોને તરત જ ઓળખીને ICAR-પ્રમાણિત ઉપાય જણાવે છે.',
        buttonText: 'પાક ડૉક્ટર ખોલો',
        points: [
          'પીળો ગેરુ, બ્લાસ્ટ, સુકારો અને મોલોમશીની સચોટ ઓળખ',
          'રાસાયણિક સાથે લીમડાનું તેલ અને જૈવિક નિયંત્રણ વિકલ્પો',
          'એકર દીઠ દવાનો યોગ્ય ડોઝ અને પાણીનું પ્રમાણ'
        ]
      },
      soil: {
        label: 'જમીન આરોગ્ય અને NPK',
        badge: 'પોષણ વ્યવસ્થાપન',
        headline: 'અંદાજે ખાતર નાખવાનું બંધ કરો, વૈજ્ઞાનિક પદ્ધતિ અપનાવો',
        description: 'જમીનના pH અને NPK સ્તર અનુસાર ખાતર આપો. યુરિયા બચાવો, ખર્ચ ઘટાડો અને જમીનની ફળદ્રુપતા વધારો.',
        buttonText: 'જમીન આરોગ્ય ચકાસો',
        points: [
          'NPK રેશિયો મુજબ પાકના તબક્કાવાર ખાતર આયોજન',
          'જીપ્સમ અને ચૂનાના ઉપયોગ દ્વારા જમીન સુધારણા સલાહ',
          'સોઇલ હેલ્થ કાર્ડ અપલોડ અથવા મેન્યુઅલ ઇનપુટ સમર્થન'
        ]
      },
      weather: {
        label: 'ખેતરનું હવામાન',
        badge: 'સ્પ્રે રડાર',
        headline: 'હવામાન અનુસાર પિયત અને દવાનો છંટકાવ પ્લાન કરો',
        description: 'વરસાદ પહેલાં છંટકાવ કરવાથી મોંઘી દવા ધોવાઈ જાય છે. KisaanBuddy તમને 7 દિવસનું અનુમાન અને છંટકાવનો યોગ્ય સમય જણાવે છે.',
        buttonText: 'હવામાન અનુમાન જુઓ',
        points: [
          'કલાક દીઠ વરસાદની શક્યતા અને પવનની ઝડપ',
          'હીટવેવ અને કમોસમી વરસાદ માટે અગાઉથી ચેતવણી',
          'પિન કોડ આધારિત 7 દિવસનું ખેતી હવામાન અનુમાન'
        ]
      },
      mandi: {
        label: 'મંડી ભાવો અને વલણો',
        badge: 'eNAM લાઈવ ભાવો',
        headline: 'પાક વેચતા પહેલાં 1,000+ માર્કેટિંગ યાર્ડના તાજા ભાવો સરખાવો',
        description: 'નજીકના માર્કેટ યાર્ડમાં આજનો લઘુત્તમ, મહત્તમ અને મોડલ ભાવ જુઓ. દલાલો પર નિર્ભર રહેવાને બદલે સાચા ભાવ જાણી સોદો કરો.',
        buttonText: 'મંડી ભાવ જુઓ',
        points: [
          'કપાસ, મગફળી, ઘઉં, જીરું સહિત 120+ પાકોના દૈનિક ભાવો',
          'નજીકના યાર્ડ વચ્ચે અંતર અને ભાવોની સીધી સરખામણી',
          'છેલ્લા 7 થી 30 દિવસના ભાવ વલણો અને આવક ડેટા'
        ]
      }
    }
  },
  bn: {
    sectionBadge: 'ব্যবহারিক কৃষি সরঞ্জাম',
    sectionTitle: 'আপনার আসল চাষের প্রয়োজনের জন্য নির্মিত।',
    sectionDesc: 'প্রতিটি টুল ভারতীয় কৃষকদের বাস্তব পরিস্থিতির কথা মাথায় রেখে ডিজাইন করা হয়েছে — সহজ ভাষা, নির্ভরযোগ্য ডেটা এবং সরাসরি সুবিধা।',
    realContext: 'আসল কৃষি প্রসঙ্গ',
    tabs: {
      doctor: {
        label: 'ফসল ডাক্তার',
        badge: 'রোগ নির্ণয়',
        headline: 'পাতার ছবি তুলুন, তাৎক্ষণিকভাবে রোগ ও জৈব প্রতিকার জানুন',
        description: 'মোবাইল ক্যামেরা দিয়ে আক্রান্ত পাতা বা ফলের ছবি তুলুন। আমাদের AI মডেল ছত্রাক, ব্যাকটেরিয়া এবং কীটপতঙ্গের ক্ষতি কয়েক সেকেন্ডে শনাক্ত করে ICAR প্রতিকার জানায়।',
        buttonText: 'ফসল ডাক্তার খুলুন',
        points: [
          'হলুদ মরিচা, ব্লাস্ট, শীথ ব্লাইট ও জাবপোকা শনাক্তকরণ',
          'রাসায়নিকের পাশাপাশি নিম তেল ও জৈব নিয়ন্ত্রণের বিকল্প',
          'একর প্রতি ওষুধের সঠিক ডোজ ও জলের অনুপাত'
        ]
      },
      soil: {
        label: 'মাটি স্বাস্থ্য ও NPK',
        badge: 'পুষ্টি ব্যবস্থাপনা',
        headline: 'অনুমান করে সার দেওয়া বন্ধ করুন, বৈজ্ঞানিক মাত্রা মানুন',
        description: 'মাটির pH এবং NPK স্তর অনুযায়ী সার প্রয়োগ করুন। ইউরিয়া বাঁচান, চাষের খরচ কমান এবং মাটির উর্বরতা বাড়ান।',
        buttonText: 'মাটির স্বাস্থ্য পরীক্ষা করুন',
        points: [
          'NPK অনুপাতের ভিত্তিতে ফসলের পর্যায়ক্রমিক সার পরিকল্পনা',
          'জিপসাম ও চুন প্রয়োগের মাধ্যমে আম্লিক ও ক্ষারীয় মাটির সংস্কার',
          'সয়েল হেলথ কার্ড আপলোড বা দ্রুত ফিল্ড ইনপুট'
        ]
      },
      weather: {
        label: 'খামারের আবহাওয়া',
        badge: 'স্প্রে রাডার',
        headline: 'আবহাওয়া অনুযায়ী সেচ এবং কীটনাশক স্প্রে করার পরিকল্পনা করুন',
        description: 'বৃষ্টির ঠিক আগে স্প্রে করলে দামি ওষুধ ধুয়ে যায়। KisaanBuddy আপনাকে ৭ দিনের পূর্বাভাস এবং স্প্রে করার সঠিক সময় জানায়।',
        buttonText: 'আবহাওয়ার পূর্বাভাস দেখুন',
        points: [
          'ঘন্টায় ঘন্টায় বৃষ্টির সম্ভাবনা ও বাতাসের গতিবেগ',
          'তাপপ্রবাহ ও অকাল বৃষ্টির আগাম সতর্কতা',
          'পিন কোড ভিত্তিক ৭ দিনের কৃষি আবহাওয়ার পূর্বাভাস'
        ]
      },
      mandi: {
        label: 'মান্ডি দর ও প্রবণতা',
        badge: 'eNAM লাইভ দর',
        headline: 'ফসল বিক্রির আগে ১,০০০+ মান্ডির দর তুলনা করুন',
        description: 'কাছের মান্ডিতে আজকের ন্যূনতম, সর্বাধিক এবং মডেল দর দেখুন। দালালদের উপর নির্ভর না করে সঠিক তথ্যের সাথে দরদাম করুন।',
        buttonText: 'মান্ডি দর দেখুন',
        points: [
          'ধান, পাট, আলু, গম সহ ১২০+ ফসলের দৈনিক দর',
          'কাছের মান্ডিগুলির মধ্যে দূরত্ব ও দরের সরাসরি তুলনা',
          'গত ৭ থেকে ৩০ দিনের দামের ধারা ও আমদানি তথ্য'
        ]
      }
    }
  },
  pa: {
    sectionBadge: 'ਵਿਹਾਰਕ ਖੇਤੀ ਸੰਦ',
    sectionTitle: 'ਤੁਹਾਡੀਆਂ ਅਸਲ ਖੇਤੀ ਲੋੜਾਂ ਲਈ ਤਿਆਰ ਕੀਤਾ ਗਿਆ।',
    sectionDesc: 'ਹਰੇਕ ਟੂਲ ਨੂੰ ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਦੀਆਂ ਜ਼ਮੀਨੀ ਹਕੀਕਤਾਂ ਨੂੰ ਧਿਆਨ ਵਿੱਚ ਰੱਖ ਕੇ ਤਿਆਰ ਕੀਤਾ ਗਿਆ ਹੈ — ਸਰਲ ਭਾਸ਼ਾ, ਭਰੋਸੇਯੋਗ ਅੰਕੜੇ ਅਤੇ ਸਿੱਧਾ ਲਾਭ।',
    realContext: 'ਅਸਲ ਖੇਤੀ ਸੰਦਰਭ',
    tabs: {
      doctor: {
        label: 'ਫਸਲ ਡਾਕਟਰ',
        badge: 'ਰੋਗ ਪਛਾਣ',
        headline: 'ਪੱਤੇ ਦੀ ਫੋਟੋ ਲਓ, ਤੁਰੰਤ ਰੋਗ ਅਤੇ ਜੈਵਿਕ ਇਲਾਜ ਜਾਣੋ',
        description: 'ਆਪਣੇ ਫ਼ੋਨ ਦੇ ਕੈਮਰੇ ਨਾਲ ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਦੀ ਫੋਟੋ ਖਿੱਚੋ। ਸਾਡਾ AI ਮਾਡਲ ਪੀਲਾ ਰਤੂਆ, ਝੁਲਸਾ ਰੋਗ ਜਾਂ ਕੀੜਿਆਂ ਦੇ ਹਮਲੇ ਨੂੰ ਤੁਰੰਤ ਪਛਾਣ ਕੇ ICAR-ਪ੍ਰਮਾਣਿਤ ਹੱਲ ਦੱਸਦਾ ਹੈ।',
        buttonText: 'ਫਸਲ ਡਾਕਟਰ ਖੋਲ੍ਹੋ',
        points: [
          'ਪੀਲਾ ਰਤੂਆ, ਬਲਾਸਟ, ਸ਼ੀਥ ਬਲਾਈਟ ਅਤੇ ਤੇਲੇ ਦੀ ਪਛਾਣ',
          'ਰਸਾਇਣਕ ਦੇ ਨਾਲ ਨਿੰਮ ਦਾ ਤੇਲ ਅਤੇ ਜੈਵਿਕ ਰੋਕਥਾਮ ਦੇ ਵਿਕਲਪ',
          'ਸਪਰੇਅ ਦੀ ਪ੍ਰਤੀ ਏਕੜ ਸਹੀ ਮਾਤਰਾ ਅਤੇ ਪਾਣੀ ਦਾ ਅਨੁਪਾਤ'
        ]
      },
      soil: {
        label: 'ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਅਤੇ NPK',
        badge: 'ਖੁਰਾਕ ਪ੍ਰਬੰਧਨ',
        headline: 'ਅੰਦਾਜ਼ੇ ਨਾਲ ਖਾਦ ਪਾਉਣੀ ਬੰਦ ਕਰੋ, ਵਿਗਿਆਨਕ ਮਾਤਰਾ ਅਪਣਾਓ',
        description: 'ਮਿੱਟੀ ਦੇ pH ਅਤੇ NPK ਪੱਧਰ ਅਨੁਸਾਰ ਲੋੜੀਂਦੀ ਖਾਦ ਪਾਓ। ਯੂਰੀਆ ਦੀ ਬੱਚਤ ਕਰੋ, ਲਾਗਤ ਘਟਾਓ ਅਤੇ ਜ਼ਮੀਨ ਦੀ ਉਪਜਾਊ ਸ਼ਕਤੀ ਵਧਾਓ।',
        buttonText: 'ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਜਾਂਚੋ',
        points: [
          'NPK ਅਨੁਪਾਤ ਦੇ ਆਧਾਰ ਤੇ ਫਸਲ ਦੇ ਪੜਾਵਾਂ ਅਨੁਸਾਰ ਖਾਦ ਯੋਜਨਾ',
          'ਜਿਪਸਮ ਅਤੇ ਚੂਨੇ ਦੇ ਇਲਾਜ ਰਾਹੀਂ ਤੇਜ਼ਾਬੀ ਤੇ ਖਾਰੀ ਮਿੱਟੀ ਦਾ ਸੁਧਾਰ',
          'ਸੋਇਲ ਹੈਲਥ ਕਾਰਡ ਅੱਪਲੋਡ ਜਾਂ ਤੇਜ਼ ਮੈਨੂਅਲ ਐਂਟਰੀ'
        ]
      },
      weather: {
        label: 'ਖੇਤ ਦਾ ਮੌਸਮ',
        badge: 'ਸਪਰੇਅ ਰਾਡਾਰ',
        headline: 'ਮੌਸਮ ਅਨੁਸਾਰ ਸਿੰਚਾਈ ਅਤੇ ਸਪਰੇਅ ਦੀ ਯੋਜਨਾ ਬਣਾਓ',
        description: 'ਮੀਂਹ ਤੋਂ ਠੀਕ ਪਹਿਲਾਂ ਸਪਰੇਅ ਕਰਨ ਨਾਲ ਮਹਿੰਗੀ ਦਵਾਈ ਵਹਿ ਜਾਂਦੀ ਹੈ। KisaanBuddy ਤੁਹਾਨੂੰ 7 ਦਿਨਾਂ ਦਾ ਅਨੁਮਾਨ ਅਤੇ ਸਹੀ ਸਮਾਂ ਦੱਸਦਾ ਹੈ।',
        buttonText: 'ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ ਦੇਖੋ',
        points: [
          'ਘੰਟੇ-ਵਾਰ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਅਤੇ ਸੁਰੱਖਿਅਤ ਸਪਰੇਅ ਲਈ ਹਵਾ ਦੀ ਗਤੀ',
          'ਗਰਮੀ ਦੀ ਲਹਿਰ ਅਤੇ ਬੇਮੌਸਮੀ ਮੀਂਹ ਲਈ ਪਹਿਲਾਂ ਹੀ ਚੇਤਾਵਨੀ',
          'ਪਿੰਨ ਕੋਡ ਦੇ ਆਧਾਰ ਤੇ 7 ਦਿਨਾਂ ਦਾ ਖੇਤੀ ਮੌਸਮ ਅਨੁਮਾਨ'
        ]
      },
      mandi: {
        label: 'ਮੰਡੀ ਭਾਅ ਅਤੇ ਰੁਝਾਨ',
        badge: 'eNAM ਲਾਈਵ ਭਾਅ',
        headline: 'ਫਸਲ ਵੇਚਣ ਤੋਂ ਪਹਿਲਾਂ 1,000+ ਮੰਡੀਆਂ ਦੇ ਤਾਜ਼ਾ ਭਾਅ ਮਿਲਾਓ',
        description: 'ਨੇੜਲੀਆਂ ਮੰਡੀਆਂ ਵਿੱਚ ਅੱਜ ਦਾ ਘੱਟੋ-ਘੱਟ, ਵੱਧ ਤੋਂ ਵੱਧ ਅਤੇ ਮਾਡਲ ਭਾਅ ਦੇਖੋ। ਆੜ੍ਹਤੀਆਂ ਤੇ ਨਿਰਭਰ ਰਹਿਣ ਦੀ ਬਜਾਏ ਸਹੀ ਭਾਅ ਨਾਲ ਸੌਦਾ ਕਰੋ।',
        buttonText: 'ਮੰਡੀ ਭਾਅ ਦੇਖੋ',
        points: [
          'ਕਣਕ, ਝੋਨਾ, ਸਰ੍ਹੋਂ, ਨਰਮਾ ਸਮੇਤ 120+ ਫਸਲਾਂ ਦੇ ਰੋਜ਼ਾਨਾ ਭਾਅ',
          'ਨੇੜਲੀਆਂ ਮੰਡੀਆਂ ਵਿਚਕਾਰ ਦੂਰੀ ਅਤੇ ਭਾਅ ਦੀ ਸਿੱਧੀ ਤੁਲਨਾ',
          'ਪਿਛਲੇ 7 ਤੋਂ 30 ਦਿਨਾਂ ਦਾ ਮੁੱਲ ਰੁਝਾਨ ਅਤੇ ਆਮਦ ਡੇਟਾ'
        ]
      }
    }
  },
  ml: {
    sectionBadge: 'പ്രായോഗിക കാർഷിക ഉപകരണങ്ങൾ',
    sectionTitle: 'നിങ്ങളുടെ യഥാർത്ഥ കാർഷിക ആവശ്യങ്ങൾക്കായി നിർമ്മിച്ചത്.',
    sectionDesc: 'ഇന്ത്യൻ കർഷകരുടെ ആവശ്യങ്ങൾ മുൻനിർത്തിയാണ് ഓരോ ടൂളും വികസിപ്പിച്ചിരിക്കുന്നത് — ലളിതമായ ഭാഷ, വിശ്വസനീയ വിവരങ്ങൾ, നേരിട്ടുള്ള പ്രയോജനം.',
    realContext: 'യഥാർത്ഥ കാർഷിക പശ്ചാത്തലം',
    tabs: {
      doctor: {
        label: 'വിള ഡോക്ടർ',
        badge: 'രോഗ നിർണയം',
        headline: 'ഇലയുടെ ഫോട്ടോ എടുക്കുക, ഉടനടി രോഗവും ജൈവ പരിഹാരവും അറിയുക',
        description: 'മൊബൈൽ ക്യാമറ ഉപയോഗിച്ച് രോഗം ബാധിച്ച ഇലയുടെ ചിത്രം എടുക്കുക. ഞങ്ങളുടെ AI മോഡൽ ഫംഗസ്, ബാക്ടീരിയ, കീടബാധ എന്നിവ തിരിച്ചറിഞ്ഞ് ICAR പരിഹാരങ്ങൾ നൽകുന്നു.',
        buttonText: 'വിള ഡോക്ടർ തുറക്കുക',
        points: [
          'തുരുമ്പ് രോഗം, ബ്ലാസ്റ്റ്, ഇലപ്പുള്ളി, മുഞ്ഞ എന്നിവ കണ്ടെത്തുന്നു',
          'രാസവളങ്ങൾക്കൊപ്പം വേപ്പെണ്ണയും ജൈവ നിയന്ത്രണ മാർഗ്ഗങ്ങളും',
          'ഏക്കറിന് തളിക്കേണ്ട മരുന്നിന്റെ കൃത്യമായ അളവും വെള്ളത്തിന്റെ അനുപാതവും'
        ]
      },
      soil: {
        label: 'മണ്ണ് ആരോഗ്യവും NPK യും',
        badge: 'പോഷക മാനേജ്‌മെന്റ്',
        headline: 'ഊഹിച്ചു വളപ്രയോഗം നടത്തുന്നത് നിർത്തുക, ശാസ്ത്രീയ അളവ് സ്വീകരിക്കുക',
        description: 'മണ്ണിന്റെ pH, NPK നിലവാരമനുസരിച്ച് വളപ്രയോഗം നടത്തുക. യൂറിയ ലാഭിക്കുക, കൃഷിച്ചെലവ് കുറയ്ക്കുക, മണ്ണിന്റെ ഫലഭൂയിഷ്ഠത വർദ്ധിപ്പിക്കുക.',
        buttonText: 'മണ്ണ് ആരോഗ്യം പരിശോധിക്കുക',
        points: [
          'NPK അനുപാതം അനുസരിച്ചുള്ള ഘട്ടം ഘട്ടമായ വളപ്രയോഗ പദ്ധതി',
          'ജിപ്സവും കുമ്മായവും ഉപയോഗിച്ച് അമ്ല-ക്ഷാര മണ്ണ് പരിപാലനം',
          'സോയിൽ ഹെൽത്ത് കാർഡ് അപ്‌ലോഡ് അല്ലെങ്കിൽ നേരിട്ടുള്ള വിവര ശേഖരണം'
        ]
      },
      weather: {
        label: 'ഫാം കാലാവസ്ഥ',
        badge: 'സ്പ്രേ റഡാർ',
        headline: 'കാലാവസ്ഥയ്ക്കനുസരിച്ച് നനയും കീടനാശിനി തളിക്കലും ആസൂത്രണം ചെയ്യുക',
        description: 'മഴയ്ക്ക് തൊട്ടുമുമ്പ് മരുന്ന് തളിക്കുന്നത് ചെലവേറിയ മരുന്നുകൾ ഒലിച്ചുപോകാൻ ഇടയാക്കും. KisaanBuddy 7 ദിവസത്തെ കൃത്യമായ പ്രവചനം നൽകുന്നു.',
        buttonText: 'കാലാവസ്ഥ പ്രവചനം കാണുക',
        points: [
          'മണിക്കൂർ തോറുമുള്ള മഴ സാധ്യതയും കാറ്റിന്റെ വേഗതയും',
          'ഉഷ്ണതരംഗവും അപ്രതീക്ഷിത മഴയും സംബന്ധിച്ച മുൻകൂർ മുന്നറിയിപ്പുകൾ',
          'പിൻകോഡ് അടിസ്ഥാനമാക്കിയുള്ള 7 ദിവസത്തെ കാർഷിക കാലാവസ്ഥാ പ്രവചനം'
        ]
      },
      mandi: {
        label: 'മാർക്കറ്റ് നിരക്കുകളും ട്രെൻഡുകളും',
        badge: 'eNAM ലൈവ് നിരക്കുകൾ',
        headline: 'വിളകൾ വിൽക്കുന്നതിന് മുൻപ് 1,000+ മാർക്കറ്റുകളിലെ വില താരതമ്യം ചെയ്യുക',
        description: 'അടുത്തുള്ള മാർക്കറ്റുകളിലെ ഇന്നത്തെ കുറഞ്ഞതും കൂടിയതുമായ വിലകൾ കാണുക. ഇടനിലക്കാരെ ആശ്രയിക്കാതെ കൃത്യമായ വിലയിൽ വിൽക്കുക.',
        buttonText: 'മാർക്കറ്റ് നിരക്കുകൾ കാണുക',
        points: [
          'നെല്ല്, കുരുമുളക്, ഏലം, പച്ചക്കറികൾ ഉൾപ്പെടെ 120+ വിളകളുടെ ദൈനംദിന നിരക്കുകൾ',
          'അടുത്തുള്ള മാർക്കറ്റുകൾ തമ്മിലുള്ള ദൂരവും വിലയും താരതമ്യം ചെയ്യാം',
          'കഴിഞ്ഞ 7 മുതൽ 30 ദിവസങ്ങളിലെ വില ട്രെൻഡുകളും വരവ് വിവരങ്ങളും'
        ]
      }
    }
  },
  hi_en: {
    sectionBadge: 'FIELD-READY AGRICULTURAL SUITE',
    sectionTitle: 'Aapki Real Farming Needs ke Liye Banaya Gaya.',
    sectionDesc: 'Har tool ko Indian farmers ki ground realities ko dhyan me rakhkar design kiya gaya hai — easy language, verified data aur direct benefit.',
    realContext: 'REAL AGRICULTURAL CONTEXT',
    tabs: {
      doctor: {
        label: 'Crop Doctor',
        badge: 'Disease Diagnostics',
        headline: 'Patti ki Photo Lein, Turant Bimari aur Organic Upchar Jaanein',
        description: 'Apne phone ke camera se prabhavit patti ki photo lein. Hamara AI model fungal, bacterial aur pest attack ko turant pehchan kar ICAR-approved remedies batata hai.',
        buttonText: 'Crop Doctor Kholein',
        points: [
          'Yellow Rust, Leaf Blast, Sheath Blight aur Aphids ki pehchan',
          'Chemical ke sath Neem oil aur bio-control options',
          'Per-acre spray ki sahi quantity aur water ratio'
        ]
      },
      soil: {
        label: 'Soil Health & NPK',
        badge: 'Nutrient Matrix',
        headline: 'Andaze se Khaad Daalna Band Karein, Scientific Quantity Apnayein',
        description: 'Mitti ke pH aur NPK level ke hisaab se fertilizer apply karein. Urea bachayein, cost kam karein aur soil organic carbon badhayein.',
        buttonText: 'Soil Health Check Karein',
        points: [
          'NPK ratio ke hisaab se crop stage-wise basal aur top-dressing plans',
          'Gypsum aur lime treatment se acidic/alkaline soil ka sudhaar',
          'Soil Health Card upload ya quick manual entry support'
        ]
      },
      weather: {
        label: 'Farm Weather',
        badge: 'Precision Radar',
        headline: 'Mausam ke Anusar Sinchai aur Spray ki Planning Karein',
        description: 'Barish se theek pehle spray karne se costly dawai beh jaati hai. KisaanBuddy aapko 7-day radar aur best spray window batata hai.',
        buttonText: 'Weather Forecast Dekhein',
        points: [
          'Hourly rain probability aur drift-free safe spray ke liye wind speed',
          'Heatwave aur unseasonal rain ke liye advance alerts',
          'PIN-code based 7-day agricultural forecast IMD synced'
        ]
      },
      mandi: {
        label: 'Mandi Bhav & Trends',
        badge: 'AGMARKNET Feeds',
        headline: 'Fasal Bechne se Pehle 1,000+ Mandiyon ke Bhav Compare Karein',
        description: 'Paas ki mandiyon me aaj ka min, max aur modal bhav dekhein. Middlemen par depend rehne ke bajaye real rates ke sath deal karein.',
        buttonText: 'Mandi Bhav Dekhein',
        points: [
          'Gehun, dhaan, sarson, kapas samet 120+ crops ke daily rates',
          'Nearby mandis ke beech distance aur rates ka direct comparison',
          'Last 7 to 30 days ka price trend aur arrival data'
        ]
      }
    }
  }
};

const TAB_ICONS = {
  doctor: Bug,
  soil: FlaskConical,
  weather: CloudSun,
  mandi: TrendingUp,
};

const TAB_IMAGES = {
  doctor: {
    src: '/images/crop-doctor/powdery-mildew-leaf.jpg',
    href: '/disease'
  },
  soil: {
    src: '/images/soil/soil-ph-testing.jpg',
    href: '/soil-health'
  },
  weather: {
    src: '/images/weather/monsoon-farmland.jpg',
    href: '/weather'
  },
  mandi: {
    src: '/images/mandi/grain-market-mandi.jpg',
    href: '/mandi'
  }
};

export function ProductShowcase() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'doctor' | 'soil' | 'weather' | 'mandi'>('doctor');

  const c = SHOWCASE_I18N[lang] || SHOWCASE_I18N.en;
  const currentTab = c.tabs[activeTab] || c.tabs.doctor;
  const currentMedia = TAB_IMAGES[activeTab] || TAB_IMAGES.doctor;

  const tabKeys: Array<'doctor' | 'soil' | 'weather' | 'mandi'> = ['doctor', 'soil', 'weather', 'mandi'];

  return (
    <section id="product-showcase" className="py-16 sm:py-24 bg-muted/20 dark:bg-card/30 border-b border-border/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{c.sectionBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15]">
            {c.sectionTitle}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {c.sectionDesc}
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 max-w-3xl mx-auto">
          {tabKeys.map(key => {
            const Icon = TAB_ICONS[key];
            const isSelected = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/25'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border/80 hover:bg-muted/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-emerald-200' : 'text-muted-foreground'}`} />
                <span>{c.tabs[key].label}</span>
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
                  <span>{currentTab.badge}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground leading-snug tracking-tight">
                  {currentTab.headline}
                </h3>

                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {currentTab.description}
                </p>

                {/* Key Bullet Points */}
                <div className="mt-8 space-y-3.5">
                  {currentTab.points.map((pt, idx) => (
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
                  href={currentMedia.href}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-all active:scale-[0.98]"
                >
                  <span>{currentTab.buttonText}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Col: High Quality Authentic Photography Display */}
            <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-muted/40 border-t lg:border-t-0 lg:border-l border-border/70 overflow-hidden">
              <img
                src={currentMedia.src}
                alt={currentTab.headline}
                className="w-full h-full object-cover object-center absolute inset-0 transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                    {c.realContext}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-100">
                    {currentTab.headline}
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
