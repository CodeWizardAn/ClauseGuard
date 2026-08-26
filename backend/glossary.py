GLOSSARY = {
    "indemnity": {
        "term": "Indemnity",
        "category": "Liability",
        "definition": "A promise to pay for any financial losses or damages someone else suffers.",
        "analogy": "Like an insurance policy where you promise to cover the other person's repair bills if things go wrong."
    },
    "force majeure": {
        "term": "Force Majeure",
        "category": "General",
        "definition": "Unforeseeable circumstances that prevent someone from fulfilling a contract.",
        "analogy": "An 'act of God' clause that pauses the rules during major disasters like earthquakes or pandemics."
    },
    "liquidated damages": {
        "term": "Liquidated Damages",
        "category": "Payment",
        "definition": "A pre-agreed fixed amount of money that must be paid if one party breaches the contract.",
        "analogy": "Like a late fee that you agree to upfront when returning a library book."
    },
    "severability": {
        "term": "Severability",
        "category": "General",
        "definition": "If one clause is found illegal or unenforceable, the rest of the contract still remains valid.",
        "analogy": "Cutting a rotten spot out of an apple—you can still eat the rest of the apple."
    },
    "mutatis mutandis": {
        "term": "Mutatis Mutandis",
        "category": "Latin",
        "definition": "Making necessary alterations while not affecting the main point.",
        "analogy": "Copy-pasting a template but changing the names and dates to fit the new situation."
    },
    "arbitral seat": {
        "term": "Arbitral Seat",
        "category": "Dispute Resolution",
        "definition": "The legal jurisdiction where an arbitration is officially based, which determines the procedural laws.",
        "analogy": "Choosing which country's referee playbook will be used during the game."
    },
    "subrogation": {
        "term": "Subrogation",
        "category": "Liability",
        "definition": "The right to legally pursue a third party that caused an insurance loss to the insured.",
        "analogy": "Stepping into someone else's shoes to sue the person who actually caused the accident."
    },
    "per stirpes": {
        "term": "Per Stirpes",
        "category": "Estate",
        "definition": "A method of distributing an estate where beneficiaries inherit their deceased parent's share.",
        "analogy": "If a parent passes away, their piece of the pie is split equally among their children."
    },
    "novation": {
        "term": "Novation",
        "category": "Contract",
        "definition": "Replacing an old obligation with a new one, or replacing a party to an agreement with a new party.",
        "analogy": "Swapping out a player on a sports team; the new player takes over all the old player's duties."
    },
    "jurisdiction": {
        "term": "Jurisdiction",
        "category": "Dispute Resolution",
        "definition": "The official power to make legal decisions and judgments.",
        "analogy": "Home court advantage—deciding which city's courts get to hear the argument."
    },
    "joint and several liability": {
        "term": "Joint and Several Liability",
        "category": "Liability",
        "definition": "Claimants may pursue an obligation against any one party as if they were jointly liable and it becomes the responsibility of the defendants to sort out their respective proportions of liability.",
        "analogy": "If you and your friends break a window, the owner can demand the full repair cost from just you, and then you have to collect from your friends."
    },
    "waiver": {
        "term": "Waiver",
        "category": "General",
        "definition": "The voluntary relinquishment or surrender of some known right or privilege.",
        "analogy": "Telling someone 'don't worry about it' when they owe you a favor."
    },
    "lock-in": {
        "term": "Lock-in",
        "category": "Termination",
        "definition": "A period when you cannot leave an agreement without paying a penalty.",
        "analogy": "Like a gym membership you cannot cancel for the first year without losing money."
    },
    "security deposit": {
        "term": "Security Deposit",
        "category": "Payment",
        "definition": "Money held by the other side to cover unpaid bills or damage, which should be returned if nothing is owed.",
        "analogy": "A safety piggy bank the landlord holds, not extra rent they automatically keep."
    },
    "arbitration": {
        "term": "Arbitration",
        "category": "Dispute Resolution",
        "definition": "A private process where a chosen person decides a fight instead of a public court.",
        "analogy": "A private referee instead of a public courtroom."
    },
    "auto-renewal": {
        "term": "Auto-renewal",
        "category": "Payment",
        "definition": "The contract continues and you are charged again unless you cancel in time.",
        "analogy": "A subscription that keeps billing unless you remember to switch it off."
    }
}

import re

def extract_jargon(text: str) -> list[dict]:
    """
    Detects jargon words in a given text and returns their glossary definitions.
    """
    found = []
    text_lower = text.lower()
    
    for key, data in GLOSSARY.items():
        # Use regex to find whole word matches
        pattern = r'\b' + re.escape(key) + r'\b'
        if re.search(pattern, text_lower):
            found.append(data)
            
    return found

def get_all_glossary_terms():
    return list(GLOSSARY.values())
