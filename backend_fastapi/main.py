from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, movies, reviews, users, watchlist, feed, journal, ai

app = FastAPI(title="Letterboxd Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth.router,      prefix="/api/auth",    tags=["auth"])
app.include_router(movies.router,    prefix="/api/movies",  tags=["movies"])
app.include_router(reviews.router,   prefix="/api/reviews", tags=["reviews"])
app.include_router(users.router,     prefix="/api/users",   tags=["users"])
app.include_router(watchlist.router, prefix="/api",         tags=["watchlist"])
app.include_router(feed.router,      prefix="/api",         tags=["feed"])
app.include_router(journal.router,   prefix="/api/journal", tags=["journal"])
app.include_router(ai.router,        prefix="/api/ai",      tags=["ai"])
