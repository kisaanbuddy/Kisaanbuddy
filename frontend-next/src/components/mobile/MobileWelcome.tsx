"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language";
import { DRAWER_I18N } from "@/lib/mobile-nav-i18n";
import { AnnouncementPopup } from "@/components/announcement/AnnouncementPopup";
import { MOBILE_SERVICES } from "./MobileServiceDirectory";

export const MOBILE_WELCOME_KEY = "kisaanbuddy_mobile_services_seen_v1";
export const WELCOME_SERVICE_KEYS = ["cropDoctor", "workers", "mandi", "marketplace", "schemes", "cropRec", "chatbot", "soilHealth", "khetDiary"] as const;
export function shouldShowMobileWelcome(input: { mobile: boolean; ready: boolean; languageSelected: boolean; languageOpen: boolean; seen: boolean; pathname: string }) {
  return input.mobile && input.ready && input.languageSelected && !input.languageOpen && !input.seen && !/^\/(admin|login|signup|reset-password)(?:\/|$)/.test(input.pathname);
}

function MobileServicesWelcome() {
  const { lang, isReady, isLanguageSelected, isLanguageModalOpen } = useLanguage();
  const pathname = usePathname() || "/";
  const dialog = useRef<HTMLDialogElement>(null);
  const seen = useRef(false);
  const hi = lang === "hi";
  const dict = DRAWER_I18N[lang] || DRAWER_I18N.en;
  useEffect(() => {
    let stored = false;
    try { stored = sessionStorage.getItem(MOBILE_WELCOME_KEY) === "true"; } catch { /* Per-mount ref still prevents repeat prompts. */ }
    if (!shouldShowMobileWelcome({mobile: window.matchMedia("(max-width: 767px)").matches, ready:isReady, languageSelected:isLanguageSelected, languageOpen:isLanguageModalOpen, seen:seen.current || stored, pathname})) return;
    const modal = dialog.current;
    if (!modal) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    let opened = false;
    const restore = () => { if (!opened) return; document.body.style.overflow = oldOverflow; if (previous?.isConnected) previous.focus(); opened = false; };
    // Defer one task so Strict Mode's setup/cleanup probe cannot consume the welcome.
    const timer = window.setTimeout(() => {
      modal.showModal(); opened = true;
      document.body.style.overflow = "hidden";
      seen.current = true;
      try { sessionStorage.setItem(MOBILE_WELCOME_KEY,"true"); } catch { /* Storage is optional. */ }
    }, 0);
    modal.addEventListener("close",restore);
    return () => { window.clearTimeout(timer); modal.removeEventListener("close",restore); modal.close(); restore(); };
  }, [isReady,isLanguageSelected,isLanguageModalOpen,pathname]);
  const close = () => dialog.current?.close();
  return <dialog ref={dialog} className="kb-welcome-dialog" aria-labelledby="mobile-welcome-title" aria-describedby="mobile-welcome-description" onClick={e=>{if(e.target === e.currentTarget) close();}}>
    <div className="kb-welcome-heading"><div><p className="kb-eyebrow">KISAANBUDDY</p><h2 id="mobile-welcome-title">{hi ? "आज किस काम में मदद चाहिए?" : "What can we help with today?"}</h2></div><button type="button" autoFocus onClick={close} className="kb-icon-button" aria-label={hi ? "बंद करें" : "Close services"}><X size={22}/></button></div>
    <p id="mobile-welcome-description">{hi ? "खेती, मजदूर, मशीन और योजनाएँ—अपनी सेवा चुनें।" : "Farming, labour, equipment and schemes. Choose a service."}</p>
    <div className="kb-welcome-grid">{WELCOME_SERVICE_KEYS.map(key=>{
      const service=MOBILE_SERVICES.find(item=>item.key===key)!; const Icon=service.icon;
      return <Link key={key} href={service.href} onClick={close}><Icon size={24} aria-hidden="true"/><span>{key === "workers" ? (hi ? "AgriLabour · मजदूर" : "AgriLabour · Workers") : dict.items[key].title}</span></Link>;
    })}</div>
    <Link href="/features" className="kb-all-services" onClick={close}>{hi ? "सभी सेवाएँ देखें" : "View all services"}<ArrowRight size={18}/></Link>
    <button type="button" onClick={close} className="kb-welcome-later">{hi ? "बाद में · वेबसाइट देखें" : "Maybe later · Continue browsing"}</button>
  </dialog>;
}
/** Unsolicited launch/welcome popups removed for a product-first experience. */
export function ResponsiveWelcome() {
  return null;
}
