'use client';

import { useLanguage } from '@/lib/language';
import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FAQ() {
  const { lang } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: lang === "hi" ? "KrishiAI क्या है?" : lang === "kn" ? "KrishiAI ಎಂದರೇನು?" : "What is KrishiAI?",
      a: lang === "hi" 
        ? "KrishiAI एक AI-संचालित स्मार्ट कृषि मंच है जिसे भारतीय किसानों को डेटा-संचालित निर्णय लेने में मदद करने के लिए डिज़ाइन किया गया है। यह मंच स्थान, मिट्टी के मैट्रिक्स और फसल छवियों को इकट्ठा करता है ताकि पूर्वानुमान, मंडी भाव और बीमारी का निदान प्रदान किया जा सके।" 
        : lang === "kn" 
          ? "KrishiAI ಎನ್ನುವುದು ಭಾರತೀಯ ರೈತರಿಗೆ ಡೇಟಾ-ಚಾಲಿತ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ AI-ಚಾಲಿತ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ವೇದಿಕೆಯಾಗಿದೆ. ಮುನ್ಸೂಚನೆಗಳು, ಮಾರುಕಟ್ಟೆ ದರಗಳು ಮತ್ತು ರೋಗ ರೋಗನಿರ್ಣಯಗಳನ್ನು ಒದಗಿಸಲು ವೇದಿಕೆಯು ಸ್ಥಳ, ಮಣ್ಣಿನ ಮಾಪನಗಳು ಮತ್ತು ಬೆಳೆ ಚಿತ್ರಗಳನ್ನು ಸಂಗ್ರಹಿಸುತ್ತದೆ." 
          : "KrishiAI is an AI-powered smart agriculture platform designed to help Indian farmers make data-driven decisions. The platform gathers location, soil metrics, and crop images to provide forecasts, predictions, market rates, and disease diagnoses.",
    },
    {
      q: lang === "hi" ? "फसल रोग डिटेक्टर कैसे काम करता है?" : lang === "kn" ? "ಬೆಳೆ ರೋಗ ಪತ್ತೆಕಾರಕ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?" : "How does the Crop Disease Detector work?",
      a: lang === "hi" 
        ? "आप बस संक्रमित फसल के पत्ते की एक तस्वीर लेते हैं और उसे मंच पर अपलोड करते हैं। हमारे मशीन लर्निंग वर्गीकरण मॉडल 2 सेकंड के भीतर विशिष्ट बीमारी का निदान करने और उपचार की सिफारिश करने के लिए दृश्य विशेषताओं का विश्लेषण करते हैं।" 
        : lang === "kn" 
          ? "ನೀವು ಕೇವಲ ಸೋಂಕಿತ ಬೆಳೆ ಎಲೆಯ ಫೋಟೋ ತೆಗೆದು ವೇದಿಕೆಗೆ ಅಪ್ಲೋಡ್ ಮಾಡಿ. ನಮ್ಮ ಯಂತ್ರ ಕಲಿಕೆ ವರ್ಗೀಕರಣ ಮಾದರಿಗಳು ನಿರ್ದಿಷ್ಟ ರೋಗವನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಮತ್ತು 2 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಪರಿಹಾರಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡಲು ದೃಶ್ಯ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತವೆ." 
          : "You simply take a photo of the infected crop leaf and upload it to the platform. Our machine learning classification models analyze the visual features to diagnose the specific disease and recommend remedies within 2 seconds.",
    },
    {
      q: lang === "hi" ? "क्या KrishiAI का उपयोग मुफ्त है?" : lang === "kn" ? "KrishiAI ಬಳಸಲು ಉಚಿತವೇ?" : "Is KrishiAI free to use?",
      a: lang === "hi" 
        ? "हाँ! KrishiAI वर्तमान में अपने शुरुआती एक्सेस बीटा चरण में है और सभी किसानों, कृषि विशेषज्ञों और भागीदारों के लिए पूरी तरह से मुफ्त है।" 
        : lang === "kn" 
          ? "ಹೌದು! KrishiAI ಪ್ರಸ್ತುತ ತನ್ನ ಆರಂಭಿಕ ಪ್ರವೇಶ ಬೀಟಾ ಹಂತದಲ್ಲಿದೆ ಮತ್ತು ಎಲ್ಲಾ ರೈತರು, ಕೃಷಿಕರು ಮತ್ತು ಪಾಲುದಾರರಿಗೆ ಸಂಪೂರ್ಣವಾಗಿ ಉಚಿತವಾಗಿದೆ." 
          : "Yes! KrishiAI is currently in its early access beta phase and is completely free for all farmers, agriculturalists, and partners.",
    },
    {
      q: lang === "hi" ? "क्या KrishiAI स्थानीय भारतीय भाषाओं का समर्थन करता है?" : lang === "kn" ? "KrishiAI ಸ್ಥಳೀಯ ಭಾರತೀಯ ಭಾಷೆಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆಯೇ?" : "Does KrishiAI support local Indian languages?",
      a: lang === "hi" 
        ? "बिल्कुल। KrishiAI में हिंदी, कन्नड़ और अंग्रेजी में पूर्ण वॉयस क्वेरी समर्थन और इंटरफेस शामिल हैं। आप माइक्रोफ़ोन बटन पर क्लिक करके सीधे एआई सहायक से बात कर सकते हैं।" 
        : lang === "kn" 
          ? "ಖಂಡಿತವಾಗಿ. KrishiAI ಹಿಂದಿ, ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಪೂರ್ಣ ಧ್ವನಿ ಪ್ರಶ್ನೆ ಬೆಂಬಲ ಮತ್ತು ಇಂಟರ್ಫೇಸ್‌ಗಳನ್ನು ಒಳಗೊಂಡಿದೆ. ಮೈಕ್ರೊಫೋನ್ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡುವ ಮೂಲಕ ನೀವು ನೇರವಾಗಿ AI ಸಹಾಯಕನೊಂದಿಗೆ ಮಾತನಾಡಬಹುದು." 
          : "Absolutely. KrishiAI features full voice query support and interfaces in Hindi, Kannada, and English. You can speak directly to the AI Assistant by clicking the microphone button.",
    },
    {
      q: lang === "hi" ? "फसल की सिफारिशें कितनी सटीक हैं?" : lang === "kn" ? "ಬೆಳೆ ಶಿಫಾರಸುಗಳು ಎಷ್ಟು ನಿಖರವಾಗಿವೆ?" : "How accurate are the crop recommendations?",
      a: lang === "hi" 
        ? "हमारा सॉइल हेल्थ एआई मॉडल आपके इनपुट किए गए एनपीके स्तरों, मिट्टी के पीएच और जैविक कार्बन (ओसी) को ऐतिहासिक फसल पैदावार और मौसम के इतिहास के साथ क्रॉस-रेफरेंस करके 95% सत्यापित सटीकता स्कोर के साथ फसल विकल्प प्रदान करता है।" 
        : lang === "kn" 
          ? "ನಮ್ಮ ಮಣ್ಣಿನ ಆರೋಗ್ಯ AI ಮಾದರಿಯು ನಿಮ್ಮ ಇನ್‌ಪುಟ್ ಮಾಡಿದ NPK ಮಟ್ಟಗಳು, ಮಣ್ಣಿನ pH ಮತ್ತು ಸಾವಯವ ಇಂಗಾಲವನ್ನು (OC) ಐತಿಹಾಸಿಕ ಬೆಳೆ ಇಳುವರಿ ಮತ್ತು ಹವಾಮಾನ ಇತಿಹಾಸಗಳೊಂದಿಗೆ ಕ್ರಾಸ್-ರೆಫರೆನ್ಸ್ ಮಾಡುವ ಮೂಲಕ 95% ನಿಖರತೆಯ ಸ್ಕೋರ್‌ನೊಂದಿಗೆ ಬೆಳೆ ಆಯ್ಕೆಗಳನ್ನು ನೀಡುತ್ತದೆ." 
          : "Our Soil Health AI model outputs crop choices with a verified 95% accuracy score by crossing your inputted NPK levels, soil pH, and organic carbon (OC) with historical crop yields and weather histories.",
    },
    {
      q: lang === "hi" ? "क्या मैं लाइव मार्केट मंडी भाव की निगरानी कर सकता हूँ?" : lang === "kn" ? "ನಾನು ಲೈವ್ ಮಾರುಕಟ್ಟೆ ಮಂಡಿ ಬೆಲೆಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಬಹುದೇ?" : "Can I monitor live market mandi prices?",
      a: lang === "hi" 
        ? "हाँ। मंडी मूल्य निर्धारण इंजन दैनिक रूप से भारत भर में लाइव APMC बाजार दरों को ट्रैक करता है। आप अपनी विशिष्ट फसल खोज सकते हैं और दरें सीमा पार करने पर आपको सूचित करने के लिए लक्षित मूल्य अलर्ट सेट कर सकते हैं।" 
        : lang === "kn" 
          ? "ಹೌದು. ಮಂಡಿ ಬೆಲೆ ಎಂಜಿನ್ ಪ್ರತಿದಿನ ಭಾರತದಾದ್ಯಂತ ಲೈವ್ APMC ಮಾರುಕಟ್ಟೆ ದರಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡುತ್ತದೆ. ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ಬೆಳೆಯನ್ನು ನೀವು ಹುಡುಕಬಹುದು ಮತ್ತು ಬೆಲೆಗಳು ಮಿತಿಗಳನ್ನು ಮೀರಿದಾಗ ನಿಮಗೆ ತಿಳಿಸಲು ಗುರಿ ಬೆಲೆ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಹೊಂದಿಸಬಹುದು." 
          : "Yes. The Mandi Pricing engine tracks live APMC market quotes across India daily. You can search for your specific crop and set target price alerts to notify you when prices cross thresholds.",
    },
    {
      q: lang === "hi" ? "KrishiAI सरकारी योजनाओं में कैसे मदद करता है?" : lang === "kn" ? "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗೆ KrishiAI ಹೇಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ?" : "How does KrishiAI help with government schemes?",
      a: lang === "hi" 
        ? "अपनी भूमि के आकार और उम्र जैसे विवरण दर्ज करके, हमारा योजना उपकरण सक्रिय केंद्रीय योजनाओं (जैसे पीएम-किसान, पीएमएफबीवाई, और केसीसी) को स्कैन करता है ताकि उन कार्यक्रमों को ढूंढा जा सके जिनके लिए आप योग्य हैं, और आवेदन करने के लिए सीधे लिंक प्रदान करता है।" 
        : lang === "kn" 
          ? "ನಿಮ್ಮ ಭೂಮಿಯ ಗಾತ್ರ ಮತ್ತು ವಯಸ್ಸಿನಂತಹ ವಿವರಗಳನ್ನು ನಮೂದಿಸುವ ಮೂಲಕ, ನಮ್ಮ ಯೋಜನೆಗಳ ಸಾಧನವು ಸಕ್ರಿಯ ಕೇಂದ್ರ ಯೋಜನೆಗಳನ್ನು (PM-ಕಿಸಾನ್, PMFBY ಮತ್ತು KCC ನಂತಹ) ಸ್ಕ್ಯಾನ್ ಮಾಡುತ್ತದೆ ಮತ್ತು ನೀವು ಅರ್ಹತೆ ಪಡೆಯುವ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಹುಡುಕುತ್ತದೆ." 
          : "By inputting details like your land size and age, our Schemes tool scans active central schemes (like PM-Kisan, PMFBY, and KCC) to find programs you qualify for, providing direct links to apply.",
    },
    {
      q: lang === "hi" ? "खेत डायरी फीचर क्या है?" : lang === "kn" ? "ಖೇತ್ ಡೈರಿ ವೈಶಿಷ್ಟ್ಯ ಎಂದರೇನು?" : "What is the Khet Diary feature?",
      a: lang === "hi" 
        ? "खेत डायरी एक डिजिटल फार्म लॉगबुक है। यह आपको दैनिक कृषि गतिविधियों को लॉग करने, खर्चों को रिकॉर्ड करने, मौसम की स्थिति का दस्तावेजीकरण करने और प्रगति को ट्रैक करने के लिए फसल की तस्वीरें अपलोड करने की अनुमति देता है।" 
        : lang === "kn" 
          ? "ಖೇತ್ ಡೈರಿ ಎನ್ನುವುದು ಡಿಜಿಟಲ್ ಫಾರ್ಮ್ ಲಾಗ್‌ಬುಕ್ ಆಗಿದೆ. ಇದು ದೈನಂದಿನ ಕೃಷಿ ಚಟುವಟಿಕೆಗಳನ್ನು ಲಾಗ್ ಮಾಡಲು, ವೆಚ್ಚಗಳನ್ನು ದಾಖಲಿಸಲು, ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಗಳನ್ನು ದಾಖಲಿಸಲು ಮತ್ತು ಬೆಳೆ ಚಿತ್ರಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಲು ನಿಮಗೆ ಅನುಮತಿಸುತ್ತದೆ." 
          : "Khet Diary is a digital farm logbook. It allows you to log daily farm activities, record expenses, document weather conditions, and upload crop images to track progress over cycles.",
    },
    {
      q: lang === "hi" ? "स्मार्ट हब हार्डवेयर शोकेस क्या है?" : lang === "kn" ? "ಸ್ಮಾರ್ಟ್ ಹಬ್ ಹಾರ್ಡ್‌ವೇರ್ ಪ್ರದರ್ಶನ ಎಂದರೇನು?" : "What is the Smart Hub hardware showcase?",
      a: lang === "hi" 
        ? "यह भौतिक IoT हार्डवेयर ब्लॉकों (मिट्टी की नमी सेंसर, स्वचालित पानी के वाल्व और एनपीके पाठकों) के साथ एकीकरण को प्रदर्शित करता है। यह सीधे डैशबोर्ड से स्मार्ट निगरानी और स्वचालित सिंचाई नियंत्रण की अनुमति देता है।" 
        : lang === "kn" 
          ? "ಇದು ಭೌತಿಕ IoT ಹಾರ್ಡ್‌ವೇರ್ ಬ್ಲಾಕ್‌ಗಳೊಂದಿಗೆ (ಮಣ್ಣಿನ ತೇವಾಂಶ ಸಂವೇದಕಗಳು, ಸ್ವಯಂಚಾಲಿತ ನೀರಿನ ಕವಾಟಗಳು ಮತ್ತು NPK ರೀಡರ್‌ಗಳು) ಸಂಯೋಜನೆಗಳನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ. ಇದು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಿಂದ ನೇರವಾಗಿ ಸ್ಮಾರ್ಟ್ ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ಸ್ವಯಂಚಾಲಿತ ನೀರಾವರಿ ನಿಯಂತ್ರಣವನ್ನು ಅನುಮತಿಸುತ್ತದೆ." 
          : "It demonstrates integrations with physical IoT hardware blocks (soil moisture sensors, automatic water valves, and NPK readers). This allows smart monitoring and automated irrigation control directly from the dashboard.",
    },
    {
      q: lang === "hi" ? "मैं KrishiAI के साथ कैसे शुरुआत करूं?" : lang === "kn" ? "KrishiAI ನೊಂದಿಗೆ ನಾನು ಹೇಗೆ ಪ್ರಾರಂಭಿಸುವುದು?" : "How do I get started with KrishiAI?",
      a: lang === "hi" 
        ? "आप 'शुरू करें' या 'KrishiAI लॉन्च करें' बटन पर क्लिक करके तुरंत शुरुआत कर सकते हैं। एक मुफ्त खाता बनाएं या सभी उपकरणों को तुरंत एक्सेस करने के लिए अतिथि मोड का उपयोग करें।" 
        : lang === "kn" 
          ? "ನೀವು 'ಪ್ರಾರಂಭಿಸಿ' ಅಥವಾ 'KrishiAI ಪ್ರಾರಂಭಿಸಿ' ಬಟನ್‌ಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡುವ ಮೂಲಕ ತಕ್ಷಣವೇ ಪ್ರಾರಂಭಿಸಬಹುದು. ಉಚಿತ ಖಾತೆಯನ್ನು ರಚಿಸಿ ಅಥವಾ ಎಲ್ಲಾ ಪರಿಕರಗಳನ್ನು ತಕ್ಷಣ ಪ್ರವೇಶಿಸಲು ಅತಿಥಿ ಮೋಡ್ ಬಳಸಿ." 
          : "You can get started immediately by clicking the 'Get Started' or 'Launch KrishiAI' buttons. Create a free account or use the guest mode to access all tools immediately.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-background relative border-b border-border/20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Title */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {lang === "hi" ? "सहायता केंद्र" : lang === "kn" ? "ಸಹಾಯ ಕೇಂದ್ರ" : "Support Center"}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            {lang === "hi" ? "अक्सर पूछे जाने वाले" : lang === "kn" ? "ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ" : "Frequently Asked"}{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              {lang === "hi" ? "प्रश्न" : lang === "kn" ? "ಪ್ರಶ್ನೆಗಳು" : "Questions"}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground/80 max-w-xs mx-auto font-semibold">
            {lang === "hi" 
              ? "हमारे कृषि एआई उपकरणों और संचालन के संबंध में सामान्य उत्तर।" 
              : lang === "kn" 
                ? "ನಮ್ಮ ಕೃಷಿ AI ಪರಿಕರಗಳು ಮತ್ತು ಕಾರ್ಯಾಚರಣೆಗಳ ಕುರಿತು ಸಾಮಾನ್ಯ ಉತ್ತರಗಳು." 
                : "Common answers regarding our agricultural AI tools and operations."}
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3.5 select-none">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden
                  ${isOpen 
                    ? 'border-emerald-500/35 bg-emerald-500/[0.02] shadow-md dark:border-primary/20' 
                    : 'border-border/40 bg-card/20 hover:border-border/60 hover:bg-card/40'
                  }`}
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors font-bold text-foreground text-xs md:text-sm gap-4"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className={`h-4.5 w-4.5 shrink-0 ${isOpen ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                </button>

                {/* Accordion Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-0 text-xs md:text-sm text-muted-foreground/90 leading-relaxed font-semibold">
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
  );
}
