from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Review, User, Movie, Follow
from deps import get_current_user
import tmdb as tmdb_client

router = APIRouter()


@router.get("/feed")
def get_feed(page: int = 1, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    limit = 20
    offset = (page - 1) * limit

    following_ids = [
        f.following_id
        for f in db.query(Follow).filter(Follow.follower_id == current_user.id).all()
    ]

    if not following_ids:
        return {"activities": [], "pagination": {"page": page, "total": 0, "pages": 0}, "isEmpty": True}

    total = db.query(Review).filter(Review.user_id.in_(following_ids)).count()
    rows = (
        db.query(Review, User, Movie)
        .join(User, Review.user_id == User.id)
        .join(Movie, Review.movie_id == Movie.id)
        .filter(Review.user_id.in_(following_ids))
        .order_by(Review.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    activities = [
        {
            "id": r.id,
            "type": "review",
            "content": r.content,
            "rating": r.rating,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "user": {"id": u.id, "username": u.username, "avatar_url": u.avatar_url},
            "movie": {
                "id": m.id,
                "tmdb_id": m.tmdb_id,
                "title": m.title,
                "poster_path": tmdb_client.build_image_url(m.poster_path),
                "release_date": str(m.release_date) if m.release_date else None,
            },
        }
        for r, u, m in rows
    ]

    return {
        "activities": activities,
        "pagination": {"page": page, "total": total, "pages": -(-total // limit)},
        "isEmpty": False,
    }
