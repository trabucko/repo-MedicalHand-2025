import React, { useState } from "react";
import styled from "styled-components";

// ✅ El componente ya recibe `isLoading` como prop
export default function LoginForm({ onLogin, error, isLoading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // No llama a onLogin si ya está cargando
    if (isLoading) return;
    onLogin(email, password);
  };

  return (
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form_front">
          <div className="form_details">Iniciar Sesión</div>
          <label>Correo Electronico:</label>
          <input
            placeholder="Correo Electronico"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            // ✅ Deshabilita el input mientras carga
            disabled={isLoading}
          />
          <label>Contraseña:</label>
          <input
            placeholder="Contraseña"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            // ✅ Deshabilita el input mientras carga
            disabled={isLoading}
          />

          {/* ✅ 1. Botón condicional */}
          <button className="btn" type="submit" disabled={isLoading}>
            {isLoading ? <div className="loader"></div> : "Entrar"}
          </button>

          {error && (
            <p style={{ color: "rgba(235, 91, 103, 1)", textAlign: "center" }}>
              {error}
            </p>
          )}
          <span className="switch">
            En caso de no tener cuenta, contactese con su administrador
          </span>
        </div>
      </form>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* ... (tu código de estilo de container, form, etc. no cambia) */

  .container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .form {
    display: flex;
    justify-content: center;
    align-items: center;
    transform-style: preserve-3d;
    transition: all 1s ease;
    width: 30rem;
  }

  .form:hover {
    box-shadow: 0 5px 20px rgba(28, 104, 100, 0.67);
  }

  span {
    font-size: 40px;
  }

  label {
    display: flex;
    justify-content: start;
    width: 39vh;
  }

  .form .form_front {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 30px;
    width: 30rem;
    position: absolute;
    backface-visibility: hidden;
    padding: 65px 45px;
    border-radius: 15px;
    background-color: rgba(0, 0, 0, 0.58);
  }

  .form .form_back {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    position: absolute;
    backface-visibility: hidden;
    transform: rotateY(-180deg);
    padding: 65px 45px;
    border-radius: 15px;
    box-shadow: inset 2px 2px 10px rgba(0, 0, 0, 1),
      inset -1px -1px 5px rgba(255, 255, 255, 0.6);
  }

  .form_details {
    font-size: 25px;
    font-weight: 600;
    padding-bottom: 10px;
    margin-bottom: 1.5rem;
    color: white;
  }

  .input {
    width: 40vh;
    min-height: 45px;
    color: #fff;
    outline: none;
    transition: 0.35s;
    padding: 0px 7px;
    background-color: #21212128;
    border-radius: 0px;
    border: none;
    border-bottom: 2px solid #5b648fff;
    margin-top: -2rem;
  }

  .input::placeholder {
    color: #999;
  }

  .input:focus.input::placeholder {
    transition: 0.3s;
    opacity: 0;
  }

  /* ✅ 2. Estilos actualizados para el botón */
  .btn {
    padding: 10px 35px;
    cursor: pointer;
    background-color: #395378ff;
    margin-top: 1rem;
    border-radius: 15px;
    border: none;
    width: 70%;
    color: #fff;
    font-size: 15px;
    font-weight: bold;
    transition: 0.35s;

    /* Añadido para centrar el loader y evitar que el botón cambie de tamaño */
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 45px;
  }

  .btn:hover {
    transform: scale(1.05);
    background-color: #335e8fff;
  }

  /* ✅ Estilo para el botón cuando está deshabilitado */
  .btn:disabled {
    background-color: #304ea1ff; /* Un tono más oscuro/apagado */
    cursor: not-allowed;
    transform: none; /* Evita el efecto hover al estar deshabilitado */
  }

  /* ✅ 3. Estilos para el spinner */
  .loader {
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-left-color: #fff;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .form .switch {
    font-size: 0.89rem;
    width: 95%;
    color: white;
    text-align: center;
  }

  .form .switch .signup_tog {
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
  }

  .container #signup_toggle {
    display: none;
  }

  .container #signup_toggle:checked + .form {
    transform: rotateY(-180deg);
  }

  h1 {
    display: flex;
    justify-content: start;
    height: 1.5vh;

    text-align: center;
    color: #ffffff;
    font-size: 2rem;
    margin-bottom: 2rem;
    font-weight: 700;
  }
`;
