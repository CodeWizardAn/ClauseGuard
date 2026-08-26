import os
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_auth: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

security = HTTPBearer()

def signup(email: str, password: str) -> dict:
    try:
        response = supabase_auth.auth.sign_up({
            "email": email,
            "password": password
        })
        if response.user:
            return {
                "success": True,
                "message": "Account created successfully",
                "user_id": response.user.id,
                "email": response.user.email
            }
        raise HTTPException(status_code=400, detail="Signup failed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def login(email: str, password: str) -> dict:
    try:
        response = supabase_auth.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        if response.user and response.session:
            return {
                "success": True,
                "access_token": response.session.access_token,
                "token_type": "bearer",
                "user_id": response.user.id,
                "email": response.user.email
            }
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

def logout(token: str) -> dict:
    try:
        supabase_auth.auth.sign_out()
        return {"success": True, "message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        response = supabase_auth.auth.get_user(token)
        if response.user:
            return {
                "user_id": response.user.id,
                "email": response.user.email
            }
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


if __name__ == "__main__":
    print("Auth module loaded successfully")
    print("Endpoints available: signup, login, logout, get_current_user")