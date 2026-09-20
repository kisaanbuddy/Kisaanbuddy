'use client';

import Link from 'next/link';
import {
  Menu, X, LogOut, User as UserIcon,
  LayoutDashboard, CloudSun, Sprout, Bug,
  TrendingUp, Users, Mic, Star, ChevronDown,
  FlaskConical, Landmark, Search, Sparkles, Globe, Shield
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage, LANG_NAMES, SELECTABLE_LANGS, type Lang } from '@/lib/language';
import { useAuth, logoutUser } from '@/lib/auth';
import SearchModal from '@/components/SearchModal';
import { trackEvent } from '@/lib/analytics';

const NAV_LINK_DEFS = [
  { href: '/dashboard',      key: 'dashboard',      icon: LayoutDashboard },
  { href: '/weather',        key: 'weather',        icon: CloudSun        },
  { href: '/crop-predictor', key: 'aiPredictor',    icon: Sprout          },
  { href: '/disease',        key: 'diseaseDetect',  icon: Bug             },
  { href: '/soil-health',    key: 'soilHealth',     icon: FlaskConical    },
  { href: '/schemes',        key: 'schemes',        icon: Landmark        },
  { href: '/mandi',          key: 'mandi',          icon: TrendingUp      },
  { href: '/worker-connect', key: 'workers',        icon: Users           },
  { href: '/chatbot',        key: 'aiChatbot',      icon: Mic             },
] as const;

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/about', '/contact', '/privacy', '/terms', '/disclaimer', '/cookie-policy'];



export function Header() {
  const [open, setOpen]           = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const pathname                  = usePathname();
  const router                    = useRouter();
  const { user, ready }           = useAuth();
  const { lang, setLang, t }        = useLanguage();
  const [langOpen, setLangOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toolsOpen, setToolsOpen]   = useState(false);
  const NAV_LINKS = NAV_LINK_DEFS.map(d => ({ href: d.href, label: t(d.key as any) as string, icon: d.icon }));

  /* close drawer on route change */
  useEffect(() => { setOpen(false); setToolsOpen(false); }, [pathname]);

  /* Ctrl+K keyboard shortcut to toggle search modal */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* body scroll lock when drawer open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* scroll monitor */
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
        className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
          scrolled
            ? 'bg-background/90 backdrop-blur-md border-border/80 shadow-2xs'
            : 'bg-background/70 backdrop-blur-xs border-border/60'
        }`}
      >
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          {/* ── Logo ── */}
          <Link
            href={user ? '/dashboard' : '/'}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 shrink-0 group select-none"
          >
          <img
            src="/logo.jpeg"
            alt="KisaanBuddy Logo"
           className="w-7 h-7 object-contain"
          />
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg md:text-xl tracking-tight">
                <span className="font-extrabold text-foreground">Kisaan</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Buddy</span>
              </span>
              {isPublic && !user && (
                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  Smart Farming
                </span>
              )}
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          {showFullNav ? (
            <nav className="hidden lg:flex items-center gap-1 text-xs font-medium" aria-label="Primary navigation">
              {NAV_LINKS.slice(0, 4).map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors duration-150 ${
                    isActive(href)
                      ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{label}</span>
                </Link>
              ))}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setToolsOpen(value => !value)}
                  aria-expanded={toolsOpen}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  <span>{lang === 'hi' ? 'और टूल' : 'More tools'}</span><ChevronDown className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
                </button>
                {toolsOpen && (
                  <>
                    <button type="button" aria-label="Close tools menu" onClick={() => setToolsOpen(false)} className="fixed inset-0 z-40 cursor-default" />
                    <div className="absolute left-0 top-9 z-50 grid w-60 grid-cols-1 gap-1 rounded-xl border border-border bg-popover p-1.5 shadow-lg">
                      {NAV_LINKS.slice(4).map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} onClick={() => setToolsOpen(false)} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors ${isActive(href) ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground hover:bg-muted'}`}>
                          <Icon className="h-3.5 w-3.5 text-primary" /><span>{label}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold" aria-label="Public navigation">
              <Link href="/#features" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                {lang === 'hi' ? "सुविधाएं" : "Features"}
              </Link>
              <Link href="/mandi" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                {lang === 'hi' ? "मंडी भाव" : "Mandi"}
              </Link>
              <Link href="/weather" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                {lang === 'hi' ? "मौसम" : "Weather"}
              </Link>
              <Link href="/schemes" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                {lang === 'hi' ? "योजनाएं" : "Schemes"}
              </Link>
              <Link href="/about" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                {lang === 'hi' ? "हमारे बारे में" : "About"}
              </Link>
            </nav>
          )}

          {/* ── Right side controls ── */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Quick Search */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              title={t("ui.search.title")}
              className="flex h-8 items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-[11px]">{t("ui.search.label")}</span>
              <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-muted/60 px-1 font-mono text-[9px] text-muted-foreground">
                ⌘K
              </kbd>
            </button>
            
            <ThemeToggle />

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-1.5 h-8 rounded-lg border border-border/70 bg-card/60 px-2.5 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors"
                aria-expanded={langOpen}
              >
                <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">{LANG_NAMES[lang]}</span>
                <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-150 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <>
                  <button className="fixed inset-0 z-40 cursor-default" onClick={() => setLangOpen(false)} aria-label={t("header.close")} />
                  <div className="absolute right-0 top-10 z-50 w-36 rounded-xl border border-border bg-popover shadow-lg overflow-hidden p-1">
                    {SELECTABLE_LANGS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          trackEvent({ type: 'language_switch', from: lang, to: l });
                          setLang(l);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          lang === l
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-foreground hover:bg-muted/70 font-medium"
                        }`}
                      >
                        <span>{LANG_NAMES[l]}</span>
                        {lang === l && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Logged-out Login + Start Free CTAs */}
            {ready && !user && isPublic && pathname !== '/login' && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/80 border border-border/70 transition-all"
                >
                  {t("loginLabel")}
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-8 items-center justify-center rounded-lg bg-emerald-700 hover:bg-emerald-800 px-3.5 text-xs font-semibold text-white transition-colors"
                >
                  {lang === 'hi' ? "मुफ़्त शुरू करें" : "Start Free"}
                </Link>
              </div>
            )}

            {/* Logged-in user badge */}
            {ready && user && showFullNav && (
              <div className="hidden md:flex items-center gap-1">
                {user.role === "Admin" && (
                  <Link
                    href="/admin"
                    title="Admin Portal"
                    className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/60 px-2 py-1 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-muted/60 transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="hidden xl:inline">Admin</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg border border-border/80 bg-card/60 px-2 py-1 text-xs hover:border-primary/40 hover:bg-muted/60 transition-colors"
                >
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={t("header.profile")}
                      className="h-5 w-5 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                      {initials}
                    </div>
                  )}
                  <span className="font-medium text-foreground max-w-[90px] truncate">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title={t("header.sign_out")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            {(showFullNav || (!user && isPublic && pathname !== '/login')) && (
              <button
                type="button"
                aria-label={open ? t("ui.navigation.close_menu") : t("ui.navigation.open_menu")}
                aria-expanded={open}
                onClick={() => setOpen(v => !v)}
                className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-card/60 text-foreground hover:bg-muted transition-colors"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {open && (
        <>
          <button
            type="button"
            aria-label={t("header.close_menu")}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden cursor-default transition-opacity"
            onClick={() => setOpen(false)}
          />

          <nav
            className="fixed top-16 left-3 right-3 z-50 lg:hidden rounded-2xl border border-border bg-card p-4 shadow-xl flex flex-col gap-1.5 max-h-[82vh] overflow-y-auto"
            aria-label={t("header.mobile_navigation")}
          >
            {showFullNav ? (
              <>
                {/* User Info Row */}
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-2.5 mb-1 rounded-xl bg-muted/50 border border-border/60 hover:bg-muted transition-colors"
                >
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={t("header.profile")}
                      className="h-8 w-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">{user?.phone_number || user?.email}</span>
                  </div>
                </Link>

                {/* Nav Links */}
                <div className="grid grid-cols-1 gap-1 my-1">
                  {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                          active
                            ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                        <span>{label}</span>
                        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                      </Link>
                    );
                  })}
                </div>

                {user?.role === "Admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <Shield className="h-4 w-4 shrink-0 text-primary" />
                    <span>Admin Portal</span>
                  </Link>
                )}

                <Link
                  href="/founders"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <Star className="h-4 w-4 shrink-0 text-amber-500 fill-amber-500/20" />
                  <span>{t("founders")}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors mt-1"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>{t("logout")}</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-primary px-4 py-2.5 text-center text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                >
                  {t("loginLabel")}
                </Link>
                <Link
                  href="/founders"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-center text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                  <span>{t("founders")}</span>
                </Link>
              </div>
            )}
          </nav>
        </>
      )}

      {/* Global Search Modal Overlay */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
