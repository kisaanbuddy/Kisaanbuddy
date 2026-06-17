'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, CloudSun, Leaf, Thermometer, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionableAdvisoryProps {
  moisture: number;
  temp: number;
  humidity: number;
  lang: string;
}

export function ActionableAdvisory({ moisture, temp, humidity, lang }: ActionableAdvisoryProps) {
  const getAdvisories = () => {
    const list = [];

    if (lang === 'hi') {
      // Hindi Advisories
      if (moisture < 35) {
        list.push({
          icon: Droplets,
          text: "मिट्टी की नमी काफी कम है (नमी: " + moisture + "%)। आज शाम को हल्की सिंचाई करें ताकि फसल की जड़ें सुरक्षित रहें।",
          type: "warning"
        });
      } else if (moisture > 80) {
        list.push({
          icon: AlertCircle,
          text: "खेत में पानी की मात्रा अधिक है (नमी: " + moisture + "%)। जलभराव रोकने के लिए पानी निकालने के रास्तों को साफ करें।",
          type: "danger"
        });
      } else {
        list.push({
          icon: CheckCircle2,
          text: "मिट्टी की नमी बिलकुल सही है। अभी सिंचाई करने की आवश्यकता नहीं है, पानी की बचत करें।",
          type: "success"
        });
      }

      if (temp > 35) {
        list.push({
          icon: Thermometer,
          text: "तापमान बहुत अधिक है (" + temp + "°C)। दोपहर 12 से 3 बजे के बीच खेत में भारी काम न करें। लू और गर्मी से बचें।",
          type: "warning"
        });
      } else if (temp < 15) {
        list.push({
          icon: Thermometer,
          text: "तापमान कम है (" + temp + "°C)। फसलों को पाले (Frost) से बचाने के लिए शाम को हल्की सिंचाई या धुएं का इंतजाम करें।",
          type: "warning"
        });
      }

      if (humidity > 80) {
        list.push({
          icon: Leaf,
          text: "हवा में उमस अधिक है। ऐसी स्थिति में कीट और फफूंद (Fungus) फैलने का खतरा बढ़ जाता है। पत्तियों की नियमित जांच करें।",
          type: "warning"
        });
      }
    } else {
      // English Advisories
      if (moisture < 35) {
        list.push({
          icon: Droplets,
          text: "Soil moisture is critically low (" + moisture + "%). Schedule a light irrigation cycle this evening to prevent root stress.",
          type: "warning"
        });
      } else if (moisture > 80) {
        list.push({
          icon: AlertCircle,
          text: "Water saturation is high (" + moisture + "%). Clear your drainage channels immediately to prevent waterlogging.",
          type: "danger"
        });
      } else {
        list.push({
          icon: CheckCircle2,
          text: "Soil moisture is at an optimal level. No irrigation required today.",
          type: "success"
        });
      }

      if (temp > 35) {
        list.push({
          icon: Thermometer,
          text: "High temperature detected (" + temp + "°C). Avoid heavy outdoor activities between 12 PM - 3 PM to avoid heat exhaustion.",
          type: "warning"
        });
      } else if (temp < 15) {
        list.push({
          icon: Thermometer,
          text: "Cool temperature detected (" + temp + "°C). Protect crops from potential frost damage by setting up smoke screens or light irrigation.",
          type: "warning"
        });
      }

      if (humidity > 80) {
        list.push({
          icon: Leaf,
          text: "High air humidity levels. This creates an active breeding ground for fungal diseases. Keep a close check on leaf health.",
          type: "warning"
        });
      }
    }

    return list;
  };

  const advisories = getAdvisories();

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-[#0c0f0a]/30 p-6 flex flex-col gap-4">
      <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase pl-1 flex items-center gap-2">
        <span>📢</span>
        <span>{lang === 'hi' ? "खेत के लिए विशेष सलाह" : "Actionable Advisories"}</span>
      </h3>

      <div className="flex flex-col gap-3">
        {advisories.map((adv, idx) => {
          const IconComponent = adv.icon;
          let colorClass = "border-amber-500/10 bg-amber-500/[0.02] text-amber-300";
          if (adv.type === 'success') colorClass = "border-emerald-500/10 bg-emerald-500/[0.02] text-emerald-400";
          if (adv.type === 'danger') colorClass = "border-red-500/10 bg-red-500/[0.02] text-red-400";

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-start gap-3 p-4 rounded-2xl border text-xs font-semibold leading-relaxed ${colorClass}`}
            >
              <IconComponent className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{adv.text}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
