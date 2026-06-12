'use client';

import Link from 'next/link';
import { Sprout, Sparkles, Brain, CloudSun, TrendingUp, Users, Mail, ArrowRight, Shield, Bug, Landmark, BookOpen, FlaskConical, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language';

type Founder = {
  name: string;
  role: string;
  email: string;
  bio: string;
  initials: string;
  gradient: string;
};

export function AboutClient() {
  const { t, lang } = useLanguage();

  const founders: Founder[] = [
    {
      name: "Aditya Ishwar",
      role: lang === "hi" 
        ? "संस्थापक, मुख्य कार्यकारी अधिकारी (CEO) और मुख्य वास्तुकार" 
        : lang === "kn" 
          ? "ಸಂಸ್ಥಾಪಕ, ಮುಖ್ಯ ಕಾರ್ಯನಿರ್ವಾಹಕ ಅಧಿಕಾರಿ (CEO) ಮತ್ತು ಮುಖ್ಯ ವಾಸ್ತುಶಿಲ್ಪಿ" 
          : "Founder, CEO & Chief Architect",
      email: "adityaoutlier5@gmail.com",
      bio: lang === "hi" 
        ? "कृषिAI की तकनीकी दृष्टि — फुल-स्टैक आर्किटेक्चर, AI एकीकरण और उत्पादन परिनियोजन को संचालित करते हैं। उनका मानना है कि तकनीक हर किसान की जेब तक पहुंचनी चाहिए।" 
        : lang === "kn" 
          ? "ಕೃಷಿAI ನ ತಾಂತ್ರಿಕ ದೃಷ್ಟಿಕೋನ — ಫುಲ್-ಸ್ಟ್ಯಾಕ್ ಆರ್ಕಿಟೆಕ್ಚರ್, AI ಸಂಯೋಜನೆಗಳು ಮತ್ತು ಉತ್ಪಾದನೆ ನಿಯೋಜನೆಯನ್ನು ನಡೆಸುತ್ತಾರೆ. ತಂತ್ರಜ್ಞಾನವು ಪ್ರತಿ ರೈತನ ಜೇಬಿಗೆ ತಲುಪಬೇಕು ಎಂದು ನಂಬುತ್ತಾರೆ." 
          : "Drives the technical vision of KrishiAI — full-stack architecture, AI integrations, and production deployment. Believes technology should reach every farmer's pocket.",
      initials: "AI",
      gradient: "from-emerald-400 to-green-600",
    },
    {
      name: "Utkarsh Sinha",
      role: lang === "hi" 
        ? "सह-संस्थापक और प्रबंध निदेशक" 
        : lang === "kn" 
          ? "ಸಹ-ಸಂಸ್ಥಾಪಕ ಮತ್ತು ವ್ಯವಸ್ಥಾಪಕ ನಿರ್ದೇಶಕ" 
          : "Co-Founder & Managing Director",
      email: "utkarsh.sinha.dev@gmail.com",
      bio: lang === "hi" 
        ? "मशीन लर्निंग पाइपलाइन — फसल अनुशंसा मॉडल, बीमारी का सटीक पता लगाना, और क्यूरेटेड कृषि विज्ञान ज्ञान का प्रबंधन करते हैं। कच्चे कृषि डेटा को व्यावहारिक अंतर्दृष्टि में बदलते हैं।" 
        : lang === "kn" 
          ? "ಯಂತ್ರ ಕಲಿಕೆ ಪೈಪ್‌ಲೈನ್ — ಬೆಳೆ ಶಿಫಾರಸು ಮಾದರಿಗಳು, ರೋಗ ಪತ್ತೆ ನಿಖರತೆ ಮತ್ತು ಕೃಷಿ ಜ್ಞಾನದ ನಿರ್ವಹಣೆ ಮಾಡುತ್ತಾರೆ. ಕೃಷಿ ಡೇಟಾವನ್ನು ಉಪಯುಕ್ತ ಒಳನೋಟಗಳಾಗಿ ಪರಿವರ್ತಿಸುತ್ತಾರೆ." 
          : "Owns the ML pipeline — crop recommendation models, disease detection accuracy, and the curated agronomy knowledge base. Turns raw farm data into actionable insights.",
      initials: "US",
      gradient: "from-blue-400 to-indigo-600",
    },
    {
      name: "Sanidhya Sharma",
      role: lang === "hi" 
        ? "सह-संस्थापक और मुख्य प्रौद्योगिकी अधिकारी (CTO)" 
        : lang === "kn" 
          ? "ಸಹ-ಸಂಸ್ಥಾಪಕ ಮತ್ತು ಮುಖ್ಯ ತಂತ್ರಜ್ಞಾನ ಅಧಿಕಾರಿ (CTO)" 
          : "Co-Founder & CTO",
      email: "sanidhyasharma.dev@gmail.com",
      bio: lang === "hi" 
        ? "कृषिAI के तकनीकी रोडमैप, क्लाउड इंफ्रास्ट्रक्चर और बड़े पैमाने के सिस्टम आर्किटेक्चर का संचालन करते हैं। लाखों किसानों के लिए अत्यधिक स्केलेबल माइक्रोसर्विसेज और मजबूत, वास्तविक समय इंजनों के निर्माण में विशेषज्ञता रखते हैं।" 
        : lang === "kn" 
          ? "ಕೃಷಿAI ನ ತಾಂತ್ರಿಕ ರೋಡ್‌ಮ್ಯಾಪ್, ಕ್ಲೌಡ್ ಮೂಲಸೌಕರ್ಯ ಮತ್ತು ಸಿಸ್ಟಮ್ ಆರ್ಕಿಟೆಕ್ಚರ್ ಅನ್ನು ಮುನ್ನಡೆಸುತ್ತಾರೆ. ಲಕ್ಷಾಂತರ ರೈತರಿಗಾಗಿ ಸ್ಕೇಲೆಬಲ್ ಮೈಕ್ರೋಸರ್ವಿಸ್ ಮತ್ತು ನೈಜ-ಸಮಯದ ಎಂಜಿನ್‌ಗಳ ನಿರ್ಮಾಣದಲ್ಲಿ ಪರಿಣತಿ ಹೊಂದಿದ್ದಾರೆ." 
          : "Steers KrishiAI's technical roadmap, cloud infrastructure, and large-scale system architecture. Specializes in building highly scalable microservices and robust, real-time engines for millions of Kisans.",
      initials: "SS",
      gradient: "from-purple-400 to-fuchsia-600",
    },
    {
      name: "Yash Singh",
      role: lang === "hi" 
        ? "सह-संस्थापक और मुख्य विपणन अधिकारी (CMO)" 
        : lang === "kn" 
          ? "ಸಹ-ಸಂಸ್ಥಾಪಕ ಮತ್ತು ಮುಖ್ಯ ಮಾರುಕಟ್ಟೆ ಅಧಿಕಾರಿ (CMO)" 
          : "Co-Founder & CMO",
      email: "yashkumaryashsingh384@gmail.com",
      bio: lang === "hi" 
        ? "सह-संस्थापक और मुख्य विपणन अधिकारी। ब्रांड विकास, रणनीतिक पहुंच और सामुदायिक विपणन अभियानों का संचालन करते हैं। भारत के ग्रामीण इलाकों में स्मार्ट कृषि तकनीक लाने के लिए उत्सुक हैं।" 
        : lang === "kn" 
          ? "ಸಹ-ಸಂಸ್ಥಾಪಕ ಮತ್ತು ಮುಖ್ಯ ಮಾರುಕಟ್ಟೆ ಅಧಿಕಾರಿ. ಬ್ರ್ಯಾಂಡ್ ಬೆಳವಣಿಗೆ, ಕಾರ್ಯತಂತ್ರದ ಪ್ರಭಾವ ಮತ್ತು ಸಮುದಾಯ ಮಾರುಕಟ್ಟೆ ಪ್ರಚಾರಗಳನ್ನು ನಡೆಸುತ್ತಾರೆ. ಭಾರತದ ಗ್ರಾಮೀಣ ಪ್ರದೇಶಗಳಿಗೆ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ತಂತ್ರಜ್ಞಾನವನ್ನು ತರಲು ಉತ್ಸುಕರಾಗಿದ್ದಾರೆ." 
          : "Co-Founder and Chief Marketing Officer. Drives brand growth, strategic outreach, and community-led marketing campaigns. Passionate about bringing smart agricultural tech directly to India's rural heartlands.",
      initials: "YS",
      gradient: "from-rose-400 to-pink-600",
    },
  ];

  return (
    <div className="-mt-8 -mx-4 md:-mx-8 flex flex-col relative pb-12 overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[10%] w-[250px] h-[250px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden px-6 md:px-12 py-16 md:py-24 border-b border-border/20 bg-card/25 backdrop-blur-md">
        <div className="mx-auto max-w-5xl text-center md:text-left">
          <div className="flex justify-center md:justify-start items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {t("aboutUs")}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-foreground leading-tight">
            {lang === "hi" ? "कृषिAI के साथ कृषि को" : lang === "kn" ? "ಕೃಷಿAI ನೊಂದಿಗೆ ಕೃಷಿಯನ್ನು" : "Empowering Agriculture with"}{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 bg-clip-text text-transparent">
              {lang === "hi" ? "सशक्त बनाना" : lang === "kn" ? "ಸಬಲೀಕರಣಗೊಳಿಸುವುದು" : "KrishiAI"}
            </span>
          </h1>
          <p className="mt-4 max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
            {lang === "hi"
              ? "कृषिAI भारतीय किसानों के लिए तैयार एक AI-संचालित स्मार्ट कृषि पारिस्थितिकी तंत्र है। हम दक्षता को दोगुना करने, फसल रोग जोखिम को कम करने और फसल की पैदावार को अनुकूलित करने के लिए उन्नत मशीन लर्निंग एल्गोरिदम और जमीनी स्तर की खेती की तकनीकों के बीच अंतर को पाटते हैं।"
              : lang === "kn"
                ? "ಕೃಷಿAI ಎನ್ನುವುದು ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ AI-ಚಾಲಿತ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಪರಿಸರ ವ್ಯವಸ್ಥೆಯಾಗಿದೆ. ನಾವು ಕಾರ್ಯಕ್ಷಮತೆಯನ್ನು ದ್ವಿಗುಣಗೊಳಿಸಲು, ಬೆಳೆ ರೋಗದ ಅಪಾಯವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಮತ್ತು ಬೆಳೆ ಇಳುವರಿಯನ್ನು ಉತ್ತಮಗೊಳಿಸಲು ಸುಧಾರಿತ ಯಂತ್ರ ಕಲಿಕೆ ಅಲ್ಗಾರಿದಮ್‌ಗಳು ಮತ್ತು ತಳಮಟ್ಟದ ಕೃಷಿ ತಂತ್ರಜ್ಞಾನಗಳ ನಡುವಿನ ಅಂತರವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತೇವೆ."
                : "KrishiAI is an AI-powered smart agriculture ecosystem tailored for Indian farmers. We bridge the gap between advanced machine learning algorithms and ground-level farming techniques to double efficiency, mitigate crop disease risk, and optimize crop yields."}
          </p>
        </div>
      </section>

      {/* PLATFORM MISSION, VISION, VALUES */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-border/30 bg-card/45 backdrop-blur-sm p-6 flex flex-col gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground font-display">{lang === "hi" ? "हमारा मिशन" : lang === "kn" ? "ನಮ್ಮ ಉದ್ದೇಶ" : "Our Mission"}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "hi"
                ? "भारत भर के प्रत्येक किसान के हाथों में सीधे सुलभ, स्थानीय-भाषा एआई समाधान प्रदान करना, जिससे उन्हें फसल स्वास्थ्य और कृषि लाभप्रदता में सुधार करने के लिए वैज्ञानिक निर्णय लेने में मदद मिल सके।"
                : lang === "kn"
                  ? "ಭಾರತದಾದ್ಯಂತ ಪ್ರತಿ ರೈತರ ಕೈಗೆ ನೇರವಾಗಿ ಸುಲಭವಾದ, ಸ್ಥಳೀಯ-ಭಾಷೆಯ AI ಪರಿಹಾರಗಳನ್ನು ತಲುಪಿಸುವುದು, ಬೆಳೆ ಆರೋಗ್ಯ ಮತ್ತು ಕೃಷಿ ಲಾಭದಾಯಕತೆಯನ್ನು ಸುಧಾರಿಸಲು ವೈಜ್ಞಾನಿಕ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುವುದು."
                  : "To deliver accessible, local-language AI solutions directly into the hands of every farmer across India, helping them make scientific decisions to improve crop health and farm profitability."}
            </p>
          </div>

          <div className="rounded-2xl border border-border/30 bg-card/45 backdrop-blur-sm p-6 flex flex-col gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-500">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground font-display">{lang === "hi" ? "हमारा दृष्टिकोण" : lang === "kn" ? "ನಮ್ಮ ದೃಷ್ಟಿಕೋನ" : "Our Vision"}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "hi"
                ? "ग्रामीण भारत में एक स्मार्ट, टिकाऊ कृषि पारिस्थितिकी तंत्र का निर्माण करना जहां वास्तविक समय मशीन लर्निंग पूर्वानुमान फसल के नुकसान को कम करते हैं और किसानों के लिए उचित बाजार मूल्य सुरक्षित करते हैं।"
                : lang === "kn"
                  ? "ಗ್ರಾಮೀಣ ಭಾರತದಲ್ಲಿ ಸ್ಮಾರ್ಟ್, ಸುಸ್ಥಿರ ಕೃಷಿ ಪರಿಸರ ವ್ಯವಸ್ಥೆಯನ್ನು ನಿರ್ಮಿಸುವುದು, ಅಲ್ಲಿ ನೈಜ-ಸಮಯದ ಯಂತ್ರ ಕಲಿಕೆ ಮುನ್ಸೂಚನೆಗಳು ಬೆಳೆ ನಷ್ಟವನ್ನು ಕಡಿಮೆಗೊಳಿಸುತ್ತವೆ ಮತ್ತು ರೈತರಿಗೆ ನ್ಯಾಯಯುತ ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯವನ್ನು ಖಚಿತಪಡಿಸುತ್ತವೆ."
                  : "To build a smart, sustainable agricultural ecosystem in rural India where real-time machine learning predictions minimize crop losses and secure fair market value for Kisans."}
            </p>
          </div>

          <div className="rounded-2xl border border-border/30 bg-card/45 backdrop-blur-sm p-6 flex flex-col gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground font-display">{lang === "hi" ? "हमारे मूल्य" : lang === "kn" ? "ನಮ್ಮ ಮೌಲ್ಯಗಳು" : "Our Values"}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "hi"
                ? "किसान पहले। हम न्यूनतम तकनीकी बाधाओं के साथ सीधे, व्यावहारिक अंतर्दृष्टि प्रदान करने के लिए आवाज समर्थन और स्थानीय भाषा इंटरफेस के साथ सभी सुविधाओं को डिजाइन करते हैं।"
                : lang === "kn"
                  ? "ಮೊದಲು ರೈತರು. ಕನಿಷ್ಠ ತಾಂತ್ರಿಕ ಅಡೆತಡೆಗಳೊಂದಿಗೆ ನೇರವಾದ, ಉಪಯುಕ್ತ ಒಳನೋಟಗಳನ್ನು ಒದಗಿಸಲು ನಾವು ಧ್ವನಿ ಬೆಂಬಲ ಮತ್ತು ಸ್ಥಳೀಯ ಭಾಷೆಯ ಇಂಟರ್ಫೇಸ್‌ಗಳೊಂದಿಗೆ ಎಲ್ಲಾ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ವಿನ್ಯಾಸಗೊಳಿಸುತ್ತೇವೆ."
                  : "Farmers first. We design all features with voice support and local language interfaces to provide straightforward, actionable insights with minimal technological barriers."}
            </p>
          </div>
        </div>
      </section>

      {/* CORE FEATURES LIST */}
      <section className="px-6 md:px-12 py-16 bg-muted/10 border-y border-border/20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">{lang === "hi" ? "उन्नत कृषि विशेषताएं" : lang === "kn" ? "ಸುಧಾರಿತ ಕೃಷಿ ವೈಶಿಷ್ಟ್ಯಗಳು" : "Advanced Agricultural Features"}</h2>
            <p className="text-xs text-muted-foreground mt-2">{lang === "hi" ? "कृषिAI को स्मार्ट खेती के लिए अंतिम एआई सहायक क्या बनाता है" : lang === "kn" ? "ಕೃಷಿAI ಅನ್ನು ಸ್ಮಾರ್ಟ್ ಕೃಷಿಗಾಗಿ ಅಂತಿಮ AI ಸಹಾಯಕನನ್ನಾಗಿ ಮಾಡುವುದು ಯಾವುದು" : "What makes KrishiAI the ultimate AI assistant for smart farming"}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                icon: Bug, 
                title: lang === "hi" ? "फसल बीमारी AI" : lang === "kn" ? "ಬೆಳೆ ರೋಗ AI" : "Crop Disease AI", 
                desc: lang === "hi" 
                  ? "फसल के पत्तों की बीमारियों का तुरंत निदान करें और जैविक और रासायनिक उपचार प्राप्त करें।" 
                  : lang === "kn" 
                    ? "ಬೆಳೆ ಎಲೆ ರೋಗಗಳನ್ನು ತಕ್ಷಣವೇ ಪತ್ತೆಹಚ್ಚಿ ಮತ್ತು ಸಾವಯವ ಹಾಗೂ ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆಗಳನ್ನು ಪಡೆಯಿರಿ." 
                    : "Instantly diagnose crop leaf diseases and receive organic and chemical treatments." 
              },
              { 
                icon: CloudSun, 
                title: lang === "hi" ? "मौसम इंटेलिजेंस" : lang === "kn" ? "ಹವಾಮಾನ ಬುದ್ಧಿಮತ್ತೆ" : "Weather Intelligence", 
                desc: lang === "hi" 
                  ? "भारी बारिश, आर्द्रता और गर्मी के लिए विशिष्ट चेतावनियों के साथ हाइपर-लोकल पूर्वानुमान।" 
                  : lang === "kn" 
                    ? "ಭಾರೀ ಮಳೆ, ಆರ್ದ್ರತೆ ಮತ್ತು ಶಾಖಕ್ಕಾಗಿ ನಿರ್ದಿಷ್ಟ ಎಚ್ಚರಿಕೆಗಳೊಂದಿಗೆ ಹೈಪರ್-ಲೋಕಲ್ ಮುನ್ಸೂಚನೆಗಳು." 
                    : "Hyper-local forecasts with specific warnings for severe rain, humidity, and heat." 
              },
              { 
                icon: TrendingUp, 
                title: lang === "hi" ? "लाइव मंडी भाव" : lang === "kn" ? "ಲೈವ್ ಮಂಡಿ ದರಗಳು" : "Live Mandi Prices", 
                desc: lang === "hi" 
                  ? "स्वचालित लक्ष्य अलर्ट सीमाओं के साथ वास्तविक समय में ट्रैक किए गए एपीएमसी बाजार भाव।" 
                  : lang === "kn" 
                    ? "ಸ್ವಯಂಚಾಲಿತ ಗುರಿ ಎಚ್ಚರಿಕೆ ಮಿತಿಗಳೊಂದಿಗೆ ನೈಜ-ಸಮಯದಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾದ APMC ಮಾರುಕಟ್ಟೆ ದರಗಳು." 
                    : "APMC market rates tracked in real-time with automatic target alert thresholds." 
              },
              { 
                icon: Sprout, 
                title: lang === "hi" ? "फसल प्रेडिक्टर AI" : lang === "kn" ? "ಬೆಳೆ ಪ್ರೆಡಿಕ್ಟರ್ AI" : "Crop Predictor AI", 
                desc: lang === "hi" 
                  ? "आपकी मिट्टी के रसायन शास्त्र, मौसम के रुझान और स्थान के लिए सर्वोत्तम फसलों की भविष्यवाणी करता है।" 
                  : lang === "kn" 
                    ? "ನಿಮ್ಮ ಮಣ್ಣಿನ ರಸಾಯನಶಾಸ್ತ್ರ, ಹವಾಮಾನ ಪ್ರವೃತ್ತಿಗಳು ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ಸೂಕ್ತವಾದ ಬೆಳೆಗಳನ್ನು ಮುನ್ಸೂಚಿಸುತ್ತದೆ." 
                    : "Predicts the best crops for your soil chemistry, weather trends, and location." 
              },
              { 
                icon: Landmark, 
                title: lang === "hi" ? "सरकारी योजनाएं" : lang === "kn" ? "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು" : "Sarkari Yojnayein", 
                desc: lang === "hi" 
                  ? "आवेदन करने के लिए गाइड के साथ पीएम-किसान, पीएमएफबीवाई, केसीसी पात्रता की आसान जांच।" 
                  : lang === "kn" 
                    ? "ಅನ್ವಯಿಸಲು ಮಾರ್ಗದರ್ಶಿಗಳೊಂದಿಗೆ PM-ಕಿಸಾನ್, PMFBY, KCC ಅರ್ಹತೆಯ ಸುಲಭ ಪರಿಶೀಲನೆ." 
                    : "Easy check for PM-Kisan, PMFBY, KCC eligibility with guides to apply." 
              },
              { 
                icon: BookOpen, 
                title: lang === "hi" ? "खेत डायरी" : lang === "kn" ? "ಹೊಲ ಡೈರಿ" : "Khet Diary", 
                desc: lang === "hi" 
                  ? "कृषि गतिविधियों, दैनिक खर्चों और स्थानीय मौसम के गतिशील लॉग रखें।" 
                  : lang === "kn" 
                    ? "ಕೃಷಿ ಚಟುವಟಿಕೆಗಳು, ದೈನಂದಿನ ವೆಚ್ಚಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಹವಾಮಾನದ ಕ್ರಿಯಾತ್ಮಕ ದಾಖಲೆಗಳನ್ನು ಇರಿಸಿ." 
                    : "Keep dynamic logs of farm activity, daily expenditure, and localized weather." 
              }
            ].map((f, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl border border-border/20 bg-background/50 hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-foreground font-display">{f.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDERS GRID */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">{lang === "hi" ? "संस्थापकों से मिलें" : lang === "kn" ? "ಸಂಸ್ಥಾಪಕರನ್ನು ಭೇಟಿ ಮಾಡಿ" : "Meet the Founders"}</h2>
            <p className="text-xs text-muted-foreground mt-2">{lang === "hi" ? "कृषिAI के पीछे की विकास टीम" : lang === "kn" ? "ಕೃಷಿAI ಹಿಂದಿನ ಅಭಿವೃದ್ಧಿ ತಂಡ" : "The development team behind KrishiAI"}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {founders.map((f, i) => (
              <motion.div 
                key={f.email}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <GlassCard className="h-full flex flex-col justify-between group overflow-hidden relative border border-border/40 bg-card/25 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-2 transition-all duration-300 p-6">
                  {/* Accent Line */}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.gradient}`} />
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-base font-black text-white shadow-md shadow-emerald-500/10`}>
                        {f.initials}
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-foreground font-display transition-colors group-hover:text-emerald-400">{f.name}</h3>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent mt-0.5">
                      {f.role}
                    </p>
                    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/90 font-medium">
                      {f.bio}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/20 relative z-10">
                    <a
                      href={`mailto:${f.email}`}
                      className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-background/50 border border-border/30 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 text-xs font-semibold text-foreground transition-all duration-200"
                    >
                      <Mail className="h-3.5 w-3.5 text-emerald-500 group-hover:text-white transition-colors" />
                      <span>{lang === "hi" ? "ईमेल संपर्क" : lang === "kn" ? "ಇಮೇಲ್ ಸಂಪರ್ಕ" : `Email ${f.role.includes("Founder") ? "Founder" : "Team Member"}`}</span>
                    </a>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 md:px-12 py-10 text-center">
        <div className="mx-auto max-w-xl rounded-2xl border border-emerald-500/10 bg-gradient-to-r from-emerald-950/10 to-teal-950/10 p-8 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-bold font-display text-foreground mb-3">
            {lang === "hi" ? "आज ही अपनी फसल कटाई के कार्यों को अनुकूलित करें" : lang === "kn" ? "ಇಂದೇ ನಿಮ್ಮ ಕೊಯ್ಲು ಕಾರ್ಯಾಚರಣೆಗಳನ್ನು ಉತ್ತಮಗೊಳಿಸಿ" : "Optimize Your Harvesting Operations Today"}
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
            {lang === "hi" 
              ? "एक मुफ्त खाता पंजीकृत करें, फसल रोग मॉडल का परीक्षण करें, और खेत डायरी में लॉग रखना शुरू करें।" 
              : lang === "kn" 
                ? "ಉಚಿತ ಖಾತೆಯನ್ನು ನೋಂದಾಯಿಸಿ, ಬೆಳೆ ರೋಗ ಮಾದರಿಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ ಮತ್ತು ಹೊಲ ಡೈರಿಯಲ್ಲಿ ದಾಖಲೆಗಳನ್ನು ಬರೆಯಲು ಪ್ರಾರಂಭಿಸಿ." 
                : "Register a free account, test your crop disease models, and start keeping logs in Khet Diary."}
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/signup">
              <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-10 px-5 shadow-lg shadow-emerald-500/15">
                {lang === "hi" ? "मुफ्त जुड़ें" : lang === "kn" ? "ಉಚಿತವಾಗಿ ಸೇರಿ" : "Join Free"}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="rounded-xl border-border/40 hover:bg-white/[0.03] text-foreground font-semibold h-10 px-5">
                {lang === "hi" ? "होम पेज पर जाएं" : lang === "kn" ? "ಹೋಮ್ ಪೇಜ್‌ಗೆ ಹೋಗಿ" : "Go to Home"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
