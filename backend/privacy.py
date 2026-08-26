"""Strip names, phone numbers, IDs and other PII before anything is stored."""
import re

EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
PHONE_RE = re.compile(r"(?:\+91[\s-]?)?(?:\(?0\)?[\s-]?)?[6-9]\d{9}\b")
PHONE_GENERIC_RE = re.compile(r"\b(?:\+?\d{1,3}[\s-]?)?(?:\d[\s-]?){8,14}\d\b")
AADHAAR_RE = re.compile(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b")
PAN_RE = re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b")
ACCOUNT_RE = re.compile(r"\b(?:A/?C|account|acc(?:ount)?\s*(?:no|number|#)[:.\s]*)\d[\d\s-]{6,}\b", re.I)
IFSC_RE = re.compile(r"\b[A-Z]{4}0[A-Z0-9]{6}\b")
PINCODE_RE = re.compile(r"\b[1-9]\d{5}\b")
CARD_RE = re.compile(r"\b(?:\d[ -]*?){13,19}\b")
HONORIFIC_NAME_RE = re.compile(
    r"\b(?:Mr|Mrs|Ms|Miss|Dr|Shri|Smt|Sri|Kumari)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\b"
)
SIGNED_NAME_RE = re.compile(
    r"(?im)^(?:signed\s+by|name\s*[:]|printed\s+name\s*[:]|lessor|lessee|borrower|lender)\s*[:\-]*\s*.+$"
)


def redact_pii(text: str) -> str:
    if not text:
        return ""
    redacted = EMAIL_RE.sub("[email hidden]", text)
    redacted = AADHAAR_RE.sub("[ID hidden]", redacted)
    redacted = PAN_RE.sub("[tax ID hidden]", redacted)
    redacted = IFSC_RE.sub("[bank code hidden]", redacted)
    redacted = ACCOUNT_RE.sub("[account hidden]", redacted)
    redacted = PHONE_RE.sub("[phone hidden]", redacted)
    redacted = HONORIFIC_NAME_RE.sub("[name hidden]", redacted)
    redacted = SIGNED_NAME_RE.sub("[signature block hidden]", redacted)
    redacted = CARD_RE.sub("[number hidden]", redacted)
    # Last pass for leftover long digit strings that look like phone/account numbers
    redacted = PHONE_GENERIC_RE.sub("[number hidden]", redacted)
    return redacted


def public_filename(contract_type: str, short_id: str) -> str:
    safe_type = re.sub(r"[^A-Za-z0-9 ]+", "", contract_type or "Document").strip() or "Document"
    return f"{safe_type} {short_id[:8]}"


def privacy_metadata() -> dict:
    """Never persist real party names or contact details."""
    return {
        "party_1": "You",
        "party_2": "The other party",
        "contract_date": "not stored",
        "contract_value": "amounts kept only if needed for risk",
        "jurisdiction": "not specified",
        "key_subject": "legal or official document",
        "pii_stripped": True,
    }
