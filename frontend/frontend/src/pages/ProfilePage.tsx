import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, message, Modal } from 'antd';
import { usersService } from '../services/users.service';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { UserProfile, Review } from '../types';
import ReviewCard from '../components/features/ReviewCard';
import Navbar from '../components/ui/Navbar';

const StatBox = ({ label, value }: { label: string; value: number }) => (
  <div className="text-center">
    <div className="text-c-text text-xl font-bold">{value}</div>
    <div className="text-c-text3 text-xs uppercase tracking-wider">{label}</div>
  </div>
);

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { data: authData, actions: authActions } = useAuth();
  const { state: themeState } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const isOwnProfile = authData.user?.username === username;

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    Promise.all([usersService.getProfile(username), usersService.getReviews(username)])
      .then(([profileData, reviewData]) => {
        setProfile(profileData);
        setReviews(reviewData.reviews);
        setEditBio(profileData.user.bio || '');
        setEditAvatar(profileData.user.avatar_url || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  const handleFollowToggle = async () => {
    if (!profile || !username) return;
    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await usersService.unfollow(username);
        setProfile((prev) => prev ? { ...prev, isFollowing: false, stats: { ...prev.stats, followers: prev.stats.followers - 1 } } : prev);
        message.success(`Unfollowed ${username}`);
      } else {
        await usersService.follow(username);
        setProfile((prev) => prev ? { ...prev, isFollowing: true, stats: { ...prev.stats, followers: prev.stats.followers + 1 } } : prev);
        message.success(`Following ${username}`);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      message.error(msg || 'Something went wrong');
    } finally { setFollowLoading(false); }
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      await usersService.updateProfile({ bio: editBio, avatar_url: editAvatar });
      setProfile((prev) => prev ? { ...prev, user: { ...prev.user, bio: editBio, avatar_url: editAvatar || null } } : prev);
      if (authActions.updateUser) authActions.updateUser({ bio: editBio, avatar_url: editAvatar || null });
      message.success('Profile updated');
      setEditOpen(false);
    } catch { message.error('Failed to update profile'); }
    finally { setEditLoading(false); }
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    setProfile((prev) => prev ? { ...prev, stats: { ...prev.stats, reviews: prev.stats.reviews - 1 } } : prev);
  };

  const isDark = themeState.theme === 'dark';
  const modalStyles = isDark
    ? { content: { background: '#1a1d20', border: '1px solid #2c3440' }, header: { background: '#1a1d20' } }
    : { content: { background: '#ffffff', border: '1px solid #d4d0cc' }, header: { background: '#ffffff' } };

  if (loading) {
    return (
      <div className="min-h-screen bg-c-bg">
        <Navbar />
        <div className="flex justify-center items-center py-32"><Spin size="large" /></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-c-bg">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <p className="text-c-text2">User not found</p>
        </div>
      </div>
    );
  }

  const avatarUrl = profile.user.avatar_url;

  return (
    <div className="min-h-screen bg-c-bg">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-c-card2 rounded-lg p-6 border border-c-border mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-c-surface overflow-hidden flex items-center justify-center text-c-text text-2xl font-bold flex-shrink-0">
                {avatarUrl
                  ? <img src={avatarUrl} alt={profile.user.username} className="w-full h-full object-cover" />
                  : profile.user.username[0].toUpperCase()
                }
              </div>
              <div>
                <h1 className="text-c-text text-xl font-bold">{profile.user.username}</h1>
                {profile.user.bio
                  ? <p className="text-c-text2 text-sm mt-1 max-w-sm">{profile.user.bio}</p>
                  : isOwnProfile && <p className="text-c-text4 text-sm mt-1 italic">No bio yet</p>
                }
                <p className="text-c-text3 text-xs mt-1">
                  Member since {new Date(profile.user.created_at).getFullYear()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {isOwnProfile && (
                <button
                  onClick={() => setEditOpen(true)}
                  className="px-4 py-2 rounded text-sm bg-c-surface text-c-text2 hover:text-c-text border border-c-border transition-colors"
                >
                  Edit profile
                </button>
              )}
              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  style={!profile.isFollowing ? { backgroundColor: 'var(--c-green)', color: '#000000' } : undefined}
                  className={`px-5 py-2 rounded text-sm font-medium disabled:opacity-50 transition-colors ${
                    profile.isFollowing
                      ? 'bg-c-surface text-c-text2 hover:text-red-500 border border-c-border'
                      : ''
                  }`}
                >
                  {followLoading ? '...' : profile.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 pt-4 border-t border-c-border">
            <StatBox label="Films" value={profile.stats.watched} />
            <StatBox label="Reviews" value={profile.stats.reviews} />
            <StatBox label="Watchlist" value={profile.stats.watchlist} />
            <StatBox label="Followers" value={profile.stats.followers} />
            <StatBox label="Following" value={profile.stats.following} />
          </div>
        </div>

        <div>
          <h2 className="text-c-text font-semibold text-lg mb-4">Recent Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-c-text3 text-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  showMovie
                  onDelete={isOwnProfile ? handleDeleteReview : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        title={<span className="text-c-text">Edit Profile</span>}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleEditSave}
        confirmLoading={editLoading}
        okText="Save"
        styles={modalStyles}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-c-text2 text-sm">Bio</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Tell the world about your taste in films..."
              className="w-full bg-c-input border border-c-border rounded px-3 py-2 text-c-text text-sm placeholder-c-text4 focus:outline-none focus:border-c-green transition-colors resize-none"
            />
            <p className="text-c-text4 text-xs text-right">{editBio.length}/300</p>
          </div>
          <div className="space-y-1">
            <label className="text-c-text2 text-sm">Avatar URL</label>
            <input
              type="url"
              value={editAvatar}
              onChange={(e) => setEditAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-c-input border border-c-border rounded px-3 py-2 text-c-text text-sm placeholder-c-text4 focus:outline-none focus:border-c-green transition-colors"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
