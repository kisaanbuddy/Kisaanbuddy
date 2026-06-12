'use client';

import Link from 'next/link';
import { Scale, ArrowLeft, Shield, AlertTriangle, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function TermsClient() {
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
            <Scale className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            {lang === "hi" ? "उपयोग की शर्तें" : lang === "kn" ? "ಬಳಕೆಯ ನಿಯಮಗಳು" : "Terms of Use"}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
          {lang === "hi" ? "नियम और शर्तें" : lang === "kn" ? "ನಿಯಮಗಳು ಮತ್ತು ನಿಬಂಧನೆಗಳು" : "Terms & Conditions"}
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
            {lang === "hi" ? "1. शर्तों की स्वीकृति" : lang === "kn" ? "1. ನಿಯಮಗಳ ಒಪ್ಪಿಗೆ" : "1. Agreement to Terms"}
          </h2>
          <p>
            {lang === "hi"
              ? "KrishiAI तक पहुँचने या उपयोग करके, आप इन नियमों और शर्तों से बाध्य होने के लिए सहमत होते हैं। यदि आप इन सभी शर्तों से सहमत नहीं हैं, तो आपको प्लेटफ़ॉर्म का उपयोग करने से प्रतिबंधित किया जाता है और तुरंत उपयोग बंद कर देना चाहिए।"
              : lang === "kn"
                ? "KrishiAI ಬಳಸುವ ಮೂಲಕ, ನೀವು ಈ ನಿಯಮಗಳು ಮತ್ತು ನಿಬಂಧನೆಗಳಿಗೆ ಬದ್ಧರಾಗಿರಲು ಒಪ್ಪುತ್ತೀರಿ. ನಿಯಮಗಳಿಗೆ ಒಪ್ಪದಿದ್ದರೆ ಈ ವೇದಿಕೆಯನ್ನು ಬಳಸಲು ನಿಮಗೆ ಅನುಮತಿ ಇರುವುದಿಲ್ಲ."
                : "By accessing or using KrishiAI, you agree to be bound by these Terms & Conditions. If you do not agree with all of these terms, you are expressly prohibited from using the platform and must discontinue use immediately."}
          </p>
          <p>
            {lang === "hi"
              ? "ये शर्तें उन सभी आगंतुकों, पंजीकृत किसानों, शोधकर्ताओं और श्रमिकों पर लागू होती हैं जो प्लेटफ़ॉर्म का उपयोग करते हैं।"
              : lang === "kn"
                ? "ಈ ನಿಯಮಗಳು ನಮ್ಮ ವೇದಿಕೆಯನ್ನು ಬಳಸುವ ರೈತರು, ಕೆಲಸಗಾರರು ಮತ್ತು ಎಲ್ಲಾ ಬಳಕೆದಾರರಿಗೆ ಅನ್ವಯಿಸುತ್ತವೆ."
                : "These Terms apply to all visitors, registered farmers, researchers, workers, and others who access or use the platform."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {lang === "hi" ? "2. एआई कृषि अनुशंसा अस्वीकरण" : lang === "kn" ? "2. AI ಕೃಷಿ ಸಲಹೆ ಹಕ್ಕುತ್ಯಾಗ" : "2. AI Agricultural Predictions Disclaimer"}
          </h2>
          <p>
            {lang === "hi"
              ? "KrishiAI फसल अनुशंसा मॉडल, फसल रोग निदान, मौसम पूर्वानुमान और एपीएमसी मंडी मूल्य सलाह प्रदान करता है।"
              : lang === "kn"
                ? "KrishiAI ಬೆಳೆ ಶಿಫಾರಸು ಮಾದರಿಗಳು, ರೋಗ ಪತ್ತೆಹಚ್ಚುವಿಕೆ, ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಮಂಡಿ ದರಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ."
                : "KrishiAI provides crop recommendation models, plant disease diagnostics via leaf image uploads, weather forecasts, and APMC mandi price advisories."}
          </p>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs font-medium text-amber-600 dark:text-amber-400">
            <strong>{lang === "hi" ? "महत्वपूर्ण सलाह:" : lang === "kn" ? "ಪ್ರಮುಖ ಸಲಹೆ:" : "CRITICAL ADVISORY:"}</strong>{' '}
            {lang === "hi"
              ? "KrishiAI द्वारा उत्पन्न सभी सुझाव कृत्रिम बुद्धिमत्ता मॉडल द्वारा संचालित हैं। वे गणितीय संभावनाओं का प्रतिनिधित्व करते हैं, न कि किसी प्रमाणित कृषि विशेषज्ञ की गारंटी। किसानों को कोई भी कृषि निर्णय लेने से पहले स्थानीय कृषि अधिकारियों से सलाह लेनी चाहिए।"
              : lang === "kn"
                ? "ಕೃಷಿAI ನೀಡುವ ಎಲ್ಲಾ ಸಲಹೆಗಳು ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮಾದರಿಗಳಿಂದ ರನ್ ಆಗುತ್ತವೆ. ಇವು ಗಣಿತದ ಸಂಭವನೀಯತೆಗಳಾಗಿದ್ದು, ತಜ್ಞರ ಗ್ಯಾರಂಟಿ ಅಲ್ಲ. ಹೊಲದಲ್ಲಿ ಯಾವುದೇ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳುವ ಮುನ್ನ ಕೃಷಿ ಅಧಿಕಾರಿಗಳ ಸಲಹೆ ಪಡೆಯಿರಿ."
                : "All suggestions, recommendations, and diagnostic opinions produced by KrishiAI are powered by artificial intelligence models. They represent mathematical probabilities, NOT certified agricultural expert, agronomist, or chemical engineer guarantees. Farmers must verify all pesticide dosages, fertilizer ratios, and crop schedules with local agricultural extension officers or certified specialists before taking on-field action."}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            👤 {lang === "hi" ? "3. उपयोगकर्ता खाते और पंजीकरण" : lang === "kn" ? "3. ಬಳಕೆದಾರರ ಖಾತೆಗಳು ಮತ್ತು ನೋಂದಣಿ" : "3. User Accounts & Registration"}
          </h2>
          <p>
            {lang === "hi"
              ? "कुछ सुविधाओं (जैसे खेत डायरी या वर्कर कनेक्ट) को अनलॉक करने के लिए, आपको एक उपयोगकर्ता प्रोफ़ाइल बनानी होगी। आप सटीक जानकारी प्रदान करने और क्रेडेंशियल की गोपनीयता बनाए रखने के लिए सहमत हैं।"
              : lang === "kn"
                ? "ಹೊಲ ಡೈರಿ ಅಥವಾ ಕೆಲಸಗಾರರ ಸಂಪರ್ಕದಂತಹ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಬಳಸಲು ನೀವು ಖಾತೆಯನ್ನು ತೆರೆಯಬೇಕು. ನಿಖರ ಮಾಹಿತಿ ನೀಡಲು ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಗೌಪ್ಯವಾಗಿಡಲು ನೀವು ಒಪ್ಪುತ್ತೀರಿ."
                : "To unlock certain features (like saving entries to the Khet Diary or posting jobs to Worker Connect), you must create a user profile. You agree to provide accurate details and maintain password confidentiality."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            ⚠️ {lang === "hi" ? "4. दायित्व की सीमा" : lang === "kn" ? "4. ಹೊಣೆಗಾರಿಕೆಯ ಮಿತಿ" : "4. Limitation of Liability"}
          </h2>
          <p>
            {lang === "hi"
              ? "किसी भी स्थिति में KrishiAI या उसके सह-संस्थापक फसल की पैदावार में कमी, वित्तीय नुकसान या गलत रासायनिक अनुप्रयोगों से उत्पन्न होने वाले किसी भी नुकसान के लिए उत्तरदायी नहीं होंगे।"
              : lang === "kn"
                ? "ಬೆಳೆ ಇಳುವರಿ ನಷ್ಟ, ಮಾರುಕಟ್ಟೆ ನಷ್ಟ ಅಥವಾ ತಪ್ಪು ಗೊಬ್ಬರ ಬಳಕೆಯಿಂದ ಉಂಟಾಗುವ ಯಾವುದೇ ಹಾನಿಗಳಿಗೆ KrishiAI ಅಥವಾ ಅದರ ಸಂಸ್ಥಾಪಕರು ಹೊಣೆಗಾರರಾಗಿರುವುದಿಲ್ಲ."
                : "In no event shall KrishiAI, its co-founders, or partners be liable for any damages, including without limitation, loss of crop yield, financial loss from mandi trading, or incorrect chemical applications."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            📂 {lang === "hi" ? "5. बौद्धिक संपदा" : lang === "kn" ? "5. ಬೌದ್ಧಿಕ ಆಸ್ತಿ" : "5. Intellectual Property"}
          </h2>
          <p>
            {lang === "hi"
              ? "KrishiAI ब्रांड, लोगो, स्रोत कोड और डिज़ाइन KrishiAI और उसके सह-संस्थापकों की विशेष संपत्ति हैं। लिखित सहमति के बिना इन्हें कॉपी या पुनरुत्पादित नहीं किया जा सकता।"
              : lang === "kn"
                ? "ಕೃಷಿAI ಬ್ರ್ಯಾಂಡ್, ಲೋಗೋಗಳು, ಕೋಡ್ ಮತ್ತು ವಿನ್ಯಾಸಗಳು KrishiAI ಮತ್ತು ಅದರ ಸಂಸ್ಥಾಪಕರ ಆಸ್ತಿಯಾಗಿದೆ. ಲಿಖಿತ ಒಪ್ಪಿಗೆಯಿಲ್ಲದೆ ಇವುಗಳನ್ನು ನಕಲಿಸಲು ಅನುಮತಿಯಿಲ್ಲ."
                : "The KrishiAI brand, logos, source code, designs, and AI training weights are the exclusive property of KrishiAI and its co-founders. You may not copy or reproduce any elements without prior written consent."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {lang === "hi" ? "6. लागू कानून" : lang === "kn" ? "6. ನಿಯಂತ್ರಕ ಕಾನೂನು" : "6. Governing Law"}
          </h2>
          <p>
            {lang === "hi"
              ? "ये शर्तें भारत के कानूनों के अनुसार शासित होंगी। किसी भी विवाद का निपटारा बिहार या महाराष्ट्र की अदालतों में किया जाएगा।"
              : lang === "kn"
                ? "ಈ ನಿಯಮಗಳು ಭಾರತದ ಕಾನೂನುಗಳಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ. ಯಾವುದೇ ವಿವಾದಗಳನ್ನು ಬಿಹಾರ್ ಅಥವಾ ಮಹಾರಾಷ್ಟ್ರದ ನ್ಯಾಯಾಲಯಗಳಲ್ಲಿ ಇತ್ಯರ್ಥಪಡಿಸಲಾಗುತ್ತದೆ."
                : "These Terms shall be governed by and construed in accordance with the laws of India. Any legal action or dispute shall be resolved in the competent courts of Bihar or Maharashtra, India."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            🔧 {lang === "hi" ? "7. शर्तों में बदलाव" : lang === "kn" ? "7. ನಿಯಮಗಳಲ್ಲಿ ಬದಲಾವಣೆಗಳು" : "7. Changes to Terms"}
          </h2>
          <p>
            {lang === "hi"
              ? "हम किसी भी समय इन शर्तों को बदलने का अधिकार सुरक्षित रखते हैं। संशोधनों की जानकारी इसी पृष्ठ पर दी जाएगी।"
              : lang === "kn"
                ? "ಯಾವಾಗ ಬೇಕಾದರೂ ಈ ನಿಯಮಗಳನ್ನು ಬದಲಾಯಿಸುವ ಹಕ್ಕನ್ನು ನಾವು ಹೊಂದಿದ್ದೇವೆ. ಬದಲಾವಣೆಗಳನ್ನು ಇದೇ ಪುಟದಲ್ಲಿ ತಿಳಿಸಲಾಗುತ್ತದೆ."
                : "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will post notification details of any revisions on this page."}
          </p>
        </section>

      </div>
    </div>
  );
}
