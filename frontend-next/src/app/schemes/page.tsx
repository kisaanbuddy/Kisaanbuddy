import type { Metadata } from 'next';
import SchemesClient from './SchemesClient';

export const metadata: Metadata = {
  title: 'Government Agriculture Schemes Eligibility | सरकारी योजनाएं',
  description: 'Search and find government agricultural schemes, subsidy eligibilities, PM-KISAN tracking, and soil testing benefits for Indian farmers.',
  alternates: {
    canonical: '/schemes',
  },
  openGraph: {
    title: 'Government Agriculture Schemes Eligibility | सरकारी योजनाएं',
    description: 'Search and find government agricultural schemes, subsidy eligibilities, PM-KISAN tracking, and soil testing benefits for Indian farmers.',
    url: '/schemes',
    type: 'website',
  },
};

export default function SchemesPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy Govt Schemes Advisor",
    "url": "https://kisaanbuddy.com/schemes",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "description": "Indian Government Agricultural Schemes Database. Check eligibility, benefits, and documents required for schemes like PM-Kisan, KCC, PM-Kusum, and PMFBY."
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Who is not eligible for the PM-Kisan scheme?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Institutional landholders, income tax payers, serving or retired government employees (except Group D/Class IV), and pensioners receiving over Rs 10,000 per month are not eligible."
        }
      },
      {
        "@type": "Question",
        "name": "How to claim crop insurance under PMFBY?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "In case of crop loss due to localized calamities (hailstorms, waterlogging, etc.), the farmer must notify the insurance company or local agriculture officer within 72 hours."
        }
      },
      {
        "@type": "Question",
        "name": "What is the loan limit under the Kisan Credit Card (KCC) scheme?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The loan limit is decided based on land acreage, crops cultivated, and past credit history. KCC loans up to Rs 1.60 Lakh do not require collateral."
        }
      },
      {
        "@type": "Question",
        "name": "How do you apply for solar pump subsidy under PM-KUSUM?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Farmers can apply online via the official portal of their respective state new & renewable energy departments (e.g. UPNEDA, HAREDA, RRECL)."
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
      <SchemesClient />

      {/* SSR Static SEO & Educational Content for AdSense / Search Engine indexing */}
      <article className="border-t border-border/20 pt-10 mt-16 max-w-5xl mx-auto px-4 pb-12 text-sm text-muted-foreground/90 leading-relaxed space-y-8">
        <header className="space-y-3">
          <h2 className="text-2xl font-bold font-display text-foreground">🌾 Government Agriculture Schemes & Subsidies Guide</h2>
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Central & State Farming Benefits Manual · सरकारी योजनाओं की निर्देशिका</p>
        </header>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">1. Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)</h3>
          <p>
            PM-KISAN is a Central Sector Scheme launched by the Government of India to provide income support to all landholding farmer families across the country. 
            Under the scheme, direct financial assistance of Rs. 6,000 per year is transferred in three equal installments of Rs. 2,000 directly into the bank accounts of the beneficiaries.
          </p>
          <p>
            <strong>Eligibility and Verification:</strong> The scheme targets small and marginal landholder families who own cultivable land in their names. 
            To receive installments successfully, farmers must complete Aadhaar seeding, land record integration (Bhulekh linkage), and mandatory e-KYC verification through face authentication or biometric devices.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">2. Pradhan Mantri Fasal Bima Yojana (PMFBY)</h3>
          <p>
            PMFBY is the flagship crop insurance scheme in India designed to support sustainable production in agriculture by providing financial support to farmers suffering crop loss or damage arising out of natural calamities.
          </p>
          <p>
            <strong>Premium Caps:</strong> The scheme has set uniform premium rates to make insurance affordable for poor farmers. 
            Farmers pay only 2.0% of the sum insured for all Kharif crops, 1.5% for all Rabi crops, and 5.0% for annual commercial and horticultural crops. 
            The remaining balance of the premium is shared equally by the Central Government and State Governments.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">3. Kisan Credit Card (KCC) Scheme</h3>
          <p>
            The Kisan Credit Card (KCC) scheme was introduced to provide farmers with timely access to short-term credit for crop cultivation, input purchase (seeds, fertilizers, pesticides), and post-harvest household expenses.
          </p>
          <p>
            <strong>Interest Rates and Subvention:</strong> The nominal interest rate on KCC loans is 9%. 
            However, the Government of India provides a 2% interest subvention to banks, reducing the rate to 7%. 
            Farmers who repay their loans on time receive an additional 3% prompt repayment incentive, bringing the effective interest rate down to just 4% per annum.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">4. PM-KUSUM Scheme (Solar Pump Subsidy)</h3>
          <p>
            The Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM) scheme aims to provide energy security to farmers by subsidizing solar water pumps and solarizing grid-connected agricultural pumps.
          </p>
          <p>
            Under Component-B of the scheme, farmers receive up to 60% financial assistance (30% from the Central Government and 30% from the State Government) to install standalone solar agriculture pumps of capacities up to 7.5 HP in off-grid areas, reducing reliance on expensive diesel fuel.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">5. अक्सर पूछे जाने वाले प्रश्न (FAQ - Sarkari Schemes)</h3>
          <div className="grid gap-6 md:grid-cols-2 text-xs">
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 1. पीएम-किसान (PM-Kisan) योजना के लिए कौन पात्र नहीं है?</h4>
              <p className="text-muted-foreground">उत्तर: कोई भी किसान परिवार जिसके पास खेती योग्य भूमि नहीं है, संस्थागत भूमि धारक, सरकारी कर्मचारी (चतुर्थ श्रेणी को छोड़कर), आयकरदाता, या प्रति माह ₹10,000 से अधिक पेंशन प्राप्त करने वाले सेवानिवृत्त व्यक्ति इस योजना के पात्र नहीं हैं।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 2. पीएम फसल बीमा योजना (PMFBY) के तहत दावा (Claim) कैसे करें?</h4>
              <p className="text-muted-foreground">उत्तर: फसल के नुकसान की स्थिति में किसान को आपदा (ओलावृष्टि, जलभराव, बादल फटना आदि) के 72 घंटे के भीतर संबंधित बीमा कंपनी, स्थानीय कृषि अधिकारी या PMFBY हेल्प डेस्क पर इसकी सूचना देनी अनिवार्य है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 3. किसान क्रेडिट कार्ड (KCC) के तहत कितना ऋण मिल सकता है?</h4>
              <p className="text-muted-foreground">उत्तर: ऋण सीमा भूमि के आकार, बोई जाने वाली फसलों (Scale of Finance) और पिछले ऋण चुकाने के इतिहास के आधार पर तय होती है। ₹1.60 लाख तक का केसीसी लोन बिना किसी गारंटी (Collateral-Free) के मिल जाता है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 4. पीएम-कुसुम (PM-KUSUM) योजना के तहत सोलर पंप के लिए आवेदन कैसे करें?</h4>
              <p className="text-muted-foreground">उत्तर: किसान अपने राज्य के नवीन एवं नवीकरणीय ऊर्जा विभाग (जैसे HAREDA, UPNEDA, RRECL) की आधिकारिक राज्य-स्तरीय कुसुम वेबसाइट पर जाकर ऑनलाइन आवेदन जमा कर सकते हैं।</p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
