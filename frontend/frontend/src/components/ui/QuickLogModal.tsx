import { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import { moviesService } from '../../services/movies.service';
import { reviewsService } from '../../services/reviews.service';
import { usersService } from '../../services/users.service';
import type { TmdbSearchResult } from '../../types';

interface Props {
  onClose: () => void;
  preselectedFilm?: TmdbSearchResult;
}

const TMDB_W = 'https://image.tmdb.org/t/p';

/* ── inline star rating for modal ─────────────────────────── */
const ModalStars = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div style={{ display: 'flex', gap: '3px' }} onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map(n => {
        const isFull = active >= n;
        const isHalf = !isFull && active >= n - 0.5;
        return (
          <span key={n} style={{ position: 'relative', display: 'inline-block', width: 26, height: 26, lineHeight: '26px' }}>
            <span style={{ position: 'absolute', inset: 0, fontSize: 26, color: '#2c3440', userSelect: 'none', pointerEvents: 'none' }}>★</span>
            <span style={{ position: 'absolute', inset: 0, fontSize: 26, color: '#00e054', overflow: 'hidden', width: isFull ? '100%' : isHalf ? '50%' : '0%', userSelect: 'none', pointerEvents: 'none', transition: 'width 0.08s' }}>★</span>
            <span style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', cursor: 'pointer', zIndex: 2 }} onMouseEnter={() => setHovered(n - 0.5)} onClick={() => onChange(value === n - 0.5 ? 0 : n - 0.5)} />
            <span style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', cursor: 'pointer', zIndex: 2 }} onMouseEnter={() => setHovered(n)} onClick={() => onChange(value === n ? 0 : n)} />
          </span>
        );
      })}
      {active > 0 && (
        <span style={{ marginLeft: 6, color: '#00e054', fontSize: 11, fontFamily: 'Lato, sans-serif', fontWeight: 700, alignSelf: 'center', letterSpacing: '0.04em' }}>
          {Math.round(active * 2)}/10
        </span>
      )}
    </div>
  );
};

const QuickLogModal = ({ onClose, preselectedFilm }: Props) => {
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState<TmdbSearchResult[]>([]);
  const [selectedFilm, setSelectedFilm]   = useState<TmdbSearchResult | null>(preselectedFilm || null);
  const [searching, setSearching]         = useState(false);
  const [showResults, setShowResults]     = useState(false);

  const [specifyDate, setSpecifyDate] = useState(false);
  const [watchDate, setWatchDate]     = useState('');
  const [reviewText, setReviewText]   = useState('');
  const [rating, setRating]           = useState(0);
  const [liked, setLiked]             = useState(false);
  const [spoilers, setSpoilers]       = useState(false);
  const [saving, setSaving]           = useState(false);

  const searchRef  = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setSearchResults([]); setShowResults(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await moviesService.search(q.trim());
        setSearchResults(data.results.slice(0, 7));
        setShowResults(true);
      } catch { /* */ } finally { setSearching(false); }
    }, 350);
  };

  const selectFilm = (film: TmdbSearchResult) => {
    setSelectedFilm(film);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleSave = async () => {
    if (!selectedFilm) { message.warning('Select a film first'); return; }
    setSaving(true);
    try {
      await usersService.markWatched(selectedFilm.tmdb_id);
      if (reviewText.trim() && rating > 0) {
        await reviewsService.create({ tmdbId: selectedFilm.tmdb_id, content: reviewText.trim(), rating: Math.round(rating * 2) });
      }
      message.success(`Logged: ${selectedFilm.title}`);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      message.error(msg || 'Failed to save');
    } finally { setSaving(false); }
  };

  const year = (d?: string | null) => d?.slice(0, 4) || '';

  return (
    /* ── Backdrop ───────────────────────────────────────────── */
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      {/* ── Modal card ──────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#1c2028',
        border: '1px solid #2c3440',
        borderRadius: '8px',
        width: '100%', maxWidth: '560px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
        display: 'flex', flexDirection: 'column',
        height: '580px',
        maxHeight: 'calc(100vh - 48px)',
        overflow: 'hidden',
      }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 22px',
          borderBottom: '1px solid #2c3440',
          background: 'linear-gradient(135deg, #252d38 0%, #1e2530 100%)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px', lineHeight: 1 }}>🎬</span>
            <div>
              <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'Lato, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                Log a Film
              </p>
              {selectedFilm && (
                <p style={{ color: '#9ab', fontSize: '11px', fontFamily: 'Lato, sans-serif', margin: 0, marginTop: '1px' }}>
                  {selectedFilm.title}{selectedFilm.release_date ? ` · ${year(selectedFilm.release_date)}` : ''}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#678', cursor: 'pointer', fontSize: '22px', lineHeight: 1, padding: '2px 6px', borderRadius: '4px', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#9ab')}
            onMouseLeave={e => (e.currentTarget.style.color = '#678')}
          >×</button>
        </div>

        {/* ── Body (scrollable) ──────────────────────────────── */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1, scrollbarWidth: 'thin', scrollbarColor: '#3d4f5d #1c2028' }}>

          {/* ── PHASE 1: Search for film ─────────────────────── */}
          {!selectedFilm && (
            <div ref={searchRef} style={{ position: 'relative' }}>
              <label style={{ display: 'block', color: '#9ab', fontSize: '11px', fontFamily: 'Lato, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Search Film
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Start typing a film title…"
                  autoFocus
                  onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    backgroundColor: '#252b36', border: '1px solid #3d4f5d',
                    borderRadius: '5px', color: '#e8eaed',
                    fontSize: '14px', fontFamily: 'Lato, sans-serif',
                    padding: '11px 40px 11px 14px', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocusCapture={e => (e.target.style.borderColor = '#00e054')}
                  onBlurCapture={e => (e.target.style.borderColor = '#3d4f5d')}
                />
                {/* Search icon / spinner */}
                <span style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#678', fontSize: searching ? '12px' : '15px', pointerEvents: 'none' }}>
                  {searching ? '⟳' : '🔍'}
                </span>
              </div>

              {/* Results dropdown */}
              {showResults && searchResults.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  marginTop: '4px',
                  backgroundColor: '#252b36',
                  border: '1px solid #3d4f5d',
                  borderRadius: '6px',
                  zIndex: 50,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                  overflow: 'hidden',
                }}>
                  {searchResults.map((film, idx) => (
                    <button
                      key={film.tmdb_id}
                      onClick={() => selectFilm(film)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left',
                        borderBottom: idx < searchResults.length - 1 ? '1px solid #2c3440' : 'none',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1c2028')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {film.poster_path ? (
                        <img src={`${TMDB_W}/w92${film.poster_path}`} alt={film.title}
                          style={{ width: '32px', height: '48px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '32px', height: '48px', backgroundColor: '#2c3440', borderRadius: '3px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: '#678', fontSize: '16px' }}>🎬</span>
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: '#fff', fontSize: '13px', fontFamily: 'Lato, sans-serif', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {film.title}
                        </div>
                        <div style={{ color: '#9ab', fontSize: '11px', fontFamily: 'Lato, sans-serif', marginTop: '2px' }}>
                          {year(film.release_date)}
                          {film.vote_average ? ` · ★ ${film.vote_average.toFixed(1)}` : ''}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Empty state hint */}
              {!searchQuery && (
                <p style={{ color: '#456', fontSize: '12px', fontFamily: 'Lato, sans-serif', textAlign: 'center', marginTop: '32px', lineHeight: 1.6 }}>
                  Search for any film to add it to your diary
                </p>
              )}
            </div>
          )}

          {/* ── PHASE 2: Film selected — log form ─────────────── */}
          {selectedFilm && (
            <div>
              {/* Film identity row */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: '72px', height: '108px', borderRadius: '5px', overflow: 'hidden', backgroundColor: '#252b36', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                  {selectedFilm.poster_path ? (
                    <img src={`${TMDB_W}/w185${selectedFilm.poster_path}`} alt={selectedFilm.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#678', fontSize: '24px' }}>🎬</div>
                  )}
                </div>
                <div style={{ flex: 1, paddingTop: '4px' }}>
                  <p style={{ color: '#fff', fontSize: '16px', fontWeight: 700, fontFamily: 'Lato, sans-serif', margin: '0 0 3px' }}>
                    {selectedFilm.title}
                  </p>
                  {selectedFilm.release_date && (
                    <p style={{ color: '#9ab', fontSize: '13px', fontFamily: 'Lato, sans-serif', margin: '0 0 10px' }}>
                      {year(selectedFilm.release_date)}
                    </p>
                  )}
                  <button
                    onClick={() => setSelectedFilm(null)}
                    style={{ background: 'none', border: '1px solid #3d4f5d', borderRadius: '3px', color: '#9ab', cursor: 'pointer', fontSize: '11px', fontFamily: 'Lato, sans-serif', fontWeight: 600, padding: '3px 10px', transition: 'all 0.15s', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#678'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#9ab'; e.currentTarget.style.borderColor = '#3d4f5d'; }}
                  >
                    ← Change film
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: '#2c3440', marginBottom: '18px' }} />

              {/* Rating + Like row */}
              <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', color: '#9ab', fontSize: '10px', fontFamily: 'Lato, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                    Rating
                  </label>
                  <ModalStars value={rating} onChange={setRating} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9ab', fontSize: '10px', fontFamily: 'Lato, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '7px' }}>
                    Like
                  </label>
                  <button
                    type="button"
                    onClick={() => setLiked(!liked)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '24px', color: liked ? '#f5a623' : '#2c3440', lineHeight: 1, transition: 'color 0.15s, transform 0.15s' }}
                    onMouseEnter={e => { if (!liked) e.currentTarget.style.color = '#f5a623'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                    onMouseLeave={e => { if (!liked) e.currentTarget.style.color = '#2c3440'; e.currentTarget.style.transform = 'scale(1)'; }}
                    title={liked ? 'Unlike' : 'Like'}
                  >♥</button>
                </div>
              </div>

              {/* Review textarea */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#9ab', fontSize: '10px', fontFamily: 'Lato, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  Review <span style={{ color: '#456', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Write your thoughts about this film…"
                  rows={4}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    backgroundColor: '#252b36', border: '1px solid #3d4f5d',
                    borderRadius: '5px', color: '#e8eaed',
                    fontSize: '13px', fontFamily: 'Lato, sans-serif',
                    padding: '10px 13px', outline: 'none',
                    resize: 'vertical', lineHeight: 1.6,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#00e054')}
                  onBlur={e => (e.target.style.borderColor = '#3d4f5d')}
                />
              </div>

              {/* Date watched */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={specifyDate}
                    onChange={e => setSpecifyDate(e.target.checked)}
                    style={{ accentColor: '#00e054', width: '14px', height: '14px' }}
                  />
                  <span style={{ color: '#9ab', fontSize: '12px', fontFamily: 'Lato, sans-serif' }}>
                    Specify the date I watched it
                  </span>
                </label>
                {specifyDate && (
                  <input
                    type="date"
                    value={watchDate}
                    onChange={e => setWatchDate(e.target.value)}
                    style={{
                      marginTop: '10px', display: 'block', width: '100%', boxSizing: 'border-box',
                      backgroundColor: '#252b36', border: '1px solid #3d4f5d',
                      borderRadius: '5px', color: '#e8eaed',
                      fontSize: '13px', fontFamily: 'Lato, sans-serif',
                      padding: '9px 13px', outline: 'none',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#00e054')}
                    onBlur={e => (e.target.style.borderColor = '#3d4f5d')}
                  />
                )}
              </div>

              {/* Spoilers */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={spoilers}
                    onChange={e => setSpoilers(e.target.checked)}
                    style={{ accentColor: '#00e054', width: '14px', height: '14px' }}
                  />
                  <span style={{ color: '#9ab', fontSize: '12px', fontFamily: 'Lato, sans-serif' }}>
                    Contains spoilers
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px', borderTop: '1px solid #2c3440' }}>
                <button
                  onClick={onClose}
                  style={{
                    background: 'transparent', border: '1px solid #3d4f5d',
                    borderRadius: '4px', color: '#9ab',
                    fontSize: '12px', fontFamily: 'Lato, sans-serif',
                    fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                    padding: '9px 18px', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#678'; e.currentTarget.style.color = '#cdd'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d4f5d'; e.currentTarget.style.color = '#9ab'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    backgroundColor: '#00e054', color: '#000', border: 'none',
                    borderRadius: '4px', fontSize: '12px', fontFamily: 'Lato, sans-serif',
                    fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                    padding: '9px 22px', cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.65 : 1, transition: 'opacity 0.15s, background-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = '#00c048'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#00e054'; }}
                >
                  {saving ? 'Saving…' : '✓ Save Log'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickLogModal;
