'use client';

import { useLanguage } from '@/lib/language';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export function Testimonials() {
  const { lang } = useLanguage();

  const testimonials = [
    {
      name: lang === "hi" ? "रमेश पटेल" : lang === "kn" ? "ರಮೇಶ್ ಪಟೇಲ್" : "Ramesh Patel",
      location: lang === "hi" ? "राजकोट, गुजरात" : lang === "kn" ? "ರಾಜ್‌ಕೋಟ್, ಗುಜರಾತ್" : "Rajkot, Gujarat",
      crop: lang === "hi" ? "कपास किसान" : lang === "kn" ? "ಹತ್ತಿ ರೈತ" : "Cotton Farmer",
      text: lang === "hi" 
        ? "क्रॉप प्रेडिक्टर ने मेरे कम नाइट्रोजन वाले खेत के लिए कपास को सर्वोत्तम माना और खाद अनुपात का सुझाव दिया। इस सीजन में मेरी फसल की पैदावार 35% बढ़ गई।" 
        : lang === "kn" 
          ? "ಕ್ರಾಪ್ ಪ್ರೆಡಿಕ್ಟರ್ ನನ್ನ ಕಡಿಮೆ-ಸಾರಜನಕ ಕ್ಷೇತ್ರಕ್ಕೆ ಹತ್ತಿ ಸೂಕ್ತವೆಂದು ಗುರುತಿಸಿದೆ ಮತ್ತು ನಿಖರವಾದ ಗೊಬ್ಬರದ ಅನುಪಾತವನ್ನು ಸೂಚಿಸಿದೆ. ಈ ಋತುವಿನಲ್ಲಿ ನನ್ನ ಬೆಳೆ ಇಳುವರಿ 35% ಹೆಚ್ಚಾಗಿದೆ." 
          : "The Crop Predictor identified Cotton was optimal for my low-nitrogen field and suggested the exact fertilizer ratio. My crop yield grew by 35% this season.",
      stars: 5,
    },
    {
      name: lang === "hi" ? "सुरेश गौड़ा" : lang === "kn" ? "ಸುರೇಶ್ ಗೌಡ" : "Suresh Gowda",
      location: lang === "hi" ? "कोलार, कर्नाटक" : lang === "kn" ? "ಕೋಲಾರ, ಕರ್ನಾಟಕ" : "Kolar, Karnataka",
      crop: lang === "hi" ? "टमाटर उत्पादक" : lang === "kn" ? "ಟೊಮೆಟೊ ಬೆಳೆಗಾರ" : "Tomato Grower",
      text: lang === "hi" 
        ? "पत्ती रोग डिटेक्टर ने मेरी फसल बचा ली। मैंने टमाटर के पत्तों पर काले धब्बे देखे, फोटो ली, 2 सेकंड में बीमारी का पता चला और जैविक नीम उपचार लागू किया।" 
        : lang === "kn" 
          ? "ಎಲೆ ರೋಗ ಪತ್ತೆಕಾರಕವು ನನ್ನ ಬೆಳೆಯನ್ನು ಉಳಿಸಿತು. ನನ್ನ ಟೊಮೆಟೊ ಎಲೆಗಳ ಮೇಲಿನ ಕಪ್ಪು ಚುಕ್ಕೆಗಳನ್ನು ನಾನು ಫೋಟೋ ತೆಗೆದಿದ್ದೇನೆ, 2 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ರೋಗ ಪತ್ತೆಯಾಯಿತು ಮತ್ತು ಸಾವಯವ ಬೇವಿನ ಶಿಫಾರಸುಗಳನ್ನು ಅನ್ವಯಿಸಿದೆ." 
          : "The leaf disease detector saved my crop. I photographed black spots on my tomato leaves, diagnosed early blight in 2 seconds, and applied the organic neem recommendations.",
      stars: 5,
    },
    {
      name: lang === "hi" ? "राजेश कुमार" : lang === "kn" ? "ರಾಜೇಶ್ ಕುಮಾರ್" : "Rajesh Kumar",
      location: lang === "hi" ? "आगरा, उत्तर प्रदेश" : lang === "kn" ? "ಆಗ್ರಾ, ಉತ್ತರ ಪ್ರದೇಶ" : "Agra, Uttar Pradesh",
      crop: lang === "hi" ? "आलू उत्पादक" : lang === "kn" ? "ಆಲೂಗಡ್ಡೆ ಬೆಳೆಗಾರ" : "Potato Cultivator",
      text: lang === "hi" 
        ? "मंडी भाव अलर्ट ने मुझे आगरा के दामों को आसानी से ट्रैक करने में मदद की। आलू का भाव ₹1,900 पार होने पर मुझे एसएमएस मिला और मैंने अधिकतम लाभ पर बेचा।" 
        : lang === "kn" 
          ? "ಮಂಡಿ ಬೆಲೆ ಗುರಿ ಅಧಿಸೂಚನೆಗಳು ಆಗ್ರಾ ದರಗಳನ್ನು ಸುಲಭವಾಗಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ನನಗೆ ಅವಕಾಶ ಮಾಡಿಕೊಟ್ಟವು. ಆಲೂಗಡ್ಡೆ ₹1,900 ದಾಟಿದಾಗ ನನಗೆ SMS ಎಚ್ಚರಿಕೆ ಸಿಕ್ಕಿತು ಮತ್ತು ಗರಿಷ್ಠ ಲಾಭಕ್ಕೆ ಮಾರಾಟ ಮಾಡಿದೆ." 
          : "Mandi price target notifications allowed me to track Agra rates easily. I got an SMS alert when potato crossed ₹1,900 and sold at maximum profit.",
      stars: 5,
    },
  ];

  return (
    <section className="py-20 bg-muted/15 border-b border-border/20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Title */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {lang === "hi" ? "सफलता की कहानियां" : lang === "kn" ? "ಯಶಸ್ಸಿನ ಕಥೆಗಳು" : "Success Stories"}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            {lang === "hi" ? "भारतीय किसानों का" : lang === "kn" ? "ಭಾರತೀಯ ರೈತರ" : "Trusted by"}{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              {lang === "hi" ? "भरोसा" : lang === "kn" ? "ನಂಬಿಕೆ" : "Indian Kisans"}
            </span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed font-semibold">
            {lang === "hi" 
              ? "देखें कि कैसे गुजरात, कर्नाटक और उत्तर प्रदेश के किसान अपनी फसलों को अनुकूलित कर रहे हैं और मुनाफा बढ़ा रहे हैं।" 
              : lang === "kn" 
                ? "ಗುಜರಾತ್, ಕರ್ನಾಟಕ ಮತ್ತು ಉತ್ತರ ಪ್ರದೇಶದ ರೈತರು ತಮ್ಮ ಬೆಳೆಗಳನ್ನು ಹೇಗೆ ಉತ್ತಮಗೊಳಿಸುತ್ತಿದ್ದಾರೆ ಮತ್ತು ಲಾಭವನ್ನು ಹೇಗೆ ಗರಿಷ್ಠಗೊಳಿಸುತ್ತಿದ್ದಾರೆ ಎಂಬುದನ್ನು ನೋಡಿ." 
                : "See how farmers across Gujarat, Karnataka, and Uttar Pradesh are optimizing their crops and maximizing profits."}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-emerald-500/15 absolute top-6 right-6" />

                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed italic font-medium">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-6 pt-4 border-t border-border/20 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-foreground">{t.name}</span>
                  <span className="text-[10px] text-muted-foreground/80 font-bold">{t.location}</span>
                </div>
                <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase">
                  {t.crop}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
