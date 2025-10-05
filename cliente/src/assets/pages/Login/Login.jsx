// src/assets/pages/Login/Login.jsx (VERSIÓN FINAL)

import { useState, useEffect } from "react";
import "./login.css";
import video from "../../video/bg_video.mp4";
import LoginForm from "../../components/login_form.jsx";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
// import { useLoading } from "../../context/LoadingContext.jsx"; // Puedes usarlo si quieres un loader global
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase.js";

function Login() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // ✅ 1. Añade el estado de carga
  const { user } = useAuth();
  const navigate = useNavigate();
  // const { showLoader, hideLoader } = useLoading();

  useEffect(() => {
    if (user && user.claims) {
      const userRole = user.claims.role;
      if (userRole === "hospital_doctor") navigate("/dashboard-doctor");
      else if (userRole === "hospital_administrador")
        navigate("/administracion");
      else navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (email, password) => {
    setError(null);
    setIsLoading(true); // ✅ 2. Activa el estado de carga
    // showLoader(); // Si también quieres un loader global, lo activas aquí

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // El useEffect se encarga de redirigir
    } catch (err) {
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Correo o contraseña incorrecta.");
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      // ✅ 3. Desactiva el estado de carga SIEMPRE (éxito o error)
      setIsLoading(false);
      // hideLoader(); // Y aquí desactivas el loader global
    }
  };

  return (
    <div className="contenedor-principal">
      <video
        src={video}
        autoPlay
        loop
        muted
        playsInline
        className="bg_video"
      ></video>
      <div className="overlay"></div>
      <div className="login-card">
        <div className="titulo">
          <h1>
            Medical<span>Hand</span>
          </h1>
        </div>
        <div className="formulario">
          {/* ✅ 4. Pasa el nuevo estado como prop a LoginForm */}
          <LoginForm
            onLogin={handleLogin}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
