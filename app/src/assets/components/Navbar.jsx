import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Navbar.css";
// import { ThemeContext } from '../../context/ThemeContext';

const Navbar = ({ onFeaturesClick, onHowClick }) => {
  const { profile, logout, authReady } = useContext(AuthContext);
  const [panelOpen, setPanelOpen] = useState(false);
  // const { toggleTheme, theme } = useContext(ThemeContext);

  return (
    <>
      <nav className='navbare'>
        <div className='logoe'>Roommate Finder</div>
        <ul>
          {!authReady || !profile ? (
            <>
              <li>
                <a
                  href='#featurese'
                  onClick={(e) => {
                    e.preventDefault(); // prevent default jump behavior
                    onFeaturesClick();
                  }}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href='#howe'
                  onClick={(e) => {
                    e.preventDefault(); // prevent default jump behavior
                    onHowClick();
                  }}
                >
                  How It Works
                </a>
              </li>
            </>
          ) : null}

          {authReady && profile ? (
            <>
              {/* <li><Link to="/dashboard">Dashboard</Link></li> */}
              <li className='navbar-user'>
                <img
                  src={
                    profile.profilepicture?.trim()
                      ? profile.profilepicture
                      : "https://res.cloudinary.com/dh1rs2zgb/image/upload/v1753801839/finder_logo_awoliq.png"
                  }
                  alt='Profile'
                  className='navbar-profile-pic'
                  onClick={() => setPanelOpen(!panelOpen)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-avatar.png";
                  }}
                />
              </li>
            </>
          ) : (
            <li>
              <Link to='/login'>Login</Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Side Panel */}
      {authReady && panelOpen && profile && (
        <div className='side-panel'>
          <div className='side-panel-header'>Welcome, {profile.fname}</div>
          <ul>
            <li>
              <Link to='/profile'>View Profile 👤</Link>
            </li>
            <li>
              <Link to='/dashboard'>Search 🔍</Link>
            </li>
            <li>
              <Link to='/chats'>Chats 💬</Link>
            </li>
            <li>
              <Link to='/listings'>My Listings 🏠👥</Link>
            </li>
            <li>
              <Link to='/settings'>Settings ⚙️</Link>
            </li>
            {/* <button onClick={toggleTheme}>
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button> */}
          </ul>
          <button className='side-panel-logout' onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
