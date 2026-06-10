# Letterboxd Clone

A full-stack social film tracking web app inspired by [Letterboxd](https://letterboxd.com). Users can browse movies, write reviews, build watchlists, follow other users, and see a live activity feed — all powered by the TMDB API.

---

## Screenshots

> Light mode and dark mode supported across all pages.

---

## Features

### Movies
- **Browse** Popular, Top Rated, and Now Playing films (tabbed)
- **Search** movies by title with live debounced results
- **Discover / Filter** — filter by genre, minimum score, release date range, and sort order
- **Movie Detail Page** — full TMDB-style layout with:
  - Backdrop hero with poster, title, genres, runtime, release date
  - TMDB User Score ring (colour-coded green / yellow / red)
  - Top Billed Cast portrait cards (scrollable, no scrollbar)
  - Similar Movies row ("If you liked X…")
  - All reviews for that film
- **Load More** pagination on browse results

### Reviews
- Write a review with a star rating (0.5–5 stars = 1–10 scale)
- Edit your own review — updates reflect immediately without page refresh
- Delete your own review
- Like other users' reviews
- Reviews display: username, avatar, star rating, review text, date

### Watchlist & Watched
- Add / remove movies from your **Watchlist**
- Mark / unmark movies as **Watched**
- Posting a review automatically marks the film as watched
- Dedicated pages listing all your watchlist and watched films

### Social
- **Follow / Unfollow** other users
- **Activity Feed** — see reviews posted by people you follow, sorted newest first
- **User Search** — find users by username
- **Public Profiles** — view any user's stats, reviews, watchlist, and watched films

### Profiles
- View your own or any user's profile
- Stats: films watched, reviews written, followers, following
- Edit your own bio and avatar URL
- Tabbed view: Reviews | Watchlist | Watched

### UI & Theme
- **Light / Dark theme** toggle (persisted to localStorage)
- Fully responsive layout
- Semantic colour tokens — every element adapts cleanly to both themes
- Navbar stays dark in both modes (Letterboxd convention)

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| PostgreSQL | Primary database |
| Sequelize ORM | Models, associations, auto-sync |
| JWT (jsonwebtoken) | Stateless authentication |
| bcryptjs | Password hashing |
| Axios | TMDB API calls |
| Zod | Request validation |
| dotenv | Environment config |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| React Router v7 | Client-side routing |
| Tailwind CSS v3 | Utility-first styling |
| Ant Design v6 | UI components (Slider, Rate, Spin) |
| Axios | API calls |
| CSS Custom Properties | Light / dark theme switching |

### External API
- **TMDB (The Movie Database)** — movie data, posters, backdrops, cast, similar films

---

## Project Structure

```
letterboxd/
├── backend/
│   └── src/
│       ├── config/          # Database + env config
│       ├── constants/       # Error messages
│       ├── controllers/     # Route handlers
│       ├── middlewares/     # JWT auth, error handler
│       ├── models/          # Sequelize models
│       ├── routes/          # Express router (all endpoints)
│       ├── services/        # Business logic
│       ├── utils/           # TMDB helper, JWT, bcrypt
│       ├── app.js           # Express app setup
│       ├── server.js        # Entry point
│       └── seed.js          # Optional DB seed script
│
└── frontend/
    └── frontend/
        └── src/
            ├── components/
            │   ├── features/    # MovieCard, MovieGrid, ReviewCard
            │   └── ui/          # Navbar
            ├── constants/       # Routes
            ├── context/         # AuthContext, ThemeContext
            ├── hooks/           # useDebounce, useAuth
            ├── pages/           # All page components
            ├── routes/          # AppRouter
            ├── services/        # API service modules
            └── types/           # TypeScript interfaces
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

### Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
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
| GET | `/api/users/search?q=` | — | Search users by username |
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
| GET | `/api/feed` | ✓ | Reviews from followed users |

---

## Database Models

| Model | Key Fields |
|---|---|
| `User` | id, username, email, password_hash, bio, avatar_url |
| `Movie` | id, tmdb_id, title, overview, poster_path, backdrop_path, genres, runtime, release_date, vote_average |
| `Review` | id, user_id, movie_id, content, rating (1–10), likes_count |
| `ReviewLike` | id, user_id, review_id |
| `Watchlist` | id, user_id, movie_id |
| `WatchedMovie` | id, user_id, movie_id, watched_at |
| `Follow` | id, follower_id, following_id |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- TMDB API key — free at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

### 1. Clone the repo
```bash
git clone git@gitlab.com:uditrohila364/letterboxd.git
cd letterboxd
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/letterboxd
JWT_SECRET=your_jwt_secret_here
TMDB_API_KEY=your_tmdb_api_key_here
```

Start the server:
```bash
npm run dev      # development (nodemon)
npm start        # production
```

The database tables are auto-created on first run via `sequelize.sync({ alter: true })`.

### 3. Frontend setup
```bash
cd frontend/frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:3000`.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3000) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `TMDB_API_KEY` | Yes | TMDB v3 API key |
| `TMDB_BASE_URL` | No | TMDB API base (default: `https://api.themoviedb.org/3`) |
| `TMDB_IMAGE_BASE` | No | TMDB image base (default: `https://image.tmdb.org/t/p/w500`) |

---

## Key Design Decisions

- **TMDB as source of truth** — movies are fetched from TMDB and cached in PostgreSQL on first access. Subsequent requests serve from the local DB.
- **No migrations** — uses `sequelize.sync({ alter: true })` for simplicity in development.
- **JWT in localStorage** — single access token, no refresh token flow.
- **CSS custom properties for theming** — semantic colour tokens (`--c-bg`, `--c-text`, `--c-green`, etc.) switch values under the `.dark` class, so every element updates without `dark:` prefix duplication in markup.
- **No Redux** — auth state lives in `AuthContext`, theme in `ThemeContext`. Both follow the `{ state, data, actions }` shape.
