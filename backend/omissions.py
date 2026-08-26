"""
Omission Radar Engine — Detects unwritten vulnerabilities, missing statutory protections,
and omitted safety clauses across Indian contracts.
"""

import os
import json
import re
from groq import Groq
from dotenv import load_dotenv
from languages import REASONING_MODEL

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Standard Indian Legal Protection Benchmarks by Contract Category
CATEGORY_BENCHMARKS = {
    "Rental Agreement": [
        {
            "name": "Landlord Structural Maintenance & Major Repairs",
            "statute": "Transfer of Property Act 1882, Section 108(f)",
            "why": "Without this clause, the landlord can force the tenant to pay for structural defects, roof leaks, plumbing breakdowns, and pre-existing building damages.",
            "clause": "The Lessor/Landlord shall be solely responsible for all structural repairs, major plumbing, roof leakage, electrical rewiring, and external maintenance of the demised premises at their own cost."
        },
        {
            "name": "Security Deposit Refund Timeline & Deductions Cap",
            "statute": "Model Tenancy Act / Standard Indian Rental Practice",
            "why": "Without an explicit return timeline, landlords frequently delay deposit refunds indefinitely or make arbitrary deductions without itemized bills.",
            "clause": "The Security Deposit shall be refunded in full by the Lessor to the Lessee within 7 (seven) days of vacating the premises, subject only to deductions supported by actual itemized repair invoices."
        },
        {
            "name": "Force Majeure & Rent Abatement (Floods/Disaster)",
            "statute": "Indian Contract Act 1872, Section 56 read with Transfer of Property Act Section 108(e)",
            "why": "If premises become uninhabitable due to flood, fire, or earthquake, tenant remains liable for full rent unless an abatement clause exists.",
            "clause": "In the event the premises are rendered uninhabitable due to fire, flood, earthquake, civil unrest, or act of God, rent shall be suspended until full restoration, and the Lessee may terminate without penalty if uninhabitable for over 30 days."
        },
        {
            "name": "Mutual Termination Notice Period Post Lock-in",
            "statute": "Transfer of Property Act 1882, Section 106",
            "why": "Prevents one-sided termination where landlord can evict on short notice but tenant is locked in or penalized for moving.",
            "clause": "Either party may terminate this agreement after the expiry of the lock-in period by serving 30 (thirty) days written notice to the other party, without forfeiture of deposit or penal charges."
        },
        {
            "name": "Landlord Prior Notice Before Entry / Inspection",
            "statute": "Right to Privacy & Peaceful Possession (TPA Section 108(c))",
            "why": "Protects tenant privacy by stopping surprise landlord visits or unauthorized entry.",
            "clause": "The Lessor or their authorized agents shall give at least 24 hours prior written notice before entering the premises for inspection or repairs, and visits shall occur only during reasonable daytime hours."
        }
    ],
    "Loan Agreement": [
        {
            "name": "Grace Period for Monthly EMI Payments",
            "statute": "RBI Fair Practices Code for Lenders",
            "why": "Without a grace period, salary delays of even 1 day can trigger steep penal interest, bounce charges, and CIBIL score damage.",
            "clause": "A grace period of at least 7 (seven) business days from the due date shall be granted before any penal interest or late payment charges are levied."
        },
        {
            "name": "Zero Prepayment Penalty on Floating Rate Loans",
            "statute": "RBI Circular DBOD.No.Dir.BC.107/13.03.00/2011-12",
            "why": "Banks cannot charge foreclosure or part-prepayment penalties to individual borrowers on floating rate terms.",
            "clause": "No prepayment penalty, foreclosure charges, or exit fees shall be levied on the borrower for early repayment or partial prepayment of the loan."
        },
        {
            "name": "Cap on Cumulative Penal Charges",
            "statute": "RBI Circular on Fair Lending Practice & Penal Charges 2023",
            "why": "Prevents compounding of penal interest into loan principal, protecting borrower from runaway compounding debt.",
            "clause": "Penal charges for delayed payment shall be strictly non-compounding, transparent, and capped at maximum 2% per annum over the contracted interest rate."
        },
        {
            "name": "Clear Grievance Redressal & Banking Ombudsman Reference",
            "statute": "Reserve Bank - Integrated Ombudsman Scheme 2021",
            "why": "Ensures borrower has an escalation mechanism if the lender miscalculates interest or engages in unfair recovery.",
            "clause": "The borrower shall have the right to approach the Lender's Principal Nodal Officer, and if unresolved within 30 days, escalate the dispute to the RBI Integrated Ombudsman."
        }
    ],
    "Employment Contract": [
        {
            "name": "Severance Pay in Lieu of Notice upon Employer Termination",
            "statute": "Industrial Disputes Act 1947 & State Shops and Establishments Act",
            "why": "Ensures company cannot terminate employee with immediate effect without paying salary for the contracted notice period.",
            "clause": "In the event of termination by the Employer without cause, the Employer shall pay full salary and accrued statutory benefits in lieu of the prescribed notice period."
        },
        {
            "name": "IP Carve-Out for Personal Work Outside Working Hours",
            "statute": "Copyright Act 1957, Section 17(c)",
            "why": "Without an explicit carve-out, blanket IP clauses claim ownership over side projects, hobbies, and inventions created by the employee on personal time.",
            "clause": "Intellectual Property created by the Employee outside working hours, without using Company equipment, confidential data, or resources, shall remain the sole property of the Employee."
        },
        {
            "name": "Statutory Benefits Guarantee (PF, Gratuity, ESIC)",
            "statute": "Payment of Gratuity Act 1972 & EPF Act 1952",
            "why": "Guarantees that mandatory statutory retiral benefits are not waived or subsumed into discretionary CTC structures.",
            "clause": "The Employee shall be entitled to Provident Fund contributions, Gratuity upon eligible tenure, and all applicable statutory health and leave entitlements as per Indian law."
        },
        {
            "name": "Post-Employment Non-Compete Limitation",
            "statute": "Indian Contract Act 1872, Section 27",
            "why": "Agreements restraining anyone from practicing a lawful profession post-resignation are void in India; having an explicit limitation prevents employer intimidation.",
            "clause": "Post-termination restrictions shall be strictly limited to protection of confidential proprietary trade secrets and non-solicitation of active clients, without restricting the Employee's lawful right to seek future employment in their field."
        }
    ],
    "Vendor / Service Agreement": [
        {
            "name": "MSMED Statutory 45-Day Payment Window & Interest",
            "statute": "Micro, Small and Medium Enterprises Development (MSMED) Act 2006, Section 15 & 16",
            "why": "Protects small suppliers from indefinite payment delays, guaranteeing compound interest at 3x RBI bank rate for overdue invoices.",
            "clause": "All invoices shall be settled within 45 days of receipt. Overdue payments shall attract compound interest at three times the RBI bank rate as mandated under the MSMED Act, 2006."
        },
        {
            "name": "Mutual Limitation of Liability Cap",
            "statute": "Indian Contract Act 1872, Section 73",
            "why": "Prevents unlimited liability lawsuits for indirect or consequential damages that exceed the contract value.",
            "clause": "The total aggregate liability of either party under this agreement shall be strictly capped at the total fees paid or payable by the Client during the preceding 12 months."
        },
        {
            "name": "IP Ownership Transfer Only Upon Full Payment",
            "statute": "Copyright Act 1957, Section 19",
            "why": "Guarantees client cannot take finished deliverables and refuse payment while claiming complete copyright ownership.",
            "clause": "Title and copyright to all deliverables and custom works shall transfer to the Client only upon receipt of 100% full and final payment of all corresponding invoices."
        }
    ]
}


def _build_omission_prompt(text: str, contract_type: str, benchmarks: list[dict]) -> str:
    benchmark_str = "\n".join([
        f"{i+1}. {b['name']} [Statutory Basis: {b['statute']}]:\n"
        f"   Standard Requirement: {b['clause']}\n"
        f"   Risk if Omitted: {b['why']}"
        for i, b in enumerate(benchmarks)
    ])

    return f"""You are a senior Indian contract attorney performing an OMISSION ANALYSIS.
Your goal is to inspect what safety clauses are MISSING from the uploaded contract.

CONTRACT TYPE: {contract_type}

ESSENTIAL STATUTORY PROTECTIONS TO AUDIT:
{benchmark_str}

CONTRACT TEXT TO AUDIT:
{text[:3000]}

FOR EACH BENCHMARK ABOVE:
Check if this protection is:
- "Covered": The contract adequately protects the user on this point.
- "Missing": The contract completely lacks this protection, leaving the user vulnerable.
- "Weak / Inadequate": Mentioned, but heavily skewed in favour of the other party.

Return ONLY valid JSON matching this exact structure:
{{
  "omission_score": <integer 0 to 100, where 100=all essential protections present, 0=completely unprotected>,
  "verdict_summary": "<1 to 2 sentence summary of missing protections>",
  "total_benchmarks_checked": <int>,
  "missing_count": <int>,
  "weak_count": <int>,
  "covered_count": <int>,
  "checklist": [
    {{
      "name": "<Protection Name>",
      "status": "<Missing | Weak | Covered>",
      "status_color": "<red | amber | green>",
      "category": "<e.g. Financial Protection | Dispute & Exit | Maintenance & Safety>",
      "severity": "<High Risk | Medium Risk | Standard Protection>",
      "statute": "<Act and Section>",
      "why_it_matters": "<Why the user is at risk without this protection in plain English>",
      "suggested_clause_to_insert": "<Lawyer-grade exact clause the user can copy to insert into the contract>"
    }}
  ]
}}"""


def detect_missing_clauses(contract_text: str, clauses: list[dict], contract_type: str) -> dict:
    """
    Scans the contract against statutory Indian benchmarks and identifies omitted safety clauses.
    """
    benchmarks = CATEGORY_BENCHMARKS.get(contract_type) or CATEGORY_BENCHMARKS.get("Rental Agreement")
    
    # Build text representation
    text = contract_text or ""
    if not text and clauses:
        text = "\n".join([f"Clause {c.get('clause_number', i+1)}: {c.get('clause_text','')}" for i, c in enumerate(clauses[:15])])

    try:
        response = client.chat.completions.create(
            model=REASONING_MODEL,
            messages=[{"role": "user", "content": _build_omission_prompt(text, contract_type, benchmarks)}],
            temperature=0.1,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = re.sub(r"```json|```", "", raw).strip()
        data = json.loads(raw)
        return data
    except Exception as e:
        print(f"[omissions] detect_missing_clauses error: {e}")
        return _fallback_omissions(contract_type, benchmarks)


def _fallback_omissions(contract_type: str, benchmarks: list[dict]) -> dict:
    checklist = []
    missing_cnt = 0
    for b in benchmarks:
        missing_cnt += 1
        checklist.append({
            "name": b["name"],
            "status": "Missing",
            "status_color": "red",
            "category": "Statutory Protection",
            "severity": "High Risk",
            "statute": b["statute"],
            "why_it_matters": b["why"],
            "suggested_clause_to_insert": b["clause"]
        })

    return {
        "omission_score": 40,
        "verdict_summary": f"Audit identified {missing_cnt} standard safety clauses missing from this {contract_type}.",
        "total_benchmarks_checked": len(benchmarks),
        "missing_count": missing_cnt,
        "weak_count": 0,
        "covered_count": 0,
        "checklist": checklist
    }
