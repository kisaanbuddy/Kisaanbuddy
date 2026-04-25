'use client';

import Link from 'next/link';
import { Leaf, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/weather', label: 'Weather' },
  { href: '/crop-predictor', label: 'AI Predictor' },
  { href: '/disease', label: 'Disease Detect' },
  { href: '/schemes', label: 'Schemes' },
  { href: '/mandi', label: 'Mandi' },
  { href: '/worker-connect', label: 'Worker Connect' },
  { href: '/chatbot', label: 'AI Chatbot' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
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

  return (
    <>
      <header className="sticky top-4 z-50 mx-4 md:mx-auto max-w-6xl w-[calc(100%-2rem)] md:w-full glass-panel flex h-16 items-center justify-between px-4 md:px-6 transition-all">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight"
          onClick={() => setOpen(false)}
        >
          <Leaf className="h-6 w-6 text-green-500" />
          <span>
            Krishi<span className="text-green-500">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
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

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <div className="hidden md:block h-8 w-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 border-2 border-white/20 shadow-inner"></div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-white/10 transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay + panel */}
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
            {NAV_LINKS.map((link) => {
              const active =
                link.href === '/'
                  ? pathname === '/'
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
          </nav>
        </>
      )}
    </>
  );
}
