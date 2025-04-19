import { useState, useEffect } from 'react';
import axios from 'axios';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import fallbackPoster from '../assets/MovieDefaultImg.jpg'; // Your local fallback image

function HomePage() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [showMoreNewReleases, setShowMoreNewReleases] = useState(false);
  const [showMoreTopRated, setShowMoreTopRated] = useState(false);
  const [showMoreUpcoming, setShowMoreUpcoming] = useState(false);
  const [genres, setGenres] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch movies using useEffect
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [trendingResponse, newReleasesResponse, topRatedResponse, upcomingResponse] = await Promise.all([
          axios.get('https://api.themoviedb.org/3/trending/movie/day', {
            params: { api_key: '28a9d4a5fcb0241d7210c3f1d17f63f4', language: 'en-US' },
          }),
          axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            params: { api_key: '28a9d4a5fcb0241d7210c3f1d17f63f4', language: 'en-US', region: 'US' },
          }),
          axios.get('https://api.themoviedb.org/3/movie/top_rated', {
            params: { api_key: '28a9d4a5fcb0241d7210c3f1d17f63f4', language: 'en-US' },
          }),
          axios.get('https://api.themoviedb.org/3/movie/upcoming', {
            params: { api_key: '28a9d4a5fcb0241d7210c3f1d17f63f4', language: 'en-US', region: 'US' },
          }),
        ]);

        setTrendingMovies(trendingResponse.data.results);
        setNewReleases(newReleasesResponse.data.results);
        setTopRated(topRatedResponse.data.results);
        setUpcoming(upcomingResponse.data.results);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };
    const fetchGenres = async () => {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${'28a9d4a5fcb0241d7210c3f1d17f63f4'}&language=en-US`);
        setGenres(response.data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchMovies();
    fetchGenres();
  }, []);
  const getGenreNames = (genreIds) => {
    return genreIds.map((id) => {
      const genre = genres.find((genre) => genre.id === id);
      return genre ? genre.name : 'Unknown';
    }).join(', ');
  };
  return (
    <div>
      {/* Trending Movies Section */}
      <div className="mt-8">
        <div className="flex justify-center">
          <h2 className="text-xl font-bold text-center mb-4 bg-gray-900 text-white py-2 px-4 border-2 border-black rounded-lg shadow-lg font-header">
            Trending
          </h2>
        </div>
        <div className="carousel-container mx-auto rounded-lg overflow-hidden shadow-lg bg-black p-4"
          style={{
            maxWidth: '400px', // Restrict max width to 400px
            width: '60%', // Ensure it adjusts to smaller screens
            maxHeight: '500px', // Set a maximum height for larger screens
          }}
        >
          {trendingMovies.length > 0 ? (
            <Carousel
              showThumbs={false}
              infiniteLoop
              useKeyboardArrows
              autoPlay
              showStatus={false}
              centerMode
              centerSlidePercentage={100} // Show one card at a time
            >
              {trendingMovies.map((movie) => (
                <Link to={`/movies/${movie.id}`} key={movie.id} className="block">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : fallbackPoster}
                    alt={movie.title}
                    className="w-full h-auto max-h-[100px] sm:max-h-[300px] object-cover" // Reduce image height for smaller screens
                  />
                  <div className="p-2 sm:p-4 bg-gray-900 text-white">
                    <h2 className="text-sm sm:text-md font-bold">{movie.title}</h2> {/* Smaller title for smaller screens */}
                    <p className="text-xs sm:text-sm">
                      <strong>Release Date:</strong> {movie.release_date}
                    </p>
                    <p
                      className="mt-1 sm:mt-2 text-xs sm:text-sm"
                      style={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2, // Limit to 2 lines for smaller screens
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {movie.overview}
                    </p>
                  </div>
                </Link>
              ))}
            </Carousel>
          ) : (
            <p>Loading trending movies...</p>
          )}
        </div>
      </div>

      {/* Stylish Divider */}
      <div className="my-6 flex justify-center">
        <div className="h-1 bg-gray-600 rounded-full shadow-lg w-2/3" />
      </div>

      {/* New Releases Section - Cards */}
      <div className="mt-8 mb-12 flex flex-col items-center">
        <div className="mt-8 mb-8 flex justify-center">
          <h2 className="text-xl font-bold text-center bg-red-600 text-white py-2 px-4 border-2 border-black rounded-lg shadow-lg">
            New Releases
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {newReleases.length > 0 ? (
            (showMoreNewReleases ? newReleases : newReleases.slice(0, 8)).map((movie) => (
              <Link
                to={`/movies/${movie.id}`}
                key={movie.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg"
                style={{ width: windowWidth < 700 ? '208px' : '250px' }} // Dynamically adjust width
              >
                {/* New! Label */}
                <div className="bg-red-600 text-white text-sm font-bold p-2 text-center">New!</div>
                {/* Movie Poster */}
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : fallbackPoster}
                  alt={movie.title}
                  style={{ width: '100%', height: 'auto', maxHeight: '250px' }}
                  />
                {/* Movie Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{movie.title}</h3> {/* Smaller title */}
                  <p className="text-gray-600 text-sm"><strong>Rating:</strong> {movie.vote_average}</p>
                  <p className="text-gray-600 text-sm">
                    <strong>Category:</strong> {movie.genre_ids.length > 0 ? getGenreNames(movie.genre_ids) : 'Unknown'}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    <strong>Release Date:</strong> {movie.release_date}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p>Loading new releases...</p>
          )}
        </div>

        {/* See More Button for New Releases */}
        {newReleases.length > 8 && (
          <button
            onClick={() => setShowMoreNewReleases(!showMoreNewReleases)}
            className={`relative group mt-6 ${
              windowWidth >= 768
                ? 'px-6 py-3 rounded-xl bg-blue-950 text-blue-200 text-lg font-extrabold'
                : 'px-4 py-2 rounded-lg bg-blue-950 text-blue-200 text-md font-bold'
            } hover:text-white transition-all duration-200`}
          >
            <div
              className={`absolute ${
                windowWidth >= 768 ? '-inset-1' : '-inset-0.5'
              } bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-200`}
            ></div>
            <span className="relative">{showMoreNewReleases ? 'See Less' : 'See More'}</span>
          </button>
        )}
      </div>


      {/* Stylish Divider */}
      <div className="my-6 flex justify-center">
        <div className="h-1 bg-gray-600 rounded-full shadow-lg w-2/3" />
      </div>

      {/* Top Rated Section - Cards */}
      <div className="mt-8 mb-12 flex flex-col items-center">
        <div className="mt-8 mb-8 flex justify-center ">
          <h2 className="text-xl font-bold text-center bg-yellow-400 text-white py-2 px-4 border-2 border-black rounded-lg shadow-lg">
            Top Rated
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {topRated.length > 0 ? (
            (showMoreTopRated ? topRated : topRated.slice(0, 8)).map((movie) => (
              <Link
                to={`/movies/${movie.id}`}
                key={movie.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ width: windowWidth < 700 ? '208px' : '250px' }} // Dynamically adjust width
              >
                {/* Top Rated Star Label */}
                <div className="bg-yellow-400 text-white text-sm font-bold p-2 text-center">⭐ Top Rated!</div>
                {/* Movie Poster */}
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : fallbackPoster}
                  alt={movie.title}
                  style={{ width: '100%', height: 'auto', maxHeight: '250px' }}
                />
                {/* Movie Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
                  <p className="text-gray-600 text-sm"><strong>Rating:</strong> {movie.vote_average}</p>
                  <p className="text-gray-600 text-sm">
                    <strong>Category:</strong> {movie.genre_ids.length > 0 ? getGenreNames(movie.genre_ids) : 'Unknown'}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    <strong>Release Date:</strong> {movie.release_date}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p>Loading top-rated movies...</p>
          )}
        </div>

        {/* See More Button for Top Rated */}
        {topRated.length > 8 && (
          <button
            onClick={() => setShowMoreTopRated(!showMoreTopRated)}
            className={`relative group mt-6 ${
              windowWidth >= 768
                ? 'px-6 py-3 rounded-xl bg-blue-950 text-blue-200 text-lg font-extrabold'
                : 'px-4 py-2 rounded-lg bg-blue-950 text-blue-200 text-md font-bold'
            } hover:text-white transition-all duration-200`}
          >
            <div
              className={`absolute ${
                windowWidth >= 768 ? '-inset-1' : '-inset-0.5'
              } bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-200`}
            ></div>
            <span className="relative">{showMoreTopRated ? 'See Less' : 'See More'}</span>
          </button>
        )}
      </div>

      {/* Stylish Divider */}
      <div className="my-6 flex justify-center">
        <div className="h-1 bg-gray-600 rounded-full shadow-lg w-2/3" />
      </div>

      {/* Upcoming Section - Cards with Alert */}
      <div className="mt-8 mb-12 flex flex-col items-center">
        <div className="mt-8 mb-4 flex justify-center">
          <h2 className="text-xl font-bold text-center bg-blue-800 text-white py-2 px-4 border-2 border-black rounded-lg shadow-lg">
            Upcoming
          </h2>
        </div>
        <div className="bg-blue-800 text-white text-center py-2 px-4 border-2 border-black  rounded-lg mb-4">
          <strong>Upcoming Movies Alert!</strong> Check out the latest movies coming soon.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {upcoming.length > 0 ? (
            (showMoreUpcoming ? upcoming : upcoming.slice(0, 8)).map((movie) => (
              <Link
                to={`/movies/${movie.id}`}
                key={movie.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ width: windowWidth < 700 ? '208px' : '250px' }} // Dynamically adjust width
              >
                {/* Upcoming Label */}
                <div className="bg-blue-800 text-white text-sm font-bold p-2 text-center">Upcoming!</div>
                {/* Movie Poster */}
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : fallbackPoster}
                  alt={movie.title}
                  style={{ width: '100%', height: 'auto', maxHeight: '250px' }}
                />
                {/* Movie Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
                  <p className="text-gray-600 text-sm"><strong>Rating:</strong> {movie.vote_average}</p>
                  <p className="text-gray-600 text-sm">
                    <strong>Category:</strong> {movie.genre_ids.length > 0 ? getGenreNames(movie.genre_ids) : 'Unknown'}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    <strong>Release Date:</strong> {movie.release_date}
                  </p>
                </div>
              </Link>
            ))
          ) : (

            
            <p>Loading upcoming movies...</p>
          )}

        </div>

        {/* See More Button for Upcoming */}
        {upcoming.length > 8 && (
          <button
            onClick={() => setShowMoreUpcoming(!showMoreUpcoming)}
            className={`relative group mt-6 ${
              windowWidth >= 768
                ? 'px-6 py-3 rounded-xl bg-blue-950 text-blue-200 text-lg font-extrabold'
                : 'px-4 py-2 rounded-lg bg-blue-950 text-blue-200 text-md font-bold'
            } hover:text-white transition-all duration-200`}
          >
            <div
              className={`absolute ${
                windowWidth >= 768 ? '-inset-1' : '-inset-0.5'
              } bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-200`}
            ></div>
            <span className="relative">{showMoreUpcoming ? 'See Less' : 'See More'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default HomePage;
