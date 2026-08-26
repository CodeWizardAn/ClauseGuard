"""
Semantic similarity matching against the labeled clause dataset.

Uses pre-computed sentence embeddings (all-MiniLM-L6-v2) from
clause_dataset_embeddings.json to find clauses similar to known
risky patterns — much more accurate than the old difflib approach.
"""
import os
import json
import math

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EMBEDDINGS_PATH = os.path.join(BASE_DIR, "clause_dataset_embeddings.json")

# Risk boost by severity level
BOOST_MAP = {
    "Critical": 22,
    "High":     14,
    "Medium":   7,
}

# Cosine similarity threshold — below this we don't count as a match
SIMILARITY_THRESHOLD = 0.72

# ── Load pre-computed dataset embeddings once at startup ─────────────────────
_dataset: list[dict] = []

def _load_dataset():
    global _dataset
    if _dataset:
        return
    try:
        with open(EMBEDDINGS_PATH, encoding="utf-8") as f:
            _dataset = json.load(f)
    except Exception as e:
        print(f"[embeddings] Warning: could not load dataset: {e}")
        _dataset = []

_load_dataset()


# ── Embedding helpers ─────────────────────────────────────────────────────────
def _dot(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))

def _norm(v: list[float]) -> float:
    return math.sqrt(sum(x * x for x in v))

def _cosine(a: list[float], b: list[float]) -> float:
    denom = _norm(a) * _norm(b)
    if denom == 0:
        return 0.0
    return _dot(a, b) / denom


# ── Runtime embedding via sentence-transformers (lazy load) ───────────────────
_encoder = None

def _encode(text: str) -> list[float]:
    global _encoder
    try:
        if _encoder is None:
            from sentence_transformers import SentenceTransformer
            _encoder = SentenceTransformer("all-MiniLM-L6-v2")
        return _encoder.encode(text, normalize_embeddings=True).tolist()
    except Exception as e:
        print(f"[embeddings] Encoder error: {e}")
        return []


# ── Public API ────────────────────────────────────────────────────────────────
def get_similarity_boost(clause_text: str) -> dict:
    """
    Encodes the incoming clause and compares it against all 22 pre-labeled
    risky clauses using cosine similarity.

    Returns a boost dict if a match is found above the threshold:
        {
            matched: True,
            similarity_score: float,
            matched_id: str,
            matched_risk_level: str,
            matched_category: str,
            why_risky: str,
            safe_version: str,
            boost: int,
        }
    Returns {"matched": False} otherwise.
    """
    if not _dataset:
        return {"matched": False}

    query_vec = _encode(clause_text)
    if not query_vec:
        return {"matched": False}

    best_score = 0.0
    best_entry = None

    for entry in _dataset:
        stored_vec = entry.get("embedding")
        if not stored_vec:
            continue
        score = _cosine(query_vec, stored_vec)
        if score > best_score:
            best_score = score
            best_entry = entry

    if best_score >= SIMILARITY_THRESHOLD and best_entry:
        risk_level = best_entry.get("risk_level", "Medium")
        return {
            "matched": True,
            "similarity_score": round(best_score, 4),
            "matched_id": best_entry.get("id", ""),
            "matched_risk_level": risk_level,
            "matched_category": best_entry.get("category", "General"),
            "why_risky": best_entry.get("why_risky", ""),
            "safe_version": best_entry.get("safe_version", ""),
            "boost": BOOST_MAP.get(risk_level, 7),
        }

    return {"matched": False}