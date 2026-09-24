"""
==============================================================================
THUNDERS GENERATIVE - AUTHENTICATION, ACCESS CONTROL & QUOTA GUARD SYSTEM
File: app/api/auth.py
Description: Production-grade security featuring Bcrypt hashing, JWT auth,
             Server-to-Server API Key validation, Role-Based Access Control
             (RBAC), and Rate Limiting / Quota Guard for AI-Core endpoints.
Repository: Thunders Generative
==============================================================================
"""

import os
import time
import hmac
import hashlib
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta, timezone
from enum import Enum

from fastapi import APIRouter, Depends, HTTPException, Security, status, Request
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, EmailStr
import jwt
from passlib.context import CryptContext

# ------------------------------------------------------------------------------
# 1. SECURITY CONFIGURATION & CONSTANTS
# ------------------------------------------------------------------------------

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "thunders-generative-super-secret-key-change-in-prod-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

# Password Hashing Engine (Bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Header Definitions
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)
api_key_header = APIKeyHeader(name="X-Thunder-API-Key", auto_error=False)

# ------------------------------------------------------------------------------
# 2. ENUMS & SCHEMAS
# ------------------------------------------------------------------------------

class UserRole(str, Enum):
    ADMIN = "admin"
    DEVELOPER = "developer"
    ENTERPRISE = "enterprise"
    USER = "user"

# Quota/Rate Limits (Requests per Minute) berdasarkan Role
ROLE_RATE_LIMITS: Dict[UserRole, int] = {
    UserRole.USER: 10,           # 10 req/min
    UserRole.DEVELOPER: 60,      # 60 req/min
    UserRole.ENTERPRISE: 300,    # 300 req/min
    UserRole.ADMIN: 1000         # 1000 req/min
}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.USER

class UserResponse(BaseModel):
    user_id: str
    username: str
    email: EmailStr
    role: UserRole
    is_active: bool
    api_key_masked: Optional[str] = None

class APIKeyGenerateResponse(BaseModel):
    api_key: str
    message: str

# Mock Databases
MOCK_USER_DB: Dict[str, Dict[str, Any]] = {}
MOCK_API_KEYS: Dict[str, str] = {}  # Maps API Key -> Username
RATE_LIMIT_TRACKER: Dict[str, List[float]] = {}  # Maps User ID -> Timestamps List

# ------------------------------------------------------------------------------
# 3. HELPER UTILITIES & SECURITY LOGIC
# ------------------------------------------------------------------------------

def hash_password(password: str) -> str:
    """Hashes plain text passwords using Bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Encodes JWT access tokens with expiration timestamps."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def generate_secure_api_key(username: str) -> str:
    """Generates a cryptographically secure API key prefix for server-to-server AI-Core requests."""
    raw = f"{username}:{time.time()}:{SECRET_KEY}"
    signature = hmac.new(SECRET_KEY.encode(), raw.encode(), hashlib.sha256).hexdigest()
    return f"thx_live_{signature[:32]}"

# ------------------------------------------------------------------------------
# 4. DEPENDENCY INJECTION, RBAC & RATE LIMIT GUARD
# ------------------------------------------------------------------------------

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    api_key: Optional[str] = Depends(api_key_header)
) -> Dict[str, Any]:
    """Validates identity via JWT Token OR X-Thunder-API-Key header."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Provide a valid JWT token or API Key.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 1. API Key Authentication Check
    if api_key:
        if api_key in MOCK_API_KEYS:
            username = MOCK_API_KEYS[api_key]
            user = MOCK_USER_DB.get(username)
            if user and user["is_active"]:
                return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API Key."
        )

    # 2. JWT Bearer Token Check
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                raise credentials_exception
        except jwt.PyJWTError:
            raise credentials_exception

        user = MOCK_USER_DB.get(username)
        if user is None or not user["is_active"]:
            raise credentials_exception
        return user

    raise credentials_exception

class RoleChecker:
    """RBAC Guard decorator class to enforce permission levels across endpoints."""
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: Dict[str, Any] = Depends(get_current_user)):
        if user["role"] not in [r.value for r in self.allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{user['role']}' lacks permission to access this resource."
            )
        return user

class QuotaGuard:
    """Rate Limiter & Quota Guard utilizing Sliding Window Algorithm."""
    def __call__(self, user: Dict[str, Any] = Depends(get_current_user)):
        user_id = user["user_id"]
        user_role = UserRole(user["role"])
        max_requests = ROLE_RATE_LIMITS.get(user_role, 10)
        
        now = time.time()
        window_start = now - 60.0  # Window 60 detik

        # Inisialisasi atau bersihkan request log yang sudah kadaluwarsa (> 60 detik)
        if user_id not in RATE_LIMIT_TRACKER:
            RATE_LIMIT_TRACKER[user_id] = []
        
        RATE_LIMIT_TRACKER[user_id] = [t for t in RATE_LIMIT_TRACKER[user_id] if t > window_start]

        # Validasi limit request
        if len(RATE_LIMIT_TRACKER[user_id]) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Allowed limit for role '{user_role.value}' is {max_requests} requests/minute."
            )

        # Catat timestamp request saat ini
        RATE_LIMIT_TRACKER[user_id].append(now)
        return user

# Instansiasi Guards
require_admin = RoleChecker([UserRole.ADMIN])
require_developer_or_above = RoleChecker([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.ENTERPRISE])
apply_quota_guard = QuotaGuard()

# ------------------------------------------------------------------------------
# 5. AUTHENTICATION ROUTER
# ------------------------------------------------------------------------------

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication & Security"],
    responses={401: {"description": "Unauthorized"}},
)

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User"
)
async def register_user(payload: UserRegisterRequest):
    if payload.username in MOCK_USER_DB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered."
        )

    user_id = f"usr_{hashlib.md5(payload.username.encode()).hexdigest()[:10]}"
    hashed_pwd = hash_password(payload.password)
    api_key = generate_secure_api_key(payload.username)

    user_record = {
        "user_id": user_id,
        "username": payload.username,
        "email": payload.email,
        "hashed_password": hashed_pwd,
        "role": payload.role.value,
        "is_active": True,
        "api_key": api_key
    }

    MOCK_USER_DB[payload.username] = user_record
    MOCK_API_KEYS[api_key] = payload.username

    return UserResponse(
        user_id=user_id,
        username=payload.username,
        email=payload.email,
        role=payload.role,
        is_active=True,
        api_key_masked=f"{api_key[:10]}...{api_key[-4:]}"
    )

@router.post(
    "/login",
    response_model=Token,
    summary="Login for Access Token"
)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = MOCK_USER_DB.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in_seconds=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get Current User Profile"
)
async def get_me(current_user: Dict[str, Any] = Depends(apply_quota_guard)):
    api_k = current_user.get("api_key", "")
    return UserResponse(
        user_id=current_user["user_id"],
        username=current_user["username"],
        email=current_user["email"],
        role=UserRole(current_user["role"]),
        is_active=current_user["is_active"],
        api_key_masked=f"{api_k[:10]}...{api_k[-4:]}" if api_k else None
    )

@router.post(
    "/keys/rotate",
    response_model=APIKeyGenerateResponse,
    summary="Rotate API Key"
)
async def rotate_api_key(current_user: Dict[str, Any] = Depends(require_developer_or_above)):
    username = current_user["username"]
    
    # Revoke key lama
    old_key = current_user.get("api_key")
    if old_key in MOCK_API_KEYS:
        del MOCK_API_KEYS[old_key]

    # Buat key baru
    new_key = generate_secure_api_key(username)
    MOCK_USER_DB[username]["api_key"] = new_key
    MOCK_API_KEYS[new_key] = username

    return APIKeyGenerateResponse(
        api_key=new_key,
        message="New API Key generated successfully."
    )
