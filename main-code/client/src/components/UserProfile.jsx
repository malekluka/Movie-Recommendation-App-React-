import { useState, useEffect, useContext } from "react";
import { UserContext } from "../App"; // Import UserContext

export default function UserProfile() {
  const { user } = useContext(UserContext); // Access user from context
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [selectedTab, setSelectedTab] = useState("favorites");

  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (user) {
      setUserName(user.name); // Set username from context
      setUserEmail(user.email); // Set email from context
    }
  }, [user]);

  // useEffect(() => {
  //   // Fetch user's favorites and watch later lists from API
  //   const fetchUserData = async () => {
  //     try {
  //       const favoritesResponse = await fetch("/api/user/favorites");
  //       if (!favoritesResponse.ok) throw new Error("Failed to fetch favorites");
  //       const watchLaterResponse = await fetch("/api/user/watchlater");
  //       if (!watchLaterResponse.ok) throw new Error("Failed to fetch watch later");

  //       setFavorites(await favoritesResponse.json());
  //       setWatchLater(await watchLaterResponse.json());
  //     } catch (error) {
  //       console.error("Error fetching user data:", error);
  //     }
  //   };
  //   fetchUserData();
  // }, []);

  return (
    <div className="container mx-auto p-4">
      {/* Profile Section */}
      <div className="flex items-center bg-white shadow-md p-6 rounded-lg">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full border flex items-center justify-center bg-gray-200 text-4xl"
          >
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              "📷"
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 text-white text-xl font-bold rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-blue-900 transition">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePicUpload}
            />
            +
          </label>
        </div>
        <div className="ml-6">
          <h2 className="text-2xl font-bold">{userName}</h2>
          <p className="text-gray-600">{userEmail}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="mt-6">
        <ul className="flex justify-center space-x-4">
          <li
            className={`cursor-pointer px-4 py-2 rounded-lg ${
              selectedTab === "favorites"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setSelectedTab("favorites")}
          >
            Favorites
          </li>
          <li
            className={`cursor-pointer px-4 py-2 rounded-lg ${
              selectedTab === "watchlater"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setSelectedTab("watchlater")}
          >
            Watch Later
          </li>
        </ul>
      </nav>

      {/* Content Section */}
      <div className="mt-6">
        {selectedTab === "favorites" && (
          <div>
            <h3 className="text-xl font-bold mb-4">Your Favorites</h3>
            <p className="text-gray-600">No favorites added yet.</p>
          </div>
        )}

        {selectedTab === "watchlater" && (
          <div>
            <h3 className="text-xl font-bold mb-4">Watch Later</h3>
            <p className="text-gray-600">No movies in Watch Later list.</p>
          </div>
        )}
      </div>
    </div>
  );
}
