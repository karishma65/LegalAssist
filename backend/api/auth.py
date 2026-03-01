from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from database.db import SessionLocal
from database.models import User
from auth.security import verify_password, create_access_token, hash_password
from pydantic import BaseModel
from auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# ======================
# LOGIN
# ======================
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.username == form_data.username
    ).first()

    if not user or not verify_password(
        form_data.password, user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    access_token = create_access_token(
        user_id=str(user.user_id),
        role=user.role
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }


# ======================
# REGISTER
# ======================
class RegisterInput(BaseModel):
    username: str
    password: str
    role: str  # client / lawyer


@router.post("/register")
def register_user(
    data: RegisterInput,
    db: Session = Depends(get_db)
):
    if data.role not in ["client", "lawyer"]:
        raise HTTPException(
            status_code=400,
            detail="Role must be 'client' or 'lawyer'"
        )

    existing_user = db.query(User).filter(
        User.username == data.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    new_user = User(
        username=data.username,
        password_hash=hash_password(data.password),
        role=data.role
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "User registered successfully",
        "username": data.username,
        "role": data.role
    }
#-==============================================
@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    db: Session = SessionLocal()

    try:
        db_user = db.query(User).filter(
            User.user_id == current_user["user_id"]
        ).first()

        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "user_id": str(db_user.user_id),
            "username": db_user.username,
            "role": db_user.role
        }

    finally:
        db.close()