import React, { useEffect, useState, useRef, useContext } from 'react';
import '../styles/CompleteProfile.css';
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
    fileInputRef.current.value = ''; //  fully clears the file selection
  }
};

  const today = new Date();
const eighteenYearsAgo = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate()
);
const maxDate = eighteenYearsAgo.toISOString().split("T")[0];


//Bio text area 
 useEffect(() => {
  // Trim only for counting, not for the stored value
  const trimmed = form.bio.trim();
  setCharCount(trimmed.length);
  setIsInvalid(trimmed.length > 0 && (trimmed.length < 30 || trimmed.length > 300));
}, [form.bio]);

const handleInputChanges = (e) => {
  const value = e.target.value;
  setBio(value);

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
     

     
    //   http://localhost:8081
    const res = await fetch("https://api.cribconnect.xyz/v1/users/complete-profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    await res.json();
   console.log(res)
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
      setTimeout(() => navigate("/dashboard"), 1500);
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
      <div className='personal-info'>
        <h3>Personal Info</h3>
        <input name="fname" type="text" placeholder="First Name" required onChange={handleInputChange} />
        <input name="lname" type="text" placeholder="Last Name" required onChange={handleInputChange} />
        <PhoneInput country={'cm'} // Cameroon
                onlyCountries={['cm']} 
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

        <input name="birthdate" type="date" required onChange={handleInputChange} max={maxDate} />
        
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
           <p className="error-msg">Bio must be between 30 and 300 characters.</p>
           )}
         </div>
        

        {/*  Profile Photo Input + Preview + Remove */}
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
    <img 
        src={form.profile_preview} 
        alt="Cropped preview" 
        className="preview-image"
      />
    <button type="button" className='btz' onClick={handleRemovePhoto}>Remove Photo</button>
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
            <button type="button" className='bt' onClick={handleCropConfirm}>Crop & Save</button>
            <button type="button" className='btz' onClick={() => setIsCropping(false)}>Cancel</button>
          </div>
              </div>

      )}
</div>

         <div className="tellus-forms">
      <h3>Tell us about yourself</h3>
      
         <div className="preferences">
             {[
               { name: 'ageRange', placeholder: 'Your age range', options: ['18-21', '22-25', '26-29', '30-33'] },
               { name: 'gender', placeholder: 'Your gender', options: ['Male', 'Female'] },
               { name: 'pet', placeholder: 'Pets friendly?', options: ['Yes', 'No'] },
               { name: 'lateNights', placeholder: 'Late nights?', options: ['Rarely', 'Sometimes', 'Often'] },
               { name: 'smoking', placeholder: 'Do you smoke?', options: ['Yes', 'No'] },
               { name: 'drinking', placeholder: 'How often do you drink?', options: ['Rarely', 'Sometimes', 'Often'] },
               { name: 'guests', placeholder: 'Guest Policy', options: ['Rarely', 'Sometimes', 'Often'] },
               { name: 'noiseTolerance', placeholder: 'Noise Tolerance', options: ['Low', 'Medium', 'High'] },
               { name: 'religion', placeholder: 'Religion', options: ['Christian', 'Muslim'] },
               { name: 'occupation', placeholder: 'Occupation', options: ['Student', 'Worker'] },
             ].map(field => (
                 <div className="select-field" key={field.name}>
                  <label htmlFor={field.name}>{field.placeholder}</label>
               <select
                 id={field.name}
                 name={field.name}
                 onChange={handleInputChange}
               >
                 <option value="" hidden>
                   {/* Select {field.placeholder} */}
                 </option>
                 {field.options.map(opt => (
                   <option key={opt} value={opt}>{opt}</option>
                 ))}
               </select>
               </div>
             ))}
           </div>
     
    </div>


        <MessageBanner
         message={messageStatus.message} 
        type={messageStatus.type}
        clear={() => setMessageStatus({ message: "", type: "info" })} />
        
        <Button type="submit" disabled={submitting}>
  {submitting ? 'Saving...' : 'Save Profile'}</Button>
      </form>
    </div>
  );
};

export default CompleteProfile;
