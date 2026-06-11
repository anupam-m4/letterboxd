from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from database import get_db
from models import Movie, Review, ReviewLike, WatchedMovie, User
from schemas import ReviewCreate, ReviewUpdate
from deps import get_current_user
import tmdb as tmdb_client

router = APIRouter()


def _fmt(r: Review, user: User | None = None, movie: Movie | None = None) -> dict:
    out: dict = {
        "id": r.id,
        "content": r.content,
        "rating": r.rating,
        "likes_count": r.likes_count,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
    }
    if user:
        out["user"] = {"id": user.id, "username": user.username, "avatar_url": user.avatar_url}
    if movie:
        out["movie"] = {
            "id": movie.id,
            "tmdb_id": movie.tmdb_id,
            "title": movie.title,
            "poster_path": tmdb_client.build_image_url(movie.poster_path),
            "release_date": str(movie.release_date) if movie.release_date else None,
        }
    return out


def _ensure_movie(tmdb_id: int, db: Session) -> Movie:
    movie = db.query(Movie).filter(Movie.tmdb_id == tmdb_id).first()
    if not movie:
        try:
            data = tmdb_client.get_movie_by_id(tmdb_id)
            movie = Movie(
                tmdb_id=data["id"],
                title=data.get("title", ""),
                release_date=data.get("release_date") or None,
                poster_path=data.get("poster_path"),
                backdrop_path=data.get("backdrop_path"),
                overview=data.get("overview"),
                genres=[g["name"] for g in data.get("genres", [])],
                runtime=data.get("runtime"),
                vote_average=data.get("vote_average"),
            )
            db.add(movie)
            db.commit()
            db.refresh(movie)
        except Exception:
            raise HTTPException(404, "Movie not found")
    return movie


@router.get("/recent")
def recent_reviews(limit: int = 10, db: Session = Depends(get_db)):
    limit = min(limit, 50)
    rows = (
        db.query(Review, User, Movie)
        .join(User, Review.user_id == User.id)
        .join(Movie, Review.movie_id == Movie.id)
        .order_by(Review.created_at.desc())
        .limit(limit)
        .all()
    )
    return {"reviews": [_fmt(r, u, m) for r, u, m in rows]}


@router.post("/", status_code=201)
def create_review(body: ReviewCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not (1 <= body.rating <= 10):
        raise HTTPException(400, "Rating must be between 1 and 10")
    movie = _ensure_movie(body.tmdbId, db)

    if db.query(Review).filter_by(user_id=current_user.id, movie_id=movie.id).first():
        raise HTTPException(409, "You have already reviewed this movie")

    review = Review(user_id=current_user.id, movie_id=movie.id, content=body.content, rating=body.rating)
    db.add(review)

    if not db.query(WatchedMovie).filter_by(user_id=current_user.id, movie_id=movie.id).first():
        db.add(WatchedMovie(user_id=current_user.id, movie_id=movie.id))

    db.commit()
    db.refresh(review)
    return {"review": _fmt(review, current_user, movie)}


@router.put("/{review_id}")
def update_review(review_id: str, body: ReviewUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(404, "Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")

    review.content = body.content
    review.rating = body.rating
    review.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(review)
    return {"review": _fmt(review)}


@router.delete("/{review_id}", status_code=204)
def delete_review(review_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(404, "Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    db.delete(review)
    db.commit()
    return Response(status_code=204)


@router.post("/{review_id}/like")
def like_review(review_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(404, "Review not found")

    existing = db.query(ReviewLike).filter_by(user_id=current_user.id, review_id=review_id).first()
    if existing:
        db.delete(existing)
        review.likes_count = max(0, (review.likes_count or 0) - 1)
        db.commit()
        return {"liked": False, "likes_count": review.likes_count}

    db.add(ReviewLike(user_id=current_user.id, review_id=review_id))
    review.likes_count = (review.likes_count or 0) + 1
    db.commit()
    return {"liked": True, "likes_count": review.likes_count}
