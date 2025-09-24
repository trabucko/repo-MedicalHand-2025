// src/assets/components/Toolbar/Toolbar.jsx

import React, { useState, useEffect } from "react"; // agregamos useEffect
import { FaPlus, FaUsers, FaChartBar, FaCalendarAlt } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "./admin_tools.css";
import CreateUserMonitorTool from "./createUserMonitor/createUserMonitorTool";
import CreateUserDoctorTool from "./createUserDoctor/createUserDoctorTool";

const AdminTools = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeContent, setActiveContent] = useState("crear-monitor");

  // 👈 sincroniza el estado con la URL al cargar o refrescar
  useEffect(() => {
    const path = location.pathname.split("/").pop(); // obtiene el último segmento de la URL
    setActiveContent(path || "crear-monitor");
  }, [location.pathname]);

  const handleItemClick = (contentKey) => {
    setActiveContent(contentKey);
    navigate(`/administracion/${contentKey}`);
  };

  const renderContent = () => {
    switch (activeContent) {
      case "crear-monitor":
        return <CreateUserMonitorTool />;
      case "crear-doctor":
        return <CreateUserDoctorTool />;
      case "crear-administrador":
        return (
          <>
            <h3>Crear Administrador</h3>
            <p>Formulario para agregar nuevos administradores al sistema.</p>
          </>
        );
      case "consultorios":
        return (
          <>
            <h3>Gestión de Consultorios</h3>
            <p>Administra los consultorios disponibles.</p>
          </>
        );
      case "reportes":
        return (
          <>
            <h3>Reportes del Sistema</h3>
            <p>Genera y visualiza reportes del sistema.</p>
          </>
        );
      default:
        return (
          <div className="welcome">
            <h3>Panel de Administración</h3>
            <p>Selecciona una opción del menú lateral para comenzar.</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-tools-wrapper">
      <div className="toolbar-container">
        <div className="toolbar">
          <div className="toolbar-header">
            <h2>Panel Admin</h2>
            <div className="toolbar-divider"></div>
          </div>

          <div className="toolbar-menu">
            <div
              className={`menu-item ${
                activeContent === "crear-monitor" ? "active" : ""
              }`}
              onClick={() => handleItemClick("crear-monitor")}
            >
              <div className="menu-item-content">
                <div className="icon-wrapper">
                  <FaPlus className="menu-icon" />
                </div>
                <span className="menu-text">Crear Monitor</span>
              </div>
              <div className="active-indicator"></div>
            </div>

            <div
              className={`menu-item ${
                activeContent === "crear-doctor" ? "active" : ""
              }`}
              onClick={() => handleItemClick("crear-doctor")}
            >
              <div className="menu-item-content">
                <div className="icon-wrapper">
                  <FaPlus className="menu-icon" />
                </div>
                <span className="menu-text">Crear Doctor</span>
              </div>
              <div className="active-indicator"></div>
            </div>

            {/* ...y los demás items... */}
          </div>
        </div>
      </div>
      <div className="content-container">
        <div className="content-panel">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminTools;
