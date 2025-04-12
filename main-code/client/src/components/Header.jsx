import { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faFilter, faUser, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import fallbackPoster from '../assets/MovieDefaultImg.jpg';
import { UserContext } from '../App';

// Debounce function
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function Header() {
  const [allMovies, setAllMovies] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [filterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastSearchResults, setLastSearchResults] = useState([]); // Store last search results
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const filterPopupRef = useRef(null); // Add a ref for the filter popup

  const cache = useMemo(() => new Map(), []); // Cache to store fetched results
  const debouncedQuery = useDebounce(searchQuery, 500); // Debounce delay of 500ms

  // Reset search results when the route changes
  useEffect(() => {
    setFilteredResults([]);
    setSearchQuery('');
  }, [location]);

  // Fetch all movies on component mount
  useEffect(() => {
    const fetchAllMovies = async () => {
      try {
        const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
          params: {
            api_key: '28a9d4a5fcb0241d7210c3f1d17f63f4',
            language: 'en-US',
            include_adult: false,
            page: 1,
          },
        });
        setAllMovies(response.data.results);
      } catch (error) {
        console.error('Error fetching all movies:', error);
      }
    };

    fetchAllMovies();
  }, []);

  // Close if clicking outside 
  const handleOutsideClick = useCallback((e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false); // Close dropdown if clicked outside
    }
    if (filterPopupRef.current && !filterPopupRef.current.contains(e.target)) {
      setFilterPopupOpen(false); // Close filter popup if clicked outside
    }
    if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
      setLastSearchResults(filteredResults); // Save current results before hiding
      setFilteredResults([]); // Hide search results
    }
  }, [dropdownRef, filterPopupRef, searchContainerRef, filteredResults]);

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [handleOutsideClick]);

  // Restore search results when clicking back inside the search bar
  const handleSearchFocus = () => {
    if (lastSearchResults.length > 0) {
      setFilteredResults(lastSearchResults); // Restore previous results
    }
  };

  // Apply filters to the movie list
  const applyFilters = async () => {
    let results = [];

    // Fetch search results if there's a query
    if (searchQuery.trim()) {
      try {
        const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
          params: {
            api_key: '28a9d4a5fcb0241d7210c3f1d17f63f4',
            language: 'en-US',
            query: searchQuery,
          },
        });
        results = response.data.results;
      } catch (error) {
        console.error('Error fetching search results:', error);
        results = [];
      }
    } else {
      results = [...allMovies]; // Use all movies if no search query
    }

    // Apply rating filter
    if (selectedRating) {
      const ratingFloor = Math.floor(parseFloat(selectedRating));
      const ratingCeil = ratingFloor + 1;
      results = results.filter(movie => movie.vote_average >= ratingFloor && movie.vote_average < ratingCeil);
    }

    // Apply release year filter
    if (releaseYear) {
      results = results.filter(movie => movie.release_date?.startsWith(releaseYear));
    }

    // Apply sort order
    if (sortOrder === 'A-Z') {
      results.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'Z-A') {
      results.sort((a, b) => b.title.localeCompare(a.title));
    }

    // Ensure filtered results are updated
    setFilteredResults(results); // Update the filtered results
    setFilterPopupOpen(false); // Close the filter popup
  };

  const filterContent = useCallback((movie) => {
    const restrictedKeywords = ['sex', 'explicit', 'adult', 'stepmom']; // Add more keywords as needed
    const normalizeText = (text) => text?.toLowerCase() || ''; // Normalize text for comparison
    const hasRestrictedContent = movie.adult || // Check the 'adult' property
      restrictedKeywords.some(keyword =>
        normalizeText(movie.overview).includes(keyword) ||
        normalizeText(movie.title).includes(keyword)
      );
    return !hasRestrictedContent;
  }, []);

  // Handle search functionality
  const handleSearch = useCallback(async (query) => {
    if (query.trim() === '') {
      setFilteredResults([]);
      return;
    }
  
    const cacheKey = `search:${query}`;
  
    // Check if the query exists in cache
    if (cache.has(cacheKey)) {
      console.log('Using cached results');
      setFilteredResults(cache.get(cacheKey)); // Use cached results
      return;
    }
  
    try {
      // If not in cache, make the API call
      const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
        params: {
          api_key: '28a9d4a5fcb0241d7210c3f1d17f63f4',
          language: 'en-US',
          query,
        },
      });
  
      // Filter out restricted content
      const searchResults = response.data.results
        .filter(filterContent)
        .filter(movie => movie.title.toLowerCase().includes(query.toLowerCase()));
  
      // Cache the search results
      cache.set(cacheKey, searchResults);
      setFilteredResults(searchResults);
    } catch (error) {
      console.error('Error searching for movies:', error);
    }
  }, [cache, filterContent]);
  
  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery, handleSearch]);

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('username');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="relative overflow-visible rounded-xl border border-blue-500/20 mb-8">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 backdrop-blur-md"></div>
      
      {/* Floating Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute h-4 w-4 rounded-full bg-blue-400/10 animate-float top-4 left-[10%]"></div>
        <div className="absolute h-5 w-5 rounded-full bg-blue-400/10 animate-float top-6 left-[20%] [animation-delay:0.5s]"></div>
        <div className="absolute h-4 w-4 rounded-full bg-blue-400/10 animate-float top-6 left-[30%] [animation-delay:0.5s]"></div>
        <div className="absolute h-5 w-5 rounded-full bg-blue-400/10 animate-float top-8 left-[70%] [animation-delay:1s]"></div>
        <div className="absolute h-6 w-6 rounded-full bg-blue-400/10 animate-float top-2 left-[50%] [animation-delay:1.5s]"></div>
        <div className="absolute h-3 w-3 rounded-full bg-blue-400/10 animate-float top-10 left-[80%] [animation-delay:1.2s]"></div>
      </div>

      {/* Main Navbar Content */}
      <div className="relative px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 group">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/myicon.ico" alt="Site Icon" className="relative -mt-2 w-8 h-8" />
              <span className="block text-xl sm:text-2xl font-bold text-white">MovieScout</span>
            </Link>
          </div>

          {/* Centered Search Bar and Categories */}
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md" ref={searchContainerRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-blue-200" />
            </div>
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus} // Restore results on focus
              className="w-full pl-10 pr-4 py-2 bg-blue-950/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white"
              onClick={() => setFilterPopupOpen(!filterPopupOpen)}
            >
              <FontAwesomeIcon icon={faFilter} />
            </button>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search Button */}
            <button 
              className="md:hidden relative group"
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
              <div className="relative p-2 bg-blue-950 rounded leading-none">
                <FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-blue-200 group-hover:text-white" />
              </div>
            </button>

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="relative group"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative p-2 bg-blue-950 rounded-full leading-none flex items-center">
                  <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-blue-200 group-hover:text-white" />
                  {user && <span className="ml-2 text-blue-200 group-hover:text-white">{user.name}</span>}
                </div>
              </button>

              {dropdownOpen && (
                <div className="fixed right-4 top-16 bg-white text-gray-800 rounded shadow-lg w-48 z-[1000]" ref={dropdownRef}>
                  <ul className="py-2">
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Link to="/userprofile">User Profile</Link>
                    </li>
                    {user ? (
                      <li
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => {
                          handleLogout();
                          setDropdownOpen(false);
                        }}
                      >
                        Log Out
                      </li>
                    ) : (
                      <li
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Link to="/login">Log In</Link>
                      </li>
                    )}
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Link to="/signup">Sign Up</Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden relative group"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
              <div className="relative p-2 bg-blue-950 rounded leading-none">
                <FontAwesomeIcon 
                  icon={isMobileMenuOpen ? faTimes : faBars} 
                  className="w-5 h-5 text-blue-200 group-hover:text-white" 
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="mt-4 md:hidden bg-blue-900/90 backdrop-blur-sm rounded-lg border border-blue-500/30 animate-slide-down">
            <div className="p-4 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-blue-200" />
                </div>
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-blue-950/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white"
                  onClick={() => setFilterPopupOpen(!filterPopupOpen)}
                >
                  <FontAwesomeIcon icon={faFilter} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Results (Mobile) */}
        {filteredResults.length > 0 && (
          <div
          className="absolute bg-white text-black p-2 rounded-md shadow-lg w-[462px] z-[1000] overflow-y-auto"
          style={{ top: '68px', left: '50%', transform: 'translateX(-50%)', maxHeight: '310px' }}
        >
        
            {filteredResults.map((movie) => (
              <Link 
                to={`/movies/${movie.id}`} 
                key={movie.id} 
                className="flex items-center mb-2 hover:bg-gray-200 p-2 rounded"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
              >
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : fallbackPoster}
                  alt={movie.title}
                  style={{ width: '50px', height: '75px', marginRight: '10px' }}
                />
                <div>
                  <h4>{movie.title}</h4>
                  <p className="text-base">
                    <strong>Release Date:</strong> {movie.release_date}
                  </p>
                  <p className="text-base">
                    <strong>Rating:</strong> {movie.vote_average.toFixed(1)} {/* Rounded to 1 decimal place */}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Filter Popup */}
        {filterPopupOpen && (
          <div
            ref={filterPopupRef} // Attach the ref to the filter popup
            className="fixed bg-white text-gray-800 rounded shadow-lg w-48 p-4 z-[9999] border border-gray-800" // Increased z-index to ensure visibility
            style={{ top: '49px', right: '300px' }}
            onClick={(e) => e.stopPropagation()} // Prevent the click event from propagating
          >
            <div className="flex flex-col">
              <label className="mb-1">Rating (up to 10):</label>
              <input
                type="number"
                min="0"
                max="10"
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="p-1 rounded border border-gray-300 mb-2"
              />

              <label className="mb-1">Sort Alphabetically:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="p-1 rounded border border-gray-300 mb-2"
              >
                <option value="">Select</option>
                <option value="A-Z">A-Z</option>
                <option value="Z-A">Z-A</option>
              </select>

              <label className="mb-1">Release Year:</label>
              <input
                type="text"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                placeholder="YYYY"
                className="p-1 rounded border border-gray-300 mb-2"
              />

              <button
                onClick={applyFilters}
                className="bg-gray-800 text-white py-2 px-4 rounded-full font-bold shadow-lg hover:bg-gray-700 transition-all duration-300"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;