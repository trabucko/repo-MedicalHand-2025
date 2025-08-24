import { useState } from "react";
import "./login.css";
import video from "../../video/bg_video.mp4";

// ✅ Importa tu componente Form
import Form from "../../components/login_form.jsx"; // ajusta la ruta según tu proyecto

function Login() {
  return (
    <div className="contenedor-principal">
      <video
        src={video}
        autoPlay
        loop
        muted
        playsInline
        typeof="video/mp4"
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
          <Form />
        </div>
      </div>
    </div>
  );
}

export default Login;
