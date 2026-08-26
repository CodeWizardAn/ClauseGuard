import re
import os
import json
from groq import Groq
from dotenv import load_dotenv
from indian_law import get_relevant_law
from validator import validate_response
from embeddings import get_similarity_boost
from feedback import get_recalibration_prompt
from glossary import extract_jargon
from privacy import privacy_metadata, redact_pii
from languages import FAST_MODEL, REASONING_MODEL

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def extract_contract_metadata(text: str, contract_type: str) -> dict:
    meta = privacy_metadata()
    meta["key_subject"] = contract_type or "legal or official document"
    sample = redact_pii(text or "")[:1500]
    prompt = f"""Describe this document in one short sentence. Do NOT include any names, phone numbers, emails, addresses, ID numbers, or account numbers.

Document type hint: {contract_type}
Text:
{sample}

Return ONLY JSON:
{{"key_subject": "<one simple sentence>", "jurisdiction": "<country/state if clearly mentioned, else 'not specified'>"}}"""
    try:
        response = client.chat.completions.create(
            model=FAST_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = re.sub(r"```json|```", "", raw).strip()
        parsed = json.loads(raw)
        meta["key_subject"] = parsed.get("key_subject") or meta["key_subject"]
        meta["jurisdiction"] = parsed.get("jurisdiction") or "not specified"
    except Exception:
        pass
    return meta


def split_into_clauses(text: str) -> list[str]:
    from parser import split_into_clauses as _split
    return _split(text)


def _profile_note(profile: dict | None) -> str:
    if not profile:
        return "The reader is a regular person. Keep language extremely simple."
    return (
        f"The reader is a {profile.get('role') or 'regular person'}. "
        f"They worry most about: {profile.get('worry') or 'hidden risks'}. "
        f"They asked: {profile.get('question') or 'What should I watch out for?'}. "
        "Answer as if you are helping this one person. Never use their real name."
    )


def analyze_clause(clause: str, contract_type: str = "Unknown", metadata: dict = None, profile: dict = None) -> dict:
    clause = redact_pii(clause)
    if metadata is None:
        metadata = privacy_metadata()

    indian_law_context = get_relevant_law(clause, top_k=3)
    calibration_note = get_recalibration_prompt()
    jargon_found = extract_jargon(clause)
    jargon_terms = [j["term"] for j in jargon_found]

    prompt = f"""You help students and everyday people understand legal papers.
Use the shortest, simplest words you can. A 14-year-old should understand it.
Never mention real names, phone numbers, emails, or ID numbers. Say "you" and "the other side".

READER:
{_profile_note(profile)}

DOCUMENT:
- Type: {contract_type}
- About: {metadata.get('key_subject', 'a legal document')}

CLAUSE:
{clause}

{indian_law_context}
{calibration_note}

SCORING RULES:
- Score THIS clause only. Do not give every clause the same number.
- Title, parties, definitions: 8-22 (Clean or Low).
- Ordinary rent, dates, duties: 20-40 (Low or Medium).
- Unfair fees, lock-in, one-sided exit, entry without notice: 55-78 (High).
- Unlimited liability or stripping the right to go to court: 80-95 (Critical).
- Never use 100. Never default to a high score.

Return ONLY JSON:
{{
    "plain_summary": "<2 short sentences, everyday words>",
    "simple_takeaway": "<one line: what this means for THIS reader>",
    "rights": ["<up to 3 things this person CAN do, in simple words>"],
    "obligations": ["<up to 3 things they MUST do or might lose>"],
    "risk_score": <integer 1-95>,
    "severity": "<Critical|High|Medium|Low|Clean>",
    "category": "<Liability|IP Ownership|Termination|Payment|Confidentiality|Indemnity|Governing Law|Force Majeure|General>",
    "explanation": "<why this may be risky or unfair, simple words>",
    "rewrite": "<fairer version in simple words, or null if Low/Clean>"
}}"""

    try:
        response = client.chat.completions.create(
            model=REASONING_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = re.sub(r"```json|```", "", raw).strip()
        result = json.loads(raw)
        try:
            result = validate_response(json.dumps(result))
        except Exception:
            pass
    except Exception:
        result = {
            "plain_summary": "We could not read this part automatically.",
            "simple_takeaway": "Ask a trusted adult or lawyer before you sign.",
            "rights": [],
            "obligations": [],
            "risk_score": 50,
            "severity": "Medium",
            "category": "General",
            "explanation": "Automatic reading failed for this section.",
            "rewrite": None,
        }

    similarity_data = get_similarity_boost(clause)
    if similarity_data["matched"]:
        original_score = result.get("risk_score", 50)
        result["risk_score"] = min(95, original_score + similarity_data["boost"])
        result["similarity_match"] = {
            "matched": True,
            "similarity_score": similarity_data["similarity_score"],
            "matched_id": similarity_data.get("matched_id", ""),
            "matched_risk_level": similarity_data["matched_risk_level"],
            "matched_category": similarity_data.get("matched_category", ""),
            "why_risky": similarity_data.get("why_risky", ""),
            "safe_version": similarity_data.get("safe_version", ""),
            "boost_applied": similarity_data["boost"],
        }
        # If the dataset has a better rewrite and LLM didn't produce one, use it
        if not result.get("rewrite") and similarity_data.get("safe_version"):
            result["rewrite"] = similarity_data["safe_version"]
    else:
        result["similarity_match"] = {"matched": False}

    result["jargon_terms"] = jargon_terms
    result["simple_takeaway"] = result.get("simple_takeaway") or result.get("plain_summary", "")
    return result

