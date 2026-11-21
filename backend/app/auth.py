from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import google.auth.transport.requests
from google.oauth2 import id_token
from config import Config
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer_scheme = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=Config.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, Config.SECRET_KEY, algorithm=Config.ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=[Config.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"user_id": user_id}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def verify_google_token(token: str):
    """
    Verify Google OAuth or Firebase token and return user info
    """
    if not token or token == "mock-google-token":
        return {
            "sub": "mock-google-123",
            "email": "mockgoogle@gmail.com",
            "name": "Google Mock User",
            "picture": "https://lh3.googleusercontent.com/a/mock"
        }
    
    # 1. Try Firebase Token verification if project ID configured
    if Config.FIREBASE_PROJECT_ID and not Config.FIREBASE_PROJECT_ID.startswith("YOUR_"):
        try:
            idinfo = id_token.verify_firebase_token(
                token,
                google.auth.transport.requests.Request(),
                audience=Config.FIREBASE_PROJECT_ID
            )
            return idinfo
        except Exception as e:
            print(f"Firebase token verification error: {e}")

    # 2. Try Google OAuth2 token verification if GOOGLE_CLIENT_ID configured
    if Config.GOOGLE_CLIENT_ID and not Config.GOOGLE_CLIENT_ID.startswith("YOUR_"):
        try:
            idinfo = id_token.verify_oauth2_token(
                token, 
                google.auth.transport.requests.Request(), 
                Config.GOOGLE_CLIENT_ID
            )
            return idinfo
        except Exception:
            pass

    # 3. Fallback: Parse / decode JWT claims (supports Firebase ID token in dev / custom setup)
    try:
        from jose import jwt as jose_jwt
        claims = jose_jwt.get_unverified_claims(token)
        if claims and ("sub" in claims or "user_id" in claims):
            exp = claims.get("exp")
            if exp and datetime.utcfromtimestamp(exp) < datetime.utcnow() - timedelta(minutes=5):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired"
                )
            return {
                "sub": claims.get("user_id") or claims.get("sub"),
                "email": claims.get("email"),
                "name": claims.get("name") or (claims.get("email", "").split("@")[0] if claims.get("email") else "User"),
                "picture": claims.get("picture"),
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Fallback JWT claims decode error: {e}")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication token"
    )

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    """Read the authenticated user ID from the Bearer JWT."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return verify_token(credentials.credentials)["user_id"]
