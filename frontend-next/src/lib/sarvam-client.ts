/**
 * Multilingual Dynamic Translation Client.
 * Powered 100% by AI4Bharat IndicTrans2 (/api/translate).
 */
import { translateText, translateBatch } from "./translation-client";

export interface TranslateOptions {
  text: string;
  targetLang: string;
  sourceLang?: string;
  mode?: "formal" | "colloquial";
}

export interface TranslateResponse {
  translated_text: string;
  target_lang: string;
  source_lang: string;
}

export async function translateWithSarvam(opts: TranslateOptions): Promise<string> {
  const { text, targetLang, sourceLang = "en" } = opts;
  if (!text || !text.trim()) return "";
  if (targetLang === sourceLang) return text;

  try {
    const res = await translateText({
      text,
      targetLang,
      sourceLang,
    });
    return res || text;
  } catch (err) {
    console.warn("Translation failed, returning original:", err);
    return text;
  }
}

export async function translateBatchWithSarvam(
  texts: string[],
  targetLang: string,
  sourceLang: string = "en"
): Promise<string[]> {
  if (!texts || texts.length === 0) return [];
  if (targetLang === sourceLang) return texts;

  try {
    const res = await translateBatch(texts, targetLang, sourceLang);
    return res || texts;
  } catch (err) {
    console.warn("Batch translation failed, returning original texts:", err);
    return texts;
  }
}
