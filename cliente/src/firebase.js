// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
export const auth = getAuth(app);

export default app;
