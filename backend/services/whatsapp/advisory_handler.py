"""Agricultural question-answering handler reusing existing KisaanBuddy AI and agronomic knowledge."""
from __future__ import annotations

import logging
from typing import Optional

from core.config import settings
from schemas.chatbot import AssistantRequest
from services.chat.chat_service import ChatOrchestrator
from services.disease_knowledge_engine import AGRICULTURAL_KNOWLEDGE_BASE, query_knowledge_base

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
    if not question or not question.strip():
        if language == "hi":
            return "कृपया अपना कृषि संबंधी प्रश्न विस्तार से पूछें।"
        elif language == "kn":
            return "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ವಿವರವಾಗಿ ಕೇಳಿ."
        return "Please ask your agricultural question with details like crop name or symptoms."

    # Try LLM orchestration first if keys are configured
    has_llm = bool(
        settings.GEMINI_API_KEY
        or settings.OPENAI_API_KEY
        or settings.SARVAM_API_KEY
    )

    if has_llm:
        try:
            req = AssistantRequest(
                message=question,
                session_id=session_id or f"wa_{phone_number}",
                language=language,
            )
            reply = await _orchestrator.chat_once(req)
            if reply and reply.reply:
                disclaimer = (
                    "\n\n_📌 Note: Agricultural advice is advisory. Consult your local KVK or extension officer for field verification._"
                    if language == "en" else
                    "\n\n_📌 सूचना: यह कृषि सलाह मार्गदर्शन के लिए है। स्थानीय KVK विशेषज्ञ से पुष्टि अवश्य करें।_"
                    if language == "hi" else
                    "\n\n_📌 ಸೂಚನೆ: ಈ ಕೃಷಿ ಸಲಹೆಯು ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮಾತ್ರ. ದಯವಿಟ್ಟು ಸ್ಥಳೀಯ KVK ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ._"
                )
                return f"{reply.reply}{disclaimer}\n\nType 'menu' to return."
        except Exception as exc:
            log.warning("LLM chat orchestration error: %s; falling back to knowledge engine.", exc)

    # Fallback to authentic ICAR knowledge base matching
    words = question.lower().split()
    matched_guides = []
    for guide in AGRICULTURAL_KNOWLEDGE_BASE:
        crop_match = guide["crop"].lower() in question.lower()
        pest_match = any(w in guide["disease_or_pest"].lower() for w in words if len(w) > 3)
        symptom_match = any(w in guide["symptoms"].lower() for w in words if len(w) > 3)
        if crop_match or pest_match or symptom_match:
            matched_guides.append(guide)

    if matched_guides:
        best = matched_guides[0]
        crop = best["crop"]
        condition = best["disease_or_pest"]
        symptoms = best.get("symptoms", "")
        remedy = best.get("cultural_preventive", "") or best.get("biological_organic", "")
        cibrc = best.get("cibrc_registered_compounds", "")

        if language == "hi":
            res = [
                f"🌱 *कृषि मार्गदर्शन: {crop} — {condition}*",
                "",
                f"• *पहचान/लक्षण:* {symptoms[:180]}",
                f"• *उपचार सिफारिश:* {remedy[:200]}",
            ]
            if cibrc:
                res.append(f"• *स्वीकृत कीटनाशक/उपाय:* {cibrc[:120]}")
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
                f"• *ಲಕ್ಷಣಗಳು:* {symptoms[:180]}",
                f"• *ನಿರ್ವಹಣೆ ಸಲಹೆ:* {remedy[:200]}",
            ]
            if cibrc:
                res.append(f"• *ಅನುಮೋದಿತ ಪರಿಹಾರ:* {cibrc[:120]}")
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
                f"• *Symptoms/Signs:* {symptoms[:180]}",
                f"• *Recommended Action:* {remedy[:200]}",
            ]
            if cibrc:
                res.append(f"• *CIBRC Approved Option:* {cibrc[:120]}")
            res.extend([
                "",
                "_📌 Disclaimer: Advisory based on verified ICAR agronomic profiles. Always observe pre-harvest intervals and safety instructions._",
                "",
                "Type 'menu' to return to the main menu."
            ])
            return "\n".join(res)

    # General supportive answer when no specific pest matched
    if language == "hi":
        return (
            "🌱 *किसानबडी कृषि सलाह*\n\n"
            "आपके प्रश्न के संदर्भ में: कृपया अपनी फसल का नाम (जैसे धान, गेहूं, टमाटर, कपास) और विकास का चरण बताएं ताकि सटीक सिफारिश दी जा सके।\n\n"
            "यदि पत्ती पर कोई रोग या कीट का प्रकोप है, तो क्रॉप डॉक्टर ('1') चुनकर फोटो भेजें।\n\n"
            "वापस जाने के लिए 'menu' लिखें।"
        )
    elif language == "kn":
        return (
            "🌱 *ಕಿಸಾನ್‌ಬಡ್ಡಿ ಕೃಷಿ ಸಲಹೆ*\n\n"
            "ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ನಿಖರವಾದ ಸಲಹೆ ಪಡೆಯಲು ಬೆಳೆಯ ಹೆಸರು (ಉದಾ. ಭತ್ತ, ರಾಗಿ, ಟೊಮೆಟೊ) ಮತ್ತು ಬೆಳವಣಿಗೆಯ ಹಂತವನ್ನು ತಿಳಿಸಿ.\n\n"
            "ಎಲೆ ಅಥವಾ ಕಾಂಡದ ಮೇಲೆ ರೋಗದ ಲಕ್ಷಣಗಳಿದ್ದರೆ, ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ ('1') ಆಯ್ಕೆಮಾಡಿ ಫೋಟೋ ಕಳುಹಿಸಿ.\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        )
    return (
        "🌱 *KisaanBuddy Agricultural Guidance*\n\n"
        "To provide the most accurate advice, please specify your crop name (e.g. paddy, wheat, tomato, cotton) and its current growth stage.\n\n"
        "If you observe symptoms or pest spots on the foliage, select Crop Doctor ('1') to upload a photo for AI visual diagnosis.\n\n"
        "Type 'menu' to return to the main menu."
    )
