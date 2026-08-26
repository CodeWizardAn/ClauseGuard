import sqlite3
import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "clauseguard.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _add_column(c, table, col, spec):
    try:
        c.execute(f"ALTER TABLE {table} ADD COLUMN {col} {spec}")
    except sqlite3.OperationalError:
        pass


def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS contracts (
            id TEXT PRIMARY KEY,
            original_filename TEXT,
            total_clauses INTEGER,
            contract_type TEXT,
            status TEXT,
            user_id TEXT,
            storage_path TEXT,
            overall_score INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS clauses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contract_id TEXT,
            clause_number INTEGER,
            clause_text TEXT,
            risk_score INTEGER,
            severity TEXT,
            category TEXT,
            explanation TEXT,
            rewrite TEXT,
            plain_summary TEXT,
            rights TEXT,
            obligations TEXT,
            jargon_terms TEXT,
            FOREIGN KEY(contract_id) REFERENCES contracts(id)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clause_id TEXT,
            original_score INTEGER,
            corrected_score INTEGER,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            contract_id TEXT PRIMARY KEY,
            role TEXT,
            worry TEXT,
            language TEXT,
            question TEXT,
            extra TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS chat_turns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contract_id TEXT,
            role TEXT,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            age INTEGER,
            email_hash TEXT UNIQUE,
            email_enc TEXT,
            phone_hash TEXT,
            phone_enc TEXT,
            password_hash TEXT,
            vault_pin_hash TEXT,
            profile_complete INTEGER DEFAULT 0,
            role TEXT,
            worry TEXT,
            language TEXT DEFAULT 'en',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    _add_column(c, "contracts", "display_name", "TEXT")
    _add_column(c, "contracts", "language", "TEXT DEFAULT 'en'")
    _add_column(c, "contracts", "privacy_mode", "TEXT DEFAULT 'strict'")
    _add_column(c, "clauses", "simple_takeaway", "TEXT")
    _add_column(c, "users", "personal_knowledge", "TEXT DEFAULT '{}'")
    _add_column(c, "users", "avatar", "TEXT")
    conn.commit()
    conn.close()


init_db()




def save_contract(contract_id: str, filename: str, total_clauses: int, contract_type: str = "Unknown", user_id: str = None, storage_path: str = None, display_name: str = None, language: str = "en") -> dict:
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        INSERT INTO contracts (id, original_filename, total_clauses, contract_type, status, user_id, storage_path, display_name, language, privacy_mode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (contract_id, filename, total_clauses, contract_type, "awaiting_profile", user_id, storage_path, display_name or filename, language, "strict"))
    conn.commit()
    c.execute("SELECT * FROM contracts WHERE id = ?", (contract_id,))
    res = dict(c.fetchone())
    conn.close()
    return res


def update_contract(contract_id: str, overall_score: int, status: str = "complete"):
    conn = get_db()
    c = conn.cursor()
    c.execute("UPDATE contracts SET overall_score = ?, status = ? WHERE id = ?", (overall_score, status, contract_id))
    conn.commit()
    conn.close()


def update_contract_meta(contract_id: str, **fields):
    if not fields:
        return
    allowed = {"status", "language", "display_name", "total_clauses", "contract_type", "overall_score"}
    parts = []
    values = []
    for k, v in fields.items():
        if k in allowed:
            parts.append(f"{k} = ?")
            values.append(v)
    if not parts:
        return
    values.append(contract_id)
    conn = get_db()
    c = conn.cursor()
    c.execute(f"UPDATE contracts SET {', '.join(parts)} WHERE id = ?", values)
    conn.commit()
    conn.close()


def delete_clauses(contract_id: str):
    conn = get_db()
    c = conn.cursor()
    c.execute("DELETE FROM clauses WHERE contract_id = ?", (contract_id,))
    conn.commit()
    conn.close()


def save_clause(contract_id: str, clause_data: dict):
    conn = get_db()
    c = conn.cursor()
    rights_str = json.dumps(clause_data.get("rights", []))
    obligations_str = json.dumps(clause_data.get("obligations", []))
    jargon_str = json.dumps(clause_data.get("jargon_terms", []))
    c.execute("DELETE FROM clauses WHERE contract_id = ? AND clause_number = ?", (contract_id, clause_data.get("clause_number")))
    c.execute('''
        INSERT INTO clauses (contract_id, clause_number, clause_text, risk_score, severity, category, explanation, rewrite, plain_summary, rights, obligations, jargon_terms, simple_takeaway)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        contract_id,
        clause_data.get("clause_number"),
        clause_data.get("clause_text"),
        clause_data.get("risk_score", 0),
        clause_data.get("severity", "Clean"),
        clause_data.get("category", "General"),
        clause_data.get("explanation", ""),
        clause_data.get("rewrite", ""),
        clause_data.get("plain_summary", ""),
        rights_str,
        obligations_str,
        jargon_str,
        clause_data.get("simple_takeaway", ""),
    ))
    conn.commit()
    clause_id = c.lastrowid
    c.execute("SELECT * FROM clauses WHERE id = ?", (clause_id,))
    res = dict(c.fetchone())
    conn.close()
    return res


def get_contract(contract_id: str) -> dict:
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM contracts WHERE id = ?", (contract_id,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None


def get_clauses(contract_id: str) -> list:
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM clauses WHERE contract_id = ? ORDER BY clause_number", (contract_id,))
    rows = [dict(row) for row in c.fetchall()]
    conn.close()
    for row in rows:
        for field in ["rights", "obligations", "jargon_terms"]:
            if row.get(field):
                try:
                    row[field] = json.loads(row[field])
                except Exception:
                    row[field] = []
            else:
                row[field] = []
    return rows


def get_all_contracts(user_id: str = None) -> list:
    conn = get_db()
    c = conn.cursor()
    if user_id:
        c.execute("SELECT * FROM contracts WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    else:
        c.execute("SELECT * FROM contracts ORDER BY created_at DESC")
    rows = [dict(row) for row in c.fetchall()]
    conn.close()
    return rows


def delete_contract(contract_id: str):
    conn = get_db()
    c = conn.cursor()
    c.execute("DELETE FROM clauses WHERE contract_id = ?", (contract_id,))
    c.execute("DELETE FROM profiles WHERE contract_id = ?", (contract_id,))
    c.execute("DELETE FROM chat_turns WHERE contract_id = ?", (contract_id,))
    c.execute("DELETE FROM contracts WHERE id = ?", (contract_id,))
    conn.commit()
    conn.close()


def save_feedback(clause_id: str, original_score: int, corrected_score: int, comment: str = None):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "INSERT INTO feedback (clause_id, original_score, corrected_score, comment) VALUES (?, ?, ?, ?)",
        (clause_id, original_score, corrected_score, comment),
    )
    conn.commit()
    fb_id = c.lastrowid
    c.execute("SELECT * FROM feedback WHERE id = ?", (fb_id,))
    res = dict(c.fetchone())
    conn.close()
    return res


def save_profile(contract_id: str, role: str, worry: str, language: str, question: str, extra: dict = None) -> dict:
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        INSERT INTO profiles (contract_id, role, worry, language, question, extra)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(contract_id) DO UPDATE SET
            role=excluded.role, worry=excluded.worry, language=excluded.language,
            question=excluded.question, extra=excluded.extra
    ''', (contract_id, role, worry, language, question, json.dumps(extra or {})))
    conn.commit()
    c.execute("SELECT * FROM profiles WHERE contract_id = ?", (contract_id,))
    res = dict(c.fetchone())
    conn.close()
    if res.get("extra"):
        try:
            res["extra"] = json.loads(res["extra"])
        except Exception:
            res["extra"] = {}
    return res


def get_profile(contract_id: str) -> dict:
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM profiles WHERE contract_id = ?", (contract_id,))
    row = c.fetchone()
    conn.close()
    if not row:
        return None
    res = dict(row)
    if res.get("extra"):
        try:
            res["extra"] = json.loads(res["extra"])
        except Exception:
            res["extra"] = {}
    return res


def save_chat_turn(contract_id: str, role: str, content: str):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO chat_turns (contract_id, role, content) VALUES (?, ?, ?)", (contract_id, role, content[:4000]))
    conn.commit()
    conn.close()


def get_chat_history(contract_id: str, limit: int = 12) -> list:
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "SELECT role, content FROM chat_turns WHERE contract_id = ? ORDER BY id DESC LIMIT ?",
        (contract_id, limit),
    )
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return list(reversed(rows))


def create_user(user: dict) -> dict:
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        INSERT INTO users (id, name, age, email_hash, email_enc, phone_hash, phone_enc, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        user["id"], user["name"], user["age"], user["email_hash"], user["email_enc"],
        user["phone_hash"], user["phone_enc"], user["password_hash"],
    ))
    conn.commit()
    conn.close()
    return get_user_by_id(user["id"])


def get_user_by_id(user_id: str):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_email_hash(email_hash: str):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email_hash = ?", (email_hash,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None


def update_user(user_id: str, **fields):
    allowed = {
        "name", "age", "vault_pin_hash", "profile_complete", "role", "worry", "language",
        "password_hash", "personal_knowledge", "avatar",
    }
    parts, values = [], []

    for k, v in fields.items():
        if k in allowed:
            parts.append(f"{k} = ?")
            values.append(v)
    if not parts:
        return
    values.append(user_id)
    conn = get_db()
    c = conn.cursor()
    c.execute(f"UPDATE users SET {', '.join(parts)} WHERE id = ?", values)
    conn.commit()
    conn.close()


def get_user_knowledge(user_id: str) -> dict:
    """Retrieve the evolving personal profile and knowledge for this user."""
    user = get_user_by_id(user_id)
    if not user:
        return {}
    raw = user.get("personal_knowledge")
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except Exception:
        return {}


def save_user_knowledge(user_id: str, new_answers: dict) -> dict:
    """
    Incrementally merges newly provided answers (salary, city, family, debts, etc.)
    into the user's permanent, evolving profile so the AI gets smarter over time.
    """
    if not user_id or not new_answers:
        return {}
    
    current = get_user_knowledge(user_id)
    
    # Filter out empty keys
    cleaned = {k: v for k, v in new_answers.items() if v is not None and str(v).strip()}
    
    # Normalize common keys
    for k, v in cleaned.items():
        current[k] = v
        
    current["_last_updated"] = datetime.now().isoformat()
    current["_update_count"] = current.get("_update_count", 0) + 1
    
    update_user(user_id, personal_knowledge=json.dumps(current))
    return current

