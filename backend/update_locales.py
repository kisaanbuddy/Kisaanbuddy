import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('../frontend-next/src/lib/locales/en.json', encoding='utf-8') as f:
    en = json.load(f)
with open('../frontend-next/src/lib/locales/hi.json', encoding='utf-8') as f:
    hi = json.load(f)
with open('../frontend-next/src/lib/locales/kn.json', encoding='utf-8') as f:
    kn = json.load(f)

# Update Hindi missing keys
if 'dashboard_mockup' not in hi:
    hi['dashboard_mockup'] = {}
hi['dashboard_mockup']['ph_neutral: 6.5 (Neutral)'] = 'पीएच स्तर: 6.5 (तटस्थ)'

# Kannada translations for missing keys
kn_translations = {
    'dashboard_mockup.ph_neutral: 6.5 (Neutral)': 'ಪಿಎಚ್ ಮಟ್ಟ: 6.5 (ತಟಸ್ಥ)',
    'impact': 'ಪ್ರಭಾವ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'landing_hero.free_forever': '100% ಶಾಶ್ವತವಾಗಿ ಉಚಿತ',
    'landing_hero.indian_languages': '10 ಭಾರತೀಯ ಭಾಷೆಗಳು',
    'ui.auth.change_phone': 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿ',
    'ui.auth.email_instructions': 'ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ. ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವ ಇಮೇಲ್ ಲಭ್ಯವಿದ್ದರೆ, ನಾವು ಸೂಚನೆಗಳನ್ನು ಕಳುಹಿಸುತ್ತೇವೆ.',
    'ui.auth.invalid_phone': 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಭಾರತೀಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
    'ui.auth.network_error': 'ನೆಟ್‌ವರ್ಕ್ ದೋಷ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    'ui.auth.otp_digit': 'ದೃಢೀಕರಣ ಕೋಡ್ ಅಂಕೆ',
    'ui.auth.otp_group': 'ಆರು-ಅಂಕಿಯ ದೃಢೀಕರಣ ಕೋಡ್',
    'ui.auth.otp_incorrect': 'ದೃಢೀಕರಣ ಕೋಡ್ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    'ui.auth.otp_resend_failed': 'ನಾವು ದೃಢೀಕರಣ ಕೋಡ್ ಅನ್ನು ಮರುಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
    'ui.auth.otp_resent': 'ಹೊಸ ದೃಢೀಕರಣ ಕೋಡ್ ಅನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ.',
    'ui.auth.otp_send_failed': 'ದೃಢೀಕರಣ ಕೋಡ್ ಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    'ui.auth.otp_sent': 'ದೃಢೀಕರಣ ಕೋಡ್ ಅನ್ನು SMS ಮೂಲಕ ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ.',
    'ui.auth.password_length': 'ನಿಮ್ಮ ಹೊಸ ಪಾಸ್‌ವರ್ಡ್‌ಗಾಗಿ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳನ್ನು ಬಳಸಿ.',
    'ui.auth.resend_in': '{seconds} ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಮರುಕಳುಹಿಸಿ',
    'ui.auth.resend_otp': 'ದೃಢೀಕರಣ ಕೋಡ್ ಮರುಕಳುಹಿಸಿ',
    'ui.auth.reset_delivery_unavailable': 'ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವ ಇಮೇಲ್ ಕಾನ್ಫಿಗರ್ ಮಾಡಲಾಗಿಲ್ಲ. ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಪ್ರವೇಶಿಸಲು ಸಹಾಯಕ್ಕಾಗಿ ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    'ui.auth.reset_failed': 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಮರುಹೊಂದಿಸಲು ನಮಗೆ ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    'ui.auth.reset_request_failed': 'ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಅನ್ನು ವಿನಂತಿಸಲು ನಮಗೆ ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    'ui.footer.khet_diary': 'ಹೊಲ ಡೈರಿ (ಕೃಷಿ ಖಾತೆ ವಹಿ)',
    'ui.home.badge': 'ಭಾರತೀಯ ಕೃಷಿಗಾಗಿ ಪ್ರಾಯೋಗಿಕ ಉಪಕರಣಗಳು',
    'ui.home.capabilities.crop': 'ಮುಂದಿನ ಬೆಳೆಯ ಯೋಜನೆಯನ್ನು ರೂಪಿಸಿ',
    'ui.home.capabilities.disease': 'ಬೆಳೆ ರೋಗವನ್ನು ಗುರುತಿಸಿ',
    'ui.home.capabilities.weather': 'ನಿಮ್ಮ ಜಮೀನಿನ ಹವಾಮಾನ',
    'ui.home.card_title': 'ಅನಗತ್ಯ ಗೊಂದಲವಿಲ್ಲದೆ ಅತ್ಯಗತ್ಯ ಸೌಲಭ್ಯಗಳು.',
    'ui.home.field_label': 'ಜಮೀನಿನ ಕೆಲಸಕ್ಕಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ',
    'ui.home.helper': 'ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಸ್ವಂತ ವಿವರಗಳು ಮತ್ತು ಸ್ಥಳವನ್ನು ಬಳಸಿ.',
    'ui.home.weather_cta': 'ಜಮೀನಿನ ಹವಾಮಾನವನ್ನು ಪರಿಶೀಲಿಸಿ',
    'ui.navigation.close_menu': 'ಮೆನು ಮುಚ್ಚಿ',
    'ui.navigation.open_menu': 'ಮೆನು ತೆರೆಯಿರಿ',
    'ui.search.label': 'ಹುಡುಕಿ',
    'ui.search.title': 'KisaanBuddy ಹುಡುಕಿ (Ctrl+K)',
}

def set_nested(d, path, val):
    parts = path.split('.')
    cur = d
    for p in parts[:-1]:
        if p not in cur or not isinstance(cur[p], dict):
            cur[p] = {}
        cur = cur[p]
    cur[parts[-1]] = val

for path, val in kn_translations.items():
    set_nested(kn, path, val)

# Fix identical English strings in Kannada
kn_fixes = {
    'quickAccess': 'ತ್ವರಿತ ಪ್ರವೇಶ',
    'reset': 'ಮರುಹೊಂದಿಸಿ',
    'matchingSchemes': 'ಹೊಂದಾಣಿಕೆಯಾಗುವ ಯೋಜನೆಗಳು',
    'organicCarbon': 'ಸಾವಯವ ಇಂಗಾಲ',
    'notes': 'ಟಿಪ್ಪಣಿಗಳು',
    'workerTitle': 'ಕಾರ್ಮಿಕ ಸಂಪರ್ಕ',
    'chatbot.could_not_connect_to': 'ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ಸರ್ವರ್ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.',
    'chatbot.voice_not_supported_in': 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು Google Chrome ಬಳಸಿ.',
    'chatbot.listening': 'ಆಲಿಸಲಾಗುತ್ತಿದೆ...',
    'chatbot.recording_voice_processing_will': 'ಧ್ವನಿಯನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ... ನೀವು ಮಾತನಾಡುವುದನ್ನು ನಿಲ್ಲಿಸಿದ ನಂತರ ಪ್ರಕ್ರಿಯೆ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ',
    'ask_farm_ai.analyzing': 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    'location_autofill.type_a_city_name': 'ನಗರದ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ (ಉದಾ. ಪುಣೆ, ಬೆಂಗಳೂರು, ಲಖನೌ)...',
    'location_autofill.auto_fill_from_your': 'ನಿಮ್ಮ ಸ್ಥಳದಿಂದ ಸ್ವಯಂ ಭರ್ತಿ ಮಾಡಿ',
    'common.send_message': 'ಸಂದೇಶ ಕಳುಹಿಸಿ',
    'common.stop_generating': 'ರಚಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ',
    'common.remove_photo': 'ಫೋಟೋ ತೆಗೆದುಹಾಕಿ',
    'common.uploaded_leaf': 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಎಲೆ',
    'common.reset_conversation': 'ಸಂಭಾಷಣೆಯನ್ನು ಮರುಹೊಂದಿಸಿ',
}

for path, val in kn_fixes.items():
    set_nested(kn, path, val)

# Also add common footer keys
for lang_dict, feat, mkt, rep in [
    (en, 'Platform Features', 'Marketplace (Buyers & Sellers)', 'Farm Reports & Analytics'),
    (hi, 'प्लेटफ़ॉर्म सुविधाएं', 'बाज़ार (खरीदार और विक्रेता)', 'फार्म रिपोर्ट और विश्लेषण'),
    (kn, 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ವೈಶಿಷ್ಟ್ಯಗಳು', 'ಮಾರುಕಟ್ಟೆ (ಖರೀದಿದಾರರು ಮತ್ತು ಮಾರಾಟಗಾರರು)', 'ಕೃಷಿ ವರದಿಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ')
]:
    if 'footer' not in lang_dict:
        lang_dict['footer'] = {}
    lang_dict['footer']['features'] = feat
    lang_dict['footer']['marketplace'] = mkt
    lang_dict['footer']['reports'] = rep

with open('../frontend-next/src/lib/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)
with open('../frontend-next/src/lib/locales/hi.json', 'w', encoding='utf-8') as f:
    json.dump(hi, f, ensure_ascii=False, indent=2)
with open('../frontend-next/src/lib/locales/kn.json', 'w', encoding='utf-8') as f:
    json.dump(kn, f, ensure_ascii=False, indent=2)

print('Updated en.json, hi.json, and kn.json successfully.')
