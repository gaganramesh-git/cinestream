import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MovieList from './components/MovieList';
import MovieDetails from './components/MovieDetails';
import Auth from './components/Auth';
import People from './components/People';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Persist login across reloads conditionally
    const storedUser = localStorage.getItem('cinestream_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('cinestream_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cinestream_user');
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a] text-slate-200">
        <header className="p-4 border-b border-slate-800 bg-[#020617]/50 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center"> 
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tight hover:scale-105 transition-transform">
                CineStream
              </Link>
              {user && (
                <nav className="hidden md:flex gap-6 font-medium text-sm text-slate-300">
                  <Link to="/" className="hover:text-blue-400 transition-colors">Movies</Link>
                  <Link to="/people" className="hover:text-blue-400 transition-colors">Cast & Crew</Link>
                </nav>
              )}
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-slate-400 font-medium text-sm hidden sm:block">Hello, {user.username || user.USERNAME}</span>
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-slate-700 text-sm font-semibold py-1.5 px-4 rounded-lg transition-colors border border-slate-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="container mx-auto p-4 py-8">
          {!user ? (
            <Auth onLogin={handleLogin} />
          ) : (
            <Routes>
              <Route path="/" element={<MovieList />} />
              <Route path="/movie/:id" element={<MovieDetails user={user} />} />
              <Route path="/people" element={<People />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
