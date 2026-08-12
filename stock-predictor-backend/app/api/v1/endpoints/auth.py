"""
Authentication endpoints (Register, Login, VIP Demo Login, Current User).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.schemas.user import UserCreate, UserLogin, Token, UserOut
from app.models.user import User
from app.services.auth_service import auth_service

router = APIRouter()

@router.post("/register", response_model=Token, summary="Đăng ký tài khoản mới")
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Token:
    """Registers a new user account and returns JWT token."""
    return auth_service.register_user(db, user_in)

@router.post("/login", response_model=Token, summary="Đăng nhập tài khoản")
def login(user_login: UserLogin, db: Session = Depends(get_db)) -> Token:
    """Authenticates user and returns JWT token."""
    return auth_service.login_user(db, user_login)

@router.post("/demo-login", response_model=Token, summary="Đăng nhập siêu tốc tài khoản VIP Demo")
def demo_login(db: Session = Depends(get_db)) -> Token:
    """Instantly logs in with Demo VIP account."""
    return auth_service.demo_login(db)

@router.get("/me", response_model=UserOut, summary="Lấy thông tin tài khoản hiện tại")
def get_me(current_user: User = Depends(get_current_active_user)) -> UserOut:
    """Returns currently authenticated user profile."""
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        name=current_user.full_name,
        full_name=current_user.full_name,
        plan=current_user.plan,
        avatar=current_user.avatar,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )
