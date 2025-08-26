import React from "react";
import "./selectConsultorio.css";
import { FaUserMd, FaArrowLeft, FaHospital } from "react-icons/fa";

const SelectConsultorio = ({ onClose }) => {
  const consultorios = [
    { id: 1, numero: "101", estado: "Disponible", medico: null },
    { id: 2, numero: "102", estado: "No disponible", medico: "Dr. López" },
    { id: 3, numero: "103", estado: "Disponible", medico: null },
    { id: 4, numero: "104", estado: "No disponible", medico: "Dra. García" },
    { id: 5, numero: "105", estado: "Disponible", medico: null },
    { id: 6, numero: "106", estado: "No disponible", medico: "Dr. Pérez" },
  ];

  return (
    <div className="consultorio-container">
      <div className="consultorio-header">
        <div onClick={onClose} className="back-link">
          <FaArrowLeft className="back-icon" />
          <span>Volver a la bandeja</span>
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
