from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ReviewCreate(BaseModel):
    tmdbId: int
    content: str
    rating: int


class ReviewUpdate(BaseModel):
    content: str
    rating: int


class WatchlistRequest(BaseModel):
    tmdbId: int


class WatchedRequest(BaseModel):
    tmdbId: int


class ProfileUpdate(BaseModel):
    bio: str | None = None
    avatar_url: str | None = None
