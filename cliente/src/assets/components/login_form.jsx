import React, { useState } from "react";
import styled from "styled-components";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // <-- usamos el contexto

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { setUser, setClaims } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Forzar refresh token para obtener claims
      const tokenResult = await userCredential.user.getIdTokenResult(true);

      // Actualizamos el contexto
      setUser(userCredential.user);
      setClaims(tokenResult.claims);

      // Redirigimos al dashboard/inicio
      navigate("/inicio");
    } catch (err) {
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Correo o contraseña incorrecta, vuelva a intentarlo");
      } else if (err.code === "auth/invalid-email") {
        setError("Correo inválido, vuelva a intentarlo");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <StyledWrapper>
      <div className="container">
        <form className="form" onSubmit={handleLogin}>
          <div className="form_front">
            <div className="form_details">Iniciar Sesión</div>

            <label>Correo Electronico:</label>
            <input
              placeholder="Correo Electronico"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Contraseña:</label>
            <input
              placeholder="Contraseña"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="btn" type="submit">
              Entrar
            </button>

            {error && (
              <p
                style={{ color: "rgba(235, 91, 103, 1)", textAlign: "center" }}
              >
                {error}
              </p>
            )}

            <span className="switch">
              En caso de no tener cuenta, contactese con su administrador
            </span>
          </div>
        </form>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
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
    border-bottom: 2px solid #3eb489;
    margin-top: -2rem;
  }

  .input::placeholder {
    color: #999;
  }

  .input:focus.input::placeholder {
    transition: 0.3s;
    opacity: 0;
  }

  .btn {
    padding: 10px 35px;
    cursor: pointer;
    background-color: #39786eff;
    margin-top: 1rem;
    border-radius: 15px;
    border: none;
    width: 70%;
    color: #fff;
    font-size: 15px;
    font-weight: bold;
    transition: 0.35s;
  }

  .btn:hover {
    transform: scale(1.05);
    background-color: #338f80ff;
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

    text-align: center; /* centrado horizontal */
    color: #ffffff; /* blanco sobre el overlay */
    font-size: 2rem; /* tamaño grande */
    margin-bottom: 2rem; /* separa del formulario */
    font-weight: 700;
  }
`;
