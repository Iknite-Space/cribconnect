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

const LoginSignup = () => { 
 const [isRightPanelActive, setIsRightPanelActive] = useState(false);
const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const navigate = useNavigate(); 

 const { setToken} = useContext(AuthContext)
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false)


 
 const handleGoogleSignIn = async () => {
  try {
    const result = await loginWithGoogle();
    const {isNewUser} = result._tokenResponse;

    if (isNewUser) {
      navigate('/complete-profile');
    } else {
       setMessage(`Welcome ${result.user.displayName}! 🎉`);
    }
  } catch (error) {
    setMessage(error.message);
  }
};


const handleSubmit = async (e, isSignUpMode) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const endpoint = isSignUpMode
      ? "http://localhost:8081/users/register"
      : "http://localhost:8081/user/login";  // double-check this path for consistency
        const isValidEmail = (email) => /^[A-Za-z0-9._%+-]+@gmail\.com$/.test(email);
      if (!isValidEmail(email)) {
          alert("Please enter a valid email address.");
         return;
        }
       const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }) // properly closed object
    });

    const result = await response.json();
    console.log(result);

    if (!response.ok) {
      throw new Error(result.message || "Something went wrong");
    }

    console.log("Server response:", result);

    if (result.id_token) {
        setToken(result.id_token); // <-- set here
    }

    if (isSignUpMode) {
      navigate("/complete-profile");
    } else {
      setMessage("Welcome back! 👋");
      navigate("/profile");
    }
  } catch (err) {
    alert(err.message);
  } finally {
      setSubmitting(false)
    }
  };




return (
  <div className='bigbox'>
       {/* <h2>Sign in/up Form</h2> */}
       <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
         {/* Sign Up */}
         <div className="form-container sign-up-container">
           <form onSubmit={(e) => handleSubmit(e, true)}>
             <h1>Create Account</h1>
             <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
             <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
             <p className="or-text">or sign up with Google</p>
             <Button  id="google-signin-btn" onClick={handleGoogleSignIn} ><FcGoogle size={20} /></Button>
             <Button type="submit" disabled={submitting}>
  {submitting ? 'Signing UP...' : 'Sign Up'}</Button>
           <MessageBanner message={message} clear={() => setMessage('')} />

           </form>
         </div>

         {/* Sign In */}
         <div className="form-container sign-in-container">
           <form onSubmit={(e) => handleSubmit(e, false)}>
             <h1>Sign in</h1>
             <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
             <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
             <div className="social-signin">
             <p className="or-text">or sign in with Google</p>
             <Button  id="google-signin-btn" onClick={handleGoogleSignIn} ><FcGoogle size={20} /></Button>
             </div>
             
             <Link to="/forgot-password" className="forgot-link">Forgot your password?</Link>
             <Button type="submit" disabled={submitting}>
  {submitting ? 'Loggin In...' : 'Login'}</Button>
              {message && (
             <div className="top-left-message">
                     {message}
                  </div>
             )}
           </form>
         </div>

         {/* Overlay */}
         <div className="overlay-container">
           <div className="overlay">
             <div className="overlay-panel overlay-left">
               <h1>Welcome Back!</h1>
               <p>To keep connected with us please login with your personal info</p>
              <Button className="ghost" onClick={() => setIsRightPanelActive(false)}>Sign In</Button>
             </div>
             <div className="overlay-panel overlay-right">
               <h1>Hello, Friend!</h1>
               <p>Enter your personal details and start your journey with us</p>
               <Button className="ghost" onClick={() => setIsRightPanelActive(true)}>Sign Up</Button>
             </div>
           </div>
         </div>
       </div>
     </div>
); 
};

export default LoginSignup;