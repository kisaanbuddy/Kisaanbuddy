'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Route protection for Google AdSense compliance.
 * Google AdSense publisher policies strictly prohibit placing advertisements on:
 * 1. Login, registration, password recovery, and OTP verification screens.
 * 2. Private AI assistant chat dialogues and personal conversation flows.
 * 3. Transaction-critical screens, order placements, and payment interfaces.
 * 4. Administrative and expert verification backends.
 * 5. Private personal farmer ledger and diary records.
 */
const PROHIBITED_AD_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/chat',
  '/chatbot',
  '/expert-dashboard',
  '/admin',
  '/orders',
  '/khet-diary',
  '/farmer-profile',
  '/profile',
  '/settings',
];

export function DeferredAdSense() {
  const pathname = usePathname();

  useEffect(() => {
    // Only load in real production domains (not localhost/127.0.0.1)
    if (
      typeof window === 'undefined' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      return;
    }

    // Check if the current route is in the prohibited list
    const isProhibited = PROHIBITED_AD_ROUTES.some(
      (route) => pathname === route || pathname?.startsWith(`${route}/`)
    );

    if (isProhibited) {
      // Remove any previously appended script on sensitive routes to protect compliance
      const existingScript = document.getElementById('google-adsense-script');
      if (existingScript) {
        existingScript.remove();
      }
      return;
    }

    if (document.getElementById('google-adsense-script')) return;

    const loadScript = () => {
      if (document.getElementById('google-adsense-script')) return;
      const script = document.createElement('script');
      script.id = 'google-adsense-script';
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3770486100255800';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    };

    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(loadScript, { timeout: 5000 });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const timer = setTimeout(loadScript, 4000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return null;
}
