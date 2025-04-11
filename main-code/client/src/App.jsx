import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  
import './styles.css'; // Adjust the path if necessary
import HomePage from './components/HomePage.jsx'; 
import MovieDetails from './components/MovieDetails.jsx'; 
import SignUp from './components/SignUp.jsx';
import Login from './components/LogIn.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import UserProfile from './components/UserProfile.jsx';

export const UserContext = createContext(); // Create UserContext

function App() {
  const [user, setUser] = useState(null); // State to hold logged-in user
  const [searchResults, setSearchResults] = useState([]); // State to hold search results

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      setUser({ name: username });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}> {/* Provide user context */}
      <Router>
        <div className="App">
          {/* Global Header */}
          <Header /> 
          
          {/* Main Content */}
          <Routes>
            <Route path="/" element={<HomePage />} />  {/* Pass searchResults to HomePage */}
            <Route path="/movies/:id" element={<MovieDetails />} />
            {/* Add SignUp and Login routes */}
            <Route path="/signup" element={<SignUp />} />  {/* SignUp component */}
            <Route path="/login" element={<Login />} />
            <Route path="/userprofile" element={<UserProfile />} />      {/* Login component */}
          </Routes>

          {/* Global Footer */}
          <Footer/>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
