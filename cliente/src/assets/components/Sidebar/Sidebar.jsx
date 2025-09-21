import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css"; // Estilos dedicados para el sidebar

// Asegúrate de que la ruta al logo sea correcta
import logo from "../../../assets/img/logo_blanco.png";

// --- Íconos para el Doctor Dashboard ---
import {
  FaTachometerAlt, // para Resumen
  FaCalendarCheck, // para Citas
  FaClock, // para Horario
  FaUsers, // para Pacientes
  FaFileMedicalAlt, // para Reportes
  FaSignOutAlt, // para Cerrar Sesión
  FaHospital,
  FaUserCog,
} from "react-icons/fa";

// Componente Sidebar
const Sidebar = ({ isOpen, fullName, hospitalName, role, handleLogout }) => {
  const navigate = useNavigate();

  // Array para los items de navegación del Doctor. ¡Más fácil de mantener!
  const doctorMenuItems = [
    {
      label: "Resumen",
      icon: <FaTachometerAlt className="sidebar-icon" />,
      path: "/doctor/dashboard", // Ruta de ejemplo
    },
    {
      label: "Citas",
      icon: <FaCalendarCheck className="sidebar-icon" />,
      path: "/doctor/citas",
    },
    {
      label: "Horario",
      icon: <FaClock className="sidebar-icon" />,
      path: "/dashboard-doctor/horario",
    },
    {
      label: "Pacientes",
      icon: <FaUsers className="sidebar-icon" />,
      path: "/doctor/pacientes",
    },
    {
      label: "Reportes",
      icon: <FaFileMedicalAlt className="sidebar-icon" />,
      path: "/doctor/reportes",
    },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* --- Cabecera con Logo y Título --- */}
      <div className="sidebar-header">
        <img src={logo} alt="MedicalHand Logo" className="sidebar-logo" />
        <div className="sidebar-title">
          <span className="medical">
            Medical<span className="hand">Hand</span>
          </span>
        </div>
      </div>

      {/* --- Perfil del Usuario --- */}
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
        {role && (
          <div className="user-info-item role">
            <div className="info-icon">
              <FaUserCog className="sidebar-icon" />
            </div>
            <div className="info-content">
              <div className="info-label">Rol</div>
              <div className="info-value">{role}</div>
            </div>
          </div>
        )}
      </div>

      {/* --- Menú de Navegación Principal --- */}
      <nav className="sidebar-menu">
        {doctorMenuItems.map((item, index) => (
          <button
            key={index}
            className="sidebar-btn"
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* --- Pie de Sidebar (Logout) --- */}
      <div className="sidebar-footer">
        <button className="sidebar-btn logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="sidebar-icon" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
