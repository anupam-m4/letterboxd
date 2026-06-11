import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, Date, Float, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from database import Base


def _uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    username = Column(String(30), unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    bio = Column(Text, default=None)
    avatar_url = Column(Text, default=None)
    created_at = Column(DateTime, default=datetime.utcnow)


class Movie(Base):
    __tablename__ = "movies"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    tmdb_id = Column(Integer, unique=True, nullable=False)
    title = Column(String, nullable=False)
    release_date = Column(Date, default=None)
    poster_path = Column(String, default=None)
    backdrop_path = Column(String, default=None)
    overview = Column(Text, default=None)
    genres = Column(JSONB, default=list)
    runtime = Column(Integer, default=None)
    vote_average = Column(Float, default=None)
    created_at = Column(DateTime, default=datetime.utcnow)


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (UniqueConstraint("user_id", "movie_id"),)

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    movie_id = Column(UUID(as_uuid=False), ForeignKey("movies.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ReviewLike(Base):
    __tablename__ = "review_likes"
    __table_args__ = (UniqueConstraint("user_id", "review_id"),)

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    review_id = Column(UUID(as_uuid=False), ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Watchlist(Base):
    __tablename__ = "watchlist"
    __table_args__ = (UniqueConstraint("user_id", "movie_id"),)

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    movie_id = Column(UUID(as_uuid=False), ForeignKey("movies.id", ondelete="CASCADE"), nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)


class WatchedMovie(Base):
    __tablename__ = "watched_movies"
    __table_args__ = (UniqueConstraint("user_id", "movie_id"),)

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    movie_id = Column(UUID(as_uuid=False), ForeignKey("movies.id", ondelete="CASCADE"), nullable=False)
    watched_at = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)


class Follow(Base):
    __tablename__ = "follows"
    __table_args__ = (UniqueConstraint("follower_id", "following_id"),)

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    follower_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    following_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class JournalArticle(Base):
    __tablename__ = "journal_articles"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    title = Column(String(255), nullable=False)
    subtitle = Column(Text, default=None)
    category = Column(String(50), nullable=False)
    author = Column(String(100), nullable=False)
    image_url = Column(Text, default=None)
    published_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_featured = Column(Boolean, default=False)
    is_spotlight = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
