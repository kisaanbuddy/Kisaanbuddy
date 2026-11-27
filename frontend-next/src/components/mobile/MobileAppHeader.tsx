"use client";
import Link from "next/link";
import { ArrowLeft, Globe, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage, LANG_NAMES } from "@/lib/language";
import { useAuth } from "@/lib/auth";

export function MobileAppHeader() {
  const pathname = usePathname();
  const { lang, openLanguageModal } = useLanguage();
  const { user } = useAuth();
  const hi = lang === "hi";
  return <header className="kb-mobile-header md:hidden">
    <div className="kb-mobile-header-row">
      {pathname !== "/" && <Link href={pathname === "/features" ? "/" : "/features"} className="kb-icon-button" aria-label={pathname === "/features" ? (hi ? "होम पर जाएँ" : "Back to home") : (hi ? "सभी सेवाओं पर जाएँ" : "Back to services")}><ArrowLeft size={20} /></Link>}
      <Link href="/" className="kb-mobile-brand" aria-label="KisaanBuddy home"><img src="/logo.webp" width={32} height={32} alt="" /><span>Kisaan<span className="text-emerald-700 dark:text-emerald-400">Buddy</span></span></Link>
      <div className="kb-mobile-header-actions">
        <button type="button" onClick={openLanguageModal} className="kb-language-button" aria-label={hi ? "भाषा चुनें" : "Choose language"}><Globe size={17} /><span>{LANG_NAMES[lang]}</span></button>
        <Link href={user ? "/profile" : "/login"} className="kb-icon-button" aria-label={hi ? "मेरा खाता" : "My account"}><UserRound size={20} /></Link>
      </div>
    </div>
  </header>;
}
