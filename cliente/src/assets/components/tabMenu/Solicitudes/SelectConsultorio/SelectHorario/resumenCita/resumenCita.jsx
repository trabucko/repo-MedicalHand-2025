// src/components/ResumenCita.jsx (versión simplificada para el modal)

import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaHospital,
  FaClinicMedical,
  FaUser,
} from "react-icons/fa";
import { Button } from "@mui/material";
import "./ResumenCita.css";

const ResumenCita = ({ onConfirm, onBack, appointmentDetails }) => {
  if (!appointmentDetails) {
    return <div>Error al cargar la información.</div>;
  }

  const { consultorio, doctor, fecha, hora } = appointmentDetails;

  return (
    <div className="resumen-container">
      <div className="resumen-header">
        <h2 className="resumen-title">Resumen de la Cita Médica</h2>
        <p className="resumen-subtitle">
          Verifica los detalles antes de confirmar.
        </p>
      </div>
      {/* ... el resto del JSX es el mismo que en tu código original ... */}
      <div className="resumen-card">
        <div className="info-section">
          <FaUser className="info-icon" />
          <div className="info-details">
            <span className="info-label">Paciente</span>
            <p className="info-value">{"Juan Pérez"}</p>
          </div>
        </div>
        <div className="info-section">
          <FaUserMd className="info-icon" />
          <div className="info-details">
            <span className="info-label">Doctor</span>
            <p className="info-value">{doctor.nombre}</p>
          </div>
        </div>
        <div className="info-section">
          <FaHospital className="info-icon" />
          <div className="info-details">
            <span className="info-label">Hospital</span>
            <p className="info-value">{"Hospital de Especialidades"}</p>
          </div>
        </div>
        <div className="info-section">
          <FaClinicMedical className="info-icon" />
          <div className="info-details">
            <span className="info-label">Consultorio</span>
            <p className="info-value">{consultorio.name}</p>
          </div>
        </div>
      </div>
      <div className="resumen-card">
        <div className="info-section">
          <FaCalendarAlt className="info-icon" />
          <div className="info-details">
            <span className="info-label">Fecha</span>
            <p className="info-value">{fecha}</p>
          </div>
        </div>
        <div className="info-section">
          <FaClock className="info-icon" />
          <div className="info-details">
            <span className="info-label">Hora</span>
            <p className="info-value">{hora}</p>
          </div>
        </div>
      </div>
      <div className="resumen-actions">
        <Button
          variant="outlined"
          onClick={onBack} // Usa la prop onBack
          sx={{
            borderColor: "#bbb",
            color: "#666",
            "&:hover": { borderColor: "#999", color: "#333" },
          }}
        >
          Editar Cita
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm} // Usa la prop onConfirm
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#115293" },
          }}
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
};

export default ResumenCita;
