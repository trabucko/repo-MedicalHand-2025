// src/assets/components/Toolbar/Toolbar.jsx
import React, { useState } from "react";
import { FaPlus, FaUsers, FaChartBar, FaCalendarAlt } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom"; // Cambia Link por useNavigate
import "./admin_tools.css";
import CreateUserMonitorTool from "./createUserMonitor/createUserMonitorTool";
import CreateUserDoctorTool from "./createUserDoctor/createUserDoctorTool"; // Añade esta importación
const AdminTools = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Usa useNavigate en lugar de Link
  const [activeContent, setActiveContent] = useState("crear-monitor");

  // Determinar el contenido activo basado en la ruta actual
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes("crear-monitor")) {
      setActiveContent("crear-monitor");
    } else if (path.includes("crear-doctor")) {
      setActiveContent("crear-doctor");
    } else if (path.includes("crear-administrador")) {
      setActiveContent("crear-administrador");
    } else if (path.includes("consultorios")) {
      setActiveContent("consultorios");
    } else if (path.includes("reportes")) {
      setActiveContent("reportes");
    }
  }, [location.pathname]);

  const handleItemClick = (contentKey) => {
    setActiveContent(contentKey);
    // Navegar a la ruta correspondiente
    navigate(`/administracion/${contentKey}`);
  };

  // Renderizar el contenido según la opción activa
  const renderContent = () => {
    switch (activeContent) {
      case "crear-monitor":
        return (
          <div className="content-panel">
            <CreateUserMonitorTool />
          </div>
        );
      case "crear-doctor":
        return (
          <div className="content-panel">
            <CreateUserDoctorTool /> {/* Reemplaza el contenido anterior */}
          </div>
        );
      case "crear-administrador":
        return (
          <div className="content-panel">
            <h3>Crear Administrador</h3>
            <p>Formulario para agregar nuevos administradores al sistema.</p>
            {/* Aquí iría el formulario para crear administrador */}
          </div>
        );
      case "consultorios":
        return (
          <div className="content-panel">
            <h3>Gestión de Consultorios</h3>
            <p>Administra los consultorios disponibles.</p>
            {/* Contenido de consultorios */}
          </div>
        );
      case "reportes":
        return (
          <div className="content-panel">
            <h3>Reportes del Sistema</h3>
            <p>Genera y visualiza reportes del sistema.</p>
            {/* Contenido de reportes */}
          </div>
        );
      default:
        return (
          <div className="content-panel welcome">
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
            {/* Cambia Link por div con onClick */}
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

            <div
              className={`menu-item ${
                activeContent === "crear-administrador" ? "active" : ""
              }`}
              onClick={() => handleItemClick("crear-administrador")}
            >
              <div className="menu-item-content">
                <div className="icon-wrapper">
                  <FaPlus className="menu-icon" />
                </div>
                <span className="menu-text">Crear Administrador</span>
              </div>
              <div className="active-indicator"></div>
            </div>

            <div
              className={`menu-item ${
                activeContent === "consultorios" ? "active" : ""
              }`}
              onClick={() => handleItemClick("consultorios")}
            >
              <div className="menu-item-content">
                <div className="icon-wrapper">
                  <FaCalendarAlt className="menu-icon" />
                </div>
                <span className="menu-text">Gestión de Consultorios</span>
              </div>
              <div className="active-indicator"></div>
            </div>

            <div
              className={`menu-item ${
                activeContent === "reportes" ? "active" : ""
              }`}
              onClick={() => handleItemClick("reportes")}
            >
              <div className="menu-item-content">
                <div className="icon-wrapper">
                  <FaChartBar className="menu-icon" />
                </div>
                <span className="menu-text">Reportes</span>
              </div>
              <div className="active-indicator"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container">{renderContent()}</div>
    </div>
  );
};

export default AdminTools;
