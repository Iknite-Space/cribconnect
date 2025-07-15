import '../styles/ProfilePage.css'
// import { Link } from 'react-router-dom';
import React, { useState, useEffect, useContext } from 'react';
import LoadingSpinner from '../assets/components/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';


const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const {token} = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false)

       const [formData, setFormData] = useState({
  fname: '',
  lname: '',
  email: '',
  phoneno: '',
  birthdate: '',
  bio: '',
  agerange: '',
  gender: '',
  pet: '',
  latenights: '',
  smoking: '',
  drinking: '',
  guests: '',
  noisetolerance: '',
  religion: '',
  occupation: '',
  profilepicture: null
});

    //Example: GET from a server
  //  const [imagePreviewUrl, setImagePreviewUrl] = useState(""); 

  useEffect( () => {
    let isMounted = true

  const fetchProfile = async () => {
    try{
   const response = await fetch("http://localhost:8084/user/profile",{
    method: "GET",
    headers: {
        Authorization: `Bearer ${token}`,
      },
  });

    if (!response.ok) {
      alert ('Failed to fetch profile');
    }
  

    const data = await response.json();
      // Convert backend date string to YYYY-MM-DD explicitly
let formattedDate = "";
if (data.birthdate && typeof data.birthdate === "string") {
  // Replace slashes with dashes in case the format is yyyy/mm/dd
  const normalized = data.birthdate.replace(/\//g, "-");

  const parsedDate = new Date(normalized);
  if (!isNaN(parsedDate.getTime())) {
    formattedDate = parsedDate.toISOString().slice(0, 10); // YYYY-MM-DD
  } else {
    console.warn("Invalid date:", data.birthdate);
    formattedDate = ""; // fallback or default if needed
  }
}

  
    console.log(data)
      if (isMounted) {
        //const userData = data.User;
      setFormData((prev) => ({
        ...prev,
        fname: data.fname,
        lname: data.lname,
        email: data.email,  
        phoneno: data.phoneno,
        birthdate: formattedDate,
        bio: data.bio,
        ...data.preferences,  // This assumes the data matches your formData keys
       profilepicture: data.profilepicture  // file input stays null
      }));
     // setImagePreviewUrl(data.profilepicture || "/path-to-profile.jpg"); // update preview separately
      setIsLoading(false);  // turn off spinner
    }
  }
    catch(err) {
      
      console.error("Fetch error:", err);
     if(isMounted) setIsLoading(false);  // still turn off spinner
    }
   };
   fetchProfile();

    return () => { isMounted = false};
}, [token]);


const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setFormData((prev) => ({
      ...prev,
      profilepicture: file
    }));
  }
};


const handleInputChange = (e) => {
  setFormData((prev) => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};

///
const isPersonalComplete = Boolean(
  formData.fname &&
  formData.lname &&
  formData.email &&
  formData.phoneno
);
  

const isAboutMeComplete = Boolean(
    formData.bio
);

const isprofilepictureComplete = Boolean(
    formData.profilepicture
);

const preferenceFields = [
  'agerange', 'gender', 'pet', 'latenights', 'smoking',
  'drinking', 'guests', 'noisetolerance', 'religion', 'occupation'
];

const filledPreferences = preferenceFields.filter(field => formData[field] !== '');
const isPreferencesComplete = filledPreferences.length >= preferenceFields.length;

const completedSections =
  (isPersonalComplete ? 1 : 0) +
  (isAboutMeComplete ? 1 : 0) +
  (isPreferencesComplete ? 1 : 0) +
  (isprofilepictureComplete);

const progressPercent = Math.floor((completedSections / 4) * 100);
console.log('Progress:', progressPercent);


const handleSubmit = async (e) => {
  e.preventDefault();
  if (submitting) return;

  setSubmitting(true);
  const payload = new FormData();

  // Add all text fields
  Object.entries(formData).forEach(([key, value]) => {
    if (key !== "profilepicture") {
      payload.append(key, value);
    }
  });

  // Add image (if present)
  if (formData.profilepicture) {
    payload.append("profilepicture", formData.profilepicture);
  }



  // Example: POST to a server
  try {
  const response = await fetch("/api/save-profile", {
    method: "POST",
    headers: {
        Authorization: `Bearer ${token}`,
      },
    body: payload
  })
    if (!response.ok) {
      alert("Failed to save profile");
    }
     
      const data = await response.json();
      alert("✅ Profile saved successfully!");
      console.log("Server response:", data);
    }
    catch(err)  {
      console.error("Save error:", err);
      alert("❌ Something went wrong. Please try again.");
    } finally {
      setSubmitting(false)
    }
};


if (isLoading) return <LoadingSpinner message="Loading your profile..." />;
    return (
        <>
         <header className="hero">
         <h1>Make Changes To Suit Your Taste</h1>
         <div className="profile-container">
  <img
    src={
      typeof formData.profilepicture === "string"
      ? formData.profilepicture
      : formData.profilepicture
        ? URL.createObjectURL(formData.profilepicture)
        : "/path-to-profile.jpg"
        //: imagePreviewUrl || "/path-to-profile.jpg"
    }
    alt="User Profile"
    className="profile-pic"
  />

  {/* Hidden input trigger */}
  <input
    type="file"
    id="imageUpload"
    accept="image/*"
    onChange={handleFileChange}
    style={{ display: "none" }}
  />

  {/* Icon hangs off the image */}
  <label htmlFor="imageUpload" className="profile-icon">📷</label>
</div>

 

         </header>

         <form className="profile-form" onSubmit={handleSubmit}>
  <div className="form-section personal">
    <h2>Personal Details</h2>
    <input type="text" placeholder="First Name" name="fname" value={formData.fname} onChange={handleInputChange} />
    <input type="text" placeholder="Last Name" name="lname" value={formData.lname} onChange={handleInputChange}/>
    <input type="email" placeholder="Email" name="email" value={formData.email} onChange={handleInputChange}/>
    <input type="tel" placeholder="phoneno" name="phoneno" value={formData.phoneno} onChange={handleInputChange}/>
    <input type="date" placeholder="Birthdate" name="birthdate" value={formData.birthdate} onChange={handleInputChange}/>

    {/* About Me Section */}
    <div className="form-section about-me">
  <h2>About Me</h2>
  <textarea name="bio" value={formData.bio} placeholder="Tell us a bit about yourself..."  rows="6" onChange={handleInputChange}/>
</div>

  </div>

  <div className="form-section preferences">
          {!isLoading && progressPercent > 0 && (
  <div className="progress-banner">
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{
          width: `${progressPercent}%`,
          backgroundColor:
            progressPercent === 100 ? '#4CAF50' :
            progressPercent < 34 ? '#FF4C4C' :
            '#0E4C92'
        }}
      ></div>
    </div>
    <p className="progress-text">
      {progressPercent === 100
        ? '🎉 Profile Complete!'
        : `Progress: ${progressPercent}%`}
    </p>
  </div>
)}


  <h2>Preferences</h2>
  <select name="agerange" value={formData.agerange} onChange={handleInputChange}>
    <option value="">Age Range</option>
    <option>18-21</option>
    <option>22-25</option>
    <option>26-29</option>
    <option>30-33</option>
  </select>

  <select name="gender" value={formData.gender} onChange={handleInputChange}>
    <option value="">Gender Preference</option>
    <option>Male</option>
    <option>Female</option>
    <option>Any</option>
  </select>

  <select name="pet" value={formData.pet} onChange={handleInputChange}>
    <option value="">Pet Friendly?</option>
    <option>Yes</option>
    <option>No</option>
  </select>

  <select name="latenights" value={formData.latenights} onChange={handleInputChange}>
    <option value="">Late Nights?</option>
    <option>Yes</option>
    <option>No</option>
  </select>

  <select name="smoking" value={formData.smoking} onChange={handleInputChange}>
    <option value="">Smoking</option>
    <option>Yes</option>
    <option>No</option>
  </select>

  <select name="drinking" value={formData.drinking} onChange={handleInputChange}>
    <option value="">Drinking</option>
    <option>No</option>
    <option>Sometimes</option>
    <option>Often</option>
  </select>

  <select name="guests" value={formData.guests} onChange={handleInputChange}>
    <option value="">Guest Policy</option>
    <option>Rarely</option>
    <option>Sometimes</option>
    <option>Very Often</option>
  </select>

  <select name="noisetolerance" value={formData.noisetolerance} onChange={handleInputChange}>
    <option value="">Noise Tolerance</option>
    <option>Low</option>
    <option>Medium</option>
    <option>High</option>
  </select>

  <select name="religion" value={formData.religion} onChange={handleInputChange}>
    <option value="">Religion</option>
    <option>Christian</option>
    <option>Moslem</option>
  </select>

  <select name="occupation" value={formData.occupation} onChange={handleInputChange}>
    <option value="">Occupation</option>
    <option>Student</option>
    <option>Worker</option>
    <option>Any</option>
  </select>
</div>

<div className="submit-wrapper">
  <button
    type="submit"
    className="submit-btn"
    disabled={progressPercent < 100 || submitting}
    onClick={handleSubmit}
  >
    {submitting ? 'Saving...' : 'Save Profile'}
  </button>
</div>

</form>

        </>
    );

}

export default ProfilePage;
