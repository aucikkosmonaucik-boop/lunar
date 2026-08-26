import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC19fLh5mCtZxEaLxEilokK2BJ46aQ31tM",
  authDomain: "lunar-store-ecef4.firebaseapp.com",
  projectId: "lunar-store-ecef4",
  storageBucket: "lunar-store-ecef4.firebasestorage.app",
  messagingSenderId: "651131285123",
  appId: "1:651131285123:web:d734bbc9d3c41aa76df5b6",
  measurementId: "G-BPZBMVHFMK"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
