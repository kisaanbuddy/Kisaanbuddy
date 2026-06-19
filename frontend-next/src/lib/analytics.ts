"use client"

export type AnalyticsEvent = 
  | { type: 'weather_search'; query: string; lang: string }
  | { type: 'mandi_search'; crop: string; state: string; lang: string }
  | { type: 'disease_upload'; fileName: string; cropType?: string }
  | { type: 'crop_prediction'; inputs: Record<string, any>; result: string }
  | { type: 'language_switch'; from: string; to: string }
  | { type: 'blog_read'; slug: string; title: string; category: string }
  | { type: 'whatsapp_share'; url: string; title: string }
  | { type: 'contact_submit'; formName: string; success: boolean }
  | { type: 'tool_interaction'; toolName: string; action: string }

export function trackEvent(event: AnalyticsEvent) {
  // 1. Log in console for development verification
  if (process.env.NODE_ENV !== 'production') {
    console.log(`%c[KisaanBuddy Analytics] %c${event.type}`, 'color: #10b981; font-weight: bold;', 'color: #ffffff;', event)
  }

  // 2. Google Analytics dataLayer push (for standard tag integrations)
  if (typeof window !== 'undefined') {
    try {
      const w = window as any
      w.dataLayer = w.dataLayer || []
      w.dataLayer.push({
        event: `kisaanbuddy_${event.type}`,
        event_data: event
      })

      // Standard Google Analytics event call
      if (typeof w.gtag === 'function') {
        w.gtag('event', event.type, {
          ...event,
          send_to: 'G-XXXXXXXXXX' // Placeholder for actual GA4 measurement ID
        })
      }
    } catch (err) {
      console.warn('Analytics push failed:', err)
    }
  }
}
