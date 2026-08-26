import os
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import json

model = SentenceTransformer('all-MiniLM-L6-v2')

LEGAL_DOCS = {
    "indian_contract_act": "legal_docs/indian_contract_act.pdf",
    "msme_act": "legal_docs/msme_act.pdf",
    "copyright_act": "legal_docs/copyright_act.pdf",
    "it_act": "legal_docs/it_act.pdf"
}

def extract_pdf_text(file_path: str) -> str:
    reader = PdfReader(file_path)
    full_text = ""
    for page in reader.pages:
        text = page.extract_text()
        if text:
            full_text += text + "\n"
    return full_text.strip()

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        if len(chunk.strip()) > 100:
            chunks.append(chunk.strip())
        i += chunk_size - overlap
    return chunks

def process_all_docs() -> list[dict]:
    all_chunks = []
    for doc_name, file_path in LEGAL_DOCS.items():
        if not os.path.exists(file_path):
            print(f"Missing: {file_path}")
            continue
        print(f"Processing {doc_name}...")
        text = extract_pdf_text(file_path)
        chunks = chunk_text(text)
        print(f"  → {len(chunks)} chunks extracted")
        for i, chunk in enumerate(chunks):
            all_chunks.append({
                "doc_name": doc_name,
                "chunk_index": i,
                "text": chunk
            })
    return all_chunks

def generate_embeddings(chunks: list[dict]) -> list[dict]:
    print(f"\nGenerating embeddings for {len(chunks)} chunks...")
    texts = [c["text"] for c in chunks]
    embeddings = model.encode(texts, show_progress_bar=True)
    for i, chunk in enumerate(chunks):
        chunk["embedding"] = embeddings[i].tolist()
    return chunks

if __name__ == "__main__":
    chunks = process_all_docs()
    chunks_with_embeddings = generate_embeddings(chunks)
    with open("legal_embeddings.json", "w") as f:
        json.dump(chunks_with_embeddings, f)
    print(f"\nDone. Saved {len(chunks_with_embeddings)} chunks to legal_embeddings.json")