import os
from privacy import redact_pii

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VAULT_DIR = os.path.join(BASE_DIR, "uploads", "vault")
os.makedirs(VAULT_DIR, exist_ok=True)


def vault_path(contract_id: str) -> str:
    return os.path.join(VAULT_DIR, f"{contract_id}.txt")


def save_redacted_document(contract_id: str, text: str) -> str:
    """Store only the privacy-stripped text in the local vault."""
    path = vault_path(contract_id)
    with open(path, "w", encoding="utf-8") as f:
        f.write(redact_pii(text))
    return path


def read_document(contract_id: str) -> str:
    path = vault_path(contract_id)
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def delete_document(contract_id: str) -> bool:
    path = vault_path(contract_id)
    if os.path.exists(path):
        os.remove(path)
        return True
    return False


def list_vault_files() -> list:
    files = []
    for name in os.listdir(VAULT_DIR):
        if name.endswith(".txt"):
            files.append(os.path.join(VAULT_DIR, name))
    return files


def discard_original(file_path: str):
    """Delete the uploaded original so names/numbers are not kept on disk."""
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
    except OSError:
        pass


# Back-compat aliases used by older modules
def upload_file(file_path: str, filename: str, user_id: str) -> str:
    contract_id = os.path.splitext(os.path.basename(file_path))[0]
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()
    return save_redacted_document(contract_id, text)


def get_file_url(storage_path: str) -> str:
    return storage_path


def delete_file(storage_path: str) -> bool:
    try:
        if os.path.exists(storage_path):
            os.remove(storage_path)
        return True
    except OSError:
        return False
