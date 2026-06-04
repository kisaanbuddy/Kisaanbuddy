'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    q: "What is KrishiAI?",
    a: "KrishiAI is an AI-powered smart agriculture platform designed to help Indian farmers make data-driven decisions. The platform gathers location, soil metrics, and crop images to provide forecasts, predictions, market rates, and disease diagnoses.",
  },
  {
    q: "How does the Crop Disease Detector work?",
    a: "You simply take a photo of the infected crop leaf and upload it to the platform. Our machine learning classification models analyze the visual features to diagnose the specific disease and recommend remedies within 2 seconds.",
  },
  {
    q: "Is KrishiAI free to use?",
    a: "Yes! KrishiAI is currently in its early access beta phase and is completely free for all farmers, agriculturalists, and partners.",
  },
  {
    q: "Does KrishiAI support local Indian languages?",
    a: "Absolutely. KrishiAI features full voice query support and interfaces in Hindi, Kannada, and English. You can speak directly to the AI Assistant by clicking the microphone button.",
  },
  {
    q: "How accurate are the crop recommendations?",
    a: "Our Soil Health AI model outputs crop choices with a verified 95% accuracy score by crossing your inputted NPK levels, soil pH, and organic carbon (OC) with historical crop yields and weather histories.",
  },
  {
    q: "Can I monitor live market mandi prices?",
    a: "Yes. The Mandi Pricing engine tracks live APMC market quotes across India daily. You can search for your specific crop and set target price alerts to notify you when prices cross thresholds.",
  },
  {
    q: "How does KrishiAI help with government schemes?",
    a: "By inputting details like your land size and age, our Schemes tool scans active central schemes (like PM-Kisan, PMFBY, and KCC) to find programs you qualify for, providing direct links to apply.",
  },
  {
    q: "What is the Khet Diary feature?",
    a: "Khet Diary is a digital farm logbook. It allows you to log daily farm activities, record expenses, document weather conditions, and upload crop images to track progress over cycles.",
  },
  {
    q: "What is the Smart Hub hardware showcase?",
    a: "It demonstrates integrations with physical IoT hardware blocks (soil moisture sensors, automatic water valves, and NPK readers). This allows smart monitoring and automated irrigation control directly from the dashboard.",
  },
  {
    q: "How do I get started with KrishiAI?",
    a: "You can get started immediately by clicking the 'Get Started' or 'Launch KrishiAI' buttons. Create a free account or use the guest mode to access all tools immediately.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-background relative border-b border-border/20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Title */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Support Center
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            Frequently Asked <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-xs text-muted-foreground/80 max-w-xs mx-auto font-semibold">
            Common answers regarding our agricultural AI tools and operations.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3.5 select-none">
          {FAQS.map((faq, idx) => {
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
