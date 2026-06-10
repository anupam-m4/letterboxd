import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import { usersService } from '../services/users.service';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';
import Navbar from '../components/ui/Navbar';
import useDebounce from '../hooks/useDebounce';
import { buildRoute } from '../constants/routes';

type SearchUser = Pick<User, 'id' | 'username' | 'bio' | 'avatar_url'>;

const UserSearchPage = () => {
  const { state: authState } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setUsers([]); return; }
    setLoading(true);
    usersService.searchUsers(debouncedQuery)
      .then((data) => setUsers(data.users))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleFollow = async (username: string) => {
    if (!authState.isAuthenticated) { navigate('/login'); return; }
    try {
      if (followed.has(username)) {
        await usersService.unfollow(username);
        setFollowed((prev) => { const next = new Set(prev); next.delete(username); return next; });
      } else {
        await usersService.follow(username);
        setFollowed((prev) => new Set(prev).add(username));
      }
    } catch { message.error('Something went wrong'); }
  };

  return (
    <div className="min-h-screen bg-c-bg">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-c-text text-2xl font-bold mb-6">Find people</h1>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username..."
          autoFocus
          className="w-full bg-c-input border border-c-border rounded-lg px-4 py-3 text-c-text text-base placeholder-c-text4 focus:outline-none focus:border-c-green transition-colors mb-6"
        />

        {loading && <div className="flex justify-center py-12"><Spin size="large" /></div>}

        {!loading && debouncedQuery.trim() && users.length === 0 && (
          <p className="text-c-text3 text-sm text-center py-8">No users found for "{debouncedQuery}"</p>
        )}

        {!loading && !debouncedQuery.trim() && (
          <p className="text-c-text3 text-sm text-center py-8">Start typing to find people</p>
        )}

        {!loading && users.length > 0 && (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-4 bg-c-card2 rounded-lg p-4 border border-c-border">
                <button onClick={() => navigate(buildRoute.profile(user.username))} className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-c-surface overflow-hidden flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-c-text2 font-semibold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </button>

                <div className="flex-1 min-w-0">
                  <button onClick={() => navigate(buildRoute.profile(user.username))} className="text-c-text font-medium hover:text-c-green transition-colors">
                    {user.username}
                  </button>
                  {user.bio && <p className="text-c-text3 text-sm truncate mt-0.5">{user.bio}</p>}
                </div>

                {authState.isAuthenticated && (
                  <button
                    onClick={() => handleFollow(user.username)}
                    style={!followed.has(user.username) ? {
                      backgroundColor: 'var(--c-green-muted)',
                      borderColor: 'var(--c-green-ring)',
                      color: 'var(--c-green)',
                    } : undefined}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex-shrink-0 border ${
                      followed.has(user.username)
                        ? 'bg-c-surface text-c-text2 hover:text-red-500 border-c-border'
                        : 'border-c-green text-c-green'
                    }`}
                  >
                    {followed.has(user.username) ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearchPage;
