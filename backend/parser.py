import fitz
from docx import Document
import os
import re


def extract_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_from_pdf(file_path)
    if ext == ".docx":
        return extract_from_docx(file_path)
    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read().strip()
    raise ValueError(f"Unsupported file type: {ext}")


def extract_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    doc.close()
    return full_text.strip()


def extract_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    parts = [para.text for para in doc.paragraphs if para.text.strip()]
    return "\n".join(parts).strip()


def split_into_clauses(text: str) -> list[str]:
    text = re.sub(r"\r\n", "\n", text or "")
    text = re.sub(r"\n{3,}", "\n\n", text)

    numbered = re.split(
        r"(?=\n\s*(?:ARTICLE\s+\d+|Clause\s+\d+|\d+\.\d+|\d+\.\s+[A-Z]|\(\d+\)\s+[A-Z]))",
        text,
        flags=re.I,
    )
    numbered = [c.strip() for c in numbered if len(c.strip()) > 60]
    numbered = [c for c in numbered if not _is_signature_block(c)]

    if len(numbered) >= 3:
        return numbered[:20]

    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if len(p.strip()) > 80]
    paras = [p for p in paras if not _is_signature_block(p)]
    if paras:
        return paras[:20]

    words = text.split()
    chunks = []
    for i in range(0, len(words), 110):
        chunk = " ".join(words[i : i + 110]).strip()
        if len(chunk) > 40 and not _is_signature_block(chunk):
            chunks.append(chunk)
    return chunks[:20] or ([text.strip()] if text.strip() else [])


def _is_signature_block(text: str) -> bool:
    upper = text.upper()
    return any(word in upper for word in ["SIGNATURE", "SIGNED BY", "PRINTED NAME", "AADHAAR", "PAN NO"])
