'use client';

import { useEffect } from 'react';

export function DeferredAdSense() {
  useEffect(() => {
    // Only load in real production domains (not localhost/127.0.0.1) to follow AdSense policies and prevent main-thread contention
    if (
      typeof window === 'undefined' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      document.getElementById('google-adsense-script')
    ) {
      return;
    }

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
  }, []);

  return null;
}
