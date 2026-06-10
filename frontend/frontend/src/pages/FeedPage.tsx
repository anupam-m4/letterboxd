import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rate, Spin } from 'antd';
import { feedService } from '../services/feed.service';
import type { FeedActivity } from '../types';
import Navbar from '../components/ui/Navbar';
import { buildRoute } from '../constants/routes';

const PLACEHOLDER_POSTER = 'https://placehold.co/60x90/1a1d20/9ab?text=?';

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
          className="w-12 rounded object-cover"
          style={{ height: '72px' }}
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={buildRoute.profile(activity.user.username)} className="text-c-green text-sm font-semibold hover:underline">
              {activity.user.username}
            </Link>
            <span className="text-c-text3 text-sm">watched</span>
            <Link to={buildRoute.movieDetail(activity.movie.tmdb_id)} className="text-c-text text-sm font-semibold hover:text-c-green transition-colors">
              {activity.movie.title}
            </Link>
          </div>
          <Rate disabled value={activity.rating / 2} allowHalf style={{ fontSize: '12px', color: 'var(--c-green)' }} />
        </div>

        <p className="text-c-text2 text-sm leading-relaxed line-clamp-2">{activity.content}</p>
        <p className="text-c-text3 text-xs mt-2">{date}</p>
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
        <h1 className="text-c-text text-2xl font-bold mb-6">Activity</h1>

        {loading && <div className="flex justify-center py-16"><Spin size="large" /></div>}

        {!loading && isEmpty && (
          <div className="text-center py-16">
            <p className="text-c-text2 mb-2">Your feed is empty.</p>
            <p className="text-c-text3 text-sm">Follow other users to see their activity here.</p>
          </div>
        )}

        {!loading && !isEmpty && activities.length === 0 && (
          <p className="text-c-text3 text-sm py-8">No recent activity from people you follow.</p>
        )}

        {!loading && activities.length > 0 && (
          <div>{activities.map((a) => <ActivityCard key={a.id} activity={a} />)}</div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
