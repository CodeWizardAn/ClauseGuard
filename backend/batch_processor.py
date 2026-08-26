import os
import uuid
import json
from fastapi import BackgroundTasks
from parser import extract_text
from analyzer import split_into_clauses
from classifier import classify_contract
from database import save_contract, get_contract, get_clauses
from job_queue import add_to_queue
from baseline_comparator import compare_against_baseline

def process_batch(
    files: list[dict],
    user_id: str,
    background_tasks: BackgroundTasks
) -> dict:
    batch_id = str(uuid.uuid4())
    batch_results = []

    for file_info in files:
        file_path = file_info["file_path"]
        filename = file_info["filename"]
        contract_id = str(uuid.uuid4())

        try:
            text = extract_text(file_path)
            clauses = split_into_clauses(text)
            classification = classify_contract(text)
            contract_type = classification["contract_type"]

            save_contract(
                contract_id,
                filename,
                len(clauses),
                contract_type,
                user_id,
                file_path
            )

            with open(f"uploads/{contract_id}.json", "w") as f:
                json.dump({"clauses": clauses}, f)

            add_to_queue(background_tasks, contract_id, clauses)

            batch_results.append({
                "contract_id": contract_id,
                "filename": filename,
                "contract_type": contract_type,
                "total_clauses": len(clauses),
                "confidence": classification["confidence"],
                "status": "queued"
            })

        except Exception as e:
            batch_results.append({
                "filename": filename,
                "status": "failed",
                "error": str(e)
            })

    with open(f"uploads/batch_{batch_id}.json", "w") as f:
        json.dump({
            "batch_id": batch_id,
            "user_id": user_id,
            "total_files": len(files),
            "contracts": batch_results
        }, f)

    return {
        "batch_id": batch_id,
        "total_files": len(files),
        "queued": len([r for r in batch_results if r["status"] == "queued"]),
        "failed": len([r for r in batch_results if r["status"] == "failed"]),
        "contracts": batch_results
    }

def get_batch_summary(batch_id: str) -> dict:
    batch_path = f"uploads/batch_{batch_id}.json"
    if not os.path.exists(batch_path):
        return None

    with open(batch_path) as f:
        batch = json.load(f)

    contracts = batch["contracts"]
    summary = []

    for contract_info in contracts:
        if "contract_id" not in contract_info:
            continue

        contract_id = contract_info["contract_id"]
        contract = get_contract(contract_id)

        if not contract:
            continue

        entry = {
            "contract_id": contract_id,
            "filename": contract_info["filename"],
            "contract_type": contract_info["contract_type"],
            "status": contract["status"],
            "overall_score": contract["overall_score"],
            "total_clauses": contract["total_clauses"]
        }

        if contract["status"] == "complete":
            clauses = get_clauses(contract_id)
            critical = len([c for c in clauses if c.get("severity") == "Critical"])
            high = len([c for c in clauses if c.get("severity") == "High"])
            entry["critical_clauses"] = critical
            entry["high_clauses"] = high
            baseline = compare_against_baseline(clauses, contract_info["contract_type"])
            entry["baseline_coverage"] = baseline["baseline_coverage"]
            entry["missing_clauses"] = baseline["missing_count"]

        summary.append(entry)

    summary.sort(key=lambda x: x.get("overall_score", 0), reverse=True)

    return {
        "batch_id": batch_id,
        "total_files": batch["total_files"],
        "contracts": summary,
        "riskiest_contract": summary[0] if summary else None
    }