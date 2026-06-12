"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Cpu, Thermometer, Droplet, Sprout, Wind, Calendar,
  Smartphone, CloudRain, Sun, Check, Sparkles, Activity, Database,
  AlertTriangle, ShieldAlert, Mail, MessageCircle, HelpCircle,
  ChevronDown, ArrowUpRight, CheckCircle
} from "lucide-react";
import { useLanguage } from "@/lib/language";

// Types
type SensorKey = "airTemp" | "airHumidity" | "soilTemp" | "soilMoisture";

interface SensorSim {
  name: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  val: number;
}

export default function HardwarePage() {
  const { lang, t } = useLanguage();

  // Update document title for SEO
  useEffect(() => {
    document.title = lang === "hi" 
      ? "KrishiAI स्मार्ट फार्म हब | एप्पल-लेवल स्मार्ट फार्मिंग हार्डवेयर" 
      : lang === "kn" 
        ? "KrishiAI ಸ್ಮಾರ್ಟ್ ಫಾರ್ಮ್ ಹಬ್ | ಆಪಲ್-ಲೆವೆಲ್ ಸ್ಮಾರ್ಟ್ ಫಾರ್ಮಿಂಗ್ ಹಾರ್ಡ್‌ವೇರ್" 
        : "KrishiAI Smart Farm Hub | Apple-Level Smart Farming Hardware";
  }, [lang]);

  // Simulator State
  const [sensors, setSensors] = useState<Record<SensorKey, SensorSim>>({
    airTemp: { name: "Air Temperature", unit: "°C", min: 5, max: 48, step: 0.5, val: 27.5 },
    airHumidity: { name: "Air Humidity", unit: "%", min: 10, max: 100, step: 1, val: 62 },
    soilTemp: { name: "Soil Temperature", unit: "°C", min: 5, max: 40, step: 0.5, val: 24.5 },
    soilMoisture: { name: "Soil Moisture", unit: "%", min: 0, max: 100, step: 1, val: 42 }
  });

  const getSensorName = (key: SensorKey) => {
    if (key === "airTemp") return lang === "hi" ? "हवा का तापमान" : lang === "kn" ? "ಗಾಳಿಯ ತಾಪಮಾನ" : "Air Temperature";
    if (key === "airHumidity") return lang === "hi" ? "हवा की नमी" : lang === "kn" ? "ಗಾಳಿಯ ಆರ್ದ್ರತೆ" : "Air Humidity";
    if (key === "soilTemp") return lang === "hi" ? "मिट्टी का तापमान" : lang === "kn" ? "ಮಣ್ಣಿನ ತಾಪಮಾನ" : "Soil Temperature";
    return lang === "hi" ? "मिट्टी की नमी" : lang === "kn" ? "ಮಣ್ಣಿನ ತೇವಾಂಶ" : "Soil Moisture";
  }

  const handleSimSlider = (key: SensorKey, val: number) => {
    setSensors(prev => ({
      ...prev,
      [key]: { ...prev[key], val }
    }));
  };

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    state: "",
    acres: "",
    message: "",
    interest: "buy" // buy | demo
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setFormSubmitted(true);
      setFormData({ name: "", phone: "", state: "", acres: "", message: "", interest: "buy" });
    }, 1500);
  };

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const FAQS = [
    {
      q: lang === "hi" ? "KrishiAI स्मार्ट फार्म हब खुद को कैसे पावर देता है?" : lang === "kn" ? "KrishiAI ಸ್ಮಾರ್ಟ್ ಫಾರ್ಮ್ ಹಬ್ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?" : "How does the KrishiAI Smart Farm Hub power itself?",
      a: lang === "hi" 
        ? "यह डिवाइस मानक 5V माइक्रो-यूएसबी पावर इनपुट पर चलता है। दूरदराज के क्षेत्रों में, इसे आमतौर पर एक बजट 10,000mAh यूएसबी पावर बैंक (जो इसे लगातार 4-5 दिनों तक चलाता है) का उपयोग करके संचालित किया जाता है या निरंतर ऑफ-ग्रिड संचालन के लिए एक छोटे 5W सौर-चार्जिंग पैनल से जोड़ा जाता है।" 
        : lang === "kn" 
          ? "ಸಾಧನವು ಪ್ರಮಾಣಿತ 5V ಮೈಕ್ರೋ-ಯುಎಸ್‌ಬಿ ಪವರ್ ಇನ್‌ಪುಟ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ. ದೂರದ ಪ್ರದೇಶಗಳಲ್ಲಿ, ಇದನ್ನು ಸಾಮಾನ್ಯವಾಗಿ ಬಜೆಟ್ 10,000mAh ಯುಎಸ್‌ಬಿ ಪವರ್ ಬ್ಯಾಂಕ್ ಬಳಸಿ ಚಾಲನೆ ಮಾಡಲಾಗುತ್ತದೆ (ಇದು ಸತತ 4-5 ದಿನಗಳವರೆಗೆ ಚಲಿಸುತ್ತದೆ) ಅಥವಾ ಸಣ್ಣ 5W ಸೋಲಾರ್ ಪ್ಯಾನಲ್‌ಗೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತದೆ." 
          : "The device runs on a standard 5V micro-USB power input. In remote fields, it is commonly powered using a budget 10,000mAh USB power bank (which runs it for 4-5 days continuously) or connected to a small 5W solar-charging panel for perpetual off-grid operation."
    },
    {
      q: lang === "hi" ? "क्या यह सक्रिय इंटरनेट या वाई-फाई के बिना काम करता है?" : lang === "kn" ? "ಸಕ್ರಿಯ ಇಂಟರ್ನೆಟ್ ಅಥವಾ ವೈ-ಫೈ ಇಲ್ಲದೆ ಇದು ಕೆಲಸ ಮಾಡುತ್ತದೆಯೇ?" : "Does it work without active internet or Wi-Fi?",
      a: lang === "hi" 
        ? "हार्डवेयर नोड रीडिंग को सीधे KrishiAI क्लाउड बैकएंड पर भेजने के लिए एक अंतर्निहित वाई-फाई माइक्रोचिप (ESP32) का उपयोग करता है। यदि वाई-फाई अस्थायी रूप से ऑफ़लाइन है, तो ऑन-बोर्ड OLED स्क्रीन अभी भी सीधे खेत में वास्तविक समय निदान रीडिंग प्रदान करने के लिए काम करेगी।" 
        : lang === "kn" 
          ? "ರೀಡಿಂಗ್‌ಗಳನ್ನು ನೇರವಾಗಿ KrishiAI ಕ್ಲೌಡ್ ಬ್ಯಾಕೆಂಡ್‌ಗೆ ಕಳುಹಿಸಲು ಹಾರ್ಡ್‌ವೇರ್ ನೋಡ್ ಅಂತರ್ನಿರ್ಮಿತ ವೈ-ಫೈ ಮೈಕ್ರೋಚಿಪ್ (ESP32) ಅನ್ನು ಬಳಸುತ್ತದೆ. ವೈ-ಫೈ ಇಲ್ಲದಿದ್ದರೂ, ಆನ್-ಬೋರ್ಡ್ OLED ಸ್ಕ್ರೀನ್ ಸ್ಥಳೀಯ ನೈಜ-ಸಮಯದ ರೀಡಿಂಗ್‌ಗಳನ್ನು ನೀಡಲು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ." 
          : "The hardware node uses a built-in Wi-Fi microchip (ESP32) to ingest readings directly to the KrishiAI cloud backend. If Wi-Fi is temporarily offline, the on-board OLED screen will still function to provide local, real-time diagnostic readings directly in the field."
    },
    {
      q: lang === "hi" ? "गीली मिट्टी में कैपेसिटिव मॉइस्चर सेंसर कब तक चलेगा?" : lang === "kn" ? "ತೇವವಾದ ಮಣ್ಣಿನಲ್ಲಿ ಕೆಪಾಸಿಟಿವ್ ತೇವಾಂಶ ಸಂವೇದಕ ಎಷ್ಟು ದಿನ ಬಾಳಿಕೆ ಬರುತ್ತದೆ?" : "How long will the capacitive moisture sensor last in wet soil?",
      a: lang === "hi" 
        ? "सस्ते प्रतिरोधी मॉइस्चर प्रोब के विपरीत (जो उजागर धातु का उपयोग करते हैं जो हफ्तों में इलेक्ट्रोलीसिस के कारण संक्षारित हो जाते हैं), KrishiAI स्मार्ट फार्म हब में एक कैपेसिटिव मॉइस्चर सेंसर v2.0 शामिल है। यह सेंसर पूरी तरह से इंसुलेटेड है, जो रासायनिक क्षरण को रोकता है और गीली मिट्टी के नीचे कई वर्षों का जीवनकाल सुनिश्चित करता है।" 
        : lang === "kn" 
          ? "ಅಗ್ಗದ ತೇವಾಂಶ ಸಂವೇದಕಗಳಂತೆ ಅಲ್ಲದೆ (ಇದು ವಿದ್ಯುದ್ವಿಭಜನೆಯಿಂದ ತುಕ್ಕು ಹಿಡಿಯುತ್ತದೆ), KrishiAI ಸ್ಮಾರ್ಟ್ ಫಾರ್ಮ್ ಹಬ್ ಕೆಪಾಸಿಟಿವ್ ತೇವಾಂಶ ಸಂವೇದಕ v2.0 ಅನ್ನು ಒಳಗೊಂಡಿದೆ. ಇದು ರಾಸಾಯನಿಕ ತುಕ್ಕು ತಡೆಯುತ್ತದೆ ಮತ್ತು ತೇವವಾದ ಮಣ್ಣಿನಲ್ಲಿ ಹಲವು ವರ್ಷಗಳ ಬಾಳಿಕೆ ನೀಡುತ್ತದೆ." 
          : "Unlike cheap resistive moisture probes (which use exposed metal that corrodes due to electrolysis within weeks), the KrishiAI Smart Farm Hub includes a Capacitive Moisture Sensor v2.0. This sensor is fully insulated, preventing chemical erosion and ensuring a lifespan of multiple years under wet soil."
    },
    {
      q: lang === "hi" ? "एआई फसल अनुशंसा इस डेटा का उपयोग कैसे करती है?" : lang === "kn" ? "AI ಬೆಳೆ ಶಿಫಾರಸು ಈ ಡೇಟಾವನ್ನು ಹೇಗೆ ಬಳಸುತ್ತದೆ?" : "How does the AI Crop Recommendation use this data?",
      a: lang === "hi" 
        ? "एक बार जब आपकी डिवाइस आईडी पंजीकृत हो जाती है, तो आपके क्रॉप प्रेडिक्टर पेज पर एक नीला 'लाइव ESP32 पढ़ें' बटन मिलता है। इसे क्लिक करने से आपके भौतिक क्षेत्र के लाइव सेंसर डेटाबेस से तापमान और नमी के स्लाइडर तुरंत भर जाते हैं, जिससे अत्यधिक स्थानीयकृत कृषि विज्ञान अनुशंसाएं सुनिश्चित होती हैं।" 
        : lang === "kn" 
          ? "ನಿಮ್ಮ ಸಾಧನದ ID ನೋಂದಾಯಿಸಿದ ನಂತರ, ನಿಮ್ಮ ಬೆಳೆ ಪ್ರೆಡಿಕ್ಟರ್ ಪುಟದಲ್ಲಿ ನೀಲಿ 'ಲೈವ್ ESP32 ಓದಿ' ಬಟನ್ ಸಿಗುತ್ತದೆ. ಅದನ್ನು ಕ್ಲಿಕ್ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಲೈವ್ ಸಂವೇದಕ ಡೇಟಾದಿಂದ ತಾಪಮಾನ ಮತ್ತು ತೇವಾಂಶ ಸ್ಲೈಡರ್‌ಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಭರ್ತಿಯಾಗುತ್ತವೆ." 
          : "Once your device ID is registered, your Crop Predictor page gets a blue 'Read Live ESP32' button. Clicking it auto-fills the climate temperature and humidity sliders instantly from your physical field's live sensor database, guaranteeing highly localized agronomy recommendations."
    },
    {
      q: lang === "hi" ? "क्या मैं इस डिवाइस को खुद असेंबल कर सकता हूँ?" : lang === "kn" ? "ನಾನು ಈ ಸಾಧನವನ್ನು ಸ್ವತಃ ಜೋಡಿಸಬಹುದೇ?" : "Can I assemble this device myself?",
      a: lang === "hi" 
        ? "हाँ! KrishiAI ओपन-सोर्स IoT का समर्थन करता है। हम संपूर्ण Arduino वायरिंग गाइड और फर्मवेयर कोड मुफ्त में प्रदान करते हैं (HARDWARE_SETUP.md)। आप लगभग ₹1,200 में ESP32 बोर्ड और सेंसर खरीद सकते हैं, इसे प्रोग्राम कर सकते हैं और अपने खाते से लिंक कर सकते हैं।" 
        : lang === "kn" 
          ? "ಹೌದು! KrishiAI ಮುಕ್ತ ಮೂಲ IoT ಅನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ. ನಾವು ಸಂಪೂರ್ಣ Arduino ವೈರಿಂಗ್ ಮಾರ್ಗದರ್ಶಿ ಮತ್ತು ಫರ್ಮ್‌ವೇರ್ ಕೋಡ್ ಅನ್ನು ಉಚಿತವಾಗಿ ಒದಗಿಸುತ್ತೇವೆ. ನೀವು ಸುಮಾರು ₹1,200 ಗೆ ESP32 ಬೋರ್ಡ್ ಮತ್ತು ಸಂವೇದಕಗಳನ್ನು ಖರೀದಿಸಿ ನಿಮ್ಮ ಖಾತೆಗೆ ಲಿಂಕ್ ಮಾಡಬಹುದು." 
          : "Yes! KrishiAI supports open-source IoT. We provide the complete Arduino wiring guide and firmware code for free (HARDWARE_SETUP.md). You can buy the off-the-shelf ESP32 board and sensors for around ₹1,200 total, program it, and link it with your account."
    }
  ];

  const INSTALLATION_STEPS = [
    {
      step: "01",
      title: lang === "hi" ? "कैप्सूल प्लेसमेंट" : lang === "kn" ? "ಕ್ಯಾಪ್ಸುಲ್ ನಿಯೋಜನೆ" : "Capsule Placement",
      desc: lang === "hi" 
        ? "अपनी लक्षित फसलों के करीब एक साधारण लकड़ी के खंभे या बाड़ के पोस्ट पर मुख्य मौसम प्रतिरोधी IP65 कैप्सूल स्थापित करें।" 
        : lang === "kn" 
          ? "ನಿಮ್ಮ ಬೆಳೆಗಳ ಹತ್ತಿರ ಸರಳ ಮರದ ಕಂಬ ಅಥವಾ ಬೇಲಿ ಕಂಬದ ಮೇಲೆ ಮುಖ್ಯ ಹವಾಮಾನ ನಿರೋಧಕ IP65 ಕ್ಯಾಪ್ಸುಲ್ ಅನ್ನು ಅಳವಡಿಸಿ." 
          : "Mount the main weatherproof IP65 capsule above ground level on a simple wooden stake or fence post close to your focus crops."
    },
    {
      step: "02",
      title: lang === "hi" ? "जड़ क्षेत्र प्रोब स्थापित करें" : lang === "kn" ? "ಬೇರು ವಲಯ ಸಂವೇದಕ ಸೇರಿಸಿ" : "Embed Root Probes",
      desc: lang === "hi" 
        ? "जलरोधक स्टेनलेस-स्टील तापमान प्रोब (DS18B20) और इंसुलेटेड कैपेसिटिव मिट्टी की नमी सेंसर को सीधे जड़ क्षेत्र (लगभग 4-6 इंच गहरा) पर जमीन में डालें।" 
        : lang === "kn" 
          ? "ಜಲನಿರೋಧಕ ತಾಪಮಾನ ಸಂವೇದಕ ಮತ್ತು ಕೆಪಾಸಿಟಿವ್ ಮಣ್ಣಿನ ತೇವಾಂಶ ಸಂವೇದಕವನ್ನು ನೇರವಾಗಿ ಬೇರು ವಲಯದಲ್ಲಿ (ಸುಮಾರು 4-6 ಇಂಚು ಆಳ) ಮಣ್ಣಿನಲ್ಲಿ ಸೇರಿಸಿ." 
          : "Insert the waterproof stainless-steel temperature probe (DS18B20) and the insulated capacitive soil moisture sensor directly into the ground at the root zone (approx 4-6 inches deep)."
    },
    {
      step: "03",
      title: lang === "hi" ? "पावर कनेक्शन" : lang === "kn" ? "ಪವರ್ ಸಂಪರ್ಕ" : "Power Connection",
      desc: lang === "hi" 
        ? "कैप्सूल के निचले हिस्से से एक माइक्रो-यूएसबी केबल को अपने पावर स्रोत (एक सौर यूएसबी बैटरी बैंक या फोन चार्जर एडाप्टर) से कनेक्ट करें।" 
        : lang === "kn" 
          ? "ಕ್ಯಾಪ್ಸುಲ್‌ನ ಕೆಳಗಿನಿಂದ ಮೈಕ್ರೋ-ಯುಎಸ್‌ಬಿ ಕೇಬಲ್ ಅನ್ನು ನಿಮ್ಮ ಪವರ್ ಮೂಲಕ್ಕೆ (ಸೋಲಾರ್ ಯುಎಸ್‌ಬಿ ಬ್ಯಾಟರಿ ಬ್ಯಾಂಕ್ ಅಥವಾ ಫೋನ್ ಚಾರ್ಜರ್ ಅಡಾಪ್ಟರ್) ಸಂಪರ್ಕಪಡಿಸಿ." 
          : "Connect a micro-USB cable from the capsule bottom to your power source (a solar USB battery bank or phone charger adapter)."
    },
    {
      step: "04",
      title: lang === "hi" ? "वाई-फाई कॉन्फ़िगरेशन" : lang === "kn" ? "ವೈ-ಫೈ ಕಾನ್ಫಿಗರೇಶನ್" : "Wi-Fi Config",
      desc: lang === "hi" 
        ? "पहले लॉन्च पर, कॉन्फ़िगरेशन में अपने स्थानीय राउटर/हॉटस्पॉट क्रेडेंशियल दर्ज करें, और ऑन-बोर्ड OLED स्क्रीन को कनेक्ट होते और 'Sync OK' दिखाते हुए देखें!" 
        : lang === "kn" 
          ? "ಮೊದಲ ಬಾರಿಗೆ ಪ್ರಾರಂಭಿಸಿದಾಗ, ಕಾನ್ಫಿಗರೇಶನ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಸ್ಥಳೀಯ ರೂಟರ್/ಹಾಟ್‌ಸ್ಪಾಟ್ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ ಮತ್ತು OLED ಪರದೆಯು ಸಂಪರ್ಕಗೊಂಡು 'Sync OK' ತೋರಿಸುವುದನ್ನು ವೀಕ್ಷಿಸಿ!" 
          : "On first launch, enter your local router/hotspot credentials in the config, and watch the OLED screen connect and show 'Sync OK'!"
    }
  ];

  // NPK values calculated dynamically based on soil moisture and temp to show interactive ML simulation
  const mockNPK = {
    N: Math.max(10, Math.min(140, Math.round(sensors.soilMoisture.val * 1.8 + 10))),
    P: Math.max(10, Math.min(100, Math.round((100 - sensors.soilMoisture.val) * 0.9 + 15))),
    K: Math.max(10, Math.min(200, Math.round(sensors.soilTemp.val * 4 + 20)))
  };

  const getSimulatedRecommendation = () => {
    const moisture = sensors.soilMoisture.val;
    const temp = sensors.airTemp.val;
    if (moisture > 70) {
      if (temp > 28) return lang === "hi" ? "चावल (पानी की अधिक आवश्यकता)" : lang === "kn" ? "ಭತ್ತ (ಹೆಚ್ಚು ನೀರಿನ ಅಗತ್ಯವಿದೆ)" : "Rice (Water Intensive)";
      return lang === "hi" ? "कपास" : lang === "kn" ? "ಹತ್ತಿ" : "Cotton";
    } else if (moisture > 40) {
      if (temp > 26) return lang === "hi" ? "मक्का / कॉर्न" : lang === "kn" ? "ಮೆಕ್ಕೆಜೋಳ / ಜೋಳ" : "Maize / Corn";
      return lang === "hi" ? "गेहूं" : lang === "kn" ? "ಗೋಧಿ" : "Wheat";
    } else {
      if (temp > 30) return lang === "hi" ? "बाजरा (ज्वार/बाजरा)" : lang === "kn" ? "ಸಜ್ಜೆ (ಜೋಳ/ಸಜ್ಜೆ)" : "Millet (Jowar/Bajra)";
      return lang === "hi" ? "चना / दालें" : lang === "kn" ? "ಕಡಲೆ / ಬೇಳೆಕಾಳುಗಳು" : "Chickpeas / Gram";
    }
  };

  return (
    <div className="flex flex-col gap-0 -mt-10 md:-mt-14 -mx-4 md:-mx-8 overflow-x-hidden text-foreground bg-background">
      
      {/* ── IMMERSIVE HEADER HERO ── */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-b from-[#040814] via-[#060e22] to-[#040814] border-b border-white/[0.06] pt-20 pb-16">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[130px] animate-blob-morph" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-12 w-full">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>{lang === "hi" ? "मुख्य पृष्ठ पर वापस जाएं" : lang === "kn" ? "ಹೋಮ್ ಪೇಜ್‌ಗೆ ಹಿಂತಿರುಗಿ" : "Back to home"}</span>
          </Link>

          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-glow-primary">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              {lang === "hi" ? "KrishiAI स्मार्ट फार्म हब" : lang === "kn" ? "KrishiAI ಸ್ಮಾರ್ಟ್ ಫಾರ್ಮ್ ಹಬ್" : "KrishiAI Smart Farm Hub"}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-white leading-[1.1]">
            {lang === "hi" ? "टेस्ला-स्तर की इंजीनियरिंग।" : lang === "kn" ? "ಟೆಸ್ಲಾ-ಮಟ್ಟದ ಎಂಜಿನಿಯರಿಂಗ್." : "Tesla-Grade Engineering."}<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent">
              {lang === "hi" ? "खेतों के लिए निर्मित।" : lang === "kn" ? "ಹೊಲಗಳಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ." : "Built for the Fields."}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
            {lang === "hi"
              ? "KrishiAI स्मार्ट फार्म हब एक ऑल-इन-वन मौसम प्रतिरोधी कैप्सूल है जो सूक्ष्म-जलवायु सेंसर, ग्राउंडिंग प्रोब और स्थानीय निदान को एकीकृत करता है। यह वास्तविक समय टेलीमेट्री को सीधे फसल सलाहकारों में भेजने के लिए क्लाउड पाइपलाइनों से जुड़ता है।"
              : lang === "kn"
                ? "KrishiAI ಸ್ಮಾರ್ಟ್ ಫಾರ್ಮ್ ಹಬ್ ಎನ್ನುವುದು ಆಲ್-ಇನ್-ಒನ್ ಹವಾಮಾನ ನಿರೋಧಕ ಕ್ಯಾಪ್ಸುಲ್ ಆಗಿದ್ದು ಅದು ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ಹವಾಮಾನ ಸಂವೇದಕಗಳನ್ನು ಸಂಯೋಜಿಸುತ್ತದೆ. ಇದು ನೈಜ-ಸಮಯದ ಡೇಟಾವನ್ನು ನೇರವಾಗಿ ಬೆಳೆ ಸಲಹೆ ಪುಟಗಳಿಗೆ ಕಳುಹಿಸುತ್ತದೆ."
                : "The KrishiAI Smart Farm Hub is an all-in-one weatherproof capsule integrating micro-climate sensors, grounding probes, and local diagnostics. It links seamlessly with cloud pipelines to feed real-time telemetry straight into crop recommenders and disease radars."}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#order" className="btn-primary flex items-center gap-2 text-xs font-bold px-6 py-3 shadow-lg">
              {lang === "hi" ? "पूर्व-असेम्बल्ड नोड ऑर्डर करें" : lang === "kn" ? "ಪೂರ್ವ-ಜೋಡಿಸಲಾದ ಸಾಧನ ಆರ್ಡರ್ ಮಾಡಿ" : "Order Pre-Assembled Node"} <Check className="h-4 w-4" />
            </a>
            <a href="#simulator" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold text-white hover:bg-white/10 transition-all">
              {lang === "hi" ? "लाइव सेंसर सिम्युलेटर" : lang === "kn" ? "ಲೈವ್ ಸಂವೇದಕ ಸಿಮ್ಯುಲೇಟರ್" : "Live Sensor Simulator"}
            </a>
          </div>
        </div>
      </section>

      {/* ── PRODUCT OVERVIEW & SPECS ── */}
      <section className="py-24 px-6 md:px-12 bg-background border-b border-white/[0.05]">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            {/* Left description */}
            <div className="md:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{lang === "hi" ? "औद्योगिक वॉटरप्रूफिंग" : lang === "kn" ? "ಕೈಗಾರಿಕಾ ಜಲನಿರೋಧಕ" : "Industrial Waterproofing"}</span>
              <h2 className="text-3xl font-extrabold text-white font-display">{lang === "hi" ? "वेदर-सील्ड IP65 केसिंग" : lang === "kn" ? "ಹವಾಮಾನ ನಿರೋಧಕ IP65 ಕೇಸಿಂಗ್" : "Weather-sealed IP65 Casing"}</h2>
              <p className="text-xs md:text-sm text-muted-foreground/80 leading-relaxed font-semibold">
                {lang === "hi"
                  ? "अत्यधिक उष्णकटिबंधीय मौसम, तेज भारतीय गर्मियों और भारी मानसूनी बारिश में जीवित रहने के लिए डिज़ाइन किया गया। स्मार्ट हब ESP32 माइक्रोचिप को एक एयरटाइट कैप्सूल केसिंग के अंदर रखता है, पानी के संचय से बचने के लिए केबल पोर्ट को रबर सील के साथ नीचे की ओर निर्देशित करता है।"
                  : lang === "kn"
                    ? "ತೀವ್ರ ಉಷ್ಣವಲಯದ ಹವಾಮಾನ, ಬಿಸಿಲಿನ ಬೇಸಿಗೆ ಮತ್ತು ಭಾರಿ ಮಳೆಯಲ್ಲಿ ಬಾಳಿಕೆ ಬರುವಂತೆ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ. ಇದು ESP32 ಮೈಕ್ರೋಚಿಪ್ ಅನ್ನು ಏರ್‌ಟೈಟ್ ಕ್ಯಾಪ್ಸುಲ್ ಕೇಸಿಂಗ್‌ನೊಳಗೆ ಸುರಕ್ಷಿತವಾಗಿರಿಸುತ್ತದೆ."
                    : "Designed to survive extreme tropical weather, hot Indian summers, and heavy monsoon rains. The Smart Hub houses the ESP32 microchip inside an airtight capsule casing, routing cable ports through tight rubber seals pointing downwards to avoid any water accumulation."}
              </p>
              
              <div className="space-y-4 pt-2">
                {[
                  lang === "hi" ? "100 मीटर खुली रेंज के साथ निर्मित 2.4GHz वाई-फाई एंटीना" : lang === "kn" ? "100m ಮುಕ್ತ ವ್ಯಾಪ್ತಿಯೊಂದಿಗೆ ಅಂತರ್ನಿರ್ಮಿತ 2.4GHz ವೈ-ಫೈ ಆಂಟೆನಾ" : "Built-in 2.4GHz Wi-Fi antenna with up to 100m open range",
                  lang === "hi" ? "तत्काल टेलीमेट्री जांच के लिए SSD1306 स्थानीय OLED स्क्रीन डिस्प्ले" : lang === "kn" ? "ತ್ವರಿತ ಟೆಲಿಮೆಟ್ರಿ ಪರಿಶೀಲನೆಗಳಿಗಾಗಿ SSD1306 OLED ಪರದೆ" : "SSD1306 local OLED screen display for immediate telemetry checks",
                  lang === "hi" ? "कम 5V बिजली की आवश्यकता — मानक सौर यूएसबी पावर बैंकों के साथ संगत" : lang === "kn" ? "ಕಡಿಮೆ 5V ಪವರ್ ಅಗತ್ಯ — ಪ್ರಮಾಣಿತ ಸೋಲಾರ್ ಯುಎಸ್‌ಬಿ ಪವರ್ ಬ್ಯಾಂಕ್‌ಗಳೊಂದಿಗೆ ಹೊಂದಿಕೊಳ್ಳುತ್ತದೆ" : "Low 5V power requirement — compatible with standard solar USB power banks",
                  lang === "hi" ? "बहु-वर्षीय पृथ्वी एम्बेडिंग के लिए संक्षारण प्रतिरोधी कैपेसिटिव नमी प्रोब" : lang === "kn" ? "ಮಣ್ಣಿನಲ್ಲಿ ಹಲವು ವರ್ಷ ಬಾಳಿಕೆ ಬರುವ ತುಕ್ಕು ನಿರೋಧಕ ತೇವಾಂಶ ಸಂವೇದಕ" : "Corrosion-resistant capacitive moisture probe for multi-year earth embedding"
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-xs text-muted-foreground/90 font-semibold">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right mock graphic */}
            <div className="md:col-span-6">
              <div className="glass-panel rounded-3xl p-8 border-white/[0.06] shadow-xl relative overflow-hidden bg-slate-900/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px]" />
                
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-6 font-mono">{lang === "hi" ? "विनिर्देश लेजर" : lang === "kn" ? "ವಿಶೇಷಣಗಳ ಲೆಡ್ಜರ್" : "SPECIFICATIONS LEDGER"}</h4>
                
                <div className="space-y-4 text-xs">
                  {[
                    { label: lang === "hi" ? "फॉर्म फैक्टर" : lang === "kn" ? "ಫಾರ್ಮ್ ಫ್ಯಾಕ್ಟರ್" : "Form Factor", val: lang === "hi" ? "IP65 वेदरप्रूफ सील्ड कैप्सूल" : lang === "kn" ? "IP65 ಹವಾಮಾನ ನಿರೋಧಕ ಸೀಲ್ಡ್ ಕ್ಯಾಪ್ಸುಲ್" : "IP65 Weatherproof Sealed Capsule" },
                    { label: lang === "hi" ? "प्रोसेसर यूनिट" : lang === "kn" ? "ಪ್ರೊಸೆಸರ್ ಘಟಕ" : "Processor Unit", val: "ESP32 dual-core 32-bit CPU, 240MHz" },
                    { label: lang === "hi" ? "वोल्टेज / पावर" : lang === "kn" ? "ವೋಲ್ಟೇಜ್ / ಪವರ್" : "Voltage/Power", val: "5V DC Micro-USB / 150mA Draw" },
                    { label: lang === "hi" ? "जलवायु प्रोब" : lang === "kn" ? "ಹವಾಮಾನ ಸಂವೇದಕ" : "Climate Probe", val: "DHT22 Sensor (Temp + Humidity Array)" },
                    { label: lang === "hi" ? "पृथ्वी प्रोब" : lang === "kn" ? "ಮಣ್ಣಿನ ತಾಪಮಾನ ಸಂವೇದಕ" : "Earth Probe", val: "DS18B20 Stainless Temperature Rod" },
                    { label: lang === "hi" ? "मिट्टी पानी सेंसर" : lang === "kn" ? "ಮಣ್ಣಿನ ತೇವಾಂಶ ಸಂವೇದಕ" : "Soil Water Sensor", val: "Capacitive Moisture v2.0 Insulated" },
                    { label: lang === "hi" ? "स्थानीय इंटरफ़ेस" : lang === "kn" ? "ಸ್ಥಳೀಯ ಇಂಟರ್ಫೇಸ್" : "Local Interface", val: "0.96\" Blue/Yellow I2C OLED Screen" }
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between border-b border-white/[0.04] pb-2 font-mono">
                      <span className="text-muted-foreground font-semibold">{s.label}</span>
                      <span className="text-white font-bold text-right">{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── INTERACTIVE LIVE SENSOR SIMULATOR ── */}
      <section id="simulator" className="py-24 px-6 md:px-12 bg-gradient-to-b from-background via-slate-950/20 to-background border-b border-white/[0.05]">
        <div className="mx-auto max-w-5xl">
          
          <div className="text-center mb-16">
            <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-3">
              {lang === "hi" ? "डेवलपर सैंडबॉक्स" : lang === "kn" ? "ಡೆವಲಪರ್ ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್" : "Developer Sandbox"}
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
              {lang === "hi" ? "लाइव हार्डवेयर सिम्युलेटर" : lang === "kn" ? "ಲೈವ್ ಹಾರ್ಡ್‌ವೇರ್ ಸಿಮ್ಯುಲೇಟರ್" : "Live Hardware Simulator"}
            </h2>
            <p className="mt-3 text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-semibold">
              {lang === "hi"
                ? "विभिन्न कृषि वातावरणों का अनुकरण करने के लिए नीचे दिए गए स्लाइडर खींचें और देखें कि कैसे स्मार्ट हब टेलीमेट्री वास्तविक समय में एआई भविष्यवाणियों को समायोजित करती है।"
                : lang === "kn"
                  ? "ವಿವಿಧ ಕೃಷಿ ಪರಿಸರಗಳನ್ನು ಸಿಮ್ಯುಲೇಟ್ ಮಾಡಲು ಕೆಳಗಿನ ಸ್ಲೈಡರ್‌ಗಳನ್ನು ಎಳೆಯಿರಿ ಮತ್ತು ನೈಜ ಸಮಯದಲ್ಲಿ AI ಬೆಳೆ ಶಿಫಾರಸು ಹೇಗೆ ಬದಲಾಗುತ್ತದೆ ಎಂಬುದನ್ನು ನೋಡಿ."
                  : "Drag the sliders below to simulate different field environments and see how the Smart Hub telemetry adjusts the AI predictions in real-time."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Sliders (Col 1-6) */}
            <div className="lg:col-span-6 glass-panel rounded-3xl p-6 md:p-8 border-white/[0.06] flex flex-col justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-6 font-mono">{lang === "hi" ? "सेंसर प्रोब समायोजित करें" : lang === "kn" ? "ಸಂವೇದಕಗಳನ್ನು ಸರಿಹೊಂದಿಸಿ" : "ADJUST SENSOR PROBES"}</h4>
              
              <div className="space-y-6">
                {(Object.keys(sensors) as SensorKey[]).map((key) => {
                  const s = sensors[key];
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white font-bold">{getSensorName(key)}</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          {s.val} {s.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={s.val}
                        onChange={(e) => handleSimSlider(key, parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.04] text-[10px] text-muted-foreground leading-relaxed flex items-start gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{lang === "hi" ? "स्लाइडर्स ESP32 एनालॉग GPIO पिन में डिजिटल स्ट्रिंग्स में परिवर्तित होने वाले वोल्टेज रीडआउट की नकल करते हैं।" : lang === "kn" ? "ಸ್ಲೈಡರ್‌ಗಳು ESP32 ಅನಲಾಗ್ GPIO ಪಿನ್‌ಗಳಲ್ಲಿ ರೀಡಿಂಗ್‌ಗಳ ಬದಲಾವಣೆಯನ್ನು ಸಿಮ್ಯುಲೇಟ್ ಮಾಡುತ್ತವೆ." : "Sliders mimic voltage readouts converting to digital strings in ESP32 analog GPIO pins."}</span>
              </div>
            </div>

            {/* Simulated Device Screen & AI prediction (Col 7-12) */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-6">
              
              {/* Device OLED Mock */}
              <div className="rounded-3xl bg-black border border-white/10 p-6 flex flex-col justify-between font-mono shadow-inner min-h-[160px] text-emerald-400 relative">
                {/* Scanline overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] rounded-3xl pointer-events-none" />
                
                <div className="flex justify-between items-center text-[10px] opacity-75">
                  <span>{lang === "hi" ? "सिंक: सतत" : lang === "kn" ? "ಸಿಂಕ್: ನಿರಂತರ" : "SYNC: CONTINUOUS"}</span>
                  <span className="text-emerald-500 font-bold animate-pulse">{lang === "hi" ? "● वाई-फाई कनेक्टेड" : lang === "kn" ? "● ವೈ-ಫೈ ಸಂಪರ್ಕಗೊಂಡಿದೆ" : "● WIFI CONNECTED"}</span>
                </div>

                <div className="my-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>{lang === "hi" ? "वायु तापमान: " : lang === "kn" ? "ಗಾಳಿ ತಾಪಮಾನ: " : "Air Temp: "}<span className="text-white">{sensors.airTemp.val}°C</span></div>
                  <div>{lang === "hi" ? "वायु नमी: " : lang === "kn" ? "ಗಾಳಿ ಆರ್ದ್ರತೆ: " : "Air Hum: "}<span className="text-white">{sensors.airHumidity.val}%</span></div>
                  <div>{lang === "hi" ? "मिट्टी तापमान: " : lang === "kn" ? "ಮಣ್ಣು ತಾಪಮಾನ: " : "Soil Temp: "}<span className="text-white">{sensors.soilTemp.val}°C</span></div>
                  <div>{lang === "hi" ? "मिट्टी नमी: " : lang === "kn" ? "ಮಣ್ಣು ತೇವಾಂಶ: " : "Soil Moist: "}<span className="text-white">{sensors.soilMoisture.val}%</span></div>
                </div>

                <div className="text-[9px] text-center border-t border-emerald-500/10 pt-2 text-muted-foreground">
                  Ingesting: NPK [{mockNPK.N}, {mockNPK.P}, {mockNPK.K}] &middot; pH 6.5
                </div>
              </div>

              {/* AI Prediction result mock */}
              <div className="glass-panel rounded-3xl p-6 md:p-8 border-emerald-500/15 shadow-xl flex-1 flex flex-col justify-between bg-emerald-500/[0.02]">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-400">
                    <Sparkles className="h-4 w-4 animate-spin-slow" />
                    <span>{lang === "hi" ? "वास्तविक समय फसल अनुशंसा" : lang === "kn" ? "ನೈಜ-ಸಮಯದ ಬೆಳೆ ಶಿಫಾರಸು" : "Real-time Crop Recommendation"}</span>
                  </div>
                  <h4 className="text-3xl font-black font-display text-white mt-1">
                    {getSimulatedRecommendation()}
                  </h4>
                  <p className="text-[11px] text-muted-foreground/80 mt-2 leading-relaxed font-semibold">
                    {lang === "hi"
                      ? `सटीक मशीन लर्निंग एल्गोरिदम इस फसल का सुझाव देने के लिए वर्तमान जलवायु नमी (${sensors.soilMoisture.val}%) और वायु तापमान (${sensors.airTemp.val}°C) को ऐतिहासिक डेटासेट वितरणों के साथ मिलाता है।`
                      : lang === "kn"
                        ? `ನಿಖರವಾದ ಯಂತ್ರ ಕಲಿಕೆಯು ಹವಾಮಾನ ತೇವಾಂಶ (${sensors.soilMoisture.val}%) ಮತ್ತು ಗಾಳಿಯ ತಾಪಮಾನ (${sensors.airTemp.val}°C) ಆಧರಿಸಿ ಈ ಬೆಳೆಯನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತದೆ.`
                        : `Precision ML matches current climate moisture (${sensors.soilMoisture.val}%) and air temperature (${sensors.airTemp.val}°C) to historical dataset distributions to suggest this crop.`}
                  </p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/[0.04] mt-6">
                  <Link href="/crop-predictor" className="w-full">
                    <button className="w-full btn-primary py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md">
                      {lang === "hi" ? "फसल प्रेडिक्टर पर जाएं" : lang === "kn" ? "ಬೆಳೆ ಪ್ರೆಡಿಕ್ಟರ್ ಪುಟಕ್ಕೆ ಹೋಗಿ" : "Go to Crop Predictor"} <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── AI PREDICTION WORKFLOW ── */}
      <section className="py-24 px-6 md:px-12 bg-background border-b border-white/[0.05]">
        <div className="mx-auto max-w-5xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{lang === "hi" ? "परिशुद्धता वास्तुकला" : lang === "kn" ? "ನಿಖರವಾದ ವಾಸ್ತುಶಿಲ್ಪ" : "Precision Architecture"}</span>
          <h2 className="text-3xl font-extrabold text-white font-display mt-2 mb-16">{lang === "hi" ? "हार्डवेयर-टू-मॉडल डेटा पाइपलाइन" : lang === "kn" ? "ಹಾರ್ಡ್‌ವೇರ್‌ನಿಂದ ಮಾಡೆಲ್‌ಗೆ ಡೇಟಾ ಪೈಪ್‌ಲೈನ್" : "Hardware-to-Model Data Pipeline"}</h2>
          
          <div className="grid gap-8 md:grid-cols-4 text-center relative">
            {[
              { icon: Cpu, title: lang === "hi" ? "01. ESP32 रीडिंग" : lang === "kn" ? "01. ESP32 ರೀಡಿಂಗ್ಸ್" : "01. ESP32 Reads", desc: lang === "hi" ? "सेंसर जमीन और वायुमंडलीय टेलीमेट्री डेटा ब्लॉक कैप्चर करते हैं।" : lang === "kn" ? "ಸಂವೇದಕಗಳು ಮಣ್ಣಿನ ಮತ್ತು ಗಾಳಿಯ ಡೇಟಾವನ್ನು ಸೆರೆಹಿಡಿಯುತ್ತವೆ." : "Sensors capture grounding and atmospheric telemetry data blocks." },
              { icon: Database, title: lang === "hi" ? "02. एपीआई अंतर्ग्रहण" : lang === "kn" ? "02. API ಇಂಜೆಸ್ಟ್" : "02. Ingests API", desc: lang === "hi" ? "अंतर्निहित वाई-फाई क्लाइंट बैकएंड `/api/sensor/ingest` पर पेलोड जेएसओएन भेजता है।" : lang === "kn" ? "ವೈ-ಫೈ ಕ್ಲೈಂಟ್ ಪೇಲೋಡ್ ಡೇಟಾವನ್ನು ಬ್ಯಾಕೆಂಡ್‌ಗೆ ಕಳುಹಿಸುತ್ತದೆ." : "Built-in Wi-Fi client fires payload JSON to backend `/api/sensor/ingest`." },
              { icon: Activity, title: lang === "hi" ? "03. मॉडल प्रसंस्करण" : lang === "kn" ? "03. ಮಾಡೆಲ್ ಪ್ರಕ್ರಿಯೆ" : "03. Model Processing", desc: lang === "hi" ? "परिशुद्धता अनुशंसा तर्क उपयुक्तता की गणना करने के लिए टेलीमेट्री लोड करता है।" : lang === "kn" ? "ನಿಖರವಾದ ಶಿಫಾರಸು ವ್ಯವಸ್ಥೆಯು ಸೂಕ್ತತೆಯನ್ನು ಲೆಕ್ಕಹಾಕಲು ಡೇಟಾವನ್ನು ಲೋಡ್ ಮಾಡುತ್ತದೆ." : "Precision recommendation logic loads telemetry to calculate suitabilities." },
              { icon: Smartphone, title: lang === "hi" ? "04. डैशबोर्ड व्यू" : lang === "kn" ? "04. ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ವೀಕ್ಷಣೆ" : "04. Dashboard View", desc: lang === "hi" ? "किसान परिणाम देखता है और अपनी भाषा में तुरंत सूचनाएं प्राप्त करता है।" : lang === "kn" ? "ರೈತರು ಫಲಿತಾಂಶಗಳನ್ನು ವೀಕ್ಷಿಸುತ್ತಾರೆ ಮತ್ತು ತಕ್ಷಣವೇ ತಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಅಧಿಸೂಚನೆಗಳನ್ನು ಪಡೆಯುತ್ತಾರೆ." : "Farmer views results and receives notifications instantly in their language." }
            ].map((step, i) => (
              <div key={step.title} className="flex flex-col items-center bg-slate-900/10 border border-white/[0.03] p-6 rounded-2xl relative z-10 backdrop-blur-sm">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow shadow-emerald-500/10 mb-4">
                  <step.icon className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold text-white">{step.title}</h4>
                <p className="text-[10px] text-muted-foreground mt-2 font-semibold leading-relaxed max-w-[170px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEP-BY-STEP INSTALLATION GUIDE ── */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-background via-slate-950/20 to-background border-b border-white/[0.05]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{lang === "hi" ? "सेटअप गाइड" : lang === "kn" ? "ಸೆಟಪ್ ಮಾರ್ಗದರ್ಶಿ" : "Setup Guide"}</span>
            <h2 className="text-3xl font-extrabold text-white font-display mt-2">{lang === "hi" ? "स्थापना प्रक्रिया" : lang === "kn" ? "ಅಳವಡಿಕೆ ಪ್ರಕ್ರಿಯೆ" : "Installation Process"}</h2>
            <p className="mt-2 text-xs text-muted-foreground/80 font-semibold max-w-md mx-auto">
              {lang === "hi" ? "हब स्थापित करने में 30 मिनट से कम समय लगता है। किसी विशेष इंजीनियरिंग कौशल की आवश्यकता नहीं है।" : lang === "kn" ? "ಸಾಧನವನ್ನು ಸೆಟಪ್ ಮಾಡಲು 30 ನಿಮಿಷಕ್ಕಿಂತ ಕಡಿಮೆ ಸಮಯ ಬೇಕಾಗುತ್ತದೆ. ಯಾವುದೇ ಕೌಶಲ್ಯದ ಅಗತ್ಯವಿಲ್ಲ." : "Setting up the hub takes less than 30 minutes. No specialized engineering skills required."}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {INSTALLATION_STEPS.map((s) => (
              <div key={s.step} className="glass-panel rounded-2xl p-6 border-white/[0.05] relative overflow-hidden bg-[#040814]/15">
                <div className="text-4xl font-display font-black text-emerald-500/10 absolute top-0 right-0 p-2 select-none">
                  {s.step}
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">{lang === "hi" ? `कदम ${s.step}` : lang === "kn" ? `ಹಂತ ${s.step}` : `Step ${s.step}`}</span>
                <h4 className="text-sm font-bold text-white font-display mb-2">{s.title}</h4>
                <p className="text-[11px] text-muted-foreground/85 leading-relaxed font-semibold">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE FAQ SECTION ── */}
      <section className="py-24 px-6 md:px-12 bg-background border-b border-white/[0.05]">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{lang === "hi" ? "सामान्य प्रश्न" : lang === "kn" ? "ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು" : "Common Questions"}</span>
            <h2 className="text-3xl font-extrabold text-white font-display mt-2">{lang === "hi" ? "अक्सर पूछे जाने वाले प्रश्न" : lang === "kn" ? "ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು" : "Frequently Asked Questions"}</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="glass-panel rounded-2xl border-white/[0.05] overflow-hidden bg-card/5"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                  >
                    <span className="text-xs md:text-sm font-bold text-white pr-4">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-emerald-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 text-xs text-muted-foreground/80 leading-relaxed font-semibold border-t border-white/[0.03] pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DUAL INQUIRY / ORDER FORM & WHATSAPP ── */}
      <section id="order" className="py-24 px-6 md:px-12 bg-gradient-to-t from-[#040814] to-background">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Inquiry Form (Col 1-7) */}
            <div id="inquiry" className="lg:col-span-7">
              <div className="glass-panel rounded-3xl p-6 md:p-8 border-emerald-500/10 shadow-2xl relative bg-[#040814]/40">
                <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-emerald-400 select-none">
                  {lang === "hi" ? "पूछताछ फॉर्म" : lang === "kn" ? "ವಿಚಾರಣೆ ಫಾರ್ಮ್" : "Pre-Order Form"}
                </div>
                
                <h3 className="text-2xl font-extrabold text-white font-display mb-2">{lang === "hi" ? "हार्डवेयर पूछताछ का अनुरोध करें" : lang === "kn" ? "ಹಾರ್ಡ್‌ವೇರ್ ವಿಚಾರಣೆಗೆ ವಿನಂತಿಸಿ" : "Request Hardware Inquiry"}</h3>
                <p className="text-xs text-muted-foreground/85 font-semibold mb-6">
                  {lang === "hi" ? "अपना विवरण भरें, और हमारी स्थानीय टीम आपसे संपर्क करेगी।" : lang === "kn" ? "ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ, ನಮ್ಮ ತಂಡವು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ." : "Fill in your details, and our local operations team will contact you to help configure or dispatch a Hub."}
                </p>

                <AnimatePresence mode="wait">
                  {formSubmitted ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-3"
                    >
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 animate-bounce">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">{lang === "hi" ? "पूछताछ सफलतापूर्वक प्राप्त हुई" : lang === "kn" ? "ವಿಚಾರಣೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ" : "Inquiry Received Successfully"}</h4>
                      <p className="text-[11px] text-muted-foreground/80 max-w-xs mx-auto leading-relaxed">
                        {lang === "hi"
                          ? "KrishiAI से संपर्क करने के लिए धन्यवाद। हमारी टीम जल्द ही आपसे मोबाइल के माध्यम से संपर्क करेगी।"
                          : lang === "kn"
                            ? "KrishiAI ಸಂಪರ್ಕಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ನಮ್ಮ ತಂಡವು ಶೀಘ್ರದಲ್ಲೇ ಮೊಬೈಲ್ ಮೂಲಕ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ."
                            : "Thank you for contacting KrishiAI. Our support desk (PP) or operations lead (RS) will connect with you shortly via mobile."}
                      </p>
                      <button
                        onClick={() => setFormSubmitted(false)}
                        className="mt-2 text-xs text-emerald-400 hover:underline focus:outline-none"
                      >
                        {lang === "hi" ? "दूसरा अनुरोध सबमिट करें" : lang === "kn" ? "ಮತ್ತೊಂದು ವಿಚಾರಣೆ ಸಲ್ಲಿಸಿ" : "Submit another request"}
                      </button>
                    </motion.div>
                  ) : (
                    <form key="form" onSubmit={handleFormSubmit} className="space-y-4">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">{lang === "hi" ? "पूरा नाम" : lang === "kn" ? "ಪೂರ್ಣ ಹೆಸರು" : "Full Name"}</label>
                          <input
                            type="text"
                            required
                            placeholder={lang === "hi" ? "उदा. सुरेश पटेल" : lang === "kn" ? "ಉದಾ. ಸುರೇಶ್ ಪಟೇಲ್" : "e.g. Suresh Patel"}
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="input-base text-xs bg-slate-950/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">{lang === "hi" ? "व्हाट्सएप / मोबाइल नंबर" : lang === "kn" ? "ವಾಟ್ಸಾಪ್ / ಮೊಬೈಲ್ ಸಂಖ್ಯೆ" : "WhatsApp / Mobile No"}</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +91 99999 99999"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="input-base text-xs bg-slate-950/40"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">{lang === "hi" ? "राज्य / क्षेत्र" : lang === "kn" ? "ರಾಜ್ಯ / ಪ್ರದೇಶ" : "State / Region"}</label>
                          <input
                            type="text"
                            required
                            placeholder={lang === "hi" ? "उदा. गुजरात" : lang === "kn" ? "ಉದಾ. ಗುಜರಾತ್" : "e.g. Gujarat"}
                            value={formData.state}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                            className="input-base text-xs bg-slate-950/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">{lang === "hi" ? "खेत का आकार (एकड़)" : lang === "kn" ? "ಹೊಲದ ಗಾತ್ರ (ಎಕರೆ)" : "Farm Size (Acres)"}</label>
                          <input
                            type="number"
                            required
                            placeholder="e.g. 5"
                            value={formData.acres}
                            onChange={(e) => setFormData(prev => ({ ...prev, acres: e.target.value }))}
                            className="input-base text-xs bg-slate-950/40"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">{lang === "hi" ? "अनुरोध का प्रकार" : lang === "kn" ? "ವಿನಂತಿಯ ಪ್ರಕಾರ" : "Type of Request"}</label>
                        <select
                          value={formData.interest}
                          onChange={(e) => setFormData(prev => ({ ...prev, interest: e.target.value }))}
                          className="select-base text-xs bg-slate-950/40 text-foreground"
                        >
                          <option value="buy" className="bg-slate-950">{lang === "hi" ? "पूर्व-असेम्बल्ड स्मार्ट हब का ऑर्डर करें (₹1,200 आवरण)" : lang === "kn" ? "ಪೂರ್ವ-ಜೋಡಿಸಲಾದ ಸ್ಮಾರ್ಟ್ ಹಬ್ ಆರ್ಡರ್ ಮಾಡಿ (₹1,200 ಕೇಸಿಂಗ್)" : "Pre-Order Pre-assembled Smart Hub (₹1,200 blueprint/casing)"}</option>
                          <option value="demo" className="bg-slate-950">{lang === "hi" ? "क्षेत्रीय प्रदर्शन और सहायता का अनुरोध करें" : lang === "kn" ? "ಕ್ಷೇತ್ರ ಪ್ರದರ್ಶನ ಮತ್ತು ಸಹಾಯಕ್ಕೆ ವಿನಂತಿಸಿ" : "Request Field Demonstration & Setup Assistance"}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">{lang === "hi" ? "संदेश" : lang === "kn" ? "ಸಂದೇಶ" : "Message"}</label>
                        <textarea
                          rows={3}
                          placeholder={lang === "hi" ? "हमें अपनी मिट्टी के प्रकार, पानी के स्रोत आदि के बारे में बताएं..." : lang === "kn" ? "ನಿಮ್ಮ ಮಣ್ಣಿನ ಪ್ರಕಾರ, ನೀರಿನ ಮೂಲದ ಬಗ್ಗೆ ನಮಗೆ ತಿಳಿಸಿ..." : "Tell us about your soil type, water source, or crop focus..."}
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          className="input-base text-xs bg-slate-950/40"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full btn-primary py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 hover:shadow-glow-primary active:scale-[0.98]"
                      >
                        {formLoading 
                          ? (lang === "hi" ? "भेजा जा रहा है..." : lang === "kn" ? "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ..." : "Sending Inquiry...") 
                          : (lang === "hi" ? "पूछताछ विवरण जमा करें" : lang === "kn" ? "ವಿಚಾರಣೆ ವಿವರಗಳನ್ನು ಸಲ್ಲಿಸಿ" : "Submit Inquiry Details")}
                      </button>

                    </form>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* WhatsApp Inquiry Option (Col 8-12) */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{lang === "hi" ? "सीधा चैट पूछताछ" : lang === "kn" ? "ನೇರ ಚಾಟ್ ವಿಚಾರಣೆ" : "Direct Chat Inquiry"}</span>
              <h3 className="text-2xl md:text-3xl font-display font-black text-white leading-tight">{lang === "hi" ? "व्हाट्सएप के माध्यम से त्वरित पूछताछ" : lang === "kn" ? "ವಾಟ್ಸಾಪ್ ಮೂಲಕ ತಕ್ಷಣದ ವಿಚಾರಣೆಗಳು" : "Instant Inquiries via WhatsApp"}</h3>
              <p className="text-xs text-muted-foreground/80 leading-relaxed font-semibold">
                {lang === "hi"
                  ? "तुरंत प्रतिक्रिया चाहते हैं? व्हाट्सएप पर हमारी टीम से सीधे जुड़ें। हम वायरिंग सेटअप, घटक प्रश्नों में सहायता कर सकते हैं, या सीधे आपके पते पर केसिंग भेज सकते हैं।"
                  : lang === "kn"
                    ? "ತಕ್ಷಣದ ಪ್ರತಿಕ್ರಿಯೆ ಬೇಕೇ? ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ನಮ್ಮ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ. ನಾವು ವೈರಿಂಗ್ ಸೆಟಪ್‌ಗಳು, ಸಂವೇದಕ ವಿಚಾರಣೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡಬಹುದು."
                    : "Want immediate feedback? Connect directly with our operations desk on WhatsApp. We can assist with wiring setups, component queries, or ship a pre-built casing directly to your address."}
              </p>
              
              <a
                href="https://wa.me/919999999999?text=Hi%20KrishiAI%20team,%20I%20am%20interested%20in%20the%20KrishiAI%20Smart%20Farm%20Hub.%20Please%20send%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-4 shadow-lg shadow-emerald-500/15 hover:shadow-glow-primary active:scale-95 transition-all text-xs w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5 fill-white stroke-transparent" />
                <span>{lang === "hi" ? "व्हाट्सएप पूछताछ चैट" : lang === "kn" ? "ವಾಟ್ಸಾಪ್ ವಿಚಾರಣೆ ಚಾಟ್" : "WhatsApp Inquiry Chat"}</span>
              </a>
              
              <div className="pt-4 border-t border-white/[0.04] space-y-2">
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  {lang === "hi" ? "सपोर्ट टीम उपलब्ध: सोम - शनि (सुबह 9 - शाम 6 बजे)" : lang === "kn" ? "ಸಹಾಯ ತಂಡ ಲಭ್ಯವಿದೆ: ಸೋಮ - ಶನಿ (ಬೆಳಗ್ಗೆ 9 - ಸಂಜೆ 6)" : "Support Team Available: Mon - Sat (9 AM - 6 PM)"}
                </div>
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  {lang === "hi" ? "ब्लूप्रिंट GPL ओपन सोर्स लाइसेंस के अंतर्गत आते हैं।" : lang === "kn" ? "ವಿನ್ಯಾಸಗಳು GPL ಮುಕ್ತ ಮೂಲ ಪರವಾನಗಿ ಅಡಿಯಲ್ಲಿ ಬರುತ್ತವೆ." : "Blueprints covered by the GPL Open Source license."}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
