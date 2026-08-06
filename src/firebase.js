import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
 
const firebaseConfig = {
  apiKey: "AIzaSyDslixA5ZxWs4StacW3GcSrLsEHjKzGtpE",
  authDomain: "safeer-quran-academy.firebaseapp.com",
  projectId: "safeer-quran-academy",
  storageBucket: "safeer-quran-academy.firebasestorage.app",
  messagingSenderId: "871304311017",
  appId: "1:871304311017:web:00c75924e54f5e67720078",
  measurementId: "G-E8GE615RTE"
};
 
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;