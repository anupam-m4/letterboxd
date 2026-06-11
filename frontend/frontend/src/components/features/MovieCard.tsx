import { useNavigate } from 'react-router-dom';
import { buildRoute } from '../../constants/routes';
import type { TmdbSearchResult } from '../../types';

interface MovieCardProps {
  movie: TmdbSearchResult;
}

const PLACEHOLDER_POSTER = 'https://placehold.co/185x278/1a1d20/9ab?text=No+Poster';

const MovieCard = ({ movie }: MovieCardProps) => {
  const navigate = useNavigate();
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const stars = Math.ceil((movie.vote_average ?? 0) / 2);

  return (
    <div
      onClick={() => navigate(buildRoute.movieDetail(movie.tmdb_id))}
      className="group cursor-pointer"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded overflow-hidden mb-1.5">
        <img
          src={movie.poster_path || PLACEHOLDER_POSTER}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}>
          <div className="p-2">
            {/* Mini star rating */}
            {movie.vote_average > 0 && (
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="10" height="10" viewBox="0 0 24 24"
                    fill={i < stars ? '#00e054' : 'none'}
                    stroke={i < stars ? '#00e054' : 'rgba(255,255,255,0.4)'}
                    strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
            )}
            <p className="text-white text-xs font-semibold leading-tight line-clamp-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              {movie.title}
            </p>
          </div>
        </div>

        {/* Green border on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded"
          style={{ boxShadow: 'inset 0 0 0 2px #00e054' }} />
      </div>

      {/* Title below poster (shown always, small) */}
      <p className="text-[#9ab] text-xs truncate leading-tight group-hover:text-white transition-colors" style={{ fontFamily: 'Lato, sans-serif' }}>
        {movie.title}
      </p>
      {releaseYear && (
        <p className="text-[#678] text-xs" style={{ fontFamily: 'Lato, sans-serif' }}>{releaseYear}</p>
      )}
    </div>
  );
};

export default MovieCard;
