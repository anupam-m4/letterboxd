import httpx
from config import settings

_client = httpx.Client(
    base_url=settings.tmdb_base_url,
    params={"api_key": settings.tmdb_api_key},
    timeout=10,
)


def build_image_url(path: str | None) -> str | None:
    if not path:
        return None
    return f"{settings.tmdb_image_base}{path}"


def search_movies(query: str, page: int = 1) -> dict:
    return _client.get("/search/movie", params={"query": query, "page": page}).json()


def get_movie_by_id(tmdb_id: int) -> dict:
    return _client.get(f"/movie/{tmdb_id}", params={"append_to_response": "credits,videos"}).json()


def get_popular(page: int = 1) -> dict:
    return _client.get("/movie/popular", params={"page": page}).json()


def get_top_rated(page: int = 1) -> dict:
    return _client.get("/movie/top_rated", params={"page": page}).json()


def get_now_playing(page: int = 1) -> dict:
    return _client.get("/movie/now_playing", params={"page": page}).json()


def get_similar(tmdb_id: int) -> dict:
    return _client.get(f"/movie/{tmdb_id}/similar").json()


def discover_movies(
    genre_ids: str | None = None,
    sort_by: str = "popularity.desc",
    vote_gte: float | None = None,
    release_from: str | None = None,
    release_to: str | None = None,
    page: int = 1,
) -> dict:
    params: dict = {"sort_by": sort_by, "page": page}
    if genre_ids:
        params["with_genres"] = genre_ids
    if vote_gte is not None:
        params["vote_average.gte"] = vote_gte
    if release_from:
        params["primary_release_date.gte"] = release_from
    if release_to:
        params["primary_release_date.lte"] = release_to
    return _client.get("/discover/movie", params=params).json()


def parse_cast(credits: dict | None) -> list:
    if not credits or not credits.get("cast"):
        return []
    return [
        {
            "id": c["id"],
            "name": c["name"],
            "character": c.get("character", ""),
            "profile_path": build_image_url(c.get("profile_path")),
        }
        for c in credits["cast"][:12]
    ]


def parse_trailer(videos: dict | None) -> str | None:
    if not videos or not videos.get("results"):
        return None
    trailers = [v for v in videos["results"] if v.get("site") == "YouTube" and v.get("type") == "Trailer"]
    official = next((v for v in trailers if v.get("official")), None)
    pick = official or (trailers[0] if trailers else None)
    return pick["key"] if pick else None


def format_tmdb_result(item: dict) -> dict:
    return {
        "tmdb_id": item["id"],
        "title": item.get("title", ""),
        "release_date": item.get("release_date"),
        "poster_path": build_image_url(item.get("poster_path")),
        "overview": item.get("overview"),
        "vote_average": item.get("vote_average"),
    }
