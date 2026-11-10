/**
 * Unified Multilingual Translation Client for KisaanBuddy.
 *
 * Connects directly to the self-hosted AI4Bharat IndicTrans2 engine via /api/translate,
 * backed by multi-tier caching and local engine failover.
 *
 * Implements client-side in-memory caching to eliminate redundant network roundtrips.
 */

export interface TranslateRequestOptions {
  text: string;
  targetLang: string;
  sourceLang?: string;
  useCache?: boolean;
}

export interface TranslateApiResponse {
  translated_text: string;
  source_language: string;
  target_language: string;
  provider: string;
  cached?: boolean;
}

export interface BatchTranslateApiResponse {
  translations: string[];
  source_language: string;
  target_language: string;
  provider: string;
}

// Client-side session LRU cache: (src:tgt:text) -> translated_text
const CLIENT_TRANSLATION_CACHE = new Map<string, string>();
const MAX_CLIENT_CACHE = 2000;

function getClientCacheKey(text: string, src: string, tgt: string): string {
  return `${src}:${tgt}:${text.trim()}`;
}

/**
 * Translates a single text string using IndicTrans2 / fallback.
 */
export async function translateText(opts: TranslateRequestOptions): Promise<string> {
  const { text, targetLang, sourceLang = "en", useCache = true } = opts;
  const clean = (text || "").trim();
  if (!clean) return "";
  if (targetLang === sourceLang) return clean;

  const cacheKey = getClientCacheKey(clean, sourceLang, targetLang);
  if (useCache && CLIENT_TRANSLATION_CACHE.has(cacheKey)) {
    return CLIENT_TRANSLATION_CACHE.get(cacheKey)!;
  }

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: clean,
        source_language: sourceLang,
        target_language: targetLang,
        use_cache: useCache,
      }),
    });

    if (!res.ok) {
      console.warn(`Translation endpoint returned status ${res.status}`);
      return clean;
    }

    const data: TranslateApiResponse = await res.json();
    const result = data.translated_text || clean;

    if (useCache) {
      if (CLIENT_TRANSLATION_CACHE.size >= MAX_CLIENT_CACHE) {
        const firstKey = CLIENT_TRANSLATION_CACHE.keys().next().value;
        if (firstKey) CLIENT_TRANSLATION_CACHE.delete(firstKey);
      }
      CLIENT_TRANSLATION_CACHE.set(cacheKey, result);
    }

    return result;
  } catch (err) {
    console.warn("Translation request error:", err);
    return clean;
  }
}

/**
 * Translates an array of text strings in a single batch request.
 */
export async function translateBatch(
  texts: string[],
  targetLang: string,
  sourceLang: string = "en",
  useCache: boolean = true
): Promise<string[]> {
  if (!texts || texts.length === 0) return [];
  if (targetLang === sourceLang) return texts;

  const results: (string | null)[] = new Array(texts.length).fill(null);
  const missingIndices: number[] = [];
  const missingTexts: string[] = [];

  // Check client cache first
  texts.forEach((txt, idx) => {
    const clean = (txt || "").trim();
    if (!clean) {
      results[idx] = txt;
      return;
    }
    const key = getClientCacheKey(clean, sourceLang, targetLang);
    if (useCache && CLIENT_TRANSLATION_CACHE.has(key)) {
      results[idx] = CLIENT_TRANSLATION_CACHE.get(key)!;
    } else {
      missingIndices.push(idx);
      missingTexts.push(clean);
    }
  });

  if (missingTexts.length === 0) {
    return results as string[];
  }

  try {
    const res = await fetch("/api/translate/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: missingTexts,
        source_language: sourceLang,
        target_language: targetLang,
        use_cache: useCache,
      }),
    });

    if (!res.ok) {
      console.warn(`Batch translation returned status ${res.status}`);
      missingIndices.forEach((origIdx, i) => {
        results[origIdx] = missingTexts[i];
      });
      return results as string[];
    }

    const data: BatchTranslateApiResponse = await res.json();
    const translatedList = data.translations || missingTexts;

    missingIndices.forEach((origIdx, i) => {
      const translated = translatedList[i] || missingTexts[i];
      results[origIdx] = translated;

      if (useCache) {
        const key = getClientCacheKey(missingTexts[i], sourceLang, targetLang);
        CLIENT_TRANSLATION_CACHE.set(key, translated);
      }
    });

    return results as string[];
  } catch (err) {
    console.warn("Batch translation error:", err);
    missingIndices.forEach((origIdx, i) => {
      results[origIdx] = missingTexts[i];
    });
    return results as string[];
  }
}
