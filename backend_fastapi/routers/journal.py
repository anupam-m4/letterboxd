from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import JournalArticle

router = APIRouter()


def _fmt(a: JournalArticle) -> dict:
    return {
        "id": a.id,
        "title": a.title,
        "subtitle": a.subtitle,
        "category": a.category,
        "author": a.author,
        "image_url": a.image_url,
        "published_at": a.published_at.isoformat() if a.published_at else None,
        "is_featured": a.is_featured,
        "is_spotlight": a.is_spotlight,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


@router.get("/featured")
def featured(db: Session = Depends(get_db)):
    article = (
        db.query(JournalArticle)
        .filter(JournalArticle.is_featured == True)
        .order_by(JournalArticle.published_at.desc())
        .first()
    )
    return _fmt(article) if article else None


@router.get("/spotlight")
def spotlight(limit: int = 4, db: Session = Depends(get_db)):
    limit = min(limit, 10)
    rows = (
        db.query(JournalArticle)
        .filter(JournalArticle.is_spotlight == True)
        .order_by(JournalArticle.published_at.desc())
        .limit(limit)
        .all()
    )
    return [_fmt(a) for a in rows]


@router.get("/category/{category}")
def by_category(category: str, limit: int = 6, db: Session = Depends(get_db)):
    limit = min(limit, 20)
    rows = (
        db.query(JournalArticle)
        .filter(JournalArticle.category.ilike(category))
        .order_by(JournalArticle.published_at.desc())
        .limit(limit)
        .all()
    )
    return [_fmt(a) for a in rows]


@router.get("/")
def index(limit: int = 20, db: Session = Depends(get_db)):
    limit = min(limit, 50)
    rows = (
        db.query(JournalArticle)
        .order_by(JournalArticle.published_at.desc())
        .limit(limit)
        .all()
    )
    return [_fmt(a) for a in rows]
