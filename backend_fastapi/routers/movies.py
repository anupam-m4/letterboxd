from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Movie, Review, Watchlist, WatchedMovie, User
from deps import optional_user
import tmdb as tmdb_client

router = APIRouter()

GENRE_IDS = {
    "Action": 28, "Adventure": 12, "Animation": 16, "Comedy": 35, "Crime": 80,
    "Documentary": 99, "Drama": 18, "Family": 10751, "Fantasy": 14, "History": 36,
    "Horror": 27, "Music": 10402, "Mystery": 9648, "Romance": 10749,
    "Science Fiction": 878, "TV Movie": 10770, "Thriller": 53, "War": 10752, "Western": 37,
}

SORT_MAP = {
    "popularity": "popularity.desc",
    "rating": "vote_average.desc",
    "release_date": "release_date.desc",
    "title": "original_title.asc",
}


def _format_movie(movie: Movie) -> dict:
    return {
        "id": movie.id,
        "tmdb_id": movie.tmdb_id,
        "title": movie.title,
        "release_date": str(movie.release_date) if movie.release_date else None,
        "poster_path": tmdb_client.build_image_url(movie.poster_path),
        "backdrop_path": tmdb_client.build_image_url(movie.backdrop_path),
        "overview": movie.overview,
        "genres": movie.genres or [],
        "runtime": movie.runtime,
        "vote_average": movie.vote_average,
    }


def _upsert_movie(data: dict, db: Session) -> Movie:
    movie = db.query(Movie).filter(Movie.tmdb_id == data["id"]).first()
    if not movie:
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
    return movie


@router.get("/search")
def search(q: str = Query(..., min_length=1), page: int = 1):
    data = tmdb_client.search_movies(q, page)
    return {
        "results": [tmdb_client.format_tmdb_result(r) for r in data.get("results", [])],
        "page": data.get("page", 1),
        "total_pages": data.get("total_pages", 0),
        "total_results": data.get("total_results", 0),
    }


@router.get("/discover")
def discover(
    genres: str | None = None,
    sort_by: str = "popularity",
    vote_gte: float | None = None,
    release_from: str | None = None,
    release_to: str | None = None,
    page: int = 1,
):
    genre_ids = None
    if genres:
        ids = [str(GENRE_IDS[g.strip()]) for g in genres.split(",") if g.strip() in GENRE_IDS]
        genre_ids = ",".join(ids) if ids else None

    data = tmdb_client.discover_movies(
        genre_ids=genre_ids,
        sort_by=SORT_MAP.get(sort_by, "popularity.desc"),
        vote_gte=vote_gte,
        release_from=release_from,
        release_to=release_to,
        page=page,
    )
    return {
        "results": [tmdb_client.format_tmdb_result(r) for r in data.get("results", [])],
        "page": data.get("page", 1),
        "total_pages": data.get("total_pages", 0),
        "total_results": data.get("total_results", 0),
    }


@router.get("/popular")
def popular(page: int = 1):
    data = tmdb_client.get_popular(page)
    return {
        "results": [tmdb_client.format_tmdb_result(r) for r in data.get("results", [])],
        "page": data.get("page", 1),
        "total_pages": data.get("total_pages", 0),
    }


@router.get("/top-rated")
def top_rated(page: int = 1):
    data = tmdb_client.get_top_rated(page)
    return {
        "results": [tmdb_client.format_tmdb_result(r) for r in data.get("results", [])],
        "page": data.get("page", 1),
        "total_pages": data.get("total_pages", 0),
    }


@router.get("/now-playing")
def now_playing(page: int = 1):
    data = tmdb_client.get_now_playing(page)
    return {
        "results": [tmdb_client.format_tmdb_result(r) for r in data.get("results", [])],
        "page": data.get("page", 1),
        "total_pages": data.get("total_pages", 0),
    }


@router.get("/{tmdb_id}")
def movie_detail(
    tmdb_id: int,
    current_user: User | None = Depends(optional_user),
    db: Session = Depends(get_db),
):
    movie = db.query(Movie).filter(Movie.tmdb_id == tmdb_id).first()
    cast = []
    trailer_key = None

    if not movie:
        try:
            data = tmdb_client.get_movie_by_id(tmdb_id)
            movie = _upsert_movie(data, db)
            cast = tmdb_client.parse_cast(data.get("credits"))
            trailer_key = tmdb_client.parse_trailer(data.get("videos"))
        except Exception:
            raise HTTPException(404, "Movie not found")
    else:
        try:
            fresh = tmdb_client.get_movie_by_id(tmdb_id)
            cast = tmdb_client.parse_cast(fresh.get("credits"))
            trailer_key = tmdb_client.parse_trailer(fresh.get("videos"))
            if fresh.get("vote_average") is not None:
                movie.vote_average = fresh["vote_average"]
                db.commit()
        except Exception:
            cast = []

    user_state = {"watched": False, "inWatchlist": False, "review": None}
    if current_user:
        watched = db.query(WatchedMovie).filter_by(user_id=current_user.id, movie_id=movie.id).first()
        in_wl = db.query(Watchlist).filter_by(user_id=current_user.id, movie_id=movie.id).first()
        review = db.query(Review).filter_by(user_id=current_user.id, movie_id=movie.id).first()
        user_state = {
            "watched": bool(watched),
            "inWatchlist": bool(in_wl),
            "review": {"id": review.id, "rating": review.rating, "content": review.content} if review else None,
        }

    return {"movie": _format_movie(movie), "cast": cast, "trailerKey": trailer_key, "userState": user_state}


@router.get("/{tmdb_id}/similar")
def similar(tmdb_id: int):
    try:
        data = tmdb_client.get_similar(tmdb_id)
        return {"results": [tmdb_client.format_tmdb_result(r) for r in data.get("results", [])[:12]]}
    except Exception:
        return {"results": []}


@router.get("/{tmdb_id}/reviews")
def reviews_by_movie(tmdb_id: int, page: int = 1, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.tmdb_id == tmdb_id).first()
    if not movie:
        return {"reviews": [], "pagination": {"page": page, "total": 0, "pages": 0}}

    limit = 10
    offset = (page - 1) * limit
    total = db.query(Review).filter(Review.movie_id == movie.id).count()
    rows = (
        db.query(Review, User)
        .join(User, Review.user_id == User.id)
        .filter(Review.movie_id == movie.id)
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
            "likes_count": r.likes_count,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            "user": {"id": u.id, "username": u.username, "avatar_url": u.avatar_url},
        }
        for r, u in rows
    ]
    return {"reviews": reviews, "pagination": {"page": page, "total": total, "pages": -(-total // limit)}}
