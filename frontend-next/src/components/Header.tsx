'use client';

import Link from 'next/link';
import {
  Leaf, Menu, X, LogOut, User as UserIcon,
  LayoutDashboard, CloudSun, Sprout, Bug,
  FileText, TrendingUp, Users, MessageSquare,
  Star, ChevronDown, BookOpen, FlaskConical, Landmark,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage, LANG_NAMES, LANG_FLAGS, type Lang } from '@/lib/language';
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

const PUBLIC_ROUTES = ['/', '/login', '/signup'];

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
        className={`sticky top-3 z-50 mx-3 md:mx-auto max-w-7xl w-[calc(100%-1.5rem)] md:w-full
          flex items-center justify-between px-3 md:px-5 transition-all duration-300
          ${scrolled
            ? 'glass-panel h-14 shadow-lg shadow-black/10'
            : 'glass-panel h-16'
          }`}
      >
        {/* ── Logo ── */}
        <Link
          href={user ? '/dashboard' : '/'}
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md shadow-green-500/30 group-hover:scale-110 transition-transform duration-200">
            <Leaf className="h-4.5 w-4.5 text-white" style={{ height: '1.1rem', width: '1.1rem' }} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-lg tracking-tight">
              Krishi<span className="text-green-500">AI</span>
            </span>
            {isPublic && !user && (
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Smart Farming
              </span>
            )}
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        {showFullNav && (
          <nav className="hidden lg:flex items-center gap-0.5 text-sm font-medium">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150
                  ${isActive(href)
                    ? 'bg-green-500/12 text-green-600 dark:text-green-400 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5'
                  }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
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
              className="flex items-center gap-1 h-8 rounded-lg border border-border/60 bg-background/50 px-2 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors"
            >
              {LANG_FLAGS[lang]} {LANG_NAMES[lang]}
            </button>
            {langOpen && (
              <>
                <button className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} aria-label="Close" />
                <div className="absolute right-0 top-10 z-50 w-36 rounded-xl border border-border/60 bg-popover shadow-xl overflow-hidden">
                  {(Object.keys(LANG_NAMES) as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangOpen(false) }}
                      className={"w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors " + (lang === l ? "bg-green-500/10 text-green-600 dark:text-green-400 font-semibold" : "text-foreground")}
                    >
                      {LANG_FLAGS[l]} {LANG_NAMES[l]}
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
              className="hidden md:inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap px-2 py-1 rounded-lg hover:bg-white/30 dark:hover:bg-white/5"
            >
              <Star className="h-3 w-3" /> {t("founders")}
            </Link>
          )}

          {/* Logged-out CTA */}
          {ready && !user && isPublic && pathname !== '/login' && (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow transition-all
                bg-gradient-to-r from-green-500 to-emerald-600
                hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/25
                active:scale-95"
            >
              Login
            </Link>
          )}

          {/* Logged-in user badge */}
          {ready && user && showFullNav && (
            <div className="hidden md:flex items-center gap-1.5">
              <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/8 dark:bg-green-500/10 px-3 py-1.5 text-sm cursor-default">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-[10px] font-bold shrink-0">
                  {initials}
                </div>
                <span className="font-medium max-w-[100px] truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground
                  hover:bg-red-500/10 hover:text-red-500 transition-colors"
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
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg
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
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden cursor-default"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <nav
            className="fixed top-[4.5rem] left-3 right-3 z-50 lg:hidden glass-panel p-3 flex flex-col gap-0.5 animate-slide-up max-h-[80vh] overflow-y-auto"
            aria-label="Mobile navigation"
          >
            {showFullNav ? (
              <>
                {/* User info row */}
                <div className="flex items-center gap-3 px-3 py-3 mb-1 rounded-xl bg-green-500/8 dark:bg-green-500/10 border border-green-500/15">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                  </div>
                </div>

                {/* Nav links */}
                {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                        ${active
                          ? 'bg-green-500/12 text-green-600 dark:text-green-400'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-white/5'
                        }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green-500" />}
                    </Link>
                  );
                })}

                {/* Founders */}
                <Link
                  href="/founders"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-white/5 transition-all"
                >
                  <Star className="h-4 w-4 shrink-0" />
                  Founders
                </Link>

                <div className="my-1 divider-gradient" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-green-500/25"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border-2 border-green-500 px-4 py-3 text-center text-sm font-semibold text-green-600 dark:text-green-400 hover:bg-green-500/5 transition-colors"
                >
                  Sign Up Free
                </Link>
                <Link
                  href="/founders"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-center text-sm font-medium text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="h-4 w-4" /> Meet the Founders
                </Link>
              </>
            )}
          </nav>
        </>
      )}
    </>
  );
}
