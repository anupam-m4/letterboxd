from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, Review, Movie, Watchlist, WatchedMovie, Follow
from schemas import ProfileUpdate
from deps import get_current_user, optional_user
import tmdb as tmdb_client

router = APIRouter()


@router.get("/search")
def search_users(q: str = Query(""), current_user: User | None = Depends(optional_user), db: Session = Depends(get_db)):
    if not q.strip():
        return {"users": []}
    query = db.query(User).filter(User.username.ilike(f"%{q.strip()}%"))
    if current_user:
        query = query.filter(User.id != current_user.id)
    rows = query.limit(20).all()

    if not current_user or not rows:
        return {"users": [{"id": u.id, "username": u.username, "bio": u.bio, "avatar_url": u.avatar_url, "is_following": False} for u in rows]}

    target_ids = [u.id for u in rows]
    followed_ids = {
        f.following_id for f in
        db.query(Follow).filter(Follow.follower_id == current_user.id, Follow.following_id.in_(target_ids)).all()
    }
    return {"users": [{"id": u.id, "username": u.username, "bio": u.bio, "avatar_url": u.avatar_url, "is_following": u.id in followed_ids} for u in rows]}


@router.get("/me/following")
def get_my_following(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    follows = (
        db.query(User.username)
        .join(Follow, Follow.following_id == User.id)
        .filter(Follow.follower_id == current_user.id)
        .all()
    )
    return {"following": [row.username for row in follows]}


@router.put("/profile")
def update_profile(body: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.bio is not None:
        current_user.bio = body.bio
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url
    db.commit()
    db.refresh(current_user)
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "bio": current_user.bio,
        "avatar_url": current_user.avatar_url,
    }


@router.get("/{username}")
def get_profile(username: str, current_user: User | None = Depends(optional_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")

    reviews_count = db.query(Review).filter(Review.user_id == user.id).count()
    watchlist_count = db.query(Watchlist).filter(Watchlist.user_id == user.id).count()
    watched_count = db.query(WatchedMovie).filter(WatchedMovie.user_id == user.id).count()
    followers_count = db.query(Follow).filter(Follow.following_id == user.id).count()
    following_count = db.query(Follow).filter(Follow.follower_id == user.id).count()

    is_following = False
    if current_user and current_user.id != user.id:
        is_following = bool(db.query(Follow).filter_by(follower_id=current_user.id, following_id=user.id).first())

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "bio": user.bio,
            "avatar_url": user.avatar_url,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        },
        "stats": {
            "reviews": reviews_count,
            "watchlist": watchlist_count,
            "watched": watched_count,
            "followers": followers_count,
            "following": following_count,
        },
        "isFollowing": is_following,
    }


@router.get("/{username}/reviews")
def user_reviews(username: str, page: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")

    limit = 12
    offset = (page - 1) * limit
    total = db.query(Review).filter(Review.user_id == user.id).count()
    rows = (
        db.query(Review, Movie)
        .join(Movie, Review.movie_id == Movie.id)
        .filter(Review.user_id == user.id)
        .order_by(Review.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    reviews = [
        {
            "id": r.id,
            "content": r.content,
            "rating": r.rating,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "movie": {
                "id": m.id,
                "tmdb_id": m.tmdb_id,
                "title": m.title,
                "poster_path": tmdb_client.build_image_url(m.poster_path),
                "release_date": str(m.release_date) if m.release_date else None,
            },
        }
        for r, m in rows
    ]
    return {"reviews": reviews, "pagination": {"page": page, "total": total, "pages": -(-total // limit)}}


@router.get("/{username}/watchlist")
def user_watchlist(username: str, page: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")

    limit = 20
    offset = (page - 1) * limit
    total = db.query(Watchlist).filter(Watchlist.user_id == user.id).count()
    rows = (
        db.query(Watchlist, Movie)
        .join(Movie, Watchlist.movie_id == Movie.id)
        .filter(Watchlist.user_id == user.id)
        .order_by(Watchlist.added_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    movies = [
        {
            "id": w.id,
            "added_at": w.added_at.isoformat() if w.added_at else None,
            "movie": {
                "id": m.id,
                "tmdb_id": m.tmdb_id,
                "title": m.title,
                "poster_path": tmdb_client.build_image_url(m.poster_path),
                "release_date": str(m.release_date) if m.release_date else None,
            },
        }
        for w, m in rows
    ]
    return {"movies": movies, "pagination": {"page": page, "total": total, "pages": -(-total // limit)}}


@router.get("/{username}/watched")
def user_watched(username: str, page: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")

    limit = 20
    offset = (page - 1) * limit
    total = db.query(WatchedMovie).filter(WatchedMovie.user_id == user.id).count()
    rows = (
        db.query(WatchedMovie, Movie)
        .join(Movie, WatchedMovie.movie_id == Movie.id)
        .filter(WatchedMovie.user_id == user.id)
        .order_by(WatchedMovie.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    movies = [
        {
            "id": w.id,
            "watched_at": str(w.watched_at) if w.watched_at else None,
            "movie": {
                "id": m.id,
                "tmdb_id": m.tmdb_id,
                "title": m.title,
                "poster_path": tmdb_client.build_image_url(m.poster_path),
                "release_date": str(m.release_date) if m.release_date else None,
            },
        }
        for w, m in rows
    ]
    return {"movies": movies, "pagination": {"page": page, "total": total, "pages": -(-total // limit)}}


@router.post("/{username}/follow")
def follow_user(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    target = db.query(User).filter(User.username == username).first()
    if not target:
        raise HTTPException(404, "User not found")
    if target.id == current_user.id:
        raise HTTPException(400, "Cannot follow yourself")
    if db.query(Follow).filter_by(follower_id=current_user.id, following_id=target.id).first():
        raise HTTPException(409, "Already following")
    db.add(Follow(follower_id=current_user.id, following_id=target.id))
    db.commit()
    return {"following": True}


@router.delete("/{username}/follow")
def unfollow_user(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    target = db.query(User).filter(User.username == username).first()
    if not target:
        raise HTTPException(404, "User not found")
    follow = db.query(Follow).filter_by(follower_id=current_user.id, following_id=target.id).first()
    if not follow:
        raise HTTPException(404, "Not following")
    db.delete(follow)
    db.commit()
    return {"following": False}
