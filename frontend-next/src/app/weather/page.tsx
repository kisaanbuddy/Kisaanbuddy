import type { Metadata } from 'next';
import WeatherClient from './WeatherClient';

export const metadata: Metadata = {
  title: 'Farm Weather Forecast | KisaanBuddy',
  description: 'Get real-time weather forecasts, humidity, wind speeds, and hyper-local agricultural weather advice for your crops.',
  alternates: {
    canonical: '/weather',
  },
  openGraph: {
    title: 'Farm Weather Forecast | KisaanBuddy',
    description: 'Get real-time weather forecasts, humidity, wind speeds, and hyper-local agricultural weather advice for your crops.',
    url: '/weather',
    type: 'website',
  },
};

export default function WeatherPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy Farm Weather Forecast",
    "url": "https://kisaanbuddy.com/weather",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5. Requires location access.",
    "description": "Hyper-local Farm Weather Forecasting Tool. Get real-time agricultural weather forecasts, humidity, wind speed, and tailored spray advisories."
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why is weather forecasting important for crops?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It helps in planning sowing, irrigation, fertilizer application, pesticide spraying, and harvesting to minimize crop damage and optimize costs."
        }
      },
      {
        "@type": "Question",
        "name": "Is it right or wrong to apply urea immediately after rain?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Wrong. Heavy rain washes away urea or washes it deep into the soil, away from the root zone, causing wastage."
        }
      },
      {
        "@type": "Question",
        "name": "When is the best time for pesticide spraying?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Morning or evening when wind speeds are calm and solar radiation is low to avoid chemical drift and leaf scorching."
        }
      },
      {
        "@type": "Question",
        "name": "How to protect crops from frost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Create smoke boundaries around the field or practice light evening irrigation to raise local temperatures and reduce frost impact."
        }
      }
    ]
  };

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <WeatherClient />

      {/* SSR Static SEO & Educational Content for AdSense / Search Engine indexing */}
      <article className="border-t border-border/20 pt-10 mt-16 max-w-5xl mx-auto px-4 pb-12 text-sm text-muted-foreground/90 leading-relaxed space-y-8">
        <header className="space-y-3">
          <h2 className="text-2xl font-bold font-display text-foreground">🌾 Farmers' Agricultural Weather Forecast & Crop Protection Guide</h2>
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Scientific Weather Advisory for Indian Farmers · कृषि मौसम सलाह</p>
        </header>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">1. Why Weather Monitoring is Critical for Indian Agriculture</h3>
          <p>
            Weather is the single most unpredictable factor in Indian agriculture. Over 60% of India's cultivable land depends directly on monsoon rains. Changing climate patterns have made weather forecasts and alerts essential tools for safeguarding investments. 
            Monitoring variables like temperature, relative humidity, precipitation, wind speed, and atmospheric pressure allows farmers to make informed, data-driven decisions that prevent crop failures and reduce waste.
          </p>
          <p>
            By leveraging advanced meteorology, farmers can predict extreme events such as hailstorms, sudden heatwaves, frost, and excessive rainfall. 
            Taking preventive measures, such as covering nursery beds, setting up windbreaks, or providing light irrigation, can mean the difference between a bumper harvest and total crop loss.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">2. Optimizing Irrigation and Fertilizer Application</h3>
          <p>
            Using real-time weather forecasts helps schedule irrigation efficiently. For example, scheduling watering right before a heavy downpour leads to soil erosion, fertilizer leaching, and waterlogging. 
            Conversely, withholding irrigation during dry, hot winds leads to moisture stress, which permanently stunts crop growth.
          </p>
          <p>
            <strong>Fertilizer Management:</strong> Applying chemical nitrogenous fertilizers (such as Urea) requires precise weather timing. 
            If applied during high wind speeds, granular urea can drift or volatilize into the atmosphere as ammonia gas. If applied right before heavy rainfall, the fertilizer is washed away into local water bodies, resulting in financial loss for the farmer and environmental pollution. 
            The ideal time to apply fertilizers is when the soil is moist and light rain or calm conditions are expected.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">3. Disease and Pest Management via Humidity & Temperature Alerts</h3>
          <p>
            Most fungal and bacterial plant pathogens thrive under specific microclimatic conditions. High relative humidity (above 85%) combined with moderate temperatures (20°C to 28°C) creates the perfect environment for diseases like late blight in potatoes, downy mildew in grapes, and rust in wheat.
          </p>
          <p>
            By monitoring these indices, farmers can apply preventive organic formulations (like neem oil or Trichoderma viride) or targeted crop protectors before the disease manifests visually. 
            Spraying crop protection chemicals during high wind speeds (&gt;15 km/h) or active rainfall must be avoided, as it leads to chemical drift and runoff, rendering the treatment ineffective.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">4. Harvest Scheduling and Post-Harvest Loss Prevention</h3>
          <p>
            A significant portion of agricultural loss in India occurs post-harvest. Sowing and harvesting are highly time-sensitive. Sowing too early in dry soil can lead to seed decay, while late harvesting during unexpected rainfall ruins grain quality.
          </p>
          <p>
            Harvesting mature crops during clear, dry weather ensures low grain moisture content (below 14% for most grains), which is essential for safe storage. 
            Storing grains with high moisture levels encourages mold growth and attracts storage pests like weevils, reducing the market value of the harvest.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">5. अक्सर पूछे जाने वाले प्रश्न (FAQ - Weather & Agriculture)</h3>
          <div className="grid gap-6 md:grid-cols-2 text-xs">
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 1. फसल के लिए मौसम का पूर्वानुमान क्यों महत्वपूर्ण है?</h4>
              <p className="text-muted-foreground">उत्तर: यह बुआई, सिंचाई, खाद डालने, कीटनाशकों के छिड़काव और कटाई की योजना बनाने में मदद करता है। इससे फसलों को होने वाले नुकसान को कम किया जा सकता है और लागत में बचत होती है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 2. बारिश के तुरंत बाद यूरिया डालना सही है या गलत?</h4>
              <p className="text-muted-foreground">उत्तर: गलत। भारी बारिश से यूरिया बह जाता है या मिट्टी में बहुत गहराई में चला जाता है, जिससे पौधों की जड़ों को पोषण नहीं मिल पाता और पैसा बर्बाद होता है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 3. छिड़काव (Spraying) के लिए सबसे अच्छा समय कौन सा है?</h4>
              <p className="text-muted-foreground">उत्तर: सुबह या शाम का समय जब हवा शांत हो और धूप तेज न हो। तेज हवा में दवाएं उड़ जाती हैं और तेज धूप में पत्तियां जल सकती हैं।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 4. पाले (Frost) से फसलों को कैसे बचाएं?</h4>
              <p className="text-muted-foreground">उत्तर: खेत के चारों ओर धुंआ करें या शाम को हल्की सिंचाई करें। इससे खेत का तापमान थोड़ा बढ़ जाता है और पाले का असर कम होता है।</p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
