import os
import json
import re
from groq import Groq
from dotenv import load_dotenv
from languages import SUPPORTED_LANGUAGES, FAST_MODEL

load_dotenv()
client = None
try:
    api_key = os.getenv("GROQ_API_KEY")
    if api_key:
        client = Groq(api_key=api_key)
except Exception:
    client = None


def translate_text(text: str, target_lang_code: str) -> str:
    if not text or target_lang_code == "en" or target_lang_code not in SUPPORTED_LANGUAGES:
        return text

    if not client:
        return text

    target_lang = SUPPORTED_LANGUAGES[target_lang_code]
    prompt = f"""You are a helpful translator for everyday citizens and students in India.
Translate the following English legal analysis into natural, fluent {target_lang}.
Use simple everyday words that a common person can easily understand.
Output ONLY the translated text, without quotes or additional preamble.

TEXT TO TRANSLATE:
{text}
"""
    try:
        response = client.chat.completions.create(
            model=FAST_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=400,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[multilingual] Translation error: {e}")
        return text


def translate_clause_data(clause_data: dict, target_lang_code: str) -> dict:
    if not clause_data or target_lang_code == "en" or target_lang_code not in SUPPORTED_LANGUAGES:
        return clause_data

    if not client:
        return clause_data

    target_lang = SUPPORTED_LANGUAGES[target_lang_code]

    # Single-pass structured translation for speed and consistency
    payload = {
        "plain_summary": clause_data.get("plain_summary", ""),
        "simple_takeaway": clause_data.get("simple_takeaway", ""),
        "explanation": clause_data.get("explanation", ""),
        "rewrite": clause_data.get("rewrite", ""),
        "rights": clause_data.get("rights", []) if isinstance(clause_data.get("rights"), list) else [],
        "obligations": clause_data.get("obligations", []) if isinstance(clause_data.get("obligations"), list) else [],
    }

    prompt = f"""Translate this JSON structured contract breakdown into natural, simple {target_lang} for an everyday citizen.
Translate all string values into {target_lang}. Keep the exact same JSON keys.

INPUT JSON:
{json.dumps(payload, ensure_ascii=False)}

Return ONLY valid JSON matching this schema:
{{
  "plain_summary": "...",
  "simple_takeaway": "...",
  "explanation": "...",
  "rewrite": "...",
  "rights": ["..."],
  "obligations": ["..."]
}}"""

    try:
        response = client.chat.completions.create(
            model=FAST_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=800,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = re.sub(r"```json|```", "", raw).strip()
        parsed = json.loads(raw)

        translated = dict(clause_data)
        for k in ("plain_summary", "simple_takeaway", "explanation", "rewrite"):
            if parsed.get(k):
                translated[k] = parsed[k]
        if isinstance(parsed.get("rights"), list) and len(parsed["rights"]) > 0:
            translated["rights"] = parsed["rights"]
        if isinstance(parsed.get("obligations"), list) and len(parsed["obligations"]) > 0:
            translated["obligations"] = parsed["obligations"]

        return translated
    except Exception as e:
        print(f"[multilingual] Clause batch translation error: {e}")
        # Fallback to individual fields if batch failed
        translated = dict(clause_data)
        for key in ("plain_summary", "simple_takeaway", "explanation"):
            if translated.get(key):
                translated[key] = translate_text(translated[key], target_lang_code)
        return translated
