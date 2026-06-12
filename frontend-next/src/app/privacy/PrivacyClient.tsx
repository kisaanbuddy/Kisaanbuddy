'use client';

import Link from 'next/link';
import { Lock, ArrowLeft, Shield, ShieldCheck, Eye, Cookie } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function PrivacyClient() {
  const { t, lang } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-6">
      
      {/* Back button */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>{lang === "hi" ? "मुख्य पृष्ठ पर वापस जाएं" : lang === "kn" ? "ಹೋಮ್ ಪೇಜ್‌ಗೆ ಹಿಂತಿರುಗಿ" : "Back to home"}</span>
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border/40 bg-card/25 backdrop-blur-md p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow shadow-emerald-500/10">
            <Lock className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            {lang === "hi" ? "कानूनी दस्तावेज" : lang === "kn" ? "ಕಾನೂನು ದಾಖಲೆ" : "Legal Document"}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
          {lang === "hi" ? "गोपनीयता नीति" : lang === "kn" ? "ಗೌಪ್ಯತಾ ನೀತಿ" : "Privacy Policy"}
        </h1>
        <p className="text-xs text-muted-foreground mt-2">
          {lang === "hi" ? "अंतिम अद्यतन: 5 जून, 2026" : lang === "kn" ? "ಕೊನೆಯದಾಗಿ ನವೀಕರಿಸಿದ್ದು: ಜೂನ್ 5, 2026" : "Last Updated: June 5, 2026"}
        </p>
      </div>

      {/* Policy contents */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 text-xs md:text-sm text-muted-foreground leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {lang === "hi" ? "1. परिचय" : lang === "kn" ? "1. ಪರಿಚಯ" : "1. Introduction"}
          </h2>
          <p>
            {lang === "hi"
              ? "KrishiAI (\"हम\", \"हमारा\", \"हमें\") में आपका स्वागत है। हम https://krishiaiindia.vercel.app पर सुलभ KrishiAI स्मार्ट कृषि मंच का संचालन करते हैं। हम आपकी व्यक्तिगत जानकारी और आपकी गोपनीयता के अधिकार की रक्षा के लिए प्रतिबद्ध हैं। यदि इस नीति या हमारी प्रथाओं के बारे में आपके कोई प्रश्न हैं, तो कृपया हमसे adityaoutlier5@gmail.com पर संपर्क करें।"
              : lang === "kn"
                ? "KrishiAI (\"ನಾವು\", \"ನಮ್ಮ\", \"ನಮಗೆ\") ಗೆ ಸ್ವಾಗತ. ನಾವು https://krishiaiindia.vercel.app ನಲ್ಲಿ ಲಭ್ಯವಿರುವ KrishiAI ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ವೇದಿಕೆಯನ್ನು ನಿರ್ವಹಿಸುತ್ತೇವೆ. ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಮತ್ತು ಗೌಪ್ಯತೆಯ ಹಕ್ಕನ್ನು ರಕ್ಷಿಸಲು ನಾವು ಬದ್ಧರಾಗಿದ್ದೇವೆ. ಈ ನೀತಿಯ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿದ್ದರೆ adityaoutlier5@gmail.com ನಲ್ಲಿ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ."
                : "Welcome to KrishiAI (\"we\", \"our\", \"us\"). We operate the KrishiAI smart agriculture platform accessible at https://krishiaiindia.vercel.app. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this policy or our practices, please contact us at adityaoutlier5@gmail.com."}
          </p>
          <p>
            {lang === "hi"
              ? "यह गोपनीयता नीति हमारी वेबसाइट, वेब एप्लिकेशन, चैटबॉट, बीमारी निदान अपलोड इंटरफेस और किसी भी संबंधित सेवाओं के माध्यम से एकत्र की गई सभी जानकारी पर लागू होती है।"
              : lang === "kn"
                ? "ಈ ಗೌಪ್ಯತಾ ನೀತಿಯು ನಮ್ಮ ವೆಬ್‌ಸೈಟ್, ವೆಬ್ ಅಪ್ಲಿಕೇಶನ್, ಚಾಟ್‌ಬಾಟ್ ಮತ್ತು ಇತರ ಸಂಬಂಧಿತ ಸೇವೆಗಳ ಮೂಲಕ ಸಂಗ್ರಹಿಸಲಾದ ಎಲ್ಲಾ ಮಾಹಿತಿಗೆ ಅನ್ವಯಿಸುತ್ತದೆ."
                : "This Privacy Policy applies to all information collected through our website, web application, chatbot, disease diagnosis upload interfaces, and any related services."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Eye className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {lang === "hi" ? "2. जानकारी जो हम एकत्र करते हैं" : lang === "kn" ? "2. ನಾವು ಸಂಗ್ರಹಿಸುವ ಮಾಹಿತಿ" : "2. Information We Collect"}
          </h2>
          <p>
            {lang === "hi"
              ? "हम व्यक्तिगत जानकारी एकत्र करते हैं जिसे आप स्वेच्छा से पंजीकरण करते समय, हमारी सेवाओं का उपयोग करते समय या हमसे संपर्क करते समय प्रदान करते हैं। इसमें शामिल हैं:"
              : lang === "kn"
                ? "ನಮ್ಮ ಸೇವೆಗಳನ್ನು ಬಳಸುವಾಗ ಅಥವಾ ನೋಂದಾಯಿಸುವಾಗ ನೀವು ಸ್ವಯಂಪ್ರೇರಿತವಾಗಿ ಒದಗಿಸುವ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ನಾವು ಸಂಗ್ರಹಿಸುತ್ತೇವೆ. ಇದರಲ್ಲಿ ಒಳಗೊಂಡಿದೆ:"
                : "We collect personal information that you voluntarily provide to us when registering, using our services, or contacting us. This includes:"}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">{lang === "hi" ? "खाता जानकारी:" : lang === "kn" ? "ಖಾತೆ ಮಾಹಿತಿ:" : "Account Information:"}</strong>{' '}
              {lang === "hi" ? "नाम, ईमेल पते, फोन नंबर और एन्क्रिप्टेड पासवर्ड।" : lang === "kn" ? "ಹೆಸರು, ಇಮೇಲ್ ವಿಳಾಸ, ದೂರವಾಣಿ ಸಂಖ್ಯೆ ಮತ್ತು ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ ಪಾಸ್‌ವರ್ಡ್‌ಗಳು." : "Names, email addresses, phone numbers, and encrypted passwords."}
            </li>
            <li>
              <strong className="text-foreground">{lang === "hi" ? "कृषि इनपुट:" : lang === "kn" ? "ಕೃಷಿ ಮಾಹಿತಿ:" : "Farming Inputs:"}</strong>{' '}
              {lang === "hi" ? "मिट्टी के स्वास्थ्य पैरामीटर (नाइट्रोजन, फास्फोरस, पोटेशियम स्तर, मिट्टी का पीएच, जैविक कार्बन सामग्री) और भूमि का आकार।" : lang === "kn" ? "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ನಿಯತಾಂಕಗಳು (NPK ಮಟ್ಟಗಳು, ಮಣ್ಣಿನ pH, ಸಾವಯವ ಇಂಗಾಲ) ಮತ್ತು ಭೂಮಿಯ ಗಾತ್ರದ ವಿವರಗಳು." : "Soil health parameters (Nitrogen, Phosphorus, Potassium levels, soil pH, organic carbon content) and land size statistics."}
            </li>
            <li>
              <strong className="text-foreground">{lang === "hi" ? "फसल बीमारी छवियां:" : lang === "kn" ? "ಬೆಳೆ ರೋಗದ ಚಿತ್ರಗಳು:" : "Crop Disease Images:"}</strong>{' '}
              {lang === "hi" ? "फसल की बीमारी का निदान करने के लिए आपके द्वारा अपलोड की गई पत्तियों की तस्वीरें। रोगजनकों की पहचान करने के लिए इन छवियों को संसाधित किया जाता है।" : lang === "kn" ? "ಬೆಳೆ ರೋಗ ಪತ್ತೆಗಾಗಿ ನೀವು ಅಪ್ಲೋಡ್ ಮಾಡುವ ಸಸ್ಯದ ಎಲೆಗಳ ಫೋಟೋಗಳು. ರೋಗಕಾರಕಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಇವುಗಳನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತದೆ." : "Plant leaves and crop pictures uploaded by you to our Crop Disease AI diagnostics. These images are processed to identify pathogens."}
            </li>
            <li>
              <strong className="text-foreground">{lang === "hi" ? "स्थान डेटा:" : lang === "kn" ? "ಸ್ಥಳದ ಡೇಟಾ:" : "Location Data:"}</strong>{' '}
              {lang === "hi" ? "मौसम अलर्ट और मंडी कीमतों को हल करने के लिए आपके ब्राउज़र द्वारा प्रदान किया गया अनुमानित या सटीक स्थान।" : lang === "kn" ? "ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಮಂಡಿ ದರಗಳನ್ನು ಒದಗಿಸಲು ಬ್ರೌಸರ್ ಮೂಲಕ ಪಡೆಯಲಾದ ಅಂದಾಜು ಸ್ಥಳದ ವಿವರಗಳು." : "Approximate or precise GPS location details provided by your browser to resolve hyper-local weather alerts and mandi market prices."}
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Cookie className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {lang === "hi" ? "3. गूगल एडसेंस और कुकीज़" : lang === "kn" ? "3. ಗೂಗಲ್ ಆಡ್ಸೆನ್ಸ್ ಮತ್ತು ಕುಕೀಸ್" : "3. Google AdSense & Third-Party Cookies"}
          </h2>
          <p>
            {lang === "hi"
              ? "हम अपनी वेबसाइट पर विज्ञापन दिखाने के लिए Google AdSense का उपयोग करते हैं। Google तृतीय-पक्ष विक्रेता के रूप में हमारी साइट पर विज्ञापन दिखाने के लिए कुकीज़ का उपयोग करता है। Google द्वारा विज्ञापन कुकीज़ का उपयोग उसे और उसके भागीदारों को हमारे उपयोगकर्ताओं को हमारी साइट या इंटरनेट पर अन्य साइटों पर उनकी यात्रा के आधार पर विज्ञापन दिखाने में सक्षम बनाता है।"
              : lang === "kn"
                ? "ನಮ್ಮ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಜಾಹೀರಾತುಗಳನ್ನು ನೀಡಲು ನಾವು ಗೂಗಲ್ ಆಡ್ಸೆನ್ಸ್ ಅನ್ನು ಬಳಸುತ್ತೇವೆ. ಗೂಗಲ್ ಮೂರನೇ ವ್ಯಕ್ತಿಯಾಗಿ ನಮ್ಮ ಸೈಟ್‌ನಲ್ಲಿ ಕುಕೀಗಳನ್ನು ಬಳಸುತ್ತದೆ. ಇದರ ಸಹಾಯದಿಂದ ಬಳಕೆದಾರರ ಇಂಟರ್ನೆಟ್ ಚಟುವಟಿಕೆಗಳ ಆಧಾರದ ಮೇಲೆ ಸೂಕ್ತ ಜಾಹೀರಾತುಗಳನ್ನು ನೀಡಲಾಗುತ್ತದೆ."
                : "We use Google AdSense to serve advertisements on our website. Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site or other sites on the Internet."}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{lang === "hi" ? "Google विज्ञापन दिखाने के लिए DoubleClick DART कुकी का उपयोग करता है।" : lang === "kn" ? "ಜಾಹೀರಾತುಗಳನ್ನು ನೀಡಲು ಗೂಗಲ್ DoubleClick DART ಕುಕಿಯನ್ನು ಬಳಸುತ್ತದೆ." : "Google uses the DoubleClick DART cookie to serve ads."}</li>
            <li>
              {lang === "hi" ? "उपयोगकर्ता Google के विज्ञापन सेटिंग्स पर जाकर व्यक्तिगत विज्ञापनों से बाहर निकल सकते हैं।" : lang === "kn" ? "ಬಳಕೆದಾರರು ಗೂಗಲ್ ಜಾಹೀರಾತು ಸೆಟ್ಟಿಂಗ್‌ಗಳ ಮೂಲಕ ವೈಯಕ್ತೀಕರಿಸಿದ ಜಾಹೀರಾತುಗಳಿಂದ ಹೊರಗುಳಿಯಬಹುದು." : "Users may opt out of personalized advertising by visiting Google's"}{' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-500 underline hover:text-emerald-600">
                {lang === "hi" ? "विज्ञापन सेटिंग्स" : lang === "kn" ? "ಜಾಹೀರಾತು ಸೆಟ್ಟಿಂಗ್‌ಗಳು" : "Ads Settings"}
              </a>.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {lang === "hi" ? "4. हम आपकी जानकारी का उपयोग कैसे करते हैं" : lang === "kn" ? "4. ನಾವು ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಹೇಗೆ ಬಳಸುತ್ತೇವೆ" : "4. How We Use Your Information"}
          </h2>
          <p>
            {lang === "hi"
              ? "हम वैध व्यावसायिक हितों, आपके साथ अनुबंध की पूर्ति और कानूनी दायित्वों के अनुपालन के आधार पर आपकी जानकारी संसाधित करते हैं। इसमें शामिल हैं:"
              : lang === "kn"
                ? "ಸೇವೆಗಳನ್ನು ಒದಗಿಸಲು ಮತ್ತು ಕಾನೂನು ಬಾಧ್ಯತೆಗಳ ಅನುಸರಣೆಗಾಗಿ ನಾವು ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಬಳಸುತ್ತೇವೆ. ಇದರಲ್ಲಿ ಒಳಗೊಂಡಿದೆ:"
                : "We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, and compliance with our legal obligations. This includes:"}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{lang === "hi" ? "कृषि अंतर्दृष्टि (जैसे मिट्टी का आकलन, फसल भविष्यवाणी और मौसम की चेतावनी) प्रदान करना।" : lang === "kn" ? "ಕೃಷಿ ಒಳನೋಟಗಳನ್ನು ಒದಗಿಸುವುದು (ಮಣ್ಣು ಪರೀಕ್ಷೆ, ಬೆಳೆ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ)." : "Providing and delivering agricultural insights (such as soil assessments, crop predictions, and weather warnings)."}</li>
            <li>{lang === "hi" ? "फसल रोगों का निर्धारण करने और उपचार की सिफारिश करने के लिए फसल की पत्तियों की छवियों का विश्लेषण करना।" : lang === "kn" ? "ರೋಗ ಪತ್ತೆಗಾಗಿ ಎಲೆಗಳ ಚಿತ್ರಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುವುದು ಮತ್ತು ಪರಿಹಾರಗಳನ್ನು ಸೂಚಿಸುವುದು." : "Analyzing uploaded plant leaf images to determine crop diseases and recommend organic or chemical remedies."}</li>
            <li>{lang === "hi" ? "वर्कर कनेक्ट के माध्यम से स्थानीय किसानों और कृषि श्रमिकों के बीच संपर्क की सुविधा प्रदान करना।" : lang === "kn" ? "ವರ್ಕರ್ ಕನೆಕ್ಟ್ ಮೂಲಕ ರೈತರು ಮತ್ತು ಕೆಲಸಗಾರರ ನಡುವೆ ಸಂಪರ್ಕ ಕಲ್ಪಿಸುವುದು." : "Facilitating connections between local farmers and farm workers via Worker Connect."}</li>
            <li>{lang === "hi" ? "प्रासंगिक सरकारी योजनाओं की पात्रता प्रदर्शित करना।" : lang === "kn" ? "ಅರ್ಹ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ವಿವರಗಳನ್ನು ಪ್ರದರ್ಶಿಸುವುದು." : "Displaying relevant government schemes eligibility."}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            🛡️ {lang === "hi" ? "5. जीडीपीआर और सीसीपीए अनुपालन" : lang === "kn" ? "5. GDPR ಮತ್ತು CCPA ಅನುಸರಣೆ" : "5. GDPR & CCPA Compliance"}
          </h2>
          <p>
            {lang === "hi"
              ? "यदि आप यूरोपीय संघ (EU) या कैलिफोर्निया (USA) से KrishiAI का उपयोग कर रहे हैं, तो आपके पास विशिष्ट डेटा सुरक्षा अधिकार हैं। इन अधिकारों में शामिल हैं: आपके डेटा तक पहुंच प्राप्त करना, सुधार का अनुरोध करना, डेटा हटाना या सहमति वापस लेना।"
              : lang === "kn"
                ? "ನೀವು ಯುರೋಪಿಯನ್ ಯೂನಿಯನ್ (EU) ಅಥವಾ ಕ್ಯಾಲಿಫೋರ್ನಿಯಾದಿಂದ ಕೃಷಿAI ಬಳಸುತ್ತಿದ್ದರೆ, ನಿಗದಿತ ಡೇಟಾ ಹಕ್ಕುಗಳನ್ನು ನೀವು ಹೊಂದಿರುತ್ತೀರಿ: ಡೇಟಾವನ್ನು ವೀಕ್ಷಿಸುವುದು, ತಿದ್ದುಪಡಿ ಮಾಡುವುದು ಅಥವಾ ಅಳಿಸುವುದು."
                : "If you are accessing KrishiAI from the European Union (EU) or California (USA), you have specific data protection rights under the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA)."}
          </p>
          <p>
            {lang === "hi" ? "अधिकारों का प्रयोग करने के लिए कृपया adityaoutlier5@gmail.com पर हमसे संपर्क करें।" : lang === "kn" ? "ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ಚಲಾಯಿಸಲು adityaoutlier5@gmail.com ನಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ." : "To exercise any of these rights, please contact our administrator at adityaoutlier5@gmail.com."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            🔒 {lang === "hi" ? "6. डेटा सुरक्षा" : lang === "kn" ? "6. ಡೇಟಾ ಸುರಕ್ಷತೆ" : "6. Data Security"}
          </h2>
          <p>
            {lang === "hi"
              ? "हम अपनी सुरक्षा प्रणालियों को सुरक्षित रखने के लिए प्रतिबद्ध हैं। हालांकि, कोई भी इंटरनेट ट्रांसमिशन 100% सुरक्षित नहीं है। इसलिए, आप अपनी जोखिम पर डेटा संचारित करते हैं।"
              : lang === "kn"
                ? "ನಾವು ಗರಿಷ್ಠ ಡೇಟಾ ಸುರಕ್ಷತೆಯನ್ನು ಜಾರಿಗೆ ತರುತ್ತೇವೆ. ಆದರೆ ಇಂಟರ್ನೆಟ್ ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತವಲ್ಲದ ಕಾರಣ ನಿಮ್ಮ ಸ್ವಂತ ಜವಾಬ್ದಾರಿಯ ಮೇಲೆ ಡೇಟಾ ಕಳುಹಿಸಬೇಕು."
                : "We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. Transmission of data is at your own risk."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            📞 {lang === "hi" ? "7. हमसे संपर्क करें" : lang === "kn" ? "7. ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ" : "7. Contact Us"}
          </h2>
          <p>
            {lang === "hi" ? "यदि आपके पास इस नीति के बारे में कोई प्रश्न हैं, तो आप हमसे संपर्क कर सकते हैं:" : lang === "kn" ? "ಈ ನೀತಿಯ ಕುರಿತು ಪ್ರಶ್ನೆಗಳಿದ್ದರೆ ಇಲ್ಲಿ ಸಂಪರ್ಕಿಸಬಹುದು:" : "If you have questions or comments about this policy, you can contact us at:"}
          </p>
          <div className="rounded-xl border border-border/20 bg-muted/15 p-4 space-y-1 font-semibold text-foreground max-w-sm mt-2">
            <p>KrishiAI Development Team</p>
            <p className="font-mono text-xs text-muted-foreground">Email: adityaoutlier5@gmail.com</p>
            <p className="font-mono text-xs text-muted-foreground">URL: https://krishiaiindia.vercel.app</p>
          </div>
        </section>

      </div>
    </div>
  );
}
