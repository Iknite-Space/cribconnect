import '../styles/ProfilePage.css'
// import { Link } from 'react-router-dom';
import React, { useState } from 'react';


const ProfilePage = () => {

    const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  aboutMe: '',
  ageRange: '',
  gender: '',
  pet: '',
  lateNights: '',
  smoking: '',
  drinking: '',
  guests: '',
  noiseTolerance: '',
  religion: '',
  occupation: '',
  profileImage: null
});

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setFormData((prev) => ({
      ...prev,
      profileImage: file
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
  formData.firstName &&
  formData.lastName &&
  formData.email &&
  formData.phone
);
  

const isAboutMeComplete = Boolean(
    formData.aboutMe
);

const isProfileImageComplete = Boolean(
    formData.profileImage
);

const preferenceFields = [
  'ageRange', 'gender', 'pet', 'lateNights', 'smoking',
  'drinking', 'guests', 'noiseTolerance', 'religion', 'occupation'
];

const filledPreferences = preferenceFields.filter(field => formData[field] !== '');
const isPreferencesComplete = filledPreferences.length >= preferenceFields.length;

const completedSections =
  (isPersonalComplete ? 1 : 0) +
  (isAboutMeComplete ? 1 : 0) +
  (isPreferencesComplete ? 1 : 0) +
  (isProfileImageComplete);

const progressPercent = Math.floor((completedSections / 4) * 100);
console.log('Progress:', progressPercent);


///
// const totalFields = Object.keys(formData).length;
// const filledFields = Object.values(formData).filter(val => val !== '').length;
// const completionPercent = Math.floor((filledFields / totalFields) * 100);


    return (
        <>
         <header className="hero">
         <h1>Find Your Perfect Roommate</h1>
         <div className="profile-container">
  <img
    src={
      formData.profileImage
        ? URL.createObjectURL(formData.profileImage)
        : "/path-to-profile.jpg"
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

         {progressPercent > 0 && (
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

         </header>

         <section className="profile-form">
  <div className="form-section personal">
    <h2>Personal Details</h2>
    <input type="text" placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
    <input type="text" placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange}/>
    <input type="email" placeholder="Email" name="email" value={formData.email} onChange={handleInputChange}/>
    <input type="tel" placeholder="Phone" name="phone" value={formData.phone} onChange={handleInputChange}/>

    {/* About Me Section */}
    <div className="form-section about-me">
  <h2>About Me</h2>
  <textarea name="aboutMe" value={formData.aboutMe} placeholder="Tell us a bit about yourself..."  rows="6" onChange={handleInputChange}/>
</div>

  </div>

  <div className="form-section preferences">
    {/* <p style={{ textAlign: 'center', marginBottom: '8px', color: '#0E4C92' }}>
  {progressPercent === 100
    ? '✅ All sections completed!'
    : `Progress: ${progressPercent}%`}
</p>

   <div className="progress-wrapper">
  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{
        width: `${progressPercent}%`,
        backgroundColor:
          progressPercent === 100 ? '#4CAF50' : // success green
          progressPercent < 34 ? '#FF4C4C' :     // warning red
          '#0E4C92'                               // default blue
      }}
    ></div>
  </div>
</div> */}


  <h2>Preferences</h2>
  <select name="ageRange" value={formData.ageRange} onChange={handleInputChange}>
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

  <select name="lateNights" value={formData.lateNights} onChange={handleInputChange}>
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

  <select name="noiseTolerance" value={formData.noiseTolerance} onChange={handleInputChange}>
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

</section>

        </>
    );

}

export default ProfilePage;
