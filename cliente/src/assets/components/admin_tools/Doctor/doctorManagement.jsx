// src/assets/components/Toolbar/Doctor/DoctorManagement.jsx

import React, { useState } from "react";
import { FaUserPlus, FaUserEdit, FaUserTimes, FaStethoscope } from "react-icons/fa";
import CreateUserDoctorTool from "./Create/createUserDoctorTool";
import UpdateDoctorTool from "./Update/UpdateDoctorTool";
import DeleteDoctorTool from "./Delete/DeleteDoctorTool";
import "./DoctorManagement.css";

const DoctorManagement = () => {
  const [activeTab, setActiveTab] = useState("create");

  const tabs = [
    {
      id: "create",
      label: "Crear Doctor",
      icon: FaUserPlus,
      description: "Agregar nuevo doctor al sistema"
    },
    {
      id: "update",
      label: "Actualizar Doctor",
      icon: FaUserEdit,
      description: "Editar información de doctor existente"
    },
    {
      id: "delete",
      label: "Eliminar Doctor",
      icon: FaUserTimes,
      description: "Remover doctor del sistema"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "create":
        return <CreateUserDoctorTool />;
      case "update":
        return <UpdateDoctorTool />;
      case "delete":
        return <DeleteDoctorTool />;
      default:
        return <CreateUserDoctorTool />;
    }
  };

  const getActiveTabData = () => {
    return tabs.find(tab => tab.id === activeTab) || tabs[0];
  };

  const activeTabData = getActiveTabData();

  return (
    <div className="doctor-management-container">
      <div className="doctor-management-header">
        <div className="header-icon">
          <FaStethoscope />
        </div>
        <div className="header-content">
          <h1>Gestión de Doctores</h1>
          <p>Administra la información de los doctores del sistema</p>
        </div>
      </div>

      <div className="doctor-tabs-container">
        <div className="doctor-tabs">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.description}
              >
                <div className="tab-button-content">
                  <IconComponent className="tab-icon" />
                  <span className="tab-label">{tab.label}</span>
                </div>
                <div className="tab-indicator"></div>
              </button>
            );
          })}
        </div>

        <div className="active-tab-info">
          <h3>{activeTabData.label}</h3>
          <p>{activeTabData.description}</p>
        </div>
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DoctorManagement;