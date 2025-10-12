import React, { useState } from "react";
import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom"; // Se usa NavLink para los estilos activos
import { useAuth } from "../../context/AuthContext.jsx";

import logo from "../../../assets/img/logo_blanco.png";
import Hamburguer from "../menu_hamburguesa/menu.jsx";
import {
  FaHistory,
  FaUserCog,
  FaSignOutAlt,
  FaHospital,
  FaChevronRight,
  FaChartBar,
  FaFileMedical,
  FaClipboardList,
  FaHeart,
  FaChild,
  FaBone,
} from "react-icons/fa";
import { GiPc } from "react-icons/gi";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Datos del usuario desde el contexto
  const isAdmin = user?.claims?.role === "hospital_administrador";
  const fullName = user?.fullName || "Usuario";
  const hospitalName = user?.hospitalName || "Hospital";
  const role = user?.claims?.role || "Rol";

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/"); // Redirige al login tras cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Evita renderizar el componente si el usuario aún no ha cargado
  if (!user?.fullName) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src={logo} alt="Logo" className="logo" />
        </div>

        {/* --- ENLACES DE NAVEGACIÓN PRINCIPAL --- */}
        <div className="navbar-links">
          {/* Enlace al Panel Principal */}
          <NavLink
            to="/consulta-externa"
            end // La prop 'end' es crucial para que no se mantenga activo en rutas hijas
            className={({ isActive }) =>
              `navbar-btn ${isActive ? "active" : ""}`
            }
          >
            <FaChartBar className="nav-icon" /> Panel
          </NavLink>

          {/* Enlace a Expedientes */}
          <NavLink
            to="/consulta-externa/expedientes" // Ruta anidada correcta
            className={({ isActive }) =>
              `navbar-btn ${isActive ? "active" : ""}`
            }
          >
            <FaFileMedical className="nav-icon" /> Expedientes
          </NavLink>

          {/* Enlace a Reportes */}
          <NavLink
            to="/consulta-externa/reportes" // Asegúrate de que esta ruta exista en App.jsx
            className={({ isActive }) =>
              `navbar-btn ${isActive ? "active" : ""}`
            }
          >
            <FaClipboardList className="nav-icon" /> Reportes
          </NavLink>

          {/* Enlace condicional para Administración */}
          {isAdmin && (
            <NavLink
              to="/administracion"
              className={({ isActive }) =>
                `navbar-btn ${isActive ? "active" : ""}`
              }
            >
              <FaUserCog className="nav-icon" /> Administración
            </NavLink>
          )}
        </div>

        <Hamburguer onClick={toggleMenu} isOpen={isOpen} />
      </div>

      {/* --- SIDEBAR (MENÚ HAMBURGUESA) --- */}
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

        {/* Menús del sidebar con dropdowns */}
        <div className="sidebar-menu">
          {/* Dropdown de Consulta Externa */}
          <div className="sidebar-dropdown">
            <button
              className="sidebar-btn dropdown-toggle"
              onClick={() => toggleDropdown("sidebar-consulta")}
            >
              <GiPc className="sidebar-icon" /> Consulta Externa
              <FaChevronRight
                className={`dropdown-arrow-sidebar ${
                  activeDropdown === "sidebar-consulta" ? "rotated" : ""
                }`}
              />
            </button>
            <div
              className={`dropdown-content-sidebar ${
                activeDropdown === "sidebar-consulta" ? "show" : ""
              }`}
            >
              <button
                className="dropdown-item-sidebar"
                onClick={() => navigate("/consulta-externa")}
              >
                <FaChartBar className="dropdown-icon" /> Panel Principal
              </button>
              <button
                className="dropdown-item-sidebar"
                onClick={() => navigate("/consulta-externa/expedientes")}
              >
                <FaFileMedical className="dropdown-icon" /> Expedientes
              </button>
              <button
                className="dropdown-item-sidebar"
                onClick={() => navigate("/consulta-externa/reportes")}
              >
                <FaClipboardList className="dropdown-icon" /> Reportes
              </button>
            </div>
          </div>

          {/* Dropdown de Especialidades */}
          <div className="sidebar-dropdown">
            <button
              className="sidebar-btn dropdown-toggle"
              onClick={() => toggleDropdown("sidebar-especialidades")}
            >
              <FaHistory className="sidebar-icon" /> Especialidades
              <FaChevronRight
                className={`dropdown-arrow-sidebar ${
                  activeDropdown === "sidebar-especialidades" ? "rotated" : ""
                }`}
              />
            </button>
            <div
              className={`dropdown-content-sidebar ${
                activeDropdown === "sidebar-especialidades" ? "show" : ""
              }`}
            >
              <button
                className="dropdown-item-sidebar"
                onClick={() => navigate("/especialidades")}
              >
                <FaChartBar className="dropdown-icon" /> Panel Principal
              </button>
              <button
                className="dropdown-item-sidebar"
                onClick={() => navigate("/cardiologia")}
              >
                <FaHeart className="dropdown-icon" /> Cardiología
              </button>
              <button
                className="dropdown-item-sidebar"
                onClick={() => navigate("/pediatria")}
              >
                <FaChild className="dropdown-icon" /> Pediatría
              </button>
              <button
                className="dropdown-item-sidebar"
                onClick={() => navigate("/traumatologia")}
              >
                <FaBone className="dropdown-icon" /> Traumatología
              </button>
            </div>
          </div>

          {isAdmin && (
            <button
              className="sidebar-btn"
              onClick={() => navigate("/administracion")}
            >
              <FaUserCog className="sidebar-icon" /> Administración
            </button>
          )}

          <button className="sidebar-btn logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="sidebar-icon" /> Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
