from database_local import (
    save_contract as local_save_contract,
    update_contract as local_update_contract,
    save_clause as local_save_clause,
    get_contract as local_get_contract,
    get_clauses as local_get_clauses,
    get_all_contracts as local_get_all_contracts,
    save_feedback as local_save_feedback,
    save_profile as local_save_profile,
    get_profile as local_get_profile,
    save_chat_turn as local_save_chat_turn,
    get_chat_history as local_get_chat_history,
    update_contract_meta as local_update_contract_meta,
    delete_clauses as local_delete_clauses,
    delete_contract as local_delete_contract,
    get_user_knowledge as local_get_user_knowledge,
    save_user_knowledge as local_save_user_knowledge,
)

def get_user_knowledge(*args, **kwargs):
    return local_get_user_knowledge(*args, **kwargs)

def save_user_knowledge(*args, **kwargs):
    return local_save_user_knowledge(*args, **kwargs)

def save_contract(*args, **kwargs):
    return local_save_contract(*args, **kwargs)

def update_contract(*args, **kwargs):
    return local_update_contract(*args, **kwargs)

def save_clause(*args, **kwargs):
    return local_save_clause(*args, **kwargs)

def get_contract(*args, **kwargs):
    return local_get_contract(*args, **kwargs)

def get_clauses(*args, **kwargs):
    return local_get_clauses(*args, **kwargs)

def get_all_contracts(*args, **kwargs):
    return local_get_all_contracts(*args, **kwargs)

def save_feedback(*args, **kwargs):
    return local_save_feedback(*args, **kwargs)

def save_profile(*args, **kwargs):
    return local_save_profile(*args, **kwargs)

def get_profile(*args, **kwargs):
    return local_get_profile(*args, **kwargs)

def save_chat_turn(*args, **kwargs):
    return local_save_chat_turn(*args, **kwargs)

def get_chat_history(*args, **kwargs):
    return local_get_chat_history(*args, **kwargs)

def update_contract_meta(*args, **kwargs):
    return local_update_contract_meta(*args, **kwargs)

def delete_clauses(*args, **kwargs):
    return local_delete_clauses(*args, **kwargs)

def delete_contract(*args, **kwargs):
    return local_delete_contract(*args, **kwargs)
