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

  return (
    <div
      onClick={() => navigate(buildRoute.movieDetail(movie.tmdb_id))}
      className="group cursor-pointer rounded overflow-hidden bg-c-card hover:shadow-lg transition-all duration-200"
    >
      <div className="relative aspect-[2/3]">
        <img
          src={movie.poster_path || PLACEHOLDER_POSTER}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:brightness-90 transition-all"
          loading="lazy"
        />
      </div>
      <div className="p-2">
        <p className="text-c-text text-xs font-medium truncate">{movie.title}</p>
        {releaseYear && <p className="text-c-text3 text-xs">{releaseYear}</p>}
      </div>
    </div>
  );
};

export default MovieCard;
