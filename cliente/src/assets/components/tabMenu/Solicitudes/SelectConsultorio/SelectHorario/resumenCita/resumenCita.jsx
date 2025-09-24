// src/components/ResumenCita.jsx

import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaHospital,
  FaClinicMedical,
  FaUser,
  FaFileMedical,
  FaCheckCircle,
} from "react-icons/fa";
import { Button } from "@mui/material";
import "./ResumenCita.css";

const ResumenCita = ({ onConfirm, onBack, appointmentDetails }) => {
  if (!appointmentDetails) {
    return (
      <div className="rc-loading-container">
        <div className="rc-loading-spinner"></div>
        <p>Cargando información de la cita...</p>
      </div>
    );
  }

  const { consultorio, doctor, fecha, hora, patient, hospital } =
    appointmentDetails;

  return (
    <div className="rc-modal-container">
      <div className="rc-modal-content">
        {/* Header con icono de verificación */}
        <div className="rc-modal-header">
          <div className="rc-header-icon">
            <FaCheckCircle />
          </div>
          <div className="rc-header-text">
            <h2 className="rc-modal-title">Resumen de la Cita</h2>
            <p className="rc-modal-subtitle">
              Verifique que toda la información sea correcta antes de confirmar
            </p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="rc-content-wrapper">
          {/* Sección de información personal */}
          <div className="rc-section">
            <h3 className="rc-section-title">Información Personal</h3>
            <div className="rc-info-grid">
              <div className="rc-info-item">
                <div className="rc-item-icon">
                  <FaUser />
                </div>
                <div className="rc-item-content">
                  <label className="rc-item-label">Paciente</label>
                  <p className="rc-item-value">
                    {patient?.fullName || "No especificado"}
                  </p>
                </div>
              </div>

              <div className="rc-info-item">
                <div className="rc-item-icon">
                  <FaUserMd />
                </div>
                <div className="rc-item-content">
                  <label className="rc-item-label">Doctor</label>
                  <p className="rc-item-value">
                    {doctor?.nombre || "No especificado"}
                  </p>
                </div>
              </div>

              <div className="rc-info-item">
                <div className="rc-item-icon">
                  <FaFileMedical />
                </div>
                <div className="rc-item-content">
                  <label className="rc-item-label">Motivo de Consulta</label>
                  <p className="rc-item-value">
                    {patient?.reason || "No especificado"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de ubicación */}
          <div className="rc-section">
            <h3 className="rc-section-title">Ubicación y Consultorio</h3>
            <div className="rc-info-grid">
              <div className="rc-info-item">
                <div className="rc-item-icon">
                  <FaHospital />
                </div>
                <div className="rc-item-content">
                  <label className="rc-item-label">Hospital</label>
                  <p className="rc-item-value">
                    {hospital || "No especificado"}
                  </p>
                </div>
              </div>

              <div className="rc-info-item">
                <div className="rc-item-icon">
                  <FaClinicMedical />
                </div>
                <div className="rc-item-content">
                  <label className="rc-item-label">Consultorio</label>
                  <p className="rc-item-value">
                    {consultorio?.name || "No especificado"}
                  </p>
                  {consultorio?.numero && (
                    <span className="rc-item-detail">
                      N° {consultorio.numero}
                    </span>
                  )}
                  {consultorio?.piso && (
                    <span className="rc-item-detail">
                      Piso {consultorio.piso}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sección de fecha y hora */}
          <div className="rc-section">
            <h3 className="rc-section-title">Fecha y Hora</h3>
            <div className="rc-time-container">
              <div className="rc-time-item">
                <div className="rc-time-icon">
                  <FaCalendarAlt />
                </div>
                <div className="rc-time-content">
                  <label className="rc-time-label">Fecha seleccionada</label>
                  <p className="rc-time-value">{fecha}</p>
                </div>
              </div>

              <div className="rc-time-item">
                <div className="rc-time-icon">
                  <FaClock />
                </div>
                <div className="rc-time-content">
                  <label className="rc-time-label">Hora de la cita</label>
                  <p className="rc-time-value">{hora} horas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="rc-actions-container">
          <Button
            variant="outlined"
            onClick={onBack}
            className="rc-action-button rc-button-secondary"
          >
            Modificar Cita
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            className="rc-action-button rc-button-primary"
          >
            Confirmar Cita
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumenCita;
