import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import { usersService } from '../services/users.service';
import { useAuth } from '../context/AuthContext';
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
        <div className="rounded p-6 border border-[#2c3440] mb-8" style={{ backgroundColor: '#1c2028' }}>
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
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#2c3440]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#00e054"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            <h2 className="text-white text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Recent Reviews</h2>
          </div>
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

      {/* ── Edit Profile Modal ─────────────────────────────────── */}
      {editOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div style={{
            backgroundColor: '#1c2028',
            border: '1px solid #2c3440',
            borderRadius: '8px',
            width: '100%', maxWidth: '460px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px 16px',
              borderBottom: '1px solid #2c3440',
            }}>
              <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, fontFamily: 'Lato, sans-serif', margin: 0, letterSpacing: '0.03em' }}>
                Edit Profile
              </h3>
              <button
                onClick={() => setEditOpen(false)}
                style={{ background: 'none', border: 'none', color: '#678', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '0 4px', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#9ab')}
                onMouseLeave={e => (e.currentTarget.style.color = '#678')}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px 24px' }}>
              {/* Bio */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block', color: '#9ab', fontSize: '11px',
                  fontFamily: 'Lato, sans-serif', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px',
                }}>
                  Bio
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="Tell the world about your taste in films…"
                  style={{
                    width: '100%', backgroundColor: '#252b36',
                    border: '1px solid #3d4f5d', borderRadius: '4px',
                    color: '#e8eaed', fontSize: '13px', fontFamily: 'Lato, sans-serif',
                    padding: '10px 12px', outline: 'none', resize: 'none',
                    boxSizing: 'border-box', lineHeight: 1.5,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#00e054')}
                  onBlur={e => (e.target.style.borderColor = '#3d4f5d')}
                />
                <p style={{ color: '#678', fontSize: '11px', fontFamily: 'Lato, sans-serif', textAlign: 'right', marginTop: '4px' }}>
                  {editBio.length}/300
                </p>
              </div>

              {/* Avatar URL */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{
                  display: 'block', color: '#9ab', fontSize: '11px',
                  fontFamily: 'Lato, sans-serif', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px',
                }}>
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  style={{
                    width: '100%', backgroundColor: '#252b36',
                    border: '1px solid #3d4f5d', borderRadius: '4px',
                    color: '#e8eaed', fontSize: '13px', fontFamily: 'Lato, sans-serif',
                    padding: '10px 12px', outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#00e054')}
                  onBlur={e => (e.target.style.borderColor = '#3d4f5d')}
                />
                {editAvatar && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={editAvatar}
                      alt="preview"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2c3440' }}
                    />
                    <span style={{ color: '#678', fontSize: '11px', fontFamily: 'Lato, sans-serif' }}>Preview</span>
                  </div>
                )}
              </div>

              {/* Footer buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setEditOpen(false)}
                  style={{
                    backgroundColor: 'transparent', border: '1px solid #3d4f5d',
                    borderRadius: '4px', color: '#9ab', fontSize: '13px',
                    fontFamily: 'Lato, sans-serif', fontWeight: 600,
                    padding: '8px 20px', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#678'; e.currentTarget.style.color = '#cdd'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d4f5d'; e.currentTarget.style.color = '#9ab'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={editLoading}
                  style={{
                    backgroundColor: '#00e054', border: 'none',
                    borderRadius: '4px', color: '#000', fontSize: '13px',
                    fontFamily: 'Lato, sans-serif', fontWeight: 700,
                    padding: '8px 24px', cursor: editLoading ? 'not-allowed' : 'pointer',
                    opacity: editLoading ? 0.7 : 1, transition: 'opacity 0.15s, background-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!editLoading) e.currentTarget.style.backgroundColor = '#00c048'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#00e054'; }}
                >
                  {editLoading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
