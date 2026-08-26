import json
import time
import os
from analyzer import analyze_clause
from database import save_clause, update_contract, get_contract
from fastapi import BackgroundTasks


def analyze_with_retry(clause, contract_type, metadata, profile=None, max_retries=3):
    for attempt in range(max_retries):
        try:
            return analyze_clause(clause, contract_type, metadata, profile=profile)
        except Exception as e:
            if "rate_limit" in str(e).lower() or "429" in str(e):
                wait_time = (attempt + 1) * 10
                print(f"Rate limit hit, waiting {wait_time}s before retry {attempt + 1}/{max_retries}...")
                time.sleep(wait_time)
            else:
                raise e
    raise Exception("Max retries exceeded after 3 attempts")


def process_contract(contract_id: str, clauses: list[str], contract_type: str = "Unknown", metadata: dict = None, profile: dict = None):
    print(f"Starting background analysis for {contract_id}, {len(clauses)} clauses")
    try:
        results = []
        for i, clause in enumerate(clauses):
            print(f"Analyzing clause {i+1}/{len(clauses)}")
            try:
                result = analyze_with_retry(clause, contract_type, metadata, profile=profile)
                result["clause_text"] = clause[:300]
                result["clause_number"] = i + 1
                results.append(result)
                save_clause(contract_id, result)
                time.sleep(2)
            except Exception as e:
                print(f"Error analyzing clause {i+1}: {e}")
                error_result = {
                    "clause_number": i + 1,
                    "clause_text": clause[:300],
                    "risk_score": 50,
                    "severity": "Medium",
                    "category": "General",
                    "explanation": "Could not analyze this clause automatically.",
                    "rewrite": None,
                    "similarity_match": {"matched": False}
                }
                results.append(error_result)
                save_clause(contract_id, error_result)

        scores = [int(r.get("risk_score") or 0) for r in results if r.get("risk_score") is not None]
        overall = round(sum(scores) / len(scores)) if scores else 0
        overall = max(0, min(100, overall))
        update_contract(contract_id, overall, "complete")
        print(f"Contract {contract_id} analysis complete. Overall score: {overall}")

    except Exception as e:
        print(f"Fatal error processing contract {contract_id}: {e}")
        update_contract(contract_id, 0, "failed")


def add_to_queue(background_tasks: BackgroundTasks, contract_id: str, clauses: list[str], contract_type: str = "Unknown", metadata: dict = None, profile: dict = None):
    background_tasks.add_task(process_contract, contract_id, clauses, contract_type, metadata, profile)
    return {"queued": True, "contract_id": contract_id}