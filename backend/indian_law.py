import json
import difflib

# Comprehensive Indian Law Statutory Database (60+ Benchmark Sections & Judicial Precedents)
INDIAN_LAW_DB = [
    # ── 1. Contract & Obligation Law (Indian Contract Act, 1872 & SRA 1963) ──
    {
        "concept": "Unfair terms in consumer contracts",
        "act": "Consumer Protection Act, 2019",
        "section": "Section 2(46) - Unfair Contract",
        "text": "A contract is unfair if it causes significant change in the rights of such consumer, including the imposition of any unreasonable charge, obligation or condition which puts such consumer to disadvantage.",
        "keywords": ["modify terms", "without notice", "change conditions", "disadvantage", "unreasonable charge", "unfair", "unilateral modification", "sole discretion"]
    },
    {
        "concept": "Indemnity and unilateral hold-harmless",
        "act": "Indian Contract Act, 1872",
        "section": "Section 124 & Section 125",
        "text": "A contract of indemnity requires the promisor to save the promisee from loss. Blanket indemnities requiring one party to indemnify for the other party's own negligence, willful misconduct, or third-party claims without fault are heavily scrutinized and frequently read down by Indian courts.",
        "keywords": ["indemnify", "hold harmless", "loss", "damage", "indemnification", "defend", "unilateral indemnity", "third party claim"]
    },
    {
        "concept": "Agreements in restraint of legal proceedings",
        "act": "Indian Contract Act, 1872",
        "section": "Section 28",
        "text": "Every agreement, by which any party thereto is restricted absolutely from enforcing his rights under or in respect of any contract, by the usual legal proceedings in the ordinary tribunals, or which limits the time within which he may thus enforce his rights, is void to that extent.",
        "keywords": ["jurisdiction", "exclusive jurisdiction", "cannot sue", "time limit", "waive right", "legal proceedings", "court", "bar to suit"]
    },
    {
        "concept": "Force Majeure and Frustration of Contract",
        "act": "Indian Contract Act, 1872",
        "section": "Section 56",
        "text": "An agreement to do an act impossible in itself is void. A contract becomes void when the act becomes impossible, or, by reason of some event which the promisor could not prevent, unlawful.",
        "keywords": ["force majeure", "act of god", "impossible", "unforeseen", "pandemic", "natural disaster", "war", "frustration", "impossibility"]
    },
    {
        "concept": "Agreements in restraint of trade & Non-compete covenants",
        "act": "Indian Contract Act, 1872",
        "section": "Section 27",
        "text": "Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void. Post-termination non-compete clauses against employees are void under Indian law regardless of reasonableness (Percept D'Mark v. Zaheer Khan).",
        "keywords": ["non-compete", "restraint of trade", "not work", "competitor", "not join", "not engage", "not solicit", "prohibit", "post-employment", "lockout"]
    },
    {
        "concept": "Unlawful and immoral consideration / Public policy violations",
        "act": "Indian Contract Act, 1872",
        "section": "Section 23",
        "text": "The consideration or object of an agreement is unlawful if it is forbidden by law, defeats any provision of law, is fraudulent, involves injury to the person or property of another, or the court regards it as immoral or opposed to public policy. Contracts stripping fundamental statutory rights are void ab initio.",
        "keywords": ["waive all rights", "no recourse", "no remedy", "absolute discretion", "sole discretion", "forfeit all", "opposed to public policy", "void ab initio"]
    },
    {
        "concept": "Liquidated Damages vs Punitive Penalty Forfeitures",
        "act": "Indian Contract Act, 1872",
        "section": "Section 74 (Kailash Nath Associates v. DDA)",
        "text": "Where a contract stipulates a penalty for breach, the aggrieved party is entitled only to reasonable compensation not exceeding the named amount. Proof of actual loss is mandatory where damage is capable of assessment. Forfeitures that act as punitive penalties are unenforceable.",
        "keywords": ["penalty", "liquidated damages", "forfeit", "late fee", "compensation", "damages", "breach", "full forfeiture", "penal sum"]
    },
    {
        "concept": "Compensation for Loss or Damage Caused by Breach of Contract",
        "act": "Indian Contract Act, 1872",
        "section": "Section 73 (Hadley v. Baxendale Principle)",
        "text": "When a contract has been broken, the party who suffers by such breach is entitled to receive compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things, or which the parties knew to be likely to result from breach. Remote or indirect loss cannot be claimed.",
        "keywords": ["consequential loss", "indirect damages", "loss of profit", "expectation loss", "breach damages", "natural consequence", "remoteness of damage"]
    },
    {
        "concept": "Obligation of Person Benefiting from Non-Gratuitous Act (Quantum Meruit)",
        "act": "Indian Contract Act, 1872",
        "section": "Section 70",
        "text": "Where a person lawfully does anything for another person, or delivers anything to him, not intending to do so gratuitously, and such other person enjoys the benefit thereof, the latter is bound to make compensation to the former in respect of, or to restore, the thing so done or delivered.",
        "keywords": ["quantum meruit", "unpaid work", "milestone payment", "partial completion", "reimbursement", "non-gratuitous", "unjust enrichment"]
    },
    {
        "concept": "Coercion, Undue Influence & Free Consent",
        "act": "Indian Contract Act, 1872",
        "section": "Section 14, 15, 16 & 19",
        "text": "Consent is free when not caused by coercion, undue influence, fraud, or misrepresentation. Where a party holds real or apparent authority or stands in a fiduciary relation, unfair contracts exploiting dominant bargaining power are voidable at the option of the aggrieved party.",
        "keywords": ["undue influence", "coercion", "duress", "unequal bargaining power", "forced to sign", "voidable contract", "free consent"]
    },
    {
        "concept": "Novation, Rescission and Alteration of Contract",
        "act": "Indian Contract Act, 1872",
        "section": "Section 62",
        "text": "If the parties to a contract agree to substitute a new contract for it, or to rescind or alter it, the original contract need not be performed. Unilateral alterations without bilateral executed consent are invalid under Indian law.",
        "keywords": ["novation", "amendment", "unilateral modification", "contract alteration", "substitution of party", "rescission"]
    },
    {
        "concept": "Specific Performance of Personal Service Prohibited",
        "act": "Specific Relief Act, 1963",
        "section": "Section 14(c) & Section 16",
        "text": "A contract which is so dependent on the personal qualifications of the parties cannot be specifically enforced. An employer cannot seek a court order or injunction compelling an employee or service provider to work against their will, as it amounts to involuntary servitude.",
        "keywords": ["specific performance", "compelled to work", "injunction to perform", "personal service", "forced employment", "mandatory injunction"]
    },
    {
        "concept": "Substituted Performance & Notice Requirements",
        "act": "Specific Relief Act, 1963 (Amended 2018)",
        "section": "Section 20 - Substituted Performance",
        "text": "Where a contract is broken due to non-performance, the aggrieved party has the option of substituted performance through a third party, but must give at least 30 days prior written notice calling upon the defaulting party to perform before engaging a replacement at their cost.",
        "keywords": ["substituted performance", "third party replacement", "remedy defect at cost", "hire third party", "cure notice", "rectification period"]
    },

    # ── 2. Property, Tenancy, Real Estate & RERA ──────────────────────────────
    {
        "concept": "Transfer of property — Lease rights and repair covenants",
        "act": "Transfer of Property Act, 1882",
        "section": "Section 108(f) & Section 108(m)",
        "text": "If the lessor neglects to make any repairs which he is bound to make to the property after reasonable notice, the lessee may make the same and deduct the expense from rent. The lessee is only bound to keep the property in as good condition as it was at the commencement, reasonable wear and tear excepted.",
        "keywords": ["eviction", "notice period", "entry", "inspection", "vacate", "terminate tenancy", "rent", "landlord", "tenant", "lease", "repairs", "wear and tear", "structural defect"]
    },
    {
        "concept": "Determination of Lease & Protection Against Forfeiture for Non-Payment",
        "act": "Transfer of Property Act, 1882",
        "section": "Section 111(g) & Section 114",
        "text": "A lease determines by forfeiture only upon express breach of a condition and serving of a formal written notice giving an opportunity to remedy. Where a lease is forfeited for non-payment of rent, the court may relieve the tenant from forfeiture if arrears and interest are tendered.",
        "keywords": ["forfeiture of lease", "determination of lease", "relief against forfeiture", "arrears of rent", "lease termination", "ejectment notice"]
    },
    {
        "concept": "Security Deposit limits and refund timelines",
        "act": "Model Tenancy Act, 2021 & State Tenancy Provisions",
        "section": "Section 11 - Security Deposit",
        "text": "Security deposit for residential premises shall not exceed two months' rent, and for non-residential premises shall not exceed six months' rent. The deposit must be refunded to the tenant on the date of handing over vacant possession, after deducting legitimate agreed dues.",
        "keywords": ["security deposit", "caution deposit", "deposit refund", "deposit deduction", "months rent", "advance deposit", "holding deposit"]
    },
    {
        "concept": "Landlord entry notice and privacy protection",
        "act": "Model Tenancy Act, 2021",
        "section": "Section 15 - Entry into premises",
        "text": "A landlord or property manager cannot enter the rented premises without giving at least 24 hours' prior written or electronic notice stating the reason for entry. Entry must be between 7:00 AM and 8:00 PM.",
        "keywords": ["landlord entry", "right of entry", "inspection", "enter without notice", "access to premises", "visit anytime", "peaceful enjoyment"]
    },
    {
        "concept": "Protection Against Essential Utility Disconnection",
        "act": "Model Tenancy Act, 2021 & State Rent Control Acts",
        "section": "Section 20 - Essential Supply Disconnection Bar",
        "text": "No landlord or property manager shall, by themselves or through any person, cut off or withhold any essential supply or service (such as electricity, water supply, lift access, or parking) in the premises occupied by the tenant, even in the event of rental dispute or default.",
        "keywords": ["electricity disconnect", "cut water", "withhold utility", "lock out", "bar entry", "disconnect power", "essential supply", "harass tenant"]
    },
    {
        "concept": "Subletting and License vs Lease Distinction",
        "act": "Indian Easements Act, 1882 (Section 52) & Transfer of Property Act (Section 105)",
        "section": "Section 52 Easements Act",
        "text": "A license grants mere permission to occupy without creating an interest or exclusive possession in the immovable property. Subletting without prior written consent of the landlord creates grounds for termination, but peaceful possession cannot be forcibly disrupted without due process of law.",
        "keywords": ["subletting", "license agreement", "leave and license", "exclusive possession", "sub-tenant", "easement right", "paying guest"]
    },
    {
        "concept": "Real estate — Builder obligations and delay compensation",
        "act": "Real Estate (Regulation and Development) Act, 2016 (RERA)",
        "section": "Section 18 & Section 14",
        "text": "If the promoter fails to complete or give possession on the agreed date, the buyer has the right to withdraw and demand full refund with interest (SBI MCLR + 2%). Structural defects within 5 years must be rectified by the promoter at zero cost within 30 days.",
        "keywords": ["possession", "completion date", "builder", "developer", "flat", "apartment", "construction", "delay", "real estate", "rera", "structural defect"]
    },
    {
        "concept": "Carpet Area Pricing and Prohibition on Super Built-up Ambiguity",
        "act": "Real Estate (Regulation and Development) Act, 2016 (RERA)",
        "section": "Section 2(k) & Section 4",
        "text": "All real estate sale agreements must strictly define and quote prices based on net usable 'Carpet Area' (excluding common areas, external walls, and terrace shafts). Charging for undefined super built-up space without carpet area certification is a violation of RERA statutory rules.",
        "keywords": ["carpet area", "super built up", "built-up area", "loading percentage", "saleable area", "rera carpet", "undivided share"]
    },

    # ── 3. Banking, Lending, Debt Recovery & Financial Math ───────────────────
    {
        "concept": "RBI Fair Practices Code — Prohibition of Compounding Penal Charges",
        "act": "Reserve Bank of India (Fair Lending Practice - Penal Charges in Loan Accounts) Guidelines 2024",
        "section": "Circular RBI/2023-24/53",
        "text": "Penalty for non-compliance of loan terms shall be treated as 'penal charges' and shall not be levied in the form of 'penal interest' added to the rate of interest. No further interest shall be computed on penal charges (strictly no compounding of penalty fees).",
        "keywords": ["penal interest", "penal charges", "overdue interest", "default interest", "compounding penalty", "late payment charge", "loan penalty", "emi default"]
    },
    {
        "concept": "Ban on Foreclosure and Prepayment Penalties on Floating Rate Loans",
        "act": "RBI Master Direction on Lending to Individuals",
        "section": "RBI Circular on Prepayment Penalty",
        "text": "Banks and NBFCs are strictly prohibited from charging foreclosure fees or prepayment penalties on all floating rate term loans sanctioned to individual borrowers (with or without co-obligants) for purposes other than business.",
        "keywords": ["foreclosure", "prepayment", "preclosure", "early payoff", "prepayment penalty", "foreclosure charge", "floating rate", "pre-closure fee"]
    },
    {
        "concept": "Mandatory Key Fact Statement (KFS) & Annual Percentage Rate (APR)",
        "act": "RBI Master Direction on Loans and Advances",
        "section": "Key Facts Statement Mandate 2024",
        "text": "All regulated lenders must provide an explicit Key Fact Statement (KFS) containing all-inclusive Annual Percentage Rate (APR), detailed amortization schedule, recovery mechanisms, and grievance redressal before loan execution. Undisclosed fees are illegal.",
        "keywords": ["kfs", "key fact statement", "apr", "annual percentage rate", "hidden fee", "processing fee", "documentation charge", "all-inclusive cost"]
    },
    {
        "concept": "Recovery Agent Conduct and Harassment Restrictions",
        "act": "RBI Master Circular on Recovery Agents",
        "section": "Recovery Guidelines",
        "text": "Lenders and their recovery agents are strictly prohibited from resorting to intimidation, verbal or physical harassment, calling at uncivil hours (before 8:00 AM or after 7:00 PM), or contacting friends and relatives of the borrower.",
        "keywords": ["recovery agent", "collection agent", "harassment", "uncivil hours", "calling contacts", "seizure of asset", "repossession", "intimidation"]
    },
    {
        "concept": "Digital Lending Regulations & Default Loss Guarantees (DLG)",
        "act": "RBI Master Direction on Digital Lending, 2022",
        "section": "Digital Lending Guidelines 2022",
        "text": "Lending through digital apps must disburse loan funds directly from the bank/NBFC account to the borrower's bank account without passing through third-party fintech pools. Collecting borrower phone contacts, location data, or gallery media is strictly prohibited.",
        "keywords": ["digital lending", "loan app", "fintech loan", "dlg", "default loss guarantee", "access contacts", "data harvesting", "disbursal"]
    },
    {
        "concept": "Cheque Bounce and Security Cheques Misuse",
        "act": "Negotiable Instruments Act, 1881",
        "section": "Section 138 (Dashrath Rupsingh Rathod)",
        "text": "Dishonour of cheque for insufficiency of funds attracts criminal liability only when drawn for discharge of an existing, legally enforceable debt or liability. Lenders or landlords cannot misuse undated blank security cheques as punitive coercive tools for disputed claims.",
        "keywords": ["security cheque", "cheque bounce", "section 138", "blank cheque", "undated cheque", "dishonour", "stop payment", "post-dated cheque"]
    },
    {
        "concept": "SARFAESI Demand Notice & Secured Asset Possession Rules",
        "act": "Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest Act, 2002 (SARFAESI)",
        "section": "Section 13(2) & Section 13(4)",
        "text": "A secured creditor cannot take possession of a mortgaged property without first serving a statutory 60-day demand notice under Section 13(2) and considering borrower objections in writing within 15 days. Arbitrary eviction without Chief Metropolitan Magistrate / District Magistrate orders under Section 14 is unlawful.",
        "keywords": ["sarfaesi", "mortgage possession", "auction of property", "secured creditor", "section 13", "drt", "npa notice", "60 days notice"]
    },

    # ── 4. Employment, Labor, Service & Workplace Standards ────────────────────
    {
        "concept": "Employment Bond & Training Cost Recoveries",
        "act": "Indian Contract Act, 1872 read with High Court Precedents",
        "section": "Section 27 & Section 74 (Sicpa India Ltd v. Manas Pratim)",
        "text": "Employment bonds requiring payment of exorbitant sums upon early exit are unenforceable as penalties. Employers can only recover actual, documented training expenses incurred on the employee, amortized across the service period. Forfeiting salary or withholding relieving letters is illegal.",
        "keywords": ["employment bond", "service agreement", "training cost", "exit penalty", "lock-in period", "withhold relieving letter", "experience certificate", "bond amount"]
    },
    {
        "concept": "Notice Period Deductions and Buyout Rights",
        "act": "Payment of Wages Act, 1936 & State Industrial Employment Standing Orders",
        "section": "Section 7 - Authorized Deductions",
        "text": "Notice periods in employment contracts must be bilateral (equal for both employer and employee). Any deduction from final settlement for notice shortfall must be strictly proportional to the base pay and cannot exceed the actual notice shortfall period.",
        "keywords": ["notice period", "notice shortfall", "notice buyout", "salary recovery", "full and final settlement", "resignation", "relieving", "termination notice"]
    },
    {
        "concept": "Mandatory Gratuity Entitlement",
        "act": "Payment of Gratuity Act, 1972",
        "section": "Section 4 - Payment of Gratuity",
        "text": "Gratuity is a statutory right payable to every employee upon termination of employment after rendering continuous service for not less than five years. Any contractual clause attempting to waive or forfeit gratuity except in cases of proven riotous disorderly conduct or moral turpitude is void.",
        "keywords": ["gratuity", "5 years service", "statutory gratuity", "forfeit gratuity", "terminal benefit", "retirement benefit", "gratuity waiver"]
    },
    {
        "concept": "Maternity Benefit and Non-Discrimination Protections",
        "act": "Maternity Benefit Act, 1961 (Amended 2017)",
        "section": "Section 5 & Section 12",
        "text": "Every woman employee who has worked for at least 80 days in the 12 months preceding delivery is entitled to 26 weeks of paid maternity leave. It is unlawful for an employer to discharge, dismiss, or vary service terms to her disadvantage during her maternity period.",
        "keywords": ["maternity leave", "maternity benefit", "pregnancy", "termination during pregnancy", "26 weeks", "childbirth", "nursing breaks"]
    },
    {
        "concept": "Invention Assignment and IP Carve-outs for Personal Time",
        "act": "Copyright Act, 1957 & Patents Act, 1970",
        "section": "Section 17(c) - First owner of copyright",
        "text": "An employer owns copyright only in works created by an employee in the course of employment under a contract of service. Clauses attempting to assign all inventions, open-source work, or side projects created outside working hours using personal equipment are overbroad and legally vulnerable.",
        "keywords": ["ip assignment", "invention assignment", "all creations", "moonlighting", "side project", "personal time", "outside working hours", "moral rights"]
    },
    {
        "concept": "Mandatory POSH Compliance & Non-Retaliation Protection",
        "act": "Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (POSH)",
        "section": "Section 4 & Section 19",
        "text": "Every employer employing 10 or more employees must constitute an Internal Committee (IC) and display penal consequences of sexual harassment. Service and employment contracts cannot contract out of POSH statutory inquiry procedures or subject victims/whistleblowers to retaliation or gag clauses.",
        "keywords": ["posh", "internal complaints committee", "sexual harassment", "retaliation", "whistleblower", "gag order", "harassment inquiry"]
    },
    {
        "concept": "Retrenchment Compensation & Severance Protections",
        "act": "Industrial Disputes Act, 1947",
        "section": "Section 25F - Conditions precedent to retrenchment",
        "text": "No workman who has been in continuous service for not less than one year shall be retrenched until given one month's notice in writing indicating reasons, or wages in lieu thereof, along with retrenchment compensation equivalent to 15 days average pay for every completed year of service.",
        "keywords": ["retrenchment", "layoff", "severance pay", "downsizing", "workman", "statutory severance", "termination without cause"]
    },
    {
        "concept": "Provident Fund Contributions Non-Waivable",
        "act": "Employees' Provident Funds and Miscellaneous Provisions Act, 1952",
        "section": "Section 6 & Section 12",
        "text": "Contractual clauses attempting to waive statutory Provident Fund (PF) contributions, or reducing employer contributions below the statutory 12% ceiling without employee consent, are void and subject to penal damages.",
        "keywords": ["provident fund", "epf", "pf deduction", "pf contribution", "opt out of pf", "statutory retiral"]
    },

    # ── 5. Data Privacy, Digital Tech & Consumer Rights ───────────────────────
    {
        "concept": "Digital Personal Data Protection — Consent and Notice",
        "act": "Digital Personal Data Protection Act, 2023 (DPDP Act)",
        "section": "Section 6 - Consent & Section 8 - Data Fiduciary Obligations",
        "text": "Personal data may be processed only with clear, informed, specific, unconditional, and unambiguous consent following an itemized notice. Bundled consent where access to a service is conditioned on consenting to unrelated data processing is invalid. Data principals have the right to withdraw consent and demand erasure.",
        "keywords": ["consent", "personal data", "data fiduciary", "data principal", "data erasure", "data retention", "dpdp", "privacy policy", "tracking", "bundled consent"]
    },
    {
        "concept": "Compensation for Failure to Protect Sensitive Personal Data",
        "act": "Information Technology Act, 2000",
        "section": "Section 43A & Section 72A",
        "text": "A body corporate possessing, dealing or handling sensitive personal data in a computer resource which is negligent in implementing reasonable security practices, causing wrongful loss or wrongful gain, is liable to pay damages by way of compensation to the person affected.",
        "keywords": ["it act", "section 43a", "data breach", "sensitive personal data", "security practices", "data disclosure", "unauthorized access", "breach of confidentiality"]
    },
    {
        "concept": "Electronic Contracts & Digital Signature Validity",
        "act": "Information Technology Act, 2000",
        "section": "Section 10A & Section 65B",
        "text": "Contracts formed through electronic records, emails, or digital platforms are legally enforceable and shall not be denied validity solely because electronic form was used. Electronic records accompanied by a Section 65B Certificate are fully admissible in Indian courts.",
        "keywords": ["electronic contract", "clickwrap", "e-sign", "digital signature", "section 65b", "online contract", "electronic record", "email agreement"]
    },
    {
        "concept": "Prohibition of Dark Patterns in Digital Consumer Services",
        "act": "Central Consumer Protection Authority (CCPA) Guidelines for Prevention of Dark Patterns 2023",
        "section": "Guidelines 2023",
        "text": "Digital platforms are strictly prohibited from engaging in dark patterns including False Urgency, Basket Sneaking, Confirm Shaming, Forced Action, Subscription Traps, and Drip Pricing. Unsolicited recurring charges or difficult cancellation workflows violate consumer protection laws.",
        "keywords": ["dark patterns", "auto-renewal", "subscription trap", "forced continuity", "hidden recurring charge", "automatic debit", "drip pricing", "cancellation obstacle"]
    },
    {
        "concept": "Limitation of Liability Carve-outs",
        "act": "Indian Contract Act, 1872 & Judicial Standards",
        "section": "Section 73 & Section 23",
        "text": "Clauses limiting a party's liability to zero or to a token amount (such as fees paid in past 1 month) cannot exclude liability arising from gross negligence, willful misconduct, intentional fraud, or breach of confidentiality/data protection obligations.",
        "keywords": ["limitation of liability", "cap on liability", "aggregate liability", "consequential damages", "gross negligence", "willful misconduct", "sole remedy", "maximum liability"]
    },
    {
        "concept": "Product Liability & Defective Goods/Services",
        "act": "Consumer Protection Act, 2019",
        "section": "Section 82 to Section 87 (Product Liability)",
        "text": "A product manufacturer, product seller or product service provider is strictly liable to compensate a consumer for any harm caused by a defective product or deficiency in service. Disclaimers purporting to eliminate statutory product liability for personal injury are void.",
        "keywords": ["product liability", "defective product", "deficiency in service", "harm caused", "consumer forum", "manufacturer liability", "as-is disclaimer"]
    },

    # ── 6. Commercial, Vendor, MSME & Corporate Law ───────────────────────────
    {
        "concept": "Mandatory 45-Day Payment Timeline & Compound Interest for MSMEs",
        "act": "Micro, Small and Medium Enterprises Development Act, 2006 (MSMED Act)",
        "section": "Section 15 & Section 16",
        "text": "Where any MSME vendor supplies goods or renders services, the buyer must make payment within agreed terms which cannot exceed 45 days. Delayed payment mandates statutory compound interest with monthly rests at three times the RBI bank rate, notwithstanding anything contained in the contract.",
        "keywords": ["payment terms", "90 days payment", "60 days payment", "msme", "msmed", "late payment interest", "vendor invoice", "payment milestone", "delayed payment"]
    },
    {
        "concept": "Arbitration Seat, Unilateral Appointments & Fast-Track Disposal",
        "act": "Arbitration and Conciliation Act, 1996 (Amended 2015 & 2019)",
        "section": "Section 12(5) (Perkins Eastman) & Section 29A",
        "text": "Unilateral appointment of a sole arbitrator by one party having an interest in the outcome is void and non-est (Perkins Eastman Architects). Arbitral awards must be completed within 12 months in domestic arbitrations. Purely Indian domestic disputes cannot be subjected to foreign governing laws to bypass Indian public policy.",
        "keywords": ["arbitration", "sole arbitrator", "unilateral appointment", "arbitration seat", "governing law", "arbitral tribunal", "perkins eastman", "dispute resolution"]
    },
    {
        "concept": "Anti-Competitive Agreements & Abuse of Dominant Position",
        "act": "Competition Act, 2002",
        "section": "Section 3 & Section 4",
        "text": "Agreements which cause or are likely to cause an appreciable adverse effect on competition within India (such as tie-in arrangements, exclusive supply or distribution agreements, refusal to deal, and resale price maintenance) are void. Dominant enterprises cannot impose unfair or discriminatory pricing or trading conditions.",
        "keywords": ["competition act", "abuse of dominance", "exclusive dealing", "tie-in sale", "resale price maintenance", "anti-competitive", "exclusive supply", "monopoly terms"]
    },
    {
        "concept": "Implied Conditions and Warranties in Sale of Goods",
        "act": "Sale of Goods Act, 1930",
        "section": "Section 14 to Section 17",
        "text": "In every contract of sale, there is an implied condition that the seller has the right to sell the goods, that goods shall be of merchantable quality, and reasonably fit for the buyer's disclosed purpose. Blanket disclaimers of all statutory warranties without reasonable inspection opportunity are vulnerable to challenge.",
        "keywords": ["as is where is", "merchantable quality", "fitness for purpose", "warranty disclaimer", "sale by sample", "defective goods", "sale of goods"]
    },
    {
        "concept": "Insolvency Moratorium & Unenforceability of Ipso Facto Termination",
        "act": "Insolvency and Bankruptcy Code, 2016 (IBC)",
        "section": "Section 14 & Section 238 (Gujarat Urja Vikas Nigam v. Amit Gupta)",
        "text": "Upon admission into Corporate Insolvency Resolution Process (CIRP), a statutory moratorium prohibits termination of contracts essential to the debtor's business solely on grounds of insolvency (Ipso Facto clauses). The provisions of the IBC override conflicting contractual termination rights.",
        "keywords": ["ipso facto", "insolvency", "bankruptcy", "moratorium", "cirp", "resolution professional", "ibc", "insolvent party", "automatic termination on bankruptcy"]
    },
    {
        "concept": "Mandatory Stamping & Registration for Enforceability",
        "act": "Indian Stamp Act, 1899 & Registration Act, 1908",
        "section": "Section 35 Stamp Act & Section 17 Registration Act (NN Global)",
        "text": "Unstamped or insufficiently stamped agreements (including lease deeds, loan agreements, and arbitration agreements) cannot be admitted into evidence in Indian courts until the deficit stamp duty along with statutory penalty is paid. Leases exceeding 11 months require mandatory registration.",
        "keywords": ["stamp duty", "stamp paper", "unstamped", "registration", "sub-registrar", "11 months lease", "notarized", "admissibility in evidence"]
    },
    {
        "concept": "TDS Withholding Mandates and Tax Indemnity",
        "act": "Income Tax Act, 1961",
        "section": "Section 194C & Section 194J",
        "text": "Payments made under service contracts, contractor agreements, or technical consultancy require statutory Tax Deducted at Source (TDS) at prescribed rates. Contracts requiring the paying party to gross-up taxes or absorb unauthorized withholding liabilities must comply with statutory tax provisions.",
        "keywords": ["tds", "tax deduction", "withholding tax", "gross up", "pan number", "income tax", "form 16a", "tax indemnity"]
    }
]


def get_relevant_law(clause_text: str, top_k: int = 3) -> str:
    """
    Finds relevant Indian statutory provisions based on keyword matching and difflib similarity
    and returns a formatted context string for grounding LLM prompts.
    """
    if not clause_text or len(clause_text.strip()) < 5:
        return ""

    text_lower = clause_text.lower()
    scored_laws = []

    for law in INDIAN_LAW_DB:
        score = 0.0

        # Keyword matching boost with weighting
        for kw in law["keywords"]:
            if kw in text_lower:
                score += 0.35

        # Semantic title & text similarity boost
        concept_match = difflib.SequenceMatcher(None, text_lower, law["concept"].lower()).ratio()
        text_match = difflib.SequenceMatcher(None, text_lower[:500], law["text"].lower()[:500]).ratio()
        score += (concept_match * 0.45) + (text_match * 0.35)

        scored_laws.append((score, law))

    scored_laws.sort(key=lambda x: x[0], reverse=True)

    # Filter only relevant ones above confidence threshold
    relevant = [law for score, law in scored_laws[:top_k] if score > 0.28]

    if not relevant:
        return ""

    context_str = "STATUTORY BENCHMARK CONTEXT:\n"
    for law in relevant:
        context_str += f"• Principle: {law['concept']}\n  Act/Section: {law['act']} — {law['section']}\n  Standard: {law['text']}\n"

    return context_str


def get_all_statutory_benchmarks() -> list:
    """Returns the complete statutory benchmark dataset."""
    return INDIAN_LAW_DB