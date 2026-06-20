import type { Metadata } from 'next';
import CropPredictorClient from './CropPredictorClient';

export const metadata: Metadata = {
  title: 'AI Crop Yield Prediction Online | फसल चयन',
  description: 'Input Nitrogen, Phosphorus, Potassium, temperature, humidity, pH, and rainfall to let our Machine Learning models predict the best crop for your farm.',
  alternates: {
    canonical: '/crop-predictor',
  },
  openGraph: {
    title: 'AI Crop Yield Prediction Online | फसल चयन',
    description: 'Input Nitrogen, Phosphorus, Potassium, temperature, humidity, pH, and rainfall to let our Machine Learning models predict the best crop for your farm.',
    url: '/crop-predictor',
    type: 'website',
  },
};

export default function CropPredictorPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy AI Crop Predictor",
    "url": "https://kisaanbuddy.com/crop-predictor",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "description": "AI-powered Crop Selection Tool. Enter your N-P-K soil values, pH, temperature, and rainfall parameters to predict the most profitable crop for your farmland."
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the role of Nitrogen (N) in crop selection?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nitrogen is critical for vegetative growth and leaf health. Crops like Paddy and Maize require higher nitrogen to support green growth and crop yield."
        }
      },
      {
        "@type": "Question",
        "name": "How do you correct acidic soil?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If soil pH is below 5.5, adding agricultural lime (calcium carbonate) during land preparation reduces acidity and unlocks nutrients."
        }
      },
      {
        "@type": "Question",
        "name": "Why do pulses and legumes require less nitrogen fertilizer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pulses like chickpeas and lentils form symbiotic relationships with Rhizobium bacteria, allowing them to fix atmospheric nitrogen directly into the soil, reducing the need for chemical nitrogen inputs."
        }
      },
      {
        "@type": "Question",
        "name": "Can you get good crop yields in hot temperatures?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, by selecting high-temperature tolerant crop varieties and using moisture conservation techniques like organic mulching and drip irrigation to minimize evaporation."
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
      <CropPredictorClient />

      {/* SSR Static SEO & Educational Content for AdSense / Search Engine indexing */}
      <article className="border-t border-border/20 pt-10 mt-16 max-w-5xl mx-auto px-4 pb-12 text-sm text-muted-foreground/90 leading-relaxed space-y-8">
        <header className="space-y-3">
          <h2 className="text-2xl font-bold font-display text-foreground">🌾 AI Crop Selection & Yield Optimization Guide</h2>
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Smart Crop Prediction & Soil Chemistry Manual · फसल चयन मार्गदर्शिका</p>
        </header>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">1. Understanding Soil NPK Values (Nitrogen, Phosphorus, Potassium)</h3>
          <p>
            Soil fertility is directly governed by the availability of primary macronutrients: Nitrogen (N), Phosphorus (P), and Potassium (K). 
            These elements are required in large quantities by crops for proper cellular development, photosynthesis, and yield production.
          </p>
          <p>
            <strong>Nitrogen (N):</strong> Promotes rapid vegetative growth, leaf development, and healthy green color through chlorophyll synthesis. High-nitrogen crops include rice and leafy vegetables. 
            <strong>Phosphorus (P):</strong> Essential for root growth, early crop maturity, and fruit/seed formation. Crops like chickpeas and lentils require adequate phosphorus for nodule development. 
            <strong>Potassium (K):</strong> Regulates water balance, starch synthesis, and builds resistance against drought, frost, and pests. Crops like potatoes and cotton are heavy potassium consumers.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">2. The Role of Soil pH in Nutrient Availability</h3>
          <p>
            Soil pH measures the acidity or alkalinity of the soil on a scale of 0 to 14. 
            Most agricultural crops grow best in slightly acidic to neutral soils with a pH range of 6.0 to 7.5.
          </p>
          <p>
            In extremely acidic soils (pH &lt; 5.5), essential nutrients like phosphorus, calcium, and magnesium become chemically locked and unavailable to plants. 
            In highly alkaline soils (pH &gt; 8.0), micronutrients like iron, zinc, and manganese become insoluble, leading to nutrient deficiencies. 
            Before choosing a crop, it is imperative to test soil pH and apply amendments like lime (to raise pH) or gypsum (to lower pH) if necessary.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">3. Climatic Factors: Temperature and Rainfall</h3>
          <p>
            While soil chemistry determines nutrient availability, macroclimatic parameters like seasonal temperatures and rainfall dictate crop survival.
          </p>
          <p>
            <strong>Kharif Crops:</strong> Sown during the onset of the southwest monsoon (June–July) and harvested in autumn. Crops like Rice, Maize, and Cotton require high temperatures (25°C to 35°C) and abundant rainfall/irrigation. 
            <strong>Rabi Crops:</strong> Sown in winter (October–November) and harvested in spring. Crops like Wheat, Mustard, and Barley require cool climates (10°C to 20°C) and moderate moisture.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">4. Recommended Crop Parameters</h3>
          <p>
            Below is a general reference of ideal soil and climatic parameters for major Indian crops determined by agricultural research institutes:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/30 border border-border/20 text-xs">
              <thead className="bg-muted/20">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Crop Name</th>
                  <th className="px-4 py-2 text-left font-bold text-foreground">N-P-K Ratio</th>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Soil pH Range</th>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Ideal Temperature</th>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Rainfall Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Rice (Paddy)</td>
                  <td className="px-4 py-2">80 : 40 : 40</td>
                  <td className="px-4 py-2">5.5 - 6.5</td>
                  <td className="px-4 py-2">22°C - 32°C</td>
                  <td className="px-4 py-2">1000 - 1500 mm</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Wheat</td>
                  <td className="px-4 py-2">120 : 60 : 40</td>
                  <td className="px-4 py-2">6.0 - 7.5</td>
                  <td className="px-4 py-2">15°C - 25°C</td>
                  <td className="px-4 py-2">600 - 800 mm</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Cotton</td>
                  <td className="px-4 py-2">100 : 50 : 50</td>
                  <td className="px-4 py-2">6.0 - 8.0</td>
                  <td className="px-4 py-2">21°C - 30°C</td>
                  <td className="px-4 py-2">500 - 1000 mm</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Chickpea (Gram)</td>
                  <td className="px-4 py-2">20 : 50 : 20</td>
                  <td className="px-4 py-2">6.0 - 7.0</td>
                  <td className="px-4 py-2">18°C - 25°C</td>
                  <td className="px-4 py-2">400 - 600 mm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">5. अक्सर पूछे जाने वाले प्रश्न (FAQ - Crop Selection & Yield)</h3>
          <div className="grid gap-6 md:grid-cols-2 text-xs">
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 1. फसल चयन में नाइट्रोजन (N) की क्या भूमिका है?</h4>
              <p className="text-muted-foreground">उत्तर: नाइट्रोजन पत्तों और वनस्पति के विकास के लिए सबसे महत्वपूर्ण है। धान और मक्का जैसी फसलों को अच्छी हरी वृद्धि के लिए अधिक नाइट्रोजन की आवश्यकता होती है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 2. अम्लीय मिट्टी (Acidic Soil) में सुधार कैसे करें?</h4>
              <p className="text-muted-foreground">उत्तर: यदि मिट्टी का pH 5.5 से कम है, तो खेत की जुताई करते समय चूना (Lime) या कैल्शियम कार्बोनेट मिलाने से अम्लता कम होती है और पोषक तत्वों की उपलब्धता बढ़ती है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 3. दालों और फलीदार फसलों को कम नाइट्रोजन की आवश्यकता क्यों होती है?</h4>
              <p className="text-muted-foreground">उत्तर: चने और मूंग जैसी दालों की जड़ों में विशेष ग्रंथियां होती हैं जो हवा की नाइट्रोजन को मिट्टी में जमा (Fix) कर लेती हैं, इसलिए इन्हें अलग से यूरिया डालने की बहुत कम आवश्यकता होती है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 4. क्या अधिक तापमान में भी अच्छी पैदावार मिल सकती है?</h4>
              <p className="text-muted-foreground">उत्तर: हाँ, लेकिन इसके लिए उच्च तापमान सहन करने वाली विशेष हाइब्रिड किस्मों का चयन करना होगा और मल्चिंग तथा ड्रिप सिंचाई का उपयोग कर पानी के वाष्पीकरण को रोकना होगा।</p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
