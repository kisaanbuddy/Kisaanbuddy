'use client';

import { useLanguage } from '@/lib/language';
import { useState } from 'react';
import { Sprout, Bug, TrendingUp, CloudSun, Check, Sparkles, Upload, AlertCircle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DashboardPreview() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('predictor');

  const tabs = [
    { id: 'predictor', label: lang === "hi" ? "फसल प्रेडिक्टर" : lang === "kn" ? "ಬೆಳೆ ಪ್ರೆಡಿಕ್ಟರ್" : "Crop Predictor", icon: Sprout },
    { id: 'detector', label: lang === "hi" ? "रोग डिटेक्टर" : lang === "kn" ? "ರೋಗ ಪತ್ತೆಕಾರಕ" : "Disease Detector", icon: Bug },
    { id: 'mandi', label: lang === "hi" ? "बाजार विश्लेषक" : lang === "kn" ? "ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ" : "Market Analytics", icon: TrendingUp },
    { id: 'weather', label: lang === "hi" ? "मौसम डैशबोर्ड" : lang === "kn" ? "ಹವಾಮಾನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" : "Weather Dashboard", icon: CloudSun },
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden border-b border-border/20">
      
      {/* Decorative Blob */}
      <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {lang === "hi" ? "इंटरैक्टिव शोकेस" : lang === "kn" ? "ಸಂವಾದಾತ್ಮಕ ಪ್ರದರ್ಶನ" : "Interactive Showcase"}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            {lang === "hi" ? "KrishiAI डैशबोर्ड का" : lang === "kn" ? "KrishiAI ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" : "Explore the"}{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              {lang === "hi" ? "पता लगाएं" : lang === "kn" ? "ಅನ್ವೇಷಿಸಿ" : "KrishiAI Dashboard"}
            </span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed font-semibold">
            {lang === "hi" 
              ? "हमारे इंटरफ़ेस और सिम्युलेटेड एआई विश्लेषण सुविधाओं का पूर्वावलोकन करने के लिए सक्रिय मॉड्यूल पर क्लिक करें।" 
              : lang === "kn" 
                ? "ನಮ್ಮ ಇಂಟರ್ಫೇಸ್ ಮತ್ತು ಸಿಮ್ಯುಲೇಟೆಡ್ AI ವಿಶ್ಲೇಷಣಾ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಪೂರ್ವವೀಕ್ಷಿಸಲು ನಮ್ಮ ಸಕ್ರಿಯ ಮಾಡ್ಯೂಲ್‌ಗಳ ಮೂಲಕ ಕ್ಲಿಕ್ ಮಾಡಿ." 
                : "Click through our active modules to preview our interface and simulated AI analysis features."}
          </p>
        </div>

        {/* Dynamic Tab Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 bg-muted/20 border border-border/20 p-1.5 rounded-2xl w-fit mx-auto backdrop-blur-sm select-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
                  ${active 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Preview Frame */}
        <div className="rounded-3xl border border-border/40 bg-card/30 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden min-h-[420px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-between h-full"
            >
              
              {/* Tab 1: Crop Predictor */}
              {activeTab === 'predictor' && (
                <div className="grid gap-8 lg:grid-cols-5 items-center">
                  <div className="lg:col-span-2 space-y-4 text-center lg:text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mx-auto lg:mx-0">
                      <Sprout className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-foreground">{lang === "hi" ? "मृदा रसायन अनुकूलक" : lang === "kn" ? "ಮಣ್ಣಿನ ರಸಾಯನಶಾಸ್ತ್ರ ಆಪ್ಟಿಮೈಜರ್" : "Soil Chemistry Optimizer"}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {lang === "hi" 
                        ? "अपने एन-पी-के रासायनिक स्तर, पीएच संतुलन, जैविक कार्बन सामग्री और भूमि निर्देशांक दर्ज करें। KrishiAI सर्वोत्तम फसल विकल्पों को आउटपुट करने के लिए जलवायु अनुमानों के साथ क्रॉस-रेफरेंस करता है।" 
                        : lang === "kn" 
                          ? "ನಿಮ್ಮ N-P-K ರಾಸಾಯನಿಕ ಮಟ್ಟಗಳು, pH ಸಮತೋಲನ, ಸಾವಯವ ಇಂಗಾಲದ ಅಂಶ ಮತ್ತು ಭೂಮಿಯ ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ನಮೂದಿಸಿ. KrishiAI ಸೂಕ್ತ ಬೆಳೆ ಆಯ್ಕೆಗಳನ್ನು ನೀಡಲು ಇವುಗಳನ್ನು ಹವಾಮಾನ ಪ್ರಕ್ಷೇಪಗಳೊಂದಿಗೆ ಕ್ರಾಸ್ ಮಾಡುತ್ತದೆ." 
                          : "Input your N-P-K chemical levels, pH balance, organic carbon content, and land coordinates. KrishiAI crosses these with climate projections to output optimal crop choices."}
                    </p>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-muted-foreground text-left max-w-xs mx-auto lg:mx-0 pt-2">
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {lang === "hi" ? "गतिशील फसल सुझाव" : lang === "kn" ? "ಡೈನಾಮಿಕ್ ಬೆಳೆ ಸಲಹೆಗಳು" : "Dynamic crop suggestions"}</div>
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {lang === "hi" ? "उर्वरक अनुपात रिपोर्ट" : lang === "kn" ? "ಗೊಬ್ಬರ ಅನುಪಾತ ವರದಿಗಳು" : "Fertilizer ratio reports"}</div>
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="lg:col-span-3 rounded-2xl border border-border bg-background/50 p-5 space-y-4 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 select-none">
                      <Sparkles className="h-3.5 w-3.5" /> {lang === "hi" ? "मृदा प्रेडिक्टर इंजन" : lang === "kn" ? "ಮಣ್ಣಿನ ಪ್ರೆಡಿಕ್ಟರ್ ಎಂಜಿನ್" : "Soil Predictor Engine"}
                    </h4>
                    
                    <div className="grid gap-3 grid-cols-3 text-[10px] font-bold text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <span>{lang === "hi" ? "नाइट्रोजन (N)" : lang === "kn" ? "ಸಾರಜನಕ (N)" : "Nitrogen (N)"}</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">92 mg/kg</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>{lang === "hi" ? "फास्फोरस (P)" : lang === "kn" ? "ರಂಜಕ (P)" : "Phosphorus (P)"}</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">48 mg/kg</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>{lang === "hi" ? "पोटेशियम (K)" : lang === "kn" ? "ಪೊಟ್ಯಾಸಿಯಮ್ (K)" : "Potassium (K)"}</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">205 mg/kg</div>
                      </div>
                    </div>

                    <div className="grid gap-3 grid-cols-2 text-[10px] font-bold text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <span>{lang === "hi" ? "मिट्टी का पीएच" : lang === "kn" ? "ಮಣ್ಣಿನ pH" : "Soil pH"}</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">6.4 ({lang === "hi" ? "थोड़ा अम्लीय" : lang === "kn" ? "ಸ್ವಲ್ಪ ಆಮ್ಲೀಯ" : "Slightly Acidic"})</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>{lang === "hi" ? "जैविक कार्बन (OC)" : lang === "kn" ? "ಸಾವಯವ ಇಂಗಾಲ (OC)" : "Organic Carbon (OC)"}</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">0.65% ({lang === "hi" ? "मध्यम" : lang === "kn" ? "ಮಧ್ಯಮ" : "Medium"})</div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm">🌾</div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{lang === "hi" ? "शीर्ष सुझाव" : lang === "kn" ? "ಉನ್ನತ ಸಲಹೆ" : "Top Suggestion"}</span>
                          <span className="text-xs font-extrabold text-foreground">{lang === "hi" ? "प्रीमियम बासमती चावल" : lang === "kn" ? "ಪ್ರೀಮಿಯಂ ಬಾಸ್ಮತಿ ಅಕ್ಕಿ" : "Premium Basmati Rice"}</span>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold">{lang === "hi" ? "98% उपयुक्तता स्कोर" : lang === "kn" ? "98% ಹೊಂದಾಣಿಕೆ ಸ್ಕೋರ್" : "98% Fit Score"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Disease Detector */}
              {activeTab === 'detector' && (
                <div className="grid gap-8 lg:grid-cols-5 items-center">
                  <div className="lg:col-span-2 space-y-4 text-center lg:text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500 mx-auto lg:mx-0">
                      <Bug className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-foreground">{lang === "hi" ? "फसल पत्ती रोगविज्ञान एआई" : lang === "kn" ? "ಬೆಳೆ ಎಲೆ ರೋಗಶಾಸ್ತ್ರ AI" : "Crop Leaf Pathology AI"}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {lang === "hi" 
                        ? "पौधों की बीमारियों की तुरंत पहचान करें। आलू, टमाटर, कपास या गेहूं के पत्तों की तस्वीरें अपलोड करें। हमारा मॉडल रोगज़नक़ धब्बों को पहचानने और लक्षित उपचार की रूपरेखा तैयार करने के लिए विवरण संसाधित करता है।" 
                        : lang === "kn" 
                          ? "ಸಸ್ಯಗಳ ರೋಗಗಳನ್ನು ತಕ್ಷಣವೇ ಗುರುತಿಸಿ. ಆಲೂಗಡ್ಡೆ, ಟೊಮೆಟೊ, ಹತ್ತಿ ಅಥವಾ ಗೋಧಿಯ ಎಲೆಗಳ ಫೋಟೋಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ. ರೋಗಕಾರಕ ಚುಕ್ಕೆಗಳನ್ನು ಗುರುತಿಸಲು ಮತ್ತು ಉದ್ದೇಶಿತ ಪರಿಹಾರವನ್ನು ರೂಪಿಸಲು ನಮ್ಮ ಮಾದರಿಯು ವಿವರಗಳನ್ನು ಸಂಸ್ಕರಿಸುತ್ತದೆ." 
                          : "Identify plant sicknesses immediately. Upload leaf photos of potato, tomato, cotton, or wheat. Our model processes details to recognize pathogen spots and outline a targeted cure."}
                    </p>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-muted-foreground text-left max-w-xs mx-auto lg:mx-0 pt-2">
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {lang === "hi" ? "जैविक स्प्रे उपचार" : lang === "kn" ? "ಸಾವಯವ ಸ್ಪ್ರೇ ಪರಿಹಾರಗಳು" : "Organic spray remedies"}</div>
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {lang === "hi" ? "रासायनिक खुराक नियंत्रण" : lang === "kn" ? "ರಾಸಾಯನಿಕ ಡೋಸೇಜ್ ನಿಯಂತ್ರಣಗಳು" : "Chemical dosage controls"}</div>
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="lg:col-span-3 rounded-2xl border border-border bg-background/50 p-5 space-y-4 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 select-none">
                      <AlertCircle className="h-3.5 w-3.5" /> {lang === "hi" ? "पत्ती निदान कंसोल" : lang === "kn" ? "ಎಲೆ ರೋಗನಿರ್ಣಯ ಕನ್ಸೋಲ್" : "leaf diagnosis console"}
                    </h4>

                    <div className="border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-muted/10 relative overflow-hidden select-none min-h-[120px]">
                      {/* Leaf scanning animation representation */}
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500/40 animate-pulse" />
                      <Upload className="h-6 w-6 text-muted-foreground/60" />
                      <span className="text-[10px] text-muted-foreground font-bold">{lang === "hi" ? "leaf_tomato_spot.png अपलोड किया गया" : lang === "kn" ? "leaf_tomato_spot.png ಅಪ್ಲೋಡ್ ಮಾಡಲಾಗಿದೆ" : "leaf_tomato_spot.png uploaded"}</span>
                      <span className="text-[9px] text-emerald-500 font-extrabold uppercase">{lang === "hi" ? "विशेषताओं का विश्लेषण..." : lang === "kn" ? "ವೈಶಿಷ್ಟ್ಯಗಳ ವಿಶ್ಲೇಷಣೆ..." : "Analyzing features..."}</span>
                    </div>

                    <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-3.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-foreground">{lang === "hi" ? "टमाटर अगेती झुलसा" : lang === "kn" ? "ಟೊಮೆಟೊ ಅರ್ಲಿ ಬ್ಲೈಟ್" : "Tomato Early Blight"}</span>
                          <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/10 px-2 py-0.5 rounded-full font-black">{lang === "hi" ? "उच्च चिंता" : lang === "kn" ? "ಹೆಚ್ಚಿನ ಆತಂಕ" : "HIGH CONCERN"}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold">{lang === "hi" ? "सटीकता" : lang === "kn" ? "ನಿಖರತೆ" : "Accuracy"}: 94.7%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                        <strong>{lang === "hi" ? "उपचार का सुझाव" : lang === "kn" ? "ಪರಿಹಾರ ಸಲಹೆ" : "Remedy Suggestion"}:</strong> {lang === "hi" ? "कवक के प्रसार को रोकने के लिए कॉपर ऑक्सीक्लोराइड (2.5 ग्राम/लीटर पानी) का छिड़काव करें या तने पर सीधे जैविक नीम के पत्तों का अर्क लगाएं।" : lang === "kn" ? "ಶಿಲೀಂಧ್ರ ಪ್ರಸರಣವನ್ನು ತಡೆಯಲು ತಾಮ್ರದ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ (2.5g/L ನೀರು) ಸಿಂಪಡಿಸಿ ಅಥವಾ ಸಾವಯವ ಬೇವಿನ ಎಲೆ ರಸವನ್ನು ನೇರವಾಗಿ ಅನ್ವಯಿಸಿ." : "Spray Copper Oxychloride (2.5g/L water) or apply organic neem leaf extracts directly onto the stems to arrest fungal propagation."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Market Analytics */}
              {activeTab === 'mandi' && (
                <div className="grid gap-8 lg:grid-cols-5 items-center">
                  <div className="lg:col-span-2 space-y-4 text-center lg:text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mx-auto lg:mx-0">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-foreground">{lang === "hi" ? "APMC मंडी मूल्य अलर्ट" : lang === "kn" ? "APMC ಮಂಡಿ ಬೆಲೆ ಎಚ್ಚರಿಕೆಗಳು" : "APMC Mandi Price Alerts"}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {lang === "hi" 
                        ? "कम कीमत पर कभी न बेचें। भारतीय बाजारों में सक्रिय मंडी भावों की निगरानी करें, फसल की कीमतों में उछाल का विश्लेषण करें, और कीमतें आपके लक्ष्यों तक पहुंचने पर एसएमएस अलर्ट कॉन्फ़िगर करें।" 
                        : lang === "kn" 
                          ? "ಕಡಿಮೆ ಬೆಲೆಗೆ ಎಂದಿಗೂ ಮಾರಾಟ ಮಾಡಬೇಡಿ. ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ ಸಕ್ರಿಯ ಮಂಡಿ ದರಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ, ಬೆಲೆ ಏರಿಕೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ಬೆಲೆಗಳು ನಿಮ್ಮ ಗುರಿಗಳನ್ನು ತಲುಪಿದಾಗ SMS ಎಚ್ಚರಿಕೆಗಳನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಿ." 
                          : "Never sell under value. Monitor active mandi quotes across Indian markets, analyze crop price surges, and configure SMS alerts when prices hit your goals."}
                    </p>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-muted-foreground text-left max-w-xs mx-auto lg:mx-0 pt-2">
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {lang === "hi" ? "लक्षित अलर्ट कॉन्फ़िगरेशन" : lang === "kn" ? "ಗುರಿ ಎಚ್ಚರಿಕೆಗಳ ಕಾನ್ಫಿಗರೇಶನ್" : "Target alerts configuration"}</div>
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {lang === "hi" ? "मूल्य प्रवृत्ति अंतर्दृष्टि" : lang === "kn" ? "ಬೆಲೆ ಪ್ರವೃತ್ತಿ ಒಳನೋಟಗಳು" : "Price trend insights"}</div>
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="lg:col-span-3 rounded-2xl border border-border bg-background/50 p-5 space-y-4 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 select-none">
                      <TrendingUp className="h-3.5 w-3.5" /> {lang === "hi" ? "लाइव एपीएमसी दरें (आलू)" : lang === "kn" ? "ಲೈವ್ APMC ದರಗಳು (ಆಲೂಗಡ್ಡೆ)" : "Live APMC rates (Potato)"}
                    </h4>

                    {/* Mock mandi list */}
                    <div className="space-y-2 text-[10px] font-semibold text-muted-foreground">
                      {[
                        { mandi: lang === "hi" ? "आगरा मंडी, यूपी" : lang === "kn" ? "ಆಗ್ರಾ ಮಂಡಿ, ಯುಪಿ" : "Agra Mandi, UP", current: "₹1,850/Quintal", change: lang === "hi" ? "+₹50 आज" : lang === "kn" ? "+₹50 ಇಂದು" : "+₹50 today" },
                        { mandi: lang === "hi" ? "पटना एपीएमसी, बिहार" : lang === "kn" ? "ಪಾಟ್ನಾ APMC, ಬಿಹಾರ" : "Patna APMC, Bihar", current: "₹1,920/Quintal", change: lang === "hi" ? "+₹80 आज" : lang === "kn" ? "+₹80 ಇಂದು" : "+₹80 today" },
                        { mandi: lang === "hi" ? "पुणे एपीएमसी, महाराष्ट्र" : lang === "kn" ? "ಪುಣೆ APMC, ಮಹಾರಾಷ್ಟ್ರ" : "Pune APMC, Maharashtra", current: "₹2,100/Quintal", change: lang === "hi" ? "+₹120 आज" : lang === "kn" ? "+₹120 ಇಂದು" : "+₹120 today" },
                      ].map((m, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-muted/40 p-2.5 rounded-xl border border-border/20">
                          <div>
                            <span className="text-foreground font-bold">{m.mandi}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-foreground font-extrabold">{m.current}</span>
                            <span className="block text-[8px] text-emerald-500 font-extrabold">{m.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
                      <div className="flex items-center gap-2.5">
                        <Bell className="h-4 w-4 text-amber-500" />
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase text-muted-foreground font-bold">{lang === "hi" ? "सक्रिय लक्षित अलर्ट" : lang === "kn" ? "ಸಕ್ರಿಯ ಗುರಿ ಎಚ್ಚರಿಕೆ" : "Active target alert"}</span>
                          <span className="text-xs font-bold text-foreground">{lang === "hi" ? "आलू ₹2,000/Q से अधिक होने पर अलर्ट" : lang === "kn" ? "ಆಲೂಗಡ್ಡೆ ₹2,000/Q ಮೀರಿದಾಗ ಎಚ್ಚರಿಕೆ" : "Alert when Potato exceeds ₹2,000/Q"}</span>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full">{lang === "hi" ? "सक्रिय" : lang === "kn" ? "ಸಕ್ರಿಯ" : "ACTIVE"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Weather Dashboard */}
              {activeTab === 'weather' && (
                <div className="grid gap-8 lg:grid-cols-5 items-center">
                  <div className="lg:col-span-2 space-y-4 text-center lg:text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 mx-auto lg:mx-0">
                      <CloudSun className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-foreground">{lang === "hi" ? "हाइपरलोकल मौसम सलाह" : lang === "kn" ? "ಹೈಪರ್ಲೋಕಲ್ ಹವಾಮಾನ ಸಲಹೆಗಳು" : "Hyperlocal Weather Advisories"}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {lang === "hi" 
                        ? "कीटनाशक चक्रों या कटाई की समयसीमा को गंभीर हवा, उच्च गर्मी, या अचानक बारिश से खतरा होने पर आपको सचेत करने के लिए मौसम एपीआई फ़ीड को सीधे फसल चरणों के साथ एकीकृत करता है।" 
                        : lang === "kn" 
                          ? "ತೀವ್ರ ಗಾಳಿ, ಹೆಚ್ಚಿನ ಶಾಖ ಅಥವಾ ಹಠಾತ್ ಮಳೆಯು ಕೀಟನಾಶಕ ಚಕ್ರಗಳು ಅಥವಾ ಕೊಯ್ಲು ಸಮಯದ ಸಾಲುಗಳಿಗೆ ಧಕ್ಕೆ ತಂದಾಗ ನಿಮಗೆ ಎಚ್ಚರಿಕೆ ನೀಡಲು ಹವಾಮಾನ API ಫೀಡ್‌ಗಳನ್ನು ನೇರವಾಗಿ ಬೆಳೆ ಹಂತಗಳೊಂದಿಗೆ ಸಂಯೋಜಿಸುತ್ತದೆ." 
                          : "Integrates weather API feeds directly with crop stages to alert you when severe wind, high heat, or sudden rain threatens pesticide cycles or harvesting timelines."}
                    </p>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-muted-foreground text-left max-w-xs mx-auto lg:mx-0 pt-2">
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {lang === "hi" ? "7-दिवसीय मौसम पूर्वानुमान" : lang === "kn" ? "7-ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ" : "7-day weather prediction"}</div>
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {lang === "hi" ? "गंभीर घटना की चेतावनी" : lang === "kn" ? "ತೀವ್ರ ಘಟನೆಗಳ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು" : "Severe event warnings"}</div>
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="lg:col-span-3 rounded-2xl border border-border bg-background/50 p-5 space-y-4 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-500 flex items-center gap-1.5 select-none">
                      <CloudSun className="h-3.5 w-3.5" /> {lang === "hi" ? "मौसम अलर्ट कंसोल" : lang === "kn" ? "ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ ಕನ್ಸೋಲ್" : "Weather Alert console"}
                    </h4>

                    <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border/20">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">⛈️</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{lang === "hi" ? "भारी गरज के साथ आंधी की उम्मीद" : lang === "kn" ? "ಭಾರಿ ಗುಡುಗು ಸಹಿತ ಮಳೆಯ ನಿರೀಕ್ಷೆ" : "Heavy Thunderstorms Expected"}</span>
                          <span className="text-[9px] text-muted-foreground font-semibold">{lang === "hi" ? "14 घंटे में शुरू (अनुमानित 45 मिमी बारिश)" : lang === "kn" ? "14 ಗಂಟೆಗಳಲ್ಲಿ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ (ಅಂದಾಜು 45mm ಮಳೆ)" : "Commencing in 14 hours (Estimated 45mm rain)"}</span>
                        </div>
                      </div>
                      <span className="bg-red-500/10 text-red-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-red-500/20 select-none animate-pulse">{lang === "hi" ? "चेतावनी" : lang === "kn" ? "ಎಚ್ಚರಿಕೆ" : "WARNING"}</span>
                    </div>

                    <div className="rounded-xl bg-sky-500/5 border border-sky-500/20 p-3.5">
                      <span className="text-[9px] font-extrabold uppercase text-sky-500 block mb-1">{lang === "hi" ? "फसल विशिष्ट सलाह" : lang === "kn" ? "ಬೆಳೆ ನಿರ್ದಿಷ್ಟ ಸಲಹೆ" : "Crop specific advisory"}</span>
                      <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                        <strong>{lang === "hi" ? "गेहूं" : lang === "kn" ? "ಗೋಧಿ" : "Wheat"}:</strong> {lang === "hi" ? "अगले 24 घंटों के भीतर तरल यूरिया उर्वरक न डालें या सिंचाई न चलाएं। तूफान का पानी पोषक तत्वों को बहा ले जाएगा।" : lang === "kn" ? "ಮುಂದಿನ 24 ಗಂಟೆಗಳಲ್ಲಿ ದ್ರವ ಯೂರಿಯಾ ರಸಗೊಬ್ಬರಗಳನ್ನು ಹಾಕಬೇಡಿ ಅಥವಾ ನೀರಾವರಿ ಕಾಲುವೆಗಳನ್ನು ಚಲಾಯಿಸಬೇಡಿ. ಬಿರುಗಾಳಿ ನೀರು ಪೋಷಕಾಂಶಗಳನ್ನು ತೊಳೆದು ಮಣ್ಣಿನ ನಿಶ್ಚಲತೆಗೆ ಕಾರಣವಾಗುತ್ತದೆ." : "Do not apply liquid urea fertilizers or run irrigation channels within the next 24 hours. Storm water runoff will wash nutrients away and cause soil stagnation."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
