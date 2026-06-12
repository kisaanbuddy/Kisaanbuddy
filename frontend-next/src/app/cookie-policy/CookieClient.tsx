'use client';

import Link from 'next/link';
import { Cookie, ArrowLeft, Shield, Eye, Settings } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function CookieClient() {
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
            <Cookie className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            {lang === "hi" ? "कुकी सहमति" : lang === "kn" ? "ಕುಕಿ ಸಮ್ಮತಿ" : "Cookie Consent"}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
          {lang === "hi" ? "कुकी नीति" : lang === "kn" ? "ಕುಕಿ ನೀತಿ" : "Cookie Policy"}
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
            {lang === "hi" ? "1. कुकीज़ क्या हैं?" : lang === "kn" ? "1. ಕುಕೀಸ್ ಎಂದರೇನು?" : "1. What Are Cookies?"}
          </h2>
          <p>
            {lang === "hi"
              ? "कुकीज़ छोटी टेक्स्ट फाइलें होती हैं जिन्हें आपके द्वारा देखी जाने वाली वेबसाइटों द्वारा आपके कंप्यूटर या मोबाइल डिवाइस पर रखा जाता है। वे वेबसाइटों को अधिक कुशलता से काम करने और साइट मालिकों को जानकारी प्रदान करने के लिए उपयोग की जाती हैं।"
              : lang === "kn"
                ? "ಕುಕೀಸ್ ಎನ್ನುವುದು ನೀವು ಭೇಟಿ ನೀಡುವ ವೆಬ್‌ಸೈಟ್‌ಗಳು ನಿಮ್ಮ ಕಂಪ್ಯೂಟರ್ ಅಥವಾ ಮೊಬೈಲ್ ಸಾಧನದಲ್ಲಿ ಇರಿಸುವ ಸಣ್ಣ ಪಠ್ಯ ಫೈಲ್‌ಗಳಾಗಿವೆ. ಇವು ವೆಬ್‌ಸೈಟ್ ಉತ್ತಮವಾಗಿ ರನ್ ಆಗಲು ಸಹಾಯ ಮಾಡುತ್ತವೆ."
                : "Cookies are small text files placed on your computer or mobile device by websites that you visit. They are widely used to make websites work more efficiently, improve your navigation experience, and provide information to the website owners."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Eye className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {lang === "hi" ? "2. KrishiAI कुकीज़ का उपयोग कैसे करता है" : lang === "kn" ? "2. KrishiAI ಕುಕೀಗಳನ್ನು ಹೇಗೆ ಬಳಸುತ್ತದೆ" : "2. How KrishiAI Uses Cookies"}
          </h2>
          <p>
            {lang === "hi"
              ? "हम विभिन्न परिचालन कार्यों का समर्थन करने के लिए अपने प्लेटफ़ॉर्म पर प्रथम-पक्ष और तृतीय-पक्ष कुकीज़ दोनों का उपयोग करते हैं:"
              : lang === "kn"
                ? "ವಿವಿಧ ಆಪರೇಷನಲ್ ಕಾರ್ಯಗಳನ್ನು ಬೆಂಬಲಿಸಲು ನಾವು ನಮ್ಮ ವೇದಿಕೆಯಲ್ಲಿ ಕುಕೀಗಳನ್ನು ಬಳಸುತ್ತೇವೆ:"
                : "We use both first-party and third-party cookies on our platform to support different operational functions. The cookies we utilize fall under the following categories:"}
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">{lang === "hi" ? "आवश्यक कुकीज़:" : lang === "kn" ? "ಅಗತ್ಯ ಕುಕೀಸ್:" : "Essential Cookies:"}</strong>{' '}
              {lang === "hi" ? "ये कुकीज़ उपयोगकर्ता सत्रों को अधिकृत करने और आपको लॉग इन रखने के लिए महत्वपूर्ण हैं। इनके बिना खेत डायरी जैसी सुविधाएं प्रदान नहीं की जा सकतीं।" : lang === "kn" ? "ಬಳಕೆದಾರರ ಸೆಷನ್‌ಗಳನ್ನು ದೃಢೀಕರಿಸಲು ಮತ್ತು ನಿಮ್ಮನ್ನು ಲಾಗಿನ್ ಆಗಿರಿಸಲು ಇವು ಮುಖ್ಯವಾಗಿವೆ. ಇವಿಲ್ಲದೆ ಹೊಲ ಡೈರಿಯಂತಹ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ." : "These cookies are critical to authorize user sessions and keep you logged into your account. Without these cookies, features like Khet Diary logs or custom profile tracking cannot be provided."}
            </li>
            <li>
              <strong className="text-foreground">{lang === "hi" ? "पसंद कुकीज़:" : lang === "kn" ? "ಆದ್ಯತೆಯ ಕುಕೀಸ್:" : "Preference Cookies:"}</strong>{' '}
              {lang === "hi" ? "ये कुकीज़ हमें आपके द्वारा लिए गए निर्णयों को याद रखने की अनुमति देती हैं, जैसे कि आपकी चयनित अनुवाद भाषा (krishiai_lang)।" : lang === "kn" ? "ನಿಮ್ಮ ಭಾಷೆಯ ಆಯ್ಕೆಯನ್ನು ನೆನಪಿಟ್ಟುಕೊಳ್ಳಲು ಇವು ಸಹಾಯ ಮಾಡುತ್ತವೆ (krishiai_lang)." : "These cookies allow us to remember decisions you make, such as your selected translation language (krishiai_lang). This prevents you from having to select your language script on every page refresh."}
            </li>
            <li>
              <strong className="text-foreground">{lang === "hi" ? "विश्लेषण कुकीज़:" : lang === "kn" ? "ವಿಶ್ಲೇಷಣಾ ಕುಕೀಸ್:" : "Analytics Cookies:"}</strong>{' '}
              {lang === "hi" ? "हम साइट लोड होने की विलंबता और पृष्ठ विज़िट की निगरानी करने और सर्वर प्रतिक्रिया समय को अनुकूलित करने के लिए Vercel Analytics जैसे उपकरण चलाते हैं।" : lang === "kn" ? "ವೆಬ್‌ಸೈಟ್‌ನ ಕಾರ್ಯಕ್ಷಮತೆ ಮತ್ತು ವೀಕ್ಷಣೆಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ನಾವು Vercel Analytics ನಂತಹ ಟೂಲ್‌ಗಳನ್ನು ಬಳಸುತ್ತೇವೆ." : "We run telemetry scripts (e.g. Vercel Analytics) that deploy anonymous cookie structures. These monitor site loading latency, page visits, and click rates to help us optimize backend server response times."}
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            🎯 {lang === "hi" ? "3. गूगल एडसेंस कुकीज़" : lang === "kn" ? "3. ಗೂಗಲ್ ಆಡ್ಸೆನ್ಸ್ ಕುಕೀಸ್" : "3. Google AdSense Cookies"}
          </h2>
          <p>
            {lang === "hi"
              ? "Google AdSense सहित तृतीय-पक्ष विक्रेता, KrishiAI या अन्य पोर्टलों पर आपकी पिछली यात्राओं के आधार पर विज्ञापन दिखाने के लिए कुकीज़ का उपयोग करते हैं।"
              : lang === "kn"
                ? "ಗೂಗಲ್ ಆಡ್ಸೆನ್ಸ್ ಸೇರಿದಂತೆ ಮೂರನೇ ವ್ಯಕ್ತಿಗಳು ನಮ್ಮ ವೇದಿಕೆಯಲ್ಲಿ ಜಾಹೀರಾತುಗಳನ್ನು ಪ್ರದರ್ಶಿಸಲು ಕುಕೀಗಳನ್ನು ಬಳಸುತ್ತಾರೆ."
                : "Third-party vendors, including Google AdSense, use cookies to serve advertisements based on your prior visits to KrishiAI or other web portals."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {lang === "hi" ? "4. कुकी प्राथमिकताओं का प्रबंधन" : lang === "kn" ? "4. ಕುಕಿ ಆದ್ಯತೆಗಳ ನಿರ್ವಹಣೆ" : "4. Managing Your Cookie Preferences"}
          </h2>
          <p>
            {lang === "hi"
              ? "आपके पास कुकीज़ को स्वीकार या अस्वीकार करने का अधिकार है। आप मौजूदा कुकीज़ को साफ़ करने या नई कुकीज़ को ब्लॉक करने के लिए अपने ब्राउज़र सेटिंग्स को संशोधित कर सकते हैं।"
              : lang === "kn"
                ? "ಕುಕೀಗಳನ್ನು ಸ್ವೀಕರಿಸಲು ಅಥವಾ ತಿರಸ್ಕರಿಸಲು ನಿಮಗೆ ಹಕ್ಕಿದೆ. ನೀವು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳ ಮೂಲಕ ಕುಕೀಗಳನ್ನು ನಿರ್ಬಂಧಿಸಬಹುದು."
                : "You have the right to decide whether to accept or reject cookies. You can modify your browser settings to clear existing cookies or block new cookies altogether."}
          </p>
          <p>
            {lang === "hi" ? "व्यक्तिगत विज्ञापनों से बाहर निकलने के लिए Google विज्ञापन सेटिंग्स पर जाएँ।" : lang === "kn" ? "ವೈಯಕ್ತೀಕರಿಸಿದ ಜಾಹೀರಾತುಗಳಿಂದ ಹೊರಗುಳಿಯಲು ಗೂಗಲ್ ಜಾಹೀರಾತು ಸೆಟ್ಟಿಂಗ್‌ಗಳಿಗೆ ಭೇಟಿ ನೀಡಿ." : "To opt out of Google's personalized advertising cookies, navigate to Google's Ads Settings."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            ✉️ {lang === "hi" ? "5. अधिक जानकारी" : lang === "kn" ? "5. ಹೆಚ್ಚಿನ ಮಾಹಿತಿ" : "5. More Information"}
          </h2>
          <p>
            {lang === "hi"
              ? "हमारी कुकी नीति के बारे में किसी भी अन्य प्रश्न के लिए, कृपया हमें adityaoutlier5@gmail.com पर मेल करें।"
              : lang === "kn"
                ? "ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ಇಮೇಲ್ ಕಳುहಿಸಿ: adityaoutlier5@gmail.com."
                : "For any further questions regarding our cookie disclosures, please send us a mail at adityaoutlier5@gmail.com."}
          </p>
        </section>

      </div>
    </div>
  );
}
