/**
 * Deterministic voice-action routing.
 *
 * This deliberately keeps navigation and parameter extraction on the client:
 * a transcript is never used as a database query.  Each destination receives
 * a small, encoded allow-listed parameter set and executes its own real API.
 */
export type VoiceFeature =
  | "home" | "dashboard" | "weather" | "mandi" | "disease" | "crop-predictor" | "schemes"
  | "soil-health" | "soil-monitor" | "khet-diary" | "worker-connect" | "profile"
  | "assistant" | "marketplace" | "buyers" | "sell-crop" | "enam" | "procurement"
  | "settings" | "back"

export interface VoiceAction {
  feature: VoiceFeature
  path: string
  label: string
  params: Record<string, string>
  requiresConfirmation?: boolean
  /** Browser history is a UI-only action and never invokes an API. */
  historyBack?: boolean
}

/** The auditable feature-to-action registry used by the voice router. */
export const VOICE_FEATURE_REGISTRY: Record<VoiceFeature, {
  path: string
  safeActions: string[]
  requiresUserInput?: string
}> = {
  home: { path: "/", safeActions: ["open home"] },
  dashboard: { path: "/dashboard", safeActions: ["open dashboard"] },
  weather: { path: "/weather", safeActions: ["current weather", "forecast", "location search"] },
  mandi: { path: "/mandi", safeActions: ["crop price search", "state filter"] },
  disease: { path: "/disease", safeActions: ["open diagnosis", "pre-fill crop"], requiresUserInput: "A crop photo or symptom description" },
  "crop-predictor": { path: "/crop-predictor", safeActions: ["run recommendation"] },
  schemes: { path: "/schemes", safeActions: ["scheme search", "state filter"] },
  "soil-health": { path: "/soil-health", safeActions: ["open soil recommendation", "pre-fill crop"], requiresUserInput: "Soil-test values" },
  "soil-monitor": { path: "/soil-monitor", safeActions: ["open connected sensor readings"] },
  "khet-diary": { path: "/khet-diary", safeActions: ["open records", "pre-fill entry"], requiresUserInput: "Explicit form submission to save" },
  "worker-connect": { path: "/worker-connect", safeActions: ["worker/job search", "location filter"] },
  profile: { path: "/profile", safeActions: ["open farm profile"] },
  assistant: { path: "/chatbot", safeActions: ["open AI farming assistant"] },
  marketplace: { path: "/marketplace", safeActions: ["open marketplace"] },
  buyers: { path: "/marketplace", safeActions: ["open existing buyer listings", "pre-fill crop filter"] },
  "sell-crop": { path: "/marketplace", safeActions: ["open produce listing form", "pre-fill crop"], requiresUserInput: "Explicit publish confirmation in the existing form" },
  enam: { path: "/mandi", safeActions: ["open eNAM and mandi selling resources"] },
  procurement: { path: "/marketplace", safeActions: ["open available provenance and procurement resources"] },
  settings: { path: "/settings", safeActions: ["open user settings"] },
  back: { path: "", safeActions: ["return to previous page"] },
}

const CROP_WORDS: Array<[RegExp, string]> = [
  [/\b(dhan|paddy|rice|chawal|चावल|धान)\b/i, "Rice"],
  [/\b(gehu|wheat|गेहूं|गेहूँ)\b/i, "Wheat"],
  [/\b(tamatar|tomato|टमाटर)\b/i, "Tomato"],
  [/\b(aloo|potato|आलू)\b/i, "Potato"],
  [/\b(pyaz|onion|प्याज)\b/i, "Onion"],
  [/\b(sarson|mustard|सरसों)\b/i, "Mustard"],
  [/\b(makka|maize|corn|मक्का)\b/i, "Maize"],
  [/\b(kapas|cotton|कपास)\b/i, "Cotton"],
]

const STATES: Array<[RegExp, string]> = [
  [/\b(bihar|बिहार)\b/i, "Bihar"], [/\b(uttar pradesh|up|उत्तर प्रदेश)\b/i, "Uttar Pradesh"],
  [/\b(madhya pradesh|mp|मध्य प्रदेश)\b/i, "Madhya Pradesh"], [/\b(karnataka|कर्नाटक)\b/i, "Karnataka"],
  [/\b(maharashtra|महाराष्ट्र)\b/i, "Maharashtra"], [/\b(rajasthan|राजस्थान)\b/i, "Rajasthan"],
]

function cropFrom(text: string) { return CROP_WORDS.find(([pattern]) => pattern.test(text))?.[1] }
function stateFrom(text: string) { return STATES.find(([pattern]) => pattern.test(text))?.[1] }
function daysFrom(text: string) {
  if (/three days|3 days|teen din|तीन दिन/i.test(text)) return "3"
  if (/next week|7 days|hafta|हफ्ता/i.test(text)) return "7"
  return "1"
}
function cityFrom(text: string) {
  const afterPreposition = text.match(/(?:in|for|ka|ki|के|का|की)\s+([a-zA-Z\u0900-\u097F ]{3,32}?)(?:\s+(?:weather|forecast|mausam|मौसम|kal|tomorrow|aaj|today)|$)/i)?.[1]
  // Natural Hindi/Hinglish phrasing commonly puts the location first:
  // "Samastipur mein gehu ka bhav" or "Samastipur mein mausam".
  const beforeMe = text.match(/(?:^|\b(?:aaj|today|kal|tomorrow)\s+)([a-zA-Z\u0900-\u097F ]{3,32}?)\s+(?:mein|में|\bme\b)\s+/i)?.[1]
  const candidate = (afterPreposition || beforeMe)?.trim().replace(/^(?:aaj|today|kal|tomorrow)\s+/i, "")
  return candidate && !/^(mere|my|gaon|village|field|khet|मेरे|गाँव|गांव|खेत)$/i.test(candidate) ? candidate : undefined
}

/** Language-switch intent is handled locally, so the next turn is transcribed and
 * answered in the requested language without a refresh or remote side effect. */
export function requestedVoiceLanguage(transcript: string): "en" | "hi" | "hi_en" | "kn" | null {
  const text = transcript.trim()
  if (!/(?:language|bhasha|भाषा|भाषा में|ಭಾಷೆ|matlab|speak|baat karo|बात करो|बोलो|samjhao|समझाओ|mein|में|\bme\b|ಹೇಳಿ|ಮಾತನಾಡಿ|ನಲ್ಲಿ)/i.test(text)) return null
  if (/kannada|ಕನ್ನಡ/i.test(text)) return "kn"
  if (/hinglish|हिंग्लिश/i.test(text)) return "hi_en"
  if (/hindi|हिंदी|हिन्दी/i.test(text)) return "hi"
  if (/english|अंग्रेजी|इंग्लिश/i.test(text)) return "en"
  return null
}

export function parseVoiceAction(transcript: string, previous?: VoiceFeature | null): VoiceAction | null {
  const text = transcript.trim()
  const crop = cropFrom(text)
  const state = stateFrom(text)
  const params: Record<string, string> = { voice: "1" }
  if (crop) params.crop = crop
  if (state) params.state = state

  if (/^(?:go |take me |mujhe |मुझे |mala |ನನ್ನನ್ನು )?(?:back|previous|wapas|वापस|piche|पीछे|ಹಿಂದೆ)(?:\s|$)/i.test(text))
    return { feature: "back", path: "", label: "Previous page", params: {}, historyBack: true }
  if (/\b(home|homepage|ghar|मुख्य पृष्ठ|होम पेज|ಮುಖಪುಟ)\b/i.test(text))
    return { feature: "home", path: "/", label: "Home", params }
  if (/\b(dashboard|डैशबोर्ड|डैश बोर्ड|ಡ್ಯಾಶ್‌ಬೋರ್ಡ್)\b/i.test(text))
    return { feature: "dashboard", path: "/dashboard", label: "Dashboard", params }
  if (/\b(settings?|सेटिंग्स|सेटिंग|ಸೆಟ್ಟಿಂಗ್ಸ್)\b/i.test(text))
    return { feature: "settings", path: "/settings", label: "Settings", params }
  if (/\b(ai assistant|farming assistant|chatbot|chat bot|सहायक|चैटबॉट|ಸಹಾಯಕ)\b/i.test(text))
    return { feature: "assistant", path: "/chatbot", label: "AI farming assistant", params }
  if (/\b(enam|e-nam|ईनाम|ई-नाम)\b/i.test(text))
    return { feature: "enam", path: "/mandi", label: "eNAM and mandi selling", params: { ...params, tab: "sell" } }
  if (/\b(fpo|procurement|खरीद केंद्र|प्रोक्योरमेंट|ಸಂಗ್ರಹಣೆ)\b/i.test(text))
    return { feature: "procurement", path: "/marketplace", label: "FPO and procurement resources", params: { ...params, section: "provenance" } }
  if (/\b(find |search |mujhe |मुझे |mere liye |मेरे लिए |ಬೇಡಿಕೆदार )(?:a )?(buyer|buyers|kharidar|खरीदार|व्यापारी|ಬೇಡಿಕೆದಾರ)\b/i.test(text) || /buyer dhoond|खरीदार ढूंढ|ಬೇಡಿಕೆದಾರ/i.test(text))
    return { feature: "buyers", path: "/marketplace", label: "Buyer discovery", params: { ...params, section: "buyers" } }
  if (/\b(sell|bech|बेच|बेचना|ವಿಕ್ರಯ|ಮಾರಾಟ).{0,28}\b(crop|produce|fasal|फसल|अनाज|ಬೆಳೆ)?/i.test(text))
    return { feature: "sell-crop", path: "/marketplace", label: "Sell crop", params: { ...params, action: "sell" }, requiresConfirmation: true }
  if (/\b(marketplace|बाज़ार|बाजार|मार्केटप्लेस|ಮಾರುಕಟ್ಟೆ)\b/i.test(text))
    return { feature: "marketplace", path: "/marketplace", label: "Marketplace", params }

  const weather = /weather|mausam|मौसम|forecast|बारिश|barish|rain|temperature|तापमान/i.test(text)
  if (weather || (previous === "weather" && /kal|tomorrow|aaj|today|agle|next|दिन|din/i.test(text))) {
    params.days = daysFrom(text)
    const city = cityFrom(text)
    if (city) params.city = city
    return { feature: "weather", path: "/weather", label: "Weather", params }
  }
  if (/mandi|price|rate|bhav|भाव|दाम|कीमत/i.test(text) || (previous === "mandi" && !!crop)) {
    const location = cityFrom(text)
    if (location) params.district = location
    return { feature: "mandi", path: "/mandi", label: "Mandi prices", params }
  }
  if (/disease|bimari|बीमारी|रोग|leaf|patti|पत्ती|photo|फोटो/i.test(text))
    return { feature: "disease", path: "/disease", label: "Disease detection", params }
  if (/scheme|yojana|योजना|subsidy|सरकारी/i.test(text))
    return { feature: "schemes", path: "/schemes", label: "Government schemes", params }
  if (/soil health|fertilizer|उर्वरक|खाद|soil recommendation|मिट्टी/i.test(text))
    return { feature: "soil-health", path: "/soil-health", label: "Soil health", params }
  if (/sensor|soil monitor|नमी|moisture/i.test(text))
    return { feature: "soil-monitor", path: "/soil-monitor", label: "Soil monitor", params }
  if (/crop predictor|suitable crop|कौन सी फसल|फसल.*सुझाव/i.test(text))
    return { feature: "crop-predictor", path: "/crop-predictor", label: "Crop predictor", params }
  if (/khet diary|खेत डायरी|diary|बहीखाता|irrigation entry|सिंचाई.*entry/i.test(text)) {
    if (/add|जोड़|save|सेव|entry/i.test(text)) {
      params.activity = /irrigation|सिंचाई/i.test(text) ? "Irrigation" : ""
      return { feature: "khet-diary", path: "/khet-diary", label: "Khet Diary", params, requiresConfirmation: true }
    }
    return { feature: "khet-diary", path: "/khet-diary", label: "Khet Diary", params }
  }
  if (/worker|mazdoor|मजदूर|labour|labor|कामगार/i.test(text))
    return { feature: "worker-connect", path: "/worker-connect", label: "Worker Connect", params: { ...params, mode: "find" } }
  if (/farm profile|farm map|map kholo|farm details|my profile|mera profile|मेरा प्रोफाइल|मेरी खेत प्रोफ़ाइल|ನನ್ನ ಫಾರ್ಮ್/i.test(text))
    return { feature: "profile", path: "/profile", label: "Farm profile", params }
  return null
}

export function voiceActionUrl(action: VoiceAction) {
  if (action.historyBack) return ""
  const query = new URLSearchParams(action.params)
  return `${action.path}?${query.toString()}`
}

export function actionAcknowledgement(action: VoiceAction, langOrHindi: string | boolean): string {
  const lang = typeof langOrHindi === "boolean" ? (langOrHindi ? "hi" : "en") : (langOrHindi || "en")
  
  if (action.historyBack) {
    if (lang === "kn") return "ಹಿಂದಿನ ಪುಟಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇನೆ."
    if (lang === "hi" || lang === "hi_en") return "पिछले पेज पर वापस जा रहा हूँ।"
    return "Going back to the previous page."
  }

  if (action.requiresConfirmation) {
    switch (lang) {
      case "kn":
        return `${action.label} ತೆರೆಯಲಾಗುತ್ತಿದೆ. ನಾನು ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡುತ್ತೇನೆ, ಆದರೆ ಉಳಿಸುವ ಮೊದಲು ನಿಮ್ಮ ದೃಢೀಕರಣ ಪಡೆಯುತ್ತೇನೆ.`
      case "te":
        return `${action.label} తెరవబడుతోంది. నేను వివరాలను నింపుతాను, కానీ సేవ్ చేసే ముందు మీ నిర్ధారణ తీసుకుంటాను.`
      case "ta":
        return `${action.label} திறக்கப்படுகிறது. நான் விவரங்களை நிரப்புவேன், ஆனால் சேமிப்பதற்கு முன் உங்கள் உறுதிப்படுத்தலைக் கேட்பேன்.`
      case "mr":
        return `${action.label} उघडत आहे. मी तपशील भरेन, परंतु सेव्ह करण्यापूर्वी तुमची पुष्टी घेईन.`
      case "gu":
        return `${action.label} ખુલી રહ્યું છે. હું વિગતો ભરીશ, પરંતુ સેવ કરતા પહેલા તમારી પુષ્ટિ લઈશ.`
      case "bn":
        return `${action.label} খোলা হচ্ছে। আমি বিবরণ পূরণ করব, তবে সংরক্ষণ করার আগে আপনার সম্মতি নেব।`
      case "pa":
        return `${action.label} ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ। ਮੈਂ ਵੇਰਵੇ ਭਰਾਂਗਾ, ਪਰ ਸੇਵ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਤੁਹਾਡੀ ਪੁਸ਼ਟੀ ਲਵਾਂਗਾ।`
      case "ml":
        return `${action.label} തുറക്കുന്നു. ഞാൻ വിവരങ്ങൾ പൂരിപ്പിക്കും, എന്നാൽ സേവ് ചെയ്യുന്നതിന് മുൻപ് അനുമതി ചോദിക്കും.`
      case "hi":
      case "hi_en":
        return `${action.label} खुल रहा है। मैं विवरण भरूँगा, लेकिन सेव करने से पहले आपकी पुष्टि लूँगा।`
      default:
        return `Opening ${action.label}. I will fill the details, but will ask before saving.`
    }
  }

  switch (lang) {
    case "kn":
      return `${action.label} ತೆರೆಯಲಾಗುತ್ತಿದೆ ಮತ್ತು ಲಭ್ಯವಿರುವ ಮಾಹಿತಿಯನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ.`
    case "te":
      return `${action.label} తెరవబడుతోంది మరియు అందుబాటులో ఉన్న సమాచారాన్ని శోధిస్తున్నాను.`
    case "ta":
      return `${action.label} திறக்கப்படுகிறது மற்றும் கிடைக்கும் தகவல்கள் தேடப்படுகின்றன.`
    case "mr":
      return `${action.label} उघडत आहे आणि उपलब्ध माहिती शोधत आहे.`
    case "gu":
      return `${action.label} ખુલી રહ્યું છે અને ઉપલબ્ધ માહિતી શોધી રહ્યું છે.`
    case "bn":
      return `${action.label} খোলা হচ্ছে এবং উপলব্ধ তথ্য অনুসন্ধান করা হচ্ছে।`
    case "pa":
      return `${action.label} ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ ਅਤੇ ਉਪਲਬਧ ਜਾਣਕਾਰੀ ਲੱਭ ਰਿਹਾ ਹਾਂ।`
    case "ml":
      return `${action.label} തുറക്കുന്നു, ലഭ്യമായ വിവരങ്ങൾ തിരയുന്നു.`
    case "hi":
    case "hi_en":
      return `${action.label} खोल रहा हूँ और उपलब्ध जानकारी खोज रहा हूँ।`
    default:
      return `Opening ${action.label} and searching the available information.`
  }
}

