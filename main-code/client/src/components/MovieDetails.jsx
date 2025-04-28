import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import MovieDefaultImg from "../assets/MovieDefaultImg.jpg";

const MovieDetails = () => {
  const { id: movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [trailer, setTrailer] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [visibleMoviesCount, setVisibleMoviesCount] = useState(3); // Number of movies to show initially
  const [genres, setGenres] = useState([]); // Store all genres

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY; // Use the correct environment variable

  useEffect(() => {
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

  const fetchTrailer = useCallback(
    async (id) => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`
        );
        const data = await response.json();
        const trailerVideo = data.results.find(
          (video) => video.type === "Trailer"
        );
        setTrailer(trailerVideo);
      } catch (err) {
        console.error("Error fetching trailer:", err);
      }
    },
    [API_KEY]
  );

  const fetchRelatedMovies = useCallback(
    async (id) => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${API_KEY}`
        );
        const data = await response.json();
        setRelatedMovies(data.results);
      } catch (err) {
        console.error("Error fetching related movies:", err);
      }
    },
    [API_KEY]
  );

  const fetchMovieDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
      );
      const data = await response.json();
      setMovie(data);
      setLoading(false);
      fetchTrailer(data.id);
      fetchRelatedMovies(data.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [movieId, API_KEY, fetchTrailer, fetchRelatedMovies]);

  const fetchGenres = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
      );
      const data = await response.json();
      setGenres(data.genres); // Save the genres in state
    } catch (err) {
      console.error("Error fetching genres:", err);
    }
  }, [API_KEY]);

  const handleSeeMore = () => {
    setVisibleMoviesCount((prevCount) =>
      Math.min(prevCount + 3, relatedMovies.length)
    ); // Show 5 more movies
  };

  const handleSeeLess = () => {
    setVisibleMoviesCount(3); // Reset to show 3 movies
  };

  useEffect(() => {
    fetchMovieDetails();
    fetchGenres();
  }, [movieId, fetchMovieDetails, fetchGenres]);

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
              <h1 className="text-3xl font-bold mb-6" style={{fontSize: windowWidth <= 768 ? '25px' : '30px'}}>
                <span
                  style={{
                    color: "#DAA520",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
                  }}
                >
                 🎬 {movie.title}
               </span>{" "}
                {trailer ? "Trailer" : "Poster"} :
              </h1>

              <div className="flex flex-col mb-4">
                {trailer ? (
                    <iframe
                      width="80%"
                      height="400"
                      src={`https://www.youtube.com/embed/${trailer.key}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allowFullScreen
                      className="rounded-lg"
                      style={{width: windowWidth < 768 ? '100%' : windowWidth == 768 ? '90%' : windowWidth == 1024 ? '90%' : '80%',
                      height: windowWidth <= 768 ? '250px' : '410px'}}
                    />
                ) : (
                  <div className="mb-4">
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/original/${movie.poster_path}`
                          : MovieDefaultImg
                      }
                      alt={`${movie.title} Poster`}
                      className="w-4/5 h-[400px] rounded-lg" // Matches trailer size
                    />
                  </div>
                )}
              </div>
              {movie.tagline && (
                <h2 className={`italic mb-2 ${windowWidth <= 768 ? "text-lg" : "text-xl"}`}>{movie.tagline}</h2>
              )}
            </div>

            <p className="mb-4" style={{ fontSize: windowWidth <= 768 ? '16px' : '18px' }}>
              <strong>Release Date:</strong> {movie.release_date}
            </p>
            <p className="mb-4" style={{ fontSize: windowWidth <= 768 ? '16px' : '18px' }}>
              <strong>Rating:</strong> {movie.vote_average}/10 (
              {movie.vote_count} votes)
            </p>
            <p className="mb-4" style={{ fontSize: windowWidth <= 768 ? '16px' : '18px' }}>
              <strong>Runtime:</strong> {movie.runtime} minutes
            </p>
            <p className="mb-4" style={{ fontSize: windowWidth <= 768 ? '16px' : '18px' }}>
              <strong>Language:</strong> {movie.original_language.toUpperCase()}
            </p>

            <p className="mb-4" style={{ fontSize: windowWidth <= 768 ? '16px' : '18px' }}>
              <strong>Overview:</strong> {movie.overview}
            </p>
            {movie.genres && movie.genres.length > 0 && (
              <p className="mb-4" style={{ fontSize: windowWidth <= 768 ? '16px' : '18px' }}>
                <strong>Genres:</strong>{" "}
                {movie.genres.map((genre) => genre.name).join(", ")}
              </p>
            )}
            {movie.production_companies &&
              movie.production_companies.length > 0 && (
                <p className="mb-4" style={{ fontSize: windowWidth <= 768 ? '16px' : '18px' }}>
                  <strong>Production Companies:</strong>{" "}
                  {movie.production_companies
                    .map((company) => company.name)
                    .join(", ")}
                </p>
              )}
          </div>
        )}

        {/* Related Movies Section */}
        <div
          className={`border-2 md:pl-4 md:w-1/4 transition-all duration-300${
            displayedMovies.length > 0 ? "h-auto" : "h-[50%]"
          }`} style={{width: windowWidth <= 768 ? 220 : 300 , margin: '0 auto'}} 
        >
          <h3 className="text-2xl text-center font-bold mt-2 mb-4" style={{fontSize: windowWidth < 768 ? '19px' : '23px'}}>Related Movies</h3>

          {displayedMovies.length > 0 ? (
            <ul className="space-y-2">
              {displayedMovies.slice(0, visibleMoviesCount).map((related) => (
                <li
                  key={related.id}
                  className="border mr-3 rounded-lg p-2 hover:shadow-lg transition-shadow"
                >
                  <Link to={`/movies/${related.id}`} className="flex flex-col">
                    <h2 className="text-center font-semibold text-xl mt-2 mb-2 truncate"
                     style={{
                      color: "#DAA520",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                    }}>
                    🎬 {related.title}
                    </h2>
                    <div className="flex justify-center mb-2">
                      <img
                        src={
                          related.poster_path
                            ? `https://image.tmdb.org/t/p/w500/${related.poster_path}`
                            : MovieDefaultImg
                        }
                        alt={related.title}
                        className="w-40 h-auto rounded-lg"
                      />
                    </div>
                    <div style={{ maxWidth: '200px', wordWrap: 'break-word', margin: '0 auto' }}>
                    <h4 className="text-sm text-center mb-2">
                        <strong>Release Date:</strong>{" "}
                        {related.release_date || "Unknown"}
                      </h4>
                      <h4 className="text-sm text-center mb-2">
                        <strong>Genres:</strong>{" "}
                        {related.genre_ids.length > 0
                          ? related.genre_ids
                              .map(
                                (id) =>
                                  genres.find((genre) => genre.id === id)?.name
                              )
                              .join(", ")
                          : "Unknown"}
                      </h4>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <h2 className="text-lg font-semibold text-gray-600">
                No Related Movies Found
              </h2>
              <p className="text-gray-500">
                Please try again later or explore other sections.
              </p>
            </div>
          )}

          {displayedMovies.length > 0 && (
            <>
              {visibleMoviesCount < relatedMovies.length ? (
                <button
                  onClick={handleSeeMore}
                  className="relative group mt-4 mb-4 px-4 py-2 rounded-lg bg-black text-white text-lg font-bold hover:text-white transition-all duration-200 flex mx-auto"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-black via-gray-900 to-gray-600 rounded-lg blur opacity-60 group-hover:opacity-90 transition duration-300 ease-in-out shadow-2xl group-hover:shadow-[0_0_15px_5px_rgba(255,255,255,0.5)]"></div>
                  <span className="relative">See More</span>
                </button>
              ) : (
                <button
                  onClick={handleSeeLess}
                  className="relative group mt-4 mb-4 px-4 py-2 rounded-lg bg-blue-950 text-blue-200 text-lg font-bold hover:text-white transition-all duration-200 flex mx-auto"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
                  <span className="relative">See Less</span>
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
