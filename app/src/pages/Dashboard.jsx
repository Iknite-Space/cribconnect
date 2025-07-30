import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from '../assets/components/Navbar';
import Footer from "../assets/components/Footer";
import "../styles/Dashboard.css"

import MessageBanner from "../assets/components/MessageBanner";

function Dashboard() {
  const [data, setData] = useState({
    fname: "",
    lname: "",
    birthdate: "",
    profile_picture: "",
    bio: "",
    preferences: {
      Age_range: "",
      Gender: "",
      Pet: "",
      Late_Nights: "",
      Smoking: "",
      Drinking: "",
      Guests_policy: "",
      noise_tolerance: "",
      Religion: "",
      Occupation: ""
    }
  });
    const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 7; // adjust to your layout vibe

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentListings = filteredListings.slice(indexOfFirstResult, indexOfLastResult);

  const totalPages = Math.ceil(filteredListings.length / resultsPerPage);
  const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages) {
    setCurrentPage(newPage);
  }
};


  /*Filtering options*/
  const [ageRange, setAgeRange] = useState("");
  const [gender, setGender] = useState("");
  const [pet, setPet] = useState("");
  const [lateNights, setLateNights] = useState("");
  const [smoking, setSmoking] = useState("");
  const [drinking, setDrinking] = useState("");
  const [guestsPolicy, setGuestsPolicy] = useState("");
  const [noiseTolerance, setNoiseTolerance] = useState("");
  const [religion, setReligion] = useState("");
  const [occupation, setOccupation] = useState("");
  const { token, refreshIdToken} = useContext(AuthContext);

  const [messageStatus, setMessageStatus] = useState({ message: '', type: 'info' });


const resetData = () => {
  setData({
    fname: "",
    lname: "",
    birthdate: "",
    profile_picture: "",
    bio: "",
    preferences: {
      Age_range: "",
      Gender: "",
      Pet: "",
      Late_Nights: "",
      Smoking: "",
      Drinking: "",
      Guests_policy: "",
      noise_tolerance: "",
      Religion: "",
      Occupation: ""
    }
  });
};

useEffect(() => {
  const header = document.querySelector('.filter-header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.style.padding = '0.4rem 1rem';
      header.style.fontSize = '1rem';
    } else {
      header.style.padding = '0.75rem 1rem';
      header.style.fontSize = '1.2rem';
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);


useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      resetData();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);


  useEffect(() => {
    const fetchListings = async () => {
      try {
        await refreshIdToken();
        //   http://localhost:8082
        const response = await fetch("https://api.cribconnect.xyz/v1/users/profiles", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          setMessageStatus({
          message: `Server error: ${response.status}`,
          type: "error"
           });
         }
       
        const responseData = await response.json();
        const users = responseData.users;
        console.log(responseData)
        setListings(users);           
      setFilteredListings(users);   // Display all by default

      } catch (error) {
        setMessageStatus({
        message: "Failed to fetch listings:",
        type: "error"
      });
      }
    };

    fetchListings();
  }, [token, refreshIdToken]);



  const handleApplyFilter = async (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page

    const filterPayload = {
      ageRange,
      gender,
      pet,
      lateNights,
      smoking,
      drinking,
      guestsPolicy,
      noiseTolerance,
      religion,
      occupation
    };
    const cleanedPayload = Object.fromEntries(
  Object.entries(filterPayload).filter(([_, v]) => v !== "")
);

    try {
      const response = await fetch("http://localhost:5000/api/filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cleanedPayload)
      });

      if (!response.ok)
       setMessageStatus({
        message: "Couldn't filterlistings.",
        type: "error"
      });
      const data = await response.json();
      setFilteredListings(data);
    } catch (error) {
      console.error("Error sending filters:", error);
       setMessageStatus({
        message: "Something went wrong while filtering listings.",
        type: "error"
      });
    }
  };

  const handleReset = () => {
    setAgeRange("");
    setGender("");
    setPet("");
    setLateNights("");
    setSmoking("");
    setDrinking("");
    setGuestsPolicy("");
    setNoiseTolerance("");
    setReligion("");
    setOccupation("");

    setFilteredListings(listings);
    setCurrentPage(1); // Reset to first page
  };


  const handleMatch = async (matchedUserId) => {
  try {
    const response = await fetch("https://api.cribconnect.xyz/v1/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: matchedUserId // or include both users if needed
      })
    });

    if (!response.ok) {
      setMessageStatus({
        message: "Couldn't calculate match.",
        type: "error"
      });
      return;
    }

    const matchData = await response.json();
    console.log("Match result:", matchData);

    setMessageStatus({
      message: `Match Score: ${matchData.score}% — ${matchData.comment || "Compatibility calculated!"}`,
      type: "success"
    });
  } catch (error) {
    setMessageStatus({
      message: "Something went wrong while matching.",
      type: "error"
    });
  }
};

  return (
    <>
         <MessageBanner
                 message={messageStatus.message} 
                 type={messageStatus.type}
                 clear={() => setMessageStatus({message: "", type: 'info'})} 
              />
       <Navbar />
      {/* Blurred content when modal is active */}
      <div
        className={`search-containers ${
          data.fname !== "" ? "modal-actives" : ""
        }`}
      >
       
    
        <main className='search-contents'>
           <div className='filter-header'>
           <h1> Your space, your rules — find who fits</h1>
           </div>
          {/* === Search Preferences === */}
          <div className='preferencess'>
            {/* <input
              className='option'
              list='age-options'
              placeholder='Age-Range'
            /> */}
            <select
              id='age-options'
              value={ageRange}
              onChange={(e) => {
                console.log(e.target.value);
                setAgeRange(e.target.value);
              }}
            >
              <option value='' disabled>
                Age Range
              </option>
              <option value='18-21'>18-21</option>
              <option value='22-25'>22-25</option>
              <option value='26-29'>26-29</option>
              <option value='30-33'>30-33</option>
            </select>

            <select
              id='gender-options'
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
              }}
            >
              <option value='' disabled>
                Gender
              </option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
            </select>

            <select
              id='pets-options'
              value={pet}
              onChange={(e) => {
                setPet(e.target.value);
              }}
            >
              <option value='' disabled>
                Pets
              </option>
              <option value='Yes'>Yes</option>
              <option value='No'>No</option>
            </select>

            <select
              id='late-nights-options'
              value={lateNights}
              onChange={(e) => {
                setLateNights(e.target.value);
              }}
            >
              <option value='' disabled>
                Late Nights
              </option>
              <option value='Yes'>Yes</option>
              <option value='Sometimes'>Sometimes</option>
              <option value='No'>No</option>
            </select>

            <select
              id='smoking-options'
              value={smoking}
              onChange={(e) => {
                setSmoking(e.target.value);
              }}
            >
              <option value='' disabled>
                Smoking
              </option>
              <option value='Yes'>Yes</option>
              <option value='No'>No</option>
            </select>

            <select
              id='drinking-options'
              value={drinking}
              onChange={(e) => {
                setDrinking(e.target.value);
              }}
            >
              <option value='' disabled>
                Drinking
              </option>
              <option value='Yes'>Yes</option>
              <option value='Sometimes'>Sometimes</option>
              <option value='No'>No</option>
            </select>

            <select
              id='guests-policy-options'
              value={guestsPolicy}
              onChange={(e) => {
                setGuestsPolicy(e.target.value);
              }}
            >
              <option value='' disabled>
                Guests Policy
              </option>
              <option value='Often'>Often</option>
              <option value='Very Often'>Very Often</option>
              <option value='Rarely'>Rarely</option>
            </select>

            <select
              id='noise-tolerance-options'
              value={noiseTolerance}
              onChange={(e) => {
                setNoiseTolerance(e.target.value);
              }}
            >
              <option value='' disabled>
                Noise Tolerance
              </option>
              <option value='Low'>Low</option>
              <option value='Medium'>Medium</option>
              <option value='High'>High</option>
            </select>

            <select
              id='religion-options'
              value={religion}
              onChange={(e) => {
                setReligion(e.target.value);
              }}
            >
              <option value='' disabled>
                Religion
              </option>
              <option value='Christian'>Christian</option>
              <option value='Muslim'>Muslim</option>
              <option value='Others'>Others</option>
            </select>

            <select
              id='occupation-options'
              value={occupation}
              onChange={(e) => {
                setOccupation(e.target.value);
              }}
            >
              <option value='' disabled>
                Occupation
              </option>
              <option value='Student'>Student</option>
              <option value='Worker'>Worker</option>
            </select>

            <button className='filters' onClick={handleApplyFilter}>
              Apply Filter
            </button>
            <button className='resets' onClick={handleReset}>
              Reset
            </button>
          </div>
          </main>

          {/* === Results Section === */}
          <div className='results-containers'>
             {Array.isArray(filteredListings) && filteredListings.length > 0 ? (
             currentListings.map((listing) => (
    <div key={listing.user_id} className='result-cards'>
      <img 
        src={ listing.profilepicture && listing.profilepicture !== "" ? listing.profilepicture 
          : "https://res.cloudinary.com/dh1rs2zgb/image/upload/v1753801839/finder_logo_awoliq.png"}
        alt={"Click to view"}
        className='clickable-imgs'
         onClick={() => setData({
    fname: listing.fname,
    lname: listing.lname,
    // age: listing.age,
    profile_picture: listing.profilepicture,
    bio: listing.bio,
    // preferences: {
    //   Age_range: listing.habbits.agerange,
    //   Gender: listing.habbits.gender,
    //   Pet: listing.habbits.pet,
    //   Late_Nights: listing.habbits.latenights,
    //   Smoking: listing.habbits.smoking,
    //   Drinking: listing.habbits.drinking,
    //   Guests_policy: listing.habbits.guests,
    //   noise_tolerance: listing.habbits.noisetolerance,
    //   Religion: listing.habbits.religion,
    //   Occupation: listing.habbits.occupation
    // }
  })}
      />
      <p className='name-labels'>
        <strong>{listing.fname} {listing.lname}</strong>
         <p className="birthdate-labels">🌟 {listing.birthdate} years</p>
      </p>

       <button
    className="match-buttons"
    onClick={() => handleMatch(listing.user_id)}
  >
    Match
  </button>
    </div>
  ))
) :
        ( 
    <p>No listings available at the moment.</p>
  )}
           </div>

           {data.fname !== "" && (
        <div
          className='modal-overlays'
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetData();
            }
          }}
        >
          <div className='modal-contents' onClick={(e) => e.stopPropagation()}>
            <div className='modal-headers'>
              <span className='favorite-icons' title='Add to favorites'>
                ❤️
              </span>
              <span
                className='close-icons'
                onClick={() => resetData()}
                title='Close'
              >
                ✖ 
              </span>
            </div>

            <img //"https://res.cloudinary.com/dh1rs2zgb/image/upload/v1753276159/profile_pictures/profile_ZpDR76714KZK0s5JWkT676UKaJi1.jpg"
              src={data.profile_picture && data.profile_picture !== "" ? data.profile_picture 
          : "https://res.cloudinary.com/dh1rs2zgb/image/upload/v1753801839/finder_logo_awoliq.png"}
              alt={"Photos"}
            />

            <p>
              <strong>{data.fname}</strong> <strong>{data.lname}</strong>
            </p>

            <p>
              <strong>{data.bio}</strong>
            </p>
            <button>Message</button>
          </div>
        </div>

      )}

          {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ⬅ Previous
          </button>
          <span>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next ➡
          </button>
        </div>
      )}

          {/* === More Options Section === */}
          <section className='more-options'>
            <h2 className='more-options-titless'>What Are You Looking For?</h2>
            <div className='more-options-grids'>
              <Link to='/find-roommate' className='option-cards'>
                <h3>🔍 Find a Roommate</h3>
                <p>Browse profiles of compatible roommates near you.</p>
              </Link>
              <Link to='/list-your-room' className='option-cards'>
                <h3>🏡 List Your Room</h3>
                <p>
                  Have a room? Post it and connect with potential roommates.
                </p>
              </Link>
              <Link to='/verified-roommates' className='option-cards'>
                <h3>👯‍♂️ Meet Verified Roommates</h3>
                <p>Chat with people who have verified their profiles.</p>
              </Link>
            </div>
          </section>

          {/* === Help & Support Link === */}
          <section className='support-link-bottoms center-supports'>
            <Link to='/support' className='action-cards'>
              🛟 Help & Support
            </Link>
          </section>
        

        
      </div>

     

      <Footer />
    </>
  );
}

export default Dashboard;
