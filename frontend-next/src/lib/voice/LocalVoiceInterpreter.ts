/**
 * High-speed local client-side Voice Command Interpreter for KisaanBuddy.
 *
 * Guarantees instantaneous (0ms) zero-network website control for farmer voice commands
 * across Hindi, Hinglish, English, and Kannada.
 */

import type { VoiceAction } from "./ActionRegistry";

export interface InterpretationResult {
  action: VoiceAction;
  reply_text: string;
  handledLocally: boolean;
}

export interface PageContextSnapshot {
  current_route?: string;
  visible_items?: Array<{ id: string | number; name: string; price?: number; [k: string]: any }>;
  selected_item?: any;
  cart_items?: any[];
  cart_total?: number;
  pending_action?: any;
}

const NUMBER_MAP: Record<string, number> = {
  // English
  "first": 1, "1st": 1, "one": 1, "second": 2, "2nd": 2, "two": 2,
  "third": 3, "3rd": 3, "three": 3, "fourth": 4, "4th": 4, "four": 4,
  "fifth": 5, "5th": 5, "five": 5,
  // Hinglish / Hindi
  "pehla": 1, "ek": 1, "dusra": 2, "do": 2, "teesra": 3, "teen": 3,
  "chautha": 4, "char": 4, "chaar": 4, "panchwa": 5, "panch": 5,
  // Devanagari
  "पहला": 1, "दूसरा": 2, "तीसरा": 3, "चौथा": 4, "पांचवा": 5,
  // Kannada
  "ondaneya": 1, "modala": 1, "ಒಂದನೇ": 1, "ಮೊದಲ": 1,
  "eradaneya": 2, "ಎರಡನೇ": 2, "ಎರಡನೆಯ": 2,
  "mooruneya": 3, "ಮೂರನೇ": 3,
  "naalkaneya": 4, "ನಾಲ್ಕನೇ": 4,
  "aidaneya": 5, "ಐದನೇ": 5,
};

function getLocalizedReply(
  lang: string,
  hi: string,
  kn: string,
  en: string
): string {
  if (lang === "kn") return kn;
  if (lang === "en") return en;
  return hi;
}

/**
 * Interpret farmer transcript locally with zero network round-trip.
 */
export function interpretLocally(
  transcript: string,
  context: PageContextSnapshot,
  preferredLang: string = "hi"
): InterpretationResult | null {
  const clean = (transcript || "").trim();
  if (!clean) return null;

  const lower = clean.toLowerCase();
  const lang = preferredLang || "hi";

  // 1. Pending Confirmation Handling
  if (context.pending_action) {
    const isConfirm =
      /\b(yes|haan|ha|confirm|kardo|kar do|theek hai|thik hai|sahi hai|ho|sari|houthu|proceed|bilkul)\b/i.test(lower) ||
      /[हाँ|कन्फर्म|हೌದು|ಖಚಿತಪಡಿಸಿ]/.test(clean);
    const isCancel =
      /\b(no|nahi|na|cancel|roko|mat karo|beda|bedi|stop|rehne do|hatao|chhod do)\b/i.test(lower) ||
      /[नहीं|रद्द|ಬೇಡ]/.test(clean);

    if (isConfirm) {
      const pType = context.pending_action.type;
      return {
        action: {
          action_type: "CONFIRM_ACTION",
          payload: { confirmed_action: pType, order_data: context.pending_action.payload || {} },
          safety_level: "SAFE",
          requires_confirmation: false,
        },
        reply_text: getLocalizedReply(
          lang,
          "आदेश की पुष्टि कर दी गई है।",
          "ಕ್ರಿಯೆಯನ್ನು ಖಚಿತಪಡಿಸಲಾಗಿದೆ.",
          "Action confirmed successfully."
        ),
        handledLocally: true,
      };
    }

    if (isCancel) {
      return {
        action: {
          action_type: "CANCEL_ACTION",
          payload: {},
          safety_level: "SAFE",
          requires_confirmation: false,
        },
        reply_text: getLocalizedReply(
          lang,
          "कार्य रद्द कर दिया गया है।",
          "ಕ್ರಿಯೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.",
          "Action cancelled."
        ),
        handledLocally: true,
      };
    }
  }

  // 2. Navigation: Go Back
  if (
    /\b(go back|wapas|piche|peeche|hindakke|back)\b/i.test(lower) ||
    clean.includes("वापस") ||
    clean.includes("पीछे") ||
    clean.includes("ಹಿಂದಕ್ಕೆ")
  ) {
    return {
      action: { action_type: "GO_BACK", payload: {}, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "पीछे जा रहे हैं।", "ಹಿಂದಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.", "Going back."),
      handledLocally: true,
    };
  }

  // 3. Navigation: Home
  if (
    /\b(home|home page|mukhya prishth|maneyige|shuruat|main page|start)\b/i.test(lower) ||
    clean.includes("होम") ||
    clean.includes("मुख्य पृष्ठ") ||
    clean.includes("ಮುಖಪುಟ")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "होम पेज खोल रहे हैं।", "ಮುಖಪುಟಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.", "Opening home page."),
      handledLocally: true,
    };
  }

  // 4. Navigation: Marketplace (High Priority)
  // Check marketplace before generic mandi words when "marketplace", "bazaar", "dukaan" are spoken
  const isMarketplace =
    /\b(marketplace|market place|bazaar|bazar|dukaan|equipment|upkaran|tractor|trakter|machinery|rotavator|rent|kiraya|bhaada)\b/i.test(lower) ||
    clean.includes("मार्केटप्लेस") ||
    clean.includes("बाज़ार") ||
    clean.includes("ट्रैक्टर") ||
    clean.includes("उपकरण") ||
    clean.includes("ಮಾರುಕಟ್ಟೆ") ||
    clean.includes("ಮಾರ್ಕೆಟ್‌ಪ್ಲೇಸ್");

  const hasMandiBhav =
    /\b(mandi bhav|mandi price|mandi rate|bhav|rates|dharagalu)\b/i.test(lower) ||
    clean.includes("मंडी भाव") ||
    clean.includes("भाव") ||
    clean.includes("ದರ");

  if (isMarketplace && !hasMandiBhav) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/marketplace" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(
        lang,
        "कृषि उपकरण व ट्रैक्टर मार्केटप्लेस खोल रहे हैं।",
        "ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಟ್ರ್ಯಾಕ್ಟರ್ ವಿಭಾಗ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.",
        "Opening marketplace and machinery."
      ),
      handledLocally: true,
    };
  }

  // 5. Navigation: Mandi Prices
  if (
    /\b(mandi|mandi bhav|mandi price|mandi dar|bhav|rates|mandi rates)\b/i.test(lower) ||
    clean.includes("मंडी") ||
    clean.includes("मंडी भाव") ||
    clean.includes("ದರ") ||
    clean.includes("ಮಂಡಿ")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/mandi" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "लाइव मंडी भाव खोल रहे हैं।", "ಲೈವ್ ಮಂಡಿ ದರಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening live mandi prices."),
      handledLocally: true,
    };
  }

  // 6. Navigation: Weather / Mausam
  if (
    /\b(weather|mausam|barish|baarish|havamana|rain|rainfall|forecast|barsaat|tapman)\b/i.test(lower) ||
    clean.includes("मौसम") ||
    clean.includes("बारिश") ||
    clean.includes("हवामान") ||
    clean.includes("ಹವಾಮಾನ") ||
    clean.includes("ಮಳೆ")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/weather" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "मौसम पूर्वानुमान व बारिश अलर्ट खोल रहे हैं।", "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening weather forecast and rain alerts."),
      handledLocally: true,
    };
  }

  // 7. Navigation: Crop Doctor / Disease Diagnosis
  if (
    /\b(crop doctor|disease|fasal rog|bimari|beemari|doctor|kisan doctor|beley roga|dhabbe|keeda|keede|rog|tamatar|fungus|blight)\b/i.test(lower) ||
    clean.includes("क्रॉप डॉक्टर") ||
    clean.includes("फसल रोग") ||
    clean.includes("बीमारी") ||
    clean.includes("रोग") ||
    clean.includes("कीड़ा") ||
    clean.includes("टमाटर") ||
    clean.includes("ಕ್ರಾಪ್ ಡಾಕ್ಟರ್") ||
    clean.includes("ಬೆಳೆ ರೋಗ")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/disease" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(
        lang,
        "क्रॉप डॉक्टर खोल रहे हैं। यहां पत्ती स्कैन कर रोग का उपचार पाएं।",
        "ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ. ಬೆಳೆ ರೋಗ ತಪಾಸಣೆ ಮಾಡಬಹುದು.",
        "Opening Crop Doctor for disease diagnosis."
      ),
      handledLocally: true,
    };
  }

  // 8. Navigation: Agricultural Labour / Worker Connect
  if (
    /\b(labour|labor|workers|worker|majdoor|mazdoor|kamdar|karmikaru|shramik|mazduri)\b/i.test(lower) ||
    clean.includes("मजदूर") ||
    clean.includes("श्रमिक") ||
    clean.includes("कामदार") ||
    clean.includes("मजदूरी") ||
    clean.includes("ಕಾರ್ಮಿಕ")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/worker-connect" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "कृषि मजदूर सेवा खोल रहे हैं।", "ಕೃಷಿ ಕಾರ್ಮಿಕರ ವಿಭಾಗ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening agricultural labour connect."),
      handledLocally: true,
    };
  }

  // 8.5 Navigation: AI Agriculture Advisor (Fertilizer, Seeds, Agronomy)
  if (
    /\b(fertilizer|fertilizers|khad|khaad|urea|dap|potash|pesticide|keetnashak|dawa|davai|beej|seed|seeds|salha|salah|advisor|krishi salah|agronomist|crop advice|poshan|dosage|spray|chhidkaw)\b/i.test(lower) ||
    clean.includes("खाद") ||
    clean.includes("उर्वरक") ||
    clean.includes("कीटनाशक") ||
    clean.includes("दवाई") ||
    clean.includes("बीज") ||
    clean.includes("सलाह") ||
    clean.includes("गೊಬ್ಬರ") ||
    clean.includes("ಗೊಬ್ಬರ") ||
    clean.includes("ಔಷಧಿ") ||
    clean.includes("ಬೀಜ")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/chatbot" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(
        lang,
        "कृषि सलाहकार खोल रहे हैं। यहां खाद, बीज और फसलों की सही जानकारी पाएं।",
        "ಕೃಷಿ ಸಲಹೆಗಾರರನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇವೆ. ರಸಗೊಬ್ಬರ, ಬೀಜ ಮತ್ತು ಕೀಟನಾಶಕಗಳ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.",
        "Opening AI Agriculture Advisor for fertilizer and crop guidance."
      ),
      handledLocally: true,
    };
  }

  // 9. Navigation: Government Schemes
  if (
    /\b(schemes|scheme|yojana|sarkari yojana|pm kisan|subsidy|anudan|bima)\b/i.test(lower) ||
    clean.includes("योजना") ||
    clean.includes("सरकारी योजना") ||
    clean.includes("सब्सिडी") ||
    clean.includes("ಯೋಜನೆ") ||
    clean.includes("ಸರ್ಕಾರಿ ಯೋಜನೆ")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/schemes" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "सरकारी कृषि योजनाएं खोल रहे हैं।", "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening government schemes."),
      handledLocally: true,
    };
  }

  // 10. Navigation: Farm Profile
  if (
    /\b(profile|my profile|farm profile|khet profile|kisan profile|zameen)\b/i.test(lower) ||
    clean.includes("प्रोफाइल") ||
    clean.includes("किसान प्रोफाइल") ||
    clean.includes("ಪ್ರೊಫೈಲ್")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/farmer-profile" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "फार्म प्रोफाइल खोल रहे हैं।", "ನಿಮ್ಮ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening farm profile."),
      handledLocally: true,
    };
  }

  // 10.1 Cart Actions: Clear Cart (Checked BEFORE generic cart navigation)
  if (
    /\b(clear cart|empty cart|cart khali|cart saaf|cart clear)\b/i.test(lower) ||
    clean.includes("कार्ट खाली") ||
    clean.includes("ಕಾರ್ಟ್ ತೆರವುಗೊಳಿಸಿ")
  ) {
    return {
      action: { action_type: "CLEAR_CART", payload: {}, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "कार्ट खाली कर दिया गया है।", "ಕಾರ್ಟ್ ತೆರವುಗೊಳಿಸಲಾಗಿದೆ.", "Cart has been cleared."),
      handledLocally: true,
    };
  }

  // 10.2 Cart Actions: Place Order (Checked BEFORE generic cart navigation)
  if (
    /\b(place order|order karo|order place|kharid lo|order confirm)\b/i.test(lower) ||
    clean.includes("ऑर्डर करो") ||
    clean.includes("ಆರ್ಡರ್ ಮಾಡಿ")
  ) {
    const total = context.cart_total || 0;
    return {
      action: {
        action_type: "AWAIT_CONFIRMATION",
        payload: { action_to_confirm: "PLACE_ORDER", total_amount: total },
        safety_level: "REQUIRES_CONFIRMATION",
        requires_confirmation: true,
      },
      reply_text: getLocalizedReply(
        lang,
        `क्या आप ₹${total.toLocaleString("en-IN")} का यह ऑर्डर प्लेस करना चाहते हैं? पुष्टि के लिए 'हाँ' बोलें।`,
        `ನೀವು ₹${total.toLocaleString("en-IN")} ಮೌಲ್ಯದ ಆರ್ಡರ್ ಖಚಿತಪಡಿಸಲು ಬಯಸುವಿರಾ? 'ಹೌದು' ಎಂದು ಹೇಳಿ.`,
        `Confirm placing this order for ₹${total.toLocaleString("en-IN")}? Say 'Yes' to confirm.`
      ),
      handledLocally: true,
    };
  }

  // 10.3 Cart Actions: Add to Cart (Checked BEFORE generic cart navigation)
  if (
    /\b(add to cart|cart me dalo|cart me add|cart jodo|kartige serisi)\b/i.test(lower) ||
    clean.includes("कार्ट में जोड़ो") ||
    clean.includes("ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ")
  ) {
    const itemToAdd = context.selected_item || (context.visible_items && context.visible_items[0]);
    if (itemToAdd) {
      return {
        action: { action_type: "ADD_TO_CART", payload: itemToAdd, safety_level: "SAFE", requires_confirmation: false },
        reply_text: getLocalizedReply(
          lang,
          `'${itemToAdd.name || "उत्पाद"}' कार्ट में जोड़ दिया गया है।`,
          `'${itemToAdd.name || "ಉತ್ಪನ್ನ"}' ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ.`,
          `Added '${itemToAdd.name || "product"}' to cart.`
        ),
        handledLocally: true,
      };
    }
  }

  // 11. Navigation: Orders & Cart
  if (
    /\b(orders|my orders|order history|cart|my cart|trolley|kharidari)\b/i.test(lower) ||
    clean.includes("ऑर्डर्स") ||
    clean.includes("कार्ट") ||
    clean.includes("ಆರ್ಡರ್ಸ್") ||
    clean.includes("ಕಾರ್ಟ್")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/orders" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "आपके ऑर्डर्स और कार्ट खोल रहे हैं।", "ನಿಮ್ಮ ಆರ್ಡರ್ಸ್ ಮತ್ತು ಕಾರ್ಟ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening orders and cart."),
      handledLocally: true,
    };
  }

  // 12. Navigation: Satellite Intelligence
  if (
    /\b(satellite|satellite view|upgrah|ndvi|remote sensing)\b/i.test(lower) ||
    clean.includes("सैटेलाइट") ||
    clean.includes("उपग्रह") ||
    clean.includes("ಉಪಗ್ರಹ")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/satellite" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "सैटेलाइट इंटेलिजेंस खोल रहे हैं।", "ಉಪಗ್ರಹ ಇಂಟೆಲಿಜೆನ್ಸ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening satellite intelligence."),
      handledLocally: true,
    };
  }

  // 13. Navigation: Soil Health / Soil Test
  if (
    /\b(soil health|soil test|mitti|mitti ki janch|soil card)\b/i.test(lower) ||
    clean.includes("मिट्टी") ||
    clean.includes("मಣ್ಣಿನ ಆರೋಗ್ಯ")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/soil-health" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "मिट्टी स्वास्थ्य पेज खोल रहे हैं।", "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಪುಟ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening soil health."),
      handledLocally: true,
    };
  }

  // 14. Navigation: Khet Diary
  if (
    /\b(khet diary|diary|hisaab|khata|khet khata)\b/i.test(lower) ||
    clean.includes("डायरी") ||
    clean.includes("ಖೇತ್ ಡೈರಿ")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/khet-diary" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "खेत डायरी खोल रहे हैं।", "ಖೇತ್ ಡೈರಿ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening Khet Diary."),
      handledLocally: true,
    };
  }

  // 15. Navigation: Crop Predictor
  if (
    /\b(crop predictor|fasal anuman|crop prediction)\b/i.test(lower) ||
    clean.includes("फसल अनुमान") ||
    clean.includes("ಬೆಳೆ ಊಹೆ")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/crop-predictor" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "फसल अनुमानक खोल रहे हैं।", "ಬೆಳೆ ಊಹೆ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening Crop Predictor."),
      handledLocally: true,
    };
  }

  // 16. Navigation: Features
  if (
    /\b(features|suvidha|suvidhayein|all features)\b/i.test(lower) ||
    clean.includes("फीचर्स") ||
    clean.includes("सुविधाएं")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/features" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "सभी फीचर्स खोल रहे हैं।", "ಎಲ್ಲಾ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening features overview."),
      handledLocally: true,
    };
  }

  // 17. Navigation: Dashboard
  if (
    /\b(dashboard|my dashboard)\b/i.test(lower) ||
    clean.includes("डैशबोर्ड") ||
    clean.includes("ಡ್ಯಾಶ್‌ಬೋರ್ಡ್")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/dashboard" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "डैशबोर्ड खोल रहे हैं।", "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening dashboard."),
      handledLocally: true,
    };
  }

  // 18. Navigation: Settings
  if (
    /\b(settings|setting)\b/i.test(lower) ||
    clean.includes("सेटिंग्स") ||
    clean.includes("ಸೆಟ್ಟಿಂಗ್ಸ್")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/settings" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "सेटिंग्स खोल रहे हैं।", "ಸೆಟ್ಟಿಂಗ್ಸ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening settings."),
      handledLocally: true,
    };
  }

  // 19. Navigation: Help / Chat
  if (
    /\b(madad|help|sahayata|chatbot|chat)\b/i.test(lower) ||
    clean.includes("मदद") ||
    clean.includes("सहायता")
  ) {
    return {
      action: { action_type: "NAVIGATE", payload: { path: "/chat" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "सहायता चैट खोल रहे हैं।", "ಸಹಾಯ ಚಾಟ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening assistant chat."),
      handledLocally: true,
    };
  }

  // 20. Theme: Dark Mode
  if (
    /\b(dark mode|night mode|dark theme|kala mode)\b/i.test(lower) ||
    clean.includes("डार्क मोड") ||
    clean.includes("ಡಾರ್ಕ್ ಮೋಡ್")
  ) {
    return {
      action: { action_type: "TOGGLE_THEME", payload: { theme: "dark" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "डार्क मोड चालू कर दिया गया है।", "ಡಾರ್ಕ್ ಮೋಡ್ ಆನ್ ಮಾಡಲಾಗಿದೆ.", "Dark mode activated."),
      handledLocally: true,
    };
  }

  // 21. Theme: Light Mode
  if (
    /\b(light mode|day mode|light theme|safed mode)\b/i.test(lower) ||
    clean.includes("लाइट मोड") ||
    clean.includes("ಲೈಟ್ ಮೋಡ್")
  ) {
    return {
      action: { action_type: "TOGGLE_THEME", payload: { theme: "light" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "लाइट मोड चालू कर दिया गया है।", "ಲೈಟ್ ಮೋಡ್ ಆನ್ ಮಾಡಲಾಗಿದೆ.", "Light mode activated."),
      handledLocally: true,
    };
  }

  // 22. Language Switch: Kannada
  if (
    /\b(kannada|kannad|kannadalli)\b/i.test(lower) ||
    clean.includes("ಕನ್ನಡ") ||
    clean.includes("कन्नड़") ||
    clean.includes("कन्नड")
  ) {
    return {
      action: { action_type: "CHANGE_LANGUAGE", payload: { language: "kn" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: "ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
      handledLocally: true,
    };
  }

  // 23. Language Switch: Hindi
  if (
    /\b(hindi|hindi mein|hindi karo|hindi bhasha)\b/i.test(lower) ||
    clean.includes("हिन्दी") ||
    clean.includes("हिंदी")
  ) {
    return {
      action: { action_type: "CHANGE_LANGUAGE", payload: { language: "hi" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: "भाषा बदलकर हिन्दी कर दी गई है। बोलिए, मैं क्या सहायता करूँ?",
      handledLocally: true,
    };
  }

  // 24. Language Switch: English
  if (
    /\b(english|english mein|switch to english|english karo|english bhasha)\b/i.test(lower) ||
    clean.includes("अंग्रेजी") ||
    clean.includes("इंग्लिश")
  ) {
    return {
      action: { action_type: "CHANGE_LANGUAGE", payload: { language: "en" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: "Switched language to English. How can I help you?",
      handledLocally: true,
    };
  }

  // 25. Notifications
  if (
    /\b(notifications|notification|suchna|alerts|suchnayein)\b/i.test(lower) ||
    clean.includes("सूचनाएं") ||
    clean.includes("ಸೂಚನೆಗಳು")
  ) {
    return {
      action: { action_type: "OPEN_NOTIFICATIONS", payload: {}, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "नोटिफ़िकेशन पैनल खोल रहे हैं।", "ಸೂಚನೆಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", "Opening notifications."),
      handledLocally: true,
    };
  }

  // 26. Scroll Controls
  if (/\b(scroll to top|top pe|sabse upar)\b/i.test(lower)) {
    return {
      action: { action_type: "SCROLL", payload: { direction: "top" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "पेज के शीर्ष पर जा रहे हैं।", "ಪುಟದ ಮೇಲಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.", "Scrolling to top."),
      handledLocally: true,
    };
  }
  if (/\b(scroll to bottom|bottom pe|sabse niche)\b/i.test(lower)) {
    return {
      action: { action_type: "SCROLL", payload: { direction: "bottom" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "पेज के अंत में जा रहे हैं।", "ಪುಟದ ಕೆಳಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.", "Scrolling to bottom."),
      handledLocally: true,
    };
  }
  if (/\b(scroll down|niche jao|niche scroll|neeche|thoda niche)\b/i.test(lower) || clean.includes("नीचे") || clean.includes("ಕೆಳಗೆ")) {
    return {
      action: { action_type: "SCROLL", payload: { direction: "down" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "नीचे स्क्रॉल किया जा रहा है।", "ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಲಾಗುತ್ತಿದೆ.", "Scrolling down."),
      handledLocally: true,
    };
  }
  if (/\b(scroll up|upar jao|upar scroll|thoda upar)\b/i.test(lower) || clean.includes("ऊपर") || clean.includes("ಮೇಲೆ")) {
    return {
      action: { action_type: "SCROLL", payload: { direction: "up" }, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "ऊपर स्क्रॉल किया जा रहा है।", "ಮೇಲಕ್ಕೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಲಾಗುತ್ತಿದೆ.", "Scrolling up."),
      handledLocally: true,
    };
  }

  // 27. Cart Actions: Clear Cart
  if (
    /\b(clear cart|empty cart|cart khali|cart saaf)\b/i.test(lower) ||
    clean.includes("कार्ट खाली") ||
    clean.includes("ಕಾರ್ಟ್ ತೆರವುಗೊಳಿಸಿ")
  ) {
    return {
      action: { action_type: "CLEAR_CART", payload: {}, safety_level: "SAFE", requires_confirmation: false },
      reply_text: getLocalizedReply(lang, "कार्ट खाली कर दिया गया है।", "ಕಾರ್ಟ್ ತೆರವುಗೊಳಿಸಲಾಗಿದೆ.", "Cart has been cleared."),
      handledLocally: true,
    };
  }

  // 28. Cart Actions: Place Order
  if (
    /\b(place order|order karo|order place|kharid lo|order confirm)\b/i.test(lower) ||
    clean.includes("ऑर्डर करो") ||
    clean.includes("ಆರ್ಡರ್ ಮಾಡಿ")
  ) {
    const total = context.cart_total || 0;
    return {
      action: {
        action_type: "AWAIT_CONFIRMATION",
        payload: { action_to_confirm: "PLACE_ORDER", total_amount: total },
        safety_level: "REQUIRES_CONFIRMATION",
        requires_confirmation: true,
      },
      reply_text: getLocalizedReply(
        lang,
        `क्या आप ₹${total.toLocaleString("en-IN")} का यह ऑर्डर प्लेस करना चाहते हैं? पुष्टि के लिए 'हाँ' बोलें।`,
        `ನೀವು ₹${total.toLocaleString("en-IN")} ಮೌಲ್ಯದ ಆರ್ಡರ್ ಖಚಿತಪಡಿಸಲು ಬಯಸುವಿರಾ? 'ಹೌದು' ಎಂದು ಹೇಳಿ.`,
        `Confirm placing this order for ₹${total.toLocaleString("en-IN")}? Say 'Yes' to confirm.`
      ),
      handledLocally: true,
    };
  }

  // 29. Cart Actions: Add to Cart
  if (
    /\b(add to cart|cart me dalo|cart me add|cart jodo|kartige serisi)\b/i.test(lower) ||
    clean.includes("कार्ट में जोड़ो") ||
    clean.includes("ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ")
  ) {
    const itemToAdd = context.selected_item || (context.visible_items && context.visible_items[0]);
    if (itemToAdd) {
      return {
        action: { action_type: "ADD_TO_CART", payload: itemToAdd, safety_level: "SAFE", requires_confirmation: false },
        reply_text: getLocalizedReply(
          lang,
          `'${itemToAdd.name || "उत्पाद"}' कार्ट में जोड़ दिया गया है।`,
          `'${itemToAdd.name || "ಉತ್ಪನ್ನ"}' ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ.`,
          `Added '${itemToAdd.name || "product"}' to cart.`
        ),
        handledLocally: true,
      };
    }
  }

  // 30. Select Item by Number / Index (e.g., "pehla product", "second item")
  for (const [word, num] of Object.entries(NUMBER_MAP)) {
    const pattern = new RegExp(`\\b${word}\\b.*\\b(product|item|saman|namoona|utpadan)?\\b`, "i");
    if (pattern.test(lower) || clean.includes(word)) {
      const idx = num - 1;
      const targetItem = context.visible_items && context.visible_items[idx];
      return {
        action: {
          action_type: "SELECT_ITEM",
          payload: { index: num, item: targetItem || { id: num, name: `Item #${num}` } },
          safety_level: "SAFE",
          requires_confirmation: false,
        },
        reply_text: getLocalizedReply(
          lang,
          `${num} नंबर का उत्पाद चुना गया है।`,
          `${num}ನೇ ಸಂಖ್ಯೆಯ ಉತ್ಪನ್ನವನ್ನು ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ.`,
          `Selected item #${num}.`
        ),
        handledLocally: true,
      };
    }
  }

  // 31. Search Query: "search wheat", "tractor dhoondo", "search for urea"
  const searchMatch =
    /(?:search for|search|dhoondo|khojo|huduku|batao|dikhao)\s+(.+)/i.exec(lower) ||
    /(.+)\s+(?:search karo|dhoondo|khojo|huduku)/i.exec(lower);

  if (searchMatch) {
    const rawQuery = searchMatch[1].trim();
    const cleanQuery = rawQuery.replace(/^(for|about|ke|ki|ka)\s+/i, "").replace(/[^\w\s\u0900-\u097F\u0C80-\u0CFF]/gi, "").trim();
    if (cleanQuery.length >= 2) {
      const isMandi = /mandi|bhav|rate|dar/i.test(lower);
      const target = isMandi ? "mandi" : "marketplace";
      return {
        action: { action_type: "SEARCH", payload: { query: cleanQuery, target }, safety_level: "SAFE", requires_confirmation: false },
        reply_text: getLocalizedReply(
          lang,
          `'${cleanQuery}' के लिए खोज रहे हैं।`,
          `'${cleanQuery}' ಗಾಗಿ ಹುಡುಕುತ್ತಿದ್ದೇವೆ.`,
          `Searching for '${cleanQuery}'.`
        ),
        handledLocally: true,
      };
    }
  }

  return null;
}
