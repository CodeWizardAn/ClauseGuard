"""
AI Insights engine — generates red flags, negotiation tips, and overall verdict
after clause analysis is complete.
"""
import os
import json
import re
from groq import Groq
from dotenv import load_dotenv
from languages import REASONING_MODEL

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def _build_prompt(top_clauses: list[dict], contract_type: str) -> str:
    clause_summaries = "\n".join([
        f"Clause {c.get('clause_number', i+1)} [{c.get('category','General')} · "
        f"Risk {c.get('risk_score', 50)}/100 · {c.get('severity','Medium')}]:\n"
        f"  Text: {c.get('clause_text','')[:300]}\n"
        f"  Plain summary: {c.get('plain_summary','')}"
        for i, c in enumerate(top_clauses)
    ])

    return f"""You are a plain-language legal advisor helping an everyday person understand their contract risks.

CONTRACT TYPE: {contract_type}

TOP HIGH-RISK CLAUSES:
{clause_summaries}

Your job:
1. For each clause above, write ONE short negotiation tip (max 15 words) — what to ask for or push back on.
2. Write a 1-sentence overall verdict on whether to sign.
3. Give a bias label: one of "Heavily One-Sided", "Slightly Unfair", "Balanced", "Favourable to You".
4. Give a bias_score: integer from -100 (totally against you) to +100 (totally in your favour). Negative = bad for you.

Use simple words. Be direct. No legal jargon.

Return ONLY valid JSON:
{{
  "red_flags": [
    {{
      "clause_number": <int>,
      "category": "<string>",
      "risk_score": <int>,
      "tip": "<one short negotiation tip>"
    }}
  ],
  "verdict": "<1 sentence: Safe to sign | Proceed with caution | Do not sign without changes | Seek legal advice>",
  "verdict_level": "<safe|caution|danger>",
  "bias_label": "<Heavily One-Sided|Slightly Unfair|Balanced|Favourable to You>",
  "bias_score": <integer -100 to +100>
}}"""


def generate_insights(clauses: list[dict], contract_type: str) -> dict:
    """
    Takes all analyzed clauses, picks the top 3 by risk score,
    and returns AI-generated negotiation tips + overall verdict.
    """
    if not clauses:
        return _fallback()

    # Sort by risk score descending, take top 3
    sorted_clauses = sorted(clauses, key=lambda c: c.get("risk_score", 0), reverse=True)
    top_3 = sorted_clauses[:3]

    # Quick stats for bias calculation fallback
    critical_count = sum(1 for c in clauses if c.get("severity") in ("Critical", "High"))
    total = len(clauses)

    try:
        response = client.chat.completions.create(
            model=REASONING_MODEL,
            messages=[{"role": "user", "content": _build_prompt(top_3, contract_type)}],
            temperature=0.2,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = re.sub(r"```json|```", "", raw).strip()
        data = json.loads(raw)

        # Validate required fields
        if "red_flags" not in data or "verdict" not in data:
            raise ValueError("Missing required fields")

        # Attach full clause info to each red flag
        clause_map = {c.get("clause_number"): c for c in clauses}
        for flag in data.get("red_flags", []):
            num = flag.get("clause_number")
            if num in clause_map:
                flag["plain_summary"] = clause_map[num].get("plain_summary", "")
                flag["severity"] = clause_map[num].get("severity", "High")

        return data

    except Exception as e:
        print(f"[insights] Error: {e}")
        return _fallback_with_data(top_3, critical_count, total)


def _fallback() -> dict:
    return {
        "red_flags": [],
        "verdict": "Analysis could not be completed. Review clauses manually.",
        "verdict_level": "caution",
        "bias_label": "Unknown",
        "bias_score": 0,
    }


def _fallback_with_data(top_3: list, critical_count: int, total: int) -> dict:
    """Returns a basic fallback using raw data if LLM fails."""
    ratio = critical_count / max(total, 1)
    if ratio > 0.4:
        verdict = "Do not sign without changes — too many risky clauses."
        verdict_level = "danger"
        bias_score = -60
        bias_label = "Heavily One-Sided"
    elif ratio > 0.2:
        verdict = "Proceed with caution — several clauses need review."
        verdict_level = "caution"
        bias_score = -30
        bias_label = "Slightly Unfair"
    else:
        verdict = "Mostly safe to sign — review highlighted clauses first."
        verdict_level = "safe"
        bias_score = 10
        bias_label = "Balanced"

    return {
        "red_flags": [
            {
                "clause_number": c.get("clause_number", i + 1),
                "category": c.get("category", "General"),
                "risk_score": c.get("risk_score", 50),
                "severity": c.get("severity", "High"),
                "plain_summary": c.get("plain_summary", ""),
                "tip": "Ask a lawyer to review this clause before signing.",
            }
            for i, c in enumerate(top_3)
        ],
        "verdict": verdict,
        "verdict_level": verdict_level,
        "bias_label": bias_label,
        "bias_score": bias_score,
    }
