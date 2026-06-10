import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin, Slider } from 'antd';
import { moviesService } from '../services/movies.service';
import type { TmdbSearchResult } from '../types';
import MovieCard from '../components/features/MovieCard';
import Navbar from '../components/ui/Navbar';
import useDebounce from '../hooks/useDebounce';

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
  popular:      'Popular',
  'top-rated':  'Top Rated',
  'now-playing':'Now Playing',
};

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

const GreenBtn = ({ onClick, disabled, children, fullWidth = true }: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{ backgroundColor: 'var(--c-green)', color: '#000000' }}
    className={`${fullWidth ? 'w-full' : ''} disabled:opacity-50 font-bold py-2.5 rounded-lg text-sm transition-opacity`}
  >
    {children}
  </button>
);

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search input */}
        <div className="mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a film..."
            autoFocus={!!initialQuery}
            className="w-full max-w-xl bg-c-input border border-c-border rounded-lg px-4 py-3 text-c-text text-base placeholder-c-text4 focus:outline-none focus:border-c-green transition-colors"
          />
        </div>

        {/* Tabs */}
        {!isSearching && (
          <div className="flex gap-1 mb-6 border-b border-c-border">
            {Object.entries(TAB_LABELS).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-c-green text-c-green'
                    : 'border-transparent text-c-text2 hover:text-c-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-6 items-start">

          {/* ── Filter Sidebar ── */}
          {!isSearching && (
            <aside className="flex-shrink-0 w-64 bg-c-card rounded-xl border border-c-border overflow-hidden">

              {/* Sort */}
              <div className="p-4 border-b border-c-border">
                <p className="text-c-text font-semibold text-sm mb-3">Sort</p>
                <p className="text-c-text3 text-xs mb-2">Sort Results By</p>
                <div className="relative">
                  <select
                    value={pending.sortBy}
                    onChange={(e) => setPending((p) => ({ ...p, sortBy: e.target.value }))}
                    className="w-full appearance-none rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--c-input)',
                      border: '1px solid var(--c-border)',
                      color: 'var(--c-text)',
                      colorScheme: 'auto',
                    }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        style={{ backgroundColor: 'var(--c-card)', color: 'var(--c-text)' }}
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {/* custom chevron */}
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-c-text3 text-xs">▾</span>
                </div>
              </div>

              {/* Filters body */}
              <div className="p-4 border-b border-c-border">
                <p className="text-c-text font-semibold text-sm mb-4">Filters</p>

                {/* Genres */}
                <div className="mb-5">
                  <p className="text-c-text3 text-xs mb-2 uppercase tracking-wider">Genres</p>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRES.map((genre) => {
                      const selected = pending.genres.includes(genre);
                      return (
                        <button
                          key={genre}
                          onClick={() => toggleGenre(genre)}
                          style={selected
                            ? { backgroundColor: 'var(--c-green-muted)', borderColor: 'var(--c-green)', color: 'var(--c-green)' }
                            : undefined
                          }
                          className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                            selected
                              ? 'border-c-green text-c-green'
                              : 'bg-transparent border-c-border text-c-text2 hover:border-c-text3 hover:text-c-text'
                          }`}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Minimum Score */}
                <div className="mb-5">
                  <p className="text-c-text3 text-xs mb-3 uppercase tracking-wider">
                    Minimum Score
                    {pending.voteGte > 0 && (
                      <span className="ml-2 normal-case font-semibold" style={{ color: 'var(--c-green)' }}>
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
                  <div className="flex justify-between text-c-text4 text-xs mt-1">
                    <span>0</span><span>9</span>
                  </div>
                </div>

                {/* Release Date */}
                <div>
                  <p className="text-c-text3 text-xs mb-2 uppercase tracking-wider">Release Date</p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-c-text4 text-xs block mb-1">From</label>
                      <input
                        type="date"
                        value={pending.releaseFrom}
                        onChange={(e) => setPending((p) => ({ ...p, releaseFrom: e.target.value }))}
                        className="w-full rounded px-2 py-1.5 text-xs focus:outline-none transition-colors"
                        style={{
                          backgroundColor: 'var(--c-input)',
                          border: '1px solid var(--c-border)',
                          color: 'var(--c-text)',
                          colorScheme: 'auto',
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-c-text4 text-xs block mb-1">To</label>
                      <input
                        type="date"
                        value={pending.releaseTo}
                        onChange={(e) => setPending((p) => ({ ...p, releaseTo: e.target.value }))}
                        className="w-full rounded px-2 py-1.5 text-xs focus:outline-none transition-colors"
                        style={{
                          backgroundColor: 'var(--c-input)',
                          border: '1px solid var(--c-border)',
                          color: 'var(--c-text)',
                          colorScheme: 'auto',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 space-y-2">
                <GreenBtn onClick={handleApplyFilters}>Search</GreenBtn>
                {isFiltered && (
                  <button
                    onClick={handleResetFilters}
                    className="w-full py-2 rounded-lg text-sm transition-colors border border-c-border text-c-text2 bg-c-surface hover:bg-c-input"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </aside>
          )}

          {/* ── Movie Grid ── */}
          <div className="flex-1 min-w-0">
            {isSearching && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-c-text2 text-sm font-medium uppercase tracking-wider">
                  Results for &ldquo;{debouncedQuery}&rdquo;
                </h2>
                <span className="text-c-text3 text-xs">{searchResults.length} films found</span>
              </div>
            )}

            {isLoading && <div className="flex justify-center py-20"><Spin size="large" /></div>}

            {!isLoading && displayMovies.length === 0 && (
              <div className="text-center py-20">
                <p className="text-c-text3 text-sm">
                  {isSearching
                    ? `No films found for "${debouncedQuery}"`
                    : 'No results. Try adjusting the filters.'}
                </p>
              </div>
            )}

            {!isLoading && displayMovies.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {displayMovies.map((movie) => (
                    <MovieCard key={`${movie.tmdb_id}-${movie.title}`} movie={movie} />
                  ))}
                </div>

                {!isSearching && page < totalPages && (
                  <div className="mt-8 flex justify-center">
                    <GreenBtn onClick={handleLoadMore} disabled={loadingMore} fullWidth={false}>
                      <span className="px-16">{loadingMore ? 'Loading...' : 'Load More'}</span>
                    </GreenBtn>
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
