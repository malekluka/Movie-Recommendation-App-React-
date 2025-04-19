import { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faUser, faSearch} from '@fortawesome/free-solid-svg-icons';
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
  // Removed unused state variable 'isMobileMenuOpen'
  const [lastSearchResults, setLastSearchResults] = useState([]); // Store last search results
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const filterPopupRef = useRef(null); // Add a ref for the filter popup
  const searchInputRef = useRef(null); // Ref for the search input

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
    const isFilterButton = e.target.closest('button')?.contains(document.querySelector('.fa-filter'));
    const isSearchResult = e.target.closest('.search-result-item'); // Add this class to your Link
    const isSearchInput = e.target === searchInputRef.current;
    const isSearchResultsContainer = e.target.closest('.search-results-container'); // Add this line
    
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
    if (filterPopupRef.current && !filterPopupRef.current.contains(e.target) && !isFilterButton) {
      setFilterPopupOpen(false);
    }
    if (
      searchContainerRef.current && 
      !searchContainerRef.current.contains(e.target) &&
      !isSearchResult &&
      !isSearchInput &&
      !isSearchResultsContainer 
    ) {
      setLastSearchResults(filteredResults);
      setFilteredResults([]);
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
    <nav className="relative w-full overflow-visible rounded-xl border border-blue-500/20 mb-8">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 backdrop-blur-md"></div>

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
      <div className="relative w-full px-2 sm:px-4 py-3">
        {" "}
        {/* Adjusted padding for smaller screens */}
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center space-x-2 group">
            <Link to="/" className="flex items-center space-x-1">
              <img
                src="/myicon.ico"
                alt="Site Icon"
                className="relative w-6 h-6 sm:w-8 sm:h-8"
              />{" "}
              {/* Adjusted size */}
              <span className="block text-lg sm:text-xl font-bold text-white">
                MovieScout
              </span>{" "}
              {/* Adjusted font size */}
            </Link>
          </div>

          {/* Centered Search Bar and Categories */}
          <div
            className="relative flex-1 ml-1 max-w-[46%] sm:max-w-md"
            ref={searchContainerRef}
          >
            {" "}
            {/* Adjusted max width */}
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center">
              <FontAwesomeIcon
                icon={faSearch}
                className="text-blue-200 cursor-pointer"
                onClick={() => searchInputRef.current?.focus()} // Focus the search input
              />
            </div>
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus} // Restore results on focus
              ref={searchInputRef} // Attach the ref to the input
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1 sm:py-2 bg-blue-950/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" // Adjusted padding and font size
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white"
              onClick={(e) => {
                e.stopPropagation(); // Stop event from bubbling
                setFilterPopupOpen((prev) => !prev);
              }}
            >
              <FontAwesomeIcon icon={faFilter} />
            </button>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-2 mt-0.5 ml-1 sm:space-x-4">
            {" "}
            {/* Adjusted spacing */}
            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="relative group"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative p-1 sm:p-2 bg-blue-950 rounded-full leading-none flex items-center">
                  {" "}
                  {/* Adjusted padding */}
                  <FontAwesomeIcon
                    icon={faUser}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 group-hover:text-white"
                  />{" "}
                  {/* Adjusted size */}
                  {user && (
                    <span className="ml-1 sm:ml-2 text-blue-200 group-hover:text-white text-sm sm:text-base">
                      {user.name}
                    </span>
                  )}{" "}
                  {/* Adjusted spacing and font size */}
                </div>
              </button>

              {dropdownOpen && (
                <div
                  className="fixed right-2 sm:right-4 top-16 bg-white text-gray-800 rounded shadow-lg w-40 sm:w-48 z-[1000]"
                  ref={dropdownRef}
                >
                  {" "}
                  {/* Adjusted width */}
                  <ul className="py-2">
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        navigate("/userprofile"); // Navigate first
                        setDropdownOpen(false); // Then close the dropdown
                      }}
                    >
                      User Profile
                    </li>
                    {user ? (
                      <li
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => {
                          handleLogout(); // Log out the user
                          setDropdownOpen(false); // Then close the dropdown
                        }}
                      >
                        Log Out
                      </li>
                    ) : (
                      <li
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => {
                          navigate("/login"); // Navigate first
                          setDropdownOpen(false); // Then close the dropdown
                        }}
                      >
                        Log In
                      </li>
                    )}
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        navigate("/signup"); // Navigate first
                        setDropdownOpen(false); // Then close the dropdown
                      }}
                    >
                      Sign Up
                    </li>
                  </ul>
                </div>
              )}
            </div>
            {/* Mobile Menu Button */}
          </div>
        </div>
        {/* Search Results */}
        {filteredResults.length > 0 && (
          <div
            className="search-results-container absolute bg-white text-black p-2 rounded-md shadow-lg z-[1000] overflow-y-auto"
            style={{
              top: window.innerWidth <= 640 ? "49px" : "61px",
              left:
                window.innerWidth > 1400
                  ? "54.3%"
                  : window.innerWidth <= 640
                  ? "63%"
                  : "54.5%",
              transform: "translateX(-50%)",
              width: window.innerWidth <= 640 ? "50%" : "462px", // Adjust width for screens smaller than 640px
              maxHeight: "310px",
            }}
          >
            {filteredResults.map((movie, index) => (
              <div key={movie.id}>
                <Link
                  to={`/movies/${movie.id}`}
                  className="search-result-item flex flex-col sm:flex-row items-center mb-2 hover:bg-gray-200 p-2 rounded" // Use flex-col for smaller devices
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event from bubbling up
                    setFilteredResults([]); // Clear search results
                    setFilterPopupOpen(false); // Close filter popup
                  }}
                >
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                        : fallbackPoster
                    }
                    alt={movie.title}
                    className="w-20 h-30 mb-2 mr-4" // Adjust size and spacing
                    style={{
                      width: window.innerWidth <= 480 ? "48px" : "80px", // Adjust width for mobile
                      height: window.innerWidth <= 480 ? "72px" : "120px", // Adjust height for mobile
                      marginBottom: window.innerWidth <= 480 ? "8px" : "16px",
                    }}
                  />
                  <div
                    className="text-center"
                    style={{
                      textAlign: window.innerWidth <= 480 ? "center" : "left", // Center text on mobile
                    }}
                  >
                    <h4
                      style={{
                        fontSize: window.innerWidth <= 480 ? "12px" : "18px",
                        fontWeight: "800",
                        color: "#B8860B",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "8px",
                        marginRight: "8px",
                      }}
                    >
                    🎬 {movie.title}
                    </h4>
                    <p
                      style={{
                        fontSize: window.innerWidth <= 480 ? "10px" : "14px", // Adjust font size for mobile
                      }}
                    >
                      <strong>Release Date:</strong> {movie.release_date}
                    </p>
                    <p
                      style={{
                        fontSize: window.innerWidth <= 480 ? "10px" : "14px", // Adjust font size for mobile
                      }}
                    >
                      <strong>Rating:</strong> {movie.vote_average.toFixed(1)}{" "}
                      {/* Rounded to 1 decimal place */}
                    </p>
                  </div>
                </Link>
                {index < filteredResults.length - 1 && (
                  <hr className="border-t border-gray-300 my-2" /> // Add a separator between movies
                )}
              </div>
            ))}
          </div>
        )}
        {/* Filter Popup */}
        {filterPopupOpen && (
          <div
            ref={filterPopupRef}
            className="absolute top-[49px] right-2 sm:right-[100px] xl:right-[300px] 
               bg-white text-gray-800 rounded shadow-lg 
               w-[38vw] sm:w-[200px] 
               p-2 sm:p-4 z-[9999] border border-gray-800
               max-h-[300px] sm:max-h-none overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col text-xs sm:text-sm">
              <label className="mb-1">Rating (up to 10):</label>
              <input
                type="number"
                min="0"
                max="10"
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="p-1 sm:p-2 rounded border border-gray-300 mb-2 text-xs sm:text-sm"
              />

              <label className="mb-1">Sort Alphabetically:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="p-1 sm:p-2 rounded border border-gray-300 mb-2 text-xs sm:text-sm"
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
                className="p-1 sm:p-2 rounded border border-gray-300 mb-2 text-xs sm:text-sm"
              />

              <button
                onClick={applyFilters}
                className="bg-gray-800 text-white py-1 px-2 sm:py-2 sm:px-4 rounded-full font-semibold shadow-lg hover:bg-gray-700 transition-all duration-300 text-xs sm:text-sm"
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