import os
import difflib
from groq import Groq
from dotenv import load_dotenv
from languages import FAST_MODEL
from privacy import redact_pii
from database import get_clauses, get_profile, get_chat_history

load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

chroma_client = None
try:
    import chromadb
    chroma_client = chromadb.PersistentClient(path=os.path.join(os.path.dirname(__file__), "chroma_db"))
except Exception as e:
    print(f"ChromaDB unavailable, using local search: {e}")


def get_or_create_collection(contract_id: str):
    if not chroma_client:
        return None
    collection_name = f"contract_{contract_id.replace('-', '_')}"
    return chroma_client.get_or_create_collection(name=collection_name)


def index_contract_clauses(contract_id: str, clauses: list):
    collection = get_or_create_collection(contract_id)
    if collection is None:
        return
    documents, metadatas, ids = [], [], []
    for c in clauses:
        clause_text = redact_pii(c.get("clause_text", ""))
        if len(clause_text.strip()) < 10:
            continue
        clause_num = str(c.get("clause_number", 0))
        documents.append(clause_text)
        metadatas.append({
            "clause_number": clause_num,
            "category": c.get("category", "General"),
            "risk_score": c.get("risk_score", 0),
        })
        ids.append(f"clause_{clause_num}")
    if documents:
        try:
            collection.add(documents=documents, metadatas=metadatas, ids=ids)
        except Exception as e:
            print(f"Index error: {e}")


def _local_search(contract_id: str, query: str, top_k: int = 4):
    clauses = get_clauses(contract_id)
    if not clauses:
        return [], []
    scored = []
    q = query.lower()
    for c in clauses:
        text = c.get("clause_text") or ""
        ratio = difflib.SequenceMatcher(None, q, text.lower()[:800]).ratio()
        hits = sum(1 for w in q.split() if len(w) > 3 and w in text.lower())
        score = ratio + hits * 0.12
        scored.append((score, c))
    scored.sort(key=lambda x: x[0], reverse=True)
    top = [c for _, c in scored[:top_k]]
    docs = [c.get("clause_text", "") for c in top]
    meta = [{"clause_number": str(c.get("clause_number", 0))} for c in top]
    return docs, meta


def query_contract(contract_id: str, query: str, top_k: int = 4, lang: str = "en") -> dict:
    retrieved_docs, retrieved_metadata = [], []
    collection = get_or_create_collection(contract_id)
    if collection is not None:
        try:
            if collection.count() > 0:
                results = collection.query(query_texts=[query], n_results=top_k)
                retrieved_docs = results["documents"][0]
                retrieved_metadata = results["metadatas"][0]
        except Exception:
            retrieved_docs = []

    if not retrieved_docs:
        retrieved_docs, retrieved_metadata = _local_search(contract_id, query, top_k)

    if not retrieved_docs:
        return {
            "answer": "I do not have this document ready yet. Wait for the scan to finish, then ask again.",
            "citations": [],
            "simple": True,
        }

    context = ""
    citations = []
    for i, doc in enumerate(retrieved_docs):
        clause_num = retrieved_metadata[i].get("clause_number", str(i + 1))
        context += f"[Part {clause_num}]: {redact_pii(doc)}\n\n"
        citations.append(clause_num)

    profile = get_profile(contract_id) or {}
    history = get_chat_history(contract_id, limit=8)
    hist_txt = "\n".join(f"{h['role']}: {h['content']}" for h in history)

    from indian_law import get_relevant_law
    statutory_context = get_relevant_law(query + " " + context[:400], top_k=2)

    prompt = f"""You are a precise, plain-language legal intelligence assistant.
Talk like a clear expert explaining to a normal citizen. Use plain words and short sentences.
Never reveal names, phone numbers, emails, or ID numbers. Say "you" and "the other side".
Ground your answer STRICTLY in the provided document parts and statutory context. Do NOT guess or make up facts.

Reader role: {profile.get('role') or 'everyday person'}
They worry about: {profile.get('worry') or 'hidden risks'}

{statutory_context}

DOCUMENT EXCERPTS:
{context}

Recent chat:
{hist_txt or '(none)'}

QUESTION: {query}

Instructions:
1. Give a clear, direct 1-sentence answer addressing the question immediately.
2. Provide 2-3 short, actionable bullet points explaining what this means and any risk.
3. End with a single concrete action: "What to do: [specific next step or counter-clause suggestion]".
Keep response concise, authoritative, and under 120 words.
"""

    try:
        response = groq_client.chat.completions.create(
            model=FAST_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.15,
        )
        answer = response.choices[0].message.content.strip()
    except Exception as e:
        answer = f"I could not answer just now. Try a simpler question. ({e})"


    return {
        "answer": answer,
        "citations": list(dict.fromkeys(citations)),
        "simple": True,
    }
