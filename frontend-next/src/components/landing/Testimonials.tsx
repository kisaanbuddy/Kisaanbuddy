'use client';

import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    name: "Ramesh Patel",
    location: "Rajkot, Gujarat",
    crop: "Cotton Farmer",
    text: "The Crop Predictor identified Cotton was optimal for my low-nitrogen field and suggested the exact fertilizer ratio. My crop yield grew by 35% this season.",
    stars: 5,
  },
  {
    name: "Suresh Gowda",
    location: "Kolar, Karnataka",
    crop: "Tomato Grower",
    text: "The leaf disease detector saved my crop. I photographed black spots on my tomato leaves, diagnosed early blight in 2 seconds, and applied the organic neem recommendations.",
    stars: 5,
  },
  {
    name: "Rajesh Kumar",
    location: "Agra, Uttar Pradesh",
    crop: "Potato Cultivator",
    text: "Mandi price target notifications allowed me to track Agra rates easily. I got an SMS alert when potato crossed ₹1,900 and sold at maximum profit.",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-muted/15 border-b border-border/20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Title */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            Trusted by <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">Indian Kisans</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed font-semibold">
            See how farmers across Gujarat, Karnataka, and Uttar Pradesh are optimizing their crops and maximizing profits.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
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
