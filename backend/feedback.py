from database import save_feedback

def submit_feedback(clause_id: str, original_score: int, corrected_score: int, comment: str = None) -> dict:
    if not (1 <= corrected_score <= 100):
        raise ValueError("Corrected score must be between 1 and 100")

    if abs(corrected_score - original_score) < 5:
        raise ValueError("Corrected score must differ from original by at least 5 points")

    result = save_feedback(clause_id, original_score, corrected_score, comment)
    return {
        "success": True,
        "message": "Feedback submitted successfully",
        "feedback_id": result["id"],
        "score_change": corrected_score - original_score
    }

def get_feedback_stats() -> dict:
    return {
        "total_feedback": 0,
        "average_correction": 0,
        "most_corrected_direction": "none",
        "needs_recalibration": False
    }

def get_recalibration_prompt() -> str:
    return ""