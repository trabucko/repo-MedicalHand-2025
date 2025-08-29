// src/components/SelectConsultorio.js

import React, { useState } from "react";
import "./selectConsultorio.css";
import SelectHorario from "./SelectHorario/SelectHorario"; // Import the new component
import { FaArrowLeft, FaHospital } from "react-icons/fa";

const SelectConsultorio = ({ onClose }) => {
  const [selectedConsultorio, setSelectedConsultorio] = useState(null);

  const consultorios = [
    { id: 1, numero: "101", estado: "Disponible", medico: "Dr. Juan Pérez" },
    { id: 2, numero: "102", estado: "No disponible", medico: "Dr. López" },
    { id: 3, numero: "103", estado: "Disponible", medico: "Dra. Ana García" },
    { id: 4, numero: "104", estado: "No disponible", medico: "Dra. García" },
    {
      id: 5,
      numero: "105",
      estado: "Disponible",
      medico: "Dr. Carlos Rodríguez",
    },
    { id: 6, numero: "106", estado: "No disponible", medico: "Dr. Pérez" },
  ];

  const handleSelectConsultorio = (cons) => {
    if (cons.estado === "Disponible") {
      setSelectedConsultorio(cons);
    }
  };

  const handleBackToConsultorios = () => {
    setSelectedConsultorio(null);
  };

  const handleConfirmAppointment = (appointmentDetails) => {
    console.log("Cita confirmada:", appointmentDetails);
    // You can add logic here to send this data to a backend or update the state
    // For this example, we'll just go back to the list.
    setSelectedConsultorio(null);
  };

  if (selectedConsultorio) {
    // You must provide the doctor prop to the SelectHorario component.
    // We'll create a doctor object from the selected consultorio's medico property.
    const doctorInfo = {
      nombre: selectedConsultorio.medico,
    };
    return (
      <SelectHorario
        consultorio={selectedConsultorio}
        doctor={doctorInfo} // <--- This line fixes the error
        onBack={handleBackToConsultorios}
        onConfirm={handleConfirmAppointment}
      />
    );
  }

  return (
    <div className="consultorio-container">
      <div className="consultorio-header">
        <div onClick={onClose} className="back-link">
          <FaArrowLeft className="back-icon" />
        </div>

        <div className="consultorio-title">
          <h2>Seleccione un Consultorio</h2>
        </div>
      </div>
      <div className="consultorio-list-container">
        <ul className="consultorio-list">
          {consultorios.map((cons) => (
            <li
              key={cons.id}
              className={`consultorio-list-item ${
                cons.estado === "Disponible" ? "available" : "unavailable"
              }`}
              onClick={() => handleSelectConsultorio(cons)}
            >
              <div className="consultorio-icon-wrapper">
                <FaHospital />
              </div>
              <div className="consultorio-details">
                <div className="consultorio-number">
                  Consultorio {cons.numero}
                </div>
                <div className="consultorio-status">
                  {cons.estado}
                  {cons.medico && (
                    <p className="medico-asignado">({cons.medico})</p>
                  )}
                </div>
              </div>
              <div className="consultorio-action">
                {cons.estado === "Disponible" && (
                  <button className="select-button">Seleccionar</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SelectConsultorio;
