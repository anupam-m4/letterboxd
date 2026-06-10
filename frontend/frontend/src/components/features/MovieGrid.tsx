import { useNavigate } from 'react-router-dom';
import { buildRoute } from '../../constants/routes';
import type { MovieSummary } from '../../types';

interface MovieGridProps {
  movies: MovieSummary[];
  emptyMessage?: string;
}

const PLACEHOLDER = 'https://placehold.co/185x278/1a1d20/9ab?text=No+Poster';

const MovieGrid = ({ movies, emptyMessage = 'No movies here yet.' }: MovieGridProps) => {
  const navigate = useNavigate();

  if (movies.length === 0) {
    return <p className="text-[#678] text-sm py-4">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
      {movies.map((movie) => (
        <div
          key={movie.id}
          onClick={() => navigate(buildRoute.movieDetail(movie.tmdb_id))}
          className="group cursor-pointer rounded overflow-hidden hover:scale-105 transition-transform duration-200"
        >
          <div className="relative aspect-[2/3]">
            <img
              src={movie.poster_path || PLACEHOLDER}
              alt={movie.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieGrid;
