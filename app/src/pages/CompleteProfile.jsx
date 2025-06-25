import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import '../styles/CompleteProfile.css';
//npm install react-phone-input-2
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useNavigate } from 'react-router-dom';




const CompleteProfile = () => {
   const navigate = useNavigate(); 
  const [phoneError, setPhoneError] = useState('');
  const [form, setForm] = useState({
    fname: '',
    lname: '',
    phonenum: '',
    birthdate: '',
    bio: '',
    profile_picture: null,
    preferences: {
      ageRange: '',
      gender: '',
      pet: '',
      lateNights: '',
      smoking: '',
      drinking: '',
      guests: '',
      noiseTolerance: '',
      religion: '',
      occupation: ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in form.preferences) {
      setForm((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, [name]: value }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
  setForm((prev) => ({ ...prev, profile_picture: e.target.files[0] }));
  console.log("Selected file:", e.target.files[0]);

};


  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // ✅ Cameroonian phone number format validation
const isValidCameroonPhone = (num) => {
  const pattern = /^\+237((6(70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89))|(65[0-9])|(69[1-9])|(62[0-3]))\d{6}$/;
  return pattern.test(num);
};

if (!isValidCameroonPhone(form.phonenum)) {
 setPhoneError('Invalid phone number!');
  return;
} else {
  setPhoneError(''); // clear error if valid
}

  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in");
      return;
    }

    const idToken = await user.getIdToken();

    // Prepare form data
    const formData = new FormData();
    formData.append("fname", form.fname);
    formData.append("lname", form.lname);
    formData.append("phoneno", form.phonenum); // 👈 rename to match backend
    formData.append("birthdate", form.birthdate);
    formData.append("bio", form.bio);
    formData.append("preferences", JSON.stringify(form.preferences)); // JSON string

    if (form.profile_picture) {
      formData.append("profile_picture", form.profile_picture);
      console.log(form.phonenum);


    }

    // Send to backend
    const res = await fetch("http://localhost:8081/users/complete-profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: formData,
    });

    const result = await res.json();
    if (res.ok) {
      alert("🎉 Profile saved!");
      navigate('/');
    } else {
      console.error(result);
      alert("⚠️ Error saving profile");
    }
  } catch (error) {
    console.error("Submit error:", error);
    alert("Something went wrong");
  }
};

  return (
    <div className="profile-page">
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <h3>Personal Info</h3>
        <input name="fname" type="text" placeholder="First Name" required onChange={handleInputChange} />
        <input name="lname" type="text" placeholder="Last Name" required onChange={handleInputChange} />
        <PhoneInput country={'cm'} // Cameroon
           onlyCountries={['cm']} // Optional: force only Cameroon
           masks={{ cm: '.... ......' }}
           value={form.phonenum}
           onChange={(phone) =>
          setForm((prev) => ({ ...prev, phonenum: `+${phone}` }))
               }
              inputProps={{
              name: 'phonenum',
              required: true,
              autoFocus: false
              }}
        />
        {phoneError && <div className="error-message">{phoneError}</div>}

        <input name="birthdate" type="date" required onChange={handleInputChange} />
        <textarea name="bio" placeholder="Tell us about yourself" onChange={handleInputChange}></textarea>
        <input name="profile_picture" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />

        <h3>Provide Your Roommate Preferences</h3>
        <select name="ageRange" onChange={handleInputChange}>
          <option value="">Age Range</option>
          <option>18-21</option>
          <option>22-25</option>
          <option>26-29</option>
          <option>30-33</option>
        </select>
        <select name="gender" onChange={handleInputChange}>
          <option value="">Gender Preference</option>
          <option>Male</option>
          <option>Female</option>
          <option>Any</option>
        </select>
        <select name="pet" onChange={handleInputChange}>
          <option value="">Pet Friendly?</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        <select name="lateNights" onChange={handleInputChange}>
          <option value="">Late Nights?</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        <select name="smoking" onChange={handleInputChange}>
          <option value="">Smoking</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        <select name="drinking" onChange={handleInputChange}>
          <option value="">Drinking</option>
          <option>No</option>
          <option>Sometimes</option>
          <option>Often</option>
        </select>
        <select name="guests" onChange={handleInputChange}>
          <option value="">Guest Policy</option>
          <option>Rarely</option>
          <option>Sometimes</option>
          <option>Very Often</option>
        </select>
        <select name="noiseTolerance" onChange={handleInputChange}>
          <option value="">Noise Tolerance</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select name="religion" onChange={handleInputChange}>
          <option value="">Religion</option>
          <option>Christian</option>
          <option>Moslem</option>
        </select>
        <select name="occupation" onChange={handleInputChange}>
          <option value="">Ocuupation</option>
          <option>Student</option>
          <option>Worker</option>
          <option>Any</option>
        </select>
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default CompleteProfile;
