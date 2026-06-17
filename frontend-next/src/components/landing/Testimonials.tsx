'use client';

import { useLanguage } from '@/lib/language';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export function Testimonials() {
  const { t, lang } = useLanguage();

  const testimonials = [
    {
      name: t("landing_testimonials.ramesh_patel"),
      location: t("landing_testimonials.rajkot_gujarat"),
      crop: t("landing_testimonials.cotton_farmer"),
      text: t("landing_testimonials.the_crop_predictor_identified"),
      stars: 5,
    },
    {
      name: t("landing_testimonials.suresh_gowda"),
      location: t("landing_testimonials.kolar_karnataka"),
      crop: t("landing_testimonials.tomato_grower"),
      text: t("landing_testimonials.the_leaf_disease_detector"),
      stars: 5,
    },
    {
      name: t("landing_testimonials.rajesh_kumar"),
      location: t("landing_testimonials.agra_uttar_pradesh"),
      crop: t("landing_testimonials.potato_cultivator"),
      text: t("landing_testimonials.mandi_price_target_notifications"),
      stars: 5,
    },
  ];

  return (
    <section className="py-20 bg-muted/15 border-b border-border/20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Title */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-4 py-1 text-xs font-bold text-primary">
            {t("landing_testimonials.success_stories")}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            {t("landing_testimonials.trusted_by")}{' '}
            <span className="bg-gradient-to-r from-primary to-[#0F5132] dark:to-[#2ECC71] bg-clip-text text-transparent">
              {t("landing_testimonials.indian_kisans")}
            </span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed font-semibold">
            {t("landing_testimonials.see_how_farmers_across")}
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
                <Quote className="h-8 w-8 text-primary/15 absolute top-6 right-6" />
 
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
                <span className="bg-primary/10 text-primary border border-primary/10 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase">
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
