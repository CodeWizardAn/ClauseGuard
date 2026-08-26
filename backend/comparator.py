import difflib

def get_similarity_score(text1: str, text2: str) -> float:
    matcher = difflib.SequenceMatcher(None, text1.lower(), text2.lower())
    return matcher.ratio()

def compare_documents(clauses_v1: list, clauses_v2: list) -> dict:
    """
    Compares two lists of clauses and categorizes changes using SequenceMatcher.
    """
    if not clauses_v1 or not clauses_v2:
        return {"error": "One or both documents have no clauses."}
        
    matched = []
    modified = []
    added = []
    removed = []
    
    v2_matched_indices = set()
    
    for i, c1 in enumerate(clauses_v1):
        best_score = 0
        best_idx = -1
        t1 = c1.get("clause_text", "")
        
        for j, c2 in enumerate(clauses_v2):
            if j in v2_matched_indices:
                continue
            
            t2 = c2.get("clause_text", "")
            score = get_similarity_score(t1, t2)
            
            if score > best_score:
                best_score = score
                best_idx = j
                
        if best_score > 0.95:
            matched.append({
                "v1_clause": c1,
                "v2_clause": clauses_v2[best_idx],
                "similarity": round(float(best_score), 3)
            })
            v2_matched_indices.add(best_idx)
        elif best_score > 0.65:
            # Modified
            c2 = clauses_v2[best_idx]
            
            # Risk shift calculation
            r1 = c1.get("risk_score", 0)
            r2 = c2.get("risk_score", 0)
            risk_shift = "Neutral"
            if r2 > r1 + 10:
                risk_shift = "Riskier"
            elif r2 < r1 - 10:
                risk_shift = "Safer"
                
            modified.append({
                "v1_clause": c1,
                "v2_clause": c2,
                "similarity": round(float(best_score), 3),
                "risk_shift": risk_shift
            })
            v2_matched_indices.add(best_idx)
        else:
            removed.append({
                "v1_clause": c1
            })
            
    for j, c2 in enumerate(clauses_v2):
        if j not in v2_matched_indices:
            added.append({
                "v2_clause": c2
            })
            
    return {
        "summary": {
            "total_v1": len(clauses_v1),
            "total_v2": len(clauses_v2),
            "matched": len(matched),
            "modified": len(modified),
            "added": len(added),
            "removed": len(removed)
        },
        "modified_clauses": modified,
        "added_clauses": added,
        "removed_clauses": removed
    }
