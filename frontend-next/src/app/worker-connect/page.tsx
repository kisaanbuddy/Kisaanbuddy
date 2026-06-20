import type { Metadata } from 'next';
import WorkerConnectClient from './WorkerConnectClient';

export const metadata: Metadata = {
  title: 'Worker Connect - Hire Farm Labours & Find Jobs | कृषि मजदूर सेवा',
  description: 'Connect with local farm owners looking to hire workers, or post agricultural job openings for harvesting, sowing, weeding, and tractor operations.',
  alternates: {
    canonical: '/worker-connect',
  },
  openGraph: {
    title: 'Worker Connect - Hire Farm Labours & Find Jobs | कृषि मजदूर सेवा',
    description: 'Connect with local farm owners looking to hire workers, or post agricultural job openings for harvesting, sowing, weeding, and tractor operations.',
    url: '/worker-connect',
    type: 'website',
  },
};

export default function WorkerConnectPage() {
  return (
    <div className="space-y-12">
      <WorkerConnectClient />

      {/* SSR Static SEO & Educational Content for AdSense / Search Engine indexing */}
      <article className="border-t border-border/20 pt-10 mt-16 max-w-5xl mx-auto px-4 pb-12 text-sm text-muted-foreground/90 leading-relaxed space-y-8">
        <header className="space-y-3">
          <h2 className="text-2xl font-bold font-display text-foreground">🌾 Farm Labor Management & Rural Worker Marketplace Guide</h2>
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Rural Marketplace Reference & Safety Standards · कृषि मजदूर प्रबंधन मार्गदर्शिका</p>
        </header>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">1. Seasonal Labor Demand in Indian Agriculture</h3>
          <p>
            Agriculture in India is heavily dependent on seasonal labor. 
            Peak demand occurs twice a year during the sowing and harvesting cycles of Kharif and Rabi crops. 
            During these short windows of 15 to 30 days, timely labor availability determines whether crops are successfully harvested before unseasonal rain or weather changes damage the yield.
          </p>
          <p>
            Labor migration occurs between agricultural states (e.g., workers from Bihar, Uttar Pradesh, and Madhya Pradesh migrating to Punjab and Haryana for paddy transplantation and wheat harvesting). 
            A transparent rural marketplace helps farmers secure skilled operators for mechanization and provides laborers with guaranteed work and fair wages without intermediary commission agents.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">2. Safety and Health Standards for Farm Labours</h3>
          <p>
            Farm operations involve occupational hazards. 
            It is critical to establish basic safety standards to prevent injuries and pesticide-related illnesses:
          </p>
          <p>
            <strong>Machinery Safety:</strong> Tractor drivers, combine harvester operators, and chaff cutter workers must be properly trained. Loose clothing should be avoided around rotating PTO shafts and gears. 
            <strong>Chemical Exposure:</strong> Agrochemical sprayers must wear personal protective equipment (PPE) including chemical-resistant gloves, masks, and protective eyewear. Spraying must be conducted along the wind direction, never against it, to prevent inhalation of chemical drift. 
            <strong>Hydration & Rest:</strong> In hot summer months, landowners must provide clean drinking water and scheduled rest intervals in shaded areas to prevent heatstrokes.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">3. Fair Wages and Employment Standards</h3>
          <p>
            Wages for farm operations vary based on skill requirements, local labor supply, and the crop type. 
            Landowners should refer to the minimum agricultural wages declared by state governments.
          </p>
          <p>
            Skilled tasks such as operating tractors, combine harvesters, laser levelers, and installing drip irrigation command a premium daily rate compared to manual labor. 
            Paying fair wages on time builds a loyal local workforce, ensuring that crucial farm operations are never delayed during peak periods.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">4. Agricultural Operations & Safety Guidelines</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/30 border border-border/20 text-xs">
              <thead className="bg-muted/20">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Operation</th>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Category</th>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Peak Season</th>
                  <th className="px-4 py-2 text-left font-bold text-foreground">Primary Safety Hazard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Paddy Transplantation</td>
                  <td className="px-4 py-2">Manual / Unskilled</td>
                  <td className="px-4 py-2">June - July</td>
                  <td className="px-4 py-2">Waterborne infections, skin rashes (use protective boots)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Wheat Harvesting (Combine)</td>
                  <td className="px-4 py-2">Skilled Machine Operator</td>
                  <td className="px-4 py-2">April - May</td>
                  <td className="px-4 py-2">Mechanical injury, dust inhalation (use masks)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Chemical Spraying</td>
                  <td className="px-4 py-2">Semi-Skilled</td>
                  <td className="px-4 py-2">Active crop growth</td>
                  <td className="px-4 py-2">Chemical poisoning, skin contact (use masks & gloves)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-foreground">Tractor Tillage & Sowing</td>
                  <td className="px-4 py-2">Skilled Operator</td>
                  <td className="px-4 py-2">Oct - Nov / May - June</td>
                  <td className="px-4 py-2">Equipment roll-over, noise fatigue (use ear protection)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">5. अक्सर पूछे जाने वाले प्रश्न (FAQ - Labor & Hiring)</h3>
          <div className="grid gap-6 md:grid-cols-2 text-xs">
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 1. कुशल (Skilled) और अकुशल (Unskilled) कृषि मजदूर में क्या अंतर है?</h4>
              <p className="text-muted-foreground">उत्तर: कुशल मजदूर वे होते हैं जिनके पास विशेष तकनीकी ज्ञान होता है, जैसे ट्रैक्टर चलाना, कम्बाइन हार्वेस्टर चलाना या टपक सिंचाई प्रणाली (Drip System) लगाना। अकुशल मजदूर बुवाई, निराई-गुड़ाई या हाथ से फसल काटने का काम करते हैं।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 2. कीटनाशक का छिड़काव करते समय मजदूरों को क्या सावधानियां बरतनी चाहिए?</h4>
              <p className="text-muted-foreground">उत्तर: छिड़काव करते समय हमेशा मुंह पर मास्क, आंखों पर चश्मा और हाथों में रबर के दस्ताने पहनें। कभी भी हवा की विपरीत दिशा में छिड़काव न करें और काम के बाद साबुन से अच्छी तरह स्नान करें।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 3. कृषि क्षेत्र में न्यूनतम मजदूरी (Minimum Wages) कैसे तय होती है?</h4>
              <p className="text-muted-foreground">उत्तर: भारत में प्रत्येक राज्य सरकार अपनी स्थानीय आवश्यकताओं और महंगाई सूचकांक के आधार पर कृषि श्रमिकों के लिए न्यूनतम दैनिक मजदूरी अधिनियम के तहत दरें तय करती है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 4. क्या मजदूरों को दुर्घटना बीमा (Accident Insurance) मिलता है?</h4>
              <p className="text-muted-foreground">उत्तर: हाँ, भारत सरकार द्वारा 'प्रधानमंत्री सुरक्षा बीमा योजना' (PMSBY) जैसी योजनाएं चलाई जाती हैं, जिसमें बेहद कम प्रीमियम पर ₹2 लाख तक का दुर्घटना बीमा उपलब्ध होता है।</p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
