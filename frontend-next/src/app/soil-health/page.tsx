import type { Metadata } from 'next';
import SoilHealthClient from './SoilHealthClient';

export const metadata: Metadata = {
  title: 'Soil Health & Fertilizer Recommendation AI | मिट्टी परीक्षण',
  description: 'Enter your soil card parameters to receive a detailed soil health report, custom NPK fertilizer dosages, and organic amendments advice.',
  alternates: {
    canonical: '/soil-health',
  },
  openGraph: {
    title: 'Soil Health & Fertilizer Recommendation AI | मिट्टी परीक्षण',
    description: 'Enter your soil card parameters to receive a detailed soil health report, custom NPK fertilizer dosages, and organic amendments advice.',
    url: '/soil-health',
    type: 'website',
  },
};

export default function SoilHealthPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy AI Soil Health & Fertilizer Advisor",
    "url": "https://kisaanbuddy.com/soil-health",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "description": "AI-powered Soil Health Card Analyst. Enter your soil N-P-K nutrient values, organic carbon, and pH to receive custom scientific fertilizer recommendations and organic soil amendments advice."
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why is soil testing important for crops?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Soil testing measures nutrient levels, organic carbon, and pH to avoid under- or over-application of chemical fertilizers, optimizing input costs and soil structure."
        }
      },
      {
        "@type": "Question",
        "name": "What is organic carbon (O.C.) in soil?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Organic carbon represents the organic matter content in soil that fuels soil microbial activity. Healthy soil should have O.C. above 0.75%."
        }
      },
      {
        "@type": "Question",
        "name": "Why is sulphur critical for crops?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sulphur is a secondary plant nutrient essential for oilseed crops (like mustard and soybean) to synthesize oils, proteins, and chlorophyll."
        }
      },
      {
        "@type": "Question",
        "name": "How is Urea (46% N) fertilizer dosage calculated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Urea contains 46% nitrogen. Therefore, to supply 46 kg of nitrogen to one hectare of land, a farmer needs to apply exactly 100 kg of Urea."
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
      <SoilHealthClient />

      {/* SSR Static SEO & Educational Content for AdSense / Search Engine indexing */}
      <article className="border-t border-border/20 pt-10 mt-16 max-w-5xl mx-auto px-4 pb-12 text-sm text-muted-foreground/90 leading-relaxed space-y-8">
        <header className="space-y-3">
          <h2 className="text-2xl font-bold font-display text-foreground">🌾 Soil Health, Testing & Scientific Fertilizer Management Guide</h2>
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Agronomy Reference & Soil Card Interpretation Manual · मृदा स्वास्थ्य एवं उर्वरक मार्गदर्शिका</p>
        </header>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">1. Understanding Soil Health Cards</h3>
          <p>
            A Soil Health Card is a printed report that a farmer gets for each of their landholdings. 
            It contains the status of their soil with respect to 12 parameters: macro-nutrients (Nitrogen, Phosphorus, Potassium), secondary nutrients (Sulphur), micro-nutrients (Zinc, Iron, Copper, Manganese, Boron), and physical parameters (pH, Electrical Conductivity, Organic Carbon).
          </p>
          <p>
            Soil testing must be conducted once every two years. 
            By analyzing these parameters, farmers can understand which nutrients are depleted and avoid the blindly excessive application of chemical fertilizers, saving input costs while preserving the soil structure.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">2. Primary Nutrients vs Micronutrients</h3>
          <p>
            Plants require nutrients in varying quantities:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Organic Carbon (O.C.):</strong> The organic carbon percentage represents the soil's organic matter content, serving as fuel for soil microbes. Healthy soil should have O.C. &gt; 0.75%. Below 0.40% represents critical depletion.</li>
            <li><strong>Sulphur (S):</strong> A secondary nutrient essential for oilseed crops (like mustard and soybean) to synthesize oil content and proteins.</li>
            <li><strong>Micronutrients (Zinc, Boron, Iron):</strong> Although needed in minute quantities (grams per acre), deficiencies in zinc or boron can stunt plant growth, cause leaf chlorosis, and lead to poor flower pollination.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">3. Correcting Nutrient Deficiencies & Fertilizer Calculations</h3>
          <p>
            When a soil test reports a deficiency of 50 kg of Nitrogen per acre, the farmer must not apply 50 kg of Urea. 
            Chemical fertilizers are chemical compounds, not pure nutrients.
          </p>
          <p>
            <strong>Urea (46% N):</strong> To supply 46 kg of nitrogen, 100 kg of Urea is needed. Thus, a requirement of 50 kg N translates to roughly 109 kg of Urea. 
            <strong>Single Super Phosphate (16% P2O5):</strong> To supply phosphorus, SSP is widely used. If the soil needs 30 kg of phosphorus, roughly 187 kg of SSP is required. 
            <strong>Muriate of Potash (60% K2O):</strong> To supply potassium, MOP is used. 100 kg of MOP supplies 60 kg of K.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">4. Soil Parameter Benchmarks</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/30 border border-border/20 text-xs">
              <thead className="bg-muted/20">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Soil Parameter</th>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Low / Deficient</th>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Medium / Optimum</th>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Corrective Measures</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Organic Carbon (%)</td>
                  <td className="px-4 py-2">&lt; 0.50%</td>
                  <td className="px-4 py-2">0.50% - 0.75%</td>
                  <td className="px-4 py-2">Add Farm Yard Manure (FYM) or grow green manure (Dhaincha)</td>
                </tr>
                  <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Available Nitrogen (kg/ha)</td>
                  <td className="px-4 py-2">&lt; 280</td>
                  <td className="px-4 py-2">280 - 560</td>
                  <td className="px-4 py-2">Apply Urea / Ammonium Sulphate or practice crop rotation with legumes</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Available Phosphorus (kg/ha)</td>
                  <td className="px-4 py-2">&lt; 10</td>
                  <td className="px-4 py-2">10 - 25</td>
                  <td className="px-4 py-2">Apply Single Super Phosphate (SSP) or DAP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Available Zinc (ppm)</td>
                  <td className="px-4 py-2">&lt; 0.6</td>
                  <td className="px-4 py-2">0.6 - 1.2</td>
                  <td className="px-4 py-2">Apply Zinc Sulphate Heptahydrate (21% Zn) @ 10 kg/acre</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">5. अक्सर पूछे जाने वाले प्रश्न (FAQ - Soil Testing & Fertilizer)</h3>
          <div className="grid gap-6 md:grid-cols-2 text-xs">
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 1. मिट्टी परीक्षण (Soil Test) के लिए नमूना कैसे लें?</h4>
              <p className="text-muted-foreground">उत्तर: खेत के 8-10 अलग-अलग स्थानों से अंग्रेजी के 'V' आकार में 15 सेमी गहरा गड्ढा खोदें। गड्ढे के दोनों किनारों से एक-एक इंच मोटी मिट्टी की परत निकालें। सभी नमूनों को मिलाकर आधा किलो मिट्टी जांच के लिए भेजें।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 2. जैविक कार्बन (Organic Carbon) बढ़ाने का सबसे तेज तरीका क्या है?</h4>
              <p className="text-muted-foreground">उत्तर: ढैंचा या सनई जैसी हरी खाद को खेत में उगाकर फूल आने से पहले मिट्टी में पलट दें। साथ ही प्रति वर्ष प्रति एकड़ 4-5 टन अच्छी तरह सड़ी हुई गोबर की खाद (FYM) का उपयोग करें।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 3. अत्यधिक यूरिया (Urea) डालने से मिट्टी पर क्या असर पड़ता है?</h4>
              <p className="text-muted-foreground">उत्तर: ज्यादा यूरिया डालने से मिट्टी में अम्लता (Acidity) बढ़ जाती है, जिससे सूक्ष्म जीवों की संख्या कम होती है। पौधे कमजोर होकर हवा से गिरने लगते हैं और उन पर बीमारियों का हमला बढ़ जाता है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 4. क्षारीय मिट्टी (Alkaline Soil) का सुधार कैसे किया जाता है?</h4>
              <p className="text-muted-foreground">उत्तर: यदि मिट्टी का pH 8.0 से अधिक है, तो मिट्टी की जांच रिपोर्ट के अनुसार प्रति एकड़ 2 से 5 क्विंटल जिप्सम (Gypsum) मिलाएं और खेत में पानी भरकर निकाल दें।</p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
