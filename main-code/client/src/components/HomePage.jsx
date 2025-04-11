import React, { useState, useEffect } from 'react';
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
          <h2 className="text-2xl font-bold text-center mb-4 bg-gray-900 text-white py-2 px-4 border-2 border-black rounded-lg shadow-lg font-header">
            Trending
          </h2>
        </div>
        <div className="carousel-container" style={{ maxWidth: '500px', margin: '0 auto', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', backgroundColor: 'black', padding: '10px' }}>
          {trendingMovies.length > 0 ? (
            <Carousel showThumbs={true} infiniteLoop useKeyboardArrows autoPlay showStatus={true}>
              {trendingMovies.map((movie) => (
                <Link to={`/movies/${movie.id}`} key={movie.id} className="block">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : fallbackPoster}
                    alt={movie.title}
                    style={{ width: '100%', height: 'auto', maxHeight: '300px' }}
                  />
                  <div className="p-4 bg-gray-900 text-white">
                    <h2 className="text-md font-bold">{movie.title}</h2>
                    <p><strong>Release Date:</strong> {movie.release_date}</p>
                    <p
                      className="mt-2"
                      style={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3, // Limit to 3 lines
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
        <div className="h-1 bg-gray-600 rounded-full shadow-lg w-1/2" />
      </div>

      {/* New Releases Section - Cards */}
      <div className="mt-8 mb-12 flex flex-col items-center">
        <div className="mt-8 mb-8 flex justify-center">
          <h2 className="text-2xl font-bold text-center bg-red-600 text-white py-2 px-4 border-2 border-black rounded-lg shadow-lg">
            New Releases
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {newReleases.length > 0 ? (
            (showMoreNewReleases ? newReleases : newReleases.slice(0, 8)).map((movie) => (
              <Link
                to={`/movies/${movie.id}`}
                key={movie.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ width: '250px' }}
              >
                {/* New! Label */}
                <div className="bg-red-600 text-white text-sm font-bold p-2 text-center">New!</div>
                {/* Movie Poster */}
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : fallbackPoster}
                  alt={movie.title}
                  style={{ width: '100%', height: 'auto', maxHeight: '350px' }}
                />
                {/* Movie Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
                  <p className="text-gray-600 text-sm">
                    <strong>Category:</strong> {movie.genre_ids.length > 0 ? getGenreNames(movie.genre_ids) : 'Unknown'}
                  </p>
                  <p className="text-gray-600 text-sm mt-1"><strong>Release Date:</strong> {movie.release_date}</p>
                </div>
              </Link>
            ))
          ) : (
            <p>Loading new releases...</p>
          )}
        </div>

        {/* See More Button */}
        {newReleases.length > 8 && (
          <button
            onClick={() => setShowMoreNewReleases(!showMoreNewReleases)}
            className="mt-6 bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg flex items-center"
          >
            <span>{showMoreNewReleases ? 'See Less' : 'See More'}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H6a1 1 0 110-2h4V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>


      {/* Stylish Divider */}
      <div className="my-6 flex justify-center">
        <div className="h-1 bg-gray-600 rounded-full shadow-lg w-1/2" />
      </div>

      {/* Top Rated Section - Cards */}
      <div className="mt-8 mb-12 flex flex-col items-center">
        <div className="mt-8 mb-8 flex justify-center ">
          <h2 className="text-2xl font-bold text-center bg-yellow-400 text-white py-2 px-4 border-2 border-black rounded-lg shadow-lg">
            Top Rated
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {topRated.length > 0 ? (
            (showMoreTopRated ? topRated : topRated.slice(0, 8)).map((movie) => (
              <Link
                to={`/movies/${movie.id}`}
                key={movie.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ width: '250px' }}
              >
                {/* Top Rated Star Label */}
                <div className="bg-yellow-400 text-white text-sm font-bold p-2 text-center">⭐ Top Rated!</div>
                {/* Movie Poster */}
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : fallbackPoster}
                  alt={movie.title}
                  style={{ width: '100%', height: 'auto', maxHeight: '350px' }}
                />
                {/* Movie Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
                  <p className="text-gray-600 text-sm"><strong>Rating:</strong> {movie.vote_average}</p>
                  <p className="text-gray-600 text-sm">
                    <strong>Category:</strong> {movie.genre_ids.length > 0 ? getGenreNames(movie.genre_ids) : 'Unknown'}
                  </p>
                  <p className="text-gray-600 text-sm mt-1"><strong>Release Date:</strong> {movie.release_date}</p>
                </div>
              </Link>
            ))
          ) : (
            <p>Loading top-rated movies...</p>
          )}
        </div>

        {/* See More Button */}
        {topRated.length > 8 && (
          <button onClick={() => setShowMoreTopRated(!showMoreTopRated)} className="mt-6 bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg flex items-center">
            <span>{showMoreTopRated ? 'See Less' : 'See More'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H6a1 1 0 110-2h4V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Stylish Divider */}
      <div className="my-6 flex justify-center">
        <div className="h-1 bg-gray-600 rounded-full shadow-lg w-1/2" />
      </div>

      {/* Upcoming Section - Cards with Alert */}
      <div className="mt-8 mb-12 flex flex-col items-center">
        <div className="mt-8 mb-4 flex justify-center">
          <h2 className="text-2xl font-bold text-center bg-blue-800 text-white py-2 px-4 border-2 border-black rounded-lg shadow-lg">
            Upcoming
          </h2>
        </div>
        <div className="bg-blue-800 text-white text-center py-2 px-4 border-2 border-black  rounded-lg mb-4">
          <strong>Upcoming Movies Alert!</strong> Check out the latest movies coming soon.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {upcoming.length > 0 ? (
            (showMoreUpcoming ? upcoming : upcoming.slice(0, 8)).map((movie) => (
              <Link
                to={`/movies/${movie.id}`}
                key={movie.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ width: '250px' }}
              >
                {/* Upcoming Label */}
                <div className="bg-blue-800 text-white text-sm font-bold p-2 text-center">Upcoming!</div>
                {/* Movie Poster */}
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : fallbackPoster}
                  alt={movie.title}
                  style={{ width: '100%', height: 'auto', maxHeight: '350px' }}
                />
                {/* Movie Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
                  <p className="text-gray-600 text-sm">
                    <strong>Category:</strong> {movie.genre_ids.length > 0 ? getGenreNames(movie.genre_ids) : 'Unknown'}
                  </p>
                  <p className="text-gray-600 text-sm mt-1"><strong>Release Date:</strong> {movie.release_date}</p>
                </div>
              </Link>
            ))
          ) : (
            <p>Loading upcoming movies...</p>
          )}

        </div>

        {/* See More Button */}
        {upcoming.length > 8 && (
          <button onClick={() => setShowMoreUpcoming(!showMoreUpcoming)} className="mt-6 bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg  flex items-center">
            <span>{showMoreUpcoming ? 'See Less' : 'See More'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H6a1 1 0 110-2h4V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default HomePage;
