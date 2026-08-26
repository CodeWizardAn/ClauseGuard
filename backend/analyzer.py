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
client = None
try:
    api_key = os.getenv("GROQ_API_KEY")
    if api_key:
        client = Groq(api_key=api_key)
except Exception:
    client = None


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
    if client:
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
        return "The reader is an everyday person or student. Keep language extremely simple, direct, and actionable."
    return (
        f"The reader is a {profile.get('role') or 'regular citizen'}. "
        f"Their primary concern is: {profile.get('worry') or 'hidden risks and unfair penalties'}. "
        f"Answer to protect their interests in plain, friendly language."
    )


def analyze_clause(clause: str, contract_type: str = "Unknown", metadata: dict = None, profile: dict = None) -> dict:
    clause = redact_pii(clause)
    if metadata is None:
        metadata = privacy_metadata()

    indian_law_context = get_relevant_law(clause, top_k=2)
    calibration_note = get_recalibration_prompt()
    jargon_found = extract_jargon(clause)
    jargon_terms = [j["term"] for j in jargon_found]

    prompt = f"""You are a fair, highly intelligent legal contract auditor.
Your job is to accurately evaluate the risk level of THIS SPECIFIC CLAUSE for an everyday person or student.

CALIBRATED RISK SCORING GUIDELINES (DO NOT OVER-FLAG STANDARD TERMS):
- CLEAN / ROUTINE (Score 5-20, Severity: 'Clean'):
  * Title, preamble, party definitions, address descriptions.
  * Standard boilerplate: severability, counterparts, whole agreement clauses.
  * Routine payment mode (e.g. "rent payable via NEFT/UPI on 1st of month").
- LOW RISK (Score 21-38, Severity: 'Low'):
  * Standard mutual terms: 30-day written notice for termination by either party.
  * Standard security deposit (1-2 months rent), refund upon handover.
  * Normal maintenance duties (tenant keeps premises tidy, landlord does structural repairs).
- MEDIUM RISK (Score 39-58, Severity: 'Medium'):
  * Reasonable lock-in periods (e.g., 6 months) with standard break fee.
  * 5-7 days grace period with reasonable late interest (e.g., 1-2% per month).
  * Standard confidentiality or IP assignment during employment hours.
- HIGH RISK (Score 59-78, Severity: 'High'):
  * Unilateral rent escalation without consent (e.g., "Landlord may increase rent at any time").
  * Forfeiture of entire security deposit for minor delays.
  * Landlord right to enter premises without prior notice.
  * One-sided termination (only the company can terminate, employee cannot).
- CRITICAL / PREDATORY (Score 79-95, Severity: 'Critical'):
  * Complete waiver of rights to approach courts or consumer forums.
  * Unilateral indemnity (you pay for the other side's own negligence or mistakes).
  * Strict post-employment non-compete preventing you from working anywhere (void under Indian Contract Act Section 27).
  * Unilateral arbitrator selection where only the other party picks the judge.

READER CONTEXT:
{_profile_note(profile)}

DOCUMENT TYPE: {contract_type}

CLAUSE TO ANALYZE:
{clause}

{indian_law_context}
{calibration_note}

Return ONLY valid JSON matching this schema:
{{
    "plain_summary": "<2 simple sentences explaining what this clause says in plain words>",
    "simple_takeaway": "<one clear line: what this means for the reader in practice>",
    "rights": ["<what the reader CAN do or is entitled to>"],
    "obligations": ["<what the reader MUST do or is liable for>"],
    "risk_score": <realistic integer from 5 to 95 based on guidelines above>,
    "severity": "<Critical|High|Medium|Low|Clean>",
    "category": "<Liability|IP Ownership|Termination|Payment|Confidentiality|Indemnity|Governing Law|Force Majeure|General>",
    "explanation": "<short explanation of whether this is fair, standard, or one-sided>",
    "rewrite": "<fairer version if High/Critical, or null if Low/Clean/Medium>"
}}"""

    result = None
    if client:
        try:
            response = client.chat.completions.create(
                model=REASONING_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=650,
            )
            raw = response.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = re.sub(r"```json|```", "", raw).strip()
            result = json.loads(raw)
            try:
                result = validate_response(json.dumps(result))
            except Exception:
                pass
        except Exception as e:
            print(f"[analyzer] LLM analysis error: {e}")

    if not result or not isinstance(result, dict) or "risk_score" not in result:
        # Intelligent Rule-Based Fallback Scoring
        result = _rule_based_clause_analysis(clause)

    # Normalize severity strictly matching the calibrated score
    score = int(result.get("risk_score", 30))
    if score <= 22:
        result["severity"] = "Clean"
    elif score <= 38:
        result["severity"] = "Low"
    elif score <= 58:
        result["severity"] = "Medium"
    elif score <= 78:
        result["severity"] = "High"
    else:
        result["severity"] = "Critical"

    # Only apply semantic boost if matched with high confidence (> 0.82)
    similarity_data = get_similarity_boost(clause)
    if similarity_data.get("matched") and similarity_data.get("similarity_score", 0) >= 0.82:
        original_score = result.get("risk_score", 30)
        boost = min(15, similarity_data.get("boost", 10))
        result["risk_score"] = min(92, original_score + boost)
        result["similarity_match"] = {
            "matched": True,
            "similarity_score": similarity_data["similarity_score"],
            "matched_category": similarity_data.get("matched_category", ""),
            "why_risky": similarity_data.get("why_risky", ""),
            "safe_version": similarity_data.get("safe_version", ""),
        }
        if not result.get("rewrite") and similarity_data.get("safe_version"):
            result["rewrite"] = similarity_data["safe_version"]
    else:
        result["similarity_match"] = {"matched": False}

    result["jargon_terms"] = jargon_terms
    result["simple_takeaway"] = result.get("simple_takeaway") or result.get("plain_summary", "")
    return result


def _rule_based_clause_analysis(clause: str) -> dict:
    """Intelligent heuristic fallback when LLM is offline."""
    c = clause.lower()
    
    # Critical flags
    if any(w in c for w in ["sole discretion", "unilateral right", "waive all claims", "indemnify and hold harmless against any and all", "non-compete for a period of 2", "restrain from engaging in any business"]):
        return {
            "plain_summary": "This clause gives the other party one-sided control or requires you to give up critical legal protections.",
            "simple_takeaway": "High risk: push back and request mutual rights before signing.",
            "rights": ["You can negotiate for mutual terms or notice periods."],
            "obligations": ["Requires significant obligations or waivers on your part."],
            "risk_score": 75,
            "severity": "High",
            "category": "Liability",
            "explanation": "Contains one-sided powers or broad indemnity language.",
            "rewrite": "Both parties agree to standard mutual notice and liability caps.",
        }

    # Standard/Routine terms
    if any(w in c for w in ["whereas", "witnesseth", "in witness whereof", "definitions", "counterparts", "severability", "headings"]):
        return {
            "plain_summary": "Standard contract administration and boilerplate wording.",
            "simple_takeaway": "Standard clause with minimal risk.",
            "rights": ["Standard legal validity protections."],
            "obligations": ["Follow basic execution requirements."],
            "risk_score": 15,
            "severity": "Clean",
            "category": "General",
            "explanation": "Standard formal wording used across most agreements.",
            "rewrite": None,
        }

    # Normal payment/deposit terms
    if any(w in c for w in ["rent", "security deposit", "electricity", "maintenance", "notice period"]):
        return {
            "plain_summary": "Sets out standard payment or operational details for the agreement.",
            "simple_takeaway": "Ensure the amounts and notice days match what was discussed.",
            "rights": ["Entitled to receipt of payment and return of security deposit upon handover."],
            "obligations": ["Pay agreed dues on time."],
            "risk_score": 28,
            "severity": "Low",
            "category": "Payment",
            "explanation": "Standard commercial terms typical of agreements in India.",
            "rewrite": None,
        }

    return {
        "plain_summary": "General contract terms governing mutual rights and duties.",
        "simple_takeaway": "Review to confirm it aligns with your agreement.",
        "rights": ["Mutual performance rights."],
        "obligations": ["Comply with agreed conditions."],
        "risk_score": 30,
        "severity": "Low",
        "category": "General",
        "explanation": "Standard operational clause.",
        "rewrite": None,
    }
