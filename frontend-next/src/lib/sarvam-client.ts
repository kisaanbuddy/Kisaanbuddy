/**
 * Sarvam AI Client for Dynamic Translations and Services.
 *
 * Provides typed, fault-tolerant translation utilities connected to
 * the /api/sarvam/translate backend proxy.
 */

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
  const { text, targetLang, sourceLang = "en", mode = "formal" } = opts;
  if (!text || !text.trim()) return "";
  if (targetLang === sourceLang) return text;

  try {
    const res = await fetch("/api/sarvam/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        target_lang: targetLang,
        source_lang: sourceLang,
        mode,
      }),
    });
    if (!res.ok) {
      console.warn("Sarvam translation returned error status:", res.status);
      return text;
    }
    const data: TranslateResponse = await res.json();
    return data.translated_text || text;
  } catch (err) {
    console.warn("Sarvam translation fetch failed, falling back to original:", err);
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
    const res = await fetch("/api/sarvam/translate-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texts,
        target_lang: targetLang,
        source_lang: sourceLang,
      }),
    });
    if (!res.ok) {
      console.warn("Sarvam batch translation returned error status:", res.status);
      return texts;
    }
    const data = await res.json();
    return data.translations || texts;
  } catch (err) {
    console.warn("Sarvam batch translation fetch failed, falling back to original:", err);
    return texts;
  }
}
