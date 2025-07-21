import { signInWithEmailAndPassword, createUserWithEmailAndPassword,
     sendPasswordResetEmail, GoogleAuthProvider,
   signInWithPopup } from 'firebase/auth';
import { auth } from '../../services/firebase';

export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken();
  const user = result.user;
  const isNewUser = result._tokenResponse?.isNewUser;
  return { token, user, isNewUser };
};