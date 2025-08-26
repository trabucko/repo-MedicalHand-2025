import React, { useState } from "react";
import "./tabMenu.css";
import Solicitud from "./Solicitudes/Solicitudes";

const TabMenu = () => {
  const [activeTab, setActiveTab] = useState("Solicitud");

  return (
    <section className="tab-section">
      {/* Pestañas cuadradas */}
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

      {/* Contenido dinámico */}

      <div className="tab-content">
        {activeTab === "Solicitud" && <Solicitud />}
        {activeTab === "Reprogramación" && (
          <p>📅 Resultados de Reprogramación.</p>
        )}
        {activeTab === "Cancelación" && <p>❌ Resultados de Cancelación.</p>}
      </div>
    </section>
  );
};

export default TabMenu;
