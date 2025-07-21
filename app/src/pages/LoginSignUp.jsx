//LoginSignup.jsx 
import React, { useContext, useState } from 'react'; 
import { FcGoogle } from 'react-icons/fc';
import '../styles/LoginSignup.css'; // for styling
import { useNavigate } from 'react-router-dom'; 
import { Link } from 'react-router-dom';
import {  loginWithGoogle } from '../features/auth/firebaseAuth';
import { AuthContext } from '../context/AuthContext';

import Button from '../assets/components/Button';
import MessageBanner from '../assets/components/MessageBanner';
import { evaluatePasswordStrength } from '../utils/passwordStrength';

const LoginSignup = () => { 
 const [isRightPanelActive, setIsRightPanelActive] = useState(false);
// const [email, setEmail] = useState('');
//  const [password, setPassword] = useState('');
const [signUpEmail, setSignUpEmail] = useState('');
const [signUpPassword, setSignUpPassword] = useState('');
const [signInEmail, setSignInEmail] = useState('');
const [signInPassword, setSignInPassword] = useState('');
const [showSignUpPassword, setShowSignUpPassword] = useState(false);
const [showSignInPassword, setShowSignInPassword] = useState(false);
const [signUpStrength, setSignUpStrength] = useState({ level: '', color: '' });



 const navigate = useNavigate(); 

 const { setToken, setRefreshToken} = useContext(AuthContext);
  const [messageStatus, setMessageStatus] = useState({ message: '', type: 'info' });
  const [submitting, setSubmitting] = useState(false);

const handleSignUpPasswordChange = (e) => {
  const value = e.target.value;
  setSignUpPassword(value);
  setSignUpStrength(evaluatePasswordStrength(value));
};
 
 const handleGoogleSignIn = async () => {
  try {
    const result = await loginWithGoogle();
    const {isNewUser} = result._tokenResponse;

    if (isNewUser) {
      navigate('/complete-profile');
    } else {
      // setMessage(`Welcome ${result.user.displayName}! 🎉`);
    }
  } catch (error) {
    //setMessage(error.message);
  }
};


const handleSubmit = async (e, isSignUpMode, email, password) => {
    e.preventDefault();
    if (submitting) return;
     const isValidEmail = (email) => /^[A-Za-z0-9._%+-]+@gmail\.com$/.test(email);
      if (!isValidEmail(email)) {
          alert("Please enter a valid email address.");
         return;
        };

        if (isSignUpMode) {
  const strengthScore = evaluatePasswordStrength(password);
  if (strengthScore.level === 'Weak 🔓') {
    setMessageStatus({ message: 'Please choose a stronger password.', type: 'error' });
    return;
  }
}

        setSubmitting(true);

    try { 
      //  "http://localhost:8084/v1/users/register"
      // : "http://localhost:8084/v1/users/login"; 
      const endpoint = isSignUpMode
      ? "https://api.cribconnect.xyz/v1/users/register"
      : "https://api.cribconnect.xyz/v1/users/login";  // double-check this path for consistency
       
       const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }) // properly closed object
    });

    const result = await response.json();

    if (!response.ok) {
      console.log(result.message)
      const msg = result.message ||result.err || "Something went wrong!";
    setMessageStatus({ message: `${msg}`, type: 'error' });
    return;
    }

    if (result.id_token) {
        setToken(result.id_token); // Used for API requests
       setRefreshToken(result.refresh_token); // Used for background token refresh
    }

    if (isSignUpMode) {
       setMessageStatus({ message: "Signup successful!", type: 'success' });
      setTimeout(() => navigate("/complete-profile"), 1500);
    } else {
      navigate("/profile");
      setMessageStatus({ message: "Welcome back! 👋", type: 'success' });
      
    }
  } catch (err) {
    const msg = err.message || 'Unexpected error occurred.';
    setMessageStatus({ message: `${msg}`, type: 'error' });
  } finally {
      setSubmitting(false)
    }
  };


const toggleToSignUp = () => {
  setIsRightPanelActive(true);
  setSignInEmail('');
  setSignInPassword('');
  setMessageStatus({ message: '', type: 'info' });
};

const toggleToSignIn = () => {
  setIsRightPanelActive(false);
  setSignUpEmail('');
  setSignUpPassword('');
  setMessageStatus({ message: '', type: 'info' });
};

return (
  <div className='bigbox'>
             <MessageBanner
                 message={messageStatus.message} 
                 type={messageStatus.type}
                 clear={() => setMessageStatus({message: "", type: 'info'})} 
              />
       {/* <h2>Sign in/up Form</h2> */}
       <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
         {/* Sign Up */}
         <div className="form-container sign-up-container">
           <form onSubmit={(e) => handleSubmit(e, true, signUpEmail, signUpPassword)}>
             <h1>Create Account</h1>
             <input type="email"  autoFocus placeholder="Email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required />
             <div className='password-wrapper'>

            
             <div className="password-field"> 
             <input type={showSignUpPassword ? "text" : "password"} placeholder="Password" value={signUpPassword} onChange={handleSignUpPasswordChange} required />
             <span className="eye-icon" onClick={() => setShowSignUpPassword((prev) => !prev)} >
              {showSignUpPassword ? "🙈" : "👁️"}
             </span>
              </div>
             {signUpPassword && (
              <div className="strength-feedback">
                 <p style={{
                 color: signUpStrength.color,
                 margin: '4px 0',
                 fontWeight: 500,
                  fontSize: '0.9rem'
                       }}>
                    Strength: {signUpStrength.level}
                     </p>
                     </div>
                      )}
             
             </div>
             <p className="or-text">or sign up with Google</p>
             <Button  id="google-signin-btn" onClick={handleGoogleSignIn} ><FcGoogle size={20} /></Button>

             <Button type="submit" disabled={submitting}>
      {submitting ? 'Signing UP...' : 'Sign Up'}</Button>

           </form>
         </div>

         {/* Sign In */}
         <div className="form-container sign-in-container">
           <form onSubmit={(e) => handleSubmit(e, false, signInEmail, signInPassword)}>
             <h1>Sign in</h1>
             <input type="email" autoFocus placeholder="Email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required />
             <div className="password-field"> 
             <input type={showSignInPassword ? "text" : "password"} placeholder="Password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required />
              <span className="eye-icon" onClick={() => setShowSignInPassword((prev) => !prev)}>
                {showSignInPassword ? "🙈" : "👁️"}
              </span>
              </div>
             <div className="social-signin">
             <p className="or-text">or sign in with Google</p>
             <Button  id="google-signin-btn" onClick={handleGoogleSignIn} ><FcGoogle size={20} /></Button>
             </div>
             
             <Link to="/forgot-password" className="forgot-link">Forgot your password?</Link>

             <Button type="submit" disabled={submitting}>
    {submitting ? 'Logging In...' : 'Login'}</Button>
              
           </form>
         </div>

         {/* Overlay */}
         <div className="overlay-container">
           <div className="overlay">
             <div className="overlay-panel overlay-left">
               <h1>Welcome Back!</h1>
               <p>To keep connected with us please login with your personal info</p>
              <Button className="ghost" onClick={toggleToSignIn}>Sign In</Button>
             </div>
             <div className="overlay-panel overlay-right">
               <h1>Hello, Friend!</h1>
               <p>Enter your personal details and start your journey with us</p>
               <Button className="ghost" onClick={toggleToSignUp}>Sign Up</Button>
             </div>
           </div>
         </div>
       </div>
     </div>
); 
};

export default LoginSignup;