import { useState } from 'react';
import { message, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import { buildRoute } from '../../constants/routes';
import { reviewsService } from '../../services/reviews.service';
import { useAuth } from '../../context/AuthContext';
import type { Review } from '../../types';

interface ReviewCardProps {
  review: Review;
  showMovie?: boolean;
  onDelete?: (reviewId: string) => void;
  onEdit?: () => void;
}

const TMDB_W = 'https://image.tmdb.org/t/p';

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#f5a623' : 'none'} stroke={filled ? 'none' : '#678'} strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const starsText = (rating: number) => {
  const half = rating / 2;
  const full = Math.floor(half);
  const hasHalf = half - full >= 0.5;
  return '★'.repeat(full) + (hasHalf ? '½' : '');
};

const ReviewCard = ({ review, showMovie = false, onDelete, onEdit }: ReviewCardProps) => {
  const { state: authState, data: authData } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(review.likes_count);
  const [likeLoading, setLikeLoading] = useState(false);

  const isOwner = authState.isAuthenticated && authData.user?.id === review.user?.id;
  const date = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const handleLike = async () => {
    if (!authState.isAuthenticated) { message.info('Sign in to like reviews'); return; }
    setLikeLoading(true);
    try {
      const result = await reviewsService.like(review.id);
      setLiked(result.liked);
      setLikesCount(result.likes_count);
    } catch {
      message.error('Failed to like review');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await reviewsService.remove(review.id);
      message.success('Review deleted');
      onDelete?.(review.id);
    } catch {
      message.error('Failed to delete review');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '14px', padding: '16px 0', borderBottom: '1px solid #2c3440' }}>
      {/* Poster */}
      {showMovie && review.movie && (
        <Link to={buildRoute.movieDetail(review.movie.tmdb_id)} style={{ flexShrink: 0, textDecoration: 'none' }}>
          <div style={{ width: '54px', height: '81px', borderRadius: '3px', overflow: 'hidden', backgroundColor: '#2c3440' }}>
            {review.movie.poster_path ? (
              <img src={`${TMDB_W}/w92${review.movie.poster_path}`} alt={review.movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#678', fontSize: '10px' }}>?</div>
            )}
          </div>
        </Link>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Film title */}
        {showMovie && review.movie && (
          <div style={{ marginBottom: '6px' }}>
            <Link to={buildRoute.movieDetail(review.movie.tmdb_id)} style={{ textDecoration: 'none' }}>
              <span style={{ color: '#fff', fontSize: '16px', fontWeight: 700, fontFamily: 'Lato, sans-serif' }}>
                {review.movie.title}
              </span>
            </Link>
          </div>
        )}

        {/* User + stars + date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {review.user && (
            <Link to={buildRoute.profile(review.user.username)} style={{ color: '#00e054', fontSize: '13px', fontFamily: 'Lato, sans-serif', fontWeight: 600, textDecoration: 'none' }}>
              {review.user.username}
            </Link>
          )}
          {review.rating > 0 && (
            <span style={{ color: '#00e054', fontSize: '13px', letterSpacing: '1px' }}>
              {starsText(review.rating)}
            </span>
          )}
          <span style={{ color: '#678', fontSize: '11px', fontFamily: 'Lato, sans-serif' }}>{date}</span>
        </div>

        {/* Review text */}
        <p style={{
          color: '#9ab', fontSize: '13px', fontFamily: 'Lato, sans-serif', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: '10px',
        }}>
          {review.content}
        </p>

        {/* Likes + edit/delete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={handleLike}
            disabled={likeLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: likeLoading ? 'not-allowed' : 'pointer', padding: 0, color: liked ? '#f5a623' : '#678', fontFamily: 'Lato, sans-serif', fontSize: '12px', opacity: likeLoading ? 0.5 : 1 }}
          >
            <HeartIcon filled={liked} />
            {likesCount > 0 && <span>{likesCount}</span>}
          </button>

          {isOwner && onEdit && (
            <button
              onClick={onEdit}
              style={{ background: 'none', border: 'none', color: '#678', cursor: 'pointer', padding: 0, fontSize: '12px', fontFamily: 'Lato, sans-serif' }}
            >
              Edit
            </button>
          )}

          {isOwner && onDelete && (
            <Popconfirm
              title="Delete this review?"
              description="This cannot be undone."
              onConfirm={handleDelete}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <button style={{ background: 'none', border: 'none', color: '#678', cursor: 'pointer', padding: 0, fontSize: '12px', fontFamily: 'Lato, sans-serif' }}>
                Delete
              </button>
            </Popconfirm>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
