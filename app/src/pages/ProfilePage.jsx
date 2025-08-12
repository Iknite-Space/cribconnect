import "../styles/ProfilePage.css";
// import { Link } from 'react-router-dom';
import React, { useState, useEffect, useContext, useRef } from "react";
import LoadingSpinner from "../assets/components/LoadingSpinner";
import { AuthContext } from "../context/AuthContext";
import PhoneInput from "react-phone-input-2";
import MessageBanner from "../assets/components/MessageBanner";
import { getCroppedImage } from "../utils/cropImageHelper";
import Cropper from "react-easy-crop";
import Navbar from "../assets/components/Navbar";

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [message, setMessage] = useState({ message: "", type: 'info' });
  const [showModal, setShowModal] = useState(false);
  // const [previewUrl, setPreviewUrl] = useState(null);

   const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phoneno: "237",
    birthdate: "",
    bio: "",
    agerange: "",
    gender: "",
    pet: "",
    latenights: "",
    smoking: "",
    drinking: "",
    guests: "",
    noisetolerance: "",
    religion: "",
    occupation: "",
    profilepicture: null,
  });

    const today = new Date();
const eighteenYearsAgo = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate()
);
const maxDate = eighteenYearsAgo.toISOString().split("T")[0];


  const normalizePhone = (rawPhone) => {
    if (typeof rawPhone === "string" && rawPhone.startsWith("+")) {
      return rawPhone.replace("+", ""); // Result: "237673990801"
    }
    return "237";
  };

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        // http://localhost:8084
        const response = await fetch(
          "https://api.cribconnect.xyz/v1/user/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setMessage({message: "Failed to fetch profile", type: "error"});
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
            // console.warn("Invalid date:", data.birthdate);
            formattedDate = ""; // fallback or default if needed
          }
        }

        // console.log(data)
        if (isMounted) {
          //const userData = data.User;
          setFormData((prev) => ({
            ...prev,
            fname: data.fname,
            lname: data.lname,
            email: data.email,
            phoneno: normalizePhone(data.phoneno),
            birthdate: formattedDate,
            bio: data.bio,
            ...data.habbits, // This assumes the data matches your formData keys
            profilepicture: data.profilepicture, // file input stays null
          }));
          // setImagePreviewUrl(data.profilepicture || "/path-to-profile.jpg"); // update preview separately
          setIsLoading(false); // turn off spinner
        }
        //console.log("Setting phone number:", normalizePhone(data.phoneno));
      } catch (err) {
        //console.error("Fetch error:", err);
        if (isMounted) setIsLoading(false); // still turn off spinner
      }
    };
    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({message:"Profile photo must be 5MB or smaller.", type: "info"});
      return;
    }

    const reader = new FileReader();
     reader.onload = () => {
      setImageSrc(reader.result);
       setShowModal(true);
     setIsCropping(true);
     };
    reader.readAsDataURL(file);
    console.log("Selected file:", file);

    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilepicture: file,
      }));
    }
  };
//  const [charCount, setCharCount] = useState(0);
//  const [isInvalid, setIsInvalid] = useState(false); 
 
  const handleBioChanges = (e) => {
  const value = e.target.value;

  setFormData((prev) => ({
    ...prev,
    bio: value,
  }));
};

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  ///
  const isPersonalComplete = Boolean(
    formData.fname && formData.lname && formData.email && formData.phoneno
  );

 const trimmedBio = formData.bio
const bioLength  = trimmedBio.length;
const isBioComplete = bioLength >= 30 && bioLength <= 300;
const isBioInvalid  = bioLength > 0 && !isBioComplete;

  const isprofilepictureComplete = Boolean(formData.profilepicture);

  const preferenceFields = [
    "agerange",
    "gender",
    "pet",
    "latenights",
    "smoking",
    "drinking",
    "guests",
    "noisetolerance",
    "religion",
    "occupation",
  ];

  const filledhabbits = preferenceFields.filter(
    (field) => formData[field] !== ""
  );
  const ishabbitsComplete = filledhabbits.length >= preferenceFields.length;

  const completedSections =
    (isPersonalComplete ? 1 : 0) +
    (isBioComplete ? 1 : 0) +
    (ishabbitsComplete ? 1 : 0) +
    isprofilepictureComplete;

  const progressPercent = Math.floor((completedSections / 4) * 100);
  
   const [feedback, setFeedback] = useState("");
  useEffect(() => {
        const missing = [];
    if (!isPersonalComplete)      missing.push("Personal Details");
    if (!isBioComplete)        missing.push("Bio");
    if (!ishabbitsComplete)        missing.push("About Me");
    if (!isprofilepictureComplete) missing.push("Profile Picture");

    if (missing.length > 0) {
      // Show an inline message listing exactly what’s incomplete
      setFeedback(
        `To update please complete the following sections: ${missing.join(", ")}.`
      );
      return;
    }
    setFeedback("");
  }, [isPersonalComplete,isBioComplete,ishabbitsComplete,isprofilepictureComplete])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    const payload = new FormData();

    // Add all text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "profilepicture" && key !== "phoneno") {
        payload.append(key, value);
      }
    });

    // ✅ Format phonenum with leading "+" if missing
    const fullPhone = formData.phoneno.startsWith("+")
      ? formData.phoneno
      : `+${formData.phoneno}`;
    payload.append("phoneno", fullPhone);

    // Valid email check && ✅ Cameroonian phone number format validation
    const isValidEmail = (email) =>
      /^[A-Za-z0-9._%+-]+@gmail\.com$/.test(email);
    const isValidCameroonPhone = (num) =>
      /^(\+?237)((6(70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89))|(65[0-9])|(69[1-9])|(62[0-3]))\d{6}$/.test(
        num
      );

    const emailIsValid = isValidEmail(formData.email);
    const phoneIsValid = isValidCameroonPhone(formData.phoneno);

    setEmailError(emailIsValid ? "" : "Please enter a valid email address.");
    setPhoneError(phoneIsValid ? "" : "Invalid phone number!");

    if (!emailIsValid || !phoneIsValid) {
      setSubmitting(false);
      return;
    }

    // Bundle habbits into one JSON string
    const habbitsPayload = {
      agerange: formData.agerange,
      gender: formData.gender,
      pet: formData.pet,
      latenights: formData.latenights,
      smoking: formData.smoking,
      drinking: formData.drinking,
      guests: formData.guests,
      noisetolerance: formData.noisetolerance,
      religion: formData.religion,
      occupation: formData.occupation,
    };
    payload.append("habbits", JSON.stringify(habbitsPayload));

    // Add image (if present)
    if (formData.profilepicture) {
      payload.append("profile_picture", formData.profilepicture);
    }

    // Example: POST to a server
    try {
      //http://localhost:8084/user/profile
      const response = await fetch(
        "https://api.cribconnect.xyz/v1/user/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        }
      );
      if (!response.ok) {
        setMessage({message:"Failed to save profile", type: "error"});
      }

       await response.json();
      setMessage({message:"✅ Profile saved successfully!", type: "success"});
      // console.log("Server response:", data);
    } catch (err) {
      //console.error("Save error:", err);
      setMessage({message:"❌ Something went wrong. Please try again.", type: "error"});
    } finally {
      setSubmitting(false);
    }
  };

  const handleCropConfirm = async () => {
  try {
    const blob = await getCroppedImage(imageSrc, croppedAreaPixels);
    const mimeType = blob?.type || 'image/jpeg';
const extension = mimeType === 'image/png' ? 'png' : 'jpg';

const file = new File([blob], `profile.${extension}`, { type: mimeType });

    const previewURL = URL.createObjectURL(blob);

    setFormData((prev) => ({
      ...prev,
      profilepicture: file,
      profile_preview: previewURL,
    }));

    setIsCropping(false);
    setImageSrc(null);
    setShowModal(false);
  } catch (err) {
    alert('Failed to crop image.');
    console.error(err);
  }
};


  //  Remove/reset profile photo
  const handleRemovePhoto = () => {
  setFormData((prev) => ({
    ...prev,
    profilepicture: null,
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


  if (isLoading) return <LoadingSpinner message="Loading your profile..." />;
  return (
    <>
     <Navbar />
      <header className="hero">
        <h1>The changes you make will determine your potential roommate(s)</h1>
        <div className="profile-container">
          <img
            src={
              typeof formData.profilepicture === "string"
                ? formData.profilepicture
                : formData.profilepicture
                ? URL.createObjectURL(formData.profilepicture)
                : "/path-to-profile.jpg"
            }
            alt="User Profile"
            className="profile-pic"
            onClick={() => fileInputRef.current.click()}
          />

          {/* Icon hangs off the image */}
          <label htmlFor="imageUpload" className="profile-icon">
            📷
          </label>

          {/* Hidden input trigger */}
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
            {( formData.profilepicture || ( formData.profile_preview && !isCropping ) ) && (
          <div className="previewimage">
            
            <button type="button" className='remove-btn' onClick={handleRemovePhoto}>Remove Photo</button>
          </div>
        )}

          
        
        </div>
           { isCropping && imageSrc &&  showModal && (
        <div className="modal-overlay" onClick={() => setIsCropping(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
             <div className="crop-container">
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
            <div className="modal-buttons">
              <button className="bt" onClick={handleCropConfirm}>Crop</button>
              <button className="btz" onClick={() => setIsCropping(false)}>Delete</button>
            </div>
          </div>
        </div>
      )}
      </header>
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-section personal">
          <h2>Personal Details</h2>
          <input
            type="text"
            placeholder="First Name"
            name="fname"
            value={formData.fname}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Last Name"
            name="lname"
            value={formData.lname}
            onChange={handleInputChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            required
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          {emailError && <div className="error-message">{emailError}</div>}

          <PhoneInput
            country={"cm"} // Cameroon
            onlyCountries={["cm"]} 
            masks={{ cm: ".... ......" }}
            disableDropdown={true}
            countryCodeEditable={false}
            value={formData.phoneno}
            onChange={(phone) => {
              setFormData((prev) => ({ ...prev, phoneno: phone })); // always attach prefix
              console.log("Phone input value:", phone);
            }}
            inputProps={{
              name: "phoneno",
              required: true,
              autoFocus: false,
            }}
            inputStyle={{
              paddingLeft: "50px", 
            }}
            placeholder="+237 6xx xxx xxx"
          />
          {phoneError && <div className="error-message">{phoneError}</div>}

          <input
            type="date"
            placeholder="Birthdate"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleInputChange}
            max={maxDate}
          />

          {/* About Me Section */}
          <div className="form-section about-me">
            <h2>Bio</h2>
            <textarea
              name="bio"
              value={formData.bio}
              placeholder="Tell us a bit about yourself..."
              rows="6"
              onChange={handleBioChanges}
            />
          </div>
             <div className="char-feedback">
               {bioLength} / 300
              {isBioInvalid && (
                <span className="feedback">
                  Your bio must be between 30 and 300 non‐whitespace characters.
                </span>
              )}
            </div>
        </div>

        <div className="form-section habbits">
          {!isLoading && progressPercent > 0 && (
            <div className="progress-banner">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor:
                      progressPercent === 100
                        ? "#4CAF50"
                        : progressPercent < 34
                        ? "#FF4C4C"
                        : "#0E4C92",
                  }}
                ></div>
              </div>
              <p className="progress-text">
                {progressPercent === 100
                  ? "🎉 Profile Complete!"
                  : `Progress: ${progressPercent}%`}
              </p>
            </div>
          )}
        
          <h2>About You 😎</h2>
          <div className="preferences">
             {[
               { name: 'agerange', placeholder: 'Your age range', options: ['18-21', '22-25', '26-29', '30-33'] },
               { name: 'gender', placeholder: 'Your gender', options: ['Male', 'Female'] },
               { name: 'pet', placeholder: 'Pets friendly?', options: ['Yes', 'No'] },
               { name: 'latenights', placeholder: 'Late nights?', options: ['Rarely', 'Sometimes', 'Often'] },
               { name: 'smoking', placeholder: 'Do you smoke?', options: ['Yes', 'No'] },
               { name: 'drinking', placeholder: 'How often do you drink?', options: ['Rarely', 'Sometimes', 'Often'] },
               { name: 'guests', placeholder: 'Guest Policy', options: ['Rarely', 'Sometimes', 'Often'] },
               { name: 'noisetolerance', placeholder: 'Noise Tolerance', options: ['Low', 'Medium', 'High'] },
               { name: 'religion', placeholder: 'Religion', options: ['Christian', 'Muslim'] },
               { name: 'occupation', placeholder: 'Occupation', options: ['Student', 'Worker'] },
             ].map(field => (
                 <div className="select-field" key={field.name}>
                  <label htmlFor={field.name}>{field.placeholder}</label>
               <select
                 id={field.name}
                 name={field.name}
                 value={formData[field.name]}
                 onChange={handleInputChange}
               >
                 <option value="" hidden>
                 </option>
                 {field.options.map(opt => (
                   <option key={opt} value={opt}>{opt}</option>
                 ))}
               </select>
               </div>
             ))}
           </div>
          
        </div>
    </form>
        <div className="submit-wrapper">
          <button
            className="submit-btn"
            disabled={progressPercent < 100 || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Updating..." : "Update Profile"}
          </button>
          
            <MessageBanner 
            message={message.message} 
            type={message.type} 
            clear={() => setMessage({ message: "", type: "info" })} />
          
             {feedback && (
            <p className="feedback">{feedback}</p>
            )}
          
        </div>
    </>
  );
};

export default ProfilePage;
