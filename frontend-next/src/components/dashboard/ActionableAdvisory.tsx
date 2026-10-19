'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Thermometer, Droplets, Leaf } from 'lucide-react';

interface ActionableAdvisoryProps {
  moisture: number;
  temp: number;
  humidity: number;
  lang: string;
}

type AdvisoryDictionary = {
  header: string;
  moistureLow: (m: number) => string;
  moistureHigh: (m: number) => string;
  moistureOptimal: (m: number) => string;
  tempHigh: (t: number) => string;
  tempLow: (t: number) => string;
  humidityHigh: (h: number) => string;
};

const ADVISORY_I18N: Record<string, AdvisoryDictionary> = {
  en: {
    header: "Actionable Farm Advisories",
    moistureLow: (m) => `Soil moisture is low (${m}%). Schedule a light evening irrigation to maintain root health.`,
    moistureHigh: (m) => `High water saturation detected (${m}%). Ensure drainage outlets are clear to prevent waterlogging.`,
    moistureOptimal: (m) => `Soil moisture is in the optimal range (${m}%). No irrigation required today.`,
    tempHigh: (t) => `High ambient temperature (${t}°C). Avoid heavy fieldwork between 12 PM - 3 PM.`,
    tempLow: (t) => `Cold temperature detected (${t}°C). Monitor delicate crops for cold or frost stress.`,
    humidityHigh: (h) => `High relative humidity (${h}%). Elevates fungal infection risk; inspect leaf undersides.`,
  },
  hi: {
    header: "खेत के लिए विशेष सलाह",
    moistureLow: (m) => `मिट्टी की नमी कम है (${m}%)। आज शाम को हल्की सिंचाई करें ताकि फसल की जड़ें सुरक्षित रहें।`,
    moistureHigh: (m) => `खेत में पानी की मात्रा अधिक है (${m}%)। जलभराव रोकने के लिए जल निकासी सुनिश्चित करें।`,
    moistureOptimal: (m) => `मिट्टी की नमी अनुकूल है (${m}%)। आज सिंचाई की आवश्यकता नहीं है, पानी की बचत करें।`,
    tempHigh: (t) => `तापमान अधिक है (${t}°C)। दोपहर 12 से 3 बजे के बीच खेत में भारी काम से बचें।`,
    tempLow: (t) => `तापमान ठंडा है (${t}°C)। पाले (Frost) से फसलों की सुरक्षा के लिए निगरानी रखें।`,
    humidityHigh: (h) => `हवा में नमी अधिक है (${h}%)। फफूंद और कीट संक्रमण का जोखिम हो सकता है; पत्तियों की जांच करें।`,
  },
  kn: {
    header: "ಹೊಲದ ವಿಶೇಷ ಸಲಹೆಗಳು",
    moistureLow: (m) => `ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಡಿಮೆಯಾಗಿದೆ (${m}%). ಬೆಳೆಯ ಬೇರುಗಳ ಆರೋಗ್ಯಕ್ಕೆ ಇಂದು ಸಂಜೆ ಲಘು ನೀರಾವರಿ ಮಾಡಿ.`,
    moistureHigh: (m) => `ಹೊಲದಲ್ಲಿ ಹೆಚ್ಚಿನ ನೀರಿನ ಪ್ರಮಾಣ ಕಂಡುಬಂದಿದೆ (${m}%). ನೀರು ನಿಲ್ಲುವುದನ್ನು ತಡೆಯಲು ಬಸಿಗಾಲುವೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ.`,
    moistureOptimal: (m) => `ಮಣ್ಣಿನ ತೇವಾಂಶ ಸೂಕ್ತ ಪ್ರಮಾಣದಲ್ಲಿದೆ (${m}%). ಇಂದು ನೀರಾವರಿಯ ಅಗತ್ಯವಿಲ್ಲ, ನೀರನ್ನು ಉಳಿಸಿ.`,
    tempHigh: (t) => `ಹೆಚ್ಚಿನ ತಾಪಮಾನ (${t}°C). ಮಧ್ಯಾಹ್ನ 12 ರಿಂದ 3 ಗಂಟೆಯವರೆಗೆ ಹೊಲದಲ್ಲಿ ಕಠಿಣ ಕೆಲಸ ತಪ್ಪಿಸಿ.`,
    tempLow: (t) => `ಕಡಿಮೆ ತಾಪಮಾನ ದಾಖಲಾಗಿದೆ (${t}°C). ಬೆಳೆಗಳನ್ನು ಶೀತದ ಒತ್ತಡದಿಂದ ರಕ್ಷಿಸಲು ಗಮನಿಸಿ.`,
    humidityHigh: (h) => `ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆ (${h}%). ಶಿಲೀಂಧ್ರ ಸೋಂಕಿನ ಅಪಾಯವಿದೆ; ಎಲೆಗಳ ಕೆಳಭಾಗವನ್ನು ಪರೀಕ್ಷಿಸಿ.`,
  },
  mr: {
    header: "शेतासाठी कृतीयोग्य सल्ला",
    moistureLow: (m) => `जमिनीतील ओलावा कमी आहे (${m}%). मुळांच्या वाढीसाठी आज संध्याकाळी हलके पाणी द्या.`,
    moistureHigh: (m) => `शेतात पाणी साचले आहे (${m}%). पिकांचे नुकसान टाळण्यासाठी पाण्याचा योग्य निचरा करा.`,
    moistureOptimal: (m) => `मातीतील ओलावा समाधानकारक आहे (${m}%). आज पाणी देण्याची गरज नाही.`,
    tempHigh: (t) => `तापमान जास्त आहे (${t}°C). दुपारी १२ ते ३ दरम्यान शेतातील कष्टाची कामे टाळा.`,
    tempLow: (t) => `तापमान खूप कमी आहे (${t}°C). थंडी आणि धुक्यापासून पिकांचे संरक्षण करा.`,
    humidityHigh: (h) => `हवेतील आर्द्रता जास्त आहे (${h}%). बुरशीजन्य रोगाचा धोका संभवतो; पानांची तपासणी करा.`,
  },
  te: {
    header: "పొలానికి కీలక సలహాలు",
    moistureLow: (m) => `నేలలో తేమ తక్కువగా ఉంది (${m}%). వేర్ల ఆరోగ్యానికి ఈ సాయంత్రం తేలికపాటి తడి అందించండి.`,
    moistureHigh: (m) => `పొలంలో నీటి నిల్వ ఎక్కువగా ఉంది (${m}%). నీరు నిల్వ ఉండకుండా మురుగు కాలువలను సరిచేయండి.`,
    moistureOptimal: (m) => `నేల తేమ అనుకూలమైన పరిధిలో ఉంది (${m}%). ఈ రోజు నీరు పెట్టాల్సిన అవసరం లేదు.`,
    tempHigh: (t) => `ఉష్ణోగ్రత అధికంగా ఉంది (${t}°C). మధ్యాహ్నం 12 నుండి 3 గంటల మధ్య భారీ పనులు మానుకోండి.`,
    tempLow: (t) => `తక్కువ ఉష్ణోగ్రత నమోదైంది (${t}°C). పంటలకు చలి ప్రభావం పడకుండా జాగ్రత్త వహించండి.`,
    humidityHigh: (h) => `గాలిలో తేమ ఎక్కువగా ఉంది (${h}%). శిలీంధ్ర తెగుళ్ల ముప్పు పెరుగుతుంది; ఆకులను గమనించండి.`,
  },
  ta: {
    header: "பண்ணைக்கான உடனடி ஆலோசனைகள்",
    moistureLow: (m) => `மண் ஈரப்பதம் குறைவாக உள்ளது (${m}%). வேர்களின் ஆரோக்கியத்திற்கு இன்று மாலை லேசான பாசனம் செய்யவும்.`,
    moistureHigh: (m) => `நிலத்தில் அதிக நீர் தேங்கியுள்ளது (${m}%). நீர் தேங்குவதைத் தடுக்க வடிகால் வழிகளைச் சீரமைக்கவும்.`,
    moistureOptimal: (m) => `மண் ஈரப்பதம் சரியான அளவில் உள்ளது (${m}%). இன்று பாசனம் செய்யத் தேவையில்லை.`,
    tempHigh: (t) => `அதிக வெப்பநிலை (${t}°C). மதியம் 12 மணி முதல் 3 மணி வரை கடுமையான களப்பணிகளைத் தவிர்க்கவும்.`,
    tempLow: (t) => `குளிர்ந்த வெப்பநிலை பதிவாகியுள்ளது (${t}°C). பனி அழுத்தத்திலிருந்து பயிர்களைக் கண்காணிக்கவும்.`,
    humidityHigh: (h) => `காற்றில் ஈரப்பதம் அதிகம் (${h}%). பூஞ்சை தொற்று அபாயம் உள்ளது; இலைகளின் அடிப்பகுதியை ஆராயுங்கள்.`,
  },
  gu: {
    header: "ખેતર માટે તાત્કાલિક સલાહ",
    moistureLow: (m) => `જમીનમાં ભેજ ઓછો છે (${m}%). મૂળના રક્ષણ માટે આજે સાંજે હળવું પિયત આપો.`,
    moistureHigh: (m) => `ખેતરમાં પાણી ભરાયું છે (${m}%). જળભરાવ અટકાવવા માટે નિકાલની વ્યવસ્થા કરો.`,
    moistureOptimal: (m) => `જમીનમાં ભેજ યોગ્ય માત્રામાં છે (${m}%). આજે પિયતની જરૂર નથી.`,
    tempHigh: (t) => `તાપમાન વધારે છે (${t}°C). બપોરે ૧૨ થી ૩ દરમિયાન ખેતરમાં ભારે કામકાજ ટાળો.`,
    tempLow: (t) => `તાપમાન ઠંડુ છે (${t}°C). ઠંડી અને ઝાકળથી પાકના રક્ષણ માટે ધ્યાન રાખો.`,
    humidityHigh: (h) => `હવામાં ભેજનું પ્રમાણ વધારે છે (${h}%). ફૂગજન્ય રોગનું જોખમ છે; પાનની ચકાસણી કરો.`,
  },
  bn: {
    header: "খামারের প্রয়োজনীয় পরামর্শ",
    moistureLow: (m) => `মাটির আর্দ্রতা কম (${m}%)। শিকড়ের সুস্বাস্থ্যের জন্য আজ বিকেলে হালকা সেচ দিন।`,
    moistureHigh: (m) => `জমিতে অতিরিক্ত জল জমেছে (${m}%)। জল নিষ্কাশনের ব্যবস্থা পরিষ্কার রাখুন।`,
    moistureOptimal: (m) => `মাটির আর্দ্রতা সঠিক মাত্রায় রয়েছে (${m}%)। আজ সেচের প্রয়োজন নেই।`,
    tempHigh: (t) => `তাপমাত্রা বেশি (${t}°C)। দুপুর ১২টা থেকে ৩টের মধ্যে ভারী ফিল্ডওয়ার্ক এড়িয়ে চলুন।`,
    tempLow: (t) => `তাপমাত্রা ঠান্ডা (${t}°C)। ঠান্ডার প্রভাব থেকে সংবেদনশীল ফসল রক্ষা করুন।`,
    humidityHigh: (h) => `বাতাসে আপেক্ষিক আর্দ্রতা বেশি (${h}%)। ছত্রাক সংক্রমণের ঝুঁকি আছে; পাতার নীচের অংশ পরীক্ষা করুন।`,
  },
  pa: {
    header: "ਖੇਤ ਲਈ ਵਿਸ਼ੇਸ਼ ਸਲਾਹ",
    moistureLow: (m) => `ਮਿੱਟੀ ਵਿੱਚ ਨਮੀ ਘੱਟ ਹੈ (${m}%)। ਜੜ੍ਹਾਂ ਦੀ ਸਿਹਤ ਲਈ ਅੱਜ ਸ਼ਾਮ ਨੂੰ ਹਲਕਾ ਪਾਣੀ ਲਗਾਓ।`,
    moistureHigh: (m) => `ਖੇਤ ਵਿੱਚ ਪਾਣੀ ਖੜ੍ਹਾ ਹੈ (${m}%)। ਨੁਕਸਾਨ ਤੋਂ ਬਚਣ ਲਈ ਨਿਕਾਸ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ।`,
    moistureOptimal: (m) => `ਮਿੱਟੀ ਦੀ ਨਮੀ ਬਿਲਕੁਲ ਸਹੀ ਹੈ (${m}%)। ਅੱਜ ਪਾਣੀ ਲਗਾਉਣ ਦੀ ਲੋੜ ਨਹੀਂ।`,
    tempHigh: (t) => `ਤਾਪਮਾਨ ਬਹੁਤ ਜ਼ਿਆਦਾ ਹੈ (${t}°C)। ਦੁਪਹਿਰ 12 ਤੋਂ 3 ਵਜੇ ਤੱਕ ਖੇਤ ਵਿੱਚ ਭਾਰੀ ਕੰਮ ਤੋਂ ਬਚੋ।`,
    tempLow: (t) => `ਤਾਪਮਾਨ ਠੰਡਾ ਹੈ (${t}°C)। ਫਸਲਾਂ ਨੂੰ ਕੋਰੇ ਜਾਂ ਠੰਡ ਦੇ ਅਸਰ ਤੋਂ ਬਚਾਉਣ ਲਈ ਨਜ਼ਰ ਰੱਖੋ।`,
    humidityHigh: (h) => `ਹਵਾ ਵਿੱਚ ਨਮੀ ਜ਼ਿਆਦਾ ਹੈ (${h}%)। ਉੱਲੀ ਰੋਗ ਦਾ ਖਤਰਾ ਵੱਧ ਸਕਦਾ ਹੈ; ਪੱਤਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ।`,
  },
  ml: {
    header: "കൃഷിയിടത്തിനായുള്ള നിർദ്ദേശങ്ങൾ",
    moistureLow: (m) => `മണ്ണിലെ ഈർപ്പം കുറവാണ് (${m}%). വേരുകളുടെ ആരോഗ്യത്തിനായി ഇന്ന് വൈകുന്നേരം നേരിയ നന നൽകുക.`,
    moistureHigh: (m) => `പാടത്ത് വെള്ളക്കെട്ട് കണ്ടെത്തി (${m}%). നീരൊഴുക്ക് ഉറപ്പാക്കി വെള്ളം ഒഴിവാക്കുക.`,
    moistureOptimal: (m) => `മണ്ണിലെ ഈർപ്പം അനുയോജ്യമായ അളവിലാണ് (${m}%). ഇന്ന് നനയ്ക്കേണ്ടതില്ല.`,
    tempHigh: (t) => `അന്തരീക്ഷ താപനില കൂടുതലാണ് (${t}°C). ഉച്ചയ്ക്ക് 12 മുതൽ 3 വരെ കഠിനമായ പണികൾ ഒഴിവാക്കുക.`,
    tempLow: (t) => `തണുത്ത താപനില രേഖപ്പെടുത്തി (${t}°C). വിളകളെ അതിശൈത്യത്തിൽ നിന്ന് സംരക്ഷിക്കുക.`,
    humidityHigh: (h) => `അന്തരീക്ഷ ആർദ്രത കൂടുതലാണ് (${h}%). ഫംഗസ് ബാധയ്ക്ക് സാധ്യതയുണ്ട്; ഇലകൾ പരിശോധിക്കുക.`,
  },
  hi_en: {
    header: "Actionable Farm Advisories",
    moistureLow: (m) => `Mitti ki nami kam hai (${m}%). Shaam ko light irrigation karein root health ke liye.`,
    moistureHigh: (m) => `Khet me waterlogging detect hui hai (${m}%). Drainage clear karein.`,
    moistureOptimal: (m) => `Soil moisture optimal range me hai (${m}%). Aaj irrigation ki need nahi hai.`,
    tempHigh: (t) => `High temperature (${t}°C). Dopahar 12 se 3 baje ke beech heavy fieldwork avoid karein.`,
    tempLow: (t) => `Cold temperature (${t}°C). Crops ko frost ya cold stress se bachayein.`,
    humidityHigh: (h) => `High humidity (${h}%). Fungal infection ka risk badh sakta hai; leaves check karein.`,
  }
};

export function ActionableAdvisory({ moisture, temp, humidity, lang }: ActionableAdvisoryProps) {
  const dict = ADVISORY_I18N[lang] || ADVISORY_I18N.en;

  const getAdvisories = () => {
    const list = [];

    // Moisture
    if (moisture < 35) {
      list.push({
        icon: Droplets,
        text: dict.moistureLow(moisture),
        type: "warning" as const
      });
    } else if (moisture > 80) {
      list.push({
        icon: ShieldAlert,
        text: dict.moistureHigh(moisture),
        type: "danger" as const
      });
    } else {
      list.push({
        icon: CheckCircle2,
        text: dict.moistureOptimal(moisture),
        type: "success" as const
      });
    }

    // Temperature
    if (temp > 35) {
      list.push({
        icon: Thermometer,
        text: dict.tempHigh(temp),
        type: "warning" as const
      });
    } else if (temp < 15) {
      list.push({
        icon: Thermometer,
        text: dict.tempLow(temp),
        type: "warning" as const
      });
    }

    // Humidity
    if (humidity > 80) {
      list.push({
        icon: Leaf,
        text: dict.humidityHigh(humidity),
        type: "warning" as const
      });
    }

    return list;
  };

  const advisories = getAdvisories();

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3 shadow-xs">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span>{dict.header}</span>
      </h3>

      <div className="flex flex-col gap-2.5">
        {advisories.map((adv, idx) => {
          const IconComponent = adv.icon;
          let colorClass = "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300";
          if (adv.type === 'success') {
            colorClass = "border-primary/25 bg-primary/10 text-primary-900 dark:text-primary";
          }
          if (adv.type === 'danger') {
            colorClass = "border-destructive/25 bg-destructive/10 text-destructive";
          }

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg border text-xs font-medium leading-relaxed ${colorClass}`}
            >
              <IconComponent className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{adv.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
