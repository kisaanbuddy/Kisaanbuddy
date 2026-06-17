export type Lang = "en" | "hi" | "kn" | "ta" | "te" | "ml" | "mr" | "bn" | "pa" | "gu" | "hi_en"

export const WEATHER_T: Record<Lang, Record<string, string>> = {
  en: {
    weather_title: "Weather Intelligence",
    weather_subtitle: "Hyper-local conditions and agriculture weather advisory for your field",
    detecting_loc: "Detecting your location...",
    gps_loc: "Using your precise mobile GPS location",
    ip_loc: "Using approximate location via internet network",
    manual_loc: "Showing weather details for {city}",
    blocked_loc: "GPS location blocked. Enable GPS or search your city manually.",
    gps_retry_btn: "Enable / Detect GPS",
    current_weather: "Current Weather",
    feels_like: "Feels like",
    observed_at: "Time",
    data_source: "Data source",
    live: "Live",
    cached: "Cached",
    retry: "Retry",
    load_fail: "Failed to load weather details",
    
    // Stats
    wind_speed: "Wind Speed",
    humidity: "Air Moisture",
    pressure: "Air Pressure",
    visibility: "Visibility Distance",
    uv_index: "Sunlight Intensity",
    wind_dir: "Wind Direction",
    sunrise: "Sunrise",
    sunset: "Sunset",
    
    // Forecasts
    hourly_forecast: "Next Few Hours",
    no_hourly: "Hourly data not available",
    day_forecast: "{days}-Day Weather Forecast",
    no_daily: "Daily forecast not available",
    chance_of_rain: "Chance of rain",
    rain_chance_desc: "chance of rain",
    wind_desc: "wind",
    today: "Today",
    tomorrow: "Tomorrow",

    // Advice
    farmer_advice_title: "Agriculture & Weather Advice",
    listen_btn: "Listen to Advice",
    stop_btn: "Stop Audio",
    whatsapp_btn: "Share on WhatsApp",

    // Advice statements
    adv_wind: "⚠️ Caution: High winds detected ({speed} km/h). Avoid pesticide spraying now to prevent drift.",
    adv_rain: "🌧️ Warning: Rain is expected in the next few days ({chance}% chance). Pause irrigation to save water and prevent root rotting.",
    adv_heat: "☀️ Caution: Very high temperature ({temp}°C). Irrigate in early morning or evening to protect crops from heat stress.",
    adv_humidity: "💧 Caution: High humidity ({humidity}%). Fungal crop diseases may spread. Monitor leaves closely.",
    adv_optimal: "✅ Advice: Weather is favorable. Good time for fertilizer application, weeding, and normal farm work.",
    
    // Conditions
    cond_clear: "Sunny / Clear",
    cond_cloudy: "Partly Cloudy",
    cond_overcast: "Overcast Clouds",
    cond_mist: "Mist / Haze",
    cond_fog: "Dense Fog",
    cond_rain: "Rainy",
    cond_light_rain: "Light Drizzle",
    cond_heavy_rain: "Heavy Rain",
    cond_thunder: "Thunderstorm",
    cond_snow: "Snow",
  },
  hi: {
    weather_title: "मौसम का हाल",
    weather_subtitle: "आपके खेत के मौसम का सटीक पूर्वानुमान और कृषि सलाह",
    detecting_loc: "आपके स्थान का पता लगाया जा रहा है...",
    gps_loc: "आपके मोबाइल/जीपीएस (GPS) स्थान का उपयोग किया जा रहा है",
    ip_loc: "इंटरनेट नेटवर्क से आपके स्थान का अनुमान लगाया गया है",
    manual_loc: "{city} के मौसम की जानकारी दिखाई जा रही है",
    blocked_loc: "जीपीएस स्थान बंद है। कृपया सटीक मौसम के लिए जीपीएस ऑन करें या नीचे शहर खोजें।",
    gps_retry_btn: "स्थान (GPS) चालू करें",
    current_weather: "अभी का मौसम",
    feels_like: "महसूस होने वाला तापमान",
    observed_at: "समय",
    data_source: "डेटा स्रोत",
    live: "लाइव",
    cached: "सुरक्षित डेटा",
    retry: "फिर से कोशिश करें",
    load_fail: "मौसम की जानकारी लोड नहीं हो सकी",
    
    // Stats
    wind_speed: "हवा की गति",
    humidity: "हवा में नमी (पानी)",
    pressure: "वायु दबाव",
    visibility: "साफ़ दिखने की दूरी",
    uv_index: "धूप की तीव्रता (UV)",
    wind_dir: "हवा की दिशा",
    sunrise: "सूर्योदय",
    sunset: "सूर्यास्त",
    
    // Forecasts
    hourly_forecast: "अगले कुछ घंटों का मौसम",
    no_hourly: "घंटेवार मौसम उपलब्ध नहीं है",
    day_forecast: "अगले {days} दिनों का मौसम",
    no_daily: "मौसम पूर्वानुमान उपलब्ध नहीं है",
    chance_of_rain: "बारिश की संभावना",
    rain_chance_desc: "बारिश की संभावना",
    wind_desc: "हवा की गति",
    today: "आज",
    tomorrow: "कल",

    // Advice
    farmer_advice_title: "मौसम सलाह (किसानों के लिए विशेष)",
    listen_btn: "सलाह बोलकर सुनें",
    stop_btn: "आवाज बंद करें",
    whatsapp_btn: "व्हाट्सएप पर शेयर करें",

    // Advice statements
    adv_wind: "⚠️ चेतावनी: हवा की गति तेज़ है ({speed} किमी/घंटा)। दवाई (कीटनाशक) का छिड़काव अभी न करें, वरना हवा में उड़ जाएगी।",
    adv_rain: "🌧️ सावधानी: अगले कुछ दिनों में बारिश की संभावना है ({chance}%)। सिंचाई रोक दें ताकि पानी और मेहनत बचे और फसल न गले।",
    adv_heat: "☀️ चेतावनी: तापमान बहुत अधिक है ({temp}°C)। फसलों को दोपहर के बजाय सुबह-सुबह या शाम को पानी दें।",
    adv_humidity: "💧 सावधानी: हवा में नमी ({humidity}%) अधिक है। फसलों में फंगस (उल्ली) रोग लगने का खतरा है। पत्तों की निगरानी करें।",
    adv_optimal: "✅ सलाह: मौसम बहुत अच्छा और अनुकूल है। खाद डालने, निराई-गुड़ाई और बुवाई के लिए उत्तम समय है।",
    
    // Conditions
    cond_clear: "साफ़ धूप",
    cond_cloudy: "हल्के बादल",
    cond_overcast: "घने बादल (छायादार)",
    cond_mist: "हल्की धुंध",
    cond_fog: "घना कोहरा",
    cond_rain: "बारिश",
    cond_light_rain: "हल्की बूंदाबांदी",
    cond_heavy_rain: "भारी बारिश",
    cond_thunder: "बिजली और गरज",
    cond_snow: "बर्फबारी",
  },
  kn: {
    weather_title: "ಹವಾಮಾನ ಮಾಹಿತಿ",
    weather_subtitle: "ನಿಮ್ಮ ಜಮೀನಿನ ಹವಾಮಾನ ವರದಿ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳು",
    detecting_loc: "ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...",
    gps_loc: "ನಿಮ್ಮ ನಿಖರವಾದ ಜಿಪಿಎಸ್ ಸ್ಥಳವನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ",
    ip_loc: "ಇಂಟರ್ನೆಟ್ ಮೂಲಕ ಸ್ಥಳ ಅಂದಾಜಿಸಲಾಗಿದೆ",
    manual_loc: "{city} ಹವಾಮಾನ ಮಾಹಿತಿ ತೋರಿಸಲಾಗುತ್ತಿದೆ",
    blocked_loc: "ಜಿಪಿಎಸ್ ಆಫ್ ಆಗಿದೆ. ಜಿಪಿಎಸ್ ಆನ್ ಮಾಡಿ ಅಥವಾ ನಗರದ ಹೆಸರನ್ನು ಹುಡುಕಿ.",
    gps_retry_btn: "ಜಿಪಿಎಸ್ (GPS) ಆನ್ ಮಾಡಿ",
    current_weather: "ಪ್ರಸ್ತುತ ಹವಾಮಾನ",
    feels_like: "ಅನಿಸಿಕೆ ತಾಪಮಾನ",
    observed_at: "ಸಮಯ",
    data_source: "ಮಾಹಿತಿ ಮೂಲ",
    live: "ಲೈವ್",
    cached: "ಉಳಿಸಿದ ಮಾಹಿತಿ",
    retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    load_fail: "ಹವಾಮಾನ ಮಾಹಿತಿ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ",
    
    // Stats
    wind_speed: "ಗಾಳಿಯ ವೇಗ",
    humidity: "ಗಾಳಿಯಲ್ಲಿನ ತೇವಾಂಶ",
    pressure: "ವಾಯು ಒತ್ತಡ",
    visibility: "ಸ್ಪಷ್ಟ ದೃಷ್ಟಿ ದೂರ",
    uv_index: "ಬಿಸಿಲಿನ ತೀವ್ರತೆ (UV)",
    wind_dir: "ಗಾಳಿಯ ದಿಕ್ಕು",
    sunrise: "ಸೂರ್ಯೋದಯ",
    sunset: "ಸೂರ್ಯಾಸ್ತ",
    
    // Forecasts
    hourly_forecast: "ಮುಂದಿನ ಕೆಲವು ಗಂಟೆಗಳ ವರದಿ",
    no_hourly: "ಗಂಟೆವಾರು ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
    day_forecast: "ಮುಂದಿನ {days} ದಿನಗಳ ಹವಾಮಾನ",
    no_daily: "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಲಭ್ಯವಿಲ್ಲ",
    chance_of_rain: "ಮಳೆಯ ಸಾಧ್ಯತೆ",
    rain_chance_desc: "ಮಳೆಯ ಸಾಧ್ಯತೆ",
    wind_desc: "ಗಾಳಿ",
    today: "ಇಂದು",
    tomorrow: "ನಾಳೆ",

    // Advice
    farmer_advice_title: "ರೈತರಿಗೆ ಹವಾಮಾನ ಸಲಹೆ",
    listen_btn: "ಸಲಹೆ ಆಲಿಸಿ",
    stop_btn: "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ",
    whatsapp_btn: "ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ",

    // Advice statements
    adv_wind: "⚠️ ಎಚ್ಚರಿಕೆ: ಗಾಳಿಯ ವೇಗ ಹೆಚ್ಚಾಗಿದೆ ({speed} km/h). ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ.",
    adv_rain: "🌧️ ಎಚ್ಚರಿಕೆ: ಮುಂದಿನ ಕೆಲವು ದಿನಗಳಲ್ಲಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ ({chance}%). ನೀರಾವರಿ ನಿಲ್ಲಿಸಿ.",
    adv_heat: "☀️ ಎಚ್ಚರಿಕೆ: ಹೆಚ್ಚಿನ ತಾಪಮಾನವಿದೆ ({temp}°C). ಮುಂಜಾನೆ ಅಥವಾ ಸಂಜೆ ನೀರು ಹಾಯಿಸಿ.",
    adv_humidity: "💧 ಎಚ್ಚರಿಕೆ: ಗಾಳಿಯಲ್ಲಿ ಆರ್ದ್ರತೆ ಹೆಚ್ಚಾಗಿದೆ ({humidity}%). ಶಿಲೀಂಧ್ರ ರೋಗಗಳ ಬಗ್ಗೆ ಎಚ್ಚರವಿರಲಿ.",
    adv_optimal: "✅ ಸಲಹೆ: ಹವಾಮಾನವು ಉತ್ತಮವಾಗಿದೆ. ಗೊಬ್ಬರ ಹಾಕಲು ಮತ್ತು ಕೃಷಿ ಕೆಲಸಗಳಿಗೆ ಸೂಕ್ತ ಸಮಯ.",
    
    // Conditions
    cond_clear: "ಬಿಸಿಲು / ಸ್ವಚ್ಛ ಆಕಾಶ",
    cond_cloudy: "ಭಾಗಶಃ ಮೋಡ",
    cond_overcast: "ದಟ್ಟ ಮೋಡಗಳು",
    cond_mist: "ಮಂಜು",
    cond_fog: "ದಟ್ಟ ಮಂಜು",
    cond_rain: "ಮಳೆ",
    cond_light_rain: "ಹಗುರ ಮಳೆ",
    cond_heavy_rain: "ಭಾರೀ ಮಳೆ",
    cond_thunder: "ಸಿಡಿಲು ಸಹಿತ ಮಳೆ",
    cond_snow: "ಹಿಮಪಾತ",
  },
  ta: {
    weather_title: "வானிலை அறிக்கை",
    weather_subtitle: "உங்கள் வயலின் வானிலை நிலவரம் மற்றும் விவசாய ஆலோசனை",
    detecting_loc: "உங்கள் இருப்பிடத்தைக் கண்டறிகிறது...",
    gps_loc: "உங்கள் மொபைல் ஜி.பி.எஸ் இருப்பிடம் பயன்படுத்தப்படுகிறது",
    ip_loc: "இணைய நெட்வொர்க் இருப்பிடம் பயன்படுத்தப்படுகிறது",
    manual_loc: "{city} வானிலை காட்டப்படுகிறது",
    blocked_loc: "ஜி.பி.எஸ் முடக்கப்பட்டுள்ளது. ஜி.பி.எஸ் ஆன் செய்யவும் அல்லது தேடவும்.",
    gps_retry_btn: "ஜி.பி.எஸ் (GPS) ஆன் செய்",
    current_weather: "தற்போதைய வானிலை",
    feels_like: "உணரப்படும் வெப்பநிலை",
    observed_at: "நேரம்",
    data_source: "தரவு ஆதாரம்",
    live: "நேரலை",
    cached: "சேமிக்கப்பட்ட தரவு",
    retry: "மீண்டும் முயலவும்",
    load_fail: "வானிலை தரவுகளை ஏற்ற முடியவில்லை",
    
    // Stats
    wind_speed: "காற்றின் வேகம்",
    humidity: "காற்றின் ஈரப்பதம்",
    pressure: "காற்று அழுத்தம்",
    visibility: "தெரிவு நிலைத் தூரம்",
    uv_index: "வெயிலின் தாக்கம் (UV)",
    wind_dir: "காற்றின் திசை",
    sunrise: "சூரிய உதயம்",
    sunset: "சூரிய அஸ்தமனம்",
    
    // Forecasts
    hourly_forecast: "அடுத்த சில மணிநேர வானிலை",
    no_hourly: "மணிநேர தரவு கிடைக்கவில்லை",
    day_forecast: "அடுத்த {days} நாட்களின் வானிலை",
    no_daily: "வானிலை முன்னறிவிப்பு கிடைக்கவில்லை",
    chance_of_rain: "மழைக்கான வாய்ப்பு",
    rain_chance_desc: "மழை வாய்ப்பு",
    wind_desc: "காற்று",
    today: "இன்று",
    tomorrow: "நாளை",

    // Advice
    farmer_advice_title: "விவசாய வானிலை ஆலோசனை",
    listen_btn: "ஆலோசனையைக் கேள்",
    stop_btn: "ஒலியை நிறுத்து",
    whatsapp_btn: "வாட்ஸ்அப்பில் பகிர்",

    // Advice statements
    adv_wind: "⚠️ எச்சரிக்கை: காற்றின் வேகம் அதிகமாக உள்ளது ({speed} கி.மீ/மணி). பூச்சிக்கொல்லி தெளிப்பதைத் தவிர்க்கவும்.",
    adv_rain: "🌧️ எச்சரிக்கை: அடுத்த சில நாட்களில் மழை பெய்ய வாய்ப்புள்ளது ({chance}%). நீர் பாய்ச்சுவதை நிறுத்துங்கள்.",
    adv_heat: "☀️ எச்சரிக்கை: அதிக வெப்பநிலை ({temp}°C). அதிகாலை அல்லது மாலையில் நீர் பாய்ச்சவும்.",
    adv_humidity: "💧 எச்சரிக்கை: அதிக ஈரப்பதம் ({humidity}%). பூஞ்சை நோய்கள் பரவ வாய்ப்புள்ளது. இலைகளை கண்காணிக்கவும்.",
    adv_optimal: "✅ ஆலோசனை: வானிலை சாதகமாக உள்ளது. உரம் போட மற்றும் கலை எடுக்க நல்ல நேரம்.",
    
    // Conditions
    cond_clear: "வெயில் / தெளிவான வானம்",
    cond_cloudy: "பகுதி மேகமூட்டம்",
    cond_overcast: "அடர்ந்த மேகங்கள்",
    cond_mist: "மூடுபனி",
    cond_fog: "அடர்ந்த பனி",
    cond_rain: "மழை",
    cond_light_rain: "சாரல் மழை",
    cond_heavy_rain: "கனமழை",
    cond_thunder: "இடியுடன் கூடிய மழை",
    cond_snow: "பனிப்பொழிவு",
  },
  te: {
    weather_title: "హవామాన సమాచారం",
    weather_subtitle: "మీ పొలం హవామాన నివేదిక మరియు వ్యవసాయ సలహాలు",
    detecting_loc: "మీ స్థానాన్ని గుర్తిస్తోంది...",
    gps_loc: "మీ మొబైల్ జీపీఎస్ స్థానాన్ని ఉపయోగిస్తోంది",
    ip_loc: "ఇంటర్నెట్ ద్వారా స్థానాన్ని అంచనా వేసింది",
    manual_loc: "{city} హవామాన వివరాలు చూపబడుతున్నాయి",
    blocked_loc: "జీపీఎస్ ఆఫ్‌లో ఉంది. జీపీఎస్ ఆన్ చేయండి లేదా నగరాన్ని వెతకండి.",
    gps_retry_btn: "జీపీఎస్ (GPS) ఆన్ చేయండి",
    current_weather: "ప్రస్తుత హవామానం",
    feels_like: "అనిపించే ఉష్ణోగ్రత",
    observed_at: "సమయం",
    data_source: "డేటా మూలం",
    live: "లైవ్",
    cached: "సేవ్ చేసిన డేటా",
    retry: "మళ్ళీ ప్రయత్నించు",
    load_fail: "హవామాన వివరాలు లోడ్ కాలేదు",
    
    // Stats
    wind_speed: "గాలి వేగం",
    humidity: "గాలిలో తేమ",
    pressure: "వాయు పీడనం",
    visibility: "దృష్టి దూరం",
    uv_index: "ఎండ తీవ్రత (UV)",
    wind_dir: "గాలి దిశ",
    sunrise: "సూర్యోదయం",
    sunset: "సూర్యాస్తమయం",
    
    // Forecasts
    hourly_forecast: "రాబోయే కొన్ని గంటల సమాచారం",
    no_hourly: "గంటవారీ డేటా అందుబాటులో లేదు",
    day_forecast: "రాబోయే {days} రోజుల హవామానం",
    no_daily: "హవామాన సూచన అందుబాటులో లేదు",
    chance_of_rain: "వర్షం పడే అవకాశం",
    rain_chance_desc: "వర్ష అవకాశం",
    wind_desc: "గాలి",
    today: "నేడు",
    tomorrow: "రేపు",

    // Advice
    farmer_advice_title: "వ్యవసాయ హవామాన సలహా",
    listen_btn: "సలహా వినండి",
    stop_btn: "వాయిస్ ఆపండి",
    whatsapp_btn: "వాట్సాప్‌లో షేర్ చేయండి",

    // Advice statements
    adv_wind: "⚠️ హెచ్చరిక: గాలి వేగం ఎక్కువగా ఉంది ({speed} కి.మీ/గంట). పురుగుల మందుల పిచికారీ నిలిపివేయండి.",
    adv_rain: "🌧️ హెచ్చరిక: రాబోయే కొద్ది రోజుల్లో వర్షం కురిసే అవకాశం ఉంది ({chance}%). నీటి తడులు ఆపండి.",
    adv_heat: "☀️ హెచ్చరిక: అధిక ఉష్ణోగ్రత ({temp}°C). ఉదయం లేదా సాయంత్రం నీరు పెట్టండి.",
    adv_humidity: "💧 హెచ్చరిక: గాలిలో తేమ శాతం ఎక్కువ ఉంది ({humidity}%). తెగుళ్లు వచ్చే అవకాశం ఉంది. గమనించండి.",
    adv_optimal: "✅ సలహా: హవామానం అనుకూలంగా ఉంది. ఎరువులు వేయడానికి, కలుపు తీయడానికి మంచి సమయం.",
    
    // Conditions
    cond_clear: "ఎండ / స్వచ్ఛమైన ఆకాశం",
    cond_cloudy: "పాక్షికంగా మేఘాలు",
    cond_overcast: "దట్టమైన మేఘాలు",
    cond_mist: "మంచు",
    cond_fog: "దట్టమైన పొగమంచు",
    cond_rain: "వర్షం",
    cond_light_rain: "చినుకులు",
    cond_heavy_rain: "భారీ వర్షం",
    cond_thunder: "ఉరుములతో కూడిన వర్షం",
    cond_snow: "మంచు కురవడం",
  },
  ml: {
    weather_title: "കാലാവസ്ഥ വിവരങ്ങൾ",
    weather_subtitle: "നിങ്ങളുടെ കൃഷിയിടത്തിലെ കാലാവസ്ഥയും കർഷക നിർദ്ദേശങ്ങളും",
    detecting_loc: "നിങ്ങളുടെ സ്ഥലം കണ്ടെത്തുന്നു...",
    gps_loc: "നിങ്ങളുടെ മൊബൈൽ ജി.പി.എസ് അടിസ്ഥാനമാക്കി",
    ip_loc: "ഇന്റർനെറ്റ് അടിസ്ഥാനമാക്കി സ്ഥലം കണ്ടെത്തിയിരിക്കുന്നു",
    manual_loc: "{city} കാലാവസ്ഥ കാണിക്കുന്നു",
    blocked_loc: "ജി.പി.എസ് ഓഫ് ആണ്. ജി.പി.എസ് ഓൺ ചെയ്യുക അല്ലെങ്കിൽ നഗരം തിരയുക.",
    gps_retry_btn: "ജി.പി.എസ് ഓൺ ചെയ്യുക",
    current_weather: "ഇപ്പോഴത്തെ കാലാവസ്ഥ",
    feels_like: "അനുഭവപ്പെടുന്ന ചൂട്",
    observed_at: "സമയം",
    data_source: "വിവരങ്ങളുടെ ഉറവിടം",
    live: "തത്സമയം",
    cached: "സൂക്ഷിച്ച വിവരങ്ങൾ",
    retry: "വീണ്ടും ശ്രമിക്കുക",
    load_fail: "വിവരങ്ങൾ ലഭ്യമാക്കാൻ കഴിഞ്ഞില്ല",
    
    // Stats
    wind_speed: "കാറ്റിന്റെ വേഗത",
    humidity: "അന്തരീക്ഷ ഈർപ്പം",
    pressure: "വായു മർദ്ദം",
    visibility: "കാഴ്ചാ പരിധി",
    uv_index: "വെയിലിന്റെ തീവ്രത (UV)",
    wind_dir: "കാറ്റിന്റെ ദിശ",
    sunrise: "സൂര്യോദയം",
    sunset: "സൂര്യാസ്തമയം",
    
    // Forecasts
    hourly_forecast: "അടുത്ത ഏതാനും മണിക്കൂറുകൾ",
    no_hourly: "മണിക്കൂർ തിരിച്ചുള്ള വിവരങ്ങൾ ലഭ്യമല്ല",
    day_forecast: "അടുത്ത {days} ദിവസങ്ങളിലെ കാലാവസ്ഥ",
    no_daily: "മുൻകൂട്ടി വിവരങ്ങൾ ലഭ്യമല്ല",
    chance_of_rain: "മഴയ്ക്ക് സാധ്യത",
    rain_chance_desc: "മഴ സാധ്യത",
    wind_desc: "കാറ്റ്",
    today: "ഇന്ന്",
    tomorrow: "നാളെ",

    // Advice
    farmer_advice_title: "കർഷകർക്കുള്ള കാലാവസ്ഥ നിർദ്ദേശം",
    listen_btn: "നിർദ്ദേശങ്ങൾ കേൾക്കൂ",
    stop_btn: "ശബ്ദം നിർത്തൂ",
    whatsapp_btn: "വാട്സാപ്പിൽ പങ്കുവെക്കാം",

    // Advice statements
    adv_wind: "⚠️ മുന്നറിയിപ്പ്: ശക്തമായ കാറ്റുണ്ട് ({speed} km/h). മരുന്ന് തളിക്കുന്നത് ഒഴിവാക്കുക.",
    adv_rain: "🌧️ മുന്നറിയിപ്പ്: അടുത്ത ദിവസങ്ങളിൽ മഴയ്ക്ക് സാധ്യതയുണ്ട് ({chance}%). നനയ്ക്കുന്നത് ഒഴിവാക്കുക.",
    adv_heat: "☀️ മുന്നറിയിപ്പ്: കഠിനമായ ചൂട് ({temp}°C). രാവിലെയും വൈകിട്ടും മാത്രം നനയ്ക്കുക.",
    adv_humidity: "💧 മുന്നറിയിപ്പ്: അന്തരീക്ഷ ഈർപ്പം കൂടുതലാണ് ({humidity}%). ഫംഗസ് രോഗങ്ങൾ ശ്രദ്ധിക്കുക.",
    adv_optimal: "✅ നിർദ്ദേശം: കാലാവസ്ഥ അനുകൂലമാണ്. വളം ചേർക്കാനും കള പറിക്കാനും അനുയോജ്യമായ സമയം.",
    
    // Conditions
    cond_clear: "വെയിൽ / തെളിഞ്ഞ ആകാശം",
    cond_cloudy: "അംശികമായി മേഘാവൃതം",
    cond_overcast: "മേഘാവൃതം",
    cond_mist: "മഞ്ഞ്",
    cond_fog: "കടുത്ത മഞ്ഞ്",
    cond_rain: "മഴ",
    cond_light_rain: "ചെറിയ മഴ",
    cond_heavy_rain: "ശക്തമായ മഴ",
    cond_thunder: "ഇടിമിന്നലോട് കൂടിയ മഴ",
    cond_snow: "മഞ്ഞുവീഴ്ച",
  },
  mr: {
    weather_title: "हवामानाचा अंदाज",
    weather_subtitle: "तुमच्या शेतासाठी अचूक हवामान आणि कृषी सल्ला",
    detecting_loc: "तुमचे स्थान शोधत आहे...",
    gps_loc: "तुमच्या मोबाईल जीपीएस स्थानाचा वापर करत आहे",
    ip_loc: "इंटरनेट नेटवर्कवरून तुमचे स्थान शोधले आहे",
    manual_loc: "{city} चे हवामान दाखवले जात आहे",
    blocked_loc: "जीपीएस बंद आहे. कृपया अचूक हवामानासाठी जीपीएस ऑन करा किंवा शहर शोधा.",
    gps_retry_btn: "जीपीएस (GPS) चालू करा",
    current_weather: "सध्याचे हवामान",
    feels_like: "जाणवणारे तापमान",
    observed_at: "वेळ",
    data_source: "डेटा स्रोत",
    live: "थेट (लाइव्ह)",
    cached: "सुरक्षित डेटा",
    retry: "पुन्हा प्रयत्न करा",
    load_fail: "हवामानाची माहिती लोड होऊ शकली नाही",
    
    // Stats
    wind_speed: "वाऱ्याचा वेग",
    humidity: "हवेतील दमटपणा (नमी)",
    pressure: "हवेचा दाब",
    visibility: "स्पष्ट दिसण्याची मर्यादा",
    uv_index: "उन्हाची तीव्रता (UV)",
    wind_dir: "वाऱ्याची दिशा",
    sunrise: "सूर्योदय",
    sunset: "सूर्यास्त",
    
    // Forecasts
    hourly_forecast: "पुढील काही तासांचा अंदाज",
    no_hourly: "तासवार अंदाज उपलब्ध नाही",
    day_forecast: "पुढील {days} दिवसांचा अंदाज",
    no_daily: "हवामान अंदाज उपलब्ध नाही",
    chance_of_rain: "पावसाची शक्यता",
    rain_chance_desc: "पावसाची शक्यता",
    wind_desc: "वारा",
    today: "आज",
    tomorrow: "उद्या",

    // Advice
    farmer_advice_title: "शेतकऱ्यांसाठी हवामान सल्ला",
    listen_btn: "सल्ला ऐका",
    stop_btn: "आवाज बंद करा",
    whatsapp_btn: "व्हॉट्सॲपवर शेअर करा",

    // Advice statements
    adv_wind: "⚠️ चेतावणी: वाऱ्याचा वेग जास्त आहे ({speed} किमी/तास). औषध फवारणी टाळा, औषध हवेत उडून जाईल.",
    adv_rain: "🌧️ चेतावणी: पुढील काही दिवसांत पावसाची शक्यता आहे ({chance}%). पाणी देणे थांबवा जेणेकरून पीक सडणार नाही.",
    adv_heat: "☀️ चेतावणी: तापमान खूप जास्त आहे ({temp}°C). पिकांना दुपारी ऐवजी सकाळी किंवा संध्याकाळी पाणी द्या.",
    adv_humidity: "💧 चेतावणी: हवेतील दमटपणा जास्त आहे ({humidity}%). बुरशीजन्य रोग वाढू शकतात, पानांची तपासणी करा.",
    adv_optimal: "✅ सल्ला: हवामान अनुकूल आहे. खत टाकणे, खुरपणी आणि सामान्य शेतीच्या कामांसाठी उत्तम वेळ.",
    
    // Conditions
    cond_clear: "स्वच्छ ऊन",
    cond_cloudy: "अंशत: ढगाळ",
    cond_overcast: "ढगाळ वातावरण",
    cond_mist: "धुके",
    cond_fog: "दाट धुके",
    cond_rain: "पाऊस",
    cond_light_rain: "हलका पाऊस",
    cond_heavy_rain: "मुसळधार पाऊस",
    cond_thunder: "विजेसह वादळी पाऊस",
    cond_snow: "बर्फवृष्टी",
  },
  bn: {
    weather_title: "আবহাওয়ার খবর",
    weather_subtitle: "আপনার খামারের আবহাওয়ার সঠিক পূর্বাভাস ও কৃষি পরামর্শ",
    detecting_loc: "আপনার অবস্থান খোঁজা হচ্ছে...",
    gps_loc: "আপনার মোবাইল জিপিএস অবস্থান ব্যবহার করা হচ্ছে",
    ip_loc: "ইন্টারনেট নেটওয়ার্ক দ্বারা আপনার অবস্থান অনুমান করা হয়েছে",
    manual_loc: "{city} এর আবহাওয়ার খবর দেখানো হচ্ছে",
    blocked_loc: "জিপিএস বন্ধ রয়েছে। সঠিক আবহাওয়ার জন্য জিপিএস অন করুন বা শহর অনুসন্ধান করুন।",
    gps_retry_btn: "জিপিএস (GPS) চালু করুন",
    current_weather: "বর্তমান আবহাওয়া",
    feels_like: "অনুভূত তাপমাত্রা",
    observed_at: "সময়",
    data_source: "উৎস",
    live: "লাইভ",
    cached: "সংরক্ষিত তথ্য",
    retry: "পুনরায় চেষ্টা করুন",
    load_fail: "আবহাওয়ার তথ্য লোড করা যায়নি",
    
    // Stats
    wind_speed: "বাতাসের গতিবেগ",
    humidity: "বাতাসের আর্দ্রতা",
    pressure: "বায়ু চাপ",
    visibility: "দৃষ্টিসীমা",
    uv_index: "সূর্যের আলোর তীব্রতা (UV)",
    wind_dir: "বাতাসের দিক",
    sunrise: "সূর্যোদয়",
    sunset: "सूर्यास्त",
    
    // Forecasts
    hourly_forecast: "পরবর্তী কয়েক ঘণ্টার পূর্বাভাস",
    no_hourly: "ঘণ্টাভিত্তিক পূর্বাভাস উপলব্ধ নেই",
    day_forecast: "পরবর্তী {days} দিনের আবহাওয়া",
    no_daily: "আবহাওয়ার পূর্বাভাস উপলব্ধ নেই",
    chance_of_rain: "বৃষ্টির সম্ভাবনা",
    rain_chance_desc: "বৃষ্টির সম্ভাবনা",
    wind_desc: "বাতাস",
    today: "আজ",
    tomorrow: "আগামীকাল",

    // Advice
    farmer_advice_title: "কৃষকদের জন্য বিশেষ পরামর্শ",
    listen_btn: "পরামর্শ শুনুন",
    stop_btn: "শব্দ বন্ধ করুন",
    whatsapp_btn: "হোয়াটসঅ্যাপে শেয়ার করুন",

    // Advice statements
    adv_wind: "⚠️ সতর্কতা: বাতাসের গতি বেশি ({speed} কিমি/ঘণ্টা)। এখন কীটনাশক স্প্রে করা এড়িয়ে চলুন।",
    adv_rain: "🌧️ সতর্কতা: আগামী কয়েক দিনে বৃষ্টির সম্ভাবনা আছে ({chance}%)। জল সেচ সাময়িক বন্ধ রাখুন।",
    adv_heat: "☀️ সতর্কতা: খুব বেশি তাপমাত্রা রয়েছে ({temp}°C)। খুব সকালে বা সন্ধ্যায় ফসলে জল সেচ দিন।",
    adv_humidity: "💧 সতর্কতা: বাতাসে আর্দ্রতা বেশি ({humidity}%)। ছত্রাক ঘটিত রোগ দেখা দিতে পারে। পাতা নিরীক্ষণ করুন।",
    adv_optimal: "✅ পরামর্শ: আবহাওয়া অনুকূল। সার প্রয়োগ, আগাছা পরিষ্কার বা চাষের সাধারণ কাজের উপযুক্ত সময়।",
    
    // Conditions
    cond_clear: "রৌদ্রোজ্জ্বল / পরিষ্কার আকাশ",
    cond_cloudy: "আংশিক মেঘলা",
    cond_overcast: "মেঘলা আকাশ",
    cond_mist: "কুয়াশা",
    cond_fog: "ঘন কুয়াশা",
    cond_rain: "বৃষ্টি",
    cond_light_rain: "হালকা বৃষ্টি",
    cond_heavy_rain: "ভারী বৃষ্টি",
    cond_thunder: "বজ্রবিদ্যুৎ সহ ঝড়",
    cond_snow: "তুষারপাত",
  },
  pa: {
    weather_title: "ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ",
    weather_subtitle: "ਤੁਹਾਡੇ ਖੇਤ ਦੇ ਮੌਸਮ ਦਾ ਸਹੀ ਅਨੁਮਾਨ ਅਤੇ ਖੇਤੀਬਾੜੀ ਸਲਾਹ",
    detecting_loc: "ਤੁਹਾਡੀ ਲੋਕੇਸ਼ਨ ਦਾ ਪਤਾ ਲਗਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...",
    gps_loc: "ਤੁਹਾਡੀ ਮੋਬਾਈਲ ਜੀਪੀਐਸ ਲੋਕੇਸ਼ਨ ਦੀ ਵਰਤੋਂ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ",
    ip_loc: "ਇੰਟਰਨੈੱਟ ਨੈੱਟਵਰਕ ਤੋਂ ਤੁਹਾਡੀ ਲੋਕੇਸ਼ਨ ਦਾ ਅੰਦਾਜ਼ਾ ਲਗਾਇਆ ਗਿਆ ਹੈ",
    manual_loc: "{city} ਦੇ ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ ਦਿਖਾਈ ਜਾ ਰਹੀ ਹੈ",
    blocked_loc: "ਜੀਪੀਐਸ ਬੰਦ ਹੈ। ਸਹੀ ਮੌਸਮ ਲਈ ਜੀਪੀਐਸ ਚਾਲੂ ਕਰੋ ਜਾਂ ਸ਼ਹਿਰ ਦੀ ਖੋਜ ਕਰੋ।",
    gps_retry_btn: "ਜੀਪੀਐਸ (GPS) ਚਾਲੂ ਕਰੋ",
    current_weather: "ਹੁਣ ਦਾ ਮੌਸਮ",
    feels_like: "ਮਹਿਸੂਸ ਹੋਣ ਵਾਲਾ ਤਾਪਮਾਨ",
    observed_at: "ਸਮਾਂ",
    data_source: "ਡਾਟਾ ਸਰੋਤ",
    live: "ਲਾਈਵ",
    cached: "ਸੁਰੱਖਿਅਤ ਡਾਟਾ",
    retry: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    load_fail: "ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀ",
    
    // Stats
    wind_speed: "ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ",
    humidity: "ਹਵਾ ਵਿੱਚ ਨਮੀ",
    pressure: "ਹਵਾ ਦਾ ਦਬਾਅ",
    visibility: "ਸਾਫ਼ ਦੇਖਣ ਦੀ ਦੂਰੀ",
    uv_index: "ਧੁੱਪ ਦੀ ਤੀਬਰਤਾ (UV)",
    wind_dir: "ਹਵਾ ਦੀ ਦਿਸ਼ਾ",
    sunrise: "ਸੂਰਜ ਚੜ੍ਹਨਾ",
    sunset: "ਸੂਰਜ ਡੁੱਬਣਾ",
    
    // Forecasts
    hourly_forecast: "ਅਗਲੇ ਕੁਝ ਘੰਟਿਆਂ ਦਾ ਮੌਸਮ",
    no_hourly: "ਘੰਟੇਵਾਰ ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ",
    day_forecast: "ਅਗਲੇ {days} ਦਿਨਾਂ ਦਾ ਮੌਸਮ",
    no_daily: "ਮੌਸਮ ਦਾ ਅਨੁਮਾਨ ਉਪਲਬਧ ਨਹੀਂ ਹੈ",
    chance_of_rain: "ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ",
    rain_chance_desc: "ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ",
    wind_desc: "ਹਵਾ",
    today: "ਅੱਜ",
    tomorrow: "ਕੱਲ੍ਹ",

    // Advice
    farmer_advice_title: "ਕਿਸਾਨਾਂ ਲਈ ਮੌਸਮ ਦੀ ਵਿਸ਼ੇਸ਼ ਸਲਾਹ",
    listen_btn: "ਸਲਾਹ ਸੁਣੋ",
    stop_btn: "ਆਵਾਜ਼ ਬੰਦ ਕਰੋ",
    whatsapp_btn: "ਵਟਸਐਪ 'ਤੇ ਸ਼ੇਅਰ ਕਰੋ",

    // Advice statements
    adv_wind: "⚠️ ਚੇਤਾਵਨੀ: ਹਵਾ ਬਹੁਤ ਤੇਜ਼ ਹੈ ({speed} ਕਿਲੋਮੀਟਰ/ਘੰਟਾ)। ਕੀਟਨਾਸ਼ਕਾਂ ਦਾ ਛਿੜਕਾਅ ਹੁਣੇ ਰੋਕ ਦਿਓ।",
    adv_rain: "🌧️ ਚੇਤਾਵਨੀ: ਅਗਲੇ ਕੁਝ ਦਿਨਾਂ ਵਿੱਚ ਮੀਂਹ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ ({chance}%)। ਸਿੰਚਾਈ ਰੋਕ ਦਿਓ।",
    adv_heat: "☀️ ਚੇਤਾਵਨੀ: ਤਾਪਮਾਨ ਬਹੁਤ ਜ਼ਿਆਦਾ ਹੈ ({temp}°C)। ਫ਼ਸਲਾਂ ਨੂੰ ਦੁਪਹਿਰ ਦੀ ਬਜਾਏ ਸਵੇਰੇ ਜਾਂ ਸ਼ਾਮ ਨੂੰ ਪਾਣੀ ਦਿਓ।",
    adv_humidity: "💧 ਚੇਤਾਵਨੀ: ਹਵਾ ਵਿੱਚ ਨਮੀ ਜ਼ਿਆਦਾ ਹੈ ({humidity}%)। ਫ਼ਸਲਾਂ ਨੂੰ ਉੱਲੀ ਰੋਗ ਲੱਗਣ ਦਾ ਖ਼ਤਰਾ ਹੈ। ਪੱਤਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ।",
    adv_optimal: "✅ ਸਲਾਹ: ਮੌਸਮ ਬਹੁਤ ਵਧੀਆ ਹੈ। ਖਾਦ ਪਾਉਣ, ਗੋਡੀ ਕਰਨ ਅਤੇ ਆਮ ਕੰਮਾਂ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ ਹੈ।",
    
    // Conditions
    cond_clear: "ਸਾਫ਼ ਧੁੱਪ",
    cond_cloudy: "ਹਲਕੇ ਬੱਦਲ",
    cond_overcast: "ਘਣੇ ਬੱਦਲ",
    cond_mist: "ਧੁੰਦ",
    cond_fog: "ਘਣੀ ਧੁੰਦ",
    cond_rain: "ਮੀਂਹ",
    cond_light_rain: "ਹਲਕੀ ਬੂੰਦਾ-ਬਾਂਦੀ",
    cond_heavy_rain: "ਭਾਰੀ ਮੀਂਹ",
    cond_thunder: "ਬਿਜਲੀ ਲਿਸ਼ਕਣਾ ਤੇ ਗਰਜ",
    cond_snow: "ਬਰਫ਼ਬਾਰੀ",
  },
  gu: {
    weather_title: "હવામાનની માહિતી",
    weather_subtitle: "તમારા ખેતર માટે ચોક્કસ હવામાન પૂર્વાનુમાન અને ખેતી સલાહ",
    detecting_loc: "તમારા સ્થાનની શોધ ચાલુ છે...",
    gps_loc: "તમારા મોબાઈલ જીપીએસ સ્થાનનો ઉપયોગ કરવામાં આવી રહ્યો છે",
    ip_loc: "ઈન્ટરનેટ નેટવર્ક પરથી સ્થાન અંદાજવામાં આવ્યું છે",
    manual_loc: "{city} ના હવામાનની માહિતી બતાવવામાં આવી રહી છે",
    blocked_loc: "જીપીએસ બંધ છે. ચોક્કસ હવામાન માટે જીપીએસ ચાલુ કરો અથવા શહેર શોધો.",
    gps_retry_btn: "જીપીએસ (GPS) ચાલુ કરો",
    current_weather: "અત્યારનું હવામાન",
    feels_like: "અનુભવાતું તાપમાન",
    observed_at: "સમય",
    data_source: "માહિતી સ્ત્રોત",
    live: "લાઈવ",
    cached: "સંગ્રહિત માહિતી",
    retry: "ફરી પ્રયત્ન કરો",
    load_fail: "હવામાનની માહિતી લોડ થઈ શકી નથી",
    
    // Stats
    wind_speed: "પવનની ગતિ",
    humidity: "હવામાં ભેજનું પ્રમાણ",
    pressure: "હવાનું દબાણ",
    visibility: "ચોખ્ખું જોવાની મર્યાદા",
    uv_index: "તડકાની તીવ્રતા (UV)",
    wind_dir: "પવનની દિશા",
    sunrise: "સૂર્યોદય",
    sunset: "સૂર્યાસ્ત",
    
    // Forecasts
    hourly_forecast: "આગામી થોડા કલાકોનું હવામાન",
    no_hourly: "કલાકવાર માહિતી ઉપલબ્ધ નથી",
    day_forecast: "આગામી {days} દિવસનું હવામાન",
    no_daily: "હવામાન પૂર્વાનુમાન ઉપલબ્ધ નથી",
    chance_of_rain: "વરસાદની શક્યતા",
    rain_chance_desc: "વરસાદની શક્યતા",
    wind_desc: "પવન",
    today: "આજ",
    tomorrow: "આવતીકાલ",

    // Advice
    farmer_advice_title: "ખેડૂતો માટે હવામાન સલાહ",
    listen_btn: "સલાહ સાંભળો",
    stop_btn: "અવાજ બંધ કરો",
    whatsapp_btn: "વોટ્સએપ પર શેર કરો",

    // Advice statements
    adv_wind: "⚠️ ચેતવણી: ਪવનની ગતિ ખૂબ વધારે છે ({speed} કિમી/કલાક). અત્યારે કીટનાશકોનો છંટકાવ ટાળો.",
    adv_rain: "🌧️ ચેતવણી: આગામી દિવસોમાં વરસાદની શક્યતા છે ({chance}%). પાકને પાણી પાવાનું બંધ રાખો.",
    adv_heat: "☀️ ચેતવણી: ખૂબ ઊંચું તાપમાન છે ({temp}°C). પાકને બપોરે નહિ પરંતુ સવારે કે સાંજે પાણી આપો.",
    adv_humidity: "💧 ચેતવણી: હવામાં ભેજ વધુ છે ({humidity}%). ફૂગજન્ય રોગ આવી શકે છે, પાન ચકાસો.",
    adv_optimal: "✅ સલાહ: હવામાન અનુકૂળ છે. ખાતર આપવા કે નીંદણ કરવા માટે આ ઉત્તમ સમય છે.",
    
    // Conditions
    cond_clear: "ચોખ્ખો તડકો",
    cond_cloudy: "આંશિક વાદળછાયું",
    cond_overcast: "વાદળછાયું વાતાવરણ",
    cond_mist: "ધુમ્મસ",
    cond_fog: "ઘાટું ધુમ્મસ",
    cond_rain: "વરસાદ",
    cond_light_rain: "હળવો વરસાદ",
    cond_heavy_rain: "ભારે વરસાદ",
    cond_thunder: "વીજળી સાથે તોફાન",
    cond_snow: "બરફવર્ષા",
  },
  hi_en: {
    weather_title: "Mausam ka Haal",
    weather_subtitle: "Aapke khet ke mausam ka sateek poorvanuman aur krishi salah",
    detecting_loc: "Aapke sthan ka pata lagaya ja raha hai...",
    gps_loc: "Aapke mobile/GPS sthan ka upayog kiya ja raha hai",
    ip_loc: "Internet network se aapke sthan ka anuman lagaya gaya hai",
    manual_loc: "{city} ke mausam ki jaankari dikhai ja rahi hai",
    blocked_loc: "GPS sthan band hai. Kripya sateek mausam ke liye GPS on karein ya neeche shehar khojein.",
    gps_retry_btn: "Sthan (GPS) chalu karein",
    current_weather: "Abhi ka mausam",
    feels_like: "Mehsus hone wala tapmaan",
    observed_at: "Samay",
    data_source: "Data srot",
    live: "Live",
    cached: "Surakshit data",
    retry: "Phir se koshish karein",
    load_fail: "Mausam ki jaankari load nahi ho saki",
    
    // Stats
    wind_speed: "Hawa ki gati",
    humidity: "Hawa mein nami (paani)",
    pressure: "Vayu dabaav",
    visibility: "Saaf dikhne ki doori",
    uv_index: "Dhoop ki teevrata (UV)",
    wind_dir: "Hawa ki disha",
    sunrise: "Suryoday",
    sunset: "Suryast",
    
    // Forecasts
    hourly_forecast: "Agle kuch ghanton ka mausam",
    no_hourly: "Ghantewar mausam uplabdh nahi hai",
    day_forecast: "Agle {days} dinon ka mausam",
    no_daily: "Mausam poorvanuman uplabdh nahi hai",
    chance_of_rain: "Baarish ki sambhavna",
    rain_chance_desc: "baarish ki sambhavna",
    wind_desc: "hawa ki gati",
    today: "Aaj",
    tomorrow: "Kal",

    // Advice
    farmer_advice_title: "Mausam salah (Kisanon ke liye vishesh)",
    listen_btn: "Salah bolkar sunein",
    stop_btn: "Aawaz band karein",
    whatsapp_btn: "WhatsApp par share karein",

    // Advice statements
    adv_wind: "⚠️ Chetavni: Hawa ki gati tez hai ({speed} km/h). Dawai (keetnashak) ka chidkaw abhi na karein, warna hawa mein ud jayegi.",
    adv_rain: "🌧️ Savdhani: Agle kuch dinon mein baarish ki sambhavna hai ({chance}%). Sinchai rok dein taaki paani aur mehnati bache aur fasal na gale.",
    adv_heat: "☀️ Chetavni: Tapmaan bahut adhik hai ({temp}°C). Faslon ko dopahar ke bajaye subah-subah ya shaam ko paani dein.",
    adv_humidity: "💧 Savdhani: Hawa mein nami ({humidity}%) adhik hai. Faslon mein fungus (ulli) rog lagne ka khatra hai. Patton ki nigrani karein.",
    adv_optimal: "✅ Salah: Mausam bahut achha aur anukool hai. Khaad dalne, nirai-gudai aur buwai ke liye uttam samay hai.",
    
    // Conditions
    cond_clear: "Saaf dhoop",
    cond_cloudy: "Halke baadal",
    cond_overcast: "Ghane baadal (chhayadar)",
    cond_mist: "Halki dhundh",
    cond_fog: "Ghana kohra",
    cond_rain: "Baarish",
    cond_light_rain: "Halki boondabaandi",
    cond_heavy_rain: "Bhaari baarish",
    cond_thunder: "Bijli aur garaj",
    cond_snow: "Barafbaari",
  },
}

/**
 * Normalizes and translates the raw condition string returned by the weather API.
 */
export function translateCondition(condition: string | undefined | null, lang: Lang): string {
  if (!condition) return ""
  const c = condition.toLowerCase()
  const t = WEATHER_T[lang] || WEATHER_T.hi

  if (c.includes("sunny") || c.includes("clear")) return t.cond_clear
  if (c.includes("partly cloudy") || c.includes("scattered")) return t.cond_cloudy
  if (c.includes("overcast") || c.includes("cloudy")) return t.cond_overcast
  if (c.includes("mist") || c.includes("haze")) return t.cond_mist
  if (c.includes("fog")) return t.cond_fog
  if (c.includes("thunder") || c.includes("storm")) return t.cond_thunder
  if (c.includes("heavy rain") || c.includes("torrential")) return t.cond_heavy_rain
  if (c.includes("light rain") || c.includes("drizzle") || c.includes("patchy rain")) return t.cond_light_rain
  if (c.includes("rain") || c.includes("shower")) return t.cond_rain
  if (c.includes("snow") || c.includes("sleet") || c.includes("ice")) return t.cond_snow
  
  return condition // Fallback to raw string if unrecognized
}

/**
 * Returns simplified direction name in the selected language.
 */
export function translateWindDir(dir: string | undefined | null, lang: Lang): string {
  if (!dir) return ""
  const d = dir.toUpperCase().trim()
  
  const translations: Record<string, Record<Lang, string>> = {
    N: { en: "North Wind", hi: "उत्तरी हवा", kn: "ಉತ್ತರ ಗಾಳಿ", ta: "வடக்கு காற்று", te: "ఉత్తర గాలి", ml: "വടക്കൻ കാറ്റ്", mr: "उत्तरी वारा", bn: "উত্তুরে হাওয়া", pa: "ਉੱਤਰੀ ਹਵਾ", gu: "ઉત્તરી પવન", hi_en: "Uttari hawa" },
    S: { en: "South Wind", hi: "दक्षिणी हवा", kn: "ದಕ್ಷಿಣ ಗಾಳಿ", ta: "தெற்கு காற்று", te: "దక్షిణ గాలి", ml: "തെക്കൻ കാറ്റ്", mr: "दक्षिणी वारा", bn: "দখিনা হাওয়া", pa: "ਦੱਖਣੀ ਹਵਾ", gu: "દક્ષિણી પવન", hi_en: "Dakshini hawa" },
    E: { en: "East Wind", hi: "पूर्वी हवा", kn: "ಪೂರ್ವ ಗಾಳಿ", ta: "கிழக்கு காற்று", te: "తూర్పు గాలి", ml: "കിഴക്കൻ കാറ്റ്", mr: "पूर्वी वारा", bn: "পুবালি হাওয়া", pa: "ਪੂਰਬੀ ਹਵਾ", gu: "પૂર્વી પવન", hi_en: "Poorvi hawa" },
    W: { en: "West Wind", hi: "पश्चिमी हवा", kn: "ਪաշਚิม ಗಾಳಿ", ta: "மேற்கு காற்று", te: "పడమర గాలి", ml: "പടിഞ്ഞാറൻ കാറ്റ്", mr: "पश्चिमी वारा", bn: "পশ্চিমা হাওয়া", pa: "ਪੱਛਮੀ ਹਵਾ", gu: "પશ્ચિમી પવન", hi_en: "Pashchimi hawa" },
    NE: { en: "North-East", hi: "उत्तर-पूर्वी हवा", kn: "ಈಶಾನ್ಯ ಗಾಳಿ", ta: "வடகிழக்கு காற்று", te: "ఈశాన్య గాలి", ml: "വടക്ക്-കിഴക്കൻ കാറ്റ്", mr: "ईशान्य वारा", bn: "উত্তর-পূর্বের হাওয়া", pa: "ਉੱਤਰ-ਪੂਰਬੀ ਹਵਾ", gu: "ઉત્તર-પૂર્વી પવન", hi_en: "Uttar-Poorvi hawa" },
    NW: { en: "North-West", hi: "उत्तर-पश्चिमी हवा", kn: "ವಾಯುವ್ಯ ಗಾಳಿ", ta: "வடமேற்கு காற்று", te: "ವಾಯುವ್ಯ గాలి", ml: "വടക്ക്-പടിഞ്ഞാറൻ കാറ്റ്", mr: "वायव्य वारा", bn: "উত্তর-पश्चिमের হাওয়া", pa: "ਉੱਤਰ-ਪੱਛਮੀ ਹਵਾ", gu: "ઉત્તર-પશ્ચિમી પવન", hi_en: "Uttar-Pashchimi hawa" },
    SE: { en: "South-East", hi: "दक्षिण-पूर्वी हवा", kn: "ಆಗ್ನೇય ಗಾಳಿ", ta: "தென்கிழக்கு காற்று", te: "ఆగ్నేయ గాలి", ml: "തെക്ക്-കിഴക്കൻ കാറ്റ്", mr: "आग्नेय वारा", bn: "দক্ষিণ-পূর্বের হাওয়া", pa: "ਦੱਖਣ-ਪੂਰਬੀ ਹਵਾ", gu: "દક્ષિણ-પૂર્વી પવન", hi_en: "Dakshin-Poorvi hawa" },
    SW: { en: "South-West", hi: "दक्षिण-पश्चिमी हवा", kn: "ਨੈਰੁਰত্য ಗಾಳಿ", ta: "தென்மேற்கு காற்று", te: "నైరుతి గాలి", ml: "തെക്ക്-പടിഞ്ഞാറൻ കാറ്റ്", mr: "नैऋत्य वारा", bn: "দক্ষিণ-পশ্চিমের হাওয়া", pa: "ਦੱਖਣ-ਪੱਛਮੀ ਹਵਾ", gu: "દક્ષિણ-પશ્ચિમી પવન", hi_en: "Dakshin-Pashchimi hawa" },
  }

  // Look for exact match or general prefix match (e.g. NNE -> North-East / NE)
  if (translations[d]) return translations[d][lang]
  for (const key of ["NE", "NW", "SE", "SW", "N", "S", "E", "W"]) {
    if (d.includes(key)) return translations[key][lang]
  }
  return dir
}

export interface FarmingAdviceItem {
  type: "warning" | "optimal"
  message: string
}

/**
 * Dynamically computes custom localized agricultural advisory items based on current weather conditions and forecast trends.
 */
export function generateFarmingAdvice(
  tempC: number,
  humidity: number,
  windKph: number,
  chanceOfRain: number,
  lang: Lang
): FarmingAdviceItem[] {
  const t = WEATHER_T[lang] || WEATHER_T.hi
  const list: FarmingAdviceItem[] = []

  // Wind warning
  if (windKph > 18) {
    list.push({
      type: "warning",
      message: t.adv_wind.replace("{speed}", windKph.toFixed(0)),
    })
  }

  // Rain warning
  if (chanceOfRain > 40) {
    list.push({
      type: "warning",
      message: t.adv_rain.replace("{chance}", chanceOfRain.toFixed(0)),
    })
  }

  // Heat stress
  if (tempC > 35) {
    list.push({
      type: "warning",
      message: t.adv_heat.replace("{temp}", tempC.toFixed(0)),
    })
  }

  // Fungal alert
  if (humidity > 75) {
    list.push({
      type: "warning",
      message: t.adv_humidity.replace("{humidity}", humidity.toFixed(0)),
    })
  }

  // If no warnings, supply a happy advice
  if (list.length === 0) {
    list.push({
      type: "optimal",
      message: t.adv_optimal,
    })
  }

  return list
}
