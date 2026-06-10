import { useState } from 'react';
import { Rate, message, Popconfirm } from 'antd';
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

const PLACEHOLDER_POSTER = 'https://placehold.co/60x90/1a1d20/9ab?text=?';

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
    } catch { message.error('Failed to like review'); }
    finally { setLikeLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await reviewsService.remove(review.id);
      message.success('Review deleted');
      onDelete?.(review.id);
    } catch { message.error('Failed to delete review'); }
  };

  return (
    <div className="bg-c-card2 rounded-lg p-4 border border-c-border">
      <div className="flex gap-3">
        {showMovie && review.movie && (
          <Link to={buildRoute.movieDetail(review.movie.tmdb_id)} className="flex-shrink-0">
            <img
              src={review.movie.poster_path || PLACEHOLDER_POSTER}
              alt={review.movie.title}
              className="w-12 rounded object-cover"
              style={{ height: '72px' }}
            />
          </Link>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {review.user && (
                <Link to={buildRoute.profile(review.user.username)} className="text-c-green text-sm font-semibold hover:underline">
                  {review.user.username}
                </Link>
              )}
              {showMovie && review.movie && (
                <Link to={buildRoute.movieDetail(review.movie.tmdb_id)} className="text-c-text text-sm font-semibold hover:text-c-green transition-colors">
                  {review.movie.title}
                </Link>
              )}
            </div>
            <Rate disabled value={review.rating / 2} allowHalf style={{ fontSize: '12px', color: 'var(--c-green)' }} />
          </div>

          <p className="text-c-text2 text-sm leading-relaxed line-clamp-3">{review.content}</p>

          <div className="flex items-center justify-between mt-2">
            <p className="text-c-text3 text-xs">{date}</p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-50 ${
                  liked ? 'text-red-400' : 'text-c-text3 hover:text-red-400'
                }`}
              >
                <span>{liked ? '♥' : '♡'}</span>
                {likesCount > 0 && <span>{likesCount}</span>}
              </button>

              {isOwner && onEdit && (
                <button onClick={onEdit} className="text-c-text3 hover:text-c-green text-xs transition-colors">
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
                  <button className="text-c-text3 hover:text-red-400 text-xs transition-colors">Delete</button>
                </Popconfirm>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
