'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Thermometer, Droplets, Leaf } from 'lucide-react';

interface ActionableAdvisoryProps {
  moisture: number;
  temp: number;
  humidity: number;
  lang: string;
}

export function ActionableAdvisory({ moisture, temp, humidity, lang }: ActionableAdvisoryProps) {
  const getAdvisories = () => {
    const list = [];

    if (lang === 'kn') {
      // Kannada Advisories
      if (moisture < 35) {
        list.push({
          icon: Droplets,
          text: `ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಡಿಮೆಯಾಗಿದೆ (${moisture}%). ಬೆಳೆಯ ಬೇರುಗಳ ಆರೋಗ್ಯಕ್ಕೆ ಇಂದು ಸಂಜೆ ಲಘು ನೀರಾವರಿ ಮಾಡಿ.`,
          type: "warning"
        });
      } else if (moisture > 80) {
        list.push({
          icon: ShieldAlert,
          text: `ಹೊಲದಲ್ಲಿ ಹೆಚ್ಚಿನ ನೀರಿನ ಪ್ರಮಾಣ ಕಂಡುಬಂದಿದೆ (${moisture}%). ನೀರು ನಿಲ್ಲುವುದನ್ನು ತಡೆಯಲು ಬಸಿಗಾಲುವೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ.`,
          type: "danger"
        });
      } else {
        list.push({
          icon: CheckCircle2,
          text: `ಮಣ್ಣಿನ ತೇವಾಂಶ ಸೂಕ್ತ ಪ್ರಮಾಣದಲ್ಲಿದೆ (${moisture}%). ಇಂದು ನೀರಾವರಿಯ ಅಗತ್ಯವಿಲ್ಲ, ನೀರನ್ನು ಉಳಿಸಿ.`,
          type: "success"
        });
      }

      if (temp > 35) {
        list.push({
          icon: Thermometer,
          text: `ಹೆಚ್ಚಿನ ತಾಪಮಾನ (${temp}°C). ಮಧ್ಯಾಹ್ನ 12 ರಿಂದ 3 ಗಂಟೆಯವರೆಗೆ ಹೊಲದಲ್ಲಿ ಕಠಿಣ ಕೆಲಸ ತಪ್ಪಿಸಿ.`,
          type: "warning"
        });
      } else if (temp < 15) {
        list.push({
          icon: Thermometer,
          text: `ಕಡಿಮೆ ತಾಪಮಾನ ದಾಖಲಾಗಿದೆ (${temp}°C). ಬೆಳೆಗಳನ್ನು ಶೀತದ ಒತ್ತಡದಿಂದ ರಕ್ಷಿಸಲು ಗಮನಿಸಿ.`,
          type: "warning"
        });
      }

      if (humidity > 80) {
        list.push({
          icon: Leaf,
          text: `ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆ (${humidity}%). ಶಿಲೀಂಧ್ರ ಸೋಂಕಿನ ಅಪಾಯವಿದೆ; ಎಲೆಗಳ ಕೆಳಭಾಗವನ್ನು ಪರೀಕ್ಷಿಸಿ.`,
          type: "warning"
        });
      }
    } else if (lang === 'hi') {
      // Hindi Advisories
      if (moisture < 35) {
        list.push({
          icon: Droplets,
          text: `मिट्टी की नमी कम है (${moisture}%)। आज शाम को हल्की सिंचाई करें ताकि फसल की जड़ें सुरक्षित रहें।`,
          type: "warning"
        });
      } else if (moisture > 80) {
        list.push({
          icon: ShieldAlert,
          text: `खेत में पानी की मात्रा अधिक है (${moisture}%)। जलभराव रोकने के लिए जल निकासी सुनिश्चित करें।`,
          type: "danger"
        });
      } else {
        list.push({
          icon: CheckCircle2,
          text: `मिट्टी की नमी अनुकूल है (${moisture}%)। आज सिंचाई की आवश्यकता नहीं है, पानी की बचत करें।`,
          type: "success"
        });
      }

      if (temp > 35) {
        list.push({
          icon: Thermometer,
          text: `तापमान अधिक है (${temp}°C)। दोपहर 12 से 3 बजे के बीच खेत में भारी काम से बचें।`,
          type: "warning"
        });
      } else if (temp < 15) {
        list.push({
          icon: Thermometer,
          text: `तापमान ठंडा है (${temp}°C)। पाले (Frost) से फसलों की सुरक्षा के लिए निगरानी रखें।`,
          type: "warning"
        });
      }

      if (humidity > 80) {
        list.push({
          icon: Leaf,
          text: `हवा में नमी अधिक है (${humidity}%)। फफूंद और कीट संक्रमण का जोखिम हो सकता है; पत्तियों की जांच करें।`,
          type: "warning"
        });
      }
    } else {
      // English Advisories
      if (moisture < 35) {
        list.push({
          icon: Droplets,
          text: `Soil moisture is low (${moisture}%). Schedule a light evening irrigation to maintain root health.`,
          type: "warning"
        });
      } else if (moisture > 80) {
        list.push({
          icon: ShieldAlert,
          text: `High water saturation detected (${moisture}%). Ensure drainage outlets are clear to prevent waterlogging.`,
          type: "danger"
        });
      } else {
        list.push({
          icon: CheckCircle2,
          text: `Soil moisture is in the optimal range (${moisture}%). No irrigation required today.`,
          type: "success"
        });
      }

      if (temp > 35) {
        list.push({
          icon: Thermometer,
          text: `High ambient temperature (${temp}°C). Avoid heavy fieldwork between 12 PM - 3 PM.`,
          type: "warning"
        });
      } else if (temp < 15) {
        list.push({
          icon: Thermometer,
          text: `Cold temperature detected (${temp}°C). Monitor delicate crops for cold or frost stress.`,
          type: "warning"
        });
      }

      if (humidity > 80) {
        list.push({
          icon: Leaf,
          text: `High relative humidity (${humidity}%). Elevates fungal infection risk; inspect leaf undersides.`,
          type: "warning"
        });
      }
    }

    return list;
  };

  const advisories = getAdvisories();

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3 shadow-xs">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span>{lang === 'kn' ? "ಹೊಲದ ವಿಶೇಷ ಸಲಹೆಗಳು" : lang === 'hi' ? "खेत के लिए विशेष सलाह" : "Actionable Farm Advisories"}</span>
      </h3>

      <div className="flex flex-col gap-2.5">
        {advisories.map((adv, idx) => {
          const IconComponent = adv.icon;
          let colorClass = "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300";
          if (adv.type === 'success') {
            colorClass = "border-primary/25 bg-primary/10 text-primary-900 dark:text-primary";
          }
          if (adv.type === 'danger') {
            colorClass = "border-destructive/25 bg-destructive/10 text-destructive";
          }

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg border text-xs font-medium leading-relaxed ${colorClass}`}
            >
              <IconComponent className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{adv.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
