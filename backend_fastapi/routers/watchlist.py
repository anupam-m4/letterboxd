from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Movie, Watchlist, WatchedMovie, User
from schemas import WatchlistRequest, WatchedRequest
from deps import get_current_user
import tmdb as tmdb_client

router = APIRouter()


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


@router.post("/watchlist", status_code=201)
def add_to_watchlist(body: WatchlistRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    movie = _ensure_movie(body.tmdbId, db)
    if db.query(Watchlist).filter_by(user_id=current_user.id, movie_id=movie.id).first():
        raise HTTPException(409, "Already in watchlist")
    db.add(Watchlist(user_id=current_user.id, movie_id=movie.id))
    db.commit()
    return {"inWatchlist": True, "movie": {"tmdb_id": movie.tmdb_id, "title": movie.title}}


@router.delete("/watchlist/{tmdb_id}")
def remove_from_watchlist(tmdb_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.tmdb_id == tmdb_id).first()
    if not movie:
        raise HTTPException(404, "Not in watchlist")
    entry = db.query(Watchlist).filter_by(user_id=current_user.id, movie_id=movie.id).first()
    if not entry:
        raise HTTPException(404, "Not in watchlist")
    db.delete(entry)
    db.commit()
    return {"inWatchlist": False}


@router.post("/watched", status_code=201)
def mark_watched(body: WatchedRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    movie = _ensure_movie(body.tmdbId, db)
    if db.query(WatchedMovie).filter_by(user_id=current_user.id, movie_id=movie.id).first():
        raise HTTPException(409, "Already marked as watched")
    db.add(WatchedMovie(user_id=current_user.id, movie_id=movie.id))
    db.commit()
    return {"watched": True}


@router.delete("/watched/{tmdb_id}")
def unmark_watched(tmdb_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.tmdb_id == tmdb_id).first()
    if not movie:
        return {"watched": False}
    entry = db.query(WatchedMovie).filter_by(user_id=current_user.id, movie_id=movie.id).first()
    if not entry:
        return {"watched": False}
    db.delete(entry)
    db.commit()
    return {"watched": False}
