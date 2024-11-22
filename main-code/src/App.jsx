import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  
import './styles.css'; // Adjust the path if necessary
import HomePage from './components/HomePage.jsx'; 
import MovieDetails from './components/MovieDetails.jsx'; 
import SignUp from './components/SignUp.jsx';
import Login from './components/LogIn.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import UserProfile from './components/UserProfile.jsx';

function App() {
  const [searchResults, setSearchResults] = useState([]); // State to hold search results

  return (
    <Router>
      <div className="App">
        {/* Global Header */}
        <Header setSearchResults={setSearchResults} /> {/* Pass setSearchResults to Header */}
        
        {/* Main Content */}
        <Routes>
          <Route path="/" element={<HomePage searchResults={searchResults} />} />  {/* Pass searchResults to HomePage */}
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
  );
}

export default App;
