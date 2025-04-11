import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import defaultTrailerImg from '../assets/defaultTrailerImg.png'; // Adjust the path as necessary
import MovieDefaultImg from '../assets/MovieDefaultImg.jpg'

const MovieDetails = () => {
  const { id: movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [visibleMoviesCount, setVisibleMoviesCount] = useState(3); // Number of movies to show initially
  const [genres, setGenres] = useState([]); // Store all genres

  const API_KEY = '28a9d4a5fcb0241d7210c3f1d17f63f4';

  const fetchGenres = async () => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`);
      const data = await response.json();
      setGenres(data.genres); // Save the genres in state
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };
 
  
  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`);
      const data = await response.json();
      setMovie(data);
      setLoading(false);
      fetchTrailer(data.id);
      fetchRelatedMovies(data.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchTrailer = async (id) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`);
      const data = await response.json();
      const trailerVideo = data.results.find(video => video.type === 'Trailer');
      setTrailer(trailerVideo);
    } catch (err) {
      console.error('Error fetching trailer:', err);
    }
  };

  const fetchRelatedMovies = async (id) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${API_KEY}`);
      const data = await response.json();
      setRelatedMovies(data.results);
    } catch (err) {
      console.error('Error fetching related movies:', err);
    }
  };

  const handleSeeMore = () => {
    setVisibleMoviesCount(prevCount => Math.min(prevCount + 3, relatedMovies.length)); // Show 5 more movies
  };

  const handleSeeLess = () => {
    setVisibleMoviesCount(3); // Reset to show 5 movies
  };

  useEffect(() => {
    fetchMovieDetails();
    fetchGenres();
  }, [movieId]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const displayedMovies = relatedMovies.slice(0, visibleMoviesCount); // Adjust displayed movies based on visible count

  return (
    <div className="container mx-auto my-8 p-4">
      <div className="relative flex flex-col md:flex-row">
        {movie && (
          <div className="md:w-3/4 mb-4 md:mr-4">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-6">{movie.title} Trailer :</h1>
              <div className="flex flex-col mb-4">
              {trailer ? (
            <div className="mb-4">
              <iframe
                width="80%"
                height="400"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title="YouTube video player"
                frameBorder="0"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          ) : (
            <div className="mb-4">
              <img
                src={defaultTrailerImg}
                alt="Default Trailer"
                width="80%"
                height="400"
                className="rounded-lg"
              />
            </div>
          )}
              </div>
              {movie.tagline && <h2 className="text-2xl italic mb-2">{movie.tagline}</h2>}
            </div>

            <p className="mb-4">
              <strong>Release Date:</strong> {movie.release_date}
            </p>
            <p className="mb-4">
              <strong>Rating:</strong> {movie.vote_average}/10 ({movie.vote_count} votes)
            </p>
            <p className="mb-4">
              <strong>Runtime:</strong> {movie.runtime} minutes
            </p>
            <p className="mb-4">
              <strong>Language:</strong> {movie.original_language.toUpperCase()}
            </p>

            <p className="mb-4">
              <strong>Overview:</strong> {movie.overview}
            </p>
            {movie.genres && movie.genres.length > 0 && (
              <p className="mb-4">
                <strong>Genres:</strong> {movie.genres.map((genre) => genre.name).join(', ')}
              </p>
            )}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <p className="mb-4">
                <strong>Production Companies:</strong> {movie.production_companies.map((company) => company.name).join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Related Movies Section */}
        <div className={`border-2 md:pl-4 md:w-1/4 transition-all duration-300 ${displayedMovies.length > 0 ? 'h-auto' : 'h-[50%]'}`}>
        <h3 className="text-2xl font-bold mt-2 mb-4">Related Movies</h3>

  {displayedMovies.length > 0 ? (
    <ul className="space-y-2">
      {displayedMovies.slice(0, visibleMoviesCount).map((related) => (
        <li key={related.id} className="border mr-3 rounded-lg p-2 hover:shadow-lg transition-shadow">
          <Link to={`/movies/${related.id}`} className="flex flex-col">
            <h2 className="text-center font-semibold text-xl mt-2 mb-2 truncate">{related.title}</h2>
            <div className="flex justify-center mb-2">
              <img
                src={related.poster_path ? `https://image.tmdb.org/t/p/w500/${related.poster_path}` : MovieDefaultImg}
                alt={related.title}
                className="w-40 h-auto rounded-lg"
              />
            </div>
            <div className='ml-8'>
              <h4 className="text-sm mb-2">
                <strong>Release Date:</strong> {related.release_date || 'Unknown'}
              </h4>
              <h4 className='text-sm mb-2'>
                <strong>Genres:</strong> {related.genre_ids.length > 0 ? related.genre_ids.map(id => genres.find(genre => genre.id === id)?.name).join(', ') : 'Unknown'}
              </h4>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  ) : (
    <div className="text-center py-10">
      <h2 className="text-lg font-semibold text-gray-600">No Related Movies Found</h2>
      <p className="text-gray-500">Please try again later or explore other sections.</p>
    </div>
  )}

  {displayedMovies.length > 0 && (
    <>
      {visibleMoviesCount < relatedMovies.length ? (
        <button
          onClick={handleSeeMore}
          className="w-full mt-4 mb-4 bg-black text-white font-bold py-1 rounded hover:bg-gray-700 transition-colors"
        >
          See More
        </button>
      ) : (
        <button
          onClick={handleSeeLess}
          className="w-full mt-4 mb-4 bg-black text-white font-bold py-1 rounded hover:bg-gray-700 transition-colors"
        >
          See Less
        </button>
      )}
    </>
  )}
</div>

      </div>
    </div>
  );
};

export default MovieDetails;
