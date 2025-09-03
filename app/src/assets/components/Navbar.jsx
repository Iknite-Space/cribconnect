import { Link } from "react-router-dom";
import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import useDelete from "../../hooks/useDelete";
import "./Navbar.css";
// import { ThemeContext } from '../../context/ThemeContext';

const DELETE_PROFILE = (userId) =>
  `https://api.cribconnect.xyz/v1/users/${userId}`; // adjust endpoint if needed

const Navbar = ({ onFeaturesClick, onHowClick }) => {
  const { profile, logout, authReady } = useContext(AuthContext);
  const [panelOpen, setPanelOpen] = useState(false);
  // const { toggleTheme, theme } = useContext(ThemeContext);
  const panelRef = useRef(null);
  const profilePicRef = useRef(null);

  const { deleteData, loading: deleting, error: deleteError } = useDelete();
  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);


  useEffect(() => {
    function handleClickOutside(e) {
      // If panel is open and click is outside both the panel and the profile image
      if (
        panelOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        profilePicRef.current &&
        !profilePicRef.current.contains(e.target)
      ) {
        setPanelOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [panelOpen]);

  const handleDeleteProfile = async () => {
    if (!profile?.user_id) return;
    console.log(profile.user_id)

    await deleteData(DELETE_PROFILE(profile.user_id));
      logout();
    if (!deleteError) {
      // Optionally log the user out after deletion
      logout();
    }
  };

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
                  Guide
                </a>
              </li>
            </>
          ) : null}

          {authReady && profile ? (
            <>
              {/* <li><Link to="/dashboard">Dashboard</Link></li> */}
              <li className='navbar-user'>
                <img
                  ref={profilePicRef}
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
        <div className='side-panel' ref={panelRef}>
          <div className='side-panel-header'>Welcome, {profile.fname}</div>
          <ul>
            <li>
              <Link to='/profile'>View Profile 👤</Link>
            </li>
            <li>
              <Link to='/'>Home 🏠</Link>
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

           <button
              className="side-panel-delete"
              onClick={() => setShowDeleteProfileModal(true)}
              disabled={deleting}
            >
              Delete Profile
          </button>

          {/* {deleteError && (
            <p style={{ color: "red", fontSize: "0.85rem" }}>
              Failed to delete profile.
            </p>
          )} */}
          {showDeleteProfileModal && (
              <div className="modal-overlayn">
                <div className="modaln">
                  <p>
                    Are you sure you want to delete your profile,{" "}
                    <strong>{profile.fname} {profile.lname}</strong>?
                  </p>
                  <div className="modaln-buttons">
                    <button
                      className="yes-btn"
                      onClick={async () => {
                        await handleDeleteProfile();
                        setShowDeleteProfileModal(false);
                      }}
                    >
                      Yes
                    </button>
                    <button
                      className="no-btn"
                      onClick={() => setShowDeleteProfileModal(false)}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}


        </div>
      )}
    </>
  );
};

export default Navbar;
