from fastapi import Depends, HTTPException, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError
from database import get_db
from models import User
from auth import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = verify_token(token)
        user = db.query(User).filter(User.id == payload["id"]).first()
        if not user:
            raise HTTPException(401, "Authentication required")
        return user
    except JWTError:
        raise HTTPException(401, "Authentication required")


def optional_user(authorization: str | None = Header(None), db: Session = Depends(get_db)) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    try:
        payload = verify_token(token)
        return db.query(User).filter(User.id == payload["id"]).first()
    except Exception:
        return None
