'use client';

import Link from 'next/link';
import {
  Leaf, Menu, X, LogOut, User as UserIcon,
  LayoutDashboard, CloudSun, Sprout, Bug,
  FileText, TrendingUp, Users, MessageSquare,
  Star, ChevronDown, BookOpen, FlaskConical, Landmark, Cpu,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage, LANG_NAMES, type Lang } from '@/lib/language';
import { useAuth, logoutUser } from '@/lib/auth';

const NAV_LINK_DEFS = [
  { href: '/dashboard',      key: 'dashboard',      icon: LayoutDashboard },
  { href: '/weather',        key: 'weather',        icon: CloudSun        },
  { href: '/crop-predictor', key: 'aiPredictor',    icon: Sprout          },
  { href: '/disease',        key: 'diseaseDetect',  icon: Bug             },
  { href: '/khet-diary',     key: 'khetDiary',      icon: BookOpen        },
  { href: '/soil-health',    key: 'soilHealth',     icon: FlaskConical    },
  { href: '/schemes',        key: 'schemes',        icon: Landmark        },
  { href: '/mandi',          key: 'mandi',          icon: TrendingUp      },
  { href: '/worker-connect', key: 'workers',        icon: Users           },
  { href: '/chatbot',        key: 'aiChatbot',      icon: MessageSquare   },
] as const;

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/hardware', '/about', '/contact', '/privacy', '/terms', '/disclaimer', '/cookie-policy'];

function LangFlag({ lang }: { lang: Lang }) {
  const { t } = useLanguage()
  if (lang === 'en') {
    return (
      <svg className="h-3.5 w-5 rounded-sm shrink-0 border border-black/10 dark:border-white/10" viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0h60v30H0z" fill="#012169"/>
        <path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6"/>
        <path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
      </svg>
    );
  }
  return (
    <svg className="h-3.5 w-5 rounded-sm shrink-0 border border-black/10 dark:border-white/10" viewBox="0 0 900 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0h900v200H0z" fill="#FF9933"/>
      <path d="M0 200h900v200H0z" fill="#fff"/>
      <path d="M0 400h900v200H0z" fill="#138808"/>
      <circle cx="450" cy="300" r="80" stroke="#000080" strokeWidth="10"/>
      <circle cx="450" cy="300" r="10" fill="#000080"/>
      <line x1="450" y1="220" x2="450" y2="380" stroke="#000080" strokeWidth="6"/>
      <line x1="370" y1="300" x2="530" y2="300" stroke="#000080" strokeWidth="6"/>
      <line x1="393.4" y1="243.4" x2="506.6" y2="356.6" stroke="#000080" strokeWidth="6"/>
      <line x1="393.4" y1="356.6" x2="506.6" y2="243.4" stroke="#000080" strokeWidth="6"/>
    </svg>
  );
}

export function Header() {
  const [open, setOpen]           = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const pathname                  = usePathname();
  const router                    = useRouter();
  const { user, ready }           = useAuth()
  const { lang, setLang, t }        = useLanguage()
  const [langOpen, setLangOpen]     = useState(false)
  const NAV_LINKS = NAV_LINK_DEFS.map(d => ({ href: d.href, label: t(d.key as any) as string, icon: d.icon }));

  /* close drawer on route change */
  useEffect(() => { setOpen(false); }, [pathname]);

  /* body scroll lock when drawer open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* shrink header on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isPublic    = PUBLIC_ROUTES.includes(pathname || '');
  const showFullNav = !isPublic;

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href) ?? false;
  }

  function handleLogout() {
    logoutUser();
    setOpen(false);
    router.push('/');
  }

  /* user initials for avatar */
  const initials = user
    ? (user.name || user.email || 'U')
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <>
      <header
        className={`sticky top-3 z-50 mx-3 md:mx-auto max-w-7xl w-[calc(100%-1.5rem)] md:w-full h-14
          flex items-center justify-between px-4 md:px-6 transition-all duration-500 rounded-2xl
          ${scrolled
            ? 'glass-panel shadow-lg shadow-black/5 dark:shadow-emerald-950/5 backdrop-blur-xl border-emerald-500/10'
            : 'glass-panel border-transparent bg-transparent backdrop-blur-none shadow-none'
          }`}
      >
        {/* ── Logo ── */}
        <Link
          href={user ? '/dashboard' : '/'}
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 shrink-0 group select-none"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/20 border border-white/10 group-hover:scale-105 group-hover:border-primary/30 transition-all duration-300 overflow-hidden p-1">
            <img src="/icon-logo.png" alt="Kisaan Buddy Icon" className="h-full w-full object-contain dark:brightness-110" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg tracking-tight">
              <span className="font-black text-foreground">Kisaan</span>
              <span className="font-light text-primary">Buddy</span>
            </span>
            {isPublic && !user && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80">
                Smart Farming
              </span>
            )}
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        {showFullNav && (
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300
                  ${isActive(href)
                    ? 'glass-pill-active text-emerald-500 font-bold scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40 dark:hover:bg-white/5'
                  }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* ── Right side ── */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <ThemeToggle />

          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1.5 h-9 rounded-xl border border-border/40 bg-background/30 px-2.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition-all duration-200 backdrop-blur-sm select-none"
            >
              <LangFlag lang={lang} />
              <span>{LANG_NAMES[lang]}</span>
              <ChevronDown className={`h-3 w-3 text-muted-foreground/75 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            {langOpen && (
              <>
                <button className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} aria-label={t("header.close")} />
                <div className="absolute right-0 top-11 z-50 w-38 rounded-xl border border-border/40 bg-popover/90 backdrop-blur-md shadow-xl overflow-hidden animate-fade-in p-1">
                  {(Object.keys(LANG_NAMES) as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangOpen(false) }}
                      className={"w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors " + (lang === l ? "bg-emerald-500/10 text-emerald-500 font-semibold" : "text-foreground hover:bg-muted/50")}
                    >
                      <LangFlag lang={l} /> <span>{LANG_NAMES[l]}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Founders link — always visible on desktop */}
          {pathname !== '/founders' && (
            <Link
              href="/founders"
              className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-emerald-500 transition-colors whitespace-nowrap px-3 py-2 rounded-xl hover:bg-background/40 dark:hover:bg-white/5 select-none"
            >
              <Star className="h-3 w-3 text-amber-500 animate-pulse-glow rounded-full" /> {t("founders")}
            </Link>
          )}

          {/* Hardware link — always visible on desktop */}
          {pathname !== '/hardware' && (
            <Link
              href="/hardware"
              className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-emerald-500 transition-colors whitespace-nowrap px-3 py-2 rounded-xl hover:bg-background/40 dark:hover:bg-white/5 select-none"
            >
              <Cpu className="h-3 w-3 text-emerald-500" /> {t("hardware")}
            </Link>
          )}

          {/* Logged-out CTA */}
          {ready && !user && isPublic && pathname !== '/login' && (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition-all duration-300
                bg-gradient-to-r from-emerald-500 to-teal-500
                hover:shadow-glow-primary hover:brightness-105 active:scale-95 select-none"
            >
              Login
            </Link>
          )}

          {/* Logged-in user badge */}
          {ready && user && showFullNav && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 dark:bg-emerald-500/5 px-2.5 py-1.5 text-xs hover:bg-emerald-500/10 transition-colors"
              >
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={t("header.profile")}
                    className="h-5 w-5 rounded-full object-cover shrink-0 border border-emerald-500/10"
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-[9px] font-extrabold shrink-0 shadow shadow-emerald-500/20">
                    {initials}
                  </div>
                )}
                <span className="font-semibold text-muted-foreground max-w-[90px] truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title={t("header.sign_out")}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground border border-transparent
                  hover:bg-red-500/10 hover:border-red-500/15 hover:text-red-500 transition-colors duration-200"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          {(showFullNav || (!user && isPublic && pathname !== '/login')) && (
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-background/30 backdrop-blur-sm
                text-foreground hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {open && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label={t("header.close_menu")}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden cursor-default transition-all duration-300"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <nav
            className="fixed top-[4.5rem] left-3 right-3 z-50 lg:hidden glass-panel rounded-2xl p-4 flex flex-col gap-1.5 animate-slide-up max-h-[82vh] overflow-y-auto border-emerald-500/10 shadow-2xl"
            aria-label={t("header.mobile_navigation")}
          >
            {showFullNav ? (
              <>
                {/* User info row */}
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors"
                >
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={t("header.profile")}
                      className="h-9 w-9 rounded-full object-cover shrink-0 border border-emerald-500/10"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-sm font-bold shrink-0 shadow shadow-emerald-500/25">
                      {initials}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
                  </div>
                </Link>

                {/* Nav links */}
                {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold transition-all duration-200
                        ${active
                          ? 'glass-pill-active text-emerald-500'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/5'
                        }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-emerald-500" />
                      {label}
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-glow" />}
                    </Link>
                  );
                })}

                {/* Founders */}
                <Link
                  href="/founders"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/5 transition-all duration-200"
                >
                  <Star className="h-4 w-4 shrink-0 text-amber-500" />
                  Founders
                </Link>

                {/* Hardware */}
                <Link
                  href="/hardware"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/5 transition-all duration-200"
                >
                  <Cpu className="h-4 w-4 shrink-0 text-emerald-500" />
                  {t("hardware")}
                </Link>

                <div className="my-2 divider-gradient" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 shrink-0 text-red-500" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-center text-xs font-semibold text-white shadow-lg shadow-emerald-500/25"
                >
                  Login
                </Link>
                <Link
                  href="/founders"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-center text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="h-4 w-4 text-amber-500" /> Meet the Founders
                </Link>
                <Link
                  href="/hardware"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-center text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Cpu className="h-4 w-4 text-emerald-500" /> Smart Farm Hub
                </Link>
              </>
            )}
          </nav>
        </>
      )}
    </>
  );
}
