import json
import difflib

# In a real app, this would be a ChromaDB collection
INDIAN_LAW_DB = [
    # ── Contract Act ─────────────────────────────────────────────────────────
    {
        "concept": "Unfair terms in consumer contracts",
        "act": "Consumer Protection Act, 2019",
        "section": "Section 2(46) - Unfair Contract",
        "text": "A contract is unfair if it causes significant change in the rights of such consumer, including the imposition of any unreasonable charge, obligation or condition which puts such consumer to disadvantage.",
        "keywords": ["modify terms", "without notice", "change conditions", "disadvantage", "unreasonable charge", "unfair"]
    },
    {
        "concept": "Indemnity",
        "act": "Indian Contract Act, 1872",
        "section": "Section 124",
        "text": "A contract by which one party promises to save the other from loss caused to him by the conduct of the promisor himself, or by the conduct of any other person, is called a contract of indemnity. Blanket indemnities are heavily scrutinized.",
        "keywords": ["indemnify", "hold harmless", "loss", "damage", "indemnification", "defend"]
    },
    {
        "concept": "Agreements in restraint of legal proceedings",
        "act": "Indian Contract Act, 1872",
        "section": "Section 28",
        "text": "Every agreement, by which any party thereto is restricted absolutely from enforcing his rights under or in respect of any contract, by the usual legal proceedings in the ordinary tribunals, or which limits the time within which he may thus enforce his rights, is void to that extent.",
        "keywords": ["jurisdiction", "exclusive jurisdiction", "cannot sue", "time limit", "waive right", "legal proceedings", "court"]
    },
    {
        "concept": "Force Majeure and Frustration of Contract",
        "act": "Indian Contract Act, 1872",
        "section": "Section 56",
        "text": "An agreement to do an act impossible in itself is void. A contract becomes void when the act becomes impossible, or, by reason of some event which the promisor could not prevent, unlawful.",
        "keywords": ["force majeure", "act of god", "impossible", "unforeseen", "pandemic", "natural disaster", "war"]
    },
    {
        "concept": "Agreements in restraint of trade — Non-compete",
        "act": "Indian Contract Act, 1872",
        "section": "Section 27",
        "text": "Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void. Non-compete clauses beyond reasonable geographic and time limits are void under Indian law.",
        "keywords": ["non-compete", "restraint of trade", "not work", "competitor", "not join", "not engage", "not solicit", "prohibit"]
    },
    {
        "concept": "Unlawful and immoral consideration",
        "act": "Indian Contract Act, 1872",
        "section": "Section 23",
        "text": "The consideration or object of an agreement is unlawful if it is forbidden by law, defeats any provision of law, is fraudulent, involves injury to the person or property of another, or the court regards it as immoral or opposed to public policy. One-sided agreements that strip fundamental rights are void.",
        "keywords": ["waive all rights", "no recourse", "no remedy", "absolute discretion", "sole discretion", "forfeit all"]
    },
    {
        "concept": "Compensation for breach of contract",
        "act": "Indian Contract Act, 1872",
        "section": "Section 73",
        "text": "When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken it, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach. Penalty clauses that are grossly disproportionate are subject to court review.",
        "keywords": ["penalty", "liquidated damages", "forfeit", "late fee", "compensation", "damages", "breach"]
    },
    # ── Property & Rental ────────────────────────────────────────────────────
    {
        "concept": "Transfer of property — Lease and tenancy rights",
        "act": "Transfer of Property Act, 1882",
        "section": "Sections 105-117",
        "text": "A lease of immoveable property is a transfer of a right to enjoy such property for a certain time in consideration of a price paid or promised. The lessee has rights against unlawful eviction and is entitled to notice before termination. Landlord right to enter without notice is restricted.",
        "keywords": ["eviction", "notice period", "entry", "inspection", "vacate", "terminate tenancy", "rent", "landlord", "tenant", "lease"]
    },
    {
        "concept": "Real estate — Builder obligations and possession",
        "act": "Real Estate (Regulation and Development) Act, 2016 (RERA)",
        "section": "Section 18",
        "text": "If the promoter fails to complete or is unable to give possession of an apartment, plot or building in accordance with the terms of the agreement, the promoter shall be liable on demand to refund the amount paid with interest at the rate specified. Buyers have right to withdraw and claim compensation.",
        "keywords": ["possession", "completion date", "builder", "developer", "flat", "apartment", "construction", "delay", "real estate"]
    },
    # ── Intellectual Property ─────────────────────────────────────────────────
    {
        "concept": "Moral rights of authors — cannot be fully waived",
        "act": "Copyright Act, 1957",
        "section": "Section 57",
        "text": "Independently of the author's copyright and even after the assignment either wholly or partially of the said copyright, the author of a work shall have the right to claim authorship of the work and to restrain or claim damages in respect of any distortion, mutilation, modification or other act which would be prejudicial to his honour or reputation. Moral rights cannot be permanently waived under Indian law.",
        "keywords": ["ip ownership", "all rights", "intellectual property", "copyright", "moral rights", "work product", "assign", "waive", "created by"]
    },
    # ── Payments & MSME ───────────────────────────────────────────────────────
    {
        "concept": "Delayed Payments to MSME",
        "act": "MSMED Act, 2006",
        "section": "Section 15 & 16",
        "text": "Liability of buyer to make payment. Where any supplier supplies any goods or renders any services to any buyer, the buyer shall make payment therefor before the appointed day. In no case the period agreed shall exceed forty-five days. Late payment attracts compound interest at three times the RBI bank rate.",
        "keywords": ["payment terms", "90 days", "60 days", "delayed payment", "vendor", "invoice", "payment due", "msme", "interest on late"]
    },
    # ── Data & Privacy ────────────────────────────────────────────────────────
    {
        "concept": "Data protection and privacy obligations",
        "act": "Information Technology Act, 2000 & IT (Amendment) Act 2008",
        "section": "Section 43A & Section 72A",
        "text": "A body corporate who possesses, deals or handles any sensitive personal data of persons and is negligent in implementing and maintaining reasonable security practices causing wrongful loss or gain to any person shall be liable to pay damages. Disclosure of information in breach of a lawful contract attracts compensation up to Rs. 5 crore.",
        "keywords": ["data", "personal information", "privacy", "collect", "share", "third party", "sensitive", "user data", "store", "process"]
    },
    # ── Dispute Resolution ────────────────────────────────────────────────────
    {
        "concept": "Arbitration — seat and applicable law",
        "act": "Arbitration and Conciliation Act, 1996",
        "section": "Section 20 & Section 28",
        "text": "The parties are free to agree on the place of arbitration. The arbitral tribunal shall decide the dispute in accordance with the substantive law for the time being in force in India. Foreign-seated arbitration with foreign governing law for purely Indian domestic contracts may face enforceability challenges.",
        "keywords": ["arbitration", "dispute resolution", "arbitrator", "adr", "singapore", "london", "icc", "seat of arbitration", "governing law"]
    },
    {
        "concept": "Mediation — consumer disputes",
        "act": "Consumer Protection Act, 2019",
        "section": "Section 49 - Mediation",
        "text": "The District Commission may, at the first hearing of the complaint after admission or at any later stage, if it appears to the Commission that there exist elements of a settlement which may be acceptable to the parties, direct the parties to give in writing, within five days, consent to have their dispute settled by mediation. Clauses that force arbitration and waive consumer mediation rights may be challenged.",
        "keywords": ["mediation", "consumer", "dispute", "settlement", "complaint", "forum", "waive right to sue"]
    },
    # ── Confidentiality ───────────────────────────────────────────────────────
    {
        "concept": "Restraint of trade — Confidentiality duration limits",
        "act": "Indian Contract Act, 1872",
        "section": "Section 27 read with Section 23",
        "text": "Confidentiality obligations that extend for an unreasonably long period (e.g., lifetime, permanent, perpetual) or that are so broadly defined as to prevent normal business activities may be challenged as agreements in restraint of trade and declared void.",
        "keywords": ["confidential", "nda", "non-disclosure", "perpetual", "lifetime", "forever", "permanent", "all information", "trade secret"]
    },

    # ── Specific Performance & Remedies ──────────────────────────────────────
    {
        "concept": "Specific performance — when courts enforce contracts",
        "act": "Specific Relief Act, 1963",
        "section": "Section 10 & Section 14",
        "text": "Specific performance of a contract shall be enforced by the court when the act agreed to be done is such that compensation in money for non-performance would not afford adequate relief. Clauses that attempt to limit remedies only to monetary damages and exclude injunctive or specific performance relief may be unenforceable.",
        "keywords": ["remedy", "sole remedy", "only remedy", "limit remedies", "no injunction", "specific performance", "equitable relief"]
    },

    # ── Stamp Duty & Registration ─────────────────────────────────────────────
    {
        "concept": "Stamping requirement for admissibility",
        "act": "Indian Stamp Act, 1899",
        "section": "Section 35",
        "text": "No instrument chargeable with duty shall be admitted in evidence for any purpose or shall be acted upon or registered unless such instrument is duly stamped. Agreements, particularly lease deeds and loan agreements, must be stamped to be legally enforceable in Indian courts.",
        "keywords": ["stamp duty", "notarized", "execution", "stamp paper", "agreement value", "stamp", "e-stamp"]
    },
    {
        "concept": "Mandatory registration of certain documents",
        "act": "Registration Act, 1908",
        "section": "Section 17",
        "text": "The following documents shall be registered: instruments of gift of immoveable property; other non-testamentary instruments which purport to create or declare any right, title or interest in immoveable property of value of Rs. 100 and upwards. Unregistered lease deeds for more than one year are not admissible as evidence.",
        "keywords": ["registration", "registered agreement", "sub-registrar", "immoveable property", "lease deed", "sale deed", "gift deed"]
    },

    # ── Negotiable Instruments ────────────────────────────────────────────────
    {
        "concept": "Post-dated cheques and security cheques",
        "act": "Negotiable Instruments Act, 1881",
        "section": "Section 138",
        "text": "Where any cheque drawn by a person on an account maintained by him is returned unpaid by the bank for insufficiency of funds, the drawer shall be deemed to have committed an offence. Clauses requiring post-dated cheques (PDCs) or security cheques create criminal liability risk if dishonoured.",
        "keywords": ["cheque", "pdc", "post dated", "security cheque", "blank cheque", "cheque bounce", "dishonour"]
    },

    # ── Competition Law ───────────────────────────────────────────────────────
    {
        "concept": "Anti-competitive agreements and exclusive dealing",
        "act": "Competition Act, 2002",
        "section": "Section 3",
        "text": "No enterprise or association of enterprises shall enter into any agreement in respect of production, supply, distribution, or control of goods or services which causes or is likely to cause an appreciable adverse effect on competition in India. Exclusive dealing, tying arrangements, and market division clauses are subject to scrutiny.",
        "keywords": ["exclusive", "exclusivity", "sole supplier", "not deal with", "not purchase from", "tie-up", "bundling", "market exclusive"]
    },

    # ── Employment Laws ───────────────────────────────────────────────────────
    {
        "concept": "Wage payment and unlawful deductions",
        "act": "Payment of Wages Act, 1936",
        "section": "Section 7 & Section 8",
        "text": "No deductions shall be made from the wages of an employed person except those authorized under this Act. Deductions for absence from duty, damage or loss shall not exceed the amount of wages for the period and must follow prescribed procedures. Clauses allowing unlimited salary deductions or clawbacks may violate this Act.",
        "keywords": ["salary deduction", "clawback", "wage", "deduct from pay", "recover from salary", "withhold wages", "employment"]
    },
    {
        "concept": "Working hours and overtime — Shops & Establishments",
        "act": "Shops and Commercial Establishments Act (State-specific)",
        "section": "General provisions",
        "text": "State-specific Shops and Establishments Acts regulate working hours, overtime, leave entitlements, and termination procedures for commercial employees. Employment contracts requiring excessive hours without overtime pay or denying statutory leave entitlements may violate these state laws.",
        "keywords": ["working hours", "overtime", "leave", "notice period", "termination", "employment contract", "annual leave", "sick leave"]
    },

    # ── Foreign Exchange ──────────────────────────────────────────────────────
    {
        "concept": "Foreign currency payments and FEMA compliance",
        "act": "Foreign Exchange Management Act, 1999 (FEMA)",
        "section": "Section 3 & Section 6",
        "text": "No person shall deal in or transfer any foreign exchange or foreign security to any person not being an authorised person without prior approval. Contracts requiring payment in foreign currency or involving cross-border money transfers must comply with FEMA regulations and RBI approvals.",
        "keywords": ["foreign currency", "usd", "eur", "gbp", "dollar", "forex", "cross border payment", "remittance", "overseas payment"]
    },

    # ── Insolvency ────────────────────────────────────────────────────────────
    {
        "concept": "Insolvency and bankruptcy — creditor rights",
        "act": "Insolvency and Bankruptcy Code, 2016 (IBC)",
        "section": "Section 14 — Moratorium",
        "text": "On insolvency commencement date, a moratorium shall be declared prohibiting institution of suits or continuation of pending legal proceedings, transferring or encumbering assets, and recovering any property by an owner. Contractual clauses that attempt to accelerate payments or terminate contracts upon insolvency filing may be voided.",
        "keywords": ["insolvency", "bankruptcy", "liquidation", "winding up", "receiver", "ipkf", "moratorium", "creditor", "default"]
    },

    # ── Digital Data Protection ───────────────────────────────────────────────
    {
        "concept": "Digital personal data protection — consent and purpose limitation",
        "act": "Digital Personal Data Protection Act, 2023 (DPDP Act)",
        "section": "Section 6 & Section 7",
        "text": "Personal data may be processed only for a lawful purpose for which the data principal has given consent. Consent must be free, specific, informed, unconditional and unambiguous. Consent obtained through bundled agreements, blanket consent, or conditions not related to the service violates the DPDP Act.",
        "keywords": ["consent", "data processing", "personal data", "data collection", "cookies", "tracking", "analytics", "user data", "data sharing", "data principal"]
    },

    # ── Taxation ──────────────────────────────────────────────────────────────
    {
        "concept": "GST and tax indemnity obligations",
        "act": "Goods and Services Tax Act, 2017 (CGST Act)",
        "section": "Section 9 & Section 15",
        "text": "GST is payable on supply of goods or services. Clauses placing unlimited GST indemnity burden on one party, or those that attempt to pass 100% of future tax law changes to the other party, may create disproportionate financial exposure. Tax gross-up clauses should specify a cap.",
        "keywords": ["gst", "tax", "taxes", "withholding tax", "tds", "tax indemnity", "gross up", "tax liability", "applicable taxes", "service tax"]
    },

    # ── Loans & Banking ───────────────────────────────────────────────────────
    {
        "concept": "Interest rate caps and usury — loan agreements",
        "act": "Reserve Bank of India Act, 1934 & Usurious Loans Act, 1918",
        "section": "Section 21A — Reopening of transactions",
        "text": "Courts may reopen transactions and relieve debtors from paying excessive interest if the transaction was substantially unfair. RBI regulates maximum interest rates for certain loan categories. Interest rates that are grossly excessive compared to RBI benchmarks may be challenged in court.",
        "keywords": ["interest rate", "loan", "borrowing", "lending", "repayment", "emi", "overdue interest", "penal interest", "compound interest", "penalty rate"]
    },
]




def get_relevant_law(clause_text: str, top_k: int = 2) -> str:
    """
    Finds relevant Indian law sections based on keyword matching and difflib similarity
    and returns a formatted context string for the LLM prompt.
    """
    text_lower = clause_text.lower()
    
    scored_laws = []
    
    for law in INDIAN_LAW_DB:
        score = 0
        
        # Keyword matching boost
        for kw in law["keywords"]:
            if kw in text_lower:
                score += 0.3
                
        # Similarity boost
        seq_match = difflib.SequenceMatcher(None, text_lower, law["text"].lower()).ratio()
        score += seq_match
        
        scored_laws.append((score, law))
        
    scored_laws.sort(key=lambda x: x[0], reverse=True)
    
    # Filter only relevant ones
    relevant = [law for score, law in scored_laws[:top_k] if score > 0.1]
    
    if not relevant:
        return ""
        
    context_str = "RELEVANT INDIAN LAW CONTEXT:\n"
    for law in relevant:
        context_str += f"- {law['act']}, {law['section']}: {law['text']}\n"
        
    return context_str