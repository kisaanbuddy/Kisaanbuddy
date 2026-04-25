"""KrishiAI knowledge base — lightweight RAG over curated agri markdown.

Design:
  * Loads all markdown files from backend/data/knowledge/ at startup.
  * Splits each file into chunks at ## headings (one chunk = one topic).
  * Builds an in-memory BM25-like inverted index — pure Python, no deps.
  * Exposes search(query, k) -> top-k chunks ranked by relevance.

Why pure Python BM25 (not sentence-transformers / chromadb / faiss)?
  - Zero new dependencies — backend stays light.
  - Knowledge base is small (~50 chunks). Full re-rank in <5 ms.
  - Embeddings would be overkill for a curated KB; word-overlap actually
    works well when the corpus uses domain-specific vocabulary (DAP, MOP,
    PMFBY, ratoon, drip, etc.) the user is likely to type.
"""
from __future__ import annotations

import logging
import math
import re
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

log = logging.getLogger(__name__)

# Where the markdown lives. Relative to backend/.
KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "knowledge"

# Common English/Hindi/Kannada stopwords. Kept tiny — too large = misses recall
# on short queries.
_STOPWORDS = {
    # English
    "the", "a", "an", "and", "or", "but", "of", "in", "on", "at", "to", "for",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "should", "could", "may", "might",
    "i", "me", "my", "we", "us", "our", "you", "your", "he", "him", "his",
    "she", "her", "it", "its", "they", "them", "their", "this", "that",
    "these", "those", "what", "which", "who", "whom", "where", "when", "why",
    "how", "all", "any", "some", "no", "not", "if", "then", "else", "so",
    "with", "from", "by", "as", "into", "than", "about",
    # Hindi (very common — won't filter content words)
    "है", "हैं", "का", "की", "के", "में", "से", "को", "ने", "और", "या",
    "मैं", "तुम", "आप", "हम", "वह", "यह", "क्या", "कैसे", "कौन", "कब",
    "कहाँ", "क्यों",
    # Kannada
    "ಇದು", "ಆ", "ಒಂದು", "ನಾನು", "ನೀವು", "ಅವರು",
}

# Hindi/Kannada synonyms for common agri terms — query expansion improves
# recall dramatically when farmer types in their language.
_QUERY_EXPANSIONS = {
    "खाद": "fertilizer",
    "उर्वरक": "fertilizer",
    "कीट": "pest insect",
    "रोग": "disease",
    "बीमारी": "disease",
    "मौसम": "weather",
    "बारिश": "rainfall",
    "पानी": "water irrigation",
    "सिंचाई": "irrigation",
    "गेहूँ": "wheat",
    "गेंहू": "wheat",
    "धान": "paddy rice",
    "चावल": "paddy rice",
    "कपास": "cotton",
    "गन्ना": "sugarcane",
    "मक्का": "maize",
    "सरसों": "mustard",
    "चना": "chickpea gram",
    "आलू": "potato",
    "टमाटर": "tomato",
    "प्याज": "onion",
    "मिर्च": "chilli",
    "केला": "banana",
    "आम": "mango",
    "योजना": "scheme yojana",
    "सब्सिडी": "subsidy",
    "किसान": "farmer",
    "मिट्टी": "soil",
    "खेत": "field farm",
    "फसल": "crop",
    "बीज": "seed",
    "पशु": "livestock cattle",
    "गाय": "cow dairy",
    "भैंस": "buffalo dairy",
    "बकरी": "goat",
    "मछली": "fish fisheries",
    "मधुमक्खी": "bee apiculture honey",
    "मंडी": "mandi market",
    "कीमत": "price",
    "एमएसपी": "MSP",
    "बीमा": "insurance",
    "जैविक": "organic",
    "ಬೆಳೆ": "crop",
    "ಗೊಬ್ಬರ": "fertilizer",
    "ರೋಗ": "disease",
    "ಕೀಟ": "pest",
    "ಮಣ್ಣು": "soil",
    "ನೀರು": "water irrigation",
    "ಭತ್ತ": "paddy rice",
    "ಗೋಧಿ": "wheat",
    "ರಾಗಿ": "ragi finger millet",
}


@dataclass
class Chunk:
    """One retrievable unit of the KB."""
    id: str
    source: str          # filename like "crops.md"
    heading: str         # the ## heading this chunk falls under
    text: str            # full text of the chunk
    tokens: List[str] = field(default_factory=list)
    tf: Counter = field(default_factory=Counter)


# ---------------------------------------------------------------------------
# Tokenisation
# ---------------------------------------------------------------------------
_TOKEN_RE = re.compile(r"[A-Za-z0-9\u0900-\u097F\u0C80-\u0CFF]+")


def _tokenise(text: str) -> List[str]:
    """Lowercase + split on whitespace/punctuation. Keeps Devanagari (Hindi)
    and Kannada Unicode ranges. Drops stopwords and 1-char tokens."""
    raw = _TOKEN_RE.findall(text.lower())
    return [t for t in raw if t not in _STOPWORDS and len(t) > 1]


def _expand_query(q: str) -> str:
    """Append English equivalents for known Hindi/Kannada terms in the query.
    Doesn't replace — appends — so original tokens still match."""
    parts = [q]
    for src, eng in _QUERY_EXPANSIONS.items():
        if src in q:
            parts.append(eng)
    return " ".join(parts)


# ---------------------------------------------------------------------------
# KB loader + BM25 ranker
# ---------------------------------------------------------------------------
class KnowledgeBase:
    """Singleton knowledge base over markdown files."""

    # BM25 hyperparameters (sensible defaults).
    K1 = 1.5
    B = 0.75

    def __init__(self) -> None:
        self.chunks: List[Chunk] = []
        self.idf: Dict[str, float] = {}
        self.avg_dl: float = 0.0
        self._loaded = False

    def load(self, knowledge_dir: Optional[Path] = None) -> None:
        """Read all .md files, chunk by ## heading, build the inverted index."""
        kdir = knowledge_dir or KNOWLEDGE_DIR
        if not kdir.exists():
            log.warning("Knowledge dir not found: %s", kdir)
            self._loaded = True
            return

        files = sorted(kdir.glob("*.md"))
        if not files:
            log.warning("No .md files in %s", kdir)
            self._loaded = True
            return

        for fp in files:
            try:
                text = fp.read_text(encoding="utf-8", errors="ignore")
            except OSError as e:
                log.warning("Could not read %s: %s", fp, e)
                continue
            self._ingest_file(fp.name, text)

        self._build_idf()
        self._loaded = True
        log.info(
            "KnowledgeBase loaded: %d chunks from %d files (avg %d tokens/chunk)",
            len(self.chunks), len(files),
            int(self.avg_dl) if self.chunks else 0,
        )

    def _ingest_file(self, source: str, text: str) -> None:
        """Split markdown into chunks at ## headings."""
        lines = text.split("\n")
        cur_heading = ""
        cur_lines: List[str] = []

        def flush():
            if not cur_lines:
                return
            body = "\n".join(cur_lines).strip()
            if not body:
                return
            chunk_text = (cur_heading + "\n" + body).strip() if cur_heading else body
            tokens = _tokenise(chunk_text)
            if not tokens:
                return
            self.chunks.append(Chunk(
                id=f"{source}#{len(self.chunks)}",
                source=source,
                heading=cur_heading.lstrip("# ").strip(),
                text=chunk_text,
                tokens=tokens,
                tf=Counter(tokens),
            ))

        for ln in lines:
            if ln.startswith("## "):
                flush()
                cur_heading = ln
                cur_lines = []
            else:
                cur_lines.append(ln)
        flush()

    def _build_idf(self) -> None:
        """Compute BM25 IDF over the chunk corpus."""
        n = len(self.chunks)
        if n == 0:
            return
        df: Counter = Counter()
        total_len = 0
        for c in self.chunks:
            for term in set(c.tokens):
                df[term] += 1
            total_len += len(c.tokens)
        self.avg_dl = total_len / n
        # Standard BM25 idf with +1 smoothing
        self.idf = {
            term: math.log(1 + (n - cnt + 0.5) / (cnt + 0.5))
            for term, cnt in df.items()
        }

    def search(self, query: str, k: int = 4, min_score: float = 1.0) -> List[Tuple[Chunk, float]]:
        """Return top-k chunks ranked by BM25. Filters out low-quality matches."""
        if not self._loaded:
            self.load()
        if not self.chunks or not query.strip():
            return []

        expanded = _expand_query(query)
        q_tokens = _tokenise(expanded)
        if not q_tokens:
            return []

        scored: List[Tuple[Chunk, float]] = []
        for c in self.chunks:
            score = self._bm25(c, q_tokens)
            if score >= min_score:
                scored.append((c, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:k]

    def _bm25(self, chunk: Chunk, q_tokens: Iterable[str]) -> float:
        score = 0.0
        dl = len(chunk.tokens) or 1
        norm = 1 - self.B + self.B * dl / (self.avg_dl or 1)
        for q in q_tokens:
            if q not in chunk.tf:
                continue
            idf = self.idf.get(q, 0.0)
            if idf <= 0:
                continue
            f = chunk.tf[q]
            score += idf * (f * (self.K1 + 1)) / (f + self.K1 * norm)
        return score


# Module-level singleton, lazy-loaded on first search() call.
KB = KnowledgeBase()


def search_knowledge(query: str, k: int = 4) -> List[Dict[str, str]]:
    """Convenience function for the chat orchestrator.
    Returns simple dicts ready to inject into a system message."""
    hits = KB.search(query, k=k)
    return [
        {
            "source": c.source,
            "heading": c.heading,
            "text": c.text,
            "score": f"{score:.2f}",
        }
        for c, score in hits
    ]


def format_knowledge_context(query: str, k: int = 4) -> Optional[str]:
    """Return a single string block ready to drop into a system message,
    or None if no good hits."""
    hits = search_knowledge(query, k=k)
    if not hits:
        return None
    parts = ["KNOWLEDGE CONTEXT (verified Indian agri facts — use these and DO NOT invent):"]
    for h in hits:
        parts.append(f"\n--- [{h['source']} :: {h['heading']}] ---\n{h['text']}")
    parts.append(
        "\n--- end of knowledge context ---\n"
        "Use the above to ground your answer. If the user's question is not "
        "covered by it, answer from your general agronomy knowledge but stay "
        "Indian-specific."
    )
    return "\n".join(parts)
