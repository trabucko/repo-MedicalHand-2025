import React from "react";
import "./DoctorConsultorioSelector.css";
import { FaHospital, FaUserDoctor } from "react-icons/fa6";
import { FaSignInAlt } from "react-icons/fa";

const DoctorConsultorioSelector = ({ consultorios, onSelect }) => {
  // <-- FUNCIÓN AÑADIDA PARA DEPURACIÓN -->
  const handleCardClick = (consultorio) => {
    console.log("--- 🩺 Depuración: Intento de Selección de Consultorio ---");
    console.log(
      "1. Se hizo clic en la tarjeta para el consultorio:",
      consultorio.name
    );
    console.log("2. ID del consultorio seleccionado:", consultorio.id);
    console.log("3. Datos completos del objeto 'consultorio':", consultorio);

    // Revisa el estado de asignación actual del consultorio
    if (consultorio.assignedDoctorId) {
      console.log(
        "4. Estado actual: El consultorio ya está asignado a un doctor (Probablemente tú). UID:",
        consultorio.assignedDoctorId
      );
    } else {
      console.log("4. Estado actual: El consultorio está libre y disponible.");
    }

    console.log(
      "5. ✅ Procediendo a llamar a la función 'onSelect' para ejecutar la lógica de asignación..."
    );
    onSelect(consultorio);
    console.log("--- Fin de la Depuración ---");
  };

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
              // <-- ONCLICK MODIFICADO PARA USAR LA FUNCIÓN DE DEPURACIÓN -->
              onClick={() => handleCardClick(cons)}
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
