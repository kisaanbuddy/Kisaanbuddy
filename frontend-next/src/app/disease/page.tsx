import type { Metadata } from 'next';
import DiseaseClient from './DiseaseClient';

export const metadata: Metadata = {
  title: 'Crop Leaf Disease Detection Online | फसल की बीमारी की पहचान',
  description: 'Upload a photo of your crop leaf and get instant diagnosis, organic remedies, and chemical treatment guidelines.',
  alternates: {
    canonical: '/disease',
  },
  openGraph: {
    title: 'Crop Leaf Disease Detection Online | फसल की बीमारी की पहचान',
    description: 'Upload a photo of your crop leaf and get instant diagnosis, organic remedies, and chemical treatment guidelines.',
    url: '/disease',
    type: 'website',
  }
};

export default function DiseasePage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy AI Crop Leaf Disease Detector",
    "url": "https://kisaanbuddy.com/disease",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5. Requires camera access.",
    "description": "AI-powered Crop Disease Detection Tool. Upload or capture photos of damaged crop leaves to instantly diagnose plant pathogens and receive remedy options."
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why is early crop disease detection critical?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Early detection stops pathogens from colonizing plant vascular systems and spreading to healthy fields, saving yields and reducing treatment costs."
        }
      },
      {
        "@type": "Question",
        "name": "What are the visual symptoms of Rice Blast?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Rice Blast appears as spindle-shaped or diamond-like spots on leaves, showing gray centers and brown borders."
        }
      },
      {
        "@type": "Question",
        "name": "How does Integrated Pest Management (IPM) work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "IPM is an ecological approach combining cultural methods (crop rotation), biological controls (neem oil, Trichoderma), and targeted chemical interventions as a last resort."
        }
      },
      {
        "@type": "Question",
        "name": "What chemical is recommended for Potato Late Blight control?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Metalaxyl combined with Mancozeb spray at 2g per Liter of water is widely recommended for early control."
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
      <DiseaseClient />

      {/* SSR Static SEO & Educational Content for AdSense / Search Engine indexing */}
      <article className="border-t border-border/20 pt-10 mt-16 max-w-5xl mx-auto px-4 pb-12 text-sm text-muted-foreground/90 leading-relaxed space-y-8">
        <header className="space-y-3">
          <h2 className="text-2xl font-bold font-display text-foreground">🌾 Crop Leaf Disease Diagnosis & Integrated Pest Management (IPM)</h2>
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Plant Pathology Manual & Agricultural Remedies · फसल रोग निदान मार्गदर्शिका</p>
        </header>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">1. The Importance of Early Disease Detection</h3>
          <p>
            Crop diseases are major threats to global food security, accounting for an estimated 20% to 40% reduction in agricultural yields annually. 
            Fungal, bacterial, and viral pathogens spread rapidly in rural areas due to monoculture cropping, high atmospheric humidity, and lack of timely diagnostics.
          </p>
          <p>
            Early diagnostic detection through crop leaf analysis is critical. 
            Once pathogens colonize vascular tissues of plants, treatment becomes expensive and less effective. 
            By capturing and analyzing early lesions, spots, and rust pustules on leaf surfaces, farmers can apply targeted organic or chemical formulations before the infection spreads to the entire field.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">2. Common Indian Crop Diseases and Symptoms</h3>
          <p>
            Farmers must monitor their fields daily for these widely occurring diseases:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Rice Blast (धान का झोंका रोग):</strong> Caused by the fungus <em>Magnaporthe oryzae</em>. It produces diamond or spindle-shaped spots with gray centers and brown borders on leaves. Can destroy entire harvests in humid climates.</li>
            <li><strong>Wheat Yellow Rust (गेहूं का पीला रतुआ):</strong> Caused by <em>Puccinia striiformis</em>. It shows as linear stripes of bright yellow/orange powdery pustules on leaf blades, which block photosynthesis.</li>
            <li><strong>Potato Late Blight (आलू का पछेती झुलसा):</strong> Caused by the oomycete <em>Phytophthora infestans</em>. Appears as dark brown or black water-soaked spots starting from leaf tips, with white cottony growth on the underside during humid weather.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">3. Principles of Integrated Pest Management (IPM)</h3>
          <p>
            Integrated Pest Management (IPM) is an environmentally sensitive approach that combines multiple management practices to control crop damage while minimizing risks to human health and soil ecosystems:
          </p>
          <p>
            <strong>Cultural Controls:</strong> Use disease-resistant seed varieties, clean tools, practice crop rotation with non-host plants, and maintain optimum plant spacing to improve ventilation. 
            <strong>Biological Controls:</strong> Apply beneficial microorganisms like <em>Trichoderma viride</em> (for root rots) or spray cold-pressed neem oil (1500 ppm) to deter sucking pests and early fungal spores. 
            <strong>Chemical Controls:</strong> Use chemical fungicides (like Mancozeb or Hexaconazole) only as a last resort when infestation exceeds economic threshold levels. Always wear protective gear during application.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">4. Prevention and Treatment Guidelines</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/30 border border-border/20 text-xs">
              <thead className="bg-muted/20">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Crop</th>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Disease Name</th>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Organic Remedy</th>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Chemical Treatment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Rice</td>
                  <td className="px-4 py-2">Rice Blast</td>
                  <td className="px-4 py-2">Spray Pseudomonas fluorescens @ 10g/L</td>
                  <td className="px-4 py-2">Spray Tricyclazole 75 WP @ 0.6g/L</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Wheat</td>
                  <td className="px-4 py-2">Yellow Rust</td>
                  <td className="px-4 py-2">Sow resistant varieties (HD 2967 / HD 3086)</td>
                  <td className="px-4 py-2">Spray Propiconazole 25 EC @ 1ml/L</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Potato</td>
                  <td className="px-4 py-2">Late Blight</td>
                  <td className="px-4 py-2">Spray Trichoderma viride @ 5g/L</td>
                  <td className="px-4 py-2">Spray Metalaxyl + Mancozeb @ 2g/L</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Tomato</td>
                  <td className="px-4 py-2">Early Blight</td>
                  <td className="px-4 py-2">Neem oil spray (0.3% formulation)</td>
                  <td className="px-4 py-2">Spray Copper Oxychloride @ 3g/L</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">5. अक्सर पूछे जाने वाले प्रश्न (FAQ - Plant Pathology & Remedies)</h3>
          <div className="grid gap-6 md:grid-cols-2 text-xs">
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 1. पत्तियों पर काले धब्बे दिखने का क्या कारण हो सकता है?</h4>
              <p className="text-muted-foreground">उत्तर: पत्तियों पर काले या भूरे धब्बे आमतौर पर फंगस (Fungal) संक्रमण जैसे अगेती झुलसा (Early Blight) या लीफ स्पॉट के कारण होते हैं। यह अधिक नमी और तापमान के कारण तेजी से फैलता है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 2. पीले रतुआ (Yellow Rust) की पहचान कैसे करें?</h4>
              <p className="text-muted-foreground">उत्तर: गेहूं के पत्तों पर पीले रंग की पाउडर जैसी लंबी धारियां (पस्ट्यूल) दिखाई देती हैं। हाथ लगाने पर यह पीला पाउडर उंगलियों पर लग जाता है। यह ठंडे और नम मौसम में ज्यादा फैलता है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 3. क्या बोर्डो मिश्रण (Bordeaux Mixture) एक जैविक उपाय है?</h4>
              <p className="text-muted-foreground">उत्तर: बोर्डो मिश्रण चूने और तांबे (कॉपर सल्फेट) का एक पारंपरिक मिश्रण है। यह पूरी तरह से जैविक नहीं है, लेकिन इसे पर्यावरण के लिए सुरक्षित फफूंदनाशी माना जाता है और जैविक खेती में सीमित उपयोग की अनुमति है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 4. फंगस वाले पत्तों को खेत में गिरने से कैसे रोकें?</h4>
              <p className="text-muted-foreground">उत्तर: संक्रमित पत्तियों या पौधों को तुरंत काटकर खेत से दूर ले जाकर जला देना चाहिए या गहरे गड्ढे में दबा देना चाहिए। इन्हें खेत में सड़ने देने से फंगस के बीजाणु हवा और पानी से स्वस्थ पौधों में फैल जाते हैं।</p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
