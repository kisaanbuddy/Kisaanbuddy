import { NextRequest, NextResponse } from "next/server";
import { interpretLocally } from "@/lib/voice/LocalVoiceInterpreter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transcript = String(body.transcript || "").trim();
    const pageContext = body.page_context || {};
    const language = String(body.language || "hi");

    if (!transcript) {
      return NextResponse.json({
        action: { action_type: "NOOP", payload: {}, safety_level: "SAFE", requires_confirmation: false },
        reply_text: "कृपया बोलें, मैं आपकी सहायता के लिए तैयार हूँ।",
        language,
        session_id: "local-session",
        pending_action: null,
      });
    }

    // 1. Run deterministic local interpreter
    const localResult = interpretLocally(transcript, pageContext, language);

    if (localResult) {
      return NextResponse.json({
        action: localResult.action,
        reply_text: localResult.reply_text,
        language,
        session_id: "local-session",
        pending_action:
          localResult.action.requires_confirmation
            ? {
                type: localResult.action.payload?.action_to_confirm || localResult.action.action_type,
                payload: localResult.action.payload,
                total_amount: localResult.action.payload?.total_amount || 0,
              }
            : null,
      });
    }

    // 2. Safe Fallback for unrecognized commands
    const isKannada = language === "kn";
    const isEnglish = language === "en";

    const fallbackReply = isKannada
      ? "ಕ್ಷಮಿಸಿ, ಈ ಆಜ್ಞೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ನೀವು 'ಮಾರುಕಟ್ಟೆ ತೆರೆಯಿರಿ', 'ಮಂಡಿ ದರ', ಅಥವಾ 'ಹವಾಮಾನ' ಎಂದು ಹೇಳಬಹುದು."
      : isEnglish
      ? "I heard your command. You can speak to navigate: 'Open marketplace', 'Show mandi prices', or 'Check weather'."
      : "आप वेबसाइट पर किसी भी सुविधा के लिए बोल सकते हैं, जैसे: 'मार्केटप्लेस खोलो', 'मंडी भाव', 'मौसम', 'डार्क मोड' या 'वापस जाओ'।";

    return NextResponse.json({
      action: { action_type: "NOOP", payload: {}, safety_level: "SAFE", requires_confirmation: false },
      reply_text: fallbackReply,
      language,
      session_id: "local-session",
      pending_action: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        action: { action_type: "NOOP", payload: {}, safety_level: "SAFE", requires_confirmation: false },
        reply_text: "कृपया बोलें, मैं सहायता के लिए तैयार हूँ।",
        language: "hi",
        session_id: "fallback-session",
        pending_action: null,
      },
      { status: 200 }
    );
  }
}
