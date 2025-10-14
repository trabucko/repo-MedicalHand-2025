// src/components/TabMenu.jsx
import React, { useState } from "react";
import "./tabMenu.css";

// Importar los componentes para cada una de las pestañas
import Solicitud from "./Solicitudes/Solicitudes";
import Reprogramacion from "./Reprogramaciones/Reprogramacion";
import FilasVirtuales from "./Fila/FilasVirtuales"; // La ruta que proporcionaste

const TabMenu = () => {
  // Estado para controlar qué pestaña está activa.
  // Puedes cambiar el valor inicial a "FilasVirtuales" si quieres que sea la primera en mostrarse.
  const [activeTab, setActiveTab] = useState("Solicitud");

  return (
    <section className="tab-section">
      {/* Contenedor único para todas las pestañas de navegación */}
      <ul className="tab-menu-tabs">
        {/* Pestaña 1: Filas Virtuales */}
        <li className="tab-menu-item">
          <div
            className={`tab-menu-link ${
              activeTab === "FilasVirtuales" ? "active" : ""
            }`}
            onClick={() => setActiveTab("FilasVirtuales")}
          >
            Filas Virtuales
          </div>
        </li>

        {/* Pestaña 2: Solicitud */}
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

        {/* Pestaña 3: Reprogramación */}
        <li className="tab-menu-item">
          <div
            className={`tab-menu-link reprogramacion-link ${
              activeTab === "Reprogramación" ? "active" : ""
            }`}
            onClick={() => setActiveTab("Reprogramación")}
          >
            Reprogramación
          </div>
        </li>
      </ul>

      {/* Contenedor único para el contenido que cambia */}
      <div className="tab-content">
        {/* Renderizado condicional basado en la pestaña activa */}
        {activeTab === "FilasVirtuales" && <FilasVirtuales />}
        {activeTab === "Solicitud" && <Solicitud />}
        {activeTab === "Reprogramación" && <Reprogramacion />}
      </div>
    </section>
  );
};

export default TabMenu;
