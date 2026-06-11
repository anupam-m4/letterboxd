import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import { moviesService } from '../services/movies.service';
import { reviewsService } from '../services/reviews.service';
import { usersService } from '../services/users.service';
import { useAuth } from '../context/AuthContext';
import type { Movie, Review, UserMovieState, CastMember, TmdbSearchResult } from '../types';
import ReviewCard from '../components/features/ReviewCard';
import AiInsights from '../components/features/AiInsights';
import Navbar from '../components/ui/Navbar';
import { ROUTES, buildRoute } from '../constants/routes';

const PLACEHOLDER_POSTER = 'https://placehold.co/300x450/1c2028/456?text=No+Poster';

/* ── Circular icon button (matches reference exactly) ── */
interface IconBtnProps {
  active: boolean;
  activeColor: string;
  label: string;
  activeLabel?: string;
  onClick: () => void;
  children: React.ReactNode;
}
const IconBtn = ({ active, activeColor, label, activeLabel, onClick, children }: IconBtnProps) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 group"
  >
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
      style={{
        backgroundColor: active ? activeColor : 'rgba(255,255,255,0.08)',
        color: active ? '#fff' : 'rgba(255,255,255,0.5)',
        boxShadow: active ? `0 0 0 2px ${activeColor}` : 'none',
      }}
    >
      {children}
    </div>
    <span
      className="text-[10px] uppercase tracking-widest transition-colors"
      style={{
        fontFamily: 'Lato, sans-serif',
        color: active ? activeColor : 'rgba(255,255,255,0.4)',
      }}
    >
      {active && activeLabel ? activeLabel : label}
    </span>
  </button>
);

/* ── Eye icon ── */
const EyeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
);

/* ── Heart icon ── */
const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

/* ── Clock icon ── */
const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
  </svg>
);

/* ── Star icon ── */
const StarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/* ── Read-only star display ── */
const StaticStars = ({ value, size = 16 }: { value: number; size?: number }) => (
  <span style={{ display: 'inline-flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(n => {
      const isFull = value >= n;
      const isHalf = !isFull && value >= n - 0.5;
      return (
        <span key={n} style={{ position: 'relative', display: 'inline-block', width: size, height: size, lineHeight: `${size}px` }}>
          <span style={{ position: 'absolute', inset: 0, fontSize: size, color: '#3a4a5c', userSelect: 'none' }}>★</span>
          <span style={{ position: 'absolute', inset: 0, fontSize: size, color: '#f5a623', overflow: 'hidden', width: isFull ? '100%' : isHalf ? '50%' : '0%', userSelect: 'none' }}>★</span>
        </span>
      );
    })}
  </span>
);

/* ── Interactive star rating (replaces Ant Design Rate) ── */
const STAR_LABELS = ['', 'Awful', 'Bad', 'Poor', 'Mediocre', 'Average', 'Good', 'Great', 'Excellent', 'Amazing', 'Perfect'];

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered > 0 ? hovered : value;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map(n => {
          const isFull = active >= n;
          const isHalf = !isFull && active >= n - 0.5;
          return (
            <span
              key={n}
              style={{ position: 'relative', display: 'inline-block', width: '32px', height: '32px', lineHeight: '32px' }}
            >
              {/* Empty star (always visible as base) */}
              <span style={{
                position: 'absolute', inset: 0,
                fontSize: '32px', lineHeight: '32px',
                color: '#3a4a5c',
                userSelect: 'none', pointerEvents: 'none',
              }}>★</span>
              {/* Filled overlay (clips to show full or half) */}
              <span style={{
                position: 'absolute', inset: 0,
                fontSize: '32px', lineHeight: '32px',
                color: hovered > 0 ? '#fbbf24' : '#f5a623',
                overflow: 'hidden',
                width: isFull ? '100%' : isHalf ? '50%' : '0%',
                userSelect: 'none', pointerEvents: 'none',
                transition: 'width 0.08s ease',
              }}>★</span>
              {/* Left half — selects n-0.5 */}
              <span
                style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', cursor: 'pointer', zIndex: 2 }}
                onMouseEnter={() => setHovered(n - 0.5)}
                onClick={() => onChange(n - 0.5)}
              />
              {/* Right half — selects n */}
              <span
                style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', cursor: 'pointer', zIndex: 2 }}
                onMouseEnter={() => setHovered(n)}
                onClick={() => onChange(n)}
              />
            </span>
          );
        })}

        {/* Numeric badge */}
        {active > 0 && (
          <span style={{
            marginLeft: '10px',
            backgroundColor: 'rgba(245,166,35,0.15)',
            border: '1px solid rgba(245,166,35,0.35)',
            color: '#f5a623',
            fontSize: '12px', fontWeight: 700,
            fontFamily: 'Lato, sans-serif',
            padding: '2px 10px', borderRadius: '3px',
            letterSpacing: '0.04em',
          }}>
            {Math.round(active * 2)}/10
          </span>
        )}
      </div>

      {/* Label row */}
      <p style={{
        color: active > 0 ? '#f5a623' : '#3a4a5c',
        fontSize: '11px', fontFamily: 'Lato, sans-serif',
        fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
        minHeight: '16px', transition: 'color 0.15s',
      }}>
        {active > 0 ? STAR_LABELS[Math.round(active * 2)] : 'Move cursor over stars to rate'}
      </p>
    </div>
  );
};

const MovieDetailPage = () => {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const { state: authState, data: authData } = useAuth();
  const navigate = useNavigate();

  const [movie,          setMovie]          = useState<Movie | null>(null);
  const [cast,           setCast]           = useState<CastMember[]>([]);
  const [trailerKey,     setTrailerKey]     = useState<string | null>(null);
  const [showTrailer,    setShowTrailer]    = useState(false);
  const [userState,      setUserState]      = useState<UserMovieState>({ watched: false, inWatchlist: false, review: null });
  const [reviews,        setReviews]        = useState<Review[]>([]);
  const [similar,        setSimilar]        = useState<TmdbSearchResult[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [reviewContent,  setReviewContent]  = useState('');
  const [reviewRating,   setReviewRating]   = useState(0);
  const [submitting,     setSubmitting]     = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const closeTrailer = useCallback(() => setShowTrailer(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeTrailer(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeTrailer]);

  useEffect(() => {
    if (!tmdbId) return;
    setLoading(true);
    Promise.all([
      moviesService.getDetail(Number(tmdbId)),
      reviewsService.getByMovie(Number(tmdbId)),
      moviesService.getSimilar(Number(tmdbId)),
    ])
      .then(([detail, reviewData, similarData]) => {
        setMovie(detail.movie);
        setCast(detail.cast || []);
        setTrailerKey(detail.trailerKey || null);
        setUserState(detail.userState);
        setReviews(reviewData.reviews);
        setSimilar(similarData.results.slice(0, 10));
        if (detail.userState.review) {
          setReviewContent(detail.userState.review.content);
          setReviewRating(detail.userState.review.rating / 2);
        }
      })
      .catch(() => navigate(ROUTES.HOME))
      .finally(() => setLoading(false));
  }, [tmdbId]);

  const handleWatchlistToggle = async () => {
    if (!authState.isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    try {
      if (userState.inWatchlist) {
        await usersService.removeFromWatchlist(Number(tmdbId));
        setUserState((prev) => ({ ...prev, inWatchlist: false }));
        message.success('Removed from watchlist');
      } else {
        await usersService.addToWatchlist(Number(tmdbId));
        setUserState((prev) => ({ ...prev, inWatchlist: true }));
        message.success('Added to watchlist');
      }
    } catch { message.error('Something went wrong'); }
  };

  const handleWatchedToggle = async () => {
    if (!authState.isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    try {
      if (userState.watched) {
        await usersService.unmarkWatched(Number(tmdbId));
        setUserState((prev) => ({ ...prev, watched: false }));
        message.success('Removed from watched');
      } else {
        await usersService.markWatched(Number(tmdbId));
        setUserState((prev) => ({ ...prev, watched: true }));
        message.success('Marked as watched');
      }
    } catch { message.error('Something went wrong'); }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    if (reviewRating === 0) { message.warning('Please select a rating'); return; }
    if (!reviewContent.trim()) { message.warning('Please write a review'); return; }
    setSubmitting(true);
    try {
      const ratingValue = Math.round(reviewRating * 2);
      if (userState.review) {
        const updated = await reviewsService.update(userState.review.id, { content: reviewContent, rating: ratingValue });
        setUserState((prev) => ({ ...prev, review: { id: updated.id, rating: updated.rating, content: updated.content } }));
        setReviews((prev) => prev.map((r) => r.id === updated.id ? { ...r, content: updated.content, rating: updated.rating } : r));
        message.success('Review updated');
      } else {
        const created = await reviewsService.create({ tmdbId: Number(tmdbId), content: reviewContent, rating: ratingValue });
        setUserState((prev) => ({ ...prev, watched: true, review: { id: created.id, rating: created.rating, content: created.content } }));
        const userInfo = authData.user
          ? { id: authData.user.id, username: authData.user.username, avatar_url: authData.user.avatar_url }
          : undefined;
        setReviews((prev) => [{ ...created, user: userInfo }, ...prev]);
        message.success('Review posted');
      }
      setShowReviewForm(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      message.error(msg || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    setUserState((prev) => ({ ...prev, review: null }));
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#14181c' }}>
        <Navbar />
        <div className="flex justify-center items-center py-32"><Spin size="large" /></div>
      </div>
    );
  }

  if (!movie) return null;

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';
  const avgStars = movie.vote_average != null ? Math.round((movie.vote_average / 2) * 2) / 2 : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#14181c' }}>
      <Navbar />

      {/* ─── HERO BAND ─── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#0a0e13', minHeight: '380px' }}>
        {movie.backdrop_path && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${movie.backdrop_path})`, filter: 'brightness(0.2)', transform: 'scale(1.05)' }}
          />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #0a0e13 30%, rgba(10,14,19,0.6) 70%, transparent)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #14181c 0%, transparent 40%)' }} />

        {/* ── MAIN CONTENT ROW ── */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 flex gap-6 items-start">

          {/* Poster */}
          <div className="flex-shrink-0 hidden sm:block">
            <img
              src={movie.poster_path || PLACEHOLDER_POSTER}
              alt={movie.title}
              className="rounded shadow-2xl"
              style={{ width: '180px', border: '1px solid rgba(255,255,255,0.06)' }}
            />
          </div>

          {/* Middle: title + meta + overview */}
          <div className="flex-1 min-w-0 pt-2">
            {/* Title */}
            <h1 className="text-white font-bold leading-tight mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
              {movie.title}
              {releaseYear && (
                <span className="font-normal text-white/40 ml-2" style={{ fontSize: '0.65em' }}>
                  {releaseYear}
                </span>
              )}
            </h1>

            {/* Meta: runtime • genres */}
            <div className="flex flex-wrap items-center gap-1.5 text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Lato, sans-serif' }}>
              {runtime && <span>{runtime}</span>}
              {runtime && movie.genres.length > 0 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>}
              {movie.genres.map((g, i) => (
                <span key={g} className="flex items-center gap-1">
                  <button onClick={() => navigate(`/?q=${encodeURIComponent(g)}`)} className="hover:text-white transition-colors">{g}</button>
                  {i < movie.genres.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>,</span>}
                </span>
              ))}
            </div>

            {/* Genre pills — Letterboxd style */}
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map((g) => (
                <button
                  key={g}
                  onClick={() => navigate(`/?q=${encodeURIComponent(g)}`)}
                  className="text-xs px-2.5 py-0.5 rounded transition-colors hover:bg-white/15"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Lato, sans-serif', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Overview */}
            {movie.overview && (
              <p className="text-sm leading-relaxed line-clamp-5 max-w-xl" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Lato, sans-serif' }}>
                {movie.overview}
              </p>
            )}

            {/* Play Trailer */}
            {trailerKey && (
              <button
                onClick={() => setShowTrailer(true)}
                className="flex items-center gap-2 mt-4 text-sm transition-colors group"
                style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Lato, sans-serif' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >
                <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="10" viewBox="0 0 10 12" fill="currentColor"><path d="M0 0L10 6L0 12V0Z" /></svg>
                </span>
                Play Trailer
              </button>
            )}
          </div>

          {/* ── RIGHT PANEL: action buttons + ratings (matches reference exactly) ── */}
          <div
            className="flex-shrink-0 rounded-lg p-4 flex flex-col items-center gap-4"
            style={{ backgroundColor: '#2c3440', minWidth: '180px', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* 3 icon buttons in a row */}
            <div className="flex items-start gap-4">
              <IconBtn
                active={userState.watched}
                activeColor="#00e054"
                label="Watch"
                activeLabel="Watched"
                onClick={handleWatchedToggle}
              >
                <EyeIcon />
              </IconBtn>

              <IconBtn
                active={!!userState.review}
                activeColor="#f5623b"
                label="Like"
                activeLabel="Liked"
                onClick={() => setShowReviewForm((v) => !v)}
              >
                <HeartIcon />
              </IconBtn>

              <IconBtn
                active={userState.inWatchlist}
                activeColor="#40bcf4"
                label="Watchlist"
                onClick={handleWatchlistToggle}
              >
                <ClockIcon />
              </IconBtn>
            </div>

            {/* Divider */}
            <div className="w-full h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />

            {/* Ratings */}
            <div className="w-full text-center">
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Lato, sans-serif' }}>
                Ratings
              </p>
              {avgStars > 0 ? (
                <StaticStars value={avgStars} size={18} />
              ) : (
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Lato, sans-serif' }}>No ratings yet</p>
              )}
            </div>

            {/* User's own rating if they reviewed */}
            {userState.review && (
              <>
                <div className="w-full h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
                <div className="w-full text-center">
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Lato, sans-serif' }}>
                    Your Rating
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <StaticStars value={userState.review.rating / 2} size={14} />
                  </div>
                  <button
                    onClick={() => setShowReviewForm((v) => !v)}
                    className="mt-2 text-xs hover:underline transition-colors"
                    style={{ color: '#00e054', fontFamily: 'Lato, sans-serif' }}
                  >
                    {showReviewForm ? 'Cancel' : 'Edit review'}
                  </button>
                </div>
              </>
            )}

            {/* Rate button if no review yet */}
            {!userState.review && (
              <button
                onClick={() => setShowReviewForm((v) => !v)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-bold uppercase tracking-wide transition-all"
                style={{
                  backgroundColor: showReviewForm ? 'rgba(255,255,255,0.08)' : 'rgba(245,166,35,0.15)',
                  color: '#f5a623',
                  border: '1px solid rgba(245,166,35,0.3)',
                  fontFamily: 'Lato, sans-serif',
                }}
              >
                <StarIcon />
                {showReviewForm ? 'Cancel' : 'Rate Film'}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ─── BODY ─── */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* Review form */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="rounded-lg p-6 border shadow-xl"
            style={{ backgroundColor: '#1c2028', borderColor: '#2c3440' }}
          >
            <h3 className="text-white font-bold text-base mb-5 uppercase tracking-widest" style={{ fontFamily: 'Lato, sans-serif' }}>
              {userState.review ? 'Edit your review' : 'Write a review'}
            </h3>
            <div className="mb-5">
              <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Lato, sans-serif' }}>
                Your Rating
              </label>
              <StarRating value={reviewRating} onChange={setReviewRating} />
            </div>
            <div className="mb-5">
              <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Lato, sans-serif' }}>
                Review
              </label>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                rows={5}
                placeholder="Write your thoughts about this film..."
                className="w-full rounded px-4 py-3 text-sm focus:outline-none resize-none transition-colors"
                style={{
                  backgroundColor: '#14181c',
                  border: '1px solid #2c3440',
                  color: '#e5e5e5',
                  fontFamily: 'Lato, sans-serif',
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit" disabled={submitting}
                className="font-bold px-6 py-2 rounded text-sm uppercase tracking-wide disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#00e054', color: '#000', fontFamily: 'Lato, sans-serif' }}
              >
                {submitting ? 'Saving...' : userState.review ? 'Update review' : 'Post review'}
              </button>
              <button
                type="button" onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 rounded text-sm transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Lato, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ─── TOP BILLED CAST ─── */}
        {cast.length > 0 && (
          <section>
            <p className="text-xs uppercase tracking-widest font-bold mb-4 pb-2 border-b"
              style={{ color: 'rgba(255,255,255,0.35)', borderColor: '#2c3440', fontFamily: 'Source Sans 3, sans-serif' }}>
              Top Billed Cast
            </p>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {cast.map((member) => (
                <div key={member.id} className="flex-shrink-0 w-28 rounded overflow-hidden" style={{ backgroundColor: '#1c2028', border: '1px solid #2c3440' }}>
                  <div className="w-full" style={{ height: '145px', backgroundColor: '#252b36', overflow: 'hidden' }}>
                    {member.profile_path ? (
                      <img src={member.profile_path} alt={member.name} className="w-full h-full object-cover object-top" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>{member.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold leading-snug line-clamp-2 mb-0.5" style={{ color: '#ccc', fontFamily: 'Lato, sans-serif' }}>{member.name}</p>
                    <p className="text-xs leading-snug line-clamp-2" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Lato, sans-serif' }}>{member.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── REVIEWS ─── */}
        <section>
          <p className="text-xs uppercase tracking-widest font-bold mb-4 pb-2 border-b flex items-center gap-2"
            style={{ color: 'rgba(255,255,255,0.35)', borderColor: '#2c3440', fontFamily: 'Source Sans 3, sans-serif' }}>
            Reviews
            {reviews.length > 0 && (
              <span className="rounded-full px-2 py-0.5 text-xs normal-case tracking-normal" style={{ backgroundColor: '#2c3440', color: 'rgba(255,255,255,0.4)' }}>
                {reviews.length}
              </span>
            )}
          </p>

          {reviews.length === 0 && !showReviewForm && (
            <div className="text-center py-10 rounded border" style={{ backgroundColor: '#1c2028', borderColor: '#2c3440' }}>
              <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Lato, sans-serif' }}>No reviews yet.</p>
              {authState.isAuthenticated && (
                <button onClick={() => setShowReviewForm(true)} className="text-sm hover:underline" style={{ color: '#00e054', fontFamily: 'Lato, sans-serif' }}>
                  Be the first to review →
                </button>
              )}
            </div>
          )}

          {reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={authData.user?.id === review.user?.id ? () => { setShowReviewForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); } : undefined}
                  onDelete={authData.user?.id === review.user?.id ? handleDeleteReview : undefined}
                />
              ))}
            </div>
          )}

          <AiInsights tmdbId={Number(tmdbId)} reviewCount={reviews.length} />
        </section>

        {/* ─── MORE LIKE THIS ─── */}
        {similar.length > 0 && (
          <section>
            <p className="text-xs uppercase tracking-widest font-bold mb-4 pb-2 border-b"
              style={{ color: 'rgba(255,255,255,0.35)', borderColor: '#2c3440', fontFamily: 'Source Sans 3, sans-serif' }}>
              More Like This
            </p>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {similar.map((m) => (
                <button key={m.tmdb_id} onClick={() => navigate(buildRoute.movieDetail(m.tmdb_id))} className="flex-shrink-0 w-24 text-left group">
                  <div className="relative w-24 h-36 rounded overflow-hidden mb-1" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    {m.poster_path
                      ? <img src={m.poster_path} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center p-1" style={{ backgroundColor: '#1c2028' }}><span className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>{m.title}</span></div>
                    }
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: 'inset 0 0 0 2px #00e054', borderRadius: '4px' }} />
                  </div>
                  <p className="text-xs leading-tight line-clamp-2 group-hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Lato, sans-serif' }}>
                    {m.title}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ─── TRAILER MODAL ─── */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }} onClick={closeTrailer}>
          <div className="relative w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeTrailer}
              className="absolute -top-10 right-0 text-sm flex items-center gap-1.5 transition-colors"
              style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Lato, sans-serif' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13" /><line x1="13" y1="1" x2="1" y2="13" />
              </svg>
              Close (Esc)
            </button>
            <div className="relative w-full rounded-xl overflow-hidden shadow-2xl" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title="Movie Trailer"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailPage;
