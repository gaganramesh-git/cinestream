import React from 'react';
import { Link } from 'react-router-dom';

function MovieCard({ movie }) {
  return (
    <Link to={`/movie/${movie.MOVIE_ID}`} className="group bg-slate-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all block flex flex-col h-full">
      <div className="aspect-[2/3] bg-slate-700 relative overflow-hidden flex items-center justify-center shrink-0">
         {movie.POSTER_URL ? (
             <img src={movie.POSTER_URL} alt={movie.TITLE} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
         ) : (
             <span className="text-slate-500 font-medium">No Poster</span>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <span className="text-white font-semibold flex items-center gap-1">
              View Details <span className="text-blue-400">→</span>
            </span>
         </div>
         {movie.AVERAGE_RATING > 0 && (
             <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow border-2 border-slate-900 pt-1 pb-1">
                ⭐ {Number(movie.AVERAGE_RATING).toFixed(1)}
             </div>
         )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg leading-tight mb-2 text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2">
          {movie.TITLE}
        </h3>
        
        {movie.GENRES && (
           <div className="text-xs text-blue-300/80 mb-2 line-clamp-1">{movie.GENRES}</div>
        )}
        
        {movie.DIRECTOR && (
           <div className="text-xs text-slate-500 mb-2 italic line-clamp-1">Dir. {movie.DIRECTOR}</div>
        )}

        <div className="text-sm text-slate-400 flex justify-between items-center mt-auto">
          <span>{movie.RELEASE_YEAR || 'N/A'}</span>
          <span>{movie.DURATION_MINS ? `${movie.DURATION_MINS}m` : ''}</span>
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;
