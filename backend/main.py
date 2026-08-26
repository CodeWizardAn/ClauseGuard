import os
import uuid
import json
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from parser import extract_text, split_into_clauses
from analyzer import analyze_clause, extract_contract_metadata
from database import (
    save_contract, update_contract, save_clause,
    get_contract, get_clauses, get_all_contracts,
    save_profile, get_profile, save_chat_turn,
    update_contract_meta, delete_clauses, delete_contract,
    get_user_knowledge, save_user_knowledge,
)
from classifier import classify_contract, get_risk_weights
from storage import save_redacted_document, discard_original, delete_document, read_document
from job_queue import add_to_queue
from report_generator import generate_report
from rag_engine import index_contract_clauses, query_contract
from multilingual import translate_text, translate_clause_data
from glossary import get_all_glossary_terms
from comparator import compare_documents
from privacy import redact_pii, public_filename, privacy_metadata
from languages import SUPPORTED_LANGUAGES
from insights import generate_insights
from smart_context import generate_smart_questions, generate_personalized_verdict
from users import (
    get_current_user,
    register_user,
    login_user,
    complete_setup,
    verify_vault_pin,
)

app = FastAPI(title="ClauseGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
SAMPLES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "samples")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def compute_overall_score(results: list) -> int:
    scores = []
    for r in results:
        try:
            scores.append(max(1, min(100, int(r.get("risk_score", 0)))))
        except Exception:
            pass
    if not scores:
        return 0
    return round(sum(scores) / len(scores))


@app.get("/")
def root():
    return {"message": "ClauseGuard API is running", "status": "active"}


@app.get("/languages")
def list_languages():
    return [{"code": k, "label": v} for k, v in SUPPORTED_LANGUAGES.items()]


def _ingest_text(text: str, display_hint: str, current_user: dict, language: str = "en"):
    clean = redact_pii(text)
    if len(clean.strip()) < 40:
        raise HTTPException(status_code=400, detail="Could not read enough text from this file.")

    contract_id = str(uuid.uuid4())
    storage_path = save_redacted_document(contract_id, clean)
    clauses = split_into_clauses(clean)
    classification = classify_contract(clean)
    contract_type = classification.get("contract_type", "Unknown")
    metadata = extract_contract_metadata(clean, contract_type)
    display_name = public_filename(contract_type, contract_id)

    save_contract(
        contract_id,
        display_name,
        len(clauses),
        contract_type,
        current_user["user_id"],
        storage_path,
        display_name=display_name,
        language=language or current_user.get("language") or "en",
    )
    if current_user.get("profile_complete"):
        save_profile(
            contract_id,
            current_user.get("role") or "everyday person",
            current_user.get("worry") or "hidden risks",
            current_user.get("language") or "en",
            "What should I watch out for before I sign?",
        )
        update_contract_meta(contract_id, status="ready")

    cache_path = os.path.join(UPLOAD_DIR, f"{contract_id}.json")
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump({"clauses": clauses, "metadata": metadata, "display_hint": display_hint}, f)

    return {
        "contract_id": contract_id,
        "display_name": display_name,
        "total_clauses": len(clauses),
        "contract_type": contract_type,
        "confidence": classification.get("confidence", 0),
        "privacy": "Names, phone numbers, emails and IDs were removed before saving.",
        "needs_profile": True,
        "message": "Saved privately. Answer a few questions so we can explain this in your words.",
    }


@app.post("/upload")
async def upload_contract(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".pdf", ".docx", ".txt"]:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX and TXT files are supported")

    contract_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{contract_id}{ext}")
    file_contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(file_contents)

    try:
        text = extract_text(file_path)
    except Exception as e:
        discard_original(file_path)
        raise HTTPException(status_code=400, detail=f"Could not read file: {e}")

    discard_original(file_path)
    return _ingest_text(text, file.filename or "document", current_user)


class SamplePayload(BaseModel):
    sample_id: str
    language: str = "en"


@app.get("/samples")
def list_samples():
    items = [
        {"id": "rental", "label": "Rental Agreement", "file": "rental.txt"},
        {"id": "tos", "label": "Terms of Service", "file": "tos.txt"},
        {"id": "loan", "label": "MSME Loan", "file": "loan.txt"},
        {"id": "govt", "label": "Govt Circular", "file": "govt.txt"},
    ]
    return {"samples": items}


@app.post("/upload_sample")
def upload_sample(payload: SamplePayload, current_user: dict = Depends(get_current_user)):
    mapping = {
        "rental": "rental.txt",
        "tos": "tos.txt",
        "loan": "loan.txt",
        "govt": "govt.txt",
    }
    fname = mapping.get(payload.sample_id)
    if not fname:
        raise HTTPException(status_code=404, detail="Sample not found")
    path = os.path.join(SAMPLES_DIR, fname)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Sample file missing")
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    return _ingest_text(text, fname, current_user, payload.language)


class ProfilePayload(BaseModel):
    role: str
    worry: str
    language: str = "en"
    question: str = ""


@app.post("/profile/{contract_id}")
def set_profile(contract_id: str, payload: ProfilePayload, current_user: dict = Depends(get_current_user)):
    contract = get_contract(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Document not found")
    profile = save_profile(contract_id, payload.role, payload.worry, payload.language, payload.question)
    update_contract_meta(contract_id, language=payload.language, status="ready")
    return {"ok": True, "profile": profile}


@app.get("/profile/{contract_id}")
def read_profile(contract_id: str):
    return get_profile(contract_id) or {}


@app.get("/vault")
def vault(current_user: dict = Depends(get_current_user)):
    contracts = get_all_contracts(current_user["user_id"])
    cleaned = []
    for c in contracts:
        cleaned.append({
            "id": c["id"],
            "display_name": c.get("display_name") or c.get("original_filename"),
            "contract_type": c.get("contract_type"),
            "status": c.get("status"),
            "overall_score": c.get("overall_score", 0),
            "total_clauses": c.get("total_clauses", 0),
            "language": c.get("language") or "en",
            "created_at": c.get("created_at"),
        })
    return {"documents": cleaned}


@app.delete("/vault/{contract_id}")
def remove_from_vault(contract_id: str, current_user: dict = Depends(get_current_user)):
    delete_document(contract_id)
    cache_path = os.path.join(UPLOAD_DIR, f"{contract_id}.json")
    if os.path.exists(cache_path):
        os.remove(cache_path)
    delete_contract(contract_id)
    return {"ok": True}


@app.get("/status/{contract_id}")
def get_status(contract_id: str, current_user: dict = Depends(get_current_user)):
    contract = get_contract(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {
        "contract_id": contract_id,
        "status": contract["status"],
        "overall_score": contract.get("overall_score", 0),
        "total_clauses": contract.get("total_clauses", 0),
        "display_name": contract.get("display_name") or contract.get("original_filename"),
    }


@app.get("/analyze/{contract_id}")
async def analyze_contract(contract_id: str, lang: str = "en", force: int = 0, token: str = None, current_user: dict = Depends(get_current_user)):
    contract = get_contract(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    existing = get_clauses(contract_id)
    if existing and contract.get("status") == "complete" and not force:
        def replay():
            for result in existing:
                out = dict(result)
                if lang != "en":
                    out = translate_clause_data(out, lang)
                yield f"data: {json.dumps(out)}\n\n"
            done = {
                "done": True,
                "overall_score": contract.get("overall_score", 0),
                "total_clauses": len(existing),
            }
            yield f"data: {json.dumps(done)}\n\n"
        return StreamingResponse(replay(), media_type="text/event-stream")

    cache_path = os.path.join(UPLOAD_DIR, f"{contract_id}.json")
    if os.path.exists(cache_path):
        with open(cache_path, encoding="utf-8") as f:
            data = json.load(f)
        clauses = data["clauses"]
        metadata = data.get("metadata") or privacy_metadata()
    else:
        stored = read_document(contract_id)
        if not stored:
            raise HTTPException(status_code=404, detail="Contract file not found")
        clauses = split_into_clauses(stored)
        metadata = extract_contract_metadata(stored, contract.get("contract_type", "Unknown"))
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump({"clauses": clauses, "metadata": metadata}, f)
    profile = get_profile(contract_id)
    delete_clauses(contract_id)
    update_contract_meta(contract_id, status="analyzing")

    def stream_results():
        results = []
        for i, clause in enumerate(clauses):
            try:
                result = analyze_clause(clause, contract.get("contract_type", "Unknown"), metadata, profile=profile)
                result["clause_text"] = redact_pii(clause)
                result["clause_number"] = i + 1
                if lang != "en":
                    result = translate_clause_data(result, lang)
                results.append(result)
                save_clause(contract_id, result)
                yield f"data: {json.dumps(result)}\n\n"
            except Exception as e:
                error = {"error": str(e), "clause_number": i + 1}
                yield f"data: {json.dumps(error)}\n\n"

        clause_dicts = [{"clause_number": r.get("clause_number"), "clause_text": r.get("clause_text"), "category": r.get("category"), "risk_score": r.get("risk_score")} for r in results]
        try:
            index_contract_clauses(contract_id, clause_dicts)
        except Exception as e:
            print("index error", e)

        overall = compute_overall_score(results)
        update_contract(contract_id, overall, "complete")
        done = {"done": True, "overall_score": overall, "total_clauses": len(clauses)}
        yield f"data: {json.dumps(done)}\n\n"

    return StreamingResponse(stream_results(), media_type="text/event-stream")


class ChatQuery(BaseModel):
    query: str
    lang: str = "en"
    simpler: bool = False


@app.post("/chat/{contract_id}")
def chat_with_contract(contract_id: str, payload: ChatQuery):
    query = payload.query.strip()
    if payload.simpler:
        query = f"Explain even more simply, like I am 12: {query}"
    result = query_contract(contract_id, query)
    save_chat_turn(contract_id, "user", payload.query)
    answer = result.get("answer", "")
    if payload.lang != "en":
        answer = translate_text(answer, payload.lang)
        result["answer"] = answer
    save_chat_turn(contract_id, "assistant", answer)
    return result


@app.get("/glossary")
def get_glossary(lang: str = "en"):
    terms = []
    for t in get_all_glossary_terms():
        item = dict(t)
        if lang != "en":
            item["definition"] = translate_text(item["definition"], lang)
            item["analogy"] = translate_text(item["analogy"], lang)
        terms.append(item)
    return terms


class ComparePayload(BaseModel):
    doc_id_1: str
    doc_id_2: str


@app.post("/compare")
def compare_docs(payload: ComparePayload):
    c1 = get_clauses(payload.doc_id_1)
    c2 = get_clauses(payload.doc_id_2)
    if not c1 or not c2:
        raise HTTPException(status_code=400, detail="One or both documents have not been analyzed yet.")
    return compare_documents(c1, c2)


@app.get("/history")
def get_history(current_user: dict = Depends(get_current_user)):
    contracts = get_all_contracts(current_user["user_id"])
    for c in contracts:
        c["original_filename"] = c.get("display_name") or c.get("original_filename")
    return {"contracts": contracts}


@app.get("/report/{contract_id}")
def get_report(contract_id: str, current_user: dict = Depends(get_current_user)):
    contract = get_contract(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    clauses = get_clauses(contract_id)
    profile = get_profile(contract_id) or {}
    return {
        "contract_id": contract_id,
        "filename": contract.get("display_name") or contract.get("original_filename"),
        "overall_score": contract.get("overall_score", 0),
        "status": contract["status"],
        "contract_type": contract["contract_type"],
        "total_clauses": contract["total_clauses"],
        "results": clauses,
        "profile": profile,
        "privacy_note": "Personal names and numbers were not stored.",
    }


@app.get("/insights/{contract_id}")
def get_insights(contract_id: str, current_user: dict = Depends(get_current_user)):
    contract = get_contract(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract.get("status") != "complete":
        raise HTTPException(status_code=400, detail="Analysis not complete yet")
    clauses = get_clauses(contract_id)
    if not clauses:
        raise HTTPException(status_code=404, detail="No clauses found for this contract")
    insights = generate_insights(clauses, contract.get("contract_type", "Unknown"))
    return insights


@app.get("/smart-questions/{contract_id}")
def get_smart_questions(contract_id: str, current_user: dict = Depends(get_current_user)):
    contract = get_contract(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    contract_text = read_document(contract_id)
    clauses = get_clauses(contract_id)
    contract_type = contract.get("contract_type", "Unknown")

    # If clauses aren't stored in DB yet, check uploaded json cache
    if not clauses:
        cache_path = os.path.join(UPLOAD_DIR, f"{contract_id}.json")
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cache_data = json.load(f)
                    cached_clauses = cache_data.get("clauses", [])
                    clauses = [{"clause_number": i+1, "clause_text": c} for i, c in enumerate(cached_clauses)]
            except Exception:
                pass

    return generate_smart_questions(clauses, contract_type, contract_text)


class SmartVerdictPayload(BaseModel):
    answers: dict


@app.post("/smart-verdict/{contract_id}")
def create_smart_verdict(
    contract_id: str,
    payload: SmartVerdictPayload,
    current_user: dict = Depends(get_current_user)
):
    contract = get_contract(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    clauses = get_clauses(contract_id)
    if not clauses:
        cache_path = os.path.join(UPLOAD_DIR, f"{contract_id}.json")
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cache_data = json.load(f)
                    cached_clauses = cache_data.get("clauses", [])
                    clauses = [{"clause_number": i+1, "clause_text": c} for i, c in enumerate(cached_clauses)]
            except Exception:
                pass

    contract_type = contract.get("contract_type", "Unknown")
    verdict = generate_personalized_verdict(clauses, contract_type, payload.answers)

    # Save strictly to this contract's profile
    prof = get_profile(contract_id) or {}
    extra = prof.get("extra") or {}
    extra["smart_verdict"] = verdict
    extra["smart_answers"] = payload.answers
    
    save_profile(
        contract_id,
        prof.get("role") or current_user.get("role") or "everyday person",
        prof.get("worry") or current_user.get("worry") or "hidden risks",
        prof.get("language") or current_user.get("language") or "en",
        prof.get("question") or "Personalized affordability assessment",
        extra=extra
    )
    return verdict


@app.get("/smart-verdict/{contract_id}")
def get_smart_verdict(contract_id: str, current_user: dict = Depends(get_current_user)):
    prof = get_profile(contract_id)
    if not prof:
        return {"has_verdict": False}
    extra = prof.get("extra") or {}
    verdict = extra.get("smart_verdict")
    if not verdict:
        return {"has_verdict": False}
    return {
        "has_verdict": True,
        "verdict": verdict,
        "answers": extra.get("smart_answers", {}),
    }






@app.get("/report/{contract_id}/download")
def download_report(contract_id: str, current_user: dict = Depends(get_current_user)):
    contract = get_contract(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract["status"] != "complete":
        raise HTTPException(status_code=400, detail="Analysis not complete yet")
    output_path = os.path.join(UPLOAD_DIR, f"report_{contract_id[:8]}.pdf")
    generate_report(contract_id, output_path)
    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename=f"ClauseGuard_Report_{contract.get('display_name') or 'document'}.pdf",
    )


class RegisterBody(BaseModel):
    name: str
    age: int
    phone: str
    email: str
    password: str


class LoginBody(BaseModel):
    email: str
    password: str


class SetupBody(BaseModel):
    role: str
    worry: str
    language: str = "en"
    pin: str


class PinBody(BaseModel):
    pin: str


@app.post("/auth/register")
def auth_register(body: RegisterBody):
    result = register_user(body.name, body.age, body.phone, body.email, body.password)
    return {"success": True, "access_token": result["token"], "user": result["user"]}


@app.post("/auth/signup")
def auth_signup(body: RegisterBody):
    return auth_register(body)


@app.post("/auth/login")
def auth_login(body: LoginBody):
    result = login_user(body.email, body.password)
    return {"success": True, "access_token": result["token"], "user": result["user"]}


@app.get("/auth/me")
def auth_me(current_user: dict = Depends(get_current_user)):
    return current_user


@app.post("/auth/setup")
def auth_setup(body: SetupBody, current_user: dict = Depends(get_current_user)):
    user = complete_setup(current_user["user_id"], body.role, body.worry, body.language, body.pin)
    return {"success": True, "user": user}


@app.post("/vault/unlock")
def vault_unlock(body: PinBody, current_user: dict = Depends(get_current_user)):
    verify_vault_pin(current_user["user_id"], body.pin)
    return {"ok": True}
