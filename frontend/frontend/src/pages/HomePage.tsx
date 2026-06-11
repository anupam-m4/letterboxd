import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { moviesService } from '../services/movies.service';
import { reviewsService } from '../services/reviews.service';
import { buildRoute } from '../constants/routes';
import type { TmdbSearchResult, Review } from '../types';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

const TMDB_W = 'https://image.tmdb.org/t/p';

/* ─── icons ──────────────────────────────────────────────────── */
const EyeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
  </svg>
);

const HeartOutlineIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const BoltIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#00e054">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

/* ─── helpers ─────────────────────────────────────────────────── */
const fmtCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
};

const stars = (rating: number) => {
  const half = rating / 2;
  const full = Math.floor(half);
  const hasHalf = half - full >= 0.5;
  return '★'.repeat(full) + (hasHalf ? '½' : '');
};

/* ─── review list item ────────────────────────────────────────── */
const ReviewListItem = ({ review }: { review: Review }) => {
  const date = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const movie = review.movie as (Review['movie'] & { release_date?: string | null }) | undefined;

  return (
    <div style={{ display: 'flex', gap: '14px', padding: '18px 0', borderBottom: '1px solid #2c3440' }}>
      {/* Poster */}
      {movie && (
        <Link to={buildRoute.movieDetail(movie.tmdb_id)} style={{ flexShrink: 0, textDecoration: 'none' }}>
          <div style={{ width: '60px', height: '90px', borderRadius: '3px', overflow: 'hidden', backgroundColor: '#2c3440' }}>
            {movie.poster_path && (
              <img src={`${TMDB_W}/w92${movie.poster_path}`} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        </Link>
      )}
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title + year */}
        {movie && (
          <div style={{ marginBottom: '6px' }}>
            <Link to={buildRoute.movieDetail(movie.tmdb_id)} style={{ textDecoration: 'none' }}>
              <span style={{ color: '#fff', fontSize: '16px', fontWeight: 700, fontFamily: 'Lato, sans-serif' }}>
                {movie.title}
              </span>
            </Link>
            {movie.release_date && (
              <span style={{ color: '#678', fontSize: '14px', fontFamily: 'Lato, sans-serif', marginLeft: '8px' }}>
                {movie.release_date.slice(0, 4)}
              </span>
            )}
          </div>
        )}
        {/* User + stars + heart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {review.user && (
            <Link to={buildRoute.profile(review.user.username)} style={{ color: '#00e054', fontSize: '13px', fontFamily: 'Lato, sans-serif', fontWeight: 600, textDecoration: 'none' }}>
              {review.user.username}
            </Link>
          )}
          {review.rating > 0 && (
            <span style={{ color: '#00e054', fontSize: '13px', letterSpacing: '1px' }}>
              {stars(review.rating)}
            </span>
          )}
          <span style={{ color: '#f5a623' }}><HeartOutlineIcon /></span>
        </div>
        {/* Review text */}
        <p style={{
          color: '#9ab', fontSize: '13px', fontFamily: 'Lato, sans-serif', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: '8px',
        }}>
          {review.content}
        </p>
        {/* Likes + date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#678', fontSize: '11px', fontFamily: 'Lato, sans-serif' }}>
          <span>♥ {review.likes_count} {review.likes_count === 1 ? 'like' : 'likes'}</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
};

/* ─── filter config ────────────────────────────────────────────── */
const GENRES = [
  { id: 28,    name: 'Action' },
  { id: 16,    name: 'Animation' },
  { id: 35,    name: 'Comedy' },
  { id: 80,    name: 'Crime' },
  { id: 99,    name: 'Documentary' },
  { id: 18,    name: 'Drama' },
  { id: 14,    name: 'Fantasy' },
  { id: 27,    name: 'Horror' },
  { id: 9648,  name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878,   name: 'Science Fiction' },
  { id: 53,    name: 'Thriller' },
  { id: 37,    name: 'Western' },
];

const YEAR_OPTIONS = [
  { label: '2020s', from: '2020-01-01', to: '2029-12-31' },
  { label: '2010s', from: '2010-01-01', to: '2019-12-31' },
  { label: '2000s', from: '2000-01-01', to: '2009-12-31' },
  { label: '1990s', from: '1990-01-01', to: '1999-12-31' },
  { label: '1980s', from: '1980-01-01', to: '1989-12-31' },
  { label: '1970s', from: '1970-01-01', to: '1979-12-31' },
  { label: 'Before 1970', from: '1900-01-01', to: '1969-12-31' },
];

const RATING_OPTIONS = [
  { label: '★★★★★  (8+)',  min: 8 },
  { label: '★★★★   (7+)',  min: 7 },
  { label: '★★★    (6+)',  min: 6 },
  { label: '★★     (5+)',  min: 5 },
];

const POPULAR_OPTIONS = [
  { label: 'Most Popular',      sort: 'popularity' },
  { label: 'Highly Rated',      sort: 'rating' },
  { label: 'Recently Released', sort: 'release_date' },
];

const SERVICE_OPTIONS = [
  'Netflix', 'Disney+', 'Amazon Prime', 'Apple TV+', 'Hulu', 'Max',
];

const OTHER_OPTIONS = [
  { label: 'Now Playing',  action: 'now_playing' },
  { label: 'Top Rated',    action: 'top_rated' },
  { label: 'Upcoming',     action: 'upcoming' },
];

type FilterKey = 'YEAR' | 'RATING' | 'POPULAR' | 'GENRE' | 'SERVICE' | 'OTHER';

interface ActiveFilters {
  year?:    { label: string; from: string; to: string };
  rating?:  { label: string; min: number };
  popular?: { label: string; sort: string };
  genre?:   { id: number; name: string };
  service?: string;
  other?:   { label: string; action: string };
}

/* ─── dropdown styles ─────────────────────────────────────────── */
const ddItemStyle = (active: boolean): React.CSSProperties => ({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: active ? 'rgba(0,224,84,0.12)' : 'none',
  border: 'none',
  color: active ? '#00e054' : '#cdd',
  fontSize: '13px',
  fontFamily: 'Lato, sans-serif',
  padding: '7px 14px',
  cursor: 'pointer',
  transition: 'background 0.12s, color 0.12s',
});

const clearBtnStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid #2c3440',
  color: '#9ab',
  fontSize: '11px',
  fontFamily: 'Lato, sans-serif',
  padding: '6px 14px 8px',
  cursor: 'pointer',
  marginBottom: '2px',
};

/* ─── main page ───────────────────────────────────────────────── */
interface HomeData {
  featured: TmdbSearchResult[];
  strip: TmdbSearchResult[];
  reviews: Review[];
  sidebar: TmdbSearchResult[];
}

const HomePage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<HomeData>({ featured: [], strip: [], reviews: [], sidebar: [] });
  const [loading, setLoading] = useState(true);
  const [findQuery, setFindQuery] = useState('');
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [filterLoading, setFilterLoading] = useState(false);
  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      moviesService.getPopular(1),
      moviesService.getTopRated(1),
      reviewsService.getRecent(10),
      moviesService.getNowPlaying(1),
    ]).then(([popular, topRated, reviews, nowPlaying]) => {
      setData({
        featured: popular.results.slice(0, 4),
        strip: topRated.results.slice(0, 16),
        reviews,
        sidebar: nowPlaying.results.slice(0, 6),
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const applyFilters = async (filters: ActiveFilters) => {
    setFilterLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (filters.genre)   params.genres        = filters.genre.name;
      if (filters.rating)  params.vote_gte      = filters.rating.min;
      if (filters.popular) params.sort_by        = filters.popular.sort;
      if (filters.year) {
        params.release_from = filters.year.from;
        params.release_to   = filters.year.to;
      }
      // "other" shortcuts bypass discover
      if (filters.other) {
        let res;
        if (filters.other.action === 'now_playing') {
          res = await moviesService.getNowPlaying(1);
        } else if (filters.other.action === 'top_rated') {
          res = await moviesService.getTopRated(1);
        } else {
          // upcoming — discover movies releasing from today forward
          const today = new Date().toISOString().slice(0, 10);
          const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
          res = await moviesService.discover({ release_from: today, release_to: nextYear, sort_by: 'release_date' });
        }
        setData(prev => ({ ...prev, featured: res.results.slice(0, 4) }));
        return;
      }
      const hasDiscover = Object.keys(params).length > 0;
      const res = hasDiscover
        ? await moviesService.discover(params as Parameters<typeof moviesService.discover>[0])
        : await moviesService.getPopular(1);
      setData(prev => ({ ...prev, featured: res.results.slice(0, 4) }));
    } finally {
      setFilterLoading(false);
    }
  };

  const selectFilter = (key: keyof ActiveFilters, value: ActiveFilters[keyof ActiveFilters]) => {
    const next = { ...activeFilters, [key]: value };
    setActiveFilters(next);
    setOpenFilter(null);
    applyFilters(next);
  };

  const clearFilter = (key: keyof ActiveFilters) => {
    const next = { ...activeFilters };
    delete next[key];
    setActiveFilters(next);
    applyFilters(next);
  };

  const clearAll = () => {
    setActiveFilters({});
    moviesService.getPopular(1).then(r => setData(prev => ({ ...prev, featured: r.results.slice(0, 4) })));
  };

  const handleFind = (e: React.FormEvent) => {
    e.preventDefault();
    if (findQuery.trim()) navigate(`/films?q=${encodeURIComponent(findQuery.trim())}`);
  };

  const isActive = (key: keyof ActiveFilters) => !!activeFilters[key];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#14181c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#9ab', fontFamily: 'Lato, sans-serif', fontSize: '14px' }}>Loading…</span>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#14181c', minHeight: '100vh', color: '#e5e5e5' }}>
      <Navbar />

      {/* ── BROWSE BY bar ─────────────────────────────────────── */}
      <div style={{ backgroundColor: '#14181c', borderBottom: '1px solid #2c3440', position: 'relative', zIndex: 100 }}>
        <div ref={filterBarRef} style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '44px', flexWrap: 'wrap', position: 'relative' }}>
          <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px', fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.12em', marginRight: '6px' }}>
            Browse by
          </span>

          {/* YEAR */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenFilter(openFilter === 'YEAR' ? null : 'YEAR')}
              style={{ backgroundColor: 'transparent', border: `1px solid ${isActive('year') ? '#00e054' : openFilter === 'YEAR' ? '#9ab' : '#2c3440'}`, borderRadius: '3px', color: isActive('year') ? '#00e054' : openFilter === 'YEAR' ? '#fff' : '#678', fontSize: '10px', fontFamily: 'Lato, sans-serif', fontWeight: 700, letterSpacing: '0.07em', padding: '3px 9px', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              {isActive('year') ? activeFilters.year!.label : 'YEAR'} ▾
            </button>
            {openFilter === 'YEAR' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '4px', minWidth: '140px', zIndex: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: '4px 0' }}>
                {isActive('year') && <button onClick={() => clearFilter('year')} style={clearBtnStyle}>✕ Clear</button>}
                {YEAR_OPTIONS.map(opt => (
                  <button key={opt.label} onClick={() => selectFilter('year', opt)} style={ddItemStyle(activeFilters.year?.label === opt.label)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RATING */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenFilter(openFilter === 'RATING' ? null : 'RATING')}
              style={{ backgroundColor: 'transparent', border: `1px solid ${isActive('rating') ? '#00e054' : openFilter === 'RATING' ? '#9ab' : '#2c3440'}`, borderRadius: '3px', color: isActive('rating') ? '#00e054' : openFilter === 'RATING' ? '#fff' : '#678', fontSize: '10px', fontFamily: 'Lato, sans-serif', fontWeight: 700, letterSpacing: '0.07em', padding: '3px 9px', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              {isActive('rating') ? activeFilters.rating!.label : 'RATING'} ▾
            </button>
            {openFilter === 'RATING' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '4px', minWidth: '130px', zIndex: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: '4px 0' }}>
                {isActive('rating') && <button onClick={() => clearFilter('rating')} style={clearBtnStyle}>✕ Clear</button>}
                {RATING_OPTIONS.map(opt => (
                  <button key={opt.label} onClick={() => selectFilter('rating', opt)} style={{ ...ddItemStyle(activeFilters.rating?.label === opt.label), color: '#00e054', letterSpacing: '2px' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* POPULAR */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenFilter(openFilter === 'POPULAR' ? null : 'POPULAR')}
              style={{ backgroundColor: 'transparent', border: `1px solid ${isActive('popular') ? '#00e054' : openFilter === 'POPULAR' ? '#9ab' : '#2c3440'}`, borderRadius: '3px', color: isActive('popular') ? '#00e054' : openFilter === 'POPULAR' ? '#fff' : '#678', fontSize: '10px', fontFamily: 'Lato, sans-serif', fontWeight: 700, letterSpacing: '0.07em', padding: '3px 9px', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              {isActive('popular') ? activeFilters.popular!.label : 'POPULAR'} ▾
            </button>
            {openFilter === 'POPULAR' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '4px', minWidth: '170px', zIndex: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: '4px 0' }}>
                {isActive('popular') && <button onClick={() => clearFilter('popular')} style={clearBtnStyle}>✕ Clear</button>}
                {POPULAR_OPTIONS.map(opt => (
                  <button key={opt.label} onClick={() => selectFilter('popular', opt)} style={ddItemStyle(activeFilters.popular?.label === opt.label)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GENRE */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenFilter(openFilter === 'GENRE' ? null : 'GENRE')}
              style={{ backgroundColor: 'transparent', border: `1px solid ${isActive('genre') ? '#00e054' : openFilter === 'GENRE' ? '#9ab' : '#2c3440'}`, borderRadius: '3px', color: isActive('genre') ? '#00e054' : openFilter === 'GENRE' ? '#fff' : '#678', fontSize: '10px', fontFamily: 'Lato, sans-serif', fontWeight: 700, letterSpacing: '0.07em', padding: '3px 9px', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              {isActive('genre') ? activeFilters.genre!.name : 'GENRE'} ▾
            </button>
            {openFilter === 'GENRE' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '4px', minWidth: '150px', zIndex: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: '4px 0', maxHeight: '260px', overflowY: 'auto' }}>
                {isActive('genre') && <button onClick={() => clearFilter('genre')} style={clearBtnStyle}>✕ Clear</button>}
                {GENRES.map(g => (
                  <button key={g.id} onClick={() => selectFilter('genre', g)} style={ddItemStyle(activeFilters.genre?.id === g.id)}>
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SERVICE */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenFilter(openFilter === 'SERVICE' ? null : 'SERVICE')}
              style={{ backgroundColor: 'transparent', border: `1px solid ${isActive('service') ? '#00e054' : openFilter === 'SERVICE' ? '#9ab' : '#2c3440'}`, borderRadius: '3px', color: isActive('service') ? '#00e054' : openFilter === 'SERVICE' ? '#fff' : '#678', fontSize: '10px', fontFamily: 'Lato, sans-serif', fontWeight: 700, letterSpacing: '0.07em', padding: '3px 9px', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              {isActive('service') ? activeFilters.service : 'SERVICE'} ▾
            </button>
            {openFilter === 'SERVICE' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '4px', minWidth: '150px', zIndex: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: '4px 0' }}>
                <div style={{ padding: '8px 14px 4px', color: '#678', fontSize: '10px', fontFamily: 'Lato, sans-serif', letterSpacing: '0.06em', borderBottom: '1px solid #2c3440', marginBottom: '4px' }}>STREAMING</div>
                {isActive('service') && <button onClick={() => clearFilter('service')} style={clearBtnStyle}>✕ Clear</button>}
                {SERVICE_OPTIONS.map(s => (
                  <button key={s} onClick={() => { selectFilter('service', s); }} style={ddItemStyle(activeFilters.service === s)}>
                    {s}
                  </button>
                ))}
                <div style={{ padding: '8px 14px 6px', color: '#678', fontSize: '10px', fontFamily: 'Lato, sans-serif', lineHeight: 1.4, borderTop: '1px solid #2c3440', marginTop: '4px' }}>
                  Service filtering coming soon
                </div>
              </div>
            )}
          </div>

          {/* OTHER */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenFilter(openFilter === 'OTHER' ? null : 'OTHER')}
              style={{ backgroundColor: 'transparent', border: `1px solid ${isActive('other') ? '#00e054' : openFilter === 'OTHER' ? '#9ab' : '#2c3440'}`, borderRadius: '3px', color: isActive('other') ? '#00e054' : openFilter === 'OTHER' ? '#fff' : '#678', fontSize: '10px', fontFamily: 'Lato, sans-serif', fontWeight: 700, letterSpacing: '0.07em', padding: '3px 9px', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              {isActive('other') ? activeFilters.other!.label : 'OTHER'} ▾
            </button>
            {openFilter === 'OTHER' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '4px', minWidth: '150px', zIndex: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: '4px 0' }}>
                {isActive('other') && <button onClick={() => clearFilter('other')} style={clearBtnStyle}>✕ Clear</button>}
                {OTHER_OPTIONS.map(opt => (
                  <button key={opt.label} onClick={() => selectFilter('other', opt)} style={ddItemStyle(activeFilters.other?.label === opt.label)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear all */}
          {Object.keys(activeFilters).length > 0 && (
            <button onClick={clearAll} style={{ backgroundColor: 'transparent', border: 'none', color: '#9ab', fontSize: '10px', fontFamily: 'Lato, sans-serif', cursor: 'pointer', padding: '3px 6px', textDecoration: 'underline' }}>
              Clear all
            </button>
          )}

          <form onSubmit={handleFind} style={{ marginLeft: 'auto', display: 'flex' }}>
            <input
              value={findQuery}
              onChange={e => setFindQuery(e.target.value)}
              placeholder="FIND A FILM"
              style={{ backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '3px', color: '#678', fontSize: '10px', fontFamily: 'Lato, sans-serif', letterSpacing: '0.08em', padding: '5px 12px', outline: 'none', width: '150px', transition: 'all 0.15s' }}
              onFocus={e => { e.target.style.backgroundColor = '#fff'; e.target.style.color = '#14181c'; e.target.style.borderColor = '#fff'; }}
              onBlur={e => { e.target.style.backgroundColor = '#1c2028'; e.target.style.color = '#678'; e.target.style.borderColor = '#2c3440'; }}
            />
          </form>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* ── POPULAR FILMS THIS WEEK ───────────────────────────── */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              <BoltIcon />
              {Object.keys(activeFilters).length > 0 ? 'Filtered Films' : 'Popular Films This Week'}
              {filterLoading && <span style={{ color: '#678', fontSize: '11px', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>Loading…</span>}
            </h2>
            <Link to="/films" style={{ color: '#678', fontSize: '11px', fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#678'; }}
            >
              More →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {data.featured.map(film => (
              <Link key={film.tmdb_id} to={buildRoute.movieDetail(film.tmdb_id)} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', aspectRatio: '2/3', backgroundColor: '#2c3440' }}>
                  {film.poster_path ? (
                    <img
                      src={`${TMDB_W}/w500${film.poster_path}`}
                      alt={film.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#678', fontSize: '11px', fontFamily: 'Lato, sans-serif' }}>
                      No image
                    </div>
                  )}
                  {/* green inset border on hover */}
                  <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 0 #00e054', transition: 'box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'inset 0 0 0 3px #00e054'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'inset 0 0 0 0 #00e054'; }}
                  />
                </div>
                {/* Below poster stats */}
                <div style={{ marginTop: '8px' }}>
                  <p style={{ color: '#e5e5e5', fontSize: '12px', fontFamily: 'Lato, sans-serif', fontWeight: 600, marginBottom: '4px', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {film.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#678', fontSize: '11px', fontFamily: 'Lato, sans-serif' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#9ab' }}>
                      <EyeIcon /> {film.vote_average?.toFixed(1)}
                    </span>
                    {film.vote_count && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f5a623' }}>
                        <HeartOutlineIcon /> {fmtCount(film.vote_count)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── JUST REVIEWED ─────────────────────────────────────── */}
        <section style={{ marginBottom: '40px', paddingTop: '28px', borderTop: '1px solid #2c3440' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              Just Reviewed…
            </h2>
            <span style={{ color: '#678', fontSize: '11px', fontFamily: 'Lato, sans-serif' }}>
              Top rated this week
            </span>
          </div>
          <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '4px' }}>
            {data.strip.map(film => (
              <Link key={film.tmdb_id} to={buildRoute.movieDetail(film.tmdb_id)} style={{ flexShrink: 0, textDecoration: 'none' }} title={film.title}>
                <div style={{ width: '52px', height: '78px', borderRadius: '3px', overflow: 'hidden', backgroundColor: '#2c3440', transition: 'transform 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
                >
                  {film.poster_path && (
                    <img src={`${TMDB_W}/w92${film.poster_path}`} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── POPULAR REVIEWS + SIDEBAR ─────────────────────────── */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '40px', paddingTop: '28px', borderTop: '1px solid #2c3440' }}>

          {/* Left: reviews */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <h2 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                Popular Reviews This Week
              </h2>
              <Link to="/films" style={{ color: '#678', fontSize: '11px', fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#678'; }}
              >
                More →
              </Link>
            </div>

            {data.reviews.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#678', fontFamily: 'Lato, sans-serif', fontSize: '14px' }}>
                No reviews yet — be the first to review a film!
              </div>
            ) : (
              data.reviews.map(r => <ReviewListItem key={r.id} review={r} />)
            )}
          </div>

          {/* Right sidebar */}
          <div>
            {/* In Cinemas */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
                In Cinemas
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {data.sidebar.map(film => (
                  <Link key={film.tmdb_id} to={buildRoute.movieDetail(film.tmdb_id)} style={{ textDecoration: 'none' }} title={film.title}>
                    <div style={{ aspectRatio: '2/3', borderRadius: '3px', overflow: 'hidden', backgroundColor: '#2c3440' }}>
                      {film.poster_path && (
                        <img src={`${TMDB_W}/w185${film.poster_path}`} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Can't find a film */}
            <div style={{ backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '4px', padding: '18px' }}>
              <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'Lato, sans-serif', marginBottom: '6px' }}>
                Can't find a film?
              </p>
              <p style={{ color: '#678', fontSize: '12px', fontFamily: 'Lato, sans-serif', lineHeight: 1.5, marginBottom: '12px' }}>
                Use our search to find any film in our database.
              </p>
              <Link
                to="/films"
                style={{ display: 'inline-block', border: '1px solid #678', borderRadius: '3px', color: '#9ab', fontSize: '11px', fontFamily: 'Lato, sans-serif', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '7px 14px', textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#9ab'; e.currentTarget.style.borderColor = '#678'; }}
              >
                Search Films
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
