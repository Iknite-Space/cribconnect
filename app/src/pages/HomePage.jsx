
// HomePage.jsx
import React from 'react';
import { FaUserFriends, FaShieldAlt, FaComments } from 'react-icons/fa';
import '../styles/HomePage.css';
import { Link } from 'react-router-dom';
import Navbar from '../assets/components/Navbar';
import Footer from '../assets/components/Footer';



const HomePage = () => {
  return (
    <div className="homepagee">
    <Navbar />

      <header className="heroe">
        <h1>Find Your Perfect Roommate</h1>
        <p>Browse verified listings and connect with people who match your lifestyle.</p>
        <p>Smart. Safe. Simple.</p>
        <Link to="/login" className="cta-btne">Get Started</Link>
      </header>

      <section id="featurese" className="featurese">
        <div className="feature-boxe">
            <FaUserFriends size={40} color="#FF4B2B" />
          <h3>Personality Matching</h3>
          <p>We match you based on lifestyle and living preferences, not just location.</p>
        </div>
        <div className="feature-boxe">
          <FaShieldAlt size={40} color="#FF4B2B" />
          <h3>Verified Profiles</h3>
          <p>Every roommate is verified for safety and authenticity.</p>
        </div>
        <div className="feature-boxe">
          <FaComments size={40} color="#FF4B2B" />
          <h3>Chat & Connect</h3>
          <p>Built-in messaging makes it easy to get to know potential roommates.</p>
        </div>
      </section>
    
    {/* <Listing /> */}

      <section id="howe" className="how-it-workse">
        <h2>How It Works</h2>
        <ol>
          <li>Create a profile</li>
          <li>Browse matches</li>
          <li>Chat and connect</li>
          <li>Move in with confidence</li>
        </ol>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;

