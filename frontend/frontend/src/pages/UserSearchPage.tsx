import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import { usersService } from '../services/users.service';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';
import Navbar from '../components/ui/Navbar';
import useDebounce from '../hooks/useDebounce';
import { buildRoute } from '../constants/routes';

type SearchUser = Pick<User, 'id' | 'username' | 'bio' | 'avatar_url'> & { is_following: boolean };

const FollowButton = ({
  username, isFollowing, onToggle,
}: { username: string; isFollowing: boolean; onToggle: (u: string) => void }) => {
  const [hovered, setHovered] = useState(false);

  const label    = isFollowing ? (hovered ? 'Unfollow' : '✓ Following') : '+ Follow';
  const bg       = isFollowing ? (hovered ? '#3d1010' : '#1a2e1a')      : '#00e054';
  const color    = isFollowing ? (hovered ? '#f87171' : '#00e054')      : '#000';
  const border   = isFollowing ? (hovered ? '#f87171' : '#00e054')      : '#00e054';

  return (
    <button
      onClick={() => onToggle(username)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        padding: '5px 14px',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'Lato, sans-serif',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        border: `1px solid ${border}`,
        backgroundColor: bg,
        color,
        minWidth: '90px',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
};

const UserSearchPage = () => {
  const { state: authState, data: authData } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const debouncedQuery = useDebounce(query, 350);

  // Seed the followed Set from the real DB on mount — source of truth
  useEffect(() => {
    if (!authState.isAuthenticated) return;
    usersService.getMyFollowing()
      .then(res => setFollowed(new Set(res.following)))
      .catch(() => { /* not critical — 409 self-correction handles edge cases */ });
  }, [authState.isAuthenticated]);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setUsers([]); return; }
    if (authState.isLoading) return;
    setLoading(true);
    usersService.searchUsers(debouncedQuery)
      .then((res) => {
        const currentUsername = authData.user?.username?.toLowerCase();
        const filtered = res.users.filter(u => u.username.toLowerCase() !== currentUsername);
        setUsers(filtered);
        // Merge is_following from search results into the followed Set
        setFollowed(prev => {
          const next = new Set(prev);
          filtered.forEach(u => { if (u.is_following) next.add(u.username); });
          return next;
        });
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery, authState.isLoading]);

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
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        // Backend says already following — fix state silently
        setFollowed((prev) => new Set(prev).add(username));
      } else if (status === 404) {
        // Backend says not following — fix state silently
        setFollowed((prev) => { const next = new Set(prev); next.delete(username); return next; });
      } else {
        message.error('Something went wrong');
      }
    }
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
                  <FollowButton
                    username={user.username}
                    isFollowing={followed.has(user.username)}
                    onToggle={handleFollow}
                  />
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
