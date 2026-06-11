import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import User, Movie, Review, WatchedMovie
from deps import get_current_user
from config import settings
import tmdb as tmdb_client

router = APIRouter()


def _get_groq_client():
    if not settings.groq_api_key:
        raise HTTPException(503, detail="AI service not configured. Add GROQ_API_KEY to .env")
    try:
        from groq import Groq
        return Groq(api_key=settings.groq_api_key)
    except ImportError:
        raise HTTPException(503, detail="groq package not installed. Run: pip install groq")


# ── POST /api/ai/recommend ──────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    mood: str = ""


@router.post("/recommend")
def recommend(body: RecommendRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Fetch user's watched films with ratings
    watched_rows = (
        db.query(WatchedMovie, Movie, Review)
        .join(Movie, Movie.id == WatchedMovie.movie_id)
        .outerjoin(Review, (Review.movie_id == Movie.id) & (Review.user_id == current_user.id))
        .filter(WatchedMovie.user_id == current_user.id)
        .order_by(Review.rating.desc().nullslast())
        .limit(20)
        .all()
    )

    if len(watched_rows) < 3:
        return {"recommendations": [], "message": "Watch at least 3 films so AI can learn your taste."}

    # 2. Build watch history string for prompt (top 10)
    history_lines = []
    for wm, movie, review in watched_rows[:10]:
        rating_str = f"Rating: {review.rating}/10" if review and review.rating else "No rating"
        genres = ", ".join(movie.genres) if movie.genres else "Unknown"
        year = str(movie.release_date.year) if movie.release_date else "?"
        history_lines.append(f"- {movie.title} ({year}) — {rating_str} — Genres: {genres}")

    watched_titles = [movie.title for _, movie, _ in watched_rows]
    history_text = "\n".join(history_lines)
    mood_text = f'\nMy mood/preference: "{body.mood}"' if body.mood.strip() else ""

    # 3. Call Groq
    client = _get_groq_client()
    system_prompt = (
        "You are a film recommendation expert for a Letterboxd-style app. "
        "Recommend films the user has NOT watched based on their taste. "
        "Always respond with valid JSON only — no extra text, no markdown."
    )
    user_prompt = (
        f"My watched films and ratings (scale 1-10):\n{history_text}{mood_text}\n\n"
        f"Recommend exactly 6 films I haven't watched. "
        f"Do NOT recommend any of these titles: {', '.join(watched_titles[:20])}.\n"
        f"Return JSON exactly like this:\n"
        f'{{"recommendations": [{{"title": "...", "year": 2020, "reason": "One sentence why I will love it.", "similar_to": "Title from my list"}}]}}'
    )

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=800,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content
        data = json.loads(raw)
        recs = data.get("recommendations", [])
    except Exception as e:
        raise HTTPException(503, detail=f"AI service error: {str(e)}")

    # 4. Enrich with TMDB data (poster + tmdb_id)
    # Strategy: try up to all returned recs until we fill 6 verified slots.
    # A rec is only included if TMDB can confirm it exists (has an id + poster).
    enriched = []
    for rec in recs:                          # iterate all, not just first 6
        if len(enriched) >= 6:
            break
        title = rec.get("title", "")
        year  = rec.get("year")
        try:
            results = tmdb_client.search_movies(title).get("results", [])

            # 1. Prefer exact year match
            match = next(
                (r for r in results if year and str(r.get("release_date", "")).startswith(str(year))),
                None,
            )
            # 2. Fall back to relaxed year (±1) in case LLM year is slightly off
            if not match and results and year:
                match = next(
                    (r for r in results if abs(int(str(r.get("release_date", "0000"))[:4] or 0) - int(year)) <= 1),
                    None,
                )
            # 3. Fall back to top result if still nothing
            if not match and results:
                match = results[0]

            # Only include the card if TMDB confirmed the film exists
            if not match:
                continue                      # skip — LLM hallucinated a title

            rec["tmdb_id"]    = match["id"]
            rec["poster_path"] = tmdb_client.build_image_url(match.get("poster_path"))
            rec["overview"]   = match.get("overview", "")
            enriched.append(rec)

        except Exception:
            continue                          # TMDB call failed — skip this rec

    return {"recommendations": enriched}


# ── GET /api/ai/movie/{tmdb_id}/insights ───────────────────────────────────

@router.get("/movie/{tmdb_id}/insights")
def movie_insights(tmdb_id: int, db: Session = Depends(get_db)):
    # 1. Find movie in DB
    movie = db.query(Movie).filter(Movie.tmdb_id == tmdb_id).first()
    if not movie:
        return {"summary": None}

    # 2. Fetch reviews
    reviews = (
        db.query(Review, User)
        .join(User, User.id == Review.user_id)
        .filter(Review.movie_id == movie.id)
        .order_by(Review.created_at.desc())
        .limit(15)
        .all()
    )

    if len(reviews) < 3:
        return {"summary": None}

    # 3. Build reviews text
    review_lines = []
    for review, user in reviews:
        text = (review.content[:200] + "…") if len(review.content) > 200 else review.content
        review_lines.append(f"- Rating {review.rating}/10: \"{text}\"")
    reviews_text = "\n".join(review_lines)

    # 4. Call Groq
    client = _get_groq_client()
    system_prompt = (
        "You are a film critic summarizing audience reviews concisely. "
        "Always respond with valid JSON only — no markdown, no extra text."
    )
    user_prompt = (
        f"Movie: {movie.title} ({movie.release_date.year if movie.release_date else '?'})\n\n"
        f"Community reviews:\n{reviews_text}\n\n"
        f"Summarize in exactly 2-3 sentences: overall sentiment, what people loved, what they criticized.\n"
        f"Return JSON: {{\"summary\": \"...\", \"sentiment\": \"positive|mixed|negative\"}}"
    )

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=300,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content
        data = json.loads(raw)
        return {"summary": data.get("summary"), "sentiment": data.get("sentiment", "mixed")}
    except Exception as e:
        raise HTTPException(503, detail=f"AI service error: {str(e)}")
