// src/assets/components/Toolbar/Toolbar.jsx

import React, { useState, useEffect } from "react";
import { 
  FaUsers, 
  FaUserMd
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "./admin_tools.css";
import CreateUserMonitorTool from "./createUserMonitor/createUserMonitorTool";
import DoctorManagement from "./Doctor/DoctorManagement";

const AdminTools = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeContent, setActiveContent] = useState("crear-monitor");

  // Sincroniza el estado con la URL al cargar o refrescar
  useEffect(() => {
    const path = location.pathname.split("/").pop();
    const validPaths = [
      "crear-monitor", 
      "crear-doctor"
    ];
    
    if (validPaths.includes(path)) {
      setActiveContent(path);
    } else {
      setActiveContent("crear-monitor");
      navigate("/administracion/crear-monitor", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleItemClick = (contentKey) => {
    setActiveContent(contentKey);
    navigate(`/administracion/${contentKey}`);
  };

  // Configuración de items del menú para mejor mantenibilidad
  const menuItems = [
    {
      key: "crear-monitor",
      icon: FaUsers,
      text: "Crear Monitor",
      description: "Gestionar monitores del sistema"
    },
    {
      key: "crear-doctor",
      icon: FaUserMd,
      text: "Gestión de Doctores",
      description: "Administrar doctores y especialidades"
    }
  ];

  const renderContent = () => {
    switch (activeContent) {
      case "crear-monitor":
        return <CreateUserMonitorTool />;
      case "crear-doctor":
        return <DoctorManagement />;
      default:
        return (
          <div className="welcome content-section">
            <h3>Panel de Administración</h3>
            <p>Selecciona una opción del menú lateral para comenzar.</p>
          </div>
        );
    }
  };

  const getActiveItem = () => {
    return menuItems.find(item => item.key === activeContent) || menuItems[0];
  };

  const activeItem = getActiveItem();

  return (
    <div className="admin-tools-wrapper">
      <div className="toolbar-container">
        <div className="toolbar">
          <div className="toolbar-header">
            <h2>Panel de Administración</h2>
            <div className="toolbar-divider"></div>
          </div>

          <div className="toolbar-menu">
            {menuItems.map((item) => (
              <div
                key={item.key}
                className={`menu-item ${
                  activeContent === item.key ? "active" : ""
                }`}
                onClick={() => handleItemClick(item.key)}
                title={item.description}
              >
                <div className="menu-item-content">
                  <div className="icon-wrapper">
                    <item.icon className="menu-icon" />
                  </div>
                  <div className="menu-text-container">
                    <span className="menu-text">{item.text}</span>
                    <span className="menu-description">{item.description}</span>
                  </div>
                </div>
                <div className="active-indicator"></div>
              </div>
            ))}
          </div>

          <div className="toolbar-footer">
            <div className="user-info">
              <span>Sistema de Gestión Médica</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="content-container">
        <div className="content-header">
          <h1>{activeItem.text}</h1>
          <p>{activeItem.description}</p>
        </div>
        <div className="content-panel">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminTools;