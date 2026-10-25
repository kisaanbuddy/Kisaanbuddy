import { Lang } from "./language"

export interface FeedbackDict {
  entryPointLabel: string
  entryPointSub: string
  entryPointTag: string
  modalTitle: string
  modalSubtitle: string
  step1Heading: string
  step2Heading: string
  step3Heading: string
  
  // Starting method choice
  methodVoice: string
  methodVoiceDesc: string
  methodChoices: string
  methodChoicesDesc: string
  methodText: string

  // Feedback types (5 clear visual options)
  likeTitle: string
  likeDesc: string
  betterTitle: string
  betterDesc: string
  issueTitle: string
  issueDesc: string
  ideaTitle: string
  ideaDesc: string
  helpTitle: string
  helpDesc: string

  // Categories
  catWeather: string
  catMandi: string
  catDisease: string
  catMarketplace: string
  catWorkers: string
  catSchemes: string
  catGeneral: string

  // Quick Guided Tags
  tagWrongPrice: string
  tagMissingCrop: string
  tagSlowApp: string
  tagVoiceHelp: string
  tagMoreMarkets: string
  tagEasyLanguage: string
  tagNeedBuyer: string
  tagLabourNeed: string

  // Voice UI
  startRecording: string
  recording: string
  stopRecording: string
  playAudio: string
  pauseAudio: string
  reRecord: string
  deleteAudio: string
  micDenied: string
  micUnavailable: string
  maxDuration: string
  voiceRecordedNotice: string

  // Text & Photo
  textLabel: string
  textPlaceholder: string
  attachPhoto: string
  photoAttached: string
  removePhoto: string

  // Contact
  contactConsentLabel: string
  contactInputPlaceholder: string

  // Buttons & Success
  sendBtn: string
  sendingBtn: string
  backBtn: string
  successTitle: string
  successDesc: string
  refLabel: string
  closeBtn: string
  errorGeneric: string

  // Quick Review widget
  quickTitle: string
  quickHelpful: string
  quickCouldBeBetter: string
  quickNotHelpful: string
  quickThanks: string

  // Public Improvements
  publicTitle: string
  publicSubtitle: string
  publicEmpty: string
  publicStatusPlanned: string
  publicStatusCompleted: string
}

export const FEEDBACK_TRANSLATIONS: Record<Lang, FeedbackDict> = {
  en: {
    entryPointLabel: "Help Us Improve",
    entryPointSub: "Your ideas help us make KisaanBuddy better for farmers.",
    entryPointTag: "Farmer Feedback",
    modalTitle: "Your Voice Matters",
    modalSubtitle: "Tell us what you like, what is hard to use, or share a new idea. Speak or tap pictures—no typing needed.",
    step1Heading: "What would you like to share?",
    step2Heading: "Tell us more in your own words",
    step3Heading: "Confirm & Send",

    methodVoice: "Speak your suggestion",
    methodVoiceDesc: "Talk in your own language. We'll listen.",
    methodChoices: "Tap quick choices",
    methodChoicesDesc: "Choose options with simple icons.",
    methodText: "Write or take a photo",

    likeTitle: "I like it",
    likeDesc: "Something worked great for you",
    betterTitle: "Make it better",
    betterDesc: "Suggestion to improve a feature",
    issueTitle: "Something is not working",
    issueDesc: "Problem, bug or incorrect rate",
    ideaTitle: "I have an idea",
    ideaDesc: "New feature or service request",
    helpTitle: "I need help",
    helpDesc: "Assistance with using the app",

    catWeather: "Weather",
    catMandi: "Mandi Rates",
    catDisease: "Crop Doctor",
    catMarketplace: "Marketplace",
    catWorkers: "Farm Labour",
    catSchemes: "Govt Schemes",
    catGeneral: "Entire App",

    tagWrongPrice: "Wrong mandi price",
    tagMissingCrop: "My crop is missing",
    tagSlowApp: "App is running slow",
    tagVoiceHelp: "Need audio instructions",
    tagMoreMarkets: "Add my local mandi",
    tagEasyLanguage: "Make words simpler",
    tagNeedBuyer: "Need direct buyers",
    tagLabourNeed: "Need farm workers",

    startRecording: "Tap mic to speak",
    recording: "Listening... speak now",
    stopRecording: "Done speaking",
    playAudio: "Listen back",
    pauseAudio: "Pause",
    reRecord: "Record again",
    deleteAudio: "Delete audio",
    micDenied: "Microphone permission is blocked. You can still tap choices or type below.",
    micUnavailable: "Microphone is not supported on this browser. You can select choices below.",
    maxDuration: "Max 90 seconds",
    voiceRecordedNotice: "Voice message recorded. You can listen back or send now.",

    textLabel: "Optional notes",
    textPlaceholder: "Type in your language if you prefer (optional)...",
    attachPhoto: "Attach photo (optional)",
    photoAttached: "Photo attached",
    removePhoto: "Remove",

    contactConsentLabel: "Can our team contact you if we need clarification?",
    contactInputPlaceholder: "Your phone or WhatsApp number (optional)",

    sendBtn: "Send Suggestion",
    sendingBtn: "Sending...",
    backBtn: "Back",
    successTitle: "Thank You, Farmer Friend!",
    successDesc: "Your suggestion has been securely received. Our team reviews farmer feedback every week to improve KisaanBuddy.",
    refLabel: "Reference ID",
    closeBtn: "Done / Back to Farm",
    errorGeneric: "Could not send right now. Please try again or check your network.",

    quickTitle: "Was this helpful?",
    quickHelpful: "Helpful",
    quickCouldBeBetter: "Could be better",
    quickNotHelpful: "Not helpful",
    quickThanks: "Thank you for helping us improve!",

    publicTitle: "You Suggested, We Improved",
    publicSubtitle: "Real changes made directly from farmer voices across India.",
    publicEmpty: "We are actively reviewing early suggestions from farmers across states. Verified updates will appear here soon.",
    publicStatusPlanned: "In Progress",
    publicStatusCompleted: "Implemented",
  },

  hi: {
    entryPointLabel: "सुझाव दें",
    entryPointSub: "आपकी राय से किसानबडी हर किसान के लिए और बेहतर बनता है।",
    entryPointTag: "किसान आवाज़",
    modalTitle: "आपकी बात, हमारा सुधार",
    modalSubtitle: "बताएं क्या अच्छा लगा, क्या सुधारना है या कोई नया विचार साझा करें। बोलकर या विकल्प चुनकर बताएं—लिखने की ज़रूरत नहीं।",
    step1Heading: "आप किस बारे में बताना चाहते हैं?",
    step2Heading: "अपनी भाषा में बताएं",
    step3Heading: "जांचें और भेजें",

    methodVoice: "बोलकर बताएं",
    methodVoiceDesc: "अपनी मातृभाषा में बोलें, हम सुन रहे हैं।",
    methodChoices: "तस्वीरें चुनकर बताएं",
    methodChoicesDesc: "आसान विकल्पों पर छूकर बताएं।",
    methodText: "लिखकर या फोटो भेजें",

    likeTitle: "पसंद आया",
    likeDesc: "कोई सुविधा आपके काम आई",
    betterTitle: "सुधार चाहिए",
    betterDesc: "किसी सुविधा को और आसान बनाएं",
    issueTitle: "काम नहीं कर रहा",
    issueDesc: "कोई समस्या या गलत भाव",
    ideaTitle: "नया विचार है",
    ideaDesc: "नई सुविधा या नई सेवा का सुझाव",
    helpTitle: "मदद चाहिए",
    helpDesc: "ऐप चलाने में सहायता",

    catWeather: "मौसम",
    catMandi: "मंडी भाव",
    catDisease: "फसल डॉक्टर",
    catMarketplace: "खरीद-बिक्री",
    catWorkers: "खेत मजदूर",
    catSchemes: "सरकारी योजनाएं",
    catGeneral: "पूरी वेबसाइट",

    tagWrongPrice: "मंडी भाव सही नहीं है",
    tagMissingCrop: "मेरी फसल सूची में नहीं है",
    tagSlowApp: "ऐप धीमा चल रहा है",
    tagVoiceHelp: "बोलकर सुनाने की सुविधा चाहिए",
    tagMoreMarkets: "मेरी नज़दीकी मंडी जोड़ें",
    tagEasyLanguage: "भाषा और सरल करें",
    tagNeedBuyer: "सीधे खरीदार चाहिए",
    tagLabourNeed: "कटाई/बुवाई मजदूर चाहिए",

    startRecording: "बोलने के लिए माइक छुएं",
    recording: "सुन रहे हैं... बोलिए",
    stopRecording: "बोलना पूरा हुआ",
    playAudio: "अपनी आवाज़ सुनें",
    pauseAudio: "रोकें",
    reRecord: "फिर से बोलें",
    deleteAudio: "आवाज़ हटाएं",
    micDenied: "माइक की अनुमति नहीं मिली। आप नीचे दिए गए विकल्प छूकर भी सुझाव दे सकते हैं।",
    micUnavailable: "इस ब्राउज़र पर माइक उपलब्ध नहीं है। कृपया नीचे विकल्प चुनें।",
    maxDuration: "अधिकतम 90 सेकंड",
    voiceRecordedNotice: "आपकी आवाज़ रिकॉर्ड हो गई है। सुनकर देख सकते हैं या सीधे भेजें।",

    textLabel: "वैकल्पिक टिप्पणी",
    textPlaceholder: "यदि चाहें तो यहाँ अपनी भाषा में लिख सकते हैं (वैकल्पिक)...",
    attachPhoto: "फोटो जोड़ें (वैकल्पिक)",
    photoAttached: "फोटो जुड़ गई",
    removePhoto: "हटाएं",

    contactConsentLabel: "क्या ज़रूरत पड़ने पर हमारी टीम आपसे बात कर सकती है?",
    contactInputPlaceholder: "आपका फ़ोन या व्हाट्सएप नंबर (वैकल्पिक)",

    sendBtn: "सुझाव भेजें",
    sendingBtn: "भेज रहे हैं...",
    backBtn: "पीछे जाएं",
    successTitle: "धन्यवाद, किसान भाई!",
    successDesc: "आपकी बात हम तक सुरक्षित पहुँच गई है। किसानबडी को आसान और उपयोगी बनाने के लिए हमारी टीम हर सुझाव की समीक्षा करती है।",
    refLabel: "सुझाव संदर्भ संख्या",
    closeBtn: "पूर्ण / खेत पर लौटें",
    errorGeneric: "अभी सुझाव नहीं भेजा जा सका। कृपया नेटवर्क जांचकर पुनः प्रयास करें।",

    quickTitle: "क्या यह जानकारी उपयोगी थी?",
    quickHelpful: "उपयोगी है",
    quickCouldBeBetter: "और बेहतर हो सकता है",
    quickNotHelpful: "उपयोगी नहीं",
    quickThanks: "आपकी राय के लिए बहुत-बहुत धन्यवाद!",

    publicTitle: "आपने सुझाव दिया, हमने सुधारा",
    publicSubtitle: "देशभर के किसान भाइयों के सुझावों से किए गए वास्तविक सुधार।",
    publicEmpty: "हम सभी राज्यों के किसानों के सुझावों की समीक्षा कर रहे हैं। सत्यापित सुधार जल्द ही यहाँ दिखाई देंगे।",
    publicStatusPlanned: "कार्य प्रगति पर",
    publicStatusCompleted: "लागू किया गया",
  },

  kn: {
    entryPointLabel: "ಸಲಹೆ ನೀಡಿ",
    entryPointSub: "ನಿಮ್ಮ ಸಲಹೆಗಳು ಕಿಸಾನ್‌ಬಡ್ಡಿಯನ್ನು ರೈತರಿಗೆ ಇನ್ನಷ್ಟು ಉಪಯುಕ್ತವಾಗಿಸುತ್ತವೆ.",
    entryPointTag: "ರೈತರ ಧ್ವನಿ",
    modalTitle: "ನಿಮ್ಮ ಧ್ವನಿ ನಮ್ಮ ಬಲ",
    modalSubtitle: "ನಿಮಗೆ ಇಷ್ಟವಾದದ್ದು, ಸುಧಾರಿಸಬೇಕಾದದ್ದು ಅಥವಾ ಹೊಸ ಆಲೋಚನೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ. ಮಾತನಾಡಿ ಅಥವಾ ಚಿತ್ರಗಳನ್ನು ಆರಿಸಿ—ಟೈಪ್ ಮಾಡುವ ಅಗತ್ಯವಿಲ್ಲ.",
    step1Heading: "ನೀವು ಏನನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಬಯಸುತ್ತೀರಿ?",
    step2Heading: "ನಿಮ್ಮ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ ತಿಳಿಸಿ",
    step3Heading: "ಪರಿಶೀಲಿಸಿ ಕಳುಹಿಸಿ",

    methodVoice: "ಮಾತನಾಡಿ ತಿಳಿಸಿ",
    methodVoiceDesc: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲೇ ಮಾತನಾಡಿ, ನಾವು ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತೇವೆ.",
    methodChoices: "ಚಿತ್ರಗಳ ಮೂಲಕ ಆಯ್ಕೆಮಾಡಿ",
    methodChoicesDesc: "ಸರಳ ಆಯ್ಕೆಗಳನ್ನು ಒತ್ತಿ.",
    methodText: "ಬರೆಯಿರಿ ಅಥವಾ ಫೋಟೋ ಕಳುಹಿಸಿ",

    likeTitle: "ಇಷ್ಟವಾಯಿತು",
    likeDesc: "ಯಾವುದಾದರೂ ಸೇವೆ ಉಪಯುಕ್ತವಾಗಿದೆ",
    betterTitle: "ಸುಧಾರಣೆ ಬೇಕು",
    betterDesc: "ಸೇವೆಯನ್ನು ಇನ್ನಷ್ಟು ಉತ್ತಮಗೊಳಿಸಿ",
    issueTitle: "ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲ",
    issueDesc: "ದೋಷ ಅಥವಾ ತಪ್ಪು ಮಂಡಿ ದರ",
    ideaTitle: "ಹೊಸ ಆಲೋಚನೆ",
    ideaDesc: "ಹೊಸ ಸೇವೆ ಅಥವಾ ವೈಶಿಷ್ಟ್ಯದ ಬೇಡಿಕೆ",
    helpTitle: "ಸಹಾಯ ಬೇಕು",
    helpDesc: "ಆ್ಯಪ್ ಬಳಸಲು ನೆರವು",

    catWeather: "ಹವಾಮಾನ",
    catMandi: "ಮಂಡಿ ದರಗಳು",
    catDisease: "ಬೆಳೆ ವೈದ್ಯ",
    catMarketplace: "ಖರೀದಿ-ಮಾರಾಟ",
    catWorkers: "ಕೃಷಿ ಕಾರ್ಮಿಕರು",
    catSchemes: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    catGeneral: "ಇಡೀ ಆ್ಯಪ್",

    tagWrongPrice: "ತಪ್ಪು ಮಂಡಿ ದರ",
    tagMissingCrop: "ನನ್ನ ಬೆಳೆ ಪಟ್ಟಿಯಲ್ಲಿಲ್ಲ",
    tagSlowApp: "ಆ್ಯಪ್ ನಿಧಾನವಾಗಿದೆ",
    tagVoiceHelp: "ಧ್ವನಿ ಸೂಚನೆಗಳು ಬೇಕು",
    tagMoreMarkets: "ನನ್ನ ಹತ್ತಿರದ ಮಂಡಿ ಸೇರಿಸಿ",
    tagEasyLanguage: "ಭಾಷೆ ಇನ್ನಷ್ಟು ಸರಳವಾಗಲಿ",
    tagNeedBuyer: "ನೇರ ಖರೀದಿದಾರರು ಬೇಕು",
    tagLabourNeed: "ಕಾರ್ಮಿಕರು ಬೇಕು",

    startRecording: "ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ",
    recording: "ಕೇಳುತ್ತಿದ್ದೇವೆ... ಮಾತನಾಡಿ",
    stopRecording: "ಮುಕ್ತಾಯವಾಯಿತು",
    playAudio: "ಧ್ವನಿ ಆಲಿಸಿ",
    pauseAudio: "ವಿರಾಮ",
    reRecord: "ಮತ್ತೆ ರೆಕಾರ್ಡ್ ಮಾಡಿ",
    deleteAudio: "ತೆಗೆದುಹಾಕಿ",
    micDenied: "ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ಸಿಕ್ಕಿಲ್ಲ. ನೀವು ಕೆಳಗಿನ ಆಯ್ಕೆಗಳನ್ನು ಬಳಸಬಹುದು.",
    micUnavailable: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮೈಕ್ ಲಭ್ಯವಿಲ್ಲ.",
    maxDuration: "ಗರಿಷ್ಠ 90 ಸೆಕೆಂಡುಗಳು",
    voiceRecordedNotice: "ನಿಮ್ಮ ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗಿದೆ.",

    textLabel: "ಟಿಪ್ಪಣಿ (ಐಚ್ಛಿಕ)",
    textPlaceholder: "ಬೇಕಿದ್ದರೆ ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಬರೆಯಿರಿ...",
    attachPhoto: "ಫೋಟೋ ಲಗತ್ತಿಸಿ (ಐಚ್ಛಿಕ)",
    photoAttached: "ಫೋಟೋ ಲಗತ್ತಿಸಲಾಗಿದೆ",
    removePhoto: "ತೆಗೆದುಹಾಕಿ",

    contactConsentLabel: "ವಿವರಣೆಗೆ ನಮ್ಮ ತಂಡ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಬಹುದೇ?",
    contactInputPlaceholder: "ನಿಮ್ಮ ಫೋನ್ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆ",

    sendBtn: "ಸಲಹೆ ಕಳುಹಿಸಿ",
    sendingBtn: "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...",
    backBtn: "ಹಿಂದಕ್ಕೆ",
    successTitle: "ಧನ್ಯವಾದಗಳು ರೈತ ಮಿತ್ರರೇ!",
    successDesc: "ನಿಮ್ಮ ಸಲಹೆಯನ್ನು ನಾವು ಸ್ವೀಕರಿಸಿದ್ದೇವೆ. ಕಿಸಾನ್‌ಬಡ್ಡಿಯನ್ನು ಇನ್ನಷ್ಟು ಉತ್ತಮಗೊಳಿಸಲು ನಮ್ಮ ತಂಡ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.",
    refLabel: "ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ",
    closeBtn: "ಮುಕ್ತಾಯ / ಹಿಂದಕ್ಕೆ",
    errorGeneric: "ಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ, ದಯವಿಟ್ಟು ನೆಟ್‌ವರ್ಕ್ ಪರಿಶೀಲಿಸಿ.",

    quickTitle: "ಇದು ಉಪಯುಕ್ತವಾಗಿದೆಯೇ?",
    quickHelpful: "ಉಪಯುಕ್ತವಾಗಿದೆ",
    quickCouldBeBetter: "ಇನ್ನಷ್ಟು ಉತ್ತಮವಾಗಬಹುದು",
    quickNotHelpful: "ಉಪಯುಕ್ತವಲ್ಲ",
    quickThanks: "ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಗೆ ಧನ್ಯವಾದಗಳು!",

    publicTitle: "ನಿಮ್ಮ ಸಲಹೆ, ನಮ್ಮ ಬದಲಾವಣೆ",
    publicSubtitle: "ರೈತರ ಸಲಹೆಗಳಿಂದ ಜಾರಿಗೆ ತಂದ ನೈಜ ಸುಧಾರಣೆಗಳು.",
    publicEmpty: "ರೈತರ ಸಲಹೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ. ನವೀಕರಣಗಳು ಶೀಘ್ರದಲ್ಲೇ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    publicStatusPlanned: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    publicStatusCompleted: "ಪೂರ್ಣಗೊಂಡಿದೆ",
  },

  ta: {
    entryPointLabel: "கருத்து தெரிவிக்க",
    entryPointSub: "உங்கள் யோசனைகள் விவசாயிகளுக்கு கிசான்படியை மேம்படுத்த உதவுகின்றன.",
    entryPointTag: "விவசாயிகள் குரல்",
    modalTitle: "உங்கள் குரல் முக்கியமானது",
    modalSubtitle: "உங்களுக்கு பிடித்தது, மேம்படுத்த வேண்டியதை குரல் வழியாக அல்லது படங்களை தொட்டு தெரிவிக்கலாம்.",
    step1Heading: "எதைப் பற்றி கூற விரும்புகிறீர்கள்?",
    step2Heading: "உங்கள் சொந்த மொழியில் பேசுங்கள்",
    step3Heading: "சரிபார்த்து அனுப்புங்கள்",

    methodVoice: "பேசி கருத்து சொல்லுங்கள்",
    methodVoiceDesc: "உங்கள் தாய்மொழியில் பேசுங்கள், நாங்கள் கேட்கிறோம்.",
    methodChoices: "விருப்பங்களைத் தேர்ந்தெடுக்கவும்",
    methodChoicesDesc: "எளிய படங்களை தொடுங்கள்.",
    methodText: "எழுத அல்லது புகைப்படம் அனுப்ப",

    likeTitle: "பிடித்திருக்கிறது",
    likeDesc: "பயனுள்ள அம்சம்",
    betterTitle: "மேம்படுத்த வேண்டும்",
    betterDesc: "சிறந்த மாற்றத்திற்கான யோசனை",
    issueTitle: "வேலை செய்யவில்லை",
    issueDesc: "சிக்கல் அல்லது பிழை",
    ideaTitle: "புதிய யோசனை",
    ideaDesc: "புதிய சேவைக்கான கோரிக்கை",
    helpTitle: "உதவி தேவை",
    helpDesc: "பயன்படுத்த உதவி",

    catWeather: "வானிலை",
    catMandi: "மண்டி விலைகள்",
    catDisease: "பயிர் மருத்துவர்",
    catMarketplace: "சந்தை",
    catWorkers: "விவசாய தொழிலாளர்கள்",
    catSchemes: "அரசு திட்டங்கள்",
    catGeneral: "முழு தளம்",

    tagWrongPrice: "தவறான மண்டி விலை",
    tagMissingCrop: "பயிர் கிடைக்கவில்லை",
    tagSlowApp: "செயலி மெதுவாக உள்ளது",
    tagVoiceHelp: "குரல் வழிகாட்டுதல் வேண்டும்",
    tagMoreMarkets: "அருகிலுள்ள மண்டியை சேர்க்க",
    tagEasyLanguage: "மொழியை எளிமையாக்குங்கள்",
    tagNeedBuyer: "நேரடி வாங்குபவர் தேவை",
    tagLabourNeed: "தொழிலாளர்கள் தேவை",

    startRecording: "பேச மைக்கை அழுத்தவும்",
    recording: "கேட்கிறோம்... பேசுங்கள்",
    stopRecording: "பேசி முடிந்தது",
    playAudio: "குரலைக் கேளுங்கள்",
    pauseAudio: "நிறுத்து",
    reRecord: "மீண்டும் பதிவுசெய்",
    deleteAudio: "நீக்கு",
    micDenied: "மைக் அனுமதி கிடைக்கவில்லை. விருப்பங்களை தேர்ந்தெடுக்கலாம்.",
    micUnavailable: "மைக் வசதி கிடைக்கவில்லை.",
    maxDuration: "அதிகபட்சம் 90 நொடிகள்",
    voiceRecordedNotice: "குரல் பதிவு செய்யப்பட்டது.",

    textLabel: "குறிப்பு (விருப்பமானது)",
    textPlaceholder: "உங்கள் மொழியில் எழுதலாம்...",
    attachPhoto: "புகைப்படம் இணைக்க",
    photoAttached: "இணைக்கப்பட்டது",
    removePhoto: "நீக்கு",

    contactConsentLabel: "எங்கள் குழு உங்களை தொடர்பு கொள்ளலாமா?",
    contactInputPlaceholder: "தொலைபேசி எண்",

    sendBtn: "அனுப்பவும்",
    sendingBtn: "அனுப்புகிறது...",
    backBtn: "பின்செல்",
    successTitle: "நன்றி உழவர் தோழரே!",
    successDesc: "உங்கள் கருத்து பெறப்பட்டது. கிசான்படியை மேம்படுத்த எங்கள் குழு பரிசீலிக்கும்.",
    refLabel: "குறிப்பு எண்",
    closeBtn: "முடிந்தது",
    errorGeneric: "இப்போது அனுப்ப முடியவில்லை.",

    quickTitle: "இது பயனுள்ளதாக இருந்ததா?",
    quickHelpful: "பயனுள்ளது",
    quickCouldBeBetter: "இன்னும் சிறப்பாக இருக்கலாம்",
    quickNotHelpful: "பயனில்லை",
    quickThanks: "உங்கள் கருத்துக்கு நன்றி!",

    publicTitle: "உங்கள் பரிந்துரை, எங்கள் மாற்றம்",
    publicSubtitle: "விவசாயிகளின் கருத்துக்களால் செய்யப்பட்ட உண்மையான மாற்றங்கள்.",
    publicEmpty: "பரிந்துரைகள் பரிசீலிக்கப்படுகின்றன. விரைவில் இங்கு வெளியிடப்படும்.",
    publicStatusPlanned: "பணியில் உள்ளது",
    publicStatusCompleted: "நிறைவுற்றது",
  },

  te: {
    entryPointLabel: "సలహా ఇవ్వండి",
    entryPointSub: "మీ అభిప్రాయాలు కిసాన్‌బడ్డీని మరింత ఉపయోగకరంగా చేస్తాయి.",
    entryPointTag: "రైతు గళం",
    modalTitle: "మీ అభిప్రాయం ముఖ్యం",
    modalSubtitle: "మీకు నచ్చినది లేదా మార్పులు చెప్పండి. మాట్లాడండి లేదా బొమ్మలు ఎంచుకోండి.",
    step1Heading: "మీరు దేని గురించి చెప్పాలనుకుంటున్నారు?",
    step2Heading: "మీ స్వంత భాషలో చెప్పండి",
    step3Heading: "సమీక్షించి పంపండి",

    methodVoice: "మాట్లాడి చెప్పండి",
    methodVoiceDesc: "మీ భాషలోనే మాట్లాడండి, మేము వింటున్నాము.",
    methodChoices: "ఎంపికలను తాకండి",
    methodChoicesDesc: "సులభమైన చిహ్నాల ద్వారా ఎంచుకోండి.",
    methodText: "రాయండి లేదా ఫోటో పంపండి",

    likeTitle: "నచ్చింది",
    likeDesc: "చాలా ఉపయోగకరంగా ఉంది",
    betterTitle: "మెరుగుపరచాలి",
    betterDesc: "మరింత మెరుగ్గా మార్చండి",
    issueTitle: "పనిచేయడం లేదు",
    issueDesc: "సమస్య లేదా తప్పుడు ధర",
    ideaTitle: "కొత్త ఆలోచన",
    ideaDesc: "కొత్త ఫీచర్ కావాలి",
    helpTitle: "సహాయం కావాలి",
    helpDesc: "యాప్ వాడకంలో సహాయం",

    catWeather: "వాతావరణం",
    catMandi: "మండి ధరలు",
    catDisease: "పంట డాక్టర్",
    catMarketplace: "మార్కెట్",
    catWorkers: "వ్యవసాయ కూలీలు",
    catSchemes: "ప్రభుత్వ పథకాలు",
    catGeneral: "మొత్తం వెబ్‌సైట్",

    tagWrongPrice: "తప్పుడు మండి ధర",
    tagMissingCrop: "నా పంట దొరకడం లేదు",
    tagSlowApp: "యాప్ నెమ్మదిగా ఉంది",
    tagVoiceHelp: "ఆడియో సూచనలు కావాలి",
    tagMoreMarkets: "సమీప మండి జోడించండి",
    tagEasyLanguage: "భాష సులభం చేయండి",
    tagNeedBuyer: "కొనుగోలుదారులు కావాలి",
    tagLabourNeed: "కూలీలు కావాలి",

    startRecording: "మాట్లాడటానికి మైక్ నొక్కండి",
    recording: "వింటున్నాము... మాట్లాడండి",
    stopRecording: "పూర్తయింది",
    playAudio: "వినండి",
    pauseAudio: "ఆపండి",
    reRecord: "మళ్లీ రికార్డ్ చేయండి",
    deleteAudio: "తొలగించండి",
    micDenied: "మైక్ అనుమతి రాలేదు. కింద ఎంపికలను తాకవచ్చు.",
    micUnavailable: "మైక్ అందుబాటులో లేదు.",
    maxDuration: "గరిష్టంగా 90 సెకన్లు",
    voiceRecordedNotice: "మీ వాయిస్ రికార్డ్ చేయబడింది.",

    textLabel: "గమనిక (ఐచ్ఛికం)",
    textPlaceholder: "మీ భాషలో రాయవచ్చు...",
    attachPhoto: "ఫోటో జోడించండి",
    photoAttached: "జోడించబడింది",
    removePhoto: "తొలగించు",

    contactConsentLabel: "మా బృందం మిమ్మల్ని సంప్రదించవచ్చా?",
    contactInputPlaceholder: "ఫోన్ లేదా వాట్సాప్ నంబర్",

    sendBtn: "పంపండి",
    sendingBtn: "పంపుతోంది...",
    backBtn: "వెనుకకు",
    successTitle: "ధన్యవాదాలు రైతు సోదరా!",
    successDesc: "మీ సూచన మాకు అందింది. కిసాన్‌బడ్డీని మెరుగుపరచడానికి మా బృందం కృషి చేస్తుంది.",
    refLabel: "రిఫరెన్స్ సంఖ్య",
    closeBtn: "పూర్తయింది",
    errorGeneric: "నెట్‌వర్క్ సరిచూసుకోండి.",

    quickTitle: "ఇది ఉపయోగపడిందా?",
    quickHelpful: "ఉపయోగపడింది",
    quickCouldBeBetter: "ఇంకా బాగుండొచ్చు",
    quickNotHelpful: "ఉపయోగపడలేదు",
    quickThanks: "మీ అభిప్రాయానికి ధన్యవాదాలు!",

    publicTitle: "మీ సూచన, మా మార్పు",
    publicSubtitle: "రైతుల అభిప్రాయాలతో చేసిన నిజమైన మార్పులు.",
    publicEmpty: "రైతుల సూచనలను పరిశీలిస్తున్నాము. త్వరలో ఇక్కడ కనిపిస్తాయి.",
    publicStatusPlanned: "ప్రగతిలో ఉంది",
    publicStatusCompleted: "పూర్తయింది",
  },

  mr: {
    entryPointLabel: "अभिप्राय द्या",
    entryPointSub: "तुमच्या सूचनांमुळे किसानबडी शेतकऱ्यांसाठी अधिक उपयुक्त बनते.",
    entryPointTag: "शेतकऱ्यांचा आवाज",
    modalTitle: "तुमचा आवाज आमची ताकद",
    modalSubtitle: "काय आवडले, काय सुधारायचे किंवा नवीन कल्पना सांगा. बोलून किंवा चित्र निवडून सांगा—टाईप करण्याची गरज नाही.",
    step1Heading: "तुम्हाला काय सांगायचे आहे?",
    step2Heading: "तुमच्या भाषेत सांगा",
    step3Heading: "तपासा आणि पाठवा",

    methodVoice: "बोलून सांगा",
    methodVoiceDesc: "तुमच्या स्वतःच्या भाषेत बोला, आम्ही ऐकत आहोत.",
    methodChoices: "पर्याय निवडा",
    methodChoicesDesc: "सोपे पर्याय निवडून सांगा.",
    methodText: "लिहून किंवा फोटो पाठवा",

    likeTitle: "आवडले",
    likeDesc: "कोणतीही सुविधा उपयुक्त वाटली",
    betterTitle: "सुधारणा हवी",
    betterDesc: "सुविधा आणखी सुलभ करा",
    issueTitle: "काम करत नाही",
    issueDesc: "काही अडचण किंवा चुकीचा भाव",
    ideaTitle: "नवीन कल्पना",
    ideaDesc: "नवीन सेवेची मागणी",
    helpTitle: "मदत हवी",
    helpDesc: "अ‍ॅप वापरण्यासाठी मदत",

    catWeather: "हवामान",
    catMandi: "मंडी भाव",
    catDisease: "पीक डॉक्टर",
    catMarketplace: "खरेदी-विक्री",
    catWorkers: "शेतमजूर",
    catSchemes: "सरकारी योजना",
    catGeneral: "संपूर्ण अ‍ॅप",

    tagWrongPrice: "मंडी भाव चुकीचा आहे",
    tagMissingCrop: "माझे पीक दिसत नाही",
    tagSlowApp: "अ‍ॅप हळू चालत आहे",
    tagVoiceHelp: "ऑडिओ सूचना हव्यात",
    tagMoreMarkets: "जवळची मंडी जोडा",
    tagEasyLanguage: "भाषा सोपी करा",
    tagNeedBuyer: "थेट खरेदीदार हवेत",
    tagLabourNeed: "कापणी/पेरणी मजूर हवेत",

    startRecording: "बोलण्यासाठी माइक दाबा",
    recording: "ऐकत आहोत... बोला",
    stopRecording: "बोलणे पूर्ण झाले",
    playAudio: "आवाज ऐका",
    pauseAudio: "थांबवा",
    reRecord: "पुन्हा रेकॉर्ड करा",
    deleteAudio: "हटवा",
    micDenied: "माइक परवानगी मिळाली नाही. खालील पर्याय वापरू शकता.",
    micUnavailable: "या ब्राऊझरवर माइक उपलब्ध नाही.",
    maxDuration: "जास्तीत जास्त 90 सेकंद",
    voiceRecordedNotice: "तुमचा आवाज रेकॉर्ड झाला आहे.",

    textLabel: "टीप (पर्यायी)",
    textPlaceholder: "हवे असल्यास तुमच्या भाषेत लिहा...",
    attachPhoto: "फोटो जोडा",
    photoAttached: "जोडला गेला",
    removePhoto: "काढून टाका",

    contactConsentLabel: "आमची टीम तुमच्याशी संपर्क साधू शकते का?",
    contactInputPlaceholder: "फोन किंवा व्हॉट्सअ‍ॅप नंबर",

    sendBtn: "सूचना पाठवा",
    sendingBtn: "पाठवत आहे...",
    backBtn: "मागे जा",
    successTitle: "धन्यवाद शेतकरी मित्रांनो!",
    successDesc: "तुमची सूचना सुरक्षितपणे मिळाली आहे. किसानबडी सुधारण्यासाठी आमची टीम यावर काम करेल.",
    refLabel: "संदर्भ क्रमांक",
    closeBtn: "पूर्ण",
    errorGeneric: "कृपया नेटवर्क तपासा.",

    quickTitle: "ही माहिती उपयुक्त वाटली का?",
    quickHelpful: "उपयुक्त आहे",
    quickCouldBeBetter: "आणखी चांगली होऊ शकते",
    quickNotHelpful: "उपयुक्त नाही",
    quickThanks: "तुमच्या अभिप्रायाबद्दल धन्यवाद!",

    publicTitle: "तुमची सूचना, आमची सुधारणा",
    publicSubtitle: "शेतकऱ्यांच्या सूचनांवरून केलेले प्रत्यक्ष बदल.",
    publicEmpty: "शेतकऱ्यांच्या सूचनांचा आढावा घेतला जात आहे. लवकरच येथे दिसतील.",
    publicStatusPlanned: "प्रगतीपथावर",
    publicStatusCompleted: "पूर्ण झाले",
  },

  gu: {
    entryPointLabel: "સૂચન આપો",
    entryPointSub: "તમારા વિચારો કિસાનબડીને ખેડૂતો માટે વધુ સારું બનાવે છે.",
    entryPointTag: "ખેડૂત અવાજ",
    modalTitle: "તમારો અવાજ મહત્વનો છે",
    modalSubtitle: "શું ગમ્યું, શું સુધારવું કે નવો વિચાર શેર કરો. બોલીને અથવા ચિત્રો પસંદ કરીને જણાવો.",
    step1Heading: "તમે શું શેર કરવા માંગો છો?",
    step2Heading: "તમારી ભાષામાં જણાવો",
    step3Heading: "ચકાસો અને મોકલો",

    methodVoice: "બોલીને જણાવો",
    methodVoiceDesc: "તમારી ભાષામાં બોલો, અમે સાંભળી રહ્યા છીએ.",
    methodChoices: "વિકલ્પો પસંદ કરો",
    methodChoicesDesc: "સરળ ચિહ્નો પર ટેપ કરો.",
    methodText: "લખીને અથવા ફોટો મોકલો",

    likeTitle: "ગમ્યું",
    likeDesc: "કોઈ સુવિધા ઉપયોગી લાગી",
    betterTitle: "સુધારો જોઈએ",
    betterDesc: "સુવિધા વધુ સરળ બનાવો",
    issueTitle: "કામ નથી કરતું",
    issueDesc: "સમસ્યા અથવા ખોટો ભાવ",
    ideaTitle: "નવો વિચાર",
    ideaDesc: "નવી સેવાની માંગ",
    helpTitle: "મદદ જોઈએ",
    helpDesc: "એપ વાપરવામાં મદદ",

    catWeather: "હવામાન",
    catMandi: "મંડી દર",
    catDisease: "પાક ડૉક્ટર",
    catMarketplace: "ખરીદ-વેચાણ",
    catWorkers: "ખેતમજૂર",
    catSchemes: "સરકારી યોજનાઓ",
    catGeneral: "આખી વેબસાઇટ",

    tagWrongPrice: "ખોટો મંડી ભાવ",
    tagMissingCrop: "મારો પાક મળતો નથી",
    tagSlowApp: "એપ ધીમી ચાલે છે",
    tagVoiceHelp: "ઓડિયો સૂચનાઓ જોઈએ",
    tagMoreMarkets: "મારી નજીકની મંડી ઉમેરો",
    tagEasyLanguage: "ભાષા સરળ કરો",
    tagNeedBuyer: "સીધા ખરીદદારો જોઈએ",
    tagLabourNeed: "મજૂરો જોઈએ",

    startRecording: "બોલવા માટે માઇક દબાવો",
    recording: "સાંભળી રહ્યા છીએ... બોલો",
    stopRecording: "પૂરું થયું",
    playAudio: "સાંભળો",
    pauseAudio: "રોકો",
    reRecord: "ફરી બોલો",
    deleteAudio: "કાઢી નાખો",
    micDenied: "માઇકની પરવાનગી નથી મળી.",
    micUnavailable: "માઇક ઉપલબ્ધ નથી.",
    maxDuration: "મહત્તમ 90 સેકન્ડ",
    voiceRecordedNotice: "તમારો અવાજ રેકોર્ડ થઈ ગયો છે.",

    textLabel: "નોંધ (વૈકલ્પિક)",
    textPlaceholder: "તમારી ભાષામાં લખી શકો છો...",
    attachPhoto: "ફોટો જોડો",
    photoAttached: "જોડાયો",
    removePhoto: "હટાવો",

    contactConsentLabel: "શું અમારી ટીમ તમારો સંપર્ક કરી શકે છે?",
    contactInputPlaceholder: "ફોન અથવા વ્હોટ્સએપ નંબર",

    sendBtn: "મોકલો",
    sendingBtn: "મોકલી રહ્યા છીએ...",
    backBtn: "પાછા જાઓ",
    successTitle: "આભાર ખેડૂત મિત્ર!",
    successDesc: "તમારું સૂચન અમને મળી ગયું છે. કિસાનબડી સુધારવા માટે અમે કામ કરીશું.",
    refLabel: "સંદર્ભ ક્રમાંક",
    closeBtn: "પૂર્ણ",
    errorGeneric: "નેટવર્ક તપાસો.",

    quickTitle: "શું આ માહિતી ઉપયોગી હતી?",
    quickHelpful: "ઉપયોગી છે",
    quickCouldBeBetter: "વધુ સારું થઈ શકે",
    quickNotHelpful: "ઉપયોગી નથી",
    quickThanks: "તમારા પ્રતિભાવ બદલ આભાર!",

    publicTitle: "તમારું સૂચન, અમારો સુધારો",
    publicSubtitle: "ખેડૂતોના સૂચનોથી થયેલા વાસ્તવિક સુધારા.",
    publicEmpty: "સૂચનોની સમીક્ષા થઈ રહી છે. ટૂંક સમયમાં અહીં દેખાશે.",
    publicStatusPlanned: "ચાલુ છે",
    publicStatusCompleted: "પૂર્ણ",
  },

  bn: {
    entryPointLabel: "পরামর্শ দিন",
    entryPointSub: "আপনার মতামত কিষাণবাডিকে কৃষকদের জন্য আরও ভালো করে তোলে।",
    entryPointTag: "কৃষকের কণ্ঠ",
    modalTitle: "আপনার মতামত মূল্যবান",
    modalSubtitle: "আপনার মতামত জানান। কথা বলুন বা ছবি বেছে নিন—টাইপ করার দরকার নেই।",
    step1Heading: "আপনি কী জানাতে চান?",
    step2Heading: "আপনার নিজের ভাষায় বলুন",
    step3Heading: "যাচাই করে পাঠান",

    methodVoice: "মুখে বলুন",
    methodVoiceDesc: "নিজের ভাষায় কথা বলুন, আমরা শুনছি।",
    methodChoices: "বিকল্প বেছে নিন",
    methodChoicesDesc: "সহজ ছবির মাধ্যমে নির্বাচন করুন।",
    methodText: "লিখুন বা ছবি পাঠান",

    likeTitle: "ভালো লেগেছে",
    likeDesc: "কোনো সুবিধা কাজে এসেছে",
    betterTitle: "উন্নতি দরকার",
    betterDesc: "আরও সহজ করার পরামর্শ",
    issueTitle: "কাজ করছে না",
    issueDesc: "কোনো সমস্যা বা ভুল দাম",
    ideaTitle: "নতুন চিন্তা",
    ideaDesc: "নতুন সুবিধার প্রস্তাব",
    helpTitle: "সাহায্য চাই",
    helpDesc: "অ্যাপ ব্যবহারে সহায়তা",

    catWeather: "আবহাওয়া",
    catMandi: "মান্ডি দর",
    catDisease: "ফসল ডাক্তার",
    catMarketplace: "কেনাবেচা",
    catWorkers: "কৃষি শ্রমিক",
    catSchemes: "সরকারি প্রকল্প",
    catGeneral: "পুরো অ্যাপ",

    tagWrongPrice: "ভুল মান্ডি দর",
    tagMissingCrop: "ফসল খুঁজে পাচ্ছি না",
    tagSlowApp: "অ্যাপ ধীরগতিতে চলছে",
    tagVoiceHelp: "অডিও নির্দেশিকা চাই",
    tagMoreMarkets: "কাছের মান্ডি যোগ করুন",
    tagEasyLanguage: "ভাষা আরও সহজ করুন",
    tagNeedBuyer: "সরাসরি ক্রেতা চাই",
    tagLabourNeed: "শ্রমিক প্রয়োজন",

    startRecording: "বলতে মাইক চাপুন",
    recording: "শুনছি... বলুন",
    stopRecording: "শেষ হয়েছে",
    playAudio: "শুনুন",
    pauseAudio: "থামুন",
    reRecord: "আবার রেকর্ড করুন",
    deleteAudio: "মুছুন",
    micDenied: "মাইকের অনুমতি মেলেনি।",
    micUnavailable: "মাইক উপলব্ধ নেই।",
    maxDuration: "সর্বোচ্চ ৯০ সেকেন্ড",
    voiceRecordedNotice: "আপনার কণ্ঠ রেকর্ড হয়েছে।",

    textLabel: "মন্তব্য (ঐচ্ছিক)",
    textPlaceholder: "আপনার ভাষায় লিখতে পারেন...",
    attachPhoto: "ছবি যুক্ত করুন",
    photoAttached: "যুক্ত হয়েছে",
    removePhoto: "মুছুন",

    contactConsentLabel: "প্রয়োজনে আমাদের টিম যোগাযোগ করতে পারে?",
    contactInputPlaceholder: "ফোন বা হোয়াটসঅ্যাপ নম্বর",

    sendBtn: "পাঠান",
    sendingBtn: "পাঠানো হচ্ছে...",
    backBtn: "পেছনে",
    successTitle: "ধন্যবাদ কৃষক ভাই!",
    successDesc: "আপনার পরামর্শ আমরা পেয়েছি। কিষাণবাডি উন্নত করতে আমরা কাজ করব।",
    refLabel: "রেফারেন্স নম্বর",
    closeBtn: "সম্পন্ন",
    errorGeneric: "নেটওয়ার্ক পরীক্ষা করুন।",

    quickTitle: "তথ্যটি কি দরকারি ছিল?",
    quickHelpful: "দরকারি",
    quickCouldBeBetter: "আরও ভালো হতে পারে",
    quickNotHelpful: "দরকারি নয়",
    quickThanks: "আপনার মতামতের জন্য ধন্যবাদ!",

    publicTitle: "আপনার পরামর্শ, আমাদের উন্নতি",
    publicSubtitle: "কৃষকদের মতামতে বাস্তবায়িত পরিবর্তন।",
    publicEmpty: "পরামর্শগুলো পর্যালোচনা করা হচ্ছে। শীঘ্রই এখানে দেখা যাবে।",
    publicStatusPlanned: "চলমান",
    publicStatusCompleted: "সম্পন্ন",
  },

  pa: {
    entryPointLabel: "ਸੁਝਾਅ ਦਿਓ",
    entryPointSub: "ਤੁਹਾਡੇ ਵਿਚਾਰ ਕਿਸਾਨਬੱਡੀ ਨੂੰ ਹੋਰ ਬਿਹਤਰ ਬਣਾਉਂਦੇ ਹਨ।",
    entryPointTag: "ਕਿਸਾਨ ਦੀ ਆਵਾਜ਼",
    modalTitle: "ਤੁਹਾਡੀ ਆਵਾਜ਼ ਮਹੱਤਵਪੂਰਨ ਹੈ",
    modalSubtitle: "ਦੱਸੋ ਕੀ ਚੰਗਾ ਲੱਗਾ ਜਾਂ ਕੀ ਸੁਧਾਰ ਚਾਹੀਦਾ ਹੈ। ਬੋਲ ਕੇ ਜਾਂ ਵਿਕਲਪ ਚੁਣ ਕੇ ਦੱਸੋ।",
    step1Heading: "ਤੁਸੀਂ ਕੀ ਸਾਂਝਾ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?",
    step2Heading: "ਆਪਣੀ ਬੋਲੀ ਵਿੱਚ ਦੱਸੋ",
    step3Heading: "ਜਾਂਚੋ ਅਤੇ ਭੇਜੋ",

    methodVoice: "ਬੋਲ ਕੇ ਦੱਸੋ",
    methodVoiceDesc: "ਆਪਣੀ ਮਾਂ-ਬੋਲੀ ਵਿੱਚ ਗੱਲ ਕਰੋ, ਅਸੀਂ ਸੁਣ ਰਹੇ ਹਾਂ।",
    methodChoices: "ਚੋਣਾਂ ਦਬਾਓ",
    methodChoicesDesc: "ਸੌਖੇ ਵਿਕਲਪ ਚੁਣੋ।",
    methodText: "ਲਿਖੋ ਜਾਂ ਫੋਟੋ ਭੇਜੋ",

    likeTitle: "ਪਸੰਦ ਆਇਆ",
    likeDesc: "ਕੋਈ ਸਹੂਲਤ ਫਾਇਦੇਮੰਦ ਰਹੀ",
    betterTitle: "ਸੁਧਾਰ ਚਾਹੀਦਾ",
    betterDesc: "ਸਹੂਲਤ ਨੂੰ ਹੋਰ ਸੌਖਾ ਬਣਾਓ",
    issueTitle: "ਕੰਮ ਨਹੀਂ ਕਰ ਰਿਹਾ",
    issueDesc: "ਕੋਈ ਦਿੱਕਤ ਜਾਂ ਗਲਤ ਭਾਅ",
    ideaTitle: "ਨਵਾਂ ਵਿਚਾਰ",
    ideaDesc: "ਨਵੀਂ ਸਹੂਲਤ ਦੀ ਮੰਗ",
    helpTitle: "ਮਦਦ ਚਾਹੀਦੀ",
    helpDesc: "ਐਪ ਵਰਤਣ ਵਿੱਚ ਮਦਦ",

    catWeather: "ਮੌਸਮ",
    catMandi: "ਮੰਡੀ ਰੇਟ",
    catDisease: "ਫ਼ਸਲ ਡਾਕਟਰ",
    catMarketplace: "ਖਰੀਦ-ਵੇਚ",
    catWorkers: "ਮਜ਼ਦੂਰ",
    catSchemes: "ਸਰਕਾਰੀ ਸਕੀਮਾਂ",
    catGeneral: "ਸਾਰੀ ਐਪ",

    tagWrongPrice: "ਗਲਤ ਮੰਡੀ ਰੇਟ",
    tagMissingCrop: "ਫ਼ਸਲ ਨਹੀਂ ਮਿਲ ਰਹੀ",
    tagSlowApp: "ਐਪ ਹੌਲੀ ਚੱਲ ਰਹੀ ਹੈ",
    tagVoiceHelp: "ਆਵਾਜ਼ ਰਾਹੀਂ ਮਦਦ ਚਾਹੀਦੀ",
    tagMoreMarkets: "ਨੇੜਲੀ ਮੰਡੀ ਜੋੜੋ",
    tagEasyLanguage: "ਬੋਲੀ ਹੋਰ ਸੌਖੀ ਕਰੋ",
    tagNeedBuyer: "ਸਿੱਧੇ ਖਰੀਦਦਾਰ ਚਾਹੀਦੇ",
    tagLabourNeed: "ਮਜ਼ਦੂਰ ਚਾਹੀਦੇ",

    startRecording: "ਬੋਲਣ ਲਈ ਮਾਈਕ ਦਬਾਓ",
    recording: "ਸੁਣ ਰਹੇ ਹਾਂ... ਬੋਲੋ",
    stopRecording: "ਪੂਰਾ ਹੋਇਆ",
    playAudio: "ਆਵਾਜ਼ ਸੁਣੋ",
    pauseAudio: "ਰੋਕੋ",
    reRecord: "ਦੁਬਾਰਾ ਬੋਲੋ",
    deleteAudio: "ਹਟਾਓ",
    micDenied: "ਮਾਈਕ ਦੀ ਆਗਿਆ ਨਹੀਂ ਮਿਲੀ।",
    micUnavailable: "ਮਾਈਕ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
    maxDuration: "ਵੱਧ ਤੋਂ ਵੱਧ 90 ਸਕਿੰਟ",
    voiceRecordedNotice: "ਆਵਾਜ਼ ਰਿਕਾਰਡ ਹੋ ਗਈ ਹੈ।",

    textLabel: "ਟਿੱਪਣੀ (ਵਿਕਲਪੀ)",
    textPlaceholder: "ਆਪਣੀ ਬੋਲੀ ਵਿੱਚ ਲਿਖ ਸਕਦੇ ਹੋ...",
    attachPhoto: "ਫੋਟੋ ਲਗਾਓ",
    photoAttached: "ਲਗਾਈ ਗਈ",
    removePhoto: "ਹਟਾਓ",

    contactConsentLabel: "ਕੀ ਲੋੜ ਪੈਣ 'ਤੇ ਸਾਡੀ ਟੀਮ ਗੱਲ ਕਰ ਸਕਦੀ ਹੈ?",
    contactInputPlaceholder: "ਫੋਨ ਜਾਂ ਵਟਸਐਪ ਨੰਬਰ",

    sendBtn: "ਸੁਝਾਅ ਭੇਜੋ",
    sendingBtn: "ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
    backBtn: "ਪਿੱਛੇ",
    successTitle: "ਧੰਨਵਾਦ ਕਿਸਾਨ ਵੀਰੋ!",
    successDesc: "ਤੁਹਾਡਾ ਸੁਝਾਅ ਮਿਲ ਗਿਆ ਹੈ। ਅਸੀਂ ਇਸ 'ਤੇ ਜ਼ਰੂਰ ਕੰਮ ਕਰਾਂਗੇ।",
    refLabel: "ਹਵਾਲਾ ਨੰਬਰ",
    closeBtn: "ਮੁਕੰਮਲ",
    errorGeneric: "ਨੈੱਟਵਰਕ ਚੈੱਕ ਕਰੋ ਜੀ।",

    quickTitle: "ਕੀ ਇਹ ਜਾਣਕਾਰੀ ਲਾਭਦਾਇਕ ਸੀ?",
    quickHelpful: "ਲਾਭਦਾਇਕ",
    quickCouldBeBetter: "ਹੋਰ ਬਿਹਤਰ ਹੋ ਸਕਦੀ ਹੈ",
    quickNotHelpful: "ਲਾਭਦਾਇਕ ਨਹੀਂ",
    quickThanks: "ਤੁਹਾਡੀ ਰਾਏ ਲਈ ਧੰਨਵਾਦ!",

    publicTitle: "ਤੁਹਾਡਾ ਸੁਝਾਅ, ਸਾਡਾ ਸੁਧਾਰ",
    publicSubtitle: "ਕਿਸਾਨਾਂ ਦੇ ਸੁਝਾਵਾਂ ਨਾਲ ਕੀਤੇ ਅਸਲ ਬਦਲਾਅ।",
    publicEmpty: "ਸੁਝਾਅ ਵਿਚਾਰੇ ਜਾ ਰਹੇ ਹਨ। ਜਲਦੀ ਹੀ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੇ।",
    publicStatusPlanned: "ਜਾਰੀ ਹੈ",
    publicStatusCompleted: "ਲਾਗੂ ਕੀਤਾ",
  },

  ml: {
    entryPointLabel: "അഭിപ്രായം അറിയിക്കുക",
    entryPointSub: "നിങ്ങളുടെ നിർദ്ദേശങ്ങൾ കിസാൻബഡിയെ കൂടുതൽ മികച്ചതാക്കുന്നു.",
    entryPointTag: "കർഷക ശബ്ദം",
    modalTitle: "നിങ്ങളുടെ അഭിപ്രായം വിലപ്പെട്ടതാണ്",
    modalSubtitle: "നിങ്ങൾക്ക് ഇഷ്ടപ്പെട്ടതോ മാറ്റങ്ങൾ ആവശ്യമുള്ളതോ ആയ കാര്യങ്ങൾ പറയുക. സംസാരിക്കുകയോ ഓപ്ഷനുകൾ തൊടുകയോ ചെയ്യാം.",
    step1Heading: "എന്തിനെക്കുറിച്ചാണ് പറയാൻ ആഗ്രഹിക്കുന്നത്?",
    step2Heading: "നിങ്ങളുടെ ഭാഷയിൽ പറയുക",
    step3Heading: "പരിശോധിച്ച് അയക്കുക",

    methodVoice: "സംസാരിച്ച് അറിയിക്കുക",
    methodVoiceDesc: "സ്വന്തം ഭാഷയിൽ സംസാരിക്കൂ, ഞങ്ങൾ കേൾക്കുന്നുണ്ട്.",
    methodChoices: "ഓപ്ഷനുകൾ തിരഞ്ഞെടുക്കുക",
    methodChoicesDesc: "ലളിതമായ ചിത്രങ്ങൾ തൊടുക.",
    methodText: "എഴുതുക അല്ലെങ്കിൽ ഫോട്ടോ അയക്കുക",

    likeTitle: "ഇഷ്ടമായി",
    likeDesc: "വളരെ ഉപയോഗപ്രദമാണ്",
    betterTitle: "മെച്ചപ്പെടുത്തണം",
    betterDesc: "സേവനം കൂടുതൽ എളുപ്പമാക്കുക",
    issueTitle: "പ്രവർത്തിക്കുന്നില്ല",
    issueDesc: "തകരാർ അല്ലെങ്കിൽ തെറ്റായ നിരക്ക്",
    ideaTitle: "പുതിയ ആശയം",
    ideaDesc: "പുതിയ ഫീച്ചർ വേണം",
    helpTitle: "സഹായം വേണം",
    helpDesc: "ആപ്പ് ഉപയോഗിക്കാൻ സഹായം",

    catWeather: "കാലാവസ്ഥ",
    catMandi: "മാർക്കറ്റ് നിരക്ക്",
    catDisease: "വിള ഡോക്ടർ",
    catMarketplace: "വിപണി",
    catWorkers: "തൊഴിലാളികൾ",
    catSchemes: "സർക്കാർ പദ്ധതികൾ",
    catGeneral: "ആപ്പ് മുഴുവൻ",

    tagWrongPrice: "തെറ്റായ വില",
    tagMissingCrop: "വിള കാണുന്നില്ല",
    tagSlowApp: "ആപ്പ് പതുക്കെയാണ്",
    tagVoiceHelp: "ശബ്ദ നിർദ്ദേശങ്ങൾ വേണം",
    tagMoreMarkets: "അടുത്തുള്ള മണ്ടി ചേർക്കുക",
    tagEasyLanguage: "ഭാഷ ലളിതമാക്കുക",
    tagNeedBuyer: "നേരിട്ടുള്ള വാങ്ങുന്നവർ വേണം",
    tagLabourNeed: "തൊഴിലാളികളെ വേണം",

    startRecording: "സംസാരിക്കാൻ മൈക്ക് തൊടുക",
    recording: "കേൾക്കുന്നു... സംസാരിക്കൂ",
    stopRecording: "പൂർത്തിയായി",
    playAudio: "കേൾക്കുക",
    pauseAudio: "നിർത്തുക",
    reRecord: "വീണ്ടും റെക്കോർഡ് ചെയ്യുക",
    deleteAudio: "ഒഴിവാക്കുക",
    micDenied: "മൈക്ക് അനുമതി ലഭിച്ചില്ല.",
    micUnavailable: "മൈക്ക് ലഭ്യമല്ല.",
    maxDuration: "പരമാവധി 90 സെക്കൻഡ്",
    voiceRecordedNotice: "ശബ്ദം റെക്കോർഡ് ചെയ്തു.",

    textLabel: "കുറിപ്പ് (ഓപ്ഷണൽ)",
    textPlaceholder: "നിങ്ങളുടെ ഭാഷയിൽ എഴുതാം...",
    attachPhoto: "ഫോട്ടോ ചേർക്കുക",
    photoAttached: "ചേർത്തു",
    removePhoto: "ഒഴിവാക്കുക",

    contactConsentLabel: "ആവശ്യമെങ്കിൽ ഞങ്ങൾക്ക് ബന്ധപ്പെടാമോ?",
    contactInputPlaceholder: "ഫോൺ നമ്പർ",

    sendBtn: "അയക്കുക",
    sendingBtn: "അയക്കുന്നു...",
    backBtn: "പിന്നിലേക്ക്",
    successTitle: "നന്ദി കർഷക മിത്രമേ!",
    successDesc: "നിങ്ങളുടെ നിർദ്ദേശം ലഭിച്ചു. കിസാൻബഡി മെച്ചപ്പെടുത്താൻ ഞങ്ങൾ പ്രവർത്തിക്കും.",
    refLabel: "റഫറൻസ് നമ്പർ",
    closeBtn: "പൂർത്തിയായി",
    errorGeneric: "നെറ്റ്‌വർക്ക് പരിശോധിക്കുക.",

    quickTitle: "ഇത് ഉപകാരപ്രദമായിരുന്നോ?",
    quickHelpful: "ഉപകാരപ്രദമാണ്",
    quickCouldBeBetter: "ഇനിയും മെച്ചപ്പെടാം",
    quickNotHelpful: "ഉപകാരമില്ല",
    quickThanks: "നിങ്ങളുടെ അഭിപ്രായത്തിന് നന്ദി!",

    publicTitle: "നിങ്ങളുടെ നിർദ്ദേശം, ഞങ്ങളുടെ മാറ്റം",
    publicSubtitle: "കർഷകരുടെ നിർദ്ദേശങ്ങളാൽ വരുത്തിയ മാറ്റങ്ങൾ.",
    publicEmpty: "നിർദ്ദേശങ്ങൾ പരിശോധിക്കുകയാണ്. ഉടൻ ഇവിടെ കാണാം.",
    publicStatusPlanned: "പുരോഗമിക്കുന്നു",
    publicStatusCompleted: "പൂർത്തിയായി",
  },

  hi_en: {
    entryPointLabel: "Help Us Improve",
    entryPointSub: "Aapke sujhav se KisaanBuddy sabhi farmers ke liye aur behtar banta hai.",
    entryPointTag: "Kisan Voice",
    modalTitle: "Aapki Baat, Hamara Sudhar",
    modalSubtitle: "Bataiye kya achha laga, kya sudharna hai ya koi naya idea share karein. Bolkar ya pictures choose karke batayein—typing ki zaroorat nahi.",
    step1Heading: "Aap kis baare mein batana chahte hain?",
    step2Heading: "Apni bhasha mein batayein",
    step3Heading: "Check karein aur send karein",

    methodVoice: "Bolkar batayein",
    methodVoiceDesc: "Apni language mein bole, hum sun rahe hain.",
    methodChoices: "Options chun kar batayein",
    methodChoicesDesc: "Easy icons par tap karein.",
    methodText: "Likh kar ya photo bheinjein",

    likeTitle: "Pasand Aaya",
    likeDesc: "Kuch bahut achha kaam kiya",
    betterTitle: "Sudhar Chahiye",
    betterDesc: "Feature ko aur easy banayein",
    issueTitle: "Kaam Nahi Kar Raha",
    issueDesc: "Problem ya galat mandi rate",
    ideaTitle: "Naya Idea Hai",
    ideaDesc: "New feature ya service request",
    helpTitle: "Help Chahiye",
    helpDesc: "App chalane mein guidance",

    catWeather: "Mausam",
    catMandi: "Mandi Rates",
    catDisease: "Crop Doctor",
    catMarketplace: "Kharid-Bikri",
    catWorkers: "Farm Labour",
    catSchemes: "Govt Schemes",
    catGeneral: "Puri Website",

    tagWrongPrice: "Galat mandi rate hai",
    tagMissingCrop: "Meri crop list mein nahi hai",
    tagSlowApp: "App slow chal raha hai",
    tagVoiceHelp: "Voice guidance chahiye",
    tagMoreMarkets: "Paas ki mandi add karein",
    tagEasyLanguage: "Language aur simple karein",
    tagNeedBuyer: "Direct buyers chahiye",
    tagLabourNeed: "Mazdoor chahiye",

    startRecording: "Bolne ke liye mic dabayein",
    recording: "Sun rahe hain... boliye",
    stopRecording: "Bolna pura hua",
    playAudio: "Apni aawaz sunein",
    pauseAudio: "Pause",
    reRecord: "Fir se record karein",
    deleteAudio: "Delete karein",
    micDenied: "Microphone permission block hai. Aap niche options tap kar sakte hain.",
    micUnavailable: "Is browser par mic support nahi hai.",
    maxDuration: "Max 90 seconds",
    voiceRecordedNotice: "Aapki aawaz record ho gayi hai. Sun sakte hain ya send karein.",

    textLabel: "Optional notes",
    textPlaceholder: "Chahein toh yahan likh sakte hain (optional)...",
    attachPhoto: "Photo lagayein (optional)",
    photoAttached: "Photo attach ho gayi",
    removePhoto: "Remove",

    contactConsentLabel: "Zaroorat padne par kya hamari team contact kar sakti hai?",
    contactInputPlaceholder: "Aapka phone ya WhatsApp number",

    sendBtn: "Sujhav Bheinjein",
    sendingBtn: "Bheij rahe hain...",
    backBtn: "Back",
    successTitle: "Dhanyawad, Kisan Bhai!",
    successDesc: "Aapka feedback securely receive ho gaya hai. Team weekly basis par sabhi sujhav check karti hai.",
    refLabel: "Reference ID",
    closeBtn: "Done / Back to Farm",
    errorGeneric: "Network issue hai, kripya fir se try karein.",

    quickTitle: "Kya yeh jankari helpful thi?",
    quickHelpful: "Helpful",
    quickCouldBeBetter: "Aur behtar ho sakti hai",
    quickNotHelpful: "Helpful nahi thi",
    quickThanks: "Feedback ke liye bahut shukriya!",

    publicTitle: "Aapne Sujhav Diya, Humne Sudhara",
    publicSubtitle: "Farmers ke feedback par kiye gaye real improvements.",
    publicEmpty: "Farmers ke early suggestions review ho rahe hain. Verified updates yahan jaldi live honge.",
    publicStatusPlanned: "Kaam chalu hai",
    publicStatusCompleted: "Implement ho gaya",
  },
}

export function getFeedbackDict(lang: Lang): FeedbackDict {
  return FEEDBACK_TRANSLATIONS[lang] || FEEDBACK_TRANSLATIONS.en
}
