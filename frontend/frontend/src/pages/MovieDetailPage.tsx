import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Rate, Spin, message } from 'antd';
import { moviesService } from '../services/movies.service';
import { reviewsService } from '../services/reviews.service';
import { usersService } from '../services/users.service';
import { useAuth } from '../context/AuthContext';
import type { Movie, Review, UserMovieState, CastMember, TmdbSearchResult } from '../types';
import ReviewCard from '../components/features/ReviewCard';
import Navbar from '../components/ui/Navbar';
import { ROUTES, buildRoute } from '../constants/routes';

const PLACEHOLDER_POSTER = 'https://placehold.co/300x450/1c2028/456?text=No+Poster';

const ScoreRing = ({ score }: { score: number }) => {
  const pct = Math.round(score * 10);
  const color = pct >= 70 ? '#21d07a' : pct >= 40 ? '#d2d531' : '#db2360';
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-12 h-12 bg-[#081c22] rounded-full flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r={r} fill="none" stroke="#204529" strokeWidth="3" />
          <circle
            cx="22" cy="22" r={r} fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="text-white text-xs font-bold leading-none z-10">
          {pct}<sup className="text-[8px]">%</sup>
        </span>
      </div>
      <span className="text-white text-xs font-semibold leading-tight">User<br />Score</span>
    </div>
  );
};

const MovieDetailPage = () => {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const { state: authState, data: authData } = useAuth();
  const navigate = useNavigate();

  const [movie,         setMovie]         = useState<Movie | null>(null);
  const [cast,          setCast]          = useState<CastMember[]>([]);
  const [trailerKey,    setTrailerKey]    = useState<string | null>(null);
  const [showTrailer,   setShowTrailer]   = useState(false);
  const [userState,     setUserState]     = useState<UserMovieState>({ watched: false, inWatchlist: false, review: null });
  const [reviews,       setReviews]       = useState<Review[]>([]);
  const [similar,       setSimilar]       = useState<TmdbSearchResult[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating,  setReviewRating]  = useState(0);
  const [submitting,    setSubmitting]    = useState(false);
  const [showReviewForm,setShowReviewForm]= useState(false);

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
      <div className="min-h-screen bg-c-bg">
        <Navbar />
        <div className="flex justify-center items-center py-32"><Spin size="large" /></div>
      </div>
    );
  }

  if (!movie) return null;

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : '';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';

  return (
    <div className="min-h-screen bg-c-bg">
      <Navbar />

      {/* ─── HERO ─── */}
      <div className="relative overflow-hidden" style={{ minHeight: '420px' }}>
        {/* Backdrop */}
        {movie.backdrop_path && (
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${movie.backdrop_path})`, filter: 'brightness(0.35)' }}
          />
        )}
        {/* left-to-right gradient so left side is fully opaque */}
        <div className="absolute inset-0 bg-gradient-to-r from-c-bg via-c-bg/60 to-transparent" />
        {/* bottom fade into page bg */}
        <div className="absolute inset-0 bg-gradient-to-t from-c-bg via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 flex gap-8 items-start">
          {/* ── Poster ── */}
          <div className="flex-shrink-0 hidden sm:block">
            <img
              src={movie.poster_path || PLACEHOLDER_POSTER}
              alt={movie.title}
              className="w-44 md:w-56 rounded-lg shadow-2xl"
            />
          </div>

          {/* ── Info column ── */}
          <div className="flex-1 pt-1">
            {/* Title + year */}
            <h1 className="text-white text-3xl md:text-4xl font-bold leading-snug mb-1">
              {movie.title}{' '}
              {releaseYear && (
                <span className="text-white/50 font-normal">({releaseYear})</span>
              )}
            </h1>

            {/* Meta row — release date • genres • runtime */}
            <div className="flex flex-wrap items-center gap-1.5 text-white/70 text-sm mb-5">
              {releaseDate && <span>{releaseDate}</span>}
              {movie.genres.length > 0 && <span className="text-white/30">•</span>}
              {movie.genres.map((g, i) => (
                <span key={g} className="flex items-center gap-1.5">
                  <button
                    onClick={() => navigate(`/?q=${encodeURIComponent(g)}`)}
                    className="hover:text-white transition-colors"
                  >
                    {g}
                  </button>
                  {i < movie.genres.length - 1 && <span className="text-white/30">,</span>}
                </span>
              ))}
              {runtime && (
                <>
                  <span className="text-white/30">•</span>
                  <span>{runtime}</span>
                </>
              )}
            </div>

            {/* Score + action buttons row */}
            <div className="flex flex-wrap items-center gap-4 mb-5">
              {/* User score ring */}
              <ScoreRing score={movie.vote_average ?? 0} />

              <div className="w-px h-10 bg-white/15 hidden sm:block" />

              {/* Watched */}
              <button
                onClick={handleWatchedToggle}
                title={userState.watched ? 'Remove from watched' : 'Mark as watched'}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all border-2 ${
                  userState.watched
                    ? 'bg-[#00e054] border-[#00e054] text-black'
                    : 'bg-white/10 border-white/30 text-white hover:bg-[#00e054]/20 hover:border-[#00e054]'
                }`}
              >
                {userState.watched ? '✓' : '○'}
              </button>

              {/* Watchlist */}
              <button
                onClick={handleWatchlistToggle}
                title={userState.inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-base transition-all border-2 ${
                  userState.inWatchlist
                    ? 'bg-[#40bcf4] border-[#40bcf4] text-black'
                    : 'bg-white/10 border-white/30 text-white hover:bg-[#40bcf4]/20 hover:border-[#40bcf4]'
                }`}
              >
                {userState.inWatchlist ? '✓' : '🔖'}
              </button>

              {/* Rate */}
              <button
                onClick={() => setShowReviewForm((v) => !v)}
                title={userState.review ? 'Edit your review' : 'Rate & review'}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-base transition-all border-2 ${
                  userState.review
                    ? 'bg-[#f5c518] border-[#f5c518] text-black'
                    : 'bg-white/10 border-white/30 text-white hover:bg-[#f5c518]/20 hover:border-[#f5c518]'
                }`}
              >
                ★
              </button>

              {/* Current star rating */}
              {userState.review && !showReviewForm && (
                <div className="flex items-center gap-1.5">
                  <Rate disabled value={userState.review.rating / 2} allowHalf style={{ fontSize: '13px', color: '#f5c518' }} />
                  <span className="text-white/50 text-xs">{userState.review.rating}/10</span>
                </div>
              )}
            </div>

            {/* Play Trailer button */}
            {trailerKey && (
              <button
                onClick={() => setShowTrailer(true)}
                className="flex items-center gap-2 mt-1 text-white/80 hover:text-white text-sm font-medium transition-colors group"
              >
                <span className="w-8 h-8 rounded-full border-2 border-white/50 group-hover:border-white flex items-center justify-center transition-colors">
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                    <path d="M0 0L10 6L0 12V0Z" />
                  </svg>
                </span>
                Play Trailer
              </button>
            )}

            {/* Overview heading + text */}
            {movie.overview && (
              <div>
                <p className="text-white/50 text-sm italic mb-1">Overview</p>
                <p className="text-white/85 text-sm leading-relaxed max-w-xl line-clamp-6">
                  {movie.overview}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── BODY ─── */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* Review form */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="bg-c-card rounded-xl p-6 border border-c-border shadow-xl">
            <h3 className="text-c-text font-bold text-lg mb-5">
              {userState.review ? 'Edit your review' : 'Write a review'}
            </h3>
            <div className="mb-5">
              <label className="text-c-text3 text-xs uppercase tracking-wider mb-2 block">Your Rating</label>
              <div className="flex items-center gap-3">
                <Rate allowHalf value={reviewRating} onChange={setReviewRating} style={{ fontSize: '28px', color: '#f5c518' }} />
                {reviewRating > 0 && (
                  <span className="text-sm font-semibold bg-[#f5c518]/20 text-[#f5c518] px-2 py-0.5 rounded">
                    {Math.round(reviewRating * 2)}/10
                  </span>
                )}
              </div>
            </div>
            <div className="mb-5">
              <label className="text-c-text3 text-xs uppercase tracking-wider mb-2 block">Review</label>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                rows={5}
                placeholder="Write your thoughts about this film..."
                className="w-full bg-c-bg border border-c-border rounded-lg px-4 py-3 text-c-text text-sm placeholder-c-text4 focus:outline-none focus:border-c-green transition-colors resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                style={{ backgroundColor: 'var(--c-green)', color: '#000000' }}
                className="disabled:opacity-50 font-bold px-6 py-2.5 rounded-lg text-sm transition-opacity">
                {submitting ? 'Saving...' : userState.review ? 'Update review' : 'Post review'}
              </button>
              <button type="button" onClick={() => setShowReviewForm(false)}
                className="bg-c-surface hover:bg-c-input text-c-text2 px-6 py-2.5 rounded-lg text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ─── TOP BILLED CAST ─── */}
        {cast.length > 0 && (
          <section>
            <h2 className="text-c-text font-bold text-xl mb-4 pb-2 border-b border-c-border">Top Billed Cast</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {cast.map((member) => (
                <div
                  key={member.id}
                  className="flex-shrink-0 w-[138px] rounded-lg overflow-hidden shadow-lg bg-c-card border border-c-border"
                >
                  {/* Portrait photo — 2:3 ratio */}
                  <div className="w-full overflow-hidden bg-c-surface" style={{ height: '175px' }}>
                    {member.profile_path ? (
                      <img
                        src={member.profile_path}
                        alt={member.name}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl font-bold text-c-text4">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Text */}
                  <div className="p-3 pb-4">
                    <p className="text-c-text text-xs font-bold leading-snug mb-0.5 line-clamp-2">
                      {member.name}
                    </p>
                    <p className="text-c-text3 text-xs leading-snug line-clamp-2">
                      {member.character}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── REVIEWS ─── */}
        <section>
          <h2 className="text-c-text font-bold text-xl mb-4 pb-2 border-b border-c-border flex items-center gap-2">
            Reviews
            {reviews.length > 0 && (
              <span className="text-sm font-normal text-c-text3 bg-c-surface px-2 py-0.5 rounded-full">
                {reviews.length}
              </span>
            )}
          </h2>

          {reviews.length === 0 && !showReviewForm && (
            <div className="text-center py-10 rounded-xl bg-c-card border border-c-border">
              <p className="text-c-text4 text-sm mb-3">No reviews yet for this film.</p>
              {authState.isAuthenticated && (
                <button onClick={() => setShowReviewForm(true)} className="text-c-green text-sm hover:underline">
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
        </section>

        {/* ─── SIMILAR MOVIES ─── */}
        {similar.length > 0 && (
          <section>
            <h2 className="text-c-text font-bold text-xl mb-4 pb-2 border-b border-c-border">
              If you liked{' '}
              <span className="italic text-c-text2">{movie.title}</span>
              , you might also like…
            </h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
              {similar.map((m) => (
                <button
                  key={m.tmdb_id}
                  onClick={() => navigate(buildRoute.movieDetail(m.tmdb_id))}
                  className="flex-shrink-0 w-36 text-left group"
                >
                  {/* Poster */}
                  <div className="relative w-36 h-52 rounded-lg overflow-hidden mb-2 shadow-md bg-c-input">
                    {m.poster_path ? (
                      <img
                        src={m.poster_path}
                        alt={m.title}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-3">
                        <span className="text-c-text4 text-xs text-center leading-tight">{m.title}</span>
                      </div>
                    )}
                  </div>
                  {/* Title + score */}
                  <p className="text-c-text2 text-xs font-semibold leading-tight line-clamp-2 mb-0.5 group-hover:text-c-text transition-colors">
                    {m.title}
                  </p>
                  {m.vote_average > 0 && (
                    <p className="text-c-text3 text-xs">
                      {Math.round(m.vote_average * 10)}%
                    </p>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ─── TRAILER MODAL ─── */}
      {showTrailer && trailerKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={closeTrailer}
        >
          <div
            className="relative w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeTrailer}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
              Close (Esc)
            </button>

            {/* 16:9 iframe wrapper */}
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
