import { signInWithEmailAndPassword, createUserWithEmailAndPassword,
     sendPasswordResetEmail, GoogleAuthProvider,
   signInWithPopup } from 'firebase/auth';
import { auth } from '../../services/firebase';

export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};