"""
Smart Personalized Context Engine for ClauseGuard.

1. Reads the contract and extracts specific financial obligations, commitments, location, and constraints.
2. Dynamically generates smart, contract-specific questions tailored to this specific document
   (e.g., asking monthly salary, current city, dependents for a loan or rent agreement).
3. Evaluates user answers against contract commitments to produce a deeply personalized verdict
   (e.g., "With your ₹20,000 salary in Kalyan, this ₹1,00,000/mo Bandra flat loan is 500% of your income — completely unaffordable").
"""

import os
import json
import re
from groq import Groq
from dotenv import load_dotenv
from languages import REASONING_MODEL, FAST_MODEL

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_smart_questions(clauses: list[dict], contract_type: str, contract_text: str = "") -> dict:
    """
    Extracts key contract numbers/terms and generates 3-5 hyper-relevant
    questions for the user's specific context on THIS document.
    """
    # Build a concise contract snapshot for the LLM
    text_preview = ""
    if contract_text:
        text_preview = contract_text[:2500]
    elif clauses:
        text_preview = "\n".join([f"- Part {c.get('clause_number', i+1)}: {c.get('clause_text', '')[:200]}" for i, c in enumerate(clauses[:10])])

    prompt = f"""You are an expert contract advisor in India.
Analyze this contract and identify:
1. Exact financial obligations (amounts in INR, EMI, rent, deposits, penalties, payment terms).
2. Tenure/duration, location/premises mentioned, lock-in period, or work requirements.
3. The 3 to 5 most important PERSONAL and FINANCIAL questions you must ask the reader to determine if THIS specific contract is safe and affordable for their real life.

CONTRACT TYPE: {contract_type}

CONTRACT PREVIEW:
{text_preview}

Examples of smart questions based on contract:
- If Loan/Mortgage with high EMI: ask monthly take-home salary, current city/suburb, existing EMIs, number of dependents.
- If Rental/Lease in a specific city/locality: ask monthly income, current residential city/distance to work, family size, planned duration of stay.
- If Employment agreement with lock-in/notice: ask current CTC, notice period flexibility, career plans.
- If Vendor/Freelancer contract: ask monthly business turnover, cash flow runway, capacity to wait for payment.

Return ONLY valid JSON matching this exact structure:
{{
  "contract_summary": {{
    "primary_obligation": "<e.g., ₹1,00,000/month EMI or ₹45,000/month rent or 90-day payment term>",
    "tenure": "<e.g., 20 years or 11 months or 2 years>",
    "location": "<e.g., Bandra, Mumbai or Not specified>",
    "key_risk_factor": "<1-sentence biggest burden in this contract>"
  }},
  "detected_badges": [
    {{"label": "Monthly Obligation", "value": "<e.g., ₹1,00,000/mo>"}},
    {{"label": "Tenure / Duration", "value": "<e.g., 20 Years>"}},
    {{"label": "Contract Category", "value": "{contract_type}"}}
  ],
  "questions": [
    {{
      "id": "monthly_income",
      "question": "<Specific question, e.g. What is your net monthly take-home salary (in ₹)?>",
      "subtitle": "<Why we ask, e.g. To check if the ₹1,00,000 monthly EMI is within the safe 40% income limit>",
      "type": "currency",
      "placeholder": "e.g. 25000",
      "required": true
    }},
    {{
      "id": "current_city",
      "question": "<e.g. Which city/area do you currently live in?>",
      "subtitle": "<e.g. To evaluate standard cost of living and location affordability>",
      "type": "text",
      "placeholder": "e.g. Kalyan, Thane, Pune",
      "required": true
    }},
    {{
      "id": "dependents",
      "question": "<e.g. How many people depend on your income?>",
      "subtitle": "<e.g. To estimate household essential expenses>",
      "type": "number",
      "placeholder": "e.g. 2",
      "required": false
    }},
    {{
      "id": "existing_emis",
      "question": "<e.g. Total existing monthly EMIs or fixed debts (in ₹)?>",
      "subtitle": "<e.g. To calculate total debt burden>",
      "type": "currency",
      "placeholder": "e.g. 3000 (0 if none)",
      "required": false
    }}
  ]
}}"""

    try:
        response = client.chat.completions.create(
            model=FAST_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = re.sub(r"```json|```", "", raw).strip()
        data = json.loads(raw)
        return data
    except Exception as e:
        print(f"[smart_context] generate_smart_questions error: {e}")
        return _fallback_questions(contract_type)


def generate_personalized_verdict(
    clauses: list[dict],
    contract_type: str,
    user_answers: dict,
    contract_summary: dict = None,
) -> dict:
    """
    Evaluates the user's specific answers strictly against the current contract clauses
    and gives a deep, tailored financial & situational verdict.
    """
    top_clauses = sorted(clauses, key=lambda c: c.get("risk_score", 0), reverse=True)[:5] if clauses else []
    clause_brief = "\n".join([
        f"- Part {c.get('clause_number', i+1)} ({c.get('category','General')} Risk {c.get('risk_score',50)}/100): {c.get('plain_summary', c.get('clause_text','')[:150])}"
        for i, c in enumerate(top_clauses)
    ])

    answers_str = "\n".join([f"- {k}: {v}" for k, v in user_answers.items() if v is not None and str(v).strip()])



    prompt = f"""You are a blunt, deeply caring legal & financial advisor in India.
Your client uploaded a {contract_type}.
You asked them personal questions, and here are their exact answers:

USER'S PERSONAL PROFILE & ANSWERS:
{answers_str}

CONTRACT KEY OBLIGATIONS & HIGH-RISK CLAUSES:
{clause_brief}

YOUR TASK:
Provide a completely personalized, number-driven affordability and risk assessment for THIS specific person.

CRITICAL INSTRUCTIONS:
1. Do direct math: Compare their stated salary/funds with the contract obligations (EMI, rent, penalties).
   For example: If they earn ₹20,000 in Kalyan and the flat/loan requires ₹1,00,000/month in Bandra, call out that this is 500% of their income, impossible to sustain, and would bankrupt them in month 1.
2. Consider location reality: Mention their specific city/neighborhood vs the contract reality (cost of living, travel costs, realistic local rental/home prices in their area).
3. Factor in family & dependents: Calculate if remaining disposable income covers food, school, emergencies.
4. Give realistic alternative recommendations: Suggest what price range or locations they SHOULD look for instead, or how much their income would need to be.

Return ONLY valid JSON matching this exact structure:
{{
  "verdict_title": "<Concise punchy title, e.g. Extremely Unaffordable for Your Financial Situation | Proceed with Extreme Caution | Comfortable & Affordable for You>",
  "verdict_badge": "<Extreme Risk | High Risk | Moderate Caution | Affordable & Safe>",
  "verdict_badge_color": "<red | orange | yellow | green>",
  "affordability_score": <integer from 0 to 100, where 0=financial suicide, 100=easily affordable>,
  "monthly_math": {{
    "income": "<Keep very short: e.g. ₹20,000 / month>",
    "contract_obligation": "<Keep very short: e.g. ₹1,00,000 / month>",
    "ratio_pct": "<Keep very short: e.g. 500% (Safe max: 40%)>",
    "disposable_after_costs": "<Keep very short: e.g. -₹95,000 / mo deficit>"
  }},
  "personalized_story": "<2 to 3 paragraphs of clear, direct, empathetic analysis referencing their specific city, income, family situation, and contract terms. Explain exactly what will happen if they sign. Put detailed explanations here.>",

  "specific_warnings": [
    "<Bullet warning 1 directly referencing their numbers/city>",
    "<Bullet warning 2 referencing contract risk clause and their situation>",
    "<Bullet warning 3 referencing legal/financial consequence>"
  ],
  "actionable_alternatives": [
    "<Concrete alternative 1: e.g. Safe budget range or realistic areas>",
    "<Concrete alternative 2: e.g. Co-borrower or negotiation limit>",
    "<Concrete alternative 3: e.g. Essential clause changes before signing>"
  ],
  "negotiation_checklist": [
    "<Specific counter-proposal 1>",
    "<Specific counter-proposal 2>"
  ]
}}"""

    try:
        response = client.chat.completions.create(
            model=REASONING_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = re.sub(r"```json|```", "", raw).strip()
        data = json.loads(raw)
        return data
    except Exception as e:
        print(f"[smart_context] generate_personalized_verdict error: {e}")
        return _fallback_verdict(user_answers, contract_type)


def _fallback_questions(contract_type: str) -> dict:
    return {
        "contract_summary": {
            "primary_obligation": "Standard contract commitments",
            "tenure": "Per agreement terms",
            "location": "India",
            "key_risk_factor": "Financial and legal commitments",
        },
        "detected_badges": [
            {"label": "Contract Type", "value": contract_type or "Legal Agreement"},
            {"label": "Jurisdiction", "value": "Indian Law"},
        ],
        "questions": [
            {
                "id": "monthly_income",
                "question": "What is your net monthly take-home salary or income (in ₹)?",
                "subtitle": "To calculate your debt-to-income and affordability ratios",
                "type": "currency",
                "placeholder": "e.g. 45000",
                "required": True,
            },
            {
                "id": "current_city",
                "question": "Which city or area do you currently reside in?",
                "subtitle": "To estimate local cost of living and realistic alternatives",
                "type": "text",
                "placeholder": "e.g. Kalyan, Mumbai, Pune, Bengaluru",
                "required": True,
            },
            {
                "id": "dependents",
                "question": "How many family members rely on your income?",
                "subtitle": "To estimate your essential monthly living buffer",
                "type": "number",
                "placeholder": "e.g. 2",
                "required": False,
            },
            {
                "id": "existing_debts",
                "question": "Total existing monthly loan EMIs or debts (in ₹)?",
                "subtitle": "To verify your overall monthly cash flow",
                "type": "currency",
                "placeholder": "e.g. 5000 (0 if none)",
                "required": False,
            },
        ],
    }


def _fallback_verdict(user_answers: dict, contract_type: str) -> dict:
    income = user_answers.get("monthly_income") or user_answers.get("income") or "Not provided"
    city = user_answers.get("current_city") or user_answers.get("city") or "your city"
    return {
        "verdict_title": f"Personalized Assessment for {contract_type}",
        "verdict_badge": "Moderate Caution",
        "verdict_badge_color": "yellow",
        "affordability_score": 50,
        "monthly_math": {
            "income": f"₹{income}" if str(income).isdigit() else str(income),
            "contract_obligation": "Per contract terms",
            "ratio_pct": "Needs manual verification",
            "disposable_after_costs": "Evaluate against monthly expenses",
        },
        "personalized_story": (
            f"Based on your profile living in {city} with a stated income of ₹{income}, "
            f"signing this {contract_type} requires careful verification of your fixed monthly expenses and savings buffers. "
            "Ensure total debt commitments stay below 40% of your net income."
        ),
        "specific_warnings": [
            f"Check if the payment terms align with your cash flow in {city}.",
            "Review penalty clauses for delayed payments or early termination.",
        ],
        "actionable_alternatives": [
            "Request a cap on liability and dispute resolution in your local jurisdiction.",
            "Maintain at least 3-6 months of emergency buffer in savings.",
        ],
        "negotiation_checklist": [
            "Ask for 30 days cure period for any payment delays.",
            "Limit termination lock-in to standard duration.",
        ],
    }
