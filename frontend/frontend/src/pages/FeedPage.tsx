import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin } from 'antd';
import { feedService } from '../services/feed.service';
import type { FeedActivity } from '../types';
import Navbar from '../components/ui/Navbar';
import { buildRoute } from '../constants/routes';

const PLACEHOLDER_POSTER = 'https://placehold.co/60x90/1a1d20/9ab?text=?';

const BoltIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const StarsFilled = ({ rating }: { rating: number }) => {
  const stars = Math.round(rating / 2);
  return (
    <div className="flex gap-0.5 flex-shrink-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
          fill={i < stars ? '#00e054' : 'none'}
          stroke={i < stars ? '#00e054' : 'rgba(255,255,255,0.2)'}
          strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};

const ActivityCard = ({ activity }: { activity: FeedActivity }) => {
  const date = new Date(activity.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="flex gap-4 py-4 border-b border-c-border">
      <Link to={buildRoute.movieDetail(activity.movie.tmdb_id)} className="flex-shrink-0">
        <img
          src={activity.movie.poster_path || PLACEHOLDER_POSTER}
          alt={activity.movie.title}
          className="w-10 rounded object-cover hover:opacity-80 transition-opacity"
          style={{ height: '60px' }}
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
            <Link to={buildRoute.profile(activity.user.username)}
              className="font-bold hover:underline"
              style={{ color: '#00e054' }}>
              {activity.user.username}
            </Link>
            <span className="text-[#678]">watched</span>
            <Link to={buildRoute.movieDetail(activity.movie.tmdb_id)}
              className="text-[#ccc] font-semibold hover:text-white transition-colors">
              {activity.movie.title}
            </Link>
          </div>
          <StarsFilled rating={activity.rating} />
        </div>

        {activity.content && (
          <p className="text-[#9ab] text-sm leading-relaxed line-clamp-2 mb-1" style={{ fontFamily: 'Lato, sans-serif' }}>
            {activity.content}
          </p>
        )}
        <p className="text-[#678] text-xs" style={{ fontFamily: 'Lato, sans-serif' }}>{date}</p>
      </div>
    </div>
  );
};

const FeedPage = () => {
  const [activities, setActivities] = useState<FeedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    feedService
      .getFeed()
      .then((res) => { setActivities(res.activities); setIsEmpty(res.isEmpty); })
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-c-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Letterboxd-style section heading */}
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-c-border">
          <span style={{ color: '#00e054' }}><BoltIcon /></span>
          <h1
            className="text-c-text text-sm font-bold uppercase tracking-widest"
            style={{ fontFamily: 'Source Sans 3, sans-serif' }}
          >
            your activity
          </h1>
        </div>

        {loading && <div className="flex justify-center py-16"><Spin size="large" /></div>}

        {!loading && isEmpty && (
          <div className="text-center py-16">
            <p className="text-[#9ab] mb-2 text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>Your feed is empty.</p>
            <p className="text-[#678] text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
              Follow other members to see their activity here.
            </p>
          </div>
        )}

        {!loading && !isEmpty && activities.length === 0 && (
          <p className="text-[#678] text-sm py-8" style={{ fontFamily: 'Lato, sans-serif' }}>
            No recent activity from people you follow.
          </p>
        )}

        {!loading && activities.length > 0 && (
          <div>{activities.map((a) => <ActivityCard key={a.id} activity={a} />)}</div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
