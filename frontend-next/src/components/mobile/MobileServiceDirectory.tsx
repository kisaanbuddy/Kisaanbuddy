"use client";
import Link from "next/link";
import { TrendingUp, ScanLine, MessagesSquare, Sprout, FlaskConical, NotebookPen, Tractor, Users, Landmark, BookOpen, UserRound, CircleHelp, ArrowUpRight, Satellite } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { DRAWER_I18N } from "@/lib/mobile-nav-i18n";

export const MOBILE_SERVICES = [
  { key: "cropDoctor", href: "/disease", icon: ScanLine, group: "crop" },
  { key: "cropRec", href: "/crop-predictor", icon: Sprout, group: "crop" },
  { key: "soilHealth", href: "/soil-health", icon: FlaskConical, group: "crop" },
  { key: "khetDiary", href: "/khet-diary", icon: NotebookPen, group: "crop" },
  { key: "satellite", href: "/satellite", icon: Satellite, group: "crop" },
  { key: "mandi", href: "/mandi", icon: TrendingUp, group: "info" },
  { key: "schemes", href: "/schemes", icon: Landmark, group: "info" },
  { key: "chatbot", href: "/chatbot", icon: MessagesSquare, group: "info" },
  { key: "marketplace", href: "/marketplace", icon: Tractor, group: "people" },
  { key: "workers", href: "/worker-connect", icon: Users, group: "people" },
  { key: "profile", href: "/profile", icon: UserRound, group: "account" },
  { key: "contact", href: "/contact", icon: CircleHelp, group: "account" },
  { key: "about", href: "/about", icon: BookOpen, group: "account" },
] as const;
export function MobileServiceDirectory({ compact = false }: { compact?: boolean }) {
  const { lang } = useLanguage();
  const dict = DRAWER_I18N[lang] || DRAWER_I18N.en;
  const hi = lang === "hi";
  const groups = compact ? ["primary"] : ["crop", "info", "people", "account"];
  const headings: Record<string, string> = { crop: dict.catCropCare, info: hi ? "जानकारी और सलाह" : "Information & advice", people: dict.catMarketCommerce, account: dict.catSupport };
  const primary = ["cropDoctor", "mandi", "marketplace", "chatbot"];
  return <div className="kb-service-directory">
    {groups.map(group => <section key={group}>
      {!compact && <h2 className="kb-section-title">{headings[group]}</h2>}
      <div className={compact ? "kb-service-grid" : "kb-service-list"}>
        {(compact ? primary.map(key => MOBILE_SERVICES.find(s => s.key === key)!) : MOBILE_SERVICES.filter(s => s.group === group)).map(({key,href,icon:Icon}) => <Link key={key} href={href} className="kb-service-link">
          <span className="kb-service-icon"><Icon size={24} strokeWidth={1.7} /></span><span>{dict.items[key].title}</span><ArrowUpRight size={16} className="kb-service-arrow" aria-hidden="true" />
        </Link>)}
        {!compact && group === "crop" && <Link href="/crops" className="kb-service-link"><span className="kb-service-icon"><BookOpen size={24} /></span><span>{hi ? "खेती की गाइड" : "Crop guide"}</span><ArrowUpRight size={16} className="kb-service-arrow" /></Link>}
        {!compact && group === "account" && <><Link href="/settings" className="kb-service-link">{hi ? "सेटिंग" : "Settings"}</Link><Link href="/madad" className="kb-service-link">{hi ? "इस्तेमाल में मदद" : "Help using KisaanBuddy"}</Link></>}
      </div>
    </section>)}
  </div>;
}
