"""
Service layer for User authentication, registration, and profile management.
"""
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, Token, UserOut
from app.core.security import verify_password, get_password_hash, create_access_token

class AuthService:
    """Handles User Authentication and JWT tokens."""

    def register_user(self, db: Session, user_in: UserCreate) -> Token:
        """Registers a new user and returns their access token."""
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email đã được đăng ký trong hệ thống."
            )

        full_name = user_in.name if user_in.name else user_in.email.split('@')[0].upper()
        avatar = f"https://api.dicebear.com/7.x/bottts-neutral/svg?seed={user_in.email}"

        new_user = User(
            email=user_in.email,
            full_name=full_name,
            hashed_password=get_password_hash(user_in.password),
            plan="Premium AI Alpha",
            avatar=avatar,
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token_str = create_access_token(subject=str(new_user.id))
        user_out = UserOut(
            id=new_user.id,
            email=new_user.email,
            name=new_user.full_name,
            full_name=new_user.full_name,
            plan=new_user.plan,
            avatar=new_user.avatar,
            is_active=new_user.is_active,
            created_at=new_user.created_at
        )

        return Token(access_token=token_str, token_type="bearer", user=user_out)

    def login_user(self, db: Session, user_login: UserLogin) -> Token:
        """Authenticates a user and returns an access token."""
        user = db.query(User).filter(User.email == user_login.email).first()
        if not user or not verify_password(user_login.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email hoặc mật khẩu không chính xác."
            )

        token_str = create_access_token(subject=str(user.id))
        user_out = UserOut(
            id=user.id,
            email=user.email,
            name=user.full_name,
            full_name=user.full_name,
            plan=user.plan,
            avatar=user.avatar,
            is_active=user.is_active,
            created_at=user.created_at
        )

        return Token(access_token=token_str, token_type="bearer", user=user_out)

    def demo_login(self, db: Session) -> Token:
        """Provides instant VIP Demo access."""
        demo_email = "investor@vn30alpha.ai"
        user = db.query(User).filter(User.email == demo_email).first()
        if not user:
            user = User(
                email=demo_email,
                full_name="Nhà Đầu Tư Alpha VIP",
                hashed_password=get_password_hash("password123"),
                plan="Premium AI Alpha VIP",
                avatar="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=VN30_Investor",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        token_str = create_access_token(subject=str(user.id))
        user_out = UserOut(
            id=user.id,
            email=user.email,
            name=user.full_name,
            full_name=user.full_name,
            plan=user.plan,
            avatar=user.avatar,
            is_active=user.is_active,
            created_at=user.created_at
        )

        return Token(access_token=token_str, token_type="bearer", user=user_out)

    def get_user_by_id(self, db: Session, user_id: int) -> Optional[User]:
        """Fetches user by database ID."""
        return db.query(User).filter(User.id == user_id).first()

auth_service = AuthService()
