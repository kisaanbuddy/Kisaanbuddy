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
      q: t("landing_faq.what_is_krishiai"),
      a: t("landing_faq.krishiai_is_an_ai"),
    },
    {
      q: t("landing_faq.how_does_the_crop"),
      a: t("landing_faq.you_simply_take_a"),
    },
    {
      q: t("landing_faq.is_krishiai_free_to"),
      a: t("landing_faq.yes_krishiai_is_currently"),
    },
    {
      q: t("landing_faq.does_krishiai_support_local"),
      a: t("landing_faq.absolutely_krishiai_features_full"),
    },
    {
      q: t("landing_faq.how_accurate_are_the"),
      a: t("landing_faq.our_soil_health_ai"),
    },
    {
      q: t("landing_faq.can_i_monitor_live"),
      a: t("landing_faq.yes_the_mandi_pricing"),
    },
    {
      q: t("landing_faq.how_does_krishiai_help"),
      a: t("landing_faq.by_inputting_details_like"),
    },
    {
      q: t("landing_faq.what_is_the_khet"),
      a: t("landing_faq.khet_diary_is_a"),
    },
    {
      q: t("landing_faq.what_is_the_smart"),
      a: t("landing_faq.it_demonstrates_integrations_with"),
    },
    {
      q: t("landing_faq.how_do_i_get"),
      a: t("landing_faq.you_can_get_started"),
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
            {t("landing_faq.support_center")}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            {t("landing_faq.frequently_asked")}{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              {t("landing_faq.questions")}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground/80 max-w-xs mx-auto font-semibold">
            {t("landing_faq.common_answers_regarding_our")}
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
