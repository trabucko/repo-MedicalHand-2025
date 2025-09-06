// src/assets/pages/Login/Login.jsx (VERSIÓN CON LÓGICA)

import { useState, useEffect } from "react";
import "./login.css";
import video from "../../video/bg_video.mp4";
import LoginForm from "../../components/login_form.jsx"; // Renombrado para claridad

// ✅ Importa todo lo que quitamos del formulario
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLoading } from "../../context/LoadingContext.jsx";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase.js";

function Login() {
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoading();

  // ✅ El useEffect para la redirección automática VIVE AQUÍ AHORA
  useEffect(() => {
    if (user && user.claims) {
      const userRole = user.claims.role;
      if (userRole === "hospital_doctor") navigate("/dashboard-doctor");
      else if (userRole === "hospital_administrador")
        navigate("/administracion");
      else navigate("/"); // Fallback
    }
  }, [user, navigate]);

  // ✅ La función que llama a Firebase VIVE AQUÍ AHORA
  const handleLogin = async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // No necesitamos hacer nada más, el useEffect se encargará de redirigir
    } catch (err) {
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Correo o contraseña incorrecta.");
      } else {
        setError("Ocurrió un error inesperado.");
      }
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
          {/* ✅ Pasamos la función y el error como props al formulario */}
          <LoginForm onLogin={handleLogin} error={error} />
        </div>
      </div>
    </div>
  );
}

export default Login;
