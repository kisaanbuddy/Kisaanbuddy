'use client';

import { useLanguage } from '@/lib/language';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function WhyUs() {
  const { lang } = useLanguage();

  const stats = [
    {
      value: "95%",
      label: lang === "hi" ? "पूर्वानुमान सटीकता" : lang === "kn" ? "ಮುನ್ಸೂಚನೆ ನಿಖರತೆ" : "Prediction Accuracy",
      desc: lang === "hi" 
        ? "क्षेत्रीय मिट्टी के मापदंडों के साथ क्रॉस-रेफरेंस किए गए कठोर मशीन लर्निंग प्रशिक्षण सेट एक सत्यापित सटीकता रेटिंग प्रदान करते हैं।" 
        : lang === "kn" 
          ? "ಪ್ರಾದೇಶಿಕ ಮಣ್ಣಿನ ನಿಯತಾಂಕಗಳೊಂದಿಗೆ ಕ್ರಾಸ್-ರೆಫರೆನ್ಸ್ ಮಾಡಿದ ಕಠಿಣ ಯಂತ್ರ ಕಲಿಕೆ ತರಬೇತಿ ಸೆಟ್‌ಗಳು ಪರಿಶೀಲಿಸಿದ ನಿಖರತೆಯ ರೇಟಿಂಗ್ ನೀಡುತ್ತವೆ." 
          : "Rigorous ML training sets cross-referenced with regional soil parameters yield a verified accuracy rating.",
    },
    {
      value: "24/7",
      label: lang === "hi" ? "एआई सहायता" : lang === "kn" ? "AI ಸಹಾಯ" : "AI Assistance",
      desc: lang === "hi" 
        ? "बहुभाषी सपोर्ट दिन हो या रात, किसी भी फसल की बीमारी या मौसम के प्रश्न के तुरंत उत्तर देता है।" 
        : lang === "kn" 
          ? "ಬಹುಭಾಷಾ ಬೆಂಬಲವು ಹಗಲು ಅಥವಾ ರಾತ್ರಿ ಯಾವುದೇ ಬೆಳೆ ರೋಗ ಅಥವಾ ಹವಾಮಾನ ಪ್ರಶ್ನೆಗೆ ತ್ವರಿತ ಪ್ರತಿಕ್ರಿಯೆಗಳನ್ನು ಪ್ರಚೋದಿಸುತ್ತದೆ." 
          : "multilingual support triggers instant responses to any crop disease or weather query, day or night.",
    },
    {
      value: "500+",
      label: lang === "hi" ? "फसल के प्रकार" : lang === "kn" ? "ಬೆಳೆ ಪ್ರಕಾರಗಳು" : "Crop Types",
      desc: lang === "hi" 
        ? "पूरे भारत में वाणिज्यिक, अनाज, फलियां, जैविक और स्थानीय ग्रामीण फसलों को कवर करने वाला व्यापक डेटाबेस।" 
        : lang === "kn" 
          ? "ಭಾರತದಾದ್ಯಂತ ವಾಣಿಜ್ಯ, ಧಾನ್ಯ, ದ್ವಿದಳ ಧಾನ್ಯ, ಸಾವಯವ ಮತ್ತು ಸ್ಥಳೀಯ ಗ್ರಾಮೀಣ ಬೆಳೆಗಳನ್ನು ಒಳಗೊಂಡಿರುವ ಸಮಗ್ರ ಡೇಟಾಬೇಸ್." 
          : "Comprehensive database covering commercial, grain, legume, organic, and localized rural crops across India.",
    },
    {
      value: "All-in-One",
      label: lang === "hi" ? "प्लेटफ़ॉर्म एकीकृत" : lang === "kn" ? "ವೇದಿಕೆ ಸಂಯೋಜಿತ" : "Platform Integrated",
      desc: lang === "hi" 
        ? "सेंसर टेलीमेट्री, मंडी दर अलर्ट, बीमारी छवि प्रसंस्करण और मौसम के विवरण को जोड़ता है।" 
        : lang === "kn" 
          ? "ಸಂವೇದಕ ಟೆಲಿಮೆಟ್ರಿ, ಮಂಡಿ ದರ ಎಚ್ಚರಿಕೆಗಳು, ರೋಗ ಚಿತ್ರ ಸಂಸ್ಕರಣೆ ಮತ್ತು ಹವಾಮಾನ ವಿವರಗಳನ್ನು ಸಂಯೋಜಿಸುತ್ತದೆ." 
          : "Combines sensors telemetry, mandi rates alerts, disease image processing, and weather details.",
    },
  ];

  return (
    <section className="py-20 bg-muted/15 border-b border-border/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Title Block */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {lang === "hi" ? "हम ही क्यों" : lang === "kn" ? "ನಾವು ಏಕೆ" : "Why Choose KrishiAI"}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            {lang === "hi" ? "डिजिटल कृषि में" : lang === "kn" ? "ಡಿಜಿಟಲ್ ಕೃಷಿಶಾಸ್ತ್ರದಲ್ಲಿ" : "The Trust Standard in"}{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              {lang === "hi" ? "भरोसे का मानक" : lang === "kn" ? "ವಿಶ್ವಾಸಾರ್ಹ ಮಾನದಂಡ" : "Digital Agronomy"}
            </span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed font-semibold">
            {lang === "hi" 
              ? "हम बेजोड़ सटीकता और उपयोगिता प्रदान करने के लिए स्थानीय ग्रामीण विशेषज्ञता के साथ अत्याधुनिक एआई मॉडल को मिलाते हैं।" 
              : lang === "kn" 
                ? "ನಾವು ಸಾಟಿಯಿಲ್ಲದ ನಿಖರತೆ ಮತ್ತು ಉಪಯುಕ್ತತೆಯನ್ನು ಒದಗಿಸಲು ಸ್ಥಳೀಯ ಗ್ರಾಮೀಣ ಪರಿಣತಿಯೊಂದಿಗೆ ಅತ್ಯಾಧುನಿಕ AI ಮಾದರಿಗಳನ್ನು ವಿಲೀನಗೊಳಿಸುತ್ತೇವೆ." 
                : "We merge cutting-edge AI models with local rural expertise to provide unmatched accuracy and usability."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm p-6 hover:shadow-lg hover:border-border/60 transition-all duration-300 flex flex-col gap-3 relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-emerald-500/5 blur-xl" />
              
              <div className="text-3xl font-display font-black text-emerald-500">
                {s.value}
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  {s.label}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
