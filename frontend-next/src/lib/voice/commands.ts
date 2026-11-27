/** Deterministic local commands. Unknown questions go to the existing advisor. */
export const VOICE_LANGUAGES = {
  en: ["English", "en-IN"],
  hi: ["हिन्दी", "hi-IN"],
  hi_en: ["Hinglish (Hindi recognition)", "hi-IN"],
  mr: ["मराठी", "mr-IN"],
  bn: ["বাংলা", "bn-IN"],
  ta: ["தமிழ்", "ta-IN"],
  te: ["తెలుగు", "te-IN"],
  kn: ["ಕನ್ನಡ", "kn-IN"],
  gu: ["ગુજરાતી", "gu-IN"],
  pa: ["ਪੰਜਾਬੀ", "pa-IN"],
  ml: ["മലയാളം", "ml-IN"],
  or: ["ଓଡ଼ିଆ (device dependent)", "or-IN"],
} as const;
export type Command = { type: string; value?: string; field?: string };
export const ROUTE_COMMANDS: [string, RegExp][] = [
  ["/", /\b(home|home page|kisaanbuddy)\b|होम|मुख्य पृष्ठ|ಮುಖಪುಟ/i],
  ["/dashboard", /dashboard|डैशबोर्ड/i],
  ["/chatbot", /weather|mausam|मौसम|हवामान|ಹವಾಮಾನ|வானிலை|వాతావరణం/i],
  ["/mandi", /mandi|market price|मंडी|भाव|ಮಂಡಿ|বাজার দর/i],
  [
    "/disease",
    /crop doctor|disease|फसल.*बीमारी|फसल.*रोग|फोटो|photo.*upload|ಬೆಳೆ ರೋಗ/i,
  ],
  ["/schemes", /schemes|yojana|योजना|திட்டங்கள்/i],
  ["/profile", /profile|प्रोफाइल|ಪ್ರೊಫೈಲ್/i],
  ["/settings", /settings|सेटिंग/i],
  ["/login", /login|sign in|लॉगिन/i],
  ["/signup", /register|sign up|पंजीकरण/i],
  ["/crops", /farming guide|crop guide|खेती.*गाइड/i],
  ["/crop-predictor", /crop recommend|crop predict|फसल.*सुझाव/i],
  ["/marketplace", /marketplace|equipment|tractor|ट्रैक्टर|उपकरण/i],
  ["/worker-connect", /labour|worker|मजदूर/i],
  ["/soil-health", /soil health|मिट्टी.*जांच/i],
  ["/khet-diary", /diary|डायरी/i],
  ["/contact", /contact|support|संपर्क/i],
  ["/madad", /help page|मदद/i],
  ["/about", /about us|हमारे बारे/i],
  ["/chatbot", /advisor|सलाह चाहिए/i],
];
// Synonyms describe destinations only. Fuzzy matching never confirms or submits actions.
const routeAliases: Record<string, string[]> = {
  "/": ["shuru wala page", "pehla page", "मुख्य पेज", "शुरू वाला पेज", "home", "home page", "main page", "mukhya prishth", "shuruat", "kisaanbuddy", "होम", "मुख्य पृष्ठ", "मुखपृष्ठ", "ಮುಖಪುಟ"],
  "/dashboard": ["mera dashboard", "मेरी खेती का सारांश", "farm overview", "dashboard", "dash board", "डैशबोर्ड"],
  "/mandi": ["mandi ke rate", "mandi ka rate", "fasal ka bhav", "fasal ke bhav", "market rates", "crop prices", "मंडी के रेट", "फसल की कीमत", "फसल के भाव", "mandi", "mandee", "market price", "bazar bhav", "bazaar bhav", "fasal ke daam", "bhav", "भाव", "मंडी", "मण्डी", "फसल के दाम", "ಮಂಡಿ", "বাজার দর"],
  "/disease": ["fasal doctor", "crop check", "patte ki janch", "patti scan", "crop scan", "फसल की जांच", "पत्ते की जांच", "पत्ती स्कैन", "फसल चेक", "crop doctor", "disease", "fasal rog", "fasal ki bimari", "bimari", "beemari", "फसल डॉक्टर", "क्रॉप डॉक्टर", "फसल की बीमारी", "फसल रोग", "बीमारी", "photo upload", "फोटो", "ಬೆಳೆ ರೋಗ"],
  "/schemes": ["sarkari yojna", "sarkari sahayata", "government schemes", "government benefits", "kisan yojana", "सरकारी सहायता", "किसान योजना", "scheme", "schemes", "yojana", "yojna", "sarkari madad", "subsidy", "anudan", "pm kisan", "योजना", "सरकारी मदद", "सब्सिडी", "अनुदान", "ಯೋಜನೆ", "திட்டங்கள்"],
  "/profile": ["mera account", "meri jankari", "my details", "मेरी जानकारी", "अपनी प्रोफाइल", "profile", "my account", "meri profile", "प्रोफाइल", "प्रोफ़ाइल", "मेरा खाता", "ಪ್ರೊಫೈಲ್"],
  "/settings": ["app settings", "app ki setting", "ऐप सेटिंग", "ऐप की सेटिंग", "settings", "setting", "सेटिंग"],
  "/login": ["log karna hai", "लॉग इन", "साइन इन", "login", "log in", "sign in", "लॉगिन"],
  "/signup": ["naya account", "account banana hai", "create account", "नया खाता", "नया अकाउंट", "अकाउंट बनाना है", "register", "registration", "sign up", "signup", "पंजीकरण"],
  "/crops": ["kheti ki jankari", "kheti ki guide", "cultivation guide", "फसल उगाने की गाइड", "खेती सीखना है", "farming guide", "crop guide", "kheti guide", "खेती गाइड", "खेती की जानकारी"],
  "/crop-predictor": ["kaun si fasal lagau", "konsi fasal lagau", "fasal chunav", "crop selection", "कौन सी फसल लगाऊं", "कौन सी फसल लगाऊँ", "फसल चयन", "crop recommend", "crop predictor", "crop prediction", "fasal sujhav", "फसल सुझाव", "फसल का सुझाव"],
  "/marketplace": ["tractor kiraye par", "machine kiraye par", "kheti ke auzar", "farm machinery", "rent equipment", "ट्रैक्टर किराये पर", "मशीन किराए पर", "खेती के औजार", "marketplace", "market place", "equipment", "tractor", "trakter", "upkaran", "machinery", "dukaan", "kiraya", "कृषि यंत्र", "ट्रैक्टर", "उपकरण", "किराया", "मार्केटप्लेस"],
  "/worker-connect": ["khet ke liye majdoor", "khet mein kaam karne wale", "farm workers", "मजदूर चाहिए", "खेत में काम करने वाले", "खेत के लिए मजदूर", "labour", "labor", "worker", "workers", "majdoor", "mazdoor", "shramik", "मजदूर", "श्रमिक", "कामदार", "ಕಾರ್ಮಿಕ"],
  "/soil-health": ["mitti check", "mitti test", "zameen ki janch", "soil testing", "मिट्टी चेक", "मिट्टी टेस्ट", "जमीन की जांच", "soil health", "soil test", "mitti ki janch", "mitti janch", "मिट्टी की जांच", "मिट्टी जांच", "मिट्टी की जाँच", "मृदा परीक्षण"],
  "/khet-diary": ["kheti ka hisab", "khet ka hisab", "kharcha diary", "farm diary", "farm expenses", "खेत का हिसाब", "खर्च की डायरी", "खेती का खर्च", "diary", "khet diary", "डायरी", "खेती का हिसाब"],
  "/contact": ["team se baat", "customer support", "contact team", "टीम से बात", "सहायता टीम", "contact", "support", "sampark", "संपर्क"],
  "/madad": ["help center", "help centre", "istemal ki madad", "ऐप कैसे चलाएं", "ऐप कैसे चलाएँ", "मदद केंद्र", "help page", "madad", "मदद"],
  "/about": ["kisaanbuddy ke bare mein", "about kisaanbuddy", "किसानबडी के बारे में", "about us", "hamare bare", "हमारे बारे"],
  "/chatbot": ["krishi salahkar", "kisan salahkar", "farming advice", "ask advisor", "कृषि विशेषज्ञ", "किसान सलाहकार", "सलाह लेनी है", "advisor", "agriculture advisor", "salah", "salha", "krishi salah", "सलाह", "सलाहकार"],
};
function normalize(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(new RegExp("[\\p{P}\\p{S}]", "gu"), " ").replace(/\s+/g, " ").trim();
}
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const old = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = old;
    }
  }
  return row[b.length];
}
export function parseNavigation(input: string): Command | null {
  const text = normalize(input.slice(0, 4000));
  // Negation and agricultural questions belong to the advisor, not page navigation.
  if (/\b(not|dont|never|nahi|nahin|mat)\b|\bdon t\b|नहीं|नही|मत(?:\s|$)|ಬೇಡ/.test(text)) return null;
  const open = /\b(open|show|kholo|khol|dikhao|dikha|chalo|jao|le chalo|take me|go to|kholiye|kholna|dikhaiye|dikhaaiye|dikha do)\b|खोल|दिखा|ले चल|जाओ|वाला पेज|वाली स्क्रीन|ತೆರೆ/.test(text);
  if (!open && /\b(why|when|how|kya|kyun|kab|kaise|kitna|kitni|kaun|konsi)\b|क्यों|कब|कैसे|क्या|कौन|कितना|कितनी|आज.*भाव|today.*price/.test(text)) return null;
  const tokens = text.split(" ");
  const scores = new Map<string, number>();
  for (const [route, aliases] of Object.entries(routeAliases)) {
    for (const alias of aliases) {
      const words = normalize(alias).split(" ");
      for (let i = 0; i <= tokens.length - words.length; i++) {
        let score = 0;
        const matches = words.every((word, j) => {
          const token = tokens[i + j];
          if (word === token) { score += 10; return true; }
          // Limit approximate spelling to Latin destination words, and explicit
          // navigation or a bare destination. Never fuzzy-match Hindi matras.
          if (!(open || tokens.length === words.length) || !/^[a-z]{5,}$/.test(word) || !/^[a-z]+$/.test(token) || Math.abs(word.length - token.length) > 1) return false;
          const swapped = word.length === token.length && Array.from(word).some((_, k) =>
            k + 1 < word.length && word.slice(0, k) + word[k + 1] + word[k] + word.slice(k + 2) === token);
          if (distance(word, token) > 1 && !swapped) return false;
          score += 6; return true;
        });
        if (matches) scores.set(route, Math.max(scores.get(route) || 0, score));
      }
    }
  }
  // A conjunction between two requested destinations is not resolved by phrase length.
  if (scores.size > 1 && /\b(and|aur|ya|or)\b|(?:^|\s)(?:और|या)(?:\s|$)/.test(text)) return null;
  const ranked = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
  // Two independent destinations are ambiguous. A longer phrase can disambiguate
  // "sarkari madad" from generic "madad".
  if (ranked.length && (ranked.length === 1 || ranked[0][1] > ranked[1][1] + 4))
    return { type: "navigate", value: ranked[0][0] };
  if (ranked.length) return null;
  if (/\b(go back|previous page|wapas|vaapas|piche|peeche|hindakke|back|pichla page|previous screen)\b|पिछले पेज|पिछला पेज|पिछली स्क्रीन|वापस|पीछे|ಹಿಂದಕ್ಕೆ/.test(text)) return { type: "back" };
  return null;
}
const languageNames: [string, RegExp][] = [
  ["hi", /hindi|हिंदी|हिन्दी/i],
  ["en", /english|अंग्रेजी|अंग्रेज़ी/i],
  ["kn", /kannada|ಕನ್ನಡ|कन्नड़/i],
  ["mr", /marathi|मराठी/i],
  ["bn", /bengali|বাংলা|बंगाली/i],
  ["ta", /tamil|தமிழ்|तमिल/i],
  ["te", /telugu|తెలుగు|तेलुगु/i],
  ["gu", /gujarati|ગુજરાતી|गुजराती/i],
  ["pa", /punjabi|ਪੰਜਾਬੀ|पंजाबी/i],
  ["ml", /malayalam|മലയാളം/i],
  ["or", /odia|oriya|ओडिया|ଓଡ଼ିଆ/i],
  ["bho", /bhojpuri|भोजपुरी/i],
  ["mai", /maithili|मैथिली/i],
];
export function parseCommand(input: string): Command | null {
  const text = input
    .trim()
    .replace(/[।.!?]+$/g, "")
    .trim();
  if (/^(cancel|no|stop|bas karo|band karo|rehne do|रद्द|नहीं|नही|बंद करो|रुको|बस करो|रहने दो)$/i.test(text))
    return { type: "cancel" };
  if (/^(yes|confirm|हाँ|हां|कन्फर्म|पुष्टि करो)$/i.test(text))
    return { type: "confirm" };
  if (/^(pause|pause reading|thoda ruko|padhna roko|रोकें|विराम|थोड़ा रुको|पढ़ना रोको)$/i.test(text)) return { type: "pause" };
  if (/^(resume|continue|continue reading|padhna jari rakho|aage padho|जारी रखो|पढ़ना जारी रखो|आगे पढ़ो)$/i.test(text)) return { type: "resume" };
  if (/^(repeat|again|say that again|repeat that|phir se sunao|dobara sunao|fir se bolo|दोबारा|फिर सुनाओ|फिर से सुनाओ|दोबारा सुनाओ|फिर से बोलो)$/i.test(text)) return { type: "repeat" };
  if (/read.*(page|this|information)|^(?:yeh? page padho|padh kar sunao|page padh do|read aloud)$|पढ़कर|पढ़ के|पेज पढ़ो|पढ़ कर सुनाओ/i.test(text))
    return { type: "read" };
  if (/dark mode|dark theme|डार्क/i.test(text))
    return { type: "theme", value: "dark" };
  if (/light mode|light theme|लाइट|उजाला/i.test(text))
    return { type: "theme", value: "light" };
  if (/language|भाषा/i.test(text)) {
    const found = languageNames.find(([, pattern]) => pattern.test(text));
    return { type: "language", value: found?.[0] };
  }
  const field = text.match(/^(?:my name is|मेरा नाम)\s+(.+?)(?:\s+है)?$/i);
  if (field) return { type: "fill", field: "name", value: field[1] };
  const village = text.match(
    /^(?:my village is|मेरा गांव|मेरा गाँव)\s+(.+?)(?:\s+है)?$/i,
  );
  if (village) return { type: "fill", field: "village", value: village[1] };
  const crop = text.match(/^(?:my crop is|मेरी फसल)\s+(.+?)(?:\s+है)?$/i);
  if (crop) return { type: "fill", field: "crop", value: crop[1] };
  if (/^(next field|अगला फील्ड)$/i.test(text)) return { type: "next-field" };
  if (/^(save form|submit form|फॉर्म जमा करो|फॉर्म सेव करो)$/i.test(text))
    return { type: "submit" };
  return parseNavigation(text);
}
