// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApDxpa0ialxo6_8xowtTG4TIBSm6AWvgc",
  authDomain: "roommate-finder-6f8ef.firebaseapp.com",
  projectId: "roommate-finder-6f8ef",
  storageBucket: "roommate-finder-6f8ef.firebasestorage.app",
  messagingSenderId: "566044058086",
  appId: "1:566044058086:web:6d621efd77114ca63e3627",
  measurementId: "G-6W9BEVP4CL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);