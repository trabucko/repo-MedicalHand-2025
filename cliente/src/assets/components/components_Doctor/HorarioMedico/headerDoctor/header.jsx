import React from "react";
import { NavLink, useLocation } from "react-router-dom";

// Iconos de la barra de navegación
import {
  FaBell,
  FaChartLine,
  FaCalendarAlt,
  FaCalendarDay,
  FaUserInjured,
  FaStethoscope,
} from "react-icons/fa";

import "./Header.css";
import MenuHamburguer from "../../../menu_hamburguesa/menu";

const Header = ({ user, toggleSidebar }) => {
  const location = useLocation();

  // Función para verificar si la ruta está activa
  const isActiveRoute = (path) => {
    // Si es la ruta principal, verifica coincidencia exacta
    if (path === "/dashboard-doctor") {
      return location.pathname === path;
    }
    // Para otras rutas, verifica si la ruta actual comienza con el path
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <div className="header-title-group">
            <h1>Panel Médico</h1>
            <p>Bienvenido, Dr. {user?.claims?.name || "Usuario"}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="notification-btn">
            <FaBell />
            <span className="notification-badge">3</span>
          </button>
          <MenuHamburguer onClick={toggleSidebar} />
        </div>
      </header>

      {/* Barra de navegación con NavLink */}
      <nav className="header-sub-nav">
        <NavLink
          to="/dashboard-doctor"
          className={({ isActive }) =>
            isActive ? "header-nav-btn active" : "header-nav-btn"
          }
          end // Esto asegura que solo se active en la ruta exacta
        >
          <FaChartLine /> Resumen
        </NavLink>
        <NavLink
          to="/dashboard-doctor/appointments"
          className={({ isActive }) =>
            isActive ? "header-nav-btn active" : "header-nav-btn"
          }
        >
          <FaCalendarAlt /> Citas
        </NavLink>
        <NavLink
          to="/dashboard-doctor/horario"
          className={({ isActive }) =>
            isActive ? "header-nav-btn active" : "header-nav-btn"
          }
        >
          <FaCalendarDay /> Horario
        </NavLink>
        <NavLink
          to="/dashboard-doctor/patients"
          className={({ isActive }) =>
            isActive ? "header-nav-btn active" : "header-nav-btn"
          }
        >
          <FaUserInjured /> Pacientes
        </NavLink>
        <NavLink
          to="/dashboard-doctor/reports"
          className={({ isActive }) =>
            isActive ? "header-nav-btn active" : "header-nav-btn"
          }
        >
          <FaStethoscope /> Reportes
        </NavLink>
      </nav>
    </>
  );
};

export default Header;
