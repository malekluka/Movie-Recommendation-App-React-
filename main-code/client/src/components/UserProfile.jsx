import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function UserProfile() {
  // Header State
  const [isHovered, setIsHovered] = useState(false);
  
  // Profile Update State
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState("User Name");
  const [userEmail, setUserEmail] = useState("useremail@gmail.com");

  // Nav State
  const [selectedItem, setSelectedItem] = useState(null);

  // Wishlist and Favorites State
  const [isWished, setIsWished] = useState(false);
  const [movieData, setMovieData] = useState({
    title: "Loading...",
    description: "",
    posterUrl: "",
    rating: 0,
  });

  // Handle User Profile Save
  const handleSave = () => {
    setIsEditing(false);
    // Save username & email here
  };

  // Handle Favorite Toggle
  const toggleWished = () => {
    setIsWished(!isWished);
  };

  // Fetch Movie Data from API
  useEffect(() => {
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyOGE5ZDRhNWZjYjAyNDFkNzIxMGMzZjFkMTdmNjNmNCIsIm5iZiI6MTcyOTM3ODAyNC44NTM3MzUsInN1YiI6IjY3MDA1MmI3YzlhMTBkNDZlYTdjZTYwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nz-AsdMqq6lbOjcIoRrDKwXwPhbiwxYAwyulmUijz8Q'
        }
      };
      
      fetch('https://api.themoviedb.org/3/account/21553711/favorite/movies?language=en-US&page=1&sort_by=created_at.asc', options)
        .then(res => res.json())
        .then(res => console.log(res))
        .catch(err => console.error(err));
  }, []);

  // Handle Nav Item Click
  const handleClick = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className="bg-gray-100 p-4">
      {/* Header */}
      <header className="flex justify-between items-center bg-gray-100 p-4">
        <div id="logo-img" className="flex items-center flex-col">
          <img src="../assets/video-camera.png" alt="Logo" className="w-10 h-10" />
        </div>

        <div id="search-bar" className="search-bar w-full max-w-md mx-auto">
          <input
            type="text"
            className="w-full px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:outline-none"
            placeholder="Search"
          />
        </div>

        <div id="profile-img" className="flex items-center relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <img src="../assets/user.png" alt="User Profile" className="w-10 h-10 rounded-full" />
          {isHovered && (
            <div className="absolute shadow-xl bg-white w-24 rounded top-10 -left-12 flex flex-col items-center px-1 py-3 gap-2">
              <Link to="/home" className="hover:text-blue-500 text-sm">Home</Link>
              <Link to="/signup" className="hover:text-blue-500 text-sm">Sign-Up</Link>
              <Link to="/signout" className="hover:text-blue-500 text-sm">Sign-Out</Link>
            </div>
          )}
        </div>
      </header>

      {/* Profile Update */}
      <div className="flex items-center bg-white shadow-xl px-4 py-16">
        <img
          src="../assets/user.png" // Placeholder for the profile image
          alt="User Profile"
          className="w-16 h-16 rounded-full border border-gray-300 mr-16"
        />
        <div className="ml-36 flex flex-col" id="user-data">
          {isEditing ? (
            <>
              <input
                type="text"
                className="text-lg font-semibold border border-gray-300 rounded p-1 mb-2"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <input
                type="email"
                className="text-gray-500 border border-gray-300 rounded p-1 mb-2"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">{userName}</h2>
              <p className="text-gray-500">{userEmail}</p>
            </>
          )}
          <button
            className="mt-2 px-4 py-2 border bg-blue-500 hover:bg-blue-700 rounded-lg text-white"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? "Save" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Nav for Wishlist and My Favorites */}
      <nav className="bg-gray-100 p-4 rounded-md shadow-md mt-4">
        <ul className="flex justify-between">
          <li
            onClick={() => handleClick("wishlist")}
            className={`cursor-pointer px-4 py-2 rounded-md transition-colors w-2/4 text-center ${selectedItem === "wishlist" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-blue-100"}`}
          >
            WishList
          </li>
          <li
            onClick={() => handleClick("favorites")}
            className={`cursor-pointer px-4 py-2 rounded-md transition-colors w-2/4 text-center ${selectedItem === "favorites" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-blue-100"}`}
          >
            My Favorites
          </li>
        </ul>
      </nav>

      {/* Conditionally Render Wishlist and My Favorites */}
      <div className="mt-4">
        {selectedItem === "wishlist" && (
          <div className="w-64 border rounded-lg shadow-md p-4">
            <div className="h-32 bg-gray-200 flex items-center justify-center rounded-t-lg">
              <span>{isWished ? "Movie is in WishList" : "No Movies in WishList"}</span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <h3 className="font-semibold text-lg">WishList Movie</h3>
              <div onClick={toggleWished} className="cursor-pointer text-2xl">
                {isWished ? "♥" : "♡"}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Description of the movie...</p>
          </div>
        )}
        {selectedItem === "favorites" && (
          <div className="w-64 border rounded-lg shadow-md p-4">
            <div className="h-32 bg-gray-200 flex items-center justify-center rounded-t-lg">
              {movieData.posterUrl ? (
                <img src={movieData.posterUrl} alt="Film Poster" className="h-full w-full object-cover" />
              ) : (
                <span>Loading image...</span>
              )}
            </div>
            <div className="flex justify-between items-center mt-4">
              <h3 className="font-semibold text-lg">{movieData.title}</h3>
              <div onClick={() => setIsWished(!isWished)} className="cursor-pointer text-2xl">
                {isWished ? "♥" : "♡"}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{movieData.description}</p>
            <div className="flex space-x-1 mt-4 text-2xl">
              {[...Array(5)].map((star, index) => (
                <span key={index}>{index < movieData.rating ? "★" : "☆"}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
