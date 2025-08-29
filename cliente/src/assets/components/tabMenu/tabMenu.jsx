// src/components/TabMenu.jsx
import React, { useState } from "react";
import "./tabMenu.css";
import Solicitud from "./Solicitudes/Solicitudes";
import Reprogramacion from "./Reprogramaciones/Reprogramacion"; // ✅ La importación ya está correcta
import Cancelacion from "./Cancelacion/Cancelacion";
const TabMenu = () => {
  const [activeTab, setActiveTab] = useState("Solicitud");

  return (
    <section className="tab-section">
      <ul className="tab-menu-tabs">
        <li className="tab-menu-item">
          <div
            className={`tab-menu-link ${
              activeTab === "Solicitud" ? "active" : ""
            }`}
            onClick={() => setActiveTab("Solicitud")}
          >
            Solicitud
          </div>
        </li>
        <li className="tab-menu-item">
          <div
            className={`tab-menu-link ${
              activeTab === "Reprogramación" ? "active" : ""
            }`}
            onClick={() => setActiveTab("Reprogramación")}
          >
            Reprogramación
          </div>
        </li>
        <li className="tab-menu-item">
          <div
            className={`tab-menu-link ${
              activeTab === "Cancelación" ? "active" : ""
            }`}
            onClick={() => setActiveTab("Cancelación")}
          >
            Cancelación
          </div>
        </li>
      </ul>
      <div className="tab-content">
        {activeTab === "Solicitud" && <Solicitud />}
        {activeTab === "Reprogramación" && <Reprogramacion />}{" "}
        {/* ✅ Esto ya está bien */}
        {activeTab === "Cancelación" && <Cancelacion />}
      </div>
    </section>
  );
};

export default TabMenu;
