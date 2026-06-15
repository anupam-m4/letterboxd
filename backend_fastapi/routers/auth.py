from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import RegisterRequest, LoginRequest
from auth import hash_password, verify_password, sign_token
from deps import get_current_user

router = APIRouter()


def _user_out(u: User) -> dict:
    return {
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "bio": u.bio,
        "avatar_url": u.avatar_url,
        "created_at": u.created_at.isoformat() if u.created_at else None,
    }


@router.post("/register", status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email.ilike(body.email)).first():
        raise HTTPException(409, "Email is already in use")
    if db.query(User).filter(User.username.ilike(body.username)).first():
        raise HTTPException(409, "Username is already taken")
    user = User(
        username=body.username,
        email=body.email.lower(),
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"user": _user_out(user), "token": sign_token(user.id, user.username)}


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(body.email)).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return {"user": _user_out(user), "token": sign_token(user.id, user.username)}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"user": _user_out(current_user)}
