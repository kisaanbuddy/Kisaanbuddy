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
  ["/weather", /weather|mausam|मौसम|हवामान|ಹವಾಮಾನ|வானிலை|వాతావరణం/i],
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
  if (/^(cancel|no|stop|रद्द|नहीं|नही|बंद करो|रुको)$/i.test(text))
    return { type: "cancel" };
  if (/^(yes|confirm|हाँ|हां|कन्फर्म|पुष्टि करो)$/i.test(text))
    return { type: "confirm" };
  if (/^(pause|रोकें|विराम)$/i.test(text)) return { type: "pause" };
  if (/^(resume|continue|जारी रखो)$/i.test(text)) return { type: "resume" };
  if (/^(repeat|again|दोबारा|फिर सुनाओ)$/i.test(text)) return { type: "repeat" };
  if (/read.*(page|this|information)|पढ़कर|पढ़ के|पेज पढ़ो/i.test(text))
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
  // Questions must not be swallowed by route keywords such as tomato/weather.
  const explicitOpen = /open|show|खोल|दिखाओ|दिखा दो|ತೆರೆ/i.test(text);
  if (
    !explicitOpen &&
    /क्यों|कब|क्या करूं|क्या करूँ|कितना|आज.*भाव|why|when|how|today.*price/i.test(text)
  )
    return null;
  if (/home|होम|मुख्य पृष्ठ/i.test(text)) return { type: "navigate", value: "/" };
  if (/go back|previous page|पिछले पेज|वापस|पीछे/i.test(text))
    return { type: "back" };
  const route = ROUTE_COMMANDS.find(([, pattern]) => pattern.test(text));
  return route ? { type: "navigate", value: route[0] } : null;
}
