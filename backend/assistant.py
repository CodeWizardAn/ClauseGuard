"""
ClauseGuard Site-Wide AI Assistant & Legal Jargon Simplifier Engine.
Provides comprehensive guidance on:
1. Website navigation, features, document upload, vault access, calculator usage.
2. Simplifying complex legal jargon, clauses, and administrative terminology.
3. Indian legal benchmarks, tenant rights, borrower protections, employee rights, and consumer laws.
"""

import os
import re
from typing import List, Dict
from glossary import GLOSSARY
from indian_law import INDIAN_LAW_DB

# Optional Groq client initialization
groq_client = None
try:
    from groq import Groq
    api_key = os.getenv("GROQ_API_KEY")
    if api_key:
        groq_client = Groq(api_key=api_key)
except Exception:
    groq_client = None

SITE_GUIDE = """
=== CLAUSEGUARD PLATFORM CAPABILITIES & NAVIGATION GUIDE ===
1. AUDIT CONTRACT (/analyze):
   - Upload any agreement in PDF, DOCX, TXT, or scanned image format.
   - Client-side zero-knowledge PII redaction erases names, phone numbers, and IDs before storage.
   - Extracts obligations, computes overall risk score, flags High/Medium/Low risk clauses.
   - Includes 4 instant one-click sample benchmark contracts to test right away.
   
2. SMART AFFORDABILITY CALCULATOR (/calculator):
   - Standalone financial stress-tester. No document upload required!
   - Calculates Debt-to-Income (DTI) %, disposable monthly savings buffer, and safe rent/EMI limits.
   - Categorizes health: Safe & Affordable (<35% DTI), Moderate Strain (35-45% DTI), High Risk (>45% DTI).

3. ENCRYPTED DOCUMENT VAULT (/vault):
   - Secure private locker for all sanitized contract audit reports.
   - Protected by your personal 4-digit PIN. Zero personal data leakage.

4. USER PROFILE & SECURITY (/profile):
   - Upload custom profile photo.
   - Change Account Password (requires current password).
   - Change Vault 4-Digit PIN (requires current PIN).

5. DOCUMENT DRAFT COMPARISON (/comparison):
   - Compare two versions (V1 vs V2) of a contract side-by-side to highlight redlines, sneaky added clauses, or escalated risks.

6. LEGAL GLOSSARY (/glossary):
   - Searchable plain-language dictionary of complex legal terms with real-world examples.
"""

SYSTEM_PROMPT = f"""You are the official ClauseGuard AI Assistant & Legal Intelligence Guide.
Your mission is to assist users in two key areas:

1. WEBSITE GUIDE & FEATURE EXPLORER:
- Help users navigate ClauseGuard, explain how features work (Document Scanner, Affordability Calculator, PIN Vault, Comparison Diff, Profile Settings).
- Provide step-by-step instructions on how to upload files, stress-test income, lock vault, etc.

2. LEGAL JARGON & INDIAN CONSUMER/CONTRACT LAW INTELLIGENCE:
- Simplify legal terms and dense legalese into plain, conversational language with relatable real-world examples.
- Explain tenant rights, loan penalties, employment non-competes, dark patterns, builder delays, and consumer protections grounded in Indian legal reality.
- Maintain an encouraging, protective, and empowering tone.
- Clarify that you provide educational guidance and legal literacy aid, not formal attorney representation.

{SITE_GUIDE}
"""

def generate_assistant_response(query: str, chat_history: List[Dict] = None) -> str:
    query_clean = (query or "").strip()
    if not query_clean:
        return "Hello! I am your ClauseGuard Copilot. How can I help you today? You can ask me how to use any website feature, or ask me to explain any complex legal term in plain words!"

    # Search local glossary & statutory knowledge for instant context enrichment
    context_snippets = []
    q_lower = query_clean.lower()
    
    # Check Glossary matches
    for term, data in GLOSSARY.items():
        if term in q_lower or data.get("term", "").lower() in q_lower:
            context_snippets.append(f"Glossary [{data.get('term')}]: {data.get('definition')} Example: {data.get('analogy', '')}")

    # Check Statutory benchmarks
    for statute in INDIAN_LAW_DB:
        kw_matches = [kw for kw in statute.get("keywords", []) if kw in q_lower]
        if kw_matches or statute.get("concept", "").lower() in q_lower or statute.get("act", "").lower() in q_lower:
            context_snippets.append(f"Legal Benchmark ({statute.get('act')} - {statute.get('section')}): {statute.get('concept')} - {statute.get('text')}")

    context_str = "\n".join(context_snippets[:3]) if context_snippets else "Apply general plain-language Indian contract and consumer rights principles."

    if groq_client:
        try:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            if chat_history:
                for turn in chat_history[-6:]:
                    role = "user" if turn.get("sender") == "user" else "assistant"
                    messages.append({"role": role, "content": turn.get("text", "")})
            
            messages.append({
                "role": "user",
                "content": f"User Question: {query_clean}\n\nRelevant Platform/Legal Knowledge:\n{context_str}\n\nPlease provide a helpful, concise, well-structured, and empathetic response."
            })

            completion = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
                temperature=0.3,
                max_tokens=600,
            )

            if completion.choices and completion.choices[0].message.content:
                return completion.choices[0].message.content.strip()
        except Exception:
            pass

    # High-Quality Fallback Response
    return _fallback_assistant_reply(query_clean, context_snippets)


def _fallback_assistant_reply(query: str, snippets: List[str]) -> str:
    q = query.lower()

    if any(w in q for w in ["upload", "audit", "scan", "analyze", "document"]):
        return (
            "📁 **How to Audit a Contract on ClauseGuard:**\n\n"
            "1. Click **'Scan Contract'** or **'Audit Document'** in the top navigation bar.\n"
            "2. Drag and drop your agreement (PDF, DOCX, TXT, or image) into the upload box, or click to browse.\n"
            "3. Personal names, phone numbers, and IDs are **automatically erased** client-side before processing.\n"
            "4. You'll instantly receive a **plain-language breakdown**, risk score (High/Medium/Low), and missing protection alerts!"
        )

    if any(w in q for w in ["calculator", "affordability", "emi", "salary", "rent", "dti"]):
        return (
            "🧮 **How to Use the Smart Affordability Calculator:**\n\n"
            "1. Click **'Affordability'** in the top navigation bar.\n"
            "2. Enter your **Monthly In-Hand Salary** and target **Monthly Rent / Loan EMI**.\n"
            "3. Pick your city living cost tier (Tier 1 Metro, Tier 2, or Tier 3).\n"
            "4. The calculator instantly evaluates your **Debt-to-Income (DTI) %**, tells you if it's safe (under 35%), and shows your estimated monthly savings buffer!"
        )

    if any(w in q for w in ["vault", "pin", "lock", "decrypt", "password"]):
        return (
            "🔒 **How the Encrypted Vault & PIN Work:**\n\n"
            "- The **Document Vault** (`/vault`) securely stores your past document analyses.\n"
            "- It is protected by your **4-Digit PIN** created during signup.\n"
            "- If you ever need to change your PIN or login password, visit **'Account Settings'** (`/profile`)."
        )

    if any(w in q for w in ["compare", "comparison", "draft", "version", "diff"]):
        return (
            "⚖️ **How to Compare Contract Drafts:**\n\n"
            "1. Visit the **Comparison Diff** tool (`/comparison`).\n"
            "2. Upload Draft 1 (Original) and Draft 2 (Revised).\n"
            "3. The tool highlights redline changes, added clauses, removed rights, and changes in risk scores."
        )

    if snippets:
        return (
            f"Here is the plain-language legal explanation:\n\n"
            f"{snippets[0]}\n\n"
            f"💡 *Have more questions? Feel free to ask about any clause, penalty, or website feature!*"
        )

    return (
        "I'm here to help! You can ask me:\n\n"
        "• **How to use ClauseGuard** (e.g. *'How do I test my rent affordability?'*, *'How do I audit a lease?'*)\n"
        "• **Legal term simplifications** (e.g. *'What is Indemnity?'*, *'What is a Lock-in period?'*, *'Can my landlord deduct my deposit?'*)\n"
        "• **Indian consumer & tenant rights** across loans, rentals, employment, and MSMEs."
    )
