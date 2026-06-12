'use client';

import { useLanguage } from '@/lib/language';
import { Sprout, Users, Landmark, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function Vision() {
  const { lang } = useLanguage();

  const pillars = [
    { 
      icon: Users, 
      title: lang === "hi" ? "समावेशी पहुँच" : lang === "kn" ? "ಸಮಗ್ರ ಪ್ರವೇಶ" : "Inclusive Access", 
      desc: lang === "hi" 
        ? "क्षेत्रीय भाषाओं (हिंदी, कन्नड़) में वॉयस सर्च शुरू करके, हम ग्रामीण किसानों के लिए तकनीकी बाधाओं को दूर करते हैं।" 
        : lang === "kn" 
          ? "ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳಲ್ಲಿ (ಹಿಂದಿ, ಕನ್ನಡ) ಧ್ವನಿ ಹುಡುಕಾಟವನ್ನು ನಿಯೋಜಿಸುವ ಮೂಲಕ, ನಾವು ಗ್ರಾಮೀಣ ಕಿಸಾನ್ ತಾಂತ್ರಿಕ ಅಡೆತಡೆಗಳನ್ನು ನಿವಾರಿಸುತ್ತೇವೆ." 
          : "By deploying voice search in regional languages (Hindi, Kannada), we remove technological barriers for rural Kisans." 
    },
    { 
      icon: Landmark, 
      title: lang === "hi" ? "वैज्ञानिक पैदावार" : lang === "kn" ? "ವೈಜ್ಞಾನಿಕ ಇಳುವರಿ" : "Scientific Yields", 
      desc: lang === "hi" 
        ? "लागत की रक्षा और उत्पादन बढ़ाने के लिए सटीक मिट्टी के NPK रीडिंग और भविष्य कहनेवाला निदान के साथ अनुमान को बदलना।" 
        : lang === "kn" 
          ? "ಹೂಡಿಕೆಯನ್ನು ರಕ್ಷಿಸಲು ಮತ್ತು ಉತ್ಪಾದನೆಯನ್ನು ಹೆಚ್ಚಿಸಲು ಕಠಿಣ ಮಣ್ಣಿನ NPK ವಾಚನಗೋಷ್ಠಿಗಳು ಮತ್ತು ಮುನ್ಸೂಚಕ ರೋಗನಿರ್ಣಯದೊಂದಿಗೆ ಅಂದಾಜನ್ನು ಬದಲಾಯಿಸುವುದು." 
          : "Replacing guess-work with precise soil NPK readings and predictive diagnostics to protect inputs and increase output." 
    },
    { 
      icon: Globe, 
      title: lang === "hi" ? "सतत खेती" : lang === "kn" ? "ಸುಸ್ಥಿರ ಕೃಷಿ" : "Sustainable Farming", 
      desc: lang === "hi" 
        ? "रासायनिक बहाव को कम करने और जैविक विकल्पों का समर्थन करने के लिए मौसम के पूर्वानुमान और कीटनाशक सलाह को एकीकृत करना।" 
        : lang === "kn" 
          ? "ರಾಸಾಯನಿಕ ಹರಿವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಮತ್ತು ಸಾವಯವ ಪರ್ಯಾಯಗಳನ್ನು ಬೆಂಬಲಿಸಲು ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಕೀಟನಾಶಕ ಸಲಹೆಯನ್ನು ಸಂಯೋಜಿಸುವುದು." 
          : "Integrating weather forecasting and pesticide advising to decrease chemical runoffs and support organic alternatives." 
    }
  ];

  return (
    <section className="relative overflow-hidden py-24 border-b border-border/20">
      
      {/* Background Graphic Morphs */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/5 via-background to-teal-950/5 -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 text-center relative z-10 space-y-12">
        
        {/* Core Vision Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto animate-float">
            <Sprout className="h-6 w-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-foreground leading-[1.1]">
            {lang === "hi" ? "भारतीय कृषि के भविष्य के लिए" : lang === "kn" ? "ಭಾರತೀಯ ಕೃಷಿಯ ಭವಿಷ್ಯಕ್ಕಾಗಿ" : "Our Vision for the"}<br />
            <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-500 bg-clip-text text-transparent">
              {lang === "hi" ? "हमारा दृष्टिकोण" : lang === "kn" ? "ನಮ್ಮ ದೃಷ್ಟಿಕೋನ" : "Future of Indian Agriculture"}
            </span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-semibold italic">
            &ldquo;{lang === "hi" 
              ? "हमारा मिशन ग्रामीण पारिस्थितिकी प्रणालियों में खाद्य सुरक्षा और कृषि समृद्धि सुनिश्चित करते हुए प्रत्येक किसान को कृत्रिम बुद्धिमत्ता और डेटा-संचालित निर्णय लेने की क्षमता से सशक्त बनाना है।" 
              : lang === "kn" 
                ? "ಗ್ರಾಮೀಣ ಪರಿಸರ ವ್ಯವಸ್ಥೆಗಳಲ್ಲಿ ಆಹಾರ ಸುರಕ್ಷತೆ ಮತ್ತು ಕೃಷಿ ಸಮೃದ್ಧಿಯನ್ನು ಖಾತ್ರಿಪಡಿಸಿಕೊಳ್ಳುವ ಮೂಲಕ ಪ್ರತಿಯೊಬ್ಬ ರೈತನನ್ನು ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಡೇಟಾ-ಚಾಲಿತ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವಿಕೆಯೊಂದಿಗೆ ಸಬಲೀಕರಣಗೊಳಿಸುವುದು ನಮ್ಮ ಉದ್ದೇಶವಾಗಿದೆ." 
                : "Our mission is to empower every farmer with artificial intelligence and data-driven decision making, securing food safety and farm prosperity across rural ecosystems."}&rdquo;
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto text-left">
          {pillars.map((p, idx) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-2xl border border-border/30 bg-card/20 p-5 flex flex-col gap-2.5 hover:border-emerald-500/20 transition-all duration-300"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-sm">
                <p.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 font-display">
                {p.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
