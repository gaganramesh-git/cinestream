import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard';
import { Search, Filter, Star } from 'lucide-react';

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/movies');
        setMovies(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch movies. Ensure the backend is running and Oracle DB is reachable.');
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const allGenres = useMemo(() => {
    const genres = new Set();
    movies.forEach(m => {
      if (m.GENRES) {
        m.GENRES.split(', ').forEach(g => genres.add(g));
      }
    });
    return Array.from(genres).sort();
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter(m => {
      // Search
      if (search) {
          const s = search.toLowerCase();
          const matchTitle = m.TITLE && m.TITLE.toLowerCase().includes(s);
          const matchDirector = m.DIRECTOR && m.DIRECTOR.toLowerCase().includes(s);
          const matchCast = m.MAIN_CAST && m.MAIN_CAST.toLowerCase().includes(s);
          if (!matchTitle && !matchDirector && !matchCast) return false;
      }
      // Genre
      if (selectedGenre && (!m.GENRES || !m.GENRES.includes(selectedGenre))) return false;
      // Rating
      if (m.AVERAGE_RATING < minRating) return false;
      return true;
    });
  }, [movies, search, selectedGenre, minRating]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-slate-400">No movies found in the database.</h2>
        <p className="text-slate-500 mt-2">Run the seed.sql script to populate initial data.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in text-white space-y-6">
      
      {/* Filtering Bar */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search movies..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex w-full md:w-auto gap-4 items-center">
          <div className="flex items-center gap-2 flex-1 md:flex-initial">
             <Filter size={18} className="text-slate-400 hidden sm:block" />
             <select 
               value={selectedGenre} 
               onChange={(e) => setSelectedGenre(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
             >
                <option value="">All Genres</option>
                {allGenres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
             </select>
          </div>
          
          <div className="flex items-center gap-2 flex-1 md:flex-initial">
             <Star size={18} className="text-slate-400 hidden sm:block delay-1" />
             <select 
               value={minRating} 
               onChange={(e) => setMinRating(Number(e.target.value))}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
             >
                <option value="0">Any Rating</option>
                <option value="9">9.0+ ⭐</option>
                <option value="8">8.0+ ⭐</option>
                <option value="7">7.0+ ⭐</option>
                <option value="6">6.0+ ⭐</option>
             </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mb-2">
         <h2 className="text-2xl font-bold">Discover Movies</h2>
         <span className="text-slate-400 text-sm">{filteredMovies.length} results</span>
      </div>

      {filteredMovies.length === 0 ? (
          <div className="text-center py-12 p-8 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
            <h2 className="text-lg text-slate-300">No movies match your filters.</h2>
            <button onClick={() => { setSearch(''); setSelectedGenre(''); setMinRating(0); }} className="text-blue-400 mt-2 hover:underline">Clear filters</button>
          </div>
      ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map(movie => (
              <MovieCard key={movie.MOVIE_ID} movie={movie} />
            ))}
          </div>
      )}
    </div>
  );
}

export default MovieList;
