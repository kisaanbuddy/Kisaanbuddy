"""Agricultural question-answering handler reusing grounded KisaanBuddy agronomic knowledge.

Adheres strictly to the Reality First principle:
- Never invents pesticide recommendations, dosages, market prices or chemical schedules.
- Grounded in verified ICAR (Indian Council of Agricultural Research) & CIBRC packages of practices.
- Distinguishes verified knowledge from general guidance.
- Clarifies missing crop names, stages, or symptom details.
- Trilingual support: English, Hindi, Kannada.
"""
from __future__ import annotations

import logging
from typing import Optional

from core.config import settings
from schemas.chatbot import AssistantRequest
from services.chat.chat_service import ChatOrchestrator
from services.chat.gemini_service import is_gemini_configured
from services.disease_knowledge_engine import AGRICULTURAL_KNOWLEDGE_BASE

log = logging.getLogger(__name__)

# Shared ChatOrchestrator instance
_orchestrator = ChatOrchestrator()


async def answer_agricultural_question(
    question: str,
    phone_number: str,
    language: str = "en",
    session_id: Optional[str] = None,
) -> str:
    """Answers farmer questions using grounded KisaanBuddy advisory engine or verified ICAR knowledge."""
    clean_q = (question or "").strip()
    if not clean_q:
        if language == "hi":
            return "कृपया अपनी फसल और प्रश्न के बारे में विस्तार से बताएं।"
        elif language == "kn":
            return "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಪ್ರಶ್ನೆಯನ್ನು ವಿವರವಾಗಿ ಕೇಳಿ."
        return "Please ask your farming question with details like crop name or symptoms."

    # 1. Check if the question is too vague / missing basic details
    words = clean_q.lower().split()
    if len(words) < 2 and not any(k in clean_q.lower() for k in ("धान", "गेहूं", "टमाटर", "paddy", "wheat", "tomato", "cotton", "भತ್ತ", "ರಾಗಿ")):
        if language == "hi":
            return (
                "🌱 *किसानबडी कृषि सलाह*\n\n"
                "सटीक सलाह के लिए कृपया बताएं:\n"
                "1. आपकी कौन सी फसल है? (जैसे धान, गेहूं, टमाटर, कपास)\n"
                "2. फसल की अवस्था क्या है? (बुवाई, वानस्पतिक, फूल या फल)\n"
                "3. समस्या या लक्षण क्या हैं?\n\n"
                "यदि पत्तियों पर धब्बे या कीड़े दिख रहे हैं, तो क्रॉप डॉक्टर ('1') चुनकर फोटो भेजें।\n\n"
                "मुख्य मेनू के लिए 'menu' लिखें।"
            )
        elif language == "kn":
            return (
                "🌱 *ಕಿಸಾನ್‌ಬಡ್ಡಿ ಕೃಷಿ ಸಲಹೆ*\n\n"
                "ನಿಖರವಾದ ಪರಿಹಾರಕ್ಕಾಗಿ ದಯವಿಟ್ಟು ತಿಳಿಸಿ:\n"
                "1. ನಿಮ್ಮ ಬೆಳೆ ಯಾವುದು? (ಉದಾ. ಭತ್ತ, ರಾಗಿ, ಟೊಮೆಟೊ, ಹತ್ತಿ)\n"
                "2. ಬೆಳೆಯ ಹಂತ ಯಾವುದು? (ಬಿತ್ತನೆ, ಹೂವು ಬಿಡುವ ಹಂತ, ಇತ್ಯಾದಿ)\n"
                "3. ಕಂಡುಬಂದ ಲಕ್ಷಣಗಳು ಅಥವಾ ಸಮಸ್ಯೆ ಏನು?\n\n"
                "ಎಲೆಗಳ ಮೇಲೆ ಕಲೆಗಳು ಅಥವಾ ರೋಗದ ಲಕ್ಷಣವಿದ್ದರೆ, ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ ('1') ಆರಿಸಿ ಫೋಟೋ ಕಳುಹಿಸಿ.\n\n"
                "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
            )
        return (
            "🌱 *KisaanBuddy Agricultural Advice*\n\n"
            "To give you practical, field-tested guidance, please tell us:\n"
            "1. Which crop are you growing? (e.g. Paddy, Wheat, Tomato, Cotton)\n"
            "2. What is its current growth stage? (sowing, flowering, fruit setting)\n"
            "3. What specific symptoms or pests do you observe?\n\n"
            "If you see leaf spots or pest damage, choose Crop Doctor ('1') to upload a photo.\n\n"
            "Type 'menu' to return to the main menu."
        )

    # 2. Try Gemini LLM orchestration with grounded prompt if configured
    has_llm = is_gemini_configured()

    if has_llm:
        try:
            req = AssistantRequest(
                message=clean_q,
                session_id=session_id or f"wa_{phone_number}",
                language=language,
            )
            reply = await _orchestrator.chat_once(req)
            if reply and reply.content:
                disclaimer = (
                    "\n\n_📌 Note: Agricultural advice is advisory. Consult your local KVK or extension officer for field verification._"
                    if language == "en" else
                    "\n\n_📌 सूचना: यह सलाह मार्गदर्शन के लिए है। स्थानीय कृषि विज्ञान केंद्र (KVK) विशेषज्ञ से पुष्टि अवश्य करें।_"
                    if language == "hi" else
                    "\n\n_📌 ಸೂಚನೆ: ಈ ಕೃಷಿ ಸಲಹೆಯು ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮಾತ್ರ. ದಯವಿಟ್ಟು ಸ್ಥಳೀಯ KVK ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ._"
                )
                return f"{reply.content}{disclaimer}\n\nType 'menu' to return."
        except Exception as exc:
            log.warning("Gemini chat orchestration error: %s; falling back to knowledge engine.", exc)

    # 3. Authentic ICAR knowledge base matching
    matched_guides = []
    q_lower = clean_q.lower()
    for guide in AGRICULTURAL_KNOWLEDGE_BASE:
        crop_name = guide.get("crop", "").lower()
        pest_name = guide.get("disease_or_pest", "").lower()
        symptoms = guide.get("symptoms", "").lower()

        crop_match = crop_name in q_lower or (crop_name == "paddy" and ("rice" in q_lower or "धान" in q_lower or "ಭತ್ತ" in q_lower))
        pest_match = any(w in pest_name for w in words if len(w) > 3)
        symptom_match = any(w in symptoms for w in words if len(w) > 3)

        if crop_match and (pest_match or symptom_match):
            matched_guides.insert(0, guide)  # high priority match
        elif crop_match or pest_match:
            matched_guides.append(guide)

    if matched_guides:
        best = matched_guides[0]
        crop = best.get("crop", "Crop")
        condition = best.get("disease_or_pest", "Condition")
        symptoms = best.get("symptoms", "")
        remedy = best.get("cultural_preventive", "") or best.get("biological_organic", "")
        cibrc = best.get("cibrc_registered_compounds", "")

        if language == "hi":
            res = [
                f"🌱 *कृषि मार्गदर्शन: {crop} — {condition}*",
                "",
                f"• *पहचान व लक्षण:* {symptoms[:200]}",
                f"• *सुझाया गया उपाय:* {remedy[:220]}",
            ]
            if cibrc:
                res.append(f"• *स्वीकृत कीटनाशक/रसायन:* {cibrc[:140]}")
            res.extend([
                "",
                "_📌 सूचना: यह सलाह ICAR-CIBRC सत्यापित डेटा पर आधारित है। रासायनिक छिड़काव से पहले कृषि विस्तार अधिकारी से सलाह लें।_",
                "",
                "मुख्य मेनू के लिए 'menu' लिखें।"
            ])
            return "\n".join(res)
        elif language == "kn":
            res = [
                f"🌱 *ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ: {crop} — {condition}*",
                "",
                f"• *ಲಕ್ಷಣಗಳು:* {symptoms[:200]}",
                f"• *ನಿರ್ವಹಣೆ ಕ್ರಮ:* {remedy[:220]}",
            ]
            if cibrc:
                res.append(f"• *ಅನುಮೋದಿತ ಕೀಟನಾಶಕ:* {cibrc[:140]}")
            res.extend([
                "",
                "_📌 ಸೂಚನೆ: ಕೃಷಿ ರಾಸಾಯನಿಕಗಳನ್ನು ಬಳಸುವ ಮುನ್ನ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಗಳ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ._",
                "",
                "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
            ])
            return "\n".join(res)
        else:
            res = [
                f"🌱 *Agricultural Guidance: {crop} — {condition}*",
                "",
                f"• *Symptoms/Signs:* {symptoms[:200]}",
                f"• *Recommended Management:* {remedy[:220]}",
            ]
            if cibrc:
                res.append(f"• *CIBRC Approved Option:* {cibrc[:140]}")
            res.extend([
                "",
                "_📌 Disclaimer: Advisory based on verified ICAR agronomic profiles. Always observe pre-harvest intervals and safety instructions._",
                "",
                "Type 'menu' to return to the main menu."
            ])
            return "\n".join(res)

    # 4. Honest unverified guidance: guide to Crop Doctor or Support
    if language == "hi":
        return (
            "🌱 *किसानबडी कृषि सलाह*\n\n"
            f"आपके प्रश्न '{clean_q[:60]}' के लिए हमारे डेटाबेस में कोई सत्यापित विशिष्ट उपाय नहीं मिला।\n\n"
            "सटीक समाधान के लिए:\n"
            "• यदि पौधे पर रोग या कीट है, तो '1' चुनकर स्पष्ट फोटो भेजें (क्रॉप डॉक्टर AI)।\n"
            "• कृषि वैज्ञानिक से बात करने के लिए '6' लिखकर सहायता अनुरोध दर्ज करें।\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        )
    elif language == "kn":
        return (
            "🌱 *ಕಿಸಾನ್‌ಬಡ್ಡಿ ಕೃಷಿ ಸಲಹೆ*\n\n"
            f"ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ('{clean_q[:60]}') ನೇರ ದೃಢೀಕೃತ ಶಿಫಾರಸು ಲಭ್ಯವಾಗಿಲ್ಲ.\n\n"
            "ನಿಖರವಾದ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ:\n"
            "• ಎಲೆ ಅಥವಾ ಬೆಳೆಯ ಫೋಟೋ ಕಳುಹಿಸಲು '1' ಆರಿಸಿ (ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ AI).\n"
            "• ಕೃಷಿ ತಜ್ಞರ ನೆರವಿಗಾಗಿ '6' ಎಂದು ಕಳುಹಿಸಿ.\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        )
    return (
        "🌱 *KisaanBuddy Agricultural Guidance*\n\n"
        f"We could not match a verified agronomic package for '{clean_q[:60]}' with the provided details.\n\n"
        "To get accurate guidance:\n"
        "• Select '1' to upload a clear crop photo to Crop Doctor AI.\n"
        "• Select '6' to register a question with our agricultural support specialists.\n\n"
        "Type 'menu' to return to the main menu."
    )
