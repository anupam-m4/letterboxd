import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import { aiService } from '../services/ai.service';
import { buildRoute } from '../constants/routes';
import type { RecommendedFilm } from '../types';

const EXAMPLES = [
  '90s sci-fi with a twist',
  'dark and emotional',
  'feel-good comedy',
  'slow-burn psychological thriller',
  'something like Parasite',
];

const SkeletonCard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <div style={{ width: '100%', aspectRatio: '2/3', borderRadius: '6px', backgroundColor: '#2c3440', animation: 'pulse 1.5s ease-in-out infinite' }} />
    <div style={{ height: '14px', width: '70%', borderRadius: '3px', backgroundColor: '#2c3440' }} />
    <div style={{ height: '12px', width: '90%', borderRadius: '3px', backgroundColor: '#1c2028' }} />
    <div style={{ height: '12px', width: '60%', borderRadius: '3px', backgroundColor: '#1c2028' }} />
  </div>
);

const FilmCard = ({ film }: { film: RecommendedFilm }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Link to={film.tmdb_id ? buildRoute.movieDetail(film.tmdb_id) : '#'} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ width: '100%', aspectRatio: '2/3', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#2c3440', position: 'relative' }}>
          {film.poster_path && !imgError ? (
            <img
              src={film.poster_path}
              alt={film.title}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#678', fontSize: '12px', fontFamily: 'Lato, sans-serif', textAlign: 'center', padding: '12px' }}>
              {film.title}
            </div>
          )}
          {/* green hover border */}
          <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 0 #00e054', transition: 'box-shadow 0.2s', borderRadius: '6px' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'inset 0 0 0 3px #00e054'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'inset 0 0 0 0 #00e054'; }}
          />
        </div>
      </Link>

      <div>
        <Link to={film.tmdb_id ? buildRoute.movieDetail(film.tmdb_id) : '#'} style={{ textDecoration: 'none' }}>
          <p style={{ color: '#e5e5e5', fontSize: '13px', fontWeight: 700, fontFamily: 'Lato, sans-serif', margin: '0 0 2px', lineHeight: 1.3 }}>
            {film.title}
            {film.year && <span style={{ color: '#678', fontWeight: 400, marginLeft: '6px' }}>{film.year}</span>}
          </p>
        </Link>
        {/* AI reason chip */}
        <p style={{ color: '#9ab', fontSize: '12px', fontFamily: 'Lato, sans-serif', lineHeight: 1.5, margin: '0 0 4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {film.reason}
        </p>
        {film.similar_to && (
          <p style={{ color: '#678', fontSize: '11px', fontFamily: 'Lato, sans-serif', margin: 0 }}>
            Similar to <em>{film.similar_to}</em>
          </p>
        )}
      </div>
    </div>
  );
};

const AiPicksPage = () => {
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [films, setFilms] = useState<RecommendedFilm[] | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFilms(null);
    setMessage('');
    try {
      const res = await aiService.recommend(mood.trim());
      if (res.message) setMessage(res.message);
      setFilms(res.recommendations);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#14181c', minHeight: '100vh', color: '#e5e5e5' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 60px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✨</div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
            AI Film Picks
          </h1>
          <p style={{ color: '#9ab', fontSize: '14px', fontFamily: 'Lato, sans-serif', margin: 0, lineHeight: 1.6 }}>
            Tell us what you're in the mood for — we'll analyse your watch history and pick 6 films just for you.
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} style={{ maxWidth: '560px', margin: '0 auto 40px', display: 'flex', gap: '10px' }}>
          <input
            value={mood}
            onChange={e => setMood(e.target.value)}
            placeholder="e.g. something dark and slow-burn…"
            style={{ flex: 1, backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '6px', color: '#e5e5e5', fontSize: '14px', fontFamily: 'Lato, sans-serif', padding: '11px 16px', outline: 'none', transition: 'border-color 0.15s' }}
            onFocus={e => { e.target.style.borderColor = '#00e054'; }}
            onBlur={e => { e.target.style.borderColor = '#2c3440'; }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#00e054', color: '#000', border: 'none', borderRadius: '6px', padding: '11px 22px', fontSize: '13px', fontWeight: 700, fontFamily: 'Lato, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}
          >
            {loading ? 'Thinking…' : 'Get Picks →'}
          </button>
        </form>

        {/* Example prompts */}
        {!loading && !films && !error && (
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: '#678', fontSize: '11px', fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Try one of these
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => setMood(ex)}
                  style={{ backgroundColor: '#1c2028', border: '1px solid #2c3440', borderRadius: '20px', color: '#9ab', fontSize: '12px', fontFamily: 'Lato, sans-serif', padding: '5px 14px', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#00e054'; e.currentTarget.style.color = '#00e054'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2c3440'; e.currentTarget.style.color = '#9ab'; }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ maxWidth: '560px', margin: '0 auto 32px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '12px 16px', color: '#f87171', fontSize: '13px', fontFamily: 'Lato, sans-serif', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Not enough data message */}
        {message && films?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ab', fontFamily: 'Lato, sans-serif', fontSize: '14px', lineHeight: 1.7 }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🎬</div>
            {message}
            <br />
            <Link to="/films" style={{ color: '#00e054', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>
              Browse films to watch →
            </Link>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <>
            <p style={{ textAlign: 'center', color: '#678', fontSize: '12px', fontFamily: 'Lato, sans-serif', marginBottom: '24px', letterSpacing: '0.05em' }}>
              Analysing your taste…
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        )}

        {/* Results */}
        {!loading && films && films.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <h2 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                Your Picks
              </h2>
              {mood && (
                <span style={{ color: '#678', fontSize: '12px', fontFamily: 'Lato, sans-serif' }}>
                  for "{mood}"
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
              {films.map((film, i) => <FilmCard key={i} film={film} />)}
            </div>

            <div style={{ textAlign: 'center', marginTop: '36px' }}>
              <button
                onClick={() => { setFilms(null); setMood(''); }}
                style={{ backgroundColor: 'transparent', border: '1px solid #2c3440', borderRadius: '4px', color: '#9ab', fontSize: '12px', fontFamily: 'Lato, sans-serif', padding: '8px 20px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#9ab'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2c3440'; e.currentTarget.style.color = '#9ab'; }}
              >
                Start over
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default AiPicksPage;
