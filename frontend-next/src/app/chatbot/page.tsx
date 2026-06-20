import type { Metadata } from 'next';
import ChatbotClient from './ChatbotClient';

export const metadata: Metadata = {
  title: 'AI Agronomist Chatbot & Voice Assistant | कृषक चैटबॉट',
  description: 'Ask our smart AI Agronomist questions about crop protection, disease prevention, fertilizer dosage, organic farming, and government schemes in Hindi, English, or Kannada.',
  alternates: {
    canonical: '/chatbot',
  },
  openGraph: {
    title: 'AI Agronomist Chatbot & Voice Assistant | कृषक चैटबॉट',
    description: 'Ask our smart AI Agronomist questions about crop protection, disease prevention, fertilizer dosage, organic farming, and government schemes in Hindi, English, or Kannada.',
    url: '/chatbot',
    type: 'website',
  },
};

export default function ChatbotPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy AI Agronomist Chatbot",
    "url": "https://kisaanbuddy.com/chatbot",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5. Requires microphone access.",
    "description": "Multilingual AI Agricultural Chatbot and Voice Assistant. Speak or type crop protection, soil health, pesticide dosage, and schemes queries in 11 Indian languages."
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do you use the KisaanBuddy AI Agronomist Chatbot?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Press the microphone icon to speak your agricultural questions in your regional language, or type your query inside the chat box."
        }
      },
      {
        "@type": "Question",
        "name": "Which languages are supported by the AI Chatbot?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The AI Agronomist chatbot supports 11 Indian languages including Hindi, English, Kannada, Telugu, Tamil, and Hinglish."
        }
      },
      {
        "@type": "Question",
        "name": "Are the pesticide remedies suggested by the AI safe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, the AI only suggests pesticides registered under the Central Insecticides Board (CIBRC), prioritising organic inputs."
        }
      },
      {
        "@type": "Question",
        "name": "Is there any fee to use the virtual agronomist?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, this AI consulting service is completely free and available 24/7 for farmers."
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
      <ChatbotClient />

      {/* SSR Static SEO & Educational Content for AdSense / Search Engine indexing */}
      <article className="border-t border-border/20 pt-10 mt-16 max-w-5xl mx-auto px-4 pb-12 text-sm text-muted-foreground/90 leading-relaxed space-y-8">
        <header className="space-y-3">
          <h2 className="text-2xl font-bold font-display text-foreground">🌾 AI Agronomist Chatbot & Voice Assistant User Manual</h2>
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">How to Consult our Virtual Agricultural Advisor · कृषक एआई चैटबॉट</p>
        </header>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">1. Introducing the KisaanBuddy AI Agronomist</h3>
          <p>
            KisaanBuddy's AI Agronomist Chatbot and Voice Assistant is a state-of-the-art conversational AI system trained to answer diverse agricultural queries. 
            It is designed to replicate the advice of a human agronomist, providing immediate assistance on crop care, disease diagnosis, soil fertility, pest control, and local government schemes.
          </p>
          <p>
            Many farmers find typing in complex terms difficult, which is why our system supports multilingual voice commands. 
            Farmers can speak directly into their phone's microphone in Hindi, Kannada, English, or other regional dialects, and the AI will respond aloud in the same language.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">2. Types of Inquiries You Can Ask the AI</h3>
          <p>
            The chatbot can process highly complex agricultural concepts and translate them into simple, actionable steps for the field. Here are some key topics the AI can assist with:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Crop Diseases:</strong> Describe symptoms like "yellowing of tomato leaves" or "black spots on cotton pods" to receive immediate organic and chemical treatments.</li>
            <li><strong>Fertilizer Ratios:</strong> Ask for specific NPK (Nitrogen, Phosphorus, Potassium) ratios and fertilizer dosages based on your crop type and soil reports.</li>
            <li><strong>Government Subsidies:</strong> Check eligibility criteria for schemes like PM-Kisan, PM Fasal Bima Yojana (Crop Insurance), or solar pump subsidies.</li>
            <li><strong>Mandi Prices & Trends:</strong> Inquire about current market rates for wheat, rice, potatoes, or onions in your local state APMCs.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">3. Voice-First Usability for Rural Communities</h3>
          <p>
            Traditional search engines require literacy and typing skills, which poses a barrier for many elder farmers. 
            By integrating voice-to-text (STT) and text-to-speech (TTS) engines, KisaanBuddy allows users to interact naturally using spoken speech.
          </p>
          <p>
            This voice-first system works efficiently even on budget smartphones and low-bandwidth rural networks. 
            The AI automatically detects the selected dialect, translates agronomic terminology into local terminology, and speaks the solution back to the farmer clearly, simulating a phone call with a crop expert.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">4. Verifying Recommendations and Safety Disclaimer</h3>
          <p>
            While our AI is highly trained on verified agricultural datasets, farming outcomes depend heavily on local microclimates, soil structures, and water quality. 
            Therefore, all AI chatbot outputs should be treated as expert recommendations and cross-verified with local block development officers or government agriculture extensions before final application.
          </p>
          <p>
            We strictly enforce safety checks, ensuring that recommended pesticides are legal and registered under the Central Insecticides Board (CIBRC), and emphasizing biological controls whenever possible to promote long-term soil health.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground font-display">5. अक्सर पूछे जाने वाले प्रश्न (FAQ - Voice AI Chatbot)</h3>
          <div className="grid gap-6 md:grid-cols-2 text-xs">
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 1. कृषक एआई चैटबॉट (AI Chatbot) का उपयोग कैसे करें?</h4>
              <p className="text-muted-foreground">उत्तर: आप माइक बटन दबाकर बोल सकते हैं या चैट बॉक्स में लिखकर अपनी समस्या (जैसे पत्ती पर दाग, खाद की मात्रा, फसल बीमा योजना) के बारे में पूछ सकते हैं।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 2. चैटबॉट किन भाषाओं का समर्थन करता है?</h4>
              <p className="text-muted-foreground">उत्तर: हमारा एआई चैटबॉट मुख्य रूप से हिंदी, अंग्रेजी, कन्नड़ सहित 11 भारतीय भाषाओं को समझने और उनमें उत्तर देने में सक्षम है।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 3. क्या चैटबॉट द्वारा सुझाई गई दवाएं सुरक्षित हैं?</h4>
              <p className="text-muted-foreground">उत्तर: हां, एआई केवल केंद्रीय कीटनाशक बोर्ड द्वारा स्वीकृत दवाओं और जैविक उपचारों का सुझाव देता है। फिर भी, बड़े पैमाने पर इस्तेमाल से पहले स्थानीय सलाहकार से राय लें।</p>
            </div>
            <div className="space-y-2 border border-border/30 bg-card/25 p-4 rounded-xl">
              <h4 className="font-bold text-foreground">प्रश्न 4. क्या इस सेवा का उपयोग करने के लिए कोई शुल्क है?</h4>
              <p className="text-muted-foreground">उत्तर: नहीं, किसान साथियों के लिए यह एआई सलाह सेवा पूरी तरह से निशुल्क और हमेशा उपलब्ध है।</p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
