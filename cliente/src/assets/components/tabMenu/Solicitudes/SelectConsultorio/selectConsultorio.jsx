// src/components/SelectConsultorio.jsx

import React, { useState } from "react";
import "./selectConsultorio.css";
import SelectHorario from "./SelectHorario/SelectHorario";
import { FaArrowLeft, FaHospital } from "react-icons/fa";

const SelectConsultorio = ({
  onClose,
  onSelectOffice,
  isReprogramming = false,
}) => {
  const [selectedConsultorio, setSelectedConsultorio] = useState(null);

  const consultorios = [
    {
      id: 1,
      name: "Consultorio 101",
      estado: "Disponible",
      medico: "Dr. Juan Pérez",
    },
    {
      id: 2,
      name: "Consultorio 102",
      estado: "No disponible",
      medico: "Dr. López",
    },
    {
      id: 3,
      name: "Consultorio 103",
      estado: "Disponible",
      medico: "Dra. Ana García",
    },
    {
      id: 4,
      name: "Consultorio 104",
      estado: "No disponible",
      medico: "Dra. García",
    },
    {
      id: 5,
      name: "Consultorio 105",
      estado: "Disponible",
      medico: "Dr. Carlos Rodríguez",
    },
    {
      id: 6,
      name: "Consultorio 106",
      estado: "No disponible",
      medico: "Dr. Pérez",
    },
  ];

  const handleSelectConsultorio = (cons) => {
    if (cons.estado === "Disponible") {
      if (isReprogramming) {
        onSelectOffice(cons); // Llama a la función del padre para la reprogramación
      } else {
        setSelectedConsultorio(cons); // Establece el estado local para el flujo original
      }
    }
  };

  const handleBackToConsultorios = () => {
    setSelectedConsultorio(null);
  };

  const handleConfirmAppointment = (appointmentDetails) => {
    console.log("Cita confirmada:", appointmentDetails);
    setSelectedConsultorio(null);
  };

  // Lógica para renderizar SelectHorario solo si no estamos en modo reprogramación
  if (selectedConsultorio && !isReprogramming) {
    const doctorInfo = {
      nombre: selectedConsultorio.medico,
    };
    return (
      <SelectHorario
        consultorio={selectedConsultorio}
        doctor={doctorInfo}
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
          <span>Volver</span>
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
                <div className="consultorio-number">{cons.name}</div>
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
