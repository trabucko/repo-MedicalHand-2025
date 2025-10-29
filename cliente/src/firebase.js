import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- ADD THIS LINE
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDZUnijXo8PvvZgDVjiXgFXoxH1qEvd0aY",
  authDomain: "medicalhand-f2fd3.firebaseapp.com",
  projectId: "medicalhand-f2fd3",
  storageBucket: "medicalhand-f2fd3.firebasestorage.app",

  messagingSenderId: "818500504209",
  appId: "1:818500504209:web:06ae6eafca3ac3a6cc8d30",
  measurementId: "G-Y6XLBT24BE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, "medicalhand");
const storage = getStorage(app);

// Exporta todo junto al final
export { app, auth, db, storage };
