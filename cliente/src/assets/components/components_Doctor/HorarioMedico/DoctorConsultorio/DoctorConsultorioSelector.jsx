// src/components/components_Doctor/DoctorConsultorioSelector.jsx
import React from "react";
import "./DoctorConsultorioSelector.css";
import { FaHospital, FaUserDoctor } from "react-icons/fa6";
import { FaSignInAlt } from "react-icons/fa"; // Importar desde react-icons/fa en lugar de fa6

const DoctorConsultorioSelector = ({ consultorios, onSelect }) => {
  return (
    <div className="dcs-container">
      <div className="dcs-header">
        <div className="dcs-header-icon">
          <FaUserDoctor />
        </div>
        <h2>Consultorios Disponibles</h2>
        <p>
          Seleccione un consultorio para gestionar su agenda y horarios de
          atención
        </p>
      </div>

      {consultorios.length === 0 ? (
        <div className="dcs-no-consultorios">
          <div className="dcs-empty-icon">
            <FaHospital />
          </div>
          <h3>No hay consultorios disponibles</h3>
          <p>
            No se encontraron consultorios asignados a su perfil.
            <br />
            Por favor, contacte al administrador del sistema si necesita acceso.
          </p>
        </div>
      ) : (
        <div className="dcs-grid">
          {consultorios.map((cons) => (
            <div
              key={cons.id}
              className="dcs-card"
              onClick={() => onSelect(cons)}
            >
              <div className="dcs-card-header">
                <div className="dcs-card-icon">
                  <FaHospital />
                </div>
                <div className="dcs-status-indicator">
                  {cons.assignedDoctorId ? (
                    <span className="dcs-status-badge dcs-status-assigned">
                      Asignado
                    </span>
                  ) : (
                    <span className="dcs-status-badge dcs-status-available">
                      Disponible
                    </span>
                  )}
                </div>
              </div>

              <div className="dcs-card-content">
                <h3 className="dcs-consultorio-name">{cons.name}</h3>

                {cons.location && (
                  <p className="dcs-location">📍 {cons.location}</p>
                )}

                {cons.equipment && (
                  <div className="dcs-equipment">
                    <span>🩺 Equipamiento: {cons.equipment}</span>
                  </div>
                )}
              </div>

              <div className="dcs-card-footer">
                <button className="dcs-select-btn">
                  <span>Gestionar Horario</span>
                  <FaSignInAlt />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorConsultorioSelector;
