import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css"; // Estilos dedicados para el sidebar

// Asegúrate de que la ruta al logo sea correcta desde esta nueva ubicación
import logo from "../../../assets/img/logo_blanco.png";
import { FaHistory, FaUserCog, FaSignOutAlt, FaHospital } from "react-icons/fa";
import { GiPc } from "react-icons/gi";

const Sidebar = ({
  isOpen,
  fullName,
  hospitalName,
  role,
  isAdmin,
  handleLogout,
}) => {
  const navigate = useNavigate();

  return (
    // El div principal usa la prop 'isOpen' para alternar la clase 'open'
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

      <button className="sidebar-btn" onClick={() => navigate("/ConsultaExt")}>
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
    </div>
  );
};

export default Sidebar;
