import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useAuth } from '../context/AuthContext';
import { usersService } from '../services/users.service';
import type { WatchlistEntry } from '../types';
import MovieGrid from '../components/features/MovieGrid';
import Navbar from '../components/ui/Navbar';

const WatchlistPage = () => {
  const { data } = useAuth();
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data.user) return;
    usersService.getWatchlist(data.user.username)
      .then((res) => setEntries(res.movies))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [data.user]);

  const movies = entries.map((e) => e.movie).filter(Boolean) as NonNullable<WatchlistEntry['movie']>[];

  return (
    <div className="min-h-screen bg-c-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-baseline gap-3 mb-6">
          <h1 className="text-c-text text-2xl font-bold">Watchlist</h1>
          {!loading && (
            <span className="text-c-text3 text-sm">{movies.length} film{movies.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spin size="large" /></div>
        ) : (
          <MovieGrid movies={movies} emptyMessage="Your watchlist is empty. Add films from their detail page." />
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
