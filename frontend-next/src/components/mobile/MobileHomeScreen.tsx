"use client";
import Link from "next/link";
import { ArrowRight, Mic, MapPin, NotebookPen } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { DRAWER_I18N } from "@/lib/mobile-nav-i18n";
import { openVoiceAssistant } from "@/components/assistant/VoiceAssistantModal";
import { MobileServiceDirectory } from "./MobileServiceDirectory";

export function MobileHomeScreen() {
  const { lang } = useLanguage();
  const hi = lang === "hi";
  const dict = DRAWER_I18N[lang] || DRAWER_I18N.en;
  return <div className="kb-mobile-home md:hidden">
    <div className="kb-home-intro"><p className="kb-eyebrow">KISAANBUDDY</p><h1>{hi ? "खेती के टूल और मंडी भाव" : "Farm tools & market rates"}</h1><p>{hi ? "फसल जांच, मंडी भाव और कृषि सेवाएं।" : "Crop diagnosis, mandi prices, and farm services."}</p></div>
    <MobileServiceDirectory compact />
    <button className="kb-speak-card" type="button" onClick={() => openVoiceAssistant()}><span className="kb-speak-icon"><Mic size={25} /></span><span><strong>{hi ? "बोलकर पूछें" : "Ask by voice"}</strong><small>{hi ? "या अपना सवाल लिखें" : "Speak or type your question"}</small></span><ArrowRight size={20} /></button>
    <Link href="/features" className="kb-all-services">{hi ? "सभी सेवाएँ देखें" : "Explore all services"}<ArrowRight size={18} /></Link>
    <section className="kb-home-next"><h2 className="kb-section-title">{hi ? "अपने खेत के लिए" : "For your farm"}</h2>
      <Link href="/crop-predictor"><MapPin size={21} /><span><strong>{hi ? "फसल सलाहकार" : "Crop recommendation"}</strong><small>{hi ? "खेत के विवरण से उपयुक्त फसल जानें" : "Enter farm details for crop advice"}</small></span><ArrowRight size={16} /></Link>
      <Link href="/khet-diary"><NotebookPen size={21} /><span><strong>{dict.items.khetDiary.title}</strong><small>{hi ? "अपने खर्च और काम का रिकॉर्ड रखें" : "Keep your expenses and field notes together"}</small></span><ArrowRight size={16} /></Link>
    </section>
    <p className="kb-home-note">{hi ? "भाव संबंधित सेवा में स्रोत व अपडेट समय देखें। AI सलाह में अनिश्चितता हो सकती है।" : "Check sources and update times in each service. AI advice may be uncertain."}</p>
  </div>;
}
export function MobileServicesPage() {
  const {lang} = useLanguage();
  return <div className="kb-mobile-services md:hidden"><div className="kb-home-intro"><p className="kb-eyebrow">KISAANBUDDY</p><h1>{lang === "hi" ? "सभी सेवाएँ" : "All services"}</h1><p>{lang === "hi" ? "अपने काम की सेवा चुनें।" : "Choose the help you need."}</p></div><MobileServiceDirectory /></div>;
}
