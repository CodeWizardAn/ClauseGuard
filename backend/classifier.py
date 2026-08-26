import os
from groq import Groq
from dotenv import load_dotenv
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

CONTRACT_TYPES = [
    "NDA",
    "Vendor Agreement",
    "Employment Contract",
    "Service Agreement",
    "Lease Agreement",
    "Loan Agreement",
    "Partnership Agreement",
    "Freelance Contract",
    "Software License Agreement",
    "Unknown"
]

RISK_WEIGHTS = {
    "NDA": {
        "Confidentiality": 1.8,
        "IP Ownership": 1.5,
        "Termination": 1.2,
        "Governing Law": 1.3,
        "Liability": 1.0,
        "General": 0.5
    },
    "Vendor Agreement": {
        "Payment": 1.8,
        "Liability": 1.6,
        "Termination": 1.5,
        "Indemnity": 1.4,
        "Force Majeure": 1.3,
        "IP Ownership": 1.2,
        "General": 0.5
    },
    "Employment Contract": {
        "IP Ownership": 1.8,
        "Termination": 1.6,
        "Confidentiality": 1.4,
        "Indemnity": 1.2,
        "Payment": 1.3,
        "General": 0.5
    },
    "Service Agreement": {
        "Payment": 1.7,
        "Liability": 1.6,
        "Termination": 1.4,
        "Indemnity": 1.3,
        "IP Ownership": 1.2,
        "General": 0.5
    },
    "Unknown": {
        "Liability": 1.3,
        "Payment": 1.3,
        "Termination": 1.3,
        "Confidentiality": 1.3,
        "IP Ownership": 1.3,
        "Indemnity": 1.3,
        "Governing Law": 1.3,
        "Force Majeure": 1.3,
        "General": 0.5
    }
}

def classify_contract(text: str) -> dict:
    sample = text[:2000]

    prompt = f"""You are a contract classification expert. Read the beginning of this contract and identify its type.

Contract text:
{sample}

Choose exactly one type from this list:
{', '.join(CONTRACT_TYPES)}

Return ONLY a JSON object, nothing else:
{{
    "contract_type": "<type from the list above>",
    "confidence": <number 0-100>,
    "reasoning": "<one sentence explaining why>"
}}"""

    try:
        from languages import FAST_MODEL
        response = client.chat.completions.create(
            model=FAST_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        raw = response.choices[0].message.content.strip()
        import re
        if raw.startswith("```"):
            raw = re.sub(r"```json|```", "", raw).strip()
        result = json.loads(raw)
        if result.get("contract_type") not in CONTRACT_TYPES:
            result["contract_type"] = "Unknown"
        return result
    except Exception:
        lower = text.lower()
        guessed = "Unknown"
        if any(w in lower for w in ["rent", "tenant", "landlord", "lease"]):
            guessed = "Lease Agreement"
        elif any(w in lower for w in ["loan", "interest", "borrower"]):
            guessed = "Loan Agreement"
        elif any(w in lower for w in ["terms of service", "terms of use"]):
            guessed = "Service Agreement"
        elif any(w in lower for w in ["employ", "salary", "employee"]):
            guessed = "Employment Contract"
        elif any(w in lower for w in ["nda", "confidential"]):
            guessed = "NDA"
        return {"contract_type": guessed, "confidence": 55, "reasoning": "Guessed from keywords"}

def get_risk_weights(contract_type: str) -> dict:
    return RISK_WEIGHTS.get(contract_type, RISK_WEIGHTS["Unknown"])


if __name__ == "__main__":
    from parser import extract_text

    test_files = ["sample.pdf", "test_contract.txt"]

    for file in test_files:
        if os.path.exists(file):
            print(f"\nClassifying: {file}")
            if file.endswith(".txt"):
                with open(file) as f:
                    text = f.read()
            else:
                text = extract_text(file)

            result = classify_contract(text)
            print(json.dumps(result, indent=2))
            print(f"Risk weights: {get_risk_weights(result['contract_type'])}")