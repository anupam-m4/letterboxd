# Letterboxd Clone

A full-stack social film tracking web app inspired by [Letterboxd](https://letterboxd.com). Users can browse movies, write reviews, build watchlists, follow other users, get an AI-powered activity feed, and receive personalised film recommendations — all powered by the TMDB API and Groq AI.

---

## Screenshots

> Dark theme throughout, matching Letterboxd's signature aesthetic.

---

## Features

### Movies
- **Browse** Popular, Top Rated, and Now Playing films
- **Search** movies by title with live debounced results
- **Discover / Filter** — filter by genre, minimum rating, release date, and sort order (popularity / rating / release date / upcoming)
- **Movie Detail Page** — full layout with:
  - Backdrop hero with poster, title, genres, runtime, release date
  - TMDB User Score ring (colour-coded green / yellow / red)
  - Top Billed Cast portrait cards (horizontally scrollable)
  - Trailer embed (YouTube)
  - Similar Movies row
  - All community reviews for that film
  - AI Summary of reviews panel (collapsible, appears when ≥ 3 reviews exist)
- **Load More** pagination on browse results

### Reviews
- Write a review with a custom star rating (0.5–5 stars = 1–10 scale)
- Edit your own review — updates reflect immediately
- Delete your own review
- Like other users' reviews
- Reviews display: username, avatar, star rating, review text, date

### Watchlist & Watched
- Add / remove movies from your **Watchlist**
- Mark / unmark movies as **Watched**
- Writing a review automatically marks the film as watched

### Social
- **Follow / Unfollow** other users with live button state (Follow → Following → Unfollow on hover)
- **Activity Feed** — reviews and watched films from people you follow, sorted newest first
- **User Search** — find users by username (current user excluded from results)
- **Public Profiles** — view any user's stats, reviews, watchlist, and watched films

### Profiles
- View your own or any user's profile
- Stats: films watched, reviews written, followers, following
- Edit bio and avatar URL via dark-themed modal
- Tabbed view: Reviews | Watchlist | Watched

### AI Features
- **AI Film Picks** (`/ai-picks`) — enter a mood or leave blank; AI reads your watch history + ratings and returns 6 personalised recommendations with posters and a one-line reason for each
- **AI Review Insights** — collapsible panel on every movie page that summarises community sentiment (2–3 sentences + positive / mixed / negative label) when a film has ≥ 3 reviews
- Powered by **Groq API (Llama 3.3 70B)** — free tier, no credit card required

### Journal
- Editorial journal articles (featured, spotlight, category browsing)
- Matches Letterboxd's editorial content style

### UI & Theme
- Full dark theme (`#14181c` background) matching Letterboxd's visual identity
- Fully responsive layout
- Custom star rating components (no Ant Design Rate — fully styled for dark backgrounds)
- Custom modal components (no Ant Design Modal — dark-themed throughout)

---

## Tech Stack

### Backend — FastAPI (Python)
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| Python 3.12 | Runtime |
| PostgreSQL | Primary database |
| SQLAlchemy ORM | Models, relationships, auto table creation |
| python-jose | JWT token creation and verification |
| bcrypt | Password hashing (direct hashpw/checkpw — passlib-free) |
| httpx | Async TMDB API calls |
| Groq SDK | AI recommendations and review insights (Llama 3.3 70B) |
| pydantic-settings | Environment config via `.env` |
| uvicorn | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool and dev server |
| React Router v7 | Client-side routing |
| Tailwind CSS v3 | Utility-first styling |
| Ant Design v6 | Minimal usage: Spin, message, Slider |
| Axios | API calls with JWT interceptor |

### External APIs
| API | Purpose |
|---|---|
| TMDB (The Movie Database) | Movie data, posters, backdrops, cast, trailers |
| Groq API | AI film recommendations and review sentiment summaries |

---

## Project Structure

```
letterboxd/
├── backend_fastapi/              # Active backend (Python / FastAPI)
│   ├── main.py                   # App entry point — registers all routers
│   ├── config.py                 # Settings from .env (pydantic-settings)
│   ├── database.py               # SQLAlchemy engine and session
│   ├── models.py                 # ORM models (User, Movie, Review, etc.)
│   ├── schemas.py                # Pydantic request / response schemas
│   ├── auth.py                   # bcrypt hashing, JWT creation/verification
│   ├── deps.py                   # get_current_user, optional_user dependencies
│   ├── tmdb.py                   # TMDB API client
│   ├── requirements.txt
│   └── routers/
│       ├── auth.py               # POST /auth/register, /auth/login, GET /auth/me
│       ├── movies.py             # TMDB proxy — search, discover, detail, cast
│       ├── reviews.py            # CRUD reviews, likes
│       ├── users.py              # Profiles, follow/unfollow, user search
│       ├── watchlist.py          # Watchlist and watched movies
│       ├── feed.py               # Activity feed from followed users
│       ├── journal.py            # Editorial journal articles
│       └── ai.py                 # AI recommendations + review insights
│
├── backend/                      # Legacy Node.js / Express backend (unused)
│
└── frontend/
    └── frontend/
        └── src/
            ├── components/
            │   ├── features/     # MovieCard, ReviewCard, AiInsights
            │   └── ui/           # Navbar, Footer, QuickLogModal, SignUpModal
            ├── constants/        # Route constants
            ├── context/          # AuthContext
            ├── hooks/            # useDebounce
            ├── pages/            # All page components
            │   ├── HomePage.tsx          # Browse + BROWSE BY filter bar
            │   ├── WelcomePage.tsx        # Post-login landing
            │   ├── MovieDetailPage.tsx   # Film detail + reviews + AI summary
            │   ├── AiPicksPage.tsx       # AI personalised recommendations
            │   ├── ProfilePage.tsx       # User profile + edit modal
            │   ├── UserSearchPage.tsx    # Find + follow users
            │   ├── FeedPage.tsx          # Activity feed
            │   ├── JournalPage.tsx       # Editorial journal
            │   └── ...
            ├── routes/           # AppRouter with protected routes
            ├── services/         # Typed API service modules
            └── types/            # TypeScript interfaces
```

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in, returns JWT |
| GET | `/api/auth/me` | ✓ | Get current user |

### Movies
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/movies/search?q=` | — | Search TMDB |
| GET | `/api/movies/popular` | — | Popular films |
| GET | `/api/movies/top-rated` | — | Top rated films |
| GET | `/api/movies/now-playing` | — | Now playing films |
| GET | `/api/movies/discover` | — | Filter by genre, score, date, sort |
| GET | `/api/movies/:tmdbId` | Optional | Movie detail + cast + user state |
| GET | `/api/movies/:tmdbId/similar` | — | Similar movies |
| GET | `/api/movies/:tmdbId/reviews` | — | All reviews for a film |
| GET | `/api/movies/:tmdbId/trailer` | — | YouTube trailer key |

### Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reviews/recent` | — | Recent reviews for homepage |
| POST | `/api/reviews` | ✓ | Create review |
| PUT | `/api/reviews/:id` | ✓ | Edit your review |
| DELETE | `/api/reviews/:id` | ✓ | Delete your review |
| POST | `/api/reviews/:id/like` | ✓ | Like / unlike a review |

### Watchlist & Watched
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/watchlist` | ✓ | Add to watchlist |
| DELETE | `/api/watchlist/:tmdbId` | ✓ | Remove from watchlist |
| POST | `/api/watched` | ✓ | Mark as watched |
| DELETE | `/api/watched/:tmdbId` | ✓ | Unmark watched |

### Users & Social
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/search?q=` | Optional | Search users (excludes self, returns is_following) |
| GET | `/api/users/me/following` | ✓ | List of usernames current user follows |
| GET | `/api/users/:username` | Optional | Public profile + stats |
| GET | `/api/users/:username/reviews` | — | User's reviews |
| GET | `/api/users/:username/watchlist` | — | User's watchlist |
| GET | `/api/users/:username/watched` | — | User's watched films |
| POST | `/api/users/:username/follow` | ✓ | Follow user |
| DELETE | `/api/users/:username/follow` | ✓ | Unfollow user |
| PUT | `/api/users/profile` | ✓ | Update bio / avatar |

### Feed
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/feed` | ✓ | Activity from followed users |

### AI
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/recommend` | ✓ | 6 personalised film picks based on watch history + mood |
| GET | `/api/ai/movie/:tmdbId/insights` | — | 2–3 sentence review summary + sentiment label |

### Journal
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/journal` | — | Paginated article list |
| GET | `/api/journal/featured` | — | Featured articles |
| GET | `/api/journal/spotlight` | — | Spotlight articles |
| GET | `/api/journal/category/:category` | — | Articles by category |

---

## Database Models

| Model | Key Fields |
|---|---|
| `User` | id, username, email, password_hash, bio, avatar_url |
| `Movie` | id, tmdb_id, title, overview, poster_path, backdrop_path, genres, runtime, release_date, vote_average |
| `Review` | id, user_id, movie_id, content, rating (1–10), likes_count |
| `ReviewLike` | id, user_id, review_id |
| `Watchlist` | id, user_id, movie_id, added_at |
| `WatchedMovie` | id, user_id, movie_id, watched_at |
| `Follow` | id, follower_id, following_id |

---

## Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Node.js 18+
- TMDB API key — free at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- Groq API key (for AI features) — free at [console.groq.com](https://console.groq.com)

### 1. Clone the repo
```bash
git clone git@gitlab.com:uditrohila364/letterboxd.git
cd letterboxd
```

### 2. Backend setup (FastAPI)
```bash
cd backend_fastapi
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend_fastapi/`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/letterboxd
JWT_SECRET=your_jwt_secret_here
TMDB_API_KEY=your_tmdb_api_key_here
GROQ_API_KEY=gsk_your_groq_key_here
```

Start the server:
```bash
uvicorn main:app --reload --port 3000
```

Database tables are created automatically on startup via `Base.metadata.create_all()`.

Interactive API docs available at: `http://localhost:3000/docs`

### 3. Frontend setup
```bash
cd frontend/frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:3000`.

---

## Environment Variables

### Backend (`backend_fastapi/.env`)
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `TMDB_API_KEY` | Yes | TMDB v3 API key |
| `GROQ_API_KEY` | No | Groq API key — required only for AI features |
| `TMDB_BASE_URL` | No | Default: `https://api.themoviedb.org/3` |
| `TMDB_IMAGE_BASE` | No | Default: `https://image.tmdb.org/t/p/w500` |

---

## Key Design Decisions

- **FastAPI over Express** — Python backend chosen for native AI/ML library compatibility (Groq SDK, future ML integrations) and automatic OpenAPI docs generation at `/docs`.
- **TMDB as source of truth** — movies are fetched from TMDB and cached in PostgreSQL on first access. Subsequent requests serve from the local DB.
- **Direct bcrypt calls** — `passlib` was removed because it is incompatible with `bcrypt >= 5.0.0`. `bcrypt.hashpw` / `bcrypt.checkpw` are used directly.
- **No migrations** — `Base.metadata.create_all()` auto-creates tables on startup for development simplicity.
- **JWT in localStorage** — single access token, no refresh token flow.
- **Custom star rating and modals** — Ant Design's `Rate` and `Modal` components inject light-theme CSS that overrides the dark background. Both are replaced with custom inline-styled components using the overflow-clip half-star technique.
- **AI route order matters** — `/users/me/following` is declared before `/{username}` in FastAPI to prevent the dynamic parameter from capturing the literal string `"me"`.
- **Groq AI with JSON mode** — recommendations use `response_format={"type":"json_object"}` for structured output. TMDB enrichment uses year ± 1 tolerance fallback before skipping unresolvable titles.
