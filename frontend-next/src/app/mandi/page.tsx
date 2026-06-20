import type { Metadata } from 'next';
import MandiClient from './MandiClient';

export const metadata: Metadata = {
  title: 'Live Mandi Prices & Market Rates | मंडी भाव',
  description: 'Track real-time eNAM mandi market rates for crops across India. Get historical price charts, daily trends, and volume indicators.',
  alternates: {
    canonical: '/mandi',
  },
  openGraph: {
    title: 'Live Mandi Prices & Market Rates | मंडी भाव',
    description: 'Track real-time eNAM mandi market rates for crops across India. Get historical price charts, daily trends, and volume indicators.',
    url: '/mandi',
    type: 'website',
  },
};

export default function MandiPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy Live Mandi Prices Index",
    "url": "https://kisaanbuddy.com/mandi",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "description": "Live APMC Mandi Market Prices Tracker. Get real-time commodity trading rates, daily models, volumes, and MSP benchmarks across Indian states."
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Minimum Support Price (MSP) in mandi trading?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MSP is the guaranteed price floor set by the government to buy crops from farmers, ensuring they do not suffer losses if open market rates crash."
        }
      },
      {
        "@type": "Question",
        "name": "How does eNAM portal benefit farmers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "eNAM integrates APMC mandis across India online, encouraging transparent auctions, accurate weighing, and direct electronic payouts."
        }
      },
      {
        "@type": "Question",
        "name": "What is the Modal Price in daily mandi reports?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Modal Price is the most frequently occurring transaction price for a commodity in a specific mandi on a given day."
        }
      },
      {
        "@type": "Question",
        "name": "How can farmers fetch premium rates for grains in mandis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "By drying grains to 12-14% moisture content and removing foreign matter (stones, chaff) before bringing them to the auction."
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
      <MandiClient />

      {/* SSR Static SEO & Educational Content for AdSense / Search Engine indexing */}
      <article className="border-t border-border/20 pt-10 mt-16 max-w-5xl mx-auto px-4 pb-12 text-sm text-muted-foreground/90 leading-relaxed space-y-8">
        <header className="space-y-3">
          <h2 className="text-2xl font-bold font-display text-foreground">🌾 Indian Mandi Prices, MSP & APMC Market Rates Guide</h2>
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Live Agricultural Commodities Trading Guide · मंडी भाव निर्देशिका</p>
        </header>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">1. Understanding the APMC Mandi System in India</h3>
          <p>
            The Agricultural Produce Market Committee (APMC) is a marketing board established by state governments in India to ensure farmers are safeguarded from exploitation by large retailers, and to keep the farm-to-retail price spread reasonable. 
            Mandis act as physical hubs where farmers bring their harvested produce to be auctioned to licensed traders and wholesalers.
          </p>
          <p>
            Prices in mandis fluctuate daily based on supply, demand, moisture content, and produce quality. 
            By staying updated on live mandi rates across neighboring districts, farmers can decide whether to sell their crops locally or transport them to a nearby market where demand and pricing are higher.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">2. What is Minimum Support Price (MSP)?</h3>
          <p>
            The Minimum Support Price (MSP) is a form of market intervention by the Government of India to insure agricultural producers against any sharp fall in agricultural prices. 
            The MSP is announced at the beginning of the sowing season for certain crops based on the recommendations of the Commission for Agricultural Costs and Prices (CACP).
          </p>
          <p>
            Government procurement agencies (like FCI) set up purchase centers inside APMC mandis to buy crops at MSP if the open-market auction price drops below this baseline. 
            Understanding MSP rates for major grains (like Paddy and Wheat) or oilseeds (like Mustard and Soybean) empowers farmers during negotiations with local traders.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">3. Leveraging eNAM (National Agriculture Market) for Better Pricing</h3>
          <p>
            The National Agriculture Market (eNAM) is a pan-India electronic trading portal that networks the existing APMC mandis to create a unified national market for agricultural commodities. 
            eNAM promotes uniformity in agriculture marketing by streamlining procedures, removing information asymmetry between buyers and sellers, and promoting real-time payment settlement directly into farmers' bank accounts.
          </p>
          <p>
            Through eNAM, a farmer in Bihar can receive bids from a trader in Haryana or Maharashtra. 
            This electronic bidding process eliminates cartels, ensures transparent weighing, and guarantees that payments are credited online within 24–48 hours of sale confirmation.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">4. Preparing Your Produce to Fetch Premium Rates</h3>
          <p>
            Mandi traders evaluate crop quality based on visual appearance, grain size, moisture level, and the presence of foreign matter (such as dirt, stones, and chaff). 
            Clean, dried grains fetch significantly higher auction rates compared to wet, uncleaned produce.
          </p>
          <p>
            <strong>Moisture Control:</strong> Grains must be sun-dried on tarpaulin sheets to bring moisture levels down to the recommended storage range (typically 12% to 14%). 
            Traders deduct weight or offer lower rates for damp grains because they are prone to fungal decay during transportation and storage.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">5. अक्सर पूछे जाने वाले प्रश्न (FAQ - Mandi Prices & Trading)</h3>
          <div className="grid gap-6 md:grid-cols-2 text-xs">
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 1. मंडी में न्यूनतम समर्थन मूल्य (MSP) का क्या महत्व है?</h4>
              <p className="text-muted-foreground">उत्तर: MSP सरकार द्वारा तय की गई वह न्यूनतम कीमत है जिस पर सरकारी एजेंसियां किसानों से फसल खरीदती हैं। यह बाजार में कीमतों की भारी गिरावट से किसानों को सुरक्षा प्रदान करता है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 2. ई-नाम (eNAM) पोर्टल से जुड़ने के क्या फायदे हैं?</h4>
              <p className="text-muted-foreground">उत्तर: ई-नाम से किसान देश भर के खरीदारों से जुड़ सकते हैं। इससे उन्हें सही तौल, पारदर्शी नीलामी और फसल बेचने के तुरंत बाद बैंक खाते में सीधा भुगतान मिलता है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 3. "मॉडल मूल्य" (Modal Price) क्या होता है?</h4>
              <p className="text-muted-foreground">उत्तर: मॉडल मूल्य वह औसत मूल्य है जिस पर मंडी में किसी दिन सबसे अधिक मात्रा में फसल की खरीद-बिक्री हुई हो। यह बाजार की वास्तविक स्थिति दर्शाता है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 4. मंडी में अपनी फसल का अधिकतम दाम कैसे पाएं?</h4>
              <p className="text-muted-foreground">उत्तर: फसल को अच्छी तरह साफ करें, कंकड़-मिट्टी निकालें और धूप में सुखाकर उसमें नमी (Moisture) 12-14% तक लाएं। साफ और सूखी फसल को हमेशा ऊंचा दाम मिलता है।</p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
