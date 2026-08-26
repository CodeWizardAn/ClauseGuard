import json
import re

VALID_SEVERITIES = {"Critical", "High", "Medium", "Low", "Clean"}
VALID_CATEGORIES = {
    "Liability", "IP Ownership", "Termination", "Payment",
    "Confidentiality", "Indemnity", "Governing Law", "Force Majeure", "General"
}

SEVERITY_SCORE_RANGES = {
    "Critical": (76, 95),
    "High":     (56, 75),
    "Medium":   (36, 55),
    "Low":      (16, 35),
    "Clean":    (1,  15)
}

def validate_response(raw: str) -> dict:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"```json|```", "", cleaned).strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON from AI: {e}")

    errors = []

    if "risk_score" not in data:
        errors.append("missing risk_score")
    elif not isinstance(data["risk_score"], (int, float)):
        errors.append("risk_score must be a number")
    elif not (1 <= data["risk_score"] <= 100):
        errors.append("risk_score must be between 1 and 100")

    if "severity" not in data:
        errors.append("missing severity")
    elif data["severity"] not in VALID_SEVERITIES:
        errors.append(f"invalid severity: {data['severity']}")

    if "category" not in data:
        errors.append("missing category")
    elif data["category"] not in VALID_CATEGORIES:
        data["category"] = "General"

    if "explanation" not in data or not data["explanation"]:
        errors.append("missing explanation")

    if errors:
        raise ValueError(f"Validation errors: {', '.join(errors)}")

    data = fix_inconsistencies(data)
    data = sanitize(data)
    return data

def fix_inconsistencies(data: dict) -> dict:
    severity = data.get("severity")
    score = data.get("risk_score")

    if severity and score:
        valid_range = SEVERITY_SCORE_RANGES.get(severity)
        if valid_range:
            low, high = valid_range
            if not (low <= score <= high):
                data["risk_score"] = (low + high) // 2

    if data.get("severity") in {"Low", "Clean"} and data.get("rewrite"):
        data["rewrite"] = None

    if data.get("severity") in {"Critical", "High"} and not data.get("rewrite"):
        data["rewrite"] = "Please consult a legal professional to redraft this clause."

    return data

def sanitize(data: dict) -> dict:
    data["risk_score"] = int(data["risk_score"])

    if data.get("explanation"):
        data["explanation"] = data["explanation"].strip()[:500]

    if data.get("rewrite"):
        data["rewrite"] = data["rewrite"].strip()[:1000]

    return data


if __name__ == "__main__":
    print("Test 1 - valid response:")
    valid = json.dumps({
        "risk_score": 90,
        "severity": "Critical",
        "category": "Liability",
        "explanation": "Liability cap is dangerously low",
        "rewrite": "Liability shall not exceed total contract value"
    })
    print(validate_response(valid))

    print("\nTest 2 - inconsistent score and severity:")
    inconsistent = json.dumps({
        "risk_score": 20,
        "severity": "Critical",
        "category": "Payment",
        "explanation": "Payment terms are risky",
        "rewrite": "Pay within 45 days"
    })
    print(validate_response(inconsistent))

    print("\nTest 3 - missing fields:")
    try:
        missing = json.dumps({
            "risk_score": 80,
            "category": "Liability"
        })
        print(validate_response(missing))
    except ValueError as e:
        print(f"Caught error correctly: {e}")

    print("\nTest 4 - Low severity with rewrite (should remove rewrite):")
    low_with_rewrite = json.dumps({
        "risk_score": 15,
        "severity": "Low",
        "category": "General",
        "explanation": "Standard clause",
        "rewrite": "This should be removed"
    })
    print(validate_response(low_with_rewrite))