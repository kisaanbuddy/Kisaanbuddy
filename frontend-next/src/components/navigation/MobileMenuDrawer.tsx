"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Home,
  TrendingUp,
  Store,
  Users,
  Wrench,
  Bug,
  Sprout,
  FlaskConical,
  CloudSun,
  Layers,
  Tractor,
  Droplets,
  Wheat,
  UserCheck,
  Landmark,
  BookOpen,
  LayoutDashboard,
  User,
  Mic,
  Info,
  Phone,
  Shield,
  FileText,
  Globe,
  LogIn,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMobileMenu } from "./MobileMenuContext";
import { useLanguage, LANG_NAMES, type Lang } from "@/lib/language";
import { useAuth } from "@/lib/auth";
import { DRAWER_I18N } from "@/lib/mobile-nav-i18n";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MobileMenuDrawer() {
  const { isOpen, closeMenu } = useMobileMenu();
  const pathname = usePathname();
  const { lang, openLanguageModal } = useLanguage();
  const { user } = useAuth();
  const drawerRef = useRef<HTMLDivElement>(null);

  const dict = DRAWER_I18N[lang as Lang] || DRAWER_I18N.en;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeMenu]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const initials = user
    ? (user.name || user.email || "U")
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const isCurrent = (href: string) => {
    const base = href.split("?")[0];
    if (base === "/") return pathname === "/" || pathname === "";
    return pathname === base || pathname?.startsWith(base + "/");
  };

  const navSections = [
    {
      title: dict.catPrimary,
      items: [
        {
          href: "/",
          icon: Home,
          title: dict.items.home.title,
          desc: dict.items.home.desc,
          color: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60",
        },
        {
          href: "/mandi",
          icon: TrendingUp,
          title: dict.items.mandi.title,
          desc: dict.items.mandi.desc,
          color: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60",
          badge: "Live APMC",
        },
        {
          href: "/marketplace",
          icon: Store,
          title: dict.items.marketplace.title,
          desc: dict.items.marketplace.desc,
          color: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60",
        },
        {
          href: "/worker-connect",
          icon: Users,
          title: dict.items.workers.title,
          desc: dict.items.workers.desc,
          color: "text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60",
        },
        {
          href: "/features",
          icon: Wrench,
          title: dict.items.tools.title,
          desc: dict.items.tools.desc,
          color: "text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60",
        },
      ],
    },
    {
      title: dict.catCropCare,
      items: [
        {
          href: "/disease",
          icon: Bug,
          title: dict.items.cropDoctor.title,
          desc: dict.items.cropDoctor.desc,
          color: "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60",
          badge: "AI Scan",
        },
        {
          href: "/crop-predictor",
          icon: Sprout,
          title: dict.items.cropRec.title,
          desc: dict.items.cropRec.desc,
          color: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/60",
        },
        {
          href: "/soil-health",
          icon: FlaskConical,
          title: dict.items.soilHealth.title,
          desc: dict.items.soilHealth.desc,
          color: "text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60",
        },
        {
          href: "/weather",
          icon: CloudSun,
          title: dict.items.weather.title,
          desc: dict.items.weather.desc,
          color: "text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60",
        },
        {
          href: "/satellite",
          icon: Layers,
          title: dict.items.satellite.title,
          desc: dict.items.satellite.desc,
          color: "text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60",
        },
      ],
    },
    {
      title: dict.catMarketCommerce,
      items: [
        {
          href: "/marketplace?tab=equipment",
          icon: Tractor,
          title: dict.items.equipment.title,
          desc: dict.items.equipment.desc,
          color: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60",
        },
        {
          href: "/marketplace?category=irrigation",
          icon: Droplets,
          title: dict.items.irrigation.title,
          desc: dict.items.irrigation.desc,
          color: "text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60",
        },
        {
          href: "/marketplace?category=seeds",
          icon: Wheat,
          title: dict.items.seeds.title,
          desc: dict.items.seeds.desc,
          color: "text-lime-700 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/60",
        },
      ],
    },
    {
      title: dict.catLabourSchemes,
      items: [
        {
          href: "/worker-connect?tab=worker_portal",
          icon: UserCheck,
          title: dict.items.workerReg.title,
          desc: dict.items.workerReg.desc,
          color: "text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60",
          badge: "Register",
        },
        {
          href: "/schemes",
          icon: Landmark,
          title: dict.items.schemes.title,
          desc: dict.items.schemes.desc,
          color: "text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60",
        },
      ],
    },
    {
      title: dict.catRecords,
      items: [
        {
          href: "/khet-diary",
          icon: BookOpen,
          title: dict.items.khetDiary.title,
          desc: dict.items.khetDiary.desc,
          color: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60",
        },
        {
          href: "/dashboard",
          icon: LayoutDashboard,
          title: dict.items.dashboard.title,
          desc: dict.items.dashboard.desc,
          color: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60",
        },
        {
          href: "/profile",
          icon: User,
          title: dict.items.profile.title,
          desc: dict.items.profile.desc,
          color: "text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800",
        },
        {
          href: "/chatbot",
          icon: Mic,
          title: dict.items.chatbot.title,
          desc: dict.items.chatbot.desc,
          color: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60",
          badge: "24x7",
        },
      ],
    },
    {
      title: dict.catSupport,
      items: [
        {
          href: "/about",
          icon: Info,
          title: dict.items.about.title,
          desc: dict.items.about.desc,
          color: "text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800",
        },
        {
          href: "/contact",
          icon: Phone,
          title: dict.items.contact.title,
          desc: dict.items.contact.desc,
          color: "text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800",
        },
        {
          href: "/privacy",
          icon: Shield,
          title: dict.items.privacy.title,
          desc: dict.items.privacy.desc,
          color: "text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800",
        },
        {
          href: "/terms",
          icon: FileText,
          title: dict.items.terms.title,
          desc: dict.items.terms.desc,
          color: "text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800",
        },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMenu}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
            aria-hidden="true"
          />

          {/* Slide-out Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 bottom-0 left-0 z-50 w-[86%] max-w-[340px] bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col md:hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] select-none"
            role="dialog"
            aria-modal="true"
            aria-label={dict.menuTitle}
          >
            {/* Top Bar: Brand Logo & Close Button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/60 shrink-0">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-black text-sm shadow-xs">
                  🌾
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-extrabold text-base tracking-tight text-stone-900 dark:text-white">
                    Kisaan<span className="text-emerald-700 dark:text-emerald-400">Buddy</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium leading-none">
                    Agriculture Platform
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={closeMenu}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 active:scale-95 transition"
                aria-label={dict.closeMenu}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Greeting & Status Card */}
            <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-emerald-50/50 dark:bg-emerald-950/20 shrink-0">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-stone-800 border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs hover:border-emerald-500 transition group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                        {user.name || user.email || dict.welcomeFarmer}
                      </p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                        {dict.myAccount}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              ) : (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                      {dict.welcomeFarmer}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">
                      {dict.guestSubtitle}
                    </p>
                  </div>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs shrink-0 active:scale-95 transition"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>{dict.loginBtn}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Scrollable Navigation Sections */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 text-xs scrollbar-thin">
              {navSections.map((sec) => (
                <div key={sec.title} className="space-y-1">
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    {sec.title}
                  </p>
                  <div className="space-y-0.5">
                    {sec.items.map((item) => {
                      const active = isCurrent(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenu}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-xl transition ${
                            active
                              ? "bg-emerald-700 text-white font-bold shadow-xs"
                              : "text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                active
                                  ? "bg-white/20 text-white"
                                  : item.color
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="block text-xs leading-tight truncate">
                                {item.title}
                              </span>
                              <span
                                className={`block text-[10px] leading-tight truncate ${
                                  active
                                    ? "text-white/80"
                                    : "text-stone-400 dark:text-stone-500"
                                }`}
                              >
                                {item.desc}
                              </span>
                            </div>
                          </div>
                          {item.badge && !active && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 shrink-0 ml-1">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions: Language Selector, Theme & Kisan Helpline */}
            <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-850 space-y-2 shrink-0">
              <div className="flex items-center justify-between gap-2">
                {/* Language Switcher Pill */}
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    openLanguageModal();
                  }}
                  className="flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 transition active:scale-95"
                  aria-label="Change language"
                >
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{LANG_NAMES[lang as Lang] || "Language"}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                    बदलें
                  </span>
                </button>

                {/* Theme Toggle */}
                <div className="flex items-center">
                  <ThemeToggle />
                </div>
              </div>

              {/* Official Kisan Call Center Helpline */}
              <a
                href="tel:18001801551"
                className="flex items-center justify-between p-2 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 text-[11px] font-semibold hover:bg-emerald-200/70 transition"
              >
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{dict.helplineTitle}</span>
                </div>
                <span className="font-bold text-xs shrink-0">1800-180-1551</span>
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
