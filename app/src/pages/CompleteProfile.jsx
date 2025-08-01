import React, { useState, useRef, useContext } from 'react';
import '../styles/CompleteProfile.css';
//npm install react-phone-input-2
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Cropper from 'react-easy-crop'
import {getCroppedImage} from '../utils/cropImageHelper';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import MessageBanner from '../assets/components/MessageBanner';
import Button from '../assets/components/Button';






const CompleteProfile = () => {
   const fileInputRef = useRef(null);
   const navigate = useNavigate(); 
   const { token, refreshIdToken, logout} = useContext(AuthContext);
   const [messageStatus, setMessageStatus] = useState({ message: '', type: 'info' });
   const [submitting, setSubmitting] = useState(false)
  
const [imageSrc, setImageSrc] = useState(null);
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
const [isCropping, setIsCropping] = useState(false);

const [bio, setBio] = useState('');
const [charCount, setCharCount] = useState(0);
const [isInvalid, setIsInvalid] = useState(false); 
const [phoneError, setPhoneError] = useState('');


  const [form, setForm] = useState({
    fname: '',
    lname: '',
    phoneno: '',
    birthdate: '',
    bio: '',
    profile_picture: null,
    habbits: {
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


  //  Handles regular inputs and nested habbit inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in form.habbits) {
      setForm((prev) => ({
        ...prev,
        habbits: { ...prev.habbits, [name]: value }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

//  Handle file upload, limit to 5MB, and create a preview
  const handleFileChange = (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Profile photo must be 5MB or smaller.");
      return;
    }
      const reader = new FileReader();
     reader.onload = () => {
      setImageSrc(reader.result);
     setIsCropping(true);
     };
      reader.readAsDataURL(file);
    console.log("Selected file:", file);
  };

  const handleCropConfirm = async () => {
  try {
    const blob = await getCroppedImage(imageSrc, croppedAreaPixels);
    const mimeType = blob?.type || 'image/jpeg';
const extension = mimeType === 'image/png' ? 'png' : 'jpg';

const file = new File([blob], `profile.${extension}`, { type: mimeType });

    const previewURL = URL.createObjectURL(blob);

    setForm((prev) => ({
      ...prev,
      profile_picture: file,
      profile_preview: previewURL,
    }));

    setIsCropping(false);
    setImageSrc(null);
  } catch (err) {
    alert('Failed to crop image.');
    console.error(err);
  }
};


  //  Remove/reset profile photo
  const handleRemovePhoto = () => {
  setForm((prev) => ({
    ...prev,
    profile_picture: null,
    profile_preview: null,
  }));
  setImageSrc(null);
  setIsCropping(false);
  setCroppedAreaPixels(null);
  setCrop({ x: 0, y: 0 });
  setZoom(1);

  if (fileInputRef.current) {
    fileInputRef.current.value = ''; // ❌ fully clears the file selection
  }
};


//Bio text area 
 

const handleInputChanges = (e) => {
  const value = e.target.value;
  setBio(value);
  setCharCount(value.length);
  setIsInvalid(value.length < 50 || value.length > 300);

  // ✅ Sync with form state
  setForm((prev) => ({
    ...prev,
    bio: value,
  }));
};

  


  const handleSubmit = async (e) => {
  e.preventDefault();
  if (submitting) return;

  //  Cameroonian phone number format validation
const isValidCameroonPhone = (num) => {
  const pattern = /^\+237((6(70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89))|(65[0-9])|(69[1-9])|(62[0-3]))\d{6}$/;
  return pattern.test(num);
};

if (!isValidCameroonPhone(form.phoneno)) {
 setPhoneError('Invalid phone number!');
  return;
} 

  setPhoneError(''); // clear error if valid
  setSubmitting(true);

  try {
   await refreshIdToken();
    // Prepare form data
    const formData = new FormData();
    formData.append("fname", form.fname);
    formData.append("lname", form.lname);
    formData.append("phoneno", form.phoneno); // 👈 rename to match backend
    formData.append("birthdate", form.birthdate);
    formData.append("bio", form.bio);
    formData.append("habbits", JSON.stringify(form.habbits)); // JSON string

    if (form.profile_picture) {
      formData.append("profile_picture", form.profile_picture);
      console.log(form.phoneno);


    }
     
    // Send to backend
     
    //   http://localhost:8081
    const res = await fetch("https://api.cribconnect.xyz/v1/users/complete-profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    await res.json();
   
    if (res.status === 401) {
    //  Unauthorized: likely expired or invalid token
     setMessageStatus({message: "Session expired. Please log in again.", type: 'error' });
      logout(); // clears token & refresh token
     navigate("/login");
    }
    else if (res.status === 403) {
  setMessageStatus({ message: 'Permission denied.', type: 'error' });
    }
    else if (res.ok) {
      setMessageStatus({ message: 'Profile saved!', type: 'success' });
      navigate('/dashboard');
    } else{
     setMessageStatus({ message: 'Error saving profile', type: 'error' });
     navigate("/profile")
    }
  } catch (error) {
    setMessageStatus({ message: 'Something went wrong!', type: 'error' });
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="profile-page">
      <h2>Complete Your Profile 🧑‍💼</h2>
    <form onSubmit={handleSubmit} className="myFormStyle">
        <h3>Personal Info</h3>
        <input name="fname" type="text" placeholder="First Name" required onChange={handleInputChange} />
        <input name="lname" type="text" placeholder="Last Name" required onChange={handleInputChange} />
        <PhoneInput country={'cm'} // Cameroon
           onlyCountries={['cm']} // Optional: force only Cameroon
           masks={{ cm: '.... ......' }}
           value={form.phoneno}
           onChange={(phone) =>
          setForm((prev) => ({ ...prev, phoneno: `+${phone}` }))
               }
              inputProps={{
              name: 'phoneno',
              required: true,
              autoFocus: false
              }}
        />
        {phoneError && <div className="error-messages">{phoneError}</div>}

        <input name="birthdate" type="date" required onChange={handleInputChange} />
        {/* <div className="bio-container"> */}
        <textarea
             name="bio"
             placeholder="Any brief description about you"
             value={bio}
             onChange={handleInputChanges}
             className={isInvalid ? 'textarea-error' : ''}
             ></textarea>

         <div className="char-feedback">
          <span className={isInvalid ? 'char-count error' : 'char-count'}>
           {charCount}/300
          </span>
           {isInvalid && (
           <p className="error-msg">Bio must be between 50 and 300 characters.</p>
           )}
         </div>
         {/* </div> */}

        {/* 📸 Profile Photo Input + Preview + Remove */}
      <label>Upload Profile Picture</label>
      <input
        type="file"
        name="profile_picture"
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
        ref={fileInputRef}
      />

     {form.profile_preview && !isCropping && (
  <div className="preview">
    <img src={form.profile_preview} alt="Cropped preview" />
    <button type="button" onClick={handleRemovePhoto}>Remove Photo</button>
  </div>
)}

{isCropping && imageSrc && (
  <div className="cropper-wrapper">
  <div className="cropper-box">
    <Cropper
      image={imageSrc}
      crop={crop}
      zoom={zoom}
      aspect={1}
      cropShape="round"
      showGrid={false}
      onCropChange={setCrop}
      onZoomChange={setZoom}
      onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
    />
  </div>

  <div className="cropper-buttons">
    <button type="button" onClick={handleCropConfirm}>Crop & Save</button>
    <button type="button" onClick={() => setIsCropping(false)}>Cancel</button>
  </div>
</div>

)}



        <h3>Tell us about yourself</h3>
        <select name="ageRange" onChange={handleInputChange}>
          <option value="" disabled> Your age range</option>
          <option>18-21</option>
          <option>22-25</option>
          <option>26-29</option>
          <option>30-33</option>
        </select>
        <select name="gender" onChange={handleInputChange}>
          <option value="" disabled>Your gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>
        <select name="pet" onChange={handleInputChange}>
          <option value="" disabled>Are you pets friendly?</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        <select name="lateNights" onChange={handleInputChange}>
          <option value="" disabled>Late nights?</option>
          <option>Rarely</option>
          <option>Sometimes</option>
          <option>Often</option>
        </select>
        <select name="smoking" onChange={handleInputChange}>
          <option value="" disabled>Do you smoke?</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        <select name="drinking" onChange={handleInputChange}>
          <option value="" disabled>How often do you drink?</option>
          <option>Rarely</option>
          <option>Sometimes</option>
          <option>Often</option>
        </select>
        <select name="guests" onChange={handleInputChange}>
          <option value="" disabled>Guest Policy</option>
          <option>Rarely</option>
          <option>Sometimes</option>
          <option>Often</option>
        </select>
        <select name="noiseTolerance" onChange={handleInputChange}>
          <option value="" disabled>Noise Tolerance</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select name="religion" onChange={handleInputChange}>
          <option value="" disabled>Religion</option>
          <option>Christian</option>
          <option>Moslem</option>
        </select>
        <select name="occupation" onChange={handleInputChange}>
          <option value="" disabled>Occupation</option>
          <option>Student</option>
          <option>Worker</option>
          <option>Any</option>
        </select>

        <MessageBanner
         message={messageStatus.message} 
        type={messageStatus.type}
        clear={() => setMessageStatus('')} />
        
        <Button type="submit" disabled={submitting}>
  {submitting ? 'Saving...' : 'Save Profile'}</Button>
      </form>
    </div>
  );
};

export default CompleteProfile;
