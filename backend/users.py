import os
import json
import re
import uuid

import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from crypto_util import lookup_hash, encrypt_text, decrypt_text
from database_local import create_user, get_user_by_id, get_user_by_email_hash, update_user

JWT_SECRET = os.getenv("JWT_SECRET") or "clauseguard-local-session-key"
JWT_ALG = "HS256"
security = HTTPBearer(auto_error=False)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$")
PHONE_RE = re.compile(r"^[6-9]\d{9}$")


def validate_email(email: str) -> str:
    email = (email or "").strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Enter a valid email address, like name@gmail.com")
    return email


def validate_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone or "")
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    if not PHONE_RE.match(digits):
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit mobile number")
    return digits


def validate_password(password: str) -> str:
    if not password or len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if not password[0].isupper():
        raise HTTPException(status_code=400, detail="Password must start with a capital letter")
    return password


def validate_pin(pin: str) -> str:
    pin = (pin or "").strip()
    if not re.fullmatch(r"\d{4}", pin):
        raise HTTPException(status_code=400, detail="Vault PIN must be exactly 4 digits")
    return pin


def hash_secret(value: str) -> str:
    return bcrypt.hashpw(value.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_secret(value: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(value.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def make_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=14),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def read_token(token: str) -> str:
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return data.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Please log in again")


def public_user(row: dict) -> dict:
    if not row:
        return None
    pk_raw = row.get("personal_knowledge")
    try:
        pk = json.loads(pk_raw) if pk_raw else {}
    except Exception:
        pk = {}
        
    return {
        "user_id": row["id"],
        "name": row["name"],
        "age": row["age"],
        "email": decrypt_text(row.get("email_enc")),
        "phone_masked": _mask_phone(decrypt_text(row.get("phone_enc"))),
        "profile_complete": bool(row.get("profile_complete")),
        "has_vault_pin": bool(row.get("vault_pin_hash")),
        "role": row.get("role") or "",
        "worry": row.get("worry") or "",
        "language": row.get("language") or "en",
        "personal_knowledge": pk,
    }



def _mask_phone(phone: str) -> str:
    if not phone or len(phone) < 4:
        return "****"
    return "******" + phone[-4:]


def register_user(name: str, age: int, phone: str, email: str, password: str) -> dict:
    name = (name or "").strip()
    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Please enter your full name")
    try:
        age = int(age)
    except Exception:
        raise HTTPException(status_code=400, detail="Age must be a number")
    if age < 13 or age > 120:
        raise HTTPException(status_code=400, detail="Age must be between 13 and 120")

    email = validate_email(email)
    phone = validate_phone(phone)
    password = validate_password(password)

    if get_user_by_email_hash(lookup_hash(email)):
        raise HTTPException(status_code=400, detail="This email is already registered. Please log in.")

    user_id = str(uuid.uuid4())
    create_user({
        "id": user_id,
        "name": name,
        "age": age,
        "email_hash": lookup_hash(email),
        "email_enc": encrypt_text(email),
        "phone_hash": lookup_hash(phone),
        "phone_enc": encrypt_text(phone),
        "password_hash": hash_secret(password),
    })
    row = get_user_by_id(user_id)
    return {"token": make_token(user_id), "user": public_user(row)}


def login_user(email: str, password: str) -> dict:
    email = validate_email(email)
    row = get_user_by_email_hash(lookup_hash(email))
    if not row or not check_secret(password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Email or password is incorrect")
    return {"token": make_token(row["id"]), "user": public_user(row)}


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    token: str = None,
) -> dict:
    raw = token
    if credentials and credentials.credentials:
        raw = credentials.credentials
    if not raw:
        raise HTTPException(status_code=401, detail="Please log in first")
    user_id = read_token(raw)
    row = get_user_by_id(user_id)
    if not row:
        raise HTTPException(status_code=401, detail="Account not found")
    return public_user(row)


def complete_setup(user_id: str, role: str, worry: str, language: str, pin: str) -> dict:
    pin = validate_pin(pin)
    update_user(
        user_id,
        role=role,
        worry=worry,
        language=language or "en",
        vault_pin_hash=hash_secret(pin),
        profile_complete=1,
    )
    return public_user(get_user_by_id(user_id))


def verify_vault_pin(user_id: str, pin: str) -> bool:
    row = get_user_by_id(user_id)
    if not row or not row.get("vault_pin_hash"):
        raise HTTPException(status_code=400, detail="Set up your vault PIN first")
    if not check_secret(pin, row["vault_pin_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect PIN")
    return True
