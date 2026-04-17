import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Clock, Calendar, ArrowLeft } from 'lucide-react';

function MovieDetails({ user }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 10, text: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [movieRes, reviewsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/movies/${id}`),
        axios.get(`http://localhost:5000/api/reviews/movie/${id}`)
      ]);
      setMovie(movieRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error('Failed to fetch details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Must be logged in to submit a review");
    
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/reviews', {
        userId: user.user_id || user.USER_ID,
        movieId: id,
        rating: Number(newReview.rating),
        text: newReview.text
      });
      setNewReview({ rating: 10, text: '' });
      fetchDetails(); // Refetch to show new review
    } catch (err) {
      console.error(err);
      alert(`Failed to submit review: ${err.response?.data?.error || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-blue-400">Loading details...</p>;
  if (!movie) return <div className="text-red-400 p-4">Movie not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition gap-2">
        <ArrowLeft size={16} /> Back to Movies
      </Link>
      
      <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-700">
        <div className="w-full md:w-[35%] aspect-[2/3] bg-slate-900 border-r border-slate-700/50">
           {movie.POSTER_URL ? (
             <img src={movie.POSTER_URL} alt={movie.TITLE} className="w-full h-full object-cover"/>
           ) : (
             <div className="flex h-full items-center justify-center p-8">
               <span className="text-slate-600 font-bold text-2xl text-center leading-tight">
                  {movie.TITLE}
               </span>
             </div>
           )}
        </div>
        <div className="p-8 flex-1 flex flex-col justify-center text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{movie.TITLE}</h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-300 font-medium mb-6">
            <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full"><Calendar size={18} /> {movie.RELEASE_YEAR || 'N/A'}</span>
            <span className="flex items-center gap-1.5 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full"><Clock size={18} /> {movie.DURATION_MINS ? `${movie.DURATION_MINS} min` : 'N/A'}</span>
          </div>
          
          <div className="mt-4">
             <h3 className="text-lg font-bold text-slate-400 mb-2 uppercase tracking-wide">Overview</h3>
             <p className="text-slate-300 leading-relaxed text-lg mb-8">
                {movie.DESCRIPTION || "No overarching description provided."}
             </p>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
               <div>
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Director</h4>
                 <p className="text-blue-300 font-medium">{movie.DIRECTOR || "Unknown Director"}</p>
               </div>
               <div>
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Main Cast</h4>
                 <p className="text-slate-200 leading-relaxed">{movie.MAIN_CAST || "Cast details not available"}</p>
               </div>
             </div>
          </div>
          
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 text-white">
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            Reviews <span className="bg-blue-500/20 text-blue-400 text-sm py-0.5 px-2.5 rounded-full">{reviews.length}</span>
          </h2>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-slate-500 italic p-6 border border-dashed border-slate-700 rounded-xl text-center">No reviews yet. Be the first!</p>
            ) : (
              reviews.map(r => (
                <div key={r.REVIEW_ID} className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold text-blue-200">{r.USERNAME || `User #${r.USER_ID}`}</span>
                    <span className="flex items-center text-yellow-400 font-bold bg-yellow-400/10 px-2 py-1 rounded">
                      <Star size={14} className="fill-current mr-1 text-yellow-500" /> {r.RATING}/10
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm md:text-base">{r.REVIEW_TEXT}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Post a Review</h2>
          <form onSubmit={handleReviewSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="mb-4">
              <label className="block text-slate-400 text-sm font-medium mb-2">Rating (1-10)</label>
              <input 
                type="number" min="1" max="10" required
                value={newReview.rating}
                onChange={e => setNewReview({ ...newReview, rating: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="mb-6">
              <label className="block text-slate-400 text-sm font-medium mb-2">Your Review</label>
              <textarea 
                required rows="4"
                value={newReview.text}
                onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                placeholder="What did you think of the movie?"
              ></textarea>
            </div>
            <button 
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <p className="text-xs text-slate-500 mt-4 text-center">
              Requires a mock user initialized in the USERS table to succeed (assuming USER_ID 1 exists).
            </p>
          </form>
        </section>
      </div>

    </div>
  );
}

export default MovieDetails;
