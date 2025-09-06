import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDZUnijXo8PvvZgDVjiXgFXoxH1qEvd0aY",
  authDomain: "medicalhand-f2fd3.firebaseapp.com",
  projectId: "medicalhand-f2fd3",
  storageBucket: "medicalhand-f2fd3.appspot.com", // Corregido el dominio a .appspot.com
  messagingSenderId: "818500504209",
  appId: "1:818500504209:web:06ae6eafca3ac3a6cc8d30",
  measurementId: "G-Y6XLBT24BE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Exporta todo junto al final
export { app, auth };
