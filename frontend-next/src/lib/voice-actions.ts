/**
 * Deterministic voice-action routing.
 *
 * This deliberately keeps navigation and parameter extraction on the client:
 * a transcript is never used as a database query.  Each destination receives
 * a small, encoded allow-listed parameter set and executes its own real API.
 */
export type VoiceFeature =
  | "weather" | "mandi" | "disease" | "crop-predictor" | "schemes"
  | "soil-health" | "soil-monitor" | "khet-diary" | "worker-connect" | "profile"

export interface VoiceAction {
  feature: VoiceFeature
  path: string
  label: string
  params: Record<string, string>
  requiresConfirmation?: boolean
}

/** The auditable feature-to-action registry used by the voice router. */
export const VOICE_FEATURE_REGISTRY: Record<VoiceFeature, {
  path: string
  safeActions: string[]
  requiresUserInput?: string
}> = {
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
  const match = text.match(/(?:in|for|ka|ki|के|का|की)\s+([a-zA-Z\u0900-\u097F ]{3,32}?)(?:\s+(?:weather|forecast|mausam|मौसम|kal|tomorrow|aaj|today)|$)/i)
  const candidate = match?.[1]?.trim()
  return candidate && !/^(mere|my|gaon|village|field|khet|मेरे|गाँव|गांव|खेत)$/i.test(candidate) ? candidate : undefined
}

export function parseVoiceAction(transcript: string, previous?: VoiceFeature | null): VoiceAction | null {
  const text = transcript.trim()
  const crop = cropFrom(text)
  const state = stateFrom(text)
  const params: Record<string, string> = { voice: "1" }
  if (crop) params.crop = crop
  if (state) params.state = state

  const weather = /weather|mausam|मौसम|forecast|बारिश|barish|rain|temperature|तापमान/i.test(text)
  if (weather || (previous === "weather" && /kal|tomorrow|aaj|today|agle|next|दिन|din/i.test(text))) {
    params.days = daysFrom(text)
    const city = cityFrom(text)
    if (city) params.city = city
    return { feature: "weather", path: "/weather", label: "Weather", params }
  }
  if (/mandi|price|rate|bhav|भाव|दाम|कीमत/i.test(text) || (previous === "mandi" && !!crop))
    return { feature: "mandi", path: "/mandi", label: "Mandi prices", params }
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
  if (/farm map|map kholo|farm details|मेरे खेत की details/i.test(text))
    return { feature: "profile", path: "/profile", label: "Farm profile", params }
  return null
}

export function voiceActionUrl(action: VoiceAction) {
  const query = new URLSearchParams(action.params)
  return `${action.path}?${query.toString()}`
}

export function actionAcknowledgement(action: VoiceAction, hindi: boolean) {
  if (action.requiresConfirmation) return hindi
    ? `${action.label} खुल रहा है। मैं विवरण भरूँगा, लेकिन सेव करने से पहले आपकी पुष्टि लूँगा।`
    : `Opening ${action.label}. I will fill the details, but will ask before saving.`
  return hindi ? `${action.label} खोल रहा हूँ और उपलब्ध जानकारी खोज रहा हूँ।` : `Opening ${action.label} and searching the available information.`
}
