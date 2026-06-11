import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin, Slider } from 'antd';
import { moviesService } from '../services/movies.service';
import type { TmdbSearchResult } from '../types';
import MovieCard from '../components/features/MovieCard';
import Navbar from '../components/ui/Navbar';
import useDebounce from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';
import { Link } from 'react-router-dom';

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
  'Thriller', 'War', 'Western',
];

const SORT_OPTIONS = [
  { value: 'popularity',    label: 'Popularity Descending' },
  { value: 'rating',        label: 'Rating Descending' },
  { value: 'release_date',  label: 'Release Date Descending' },
  { value: 'title',         label: 'Title (A-Z)' },
];

const TAB_LABELS: Record<string, string> = {
  popular:       'Popular on Letterboxd',
  'top-rated':   'Top Rated',
  'now-playing': 'In Cinemas',
};

/* Letterboxd bolt icon */
const BoltIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

interface Filters {
  sortBy: string;
  genres: string[];
  voteGte: number;
  releaseFrom: string;
  releaseTo: string;
}

const DEFAULT_FILTERS: Filters = {
  sortBy: 'popularity',
  genres: [],
  voteGte: 0,
  releaseFrom: '',
  releaseTo: '',
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { state: authState, data: authData } = useAuth();

  const [query,         setQuery]         = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<TmdbSearchResult[]>([]);
  const [browseResults, setBrowseResults] = useState<TmdbSearchResult[]>([]);
  const [activeTab,     setActiveTab]     = useState('popular');
  const [filters,       setFilters]       = useState<Filters>(DEFAULT_FILTERS);
  const [pending,       setPending]       = useState<Filters>(DEFAULT_FILTERS);
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingBrowse, setLoadingBrowse] = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [isFiltered,    setIsFiltered]    = useState(false);

  const debouncedQuery = useDebounce(query, 400);
  const isSearching    = debouncedQuery.trim().length > 0;

  const fetchBrowse = useCallback(async (
    tab: string, cur: Filters, curPage: number, append = false,
  ) => {
    if (curPage === 1 && !append) setLoadingBrowse(true);
    else setLoadingMore(true);
    try {
      let data;
      const hasFilters = cur.genres.length > 0 || cur.voteGte > 0 || cur.releaseFrom || cur.releaseTo;
      if (isFiltered || hasFilters) {
        data = await moviesService.discover({
          genres:       cur.genres.length > 0 ? cur.genres.join(',') : undefined,
          sort_by:      cur.sortBy,
          vote_gte:     cur.voteGte > 0 ? cur.voteGte : undefined,
          release_from: cur.releaseFrom || undefined,
          release_to:   cur.releaseTo   || undefined,
          page:         curPage,
        });
      } else {
        const fetcher =
          tab === 'top-rated'   ? moviesService.getTopRated   :
          tab === 'now-playing' ? moviesService.getNowPlaying :
          moviesService.getPopular;
        data = await fetcher(curPage);
      }
      setTotalPages(data.total_pages || 1);
      setBrowseResults((prev) => append ? [...prev, ...data.results] : data.results);
    } catch {
      if (!append) setBrowseResults([]);
    } finally {
      setLoadingBrowse(false);
      setLoadingMore(false);
    }
  }, [isFiltered]);

  useEffect(() => {
    setPage(1);
    fetchBrowse(activeTab, filters, 1, false);
  }, [activeTab]);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setSearchResults([]); setSearchParams({}); return; }
    setLoadingSearch(true);
    setSearchParams({ q: debouncedQuery });
    moviesService.search(debouncedQuery)
      .then((data) => setSearchResults(data.results))
      .catch(() => setSearchResults([]))
      .finally(() => setLoadingSearch(false));
  }, [debouncedQuery]);

  const handleApplyFilters = () => {
    setFilters(pending);
    setIsFiltered(true);
    setPage(1);
    fetchBrowse(activeTab, pending, 1, false);
  };

  const handleResetFilters = () => {
    setPending(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setIsFiltered(false);
    setPage(1);
    fetchBrowse(activeTab, DEFAULT_FILTERS, 1, false);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchBrowse(activeTab, filters, next, true);
  };

  const toggleGenre = (genre: string) => {
    setPending((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsFiltered(false);
    setFilters(DEFAULT_FILTERS);
    setPending(DEFAULT_FILTERS);
    setPage(1);
  };

  const displayMovies = isSearching ? searchResults : browseResults;
  const isLoading     = isSearching ? loadingSearch : loadingBrowse;

  return (
    <div className="min-h-screen bg-c-bg">
      <Navbar />

      {/* ── Hero / Greeting ── */}
      {authState.isAuthenticated && authData.user ? (
        /* Logged-in: "Welcome back, Name. Here's what we've been watching..." */
        <div className="px-6 pt-6 pb-2 max-w-7xl mx-auto">
          <h2 className="text-white text-lg mb-1" style={{ fontFamily: 'Lato, sans-serif' }}>
            Welcome back,{' '}
            <span className="font-bold underline" style={{ color: '#00e054' }}>
              {authData.user.username}
            </span>
            . Here's what we've been watching…
          </h2>
        </div>
      ) : (
        /* Logged-out: Letterboxd hero banner */
        <div
          className="relative overflow-hidden py-16 px-4 text-center"
          style={{ backgroundColor: '#14181c', borderBottom: '1px solid #2c3440' }}
        >
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h1
              className="font-extrabold text-white mb-3"
              style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', lineHeight: 1.2 }}
            >
              The social network<br />for film lovers.
            </h1>
            <p className="text-[#9ab] text-base mb-1" style={{ fontFamily: 'Lato, sans-serif' }}>
              Keep a film diary. Share film reviews.
            </p>
            <p className="text-[#9ab] text-base mb-8" style={{ fontFamily: 'Lato, sans-serif' }}>
              Follow friends and see what they're watching.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to={ROUTES.REGISTER}
                className="font-bold px-7 py-3 rounded text-sm uppercase tracking-wider transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#00e054', color: '#000', fontFamily: 'Lato, sans-serif' }}
              >
                Get started — it's free!
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="text-[#9ab] hover:text-white text-sm transition-colors uppercase tracking-wider"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Search bar ── */}
        <div className="mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a film..."
            autoFocus={!!initialQuery}
            className="w-full max-w-xl bg-c-input border border-c-border rounded px-4 py-2.5 text-c-text text-sm placeholder-c-text4 focus:outline-none focus:border-c-green transition-colors"
            style={{ fontFamily: 'Lato, sans-serif' }}
          />
        </div>

        {/* ── Section heading (Letterboxd style) ── */}
        {!isSearching && (
          <div className="flex items-center gap-2 mb-4">
            <span style={{ color: 'var(--c-green)' }}><BoltIcon /></span>
            <span
              className="text-c-text text-sm font-bold uppercase tracking-widest"
              style={{ fontFamily: 'Source Sans 3, sans-serif' }}
            >
              {TAB_LABELS[activeTab]}
            </span>
          </div>
        )}

        {/* ── Tabs ── */}
        {!isSearching && (
          <div className="flex gap-0 mb-6 border-b border-c-border">
            {Object.entries(TAB_LABELS).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-[#00e054] text-[#00e054]'
                    : 'border-transparent text-[#9ab] hover:text-white'
                }`}
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-6 items-start">

          {/* ── Filter Sidebar ── */}
          {!isSearching && (
            <aside className="flex-shrink-0 w-60 rounded border border-c-border overflow-hidden" style={{ backgroundColor: 'var(--c-card)' }}>

              {/* Sort */}
              <div className="p-4 border-b border-c-border">
                <p className="text-[#9ab] text-xs uppercase tracking-widest mb-2 font-bold" style={{ fontFamily: 'Lato, sans-serif' }}>Sort By</p>
                <div className="relative">
                  <select
                    value={pending.sortBy}
                    onChange={(e) => setPending((p) => ({ ...p, sortBy: e.target.value }))}
                    className="w-full appearance-none rounded px-3 py-2 pr-8 text-sm focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--c-input)',
                      border: '1px solid var(--c-border)',
                      color: 'var(--c-text)',
                      fontFamily: 'Lato, sans-serif',
                    }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}
                        style={{ backgroundColor: 'var(--c-card)', color: 'var(--c-text)' }}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-c-text3 text-xs">▾</span>
                </div>
              </div>

              {/* Genres */}
              <div className="p-4 border-b border-c-border">
                <p className="text-[#9ab] text-xs uppercase tracking-widest mb-3 font-bold" style={{ fontFamily: 'Lato, sans-serif' }}>Genre</p>
                <div className="flex flex-wrap gap-1.5">
                  {GENRES.map((genre) => {
                    const selected = pending.genres.includes(genre);
                    return (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                          selected
                            ? 'border-c-green'
                            : 'bg-transparent border-c-border text-[#9ab] hover:border-[#9ab] hover:text-white'
                        }`}
                        style={{
                          fontFamily: 'Lato, sans-serif',
                          ...(selected ? { backgroundColor: 'var(--c-green-muted)', borderColor: 'var(--c-green)', color: 'var(--c-green)' } : {}),
                        }}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minimum Score */}
              <div className="p-4 border-b border-c-border">
                <p className="text-[#9ab] text-xs uppercase tracking-widest mb-3 font-bold" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Min Rating
                  {pending.voteGte > 0 && (
                    <span className="ml-2 normal-case font-bold" style={{ color: 'var(--c-green)' }}>
                      {pending.voteGte}+
                    </span>
                  )}
                </p>
                <Slider
                  min={0} max={9} step={1}
                  value={pending.voteGte}
                  onChange={(val) => setPending((p) => ({ ...p, voteGte: val }))}
                  styles={{
                    track:  { backgroundColor: 'var(--c-green)' },
                    handle: { borderColor: 'var(--c-green)', backgroundColor: 'var(--c-green)' },
                  }}
                  tooltip={{ formatter: (v) => `${v}+` }}
                />
                <div className="flex justify-between text-[#456] text-xs mt-1">
                  <span>0</span><span>9</span>
                </div>
              </div>

              {/* Release Date */}
              <div className="p-4 border-b border-c-border">
                <p className="text-[#9ab] text-xs uppercase tracking-widest mb-2 font-bold" style={{ fontFamily: 'Lato, sans-serif' }}>Release Year</p>
                <div className="space-y-2">
                  {(['releaseFrom', 'releaseTo'] as const).map((field) => (
                    <div key={field}>
                      <label className="text-[#456] text-xs block mb-1" style={{ fontFamily: 'Lato, sans-serif' }}>
                        {field === 'releaseFrom' ? 'From' : 'To'}
                      </label>
                      <input
                        type="date"
                        value={pending[field]}
                        onChange={(e) => setPending((p) => ({ ...p, [field]: e.target.value }))}
                        className="w-full rounded px-2 py-1.5 text-xs focus:outline-none transition-colors"
                        style={{
                          backgroundColor: 'var(--c-input)',
                          border: '1px solid var(--c-border)',
                          color: 'var(--c-text)',
                          fontFamily: 'Lato, sans-serif',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 space-y-2">
                <button
                  onClick={handleApplyFilters}
                  className="w-full font-bold py-2 rounded text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#00ac1c', color: '#ffffff', fontFamily: 'Lato, sans-serif' }}
                >
                  Search
                </button>
                {isFiltered && (
                  <button
                    onClick={handleResetFilters}
                    className="w-full py-2 rounded text-sm transition-colors border border-c-border text-[#9ab] hover:text-white"
                    style={{ backgroundColor: 'var(--c-surface)', fontFamily: 'Lato, sans-serif' }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </aside>
          )}

          {/* ── Movie Grid ── */}
          <div className="flex-1 min-w-0">
            {isSearching && (
              <div className="flex items-center gap-2 mb-4">
                <span style={{ color: 'var(--c-green)' }}><BoltIcon /></span>
                <span className="text-c-text2 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                  Results for &ldquo;{debouncedQuery}&rdquo;
                </span>
                <span className="text-[#678] text-xs ml-auto">{searchResults.length} films</span>
              </div>
            )}

            {isLoading && <div className="flex justify-center py-20"><Spin size="large" /></div>}

            {!isLoading && displayMovies.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[#678] text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
                  {isSearching
                    ? `No films found for "${debouncedQuery}"`
                    : 'No results. Try adjusting your filters.'}
                </p>
              </div>
            )}

            {!isLoading && displayMovies.length > 0 && (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                  {displayMovies.map((movie) => (
                    <MovieCard key={`${movie.tmdb_id}-${movie.title}`} movie={movie} />
                  ))}
                </div>

                {!isSearching && page < totalPages && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="font-bold px-12 py-2.5 rounded text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#00ac1c', color: '#ffffff', fontFamily: 'Lato, sans-serif' }}
                    >
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}

            {loadingMore && <div className="flex justify-center py-8"><Spin /></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
