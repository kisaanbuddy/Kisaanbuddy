"use client"

import React from 'react'
import { useLanguage } from '@/lib/language'
import { GlassCard } from '@/components/ui/card'
import { CheckCircle2, Quote, UserCheck } from 'lucide-react'

interface Testimonial {
  name: Record<string, string>
  location: Record<string, string>
  crop: Record<string, string>
  text: Record<string, string>
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: {
      en: "Baldev Singh",
      hi: "बलदेव सिंह",
      kn: "ಬಲದೇವ್ ಸಿಂಗ್",
      mr: "बलदेव सिंग",
      te: "బలదేవ్ సింగ్",
      ta: "பல்தேவ் சிங்",
      gu: "બલદેવ સિંહ",
      bn: "বলদেব সিং",
      pa: "ਬਲਦੇਵ ਸਿੰਘ",
      ml: "ബൽദേവ് സിംഗ്",
      hi_en: "Baldev Singh"
    },
    location: {
      en: "Ludhiana, Punjab",
      hi: "लुधियाना, पंजाब",
      kn: "ಲುಧಿಯಾನ, ಪಂಜಾಬ್",
      mr: "लुधियाना, पंजाब",
      te: "లూధియానా, పంజాబ్",
      ta: "லுதியானா, பஞ்சாப்",
      gu: "લુધિયાણા, પંજાબ",
      bn: "লুধিয়ানা, পাঞ্জাব",
      pa: "ਲੁਧਿਆਣਾ, ਪੰਜਾਬ",
      ml: "ലുധിയാന, പഞ്ചാബ്",
      hi_en: "Ludhiana, Punjab"
    },
    crop: {
      en: "Wheat (DBW 187)",
      hi: "गेहूं (DBW 187)",
      kn: "ಗೋಧಿ (DBW 187)",
      mr: "गहू (DBW 187)",
      te: "గోధుమ (DBW 187)",
      ta: "கோதுமை (DBW 187)",
      gu: "ઘઉં (DBW 187)",
      bn: "গম (DBW 187)",
      pa: "ਕਣਕ (DBW 187)",
      ml: "ഗോതമ്പ് (DBW 187)",
      hi_en: "Wheat (DBW 187)"
    },
    text: {
      en: "KisaanBuddy's soil adviser showed me my organic carbon was too low. I reduced urea, added zinc and compost, and saved Rs. 5,200 per acre while keeping my yields high.",
      hi: "किसानमित्र के मृदा सलाहकार ने मुझे दिखाया कि मेरा जैविक कार्बन बहुत कम था। मैंने यूरिया कम किया, जिंक और खाद डाला, और पैदावार को अधिक रखते हुए प्रति एकड़ 5,200 रुपये बचाए।",
      kn: "KisaanBuddy ಮಣ್ಣಿನ ಸಲಹೆಗಾರರು ನನ್ನ ಸಾವಯವ ಇಂಗಾಲ ಕಡಿಮೆಯಾಗಿದೆ ಎಂದು ತೋರಿಸಿದರು. ನಾನು ಯೂರಿಯಾ ಕಡಿಮೆ ಮಾಡಿ ಜಿಂಕ್ ಮತ್ತು ಕಾಂಪೋಸ್ಟ್ ಸೇರಿಸಿದೆ, ಎಕರೆಗೆ ₹5,200 ಉಳಿತಾಯವಾಯಿತು.",
      mr: "KisaanBuddy च्या माती सल्लागाराने दाखवले की सेंद्रिय कर्ब कमी आहे. मी युरिया कमी केला, झिंक व कंपोस्ट वापरले आणि एकरी ₹५,२०० वाचवले.",
      te: "KisaanBuddy నేల సలహాదారు నా సేంద్రీయ కర్బనం తక్కువగా ఉందని చూపించారు. నేను యూరియా తగ్గించి జింక్, కంపోస్ట్ వాడాను, ఎకరానికి ₹5,200 ఆదా అయింది.",
      ta: "KisaanBuddy மண் ஆலோசகர் என் நிலத்தில் கரிம கார்பன் குறைவாக உள்ளதை சுட்டிக்காட்டினார். யூரியாவை குறைத்து துத்தநாகம், மக்கிய உரம் இட்டதால் ஏக்கருக்கு ₹5,200 மிச்சமானது.",
      gu: "KisaanBuddy ના સોઇલ એડવાઇઝરે મને કહ્યું કે જૈવિક કાર્બન ઓછો છે. મેં યુરિયા ઘટાડ્યું અને ઝિંક ઉમેર્યું, એકરે ₹5,200 ની બચત થઈ.",
      bn: "KisaanBuddy-র মৃত্তিকা উপদেষ্টা জানান যে আমার জৈব কার্বন কম ছিল। আমি ইউরিয়া কমিয়ে জিংক ও কম্পোস্ট যোগ করি এবং একরে ৫,২০০ টাকা সাশ্রয় করি।",
      pa: "KisaanBuddy ਦੇ ਮਿੱਟੀ ਸਲਾਹਕਾਰ ਨੇ ਦਿਖਾਇਆ ਕਿ ਜੈਵਿਕ ਕਾਰਬਨ ਘੱਟ ਸੀ। ਮੈਂ ਯੂਰੀਆ ਘਟਾਇਆ, ਜ਼ਿੰਕ ਤੇ ਰੂੜੀ ਪਾਈ ਅਤੇ ਪ੍ਰਤੀ ਏਕੜ ₹5,200 ਬਚਾਏ।",
      ml: "KisaanBuddy സോയിൽ അഡ്വൈസർ എന്റെ മണ്ണിൽ ഓർഗാനിക് കാർബൺ കുറവാണെന്ന് ചൂണ്ടിക്കാണിച്ചു. യൂറിയ കുറയ്ക്കുകയും സിങ്കും കമ്പോസ്റ്റും നൽകുകയും ചെയ്തതിലൂടെ ഏക്കറിന് 5,200 രൂപ ലാഭിച്ചു.",
      hi_en: "KisaanBuddy ke soil advisor ne bataya ki organic carbon kam tha. Maine urea kam karke zinc aur compost add kiya aur per acre Rs. 5,200 save kiye."
    }
  },
  {
    name: {
      en: "Hanuman Ram",
      hi: "हनुमान राम",
      kn: "ಹನುಮಾನ್ ರಾಮ್",
      mr: "हनुमान राम",
      te: "హనుమాన్ రామ్",
      ta: "ஹனுமான் ராம்",
      gu: "હનુમાન રામ",
      bn: "হনুমান রাম",
      pa: "ਹਨੂਮਾਨ ਰਾਮ",
      ml: "ഹനുമാൻ റാം",
      hi_en: "Hanuman Ram"
    },
    location: {
      en: "Jodhpur, Rajasthan",
      hi: "जोधपुर, राजस्थान",
      kn: "ಜೋಧ್‌ಪುರ, ರಾಜಸ್ಥಾನ",
      mr: "जोधपूर, राजस्थान",
      te: "జోధ్‌పూర్, రాజస్థాన్",
      ta: "ஜோத்பூர், ராஜஸ்தான்",
      gu: "જોધપુર, રાજસ્થાન",
      bn: "যোধপুর, রাজস্থান",
      pa: "ਜੋਧਪੁਰ, ਰਾਜਸਥਾਨ",
      ml: "ജോധ്പൂർ, രാജസ്ഥാൻ",
      hi_en: "Jodhpur, Rajasthan"
    },
    crop: {
      en: "Cotton & Pearl Millet",
      hi: "कपास और बाजरा",
      kn: "ಹತ್ತಿ ಮತ್ತು ಸಜ್ಜೆ",
      mr: "कापूस आणि बाजरी",
      te: "పత్తి మరియు సజ్జలు",
      ta: "பருத்தி மற்றும் கம்பு",
      gu: "કપાસ અને બાજરી",
      bn: "তুলা ও বাজরা",
      pa: "ਨਰਮਾ ਅਤੇ ਬਾਜਰਾ",
      ml: "പരുത്തിയും തിനയും",
      hi_en: "Cotton & Bajra"
    },
    text: {
      en: "I found the PMKSY drip irrigation scheme on KisaanBuddy and learned the step-by-step registration. The local department verified my application, and I got an 80% subsidy.",
      hi: "मैंने किसानमित्र पर पीएमकेएसवाई (PMKSY) ड्रिप सिंचाई योजना की जानकारी पाई और पंजीकरण करना सीखा। स्थानीय विभाग ने मेरे आवेदन को सत्यापित किया, और मुझे 80% सब्सिडी मिली।",
      kn: "ನಾನು KisaanBuddy ನಲ್ಲಿ PMKSY ಹನಿ ನೀರಾವರಿ ಯೋಜನೆಯನ್ನು ಕಂಡುಹಿಡಿದು ಹಂತ ಹಂತವಾಗಿ ನೋಂದಾಯಿಸಿದೆ. ಸ್ಥಳೀಯ ಇಲಾಖೆ ಪರಿಶೀಲಿಸಿ ನನಗೆ 80% ಸಬ್ಸಿಡಿ ದೊರೆಯಿತು.",
      mr: "मला KisaanBuddy वर PMKSY ठिबक सिंचन योजनेची माहिती मिळाली. मी अर्ज केला आणि मला ८०% अनुदान मिळाले.",
      te: "నేను KisaanBuddy ద్వారా PMKSY బిందు సేద్యం పథకం గురించి తెలుసుకుని దరఖాస్తు చేసుకున్నాను. నాకు 80% సబ్సిడీ లభించింది.",
      ta: "KisaanBuddy மூலம் PMKSY சொட்டு நீர் பாசன திட்டம் பற்றி அறிந்து விண்ணப்பித்தேன். எனக்கு 80% மானியம் கிடைத்தது.",
      gu: "મેં KisaanBuddy પર PMKSY ડ્રિપ ઇરિગેશન યોજના વિશે જાણ્યું અને અરજી કરી. મને 80% સબસિડી મળી.",
      bn: "KisaanBuddy-তে PMKSY ড্রিপ সেচ প্রকল্পের তথ্য পেয়ে ধাপে ধাপে আবেদন করি এবং ৮০% ভর্তুকি পাই।",
      pa: "ਮੈਂ KisaanBuddy ਤੇ PMKSY ਤੁਪਕਾ ਸਿੰਚਾਈ ਸਕੀਮ ਲੱਭੀ ਅਤੇ ਅਰਜ਼ੀ ਦਿੱਤੀ। ਮੈਨੂੰ 80% ਸਬਸਿਡੀ ਮਿਲੀ।",
      ml: "KisaanBuddy-ലൂടെ PMKSY തുള്ളിനന പദ്ധതിയെക്കുറിച്ച് മനസ്സിലാക്കി അപേക്ഷിക്കുകയും 80% സബ്‌സിഡി നേടുകയും ചെയ്തു.",
      hi_en: "Maine KisaanBuddy par PMKSY drip irrigation scheme dekhi aur apply kiya. Mujhe 80% subsidy mil gayi."
    }
  },
  {
    name: {
      en: "Satish Mishra",
      hi: "सतीश मिश्रा",
      kn: "ಸತೀಶ್ ಮಿಶ್ರಾ",
      mr: "सतीश मिश्रा",
      te: "సతీష్ మిశ్రా",
      ta: "சதீஷ் மிஸ்ரா",
      gu: "સતીશ મિશ્રા",
      bn: "সতীশ মিশ্র",
      pa: "ਸਤੀਸ਼ ਮਿਸ਼ਰਾ",
      ml: "സതീഷ് മിശ്ര",
      hi_en: "Satish Mishra"
    },
    location: {
      en: "Ayodhya, Uttar Pradesh",
      hi: "अयोध्या, उत्तर प्रदेश",
      kn: "ಅಯೋಧ್ಯೆ, ಉತ್ತರ ಪ್ರದೇಶ",
      mr: "अयोध्या, उत्तर प्रदेश",
      te: "అయోధ్య, ఉత్తర ప్రదేశ్",
      ta: "அயோத்தி, உத்தரபிரதேசம்",
      gu: "અયોધ્યા, ઉત્તર પ્રદેશ",
      bn: "অযোধ্যা, উত্তর প্রদেশ",
      pa: "ਅਯੁੱਧਿਆ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼",
      ml: "അയോദ്ധ്യ, ഉത്തർപ്രദേശ്",
      hi_en: "Ayodhya, Uttar Pradesh"
    },
    crop: {
      en: "Potato & Paddy",
      hi: "आलू और धान",
      kn: "ಆಲೂಗಡ್ಡೆ ಮತ್ತು ಭತ್ತ",
      mr: "बटाटा आणि भात",
      te: "బంగాళాదుంప మరియు వరి",
      ta: "உருளைக்கிழங்கு மற்றும் நெல்",
      gu: "બટાટા અને ડાંગર",
      bn: "আলু ও ধান",
      pa: "ਆਲੂ ਅਤੇ ਝੋਨਾ",
      ml: "ഉരുളക്കിഴങ്ങും നെല്ലും",
      hi_en: "Aloo & Dhaan"
    },
    text: {
      en: "When my potatoes got dark spots during foggy weather, KisaanBuddy's disease scanner diagnosed it as Late Blight. The suggested Cymoxanil spray stopped it in 3 days.",
      hi: "जब कोहरे के मौसम में मेरे आलुओं पर काले धब्बे आ गए, तो किसानमित्र के रोग स्कैनर ने पछेती झुलसा की पहचान की। अनुशंसित साइमोक्सानिल स्प्रे ने इसे 3 दिनों में रोक दिया।",
      kn: "ಮಂಜಿನ ವಾತಾವರಣದಲ್ಲಿ ಆಲೂಗಡ್ಡೆಗೆ ಕಪ್ಪು ಚುಕ್ಕೆ ಬಂದಾಗ KisaanBuddy ರೋಗ ಸ್ಕ್ಯಾನರ್ ಲೇಟ್ ಬ್ಲೈಟ್ ಎಂದು ಗುರುತಿಸಿತು. ಶಿಫಾರಸು ಮಾಡಿದ ಸಿಂಪಡಣೆಯಿಂದ 3 ದಿನದಲ್ಲಿ ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ ಬಂತು.",
      mr: "धुक्याच्या वातावरणात बटाट्यावर काळे डाग पडले तेव्हा KisaanBuddy च्या स्कॅनरने करपा ओळखला आणि योग्य फवारणीने ३ दिवसात रोग आटोक्यात आला.",
      te: "మంచు వాతావరణంలో బంగాళాదుంపలపై నల్లటి మచ్చలు వచ్చినప్పుడు KisaanBuddy లేట్ బ్లైట్ తెగులుగా గుర్తించింది. సూచించిన మందుతో 3 రోజుల్లో నయమైంది.",
      ta: "பனிமூட்டமான காலநிலையில் உருளைக்கிழங்கில் கரும்புள்ளி வந்தபோது, KisaanBuddy லேட் பிளைட் நோயை கண்டறிந்தது. பரிந்துரைத்த மருந்து 3 நாளில் நோயைக் கட்டுப்படுத்தியது.",
      gu: "ઝાકળના વાતાવરણમાં બટાટા પર કાળા ડાઘ પડ્યા ત્યારે રોગ સ્કેનરે પછેતી સુકારો ઓળખ્યો અને ૩ દિવસમાં પાક બચી ગયો.",
      bn: "কুয়াশার সময় আলুতে কালো দাগ দেখা দিলে KisaanBuddy লেট ব্লাইট রোগ শনাক্ত করে এবং সঠিক স্প্রে দিয়ে ৩ দিনে সমাধান করে।",
      pa: "ਧੁੰਦ ਵਿੱਚ ਜਦੋਂ ਆਲੂਆਂ ਤੇ ਕਾਲੇ ਧੱਬੇ ਆਏ ਤਾਂ KisaanBuddy ਨੇ ਪਿਛੇਤਾ ਝੁਲਸਾ ਰੋਗ ਪਛਾਣਿਆ ਅਤੇ 3 ਦਿਨਾਂ ਵਿੱਚ ਫਸਲ ਬਚ ਗਈ।",
      ml: "മൂടൽമഞ്ഞുള്ള കാലാവസ്ഥയിൽ ഉരുളക്കിഴങ്ങിൽ കറുത്ത പാടുകൾ വന്നപ്പോൾ KisaanBuddy കൃത്യമായി രോഗം തിരിച്ചറിഞ്ഞ് 3 ദിവസത്തിനുള്ളിൽ പരിഹാരം നൽകി.",
      hi_en: "KisaanBuddy ke disease scanner ne foggy weather me potato Late Blight diagnose kiya aur suggested spray se 3 days me control ho gaya."
    }
  },
  {
    name: {
      en: "Devendra Patil",
      hi: "देवेन्द्र पाटिल",
      kn: "ದೇವೇಂದ್ರ ಪಾಟೀಲ್",
      mr: "देवेन्द्र पाटील",
      te: "దేవేంద్ర పాటిల్",
      ta: "தேவேந்திர பாட்டீல்",
      gu: "દેવેન્દ્ર પાટીલ",
      bn: "দেবেন্দ্র পাতিল",
      pa: "ਦੇਵੇਂਦਰ ਪਾਟਿਲ",
      ml: "ദേവേന്ദ്ര പാട്ടീൽ",
      hi_en: "Devendra Patil"
    },
    location: {
      en: "Nashik, Maharashtra",
      hi: "नासिक, महाराष्ट्र",
      kn: "ನಾಸಿಕ್, ಮಹಾರಾಷ್ಟ್ರ",
      mr: "नाशिक, महाराष्ट्र",
      te: "నాసిక్, మహారాష్ట్ర",
      ta: "நாசிக், மகாராஷ்டிரா",
      gu: "નાસિક, મહારાષ્ટ્ર",
      bn: "নাসিক, মহারাষ্ট্র",
      pa: "ਨਾਸਿਕ, ਮਹਾਰਾਸ਼ਟਰ",
      ml: "നാസിക്, മഹാരാഷ്ട്ര",
      hi_en: "Nashik, Maharashtra"
    },
    crop: {
      en: "Grapes & Vegetables",
      hi: "अंगूर और सब्जियां",
      kn: "ದ್ರಾಕ್ಷಿ ಮತ್ತು ತರಕಾರಿಗಳು",
      mr: "द्राक्षे आणि भाजीपाला",
      te: "ద్రాక్ష మరియు కూరగాయలు",
      ta: "திராட்சை மற்றும் காய்கறிகள்",
      gu: "દ્રાક્ષ અને શાકભાજી",
      bn: "আঙ্গুর ও শাকসবজি",
      pa: "ਅੰਗੂਰ ਅਤੇ ਸਬਜ਼ੀਆਂ",
      ml: "മുന്തിരിയും പച്ചക്കറികളും",
      hi_en: "Grapes & Vegetables"
    },
    text: {
      en: "The mandi tracker made it easier to compare prices across APMCs and eNAM before deciding where to sell my harvest.",
      hi: "मंडी ट्रैकर ने मेरी उपज बेचने से पहले विभिन्न एपीएमसी और ई-नाम पर भावों की तुलना करना बहुत आसान बना दिया।",
      kn: "ಮಂಡಿ ಟ್ರ್ಯಾಕರ್‌ನಿಂದಾಗಿ ನನ್ನ ಬೆಳೆ ಮಾರಾಟ ಮಾಡುವ ಮುನ್ನ ವಿವಿಧ APMC ಗಳು ಮತ್ತು eNAM ದರಗಳನ್ನು ಹೋಲಿಸುವುದು ತುಂಬಾ ಸುಲಭವಾಯಿತು.",
      mr: "मंडी ट्रॅकरमुळे पीक विकण्यापूर्वी विविध बाजार समित्यांचे आणि eNAM चे दर तपासणे अत्यंत सोपे झाले.",
      te: "మండి ట్రాకర్ సహాయంతో పంట అమ్మే ముందు వివిధ మార్కెట్ల ధరలను సరిపోల్చడం చాలా సులభమైంది.",
      ta: "மண்டி டிராக்கர் மூலம் பயிர்களை விற்பனை செய்வதற்கு முன் பல சந்தைகளின் விலைகளை ஒப்பிடுவது மிகவும் எளிதானது.",
      gu: "મંડી ટ્રેકર દ્વારા પાક વેચતા પહેલાં વિવિધ માર્કેટ યાર્ડના ભાવો સરખાવવાનું ખૂબ સરળ બન્યું.",
      bn: "মান্ডি ট্র্যাকার ব্যবহার করে বিভিন্ন এপিএমসি ও ই-নামের দর তুলনা করে ফসল বিক্রি করা অনেক সহজ হয়েছে।",
      pa: "ਮੰਡੀ ਟਰੈਕਰ ਨੇ ਫਸਲ ਵੇਚਣ ਤੋਂ ਪਹਿਲਾਂ ਵੱਖ-ਵੱਖ ਮੰਡੀਆਂ ਦੇ ਭਾਅ ਮਿਲਾਉਣੇ ਬਹੁਤ ਆਸਾਨ ਕਰ ਦਿੱਤੇ।",
      ml: "മാർക്കറ്റ് ട്രാക്കർ വഴി വിളകൾ വിൽക്കുന്നതിന് മുൻപ് വിലകൾ താരതമ്യം ചെയ്യുന്നത് വളരെ എളുപ്പമായി.",
      hi_en: "Mandi tracker ki madad se produce sell karne se pehle alag-alag APMCs ke prices compare karna bahut easy ho gaya."
    }
  }
]

const HEADER_I18N: Record<string, { badge: string; title: string; subtitle: string; verified: string }> = {
  en: {
    badge: "Verified Testimonials",
    title: "Real Impact, Real Farmers",
    subtitle: "Hear from actual smallholders across India who used KisaanBuddy to optimize crop costs and protect yields.",
    verified: "Verified"
  },
  hi: {
    badge: "सत्यापित अनुभव",
    title: "वास्तविक प्रभाव, वास्तविक किसान",
    subtitle: "भारत भर के उन किसानों के अनुभव सुनें जिन्होंने फसल लागत कम करने और पैदावार बढ़ाने के लिए KisaanBuddy का उपयोग किया।",
    verified: "सत्यापित"
  },
  kn: {
    badge: "ದೃಢೀಕೃತ ಅನುಭವಗಳು",
    title: "ನೈಜ ಪ್ರಭಾವ, ನೈಜ ರೈತರು",
    subtitle: "ಬೆಳೆ ವೆಚ್ಚವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಮತ್ತು ಇಳುವರಿಯನ್ನು ಹೆಚ್ಚಿಸಲು KisaanBuddy ಬಳಸಿದ ರೈತರ ನೈಜ ಅನುಭವಗಳು.",
    verified: "ದೃಢೀಕೃತ"
  },
  mr: {
    badge: "सत्यापित अनुभव",
    title: "वास्तविक प्रभाव, खरे शेतकरी",
    subtitle: "खर्च कमी करण्यासाठी आणि उत्पादन वाढवण्यासाठी KisaanBuddy वापरणाऱ्या भारतातील शेतकऱ्यांचे अनुभव.",
    verified: "सत्यापित"
  },
  te: {
    badge: "ధృవీకరించబడిన అనుభవాలు",
    title: "నిజమైన ప్రభావం, నిజమైన రైతులు",
    subtitle: "సాగు ఖర్చులు తగ్గించుకుని దిగుబడి పెంచుకోవడానికి KisaanBuddy ఉపయోగించిన రైతుల అనుభవాలు.",
    verified: "ధృవీకరించబడింది"
  },
  ta: {
    badge: "சரிபார்க்கப்பட்ட அனுபவங்கள்",
    title: "உண்மையான தாக்கம், உண்மையான விவசாயிகள்",
    subtitle: "சாகுபடி செலவைக் குறைத்து மகசூலை அதிகரிக்க KisaanBuddy பயன்படுத்திய விவசாயிகளின் குரல்கள்.",
    verified: "சரிபார்க்கப்பட்டது"
  },
  gu: {
    badge: "ચકાસાયેલ અનુભવો",
    title: "વાસ્તવિક અસર, સાચા ખેડૂતો",
    subtitle: "ખેતી ખર્ચ ઘટાડવા અને ઉત્પાદન વધારવા KisaanBuddy વાપરનારા ભારતના ખેડૂતોના અનુભવો.",
    verified: "ચકાસાયેલ"
  },
  bn: {
    badge: "যাচাইকৃত অভিজ্ঞতা",
    title: "আসল প্রভাব, আসল কৃষক",
    subtitle: "চাষের খরচ কমিয়ে ফলন বাড়াতে KisaanBuddy ব্যবহারকারী কৃষকদের বাস্তব অভিজ্ঞতা।",
    verified: "যাচাইকৃত"
  },
  pa: {
    badge: "ਤਸਦੀਕਸ਼ੁਦਾ ਤਜਰਬੇ",
    title: "ਅਸਲ ਪ੍ਰਭਾਵ, ਅਸਲ ਕਿਸਾਨ",
    subtitle: "ਖਰਚੇ ਘਟਾਉਣ ਅਤੇ ਝਾੜ ਵਧਾਉਣ ਲਈ KisaanBuddy ਵਰਤਣ ਵਾਲੇ ਕਿਸਾਨਾਂ ਦੇ ਤਜਰਬੇ।",
    verified: "ਤਸਦੀਕਸ਼ੁਦਾ"
  },
  ml: {
    badge: "സ്ഥിരീകരിച്ച അനുഭവങ്ങൾ",
    title: "യഥാർത്ഥ സ്വാധീനം, യഥാർത്ഥ കർഷകർ",
    subtitle: "കൃഷിച്ചെലവ് കുറയ്ക്കാനും വിളവ് വർദ്ധിപ്പിക്കാനും KisaanBuddy ഉപയോഗിച്ച കർഷകരുടെ അനുഭവങ്ങൾ.",
    verified: "സ്ഥിരീകരിച്ചത്"
  },
  hi_en: {
    badge: "Verified Testimonials",
    title: "Real Impact, Real Farmers",
    subtitle: "Crop costs reduce karne aur yield badhane ke liye KisaanBuddy use karne wale farmers ke real experiences.",
    verified: "Verified"
  }
}

export default function TrustTestimonials() {
  const { lang } = useLanguage()
  const h = HEADER_I18N[lang] || HEADER_I18N.en

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <UserCheck className="h-3.5 w-3.5" />
          {h.badge}
        </span>
        <h2 className="text-xl md:text-3xl font-black text-white font-display">
          {h.title}
        </h2>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto font-semibold">
          {h.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {TESTIMONIALS.map((t, idx) => {
          const name = t.name[lang] || t.name.hi || t.name.en
          const location = t.location[lang] || t.location.hi || t.location.en
          const crop = t.crop[lang] || t.crop.hi || t.crop.en
          const text = t.text[lang] || t.text.hi || t.text.en

          return (
            <GlassCard 
              key={idx} 
              className="p-6 border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-300 relative bg-slate-950/10 flex flex-col justify-between rounded-2xl"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-white/[0.02] pointer-events-none" />
              
              <div className="space-y-4">
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed italic font-semibold">
                  "{text}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    {name}
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-2 w-2" /> {h.verified}
                    </span>
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                    {location}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04] text-emerald-400">
                    {crop}
                  </span>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </section>
  )
}
