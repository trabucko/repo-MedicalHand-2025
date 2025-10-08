import React, { useState } from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

import logo from "../../../assets/img/logo_blanco.png";
import Hamburguer from "../menu_hamburguesa/menu.jsx";
import { FaHistory, FaUserCog, FaSignOutAlt, FaHospital } from "react-icons/fa";
import { GiPc } from "react-icons/gi";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Se obtienen los datos directamente del objeto `user` del contexto.
  const isAdmin = user?.claims?.role === "hospital_administrador";
  const fullName = user?.fullName || "Usuario";
  const hospitalName = user?.hospitalName || "Hospital";
  const role = user?.claims?.role || "Rol";

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/"); // Redirige a la página principal o de login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // FIX: Si el usuario aún no se ha cargado por completo, no renderizamos el contenido
  if (!user?.fullName) {
    return null; // Evita mostrar "Usuario" por defecto mientras carga
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="navbar-links">
          <a className="navbar-btn" onClick={() => navigate("/ConsultaExt")}>
            Consulta Externa
          </a>
          <a className="navbar-btn" onClick={() => navigate("/historial")}>
            Especialidades
          </a>
          {isAdmin && (
            <a className="navbar-btn" onClick={() => navigate("/Admin")}>
              Administración
            </a>
          )}
        </div>
        <Hamburguer onClick={toggleMenu} isOpen={isOpen} />
      </div>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src={logo} alt="MedicalHand Logo" className="sidebar-logo" />
          <div className="sidebar-title">
            <span className="medical">
              Medical<span className="hand">Hand</span>
            </span>
          </div>
        </div>
        <div className="sidebar-profile">
          <div className="user-info-item">
            <div className="info-icon">
              <FaUserCog className="sidebar-icon" />
            </div>
            <div className="info-content">
              <div className="info-label">Usuario</div>
              <div className="info-value">{fullName}</div>
            </div>
          </div>
          <div className="user-info-item hospital">
            <div className="info-icon">
              <FaHospital className="sidebar-icon" />
            </div>
            <div className="info-content">
              <div className="info-label">Hospital</div>
              <div className="info-value">{hospitalName}</div>
            </div>
          </div>
          <div className="user-info-item role">
            <div className="info-icon">
              <FaUserCog className="sidebar-icon" />
            </div>
            <div className="info-content">
              <div className="info-label">Rol</div>
              <div className="info-value">{role}</div>
            </div>
          </div>
        </div>

        {/* --- MENÚS RESTAURADOS --- */}
        <button
          className="sidebar-btn"
          onClick={() => navigate("/ConsultaExt")}
        >
          <GiPc className="sidebar-icon" /> Consulta Externa
        </button>
        <button className="sidebar-btn" onClick={() => navigate("/historial")}>
          <FaHistory className="sidebar-icon" /> Especialidades
        </button>
        {isAdmin && (
          <button className="sidebar-btn" onClick={() => navigate("/Admin")}>
            <FaUserCog className="sidebar-icon" /> Administración
          </button>
        )}
        <button className="sidebar-btn logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="sidebar-icon" /> Cerrar sesión
        </button>
        {/* --- FIN DE MENÚS RESTAURADOS --- */}
      </div>
    </nav>
  );
};

export default Navbar;
