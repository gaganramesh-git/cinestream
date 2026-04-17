import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const famousPhotos = {
  "Christopher Nolan": "https://image.tmdb.org/t/p/w500/xuAIuYSv41235lNEM4fU959aFn.jpg", // Example/Placeholder paths (fallback will work if 404)
  "Leonardo DiCaprio": "https://image.tmdb.org/t/p/w500/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
  "Christian Bale": "https://image.tmdb.org/t/p/w500/b7fTC9WFkgqGOv77mLQcalo4EpLx.jpg",
  "Denis Villeneuve": "https://image.tmdb.org/t/p/w500/rCXBaXJqNfXpY0n28NihUvF7z7y.jpg",
  "Timothée Chalamet": "https://image.tmdb.org/t/p/w500/8jNFfNmqZX0nQugQhM3TfC13P7M.jpg",
  "Steven Spielberg": "https://image.tmdb.org/t/p/w500/tZxcg19YQ3e8fJ0pOs7hjlnOMLk.jpg",
  "Quentin Tarantino": "https://image.tmdb.org/t/p/w500/1gjcpAa99FAOWGnrUvHEXXsRsLS.jpg",
  "Brad Pitt": "https://image.tmdb.org/t/p/w500/hu52E9rExw3M059V8E9zT3K2m8U.jpg",
  "Keanu Reeves": "https://image.tmdb.org/t/p/w500/rRdru6REr9i3WIHv2mntpcgx6z5.jpg",
  "Michelle Yeoh": "https://image.tmdb.org/t/p/w500/w0qg4oFh0w9If5b4uEDdEa1I3eP.jpg",
  "Marlon Brando": "https://image.tmdb.org/t/p/w500/wzL4EYhT3XfE7C1zmdt4WdZqALW.jpg"
};

function getPhotoUrl(name) {
  if (famousPhotos[name]) return famousPhotos[name];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e293b&color=cbd5e1&size=256&font-size=0.33`;
}

function People() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('actors'); // 'actors' or 'directors'

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/movies');
        setMovies(response.data);
      } catch (err) {
        console.error('Failed to fetch movies for people mapping', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const data = useMemo(() => {
    const actorsMap = {};
    const directorsMap = {};

    movies.forEach(m => {
      if (m.DIRECTOR) {
        m.DIRECTOR.split(',').forEach(d => {
          const name = d.trim();
          if (!name) return;
          if (!directorsMap[name]) directorsMap[name] = { name, movies: [], role: 'Director', photo: getPhotoUrl(name) };
          directorsMap[name].movies.push(m);
        });
      }
      if (m.MAIN_CAST) {
        m.MAIN_CAST.split(',').forEach(c => {
          const name = c.trim();
          if (!name) return;
          if (!actorsMap[name]) actorsMap[name] = { name, movies: [], role: 'Actor', photo: getPhotoUrl(name) };
          actorsMap[name].movies.push(m);
        });
      }
    });

    return {
      actors: Object.values(actorsMap).sort((a, b) => b.movies.length - a.movies.length || a.name.localeCompare(b.name)),
      directors: Object.values(directorsMap).sort((a, b) => b.movies.length - a.movies.length || a.name.localeCompare(b.name))
    };
  }, [movies]);

  if (loading) {
    return <div className="text-center p-12 text-blue-400">Loading cast & crew...</div>;
  }

  const peopleList = view === 'actors' ? data.actors : data.directors;

  return (
    <div className="animate-fade-in text-white space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
           Cast & Crew
         </h2>
         <div className="flex bg-slate-800 p-1 rounded-xl shadow border border-slate-700">
           <button 
             onClick={() => setView('actors')} 
             className={`px-6 py-2 rounded-lg font-medium transition-all ${view === 'actors' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
           >
             Actors
           </button>
           <button 
             onClick={() => setView('directors')} 
             className={`px-6 py-2 rounded-lg font-medium transition-all ${view === 'directors' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
           >
             Directors
           </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {peopleList.map(person => (
          <div key={person.name} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col hover:border-blue-500/50 transition-colors">
            <div className="h-48 bg-slate-900 border-b border-slate-700/50 shrink-0 overflow-hidden relative">
               <img src={person.photo} alt={person.name} className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=1e293b&color=cbd5e1&size=256`}} />
               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                 <h3 className="font-bold text-xl text-white drop-shadow-md">{person.name}</h3>
                 <p className="text-blue-400 text-sm font-medium">{person.role}</p>
               </div>
            </div>
            <div className="p-4 flex-1">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Known For ({person.movies.length})</h4>
               <ul className="space-y-2">
                 {person.movies.map(m => (
                   <li key={m.MOVIE_ID}>
                     <Link to={`/movie/${m.MOVIE_ID}`} className="text-sm text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block"></span>
                       {m.TITLE} <span className="text-slate-500 text-xs">({m.RELEASE_YEAR})</span>
                     </Link>
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default People;