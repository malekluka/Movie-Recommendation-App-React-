import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faFilter, faUser } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Signup from './SignUp';
import { Link } from 'react-router-dom';
import { useLocation , useNavigate} from 'react-router-dom';
import fallbackPoster from '../assets/MovieDefaultImg.jpg'; // Your local fallback image

function Header() {
  const [allMovies, setAllMovies] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [filterPopupOpen, setFilterPopupOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const navigate = useNavigate(); // Hook for navigation


  // Fetch movie categories from TMDB API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://api.themoviedb.org/3/genre/movie/list', {
          params: {
            api_key: '28a9d4a5fcb0241d7210c3f1d17f63f4',
            language: 'en-US',
          },
        });
        setCategories(response.data.genres);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);
  
  // Reset search results when the route changes
   useEffect(() => {
    setFilteredResults([]); // Clear search results
    setSearchQuery(''); // Reset search query
  }, [location]);

  // Fetch all movies on component mount
  // useEffect to fetch all movies but not display them initially
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

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    // Fetch and filter movies based on the selected category
    console.log('Selected Category ID:', categoryId);
    setShowDropdown(false);
  };
  // Close dropdown if clicking outside of it
  const handleOutsideClick = () => {
    setShowDropdown(false);
  };
  // Apply filters to the movie list (discover or search results)
  const applyFilters = () => {
    let results = [];

    // If there's a search query, filter the search results
    if (searchQuery.trim()) {
      results = [...filteredResults]; // Start with search results
    } else {
      results = [...allMovies]; // Start with all discovered movies if no search query
    }

    // Apply rating filter
    if (selectedRating) {
      results = results.filter(movie => Math.round(movie.vote_average) >= selectedRating);
    }

    // Apply release year filter
    if (releaseYear) {
      results = results.filter(movie => movie.release_date.startsWith(releaseYear));
    }

    // Apply sort order
    if (sortOrder === 'A-Z') {
      results.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'Z-A') {
      results.sort((a, b) => b.title.localeCompare(a.title));
    }

    // Update filtered results state to show the results
    setFilteredResults(results);
  };

  // Handle search functionality
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
          params: {
            api_key: '28a9d4a5fcb0241d7210c3f1d17f63f4',
            language: 'en-US',
            query,
          },
        });

        const searchResults = response.data.results.filter(movie =>
          movie.title.toLowerCase().includes(query.toLowerCase())
        );

        setFilteredResults(searchResults);
      } catch (error) {
        console.error('Error searching for movies:', error);
      }
    } else {
      setFilteredResults([]); // Reset to all discovered movies if query is empty
    }
  };

      // Fetch username from local storage on component mount
      useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setIsLoggedIn(true);
            setUsername(storedUsername);
        }
    }, []);



  // Handle user login
  const handleLogin = (username) => {
    localStorage.setItem('username', username);
    setIsLoggedIn(true);
    setUsername(username);
    navigate('/'); // Redirect to home after login
  };

// Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    setDropdownOpen(false);
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <header className="bg-gray-900 text-white p-3 my-4 flex items-center justify-between relative">
      {/* Left: Movie Title and Icon */}
      <div className="flex items-center space-x-2">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/myicon.ico" alt="Site Icon" className="w-8 h-8" />
          <h2 className="text-2xl font-bold tracking-wide mt-1">MovieScout</h2>
        </Link>
      </div>

      {/* Center: Search Bar */}
      <div className="relative flex items-center mr-12">
        <button className="text-gray-500 mr-3" onClick={() => setShowDropdown(!showDropdown)}>
          <FontAwesomeIcon icon={faBars} className="text-xl" />
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={handleSearch}
            className="p-2 rounded-md text-gray-800 pr-10"
            style={{ width: '500px' }}
          />
          <span
            className="absolute right-4 top-2 flex items-center text-gray-800 cursor-pointer"
            onClick={() => setFilterPopupOpen(!filterPopupOpen)}
          >
            <FontAwesomeIcon icon={faFilter} />
            <span className="ml-1">Filter</span>
          </span>
        </div>

        {/* Full Screen Categories Dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-start items-start"
            onClick={handleOutsideClick}  // Closes dropdown if clicked outside
          >
            {/* Categories Container */}
            <div
              className="bg-white rounded-lg shadow-lg p-6 grid grid-cols-3 gap-4"
              style={{ marginTop: '70px', marginLeft: '300px' }} // Adjust positioning
              onClick={e => e.stopPropagation()}  // Prevent dropdown from closing if clicked inside
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-100 text-gray-900"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {category.name}
                </div>
              ))}
            </div>
          </div>
        )}



        {/* Search Results */}
        {filteredResults.length > 0 && (
          <div
            className="absolute bg-white text-black p-2 ml-7 rounded-md shadow-lg w-[500px] z-10"
            style={{ top: '60px', maxHeight: '350px', overflowY: 'auto' }}
          >
            {filteredResults.map((movie) => (
              <Link to={`/movies/${movie.id}`} key={movie.id} className="flex items-center mb-2 hover:bg-gray-200 p-2 rounded">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : fallbackPoster}
                alt={movie.title}
                style={{ width: '50px', height: '75px', marginRight: '10px' }}
              />
              <div>
                <h4>{movie.title}</h4>
                <p className="text-base"><strong>Release Date:</strong> {movie.release_date}</p>
                <p className='text-base'><strong>Rating:</strong> {movie.vote_average}</p>
              </div>
            </Link>
          ))}
          </div>
        )}
      </div>

      {/* Filter Popup */}
      {filterPopupOpen && (
        <div
          className="absolute bg-white text-gray-800 rounded shadow-lg w-48 p-4 z-20 border border-gray-800"
          style={{ top: '44px', right: '210px' }}
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

      {/* Right: Burger Menu and User Profile */}
      <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2"> {/* Use space-x-2 to add space between the icon and username */}
    <div className="relative">
        <button
            className="text-gray-500"
            onClick={() => setDropdownOpen(!dropdownOpen)}
        >
            <FontAwesomeIcon icon={faUser} className="text-xl text-white" />
            {isLoggedIn && ( // Display username only if logged in
                    <span className="text-white text-xl ml-2 font-bold">{username}</span>
                )}        
                </button>
        {dropdownOpen && (
            <div className="fixed right-2 mt-2 bg-white text-gray-800 rounded shadow-lg w-35">
                <ul className="py-2">
                    <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                        <Link to="/userprofile">User Profile</Link>
                    </li>
                    {isLoggedIn ? ( // Conditional rendering based on login status
                                    <li
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={handleLogout}
                                    >
                                        Log Out
                                    </li>
                                ) : (
                                    <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                                        <Link to="/login">Log In</Link>
                                    </li>
                                )}
                    <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                        <Link to="/signup">Sign Up</Link>
                    </li>
                </ul>
            </div>
        )}
    </div>
</div>

        </div>
    </header>
  );
}

export default Header;
