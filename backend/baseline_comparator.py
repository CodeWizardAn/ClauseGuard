import difflib

# In a real system, this would come from a database of standard templates
BASELINE_TEMPLATES = {
    "Rental Agreement": [
        "The tenant shall pay rent on or before the 5th of every month.",
        "The landlord shall maintain the structural integrity of the premises.",
        "The security deposit shall be equivalent to two months' rent."
    ],
    "Terms of Service": [
        "We reserve the right to terminate your account for violations.",
        "Your data will not be sold to third parties without consent."
    ]
}

def compare_against_baseline(clauses: list, contract_type: str) -> dict:
    """
    Compares the uploaded contract clauses against standard baseline templates using difflib.
    """
    baselines = BASELINE_TEMPLATES.get(contract_type, [])
    if not baselines:
        return {"matched": [], "missing_standard_clauses": []}
        
    matched = []
    matched_baseline_indices = set()
    
    for clause in clauses:
        clause_text = clause.lower()
        
        best_score = 0
        best_idx = -1
        
        for i, baseline in enumerate(baselines):
            score = difflib.SequenceMatcher(None, clause_text, baseline.lower()).ratio()
            if score > best_score:
                best_score = score
                best_idx = i
                
        if best_score > 0.6:
            matched.append({
                "clause_text": clause,
                "matched_baseline": baselines[best_idx],
                "similarity_score": round(best_score, 3)
            })
            matched_baseline_indices.add(best_idx)
            
    missing = [b for i, b in enumerate(baselines) if i not in matched_baseline_indices]
    
    return {
        "matched": matched,
        "missing_standard_clauses": missing
    }