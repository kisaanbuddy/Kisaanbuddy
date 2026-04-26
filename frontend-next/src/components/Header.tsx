'use client';

import Link from 'next/link';
import { Leaf, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth, logoutUser } from '@/lib/auth';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/weather', label: 'Weather' },
  { href: '/crop-predictor', label: 'AI Predictor' },
  { href: '/disease', label: 'Disease Detect' },
  { href: '/schemes', label: 'Schemes' },
  { href: '/mandi', label: 'Mandi' },
  { href: '/worker-connect', label: 'Worker Connect' },
  { href: '/chatbot', label: 'AI Chatbot' },
  { href: '/founders', label: 'Founders' },
];

// Routes that should always show the simple (logged-out) header chrome,
// regardless of auth state — landing, login, signup.
const PUBLIC_ROUTES = ['/', '/login', '/signup'];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isPublic = PUBLIC_ROUTES.includes(pathname || '');
  const showFullNav = !isPublic && !!user;

  function handleLogout() {
    logoutUser();
    setOpen(false);
    router.push('/');
  }

  return (
    <>
      <header className="sticky top-4 z-50 mx-4 md:mx-auto max-w-6xl w-[calc(100%-2rem)] md:w-full glass-panel flex h-16 items-center justify-between px-4 md:px-6 transition-all">
        <Link
          href={user ? '/dashboard' : '/'}
          className="flex items-center gap-2 font-bold text-xl tracking-tight"
          onClick={() => setOpen(false)}
        >
          <Leaf className="h-6 w-6 text-green-500" />
          <div className="flex flex-col leading-none">
            <span>
              Krishi<span className="text-green-500">AI</span>
            </span>
            {isPublic && !user && (
              <span className="text-[10px] font-medium text-muted-foreground tracking-wider">
                Empowering Farmers
              </span>
            )}
          </div>
        </Link>

        {/* Desktop nav — only when logged in & on a protected page */}
        {showFullNav && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />

          {/* Logged-out: show Founders + Login (visible on mobile + desktop) */}
          {ready && !user && isPublic && (
            <Link
              href="/founders"
              className="inline-flex items-center text-xs md:text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Founders
            </Link>
          )}
          {ready && !user && isPublic && pathname !== '/login' && (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-green-600 px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-semibold text-white shadow hover:bg-green-700 transition-all"
            >
              Login
            </Link>
          )}

          {/* Logged-in: show user avatar + logout (desktop) */}
          {ready && user && showFullNav && (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-sm">
                <UserIcon className="h-4 w-4 text-green-600" />
                <span className="font-medium">{user.name || user.email.split('@')[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Mobile hamburger — only when there's a nav to show OR user is logged out */}
          {(showFullNav || (!user && isPublic && pathname !== '/login')) && (
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-white/10 transition-colors"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden cursor-default"
            onClick={() => setOpen(false)}
          />
          <nav
            className="fixed top-24 left-4 right-4 z-50 glass-panel p-3 flex flex-col gap-1 md:hidden"
            aria-label="Mobile navigation"
          >
            {showFullNav ? (
              <>
                {NAV_LINKS.map((link) => {
                  const active =
                    link.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname?.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-green-500/15 text-primary'
                          : 'text-muted-foreground hover:text-primary hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="my-2 border-t border-white/10" />
                <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>{user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-md border-2 border-green-600 px-4 py-3 text-center text-sm font-semibold text-green-600"
                >
                  Sign Up Free
                </Link>
                <Link
                  href="/founders"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-4 py-3 text-center text-sm font-medium text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors"
                >
                  Meet the Founders
                </Link>
              </>
            )}
          </nav>
        </>
      )}
    </>
  );
}
