import os
from groq import Groq
from dotenv import load_dotenv
from languages import SUPPORTED_LANGUAGES, FAST_MODEL

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def translate_text(text: str, target_lang_code: str) -> str:
    if not text or target_lang_code == "en" or target_lang_code not in SUPPORTED_LANGUAGES:
        return text

    target_lang = SUPPORTED_LANGUAGES[target_lang_code]
    prompt = f"""Translate into {target_lang} for a student or first-time reader.
Keep it simple. Do not add names, phone numbers, or extra commentary.
Output ONLY the translation.

TEXT:
{text}
"""
    try:
        response = client.chat.completions.create(
            model=FAST_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Translation error: {e}")
        return text


def translate_clause_data(clause_data: dict, target_lang_code: str) -> dict:
    if target_lang_code == "en" or target_lang_code not in SUPPORTED_LANGUAGES:
        return clause_data

    translated = dict(clause_data)
    for key in ("explanation", "rewrite", "plain_summary", "simple_takeaway"):
        if translated.get(key):
            translated[key] = translate_text(translated[key], target_lang_code)
    if isinstance(translated.get("rights"), list):
        translated["rights"] = [translate_text(r, target_lang_code) for r in translated["rights"]]
    if isinstance(translated.get("obligations"), list):
        translated["obligations"] = [translate_text(o, target_lang_code) for o in translated["obligations"]]
    return translated
