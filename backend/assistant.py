"""
ClauseGuard Site-Wide AI Assistant & Legal Jargon Simplifier Engine.
Provides comprehensive guidance on:
1. Website navigation, features, document upload, vault access, calculator usage.
2. Simplifying complex legal jargon, clauses, and administrative terminology.
3. Indian legal benchmarks, tenant rights, borrower protections, employee rights, and consumer laws.
"""

import os
from typing import List, Dict
import google.generativeai as genai
from glossary import GLOSSARY_DB
from indian_law import STATUTORY_BENCHMARKS

# Configure Gemini API if available
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_KEY:
    try:
        genai.configure(api_key=GEMINI_KEY)
    except Exception:
        pass

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
   - Upload custom profile photo or choose avatar badge.
   - Change Account Password (requires current password).
   - Change Vault 4-Digit PIN (requires current PIN).

5. DOCUMENT DRAFT COMPARISON (/comparison):
   - Compare two versions (V1 vs V2) of a contract side-by-side to highlight redlines, sneaky added clauses, or escalated risks.

6. LEGAL GLOSSARY (/glossary):
   - Searchable plain-language dictionary of complex legal terms with real-world examples.
"""

SYSTEM_PROMPT = f"""You are the official ClauseGuard AI Assistant & Legal Intelligence Guide.
Your mission is to be the ultimate companion for users, assisting them in two key areas:

1. WEBSITE GUIDE & FEATURE EXPLORER:
- Help users navigate ClauseGuard, explain how features work (Document Scanner, Affordability Calculator, PIN Vault, Comparison Diff, Profile Settings).
- Provide step-by-step instructions on how to upload files, stress-test income, lock vault, etc.

2. LEGAL JARGON & INDIAN CONSUMER/CONTRACT LAW INTELLIGENCE:
- Simplify 99/100 legal terms and dense legalese into plain, conversational, 6th-grade language with relatable real-world examples.
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
    for term, data in GLOSSARY_DB.items():
        if term in q_lower or data.get("term", "").lower() in q_lower:
            context_snippets.append(f"Glossary [{data.get('term')}]: {data.get('definition')} Example: {data.get('example')}")

    # Check Statutory benchmarks
    for statute in STATUTORY_BENCHMARKS:
        kw_matches = [kw for kw in statute.get("keywords", []) if kw in q_lower]
        if kw_matches or statute.get("category", "").lower() in q_lower:
            context_snippets.append(f"Legal Benchmark ({statute.get('category')} - {statute.get('act')}): {statute.get('plain_summary')} Rule: {statute.get('statutory_rule')}")

    context_str = "\n".join(context_snippets[:3]) if context_snippets else "No specific statute match; apply general plain-language contract principles."

    prompt = f"""User Question: {query_clean}

Relevant Platform/Legal Context:
{context_str}

Please provide a helpful, concise, well-structured, and empathetic response. If explaining a legal term or law, use a simple real-world scenario. If guiding on the website, provide clear steps."""

    if GEMINI_KEY:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=SYSTEM_PROMPT)
            
            # Format history for chat if present
            formatted_history = []
            if chat_history:
                for turn in chat_history[-6:]:
                    role = "user" if turn.get("sender") == "user" else "model"
                    formatted_history.append({"role": role, "parts": [turn.get("text", "")]})
            
            chat = model.start_chat(history=formatted_history)
            response = chat.send_message(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception:
            pass

    # Fallback Rule-Based Intelligence
    return _fallback_assistant_reply(query_clean, context_snippets)


def _fallback_assistant_reply(query: str, snippets: List[str]) -> str:
    q = query.lower()

    if any(w in q for w in ["upload", "audit", "scan", "analyze", "document"]):
        return (
            "📁 **How to Audit a Contract on ClauseGuard:**\n\n"
            "1. Click **'Audit Contract'** or **'Scan Contract'** in the top navigation bar.\n"
            "2. Drag and drop your agreement (PDF, DOCX, TXT, or image) into the upload box, or click to browse.\n"
            "3. Personal names, phone numbers, and IDs are **automatically erased** client-side before processing.\n"
            "4. You'll instantly receive a **plain-language breakdown**, risk score (High/Medium/Low), and missing protection alerts!"
        )

    if any(w in q for w in ["calculator", "affordability", "emi", "salary", "rent"]):
        return (
            "🧮 **How to Use the Smart Affordability Calculator:**\n\n"
            "1. Click **'Calculator'** in the top navigation bar.\n"
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

    if snippets:
        return (
            f"Here is what you need to know:\n\n"
            f"{snippets[0]}\n\n"
            f"💡 *Need more specific advice? Ask me anything about your contract, rights, or platform features!*"
        )

    return (
        "I'm here to help! You can ask me:\n"
        "• **How to use ClauseGuard** (e.g. *'How do I compare two drafts?'*, *'How do I test my rent affordability?'*)\n"
        "• **Legal term simplifications** (e.g. *'What is Indemnity?'*, *'What is a Lock-in period?'*, *'Can my landlord deduct my deposit?'*)\n"
        "• **Indian consumer & tenant rights** across loans, rentals, employment, and MSMEs."
    )
