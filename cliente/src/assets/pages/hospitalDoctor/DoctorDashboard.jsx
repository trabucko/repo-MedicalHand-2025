// src/assets/pages/hospitalDoctor/DoctorDashboard.jsx

import React from "react";
import {
  FaUserInjured,
  FaStethoscope,
  FaUserClock,
  FaCheckCircle,
  FaHistory,
} from "react-icons/fa";
import "./DoctorDashboard.css";
import { useOutletContext, useNavigate } from "react-router-dom";

// Componente para cuando no hay pacientes en espera
const NoPatientsView = () => (
  <div className="doctor-no-patients-view">
    <FaUserClock className="doctor-no-patients-icon" />
    <h3>No hay pacientes en espera</h3>
    <p>La fila virtual está vacía en este momento.</p>
  </div>
);

// ✨ 1. MODIFICACIÓN: AÑADIR LA PROP 'onClick'
// Componente para el paciente actual
const CurrentPatientCard = ({ patient, onFinalize, onClick }) => {
  if (!patient || patient.patientStatus === "finalizada") {
    return (
      <div className="no-current-patient">
        <FaUserClock className="no-patient-icon" />
        <p>Esperando al siguiente paciente...</p>
        <span>El monitor llamará al próximo en la fila.</span>
      </div>
    );
  }

  return (
    // ✨ 2. AÑADIR LA CLASE 'clickable' Y EL EVENTO onClick AL DIV PRINCIPAL
    <div className="doctor-current-patient-card clickable" onClick={onClick}>
      <div className="doctor-patient-header">
        <div className="doctor-patient-badge current">En Consulta</div>
        <div className="doctor-turn-number">
          Turno #{patient.turnNumber || "N/A"}
        </div>
      </div>
      <div className="doctor-patient-info">
        <h3>
          {patient.patientFullName ||
            patient.patientName ||
            "Nombre no disponible"}
        </h3>
        <div className="doctor-patient-details">
          <div className="doctor-detail-item">
            <strong>Motivo de consulta:</strong>
            <span className="consultation-reason">
              {patient.reason || "No especificado"}
            </span>
          </div>
          <div className="doctor-detail-item">
            <strong>Especialidad:</strong>
            <span>{patient.specialty || "Medicina General"}</span>
          </div>
          {patient.patientStatus && (
            <div className="doctor-detail-item">
              <strong>Estado:</strong>
              <span className={`status-${patient.patientStatus}`}>
                {patient.patientStatus}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="doctor-patient-actions">
        {/* Usamos stopPropagation para que el click en el botón no active el click de la tarjeta */}
        <button
          className="doctor-action-primary"
          onClick={(e) => {
            e.stopPropagation();
            onFinalize();
          }}
        >
          <FaCheckCircle /> Finalizar Consulta
        </button>
      </div>
    </div>
  );
};

// ✨ COMPONENTE para el último paciente atendido (NO ES CLICABLE)
const LastAttendedCard = ({ patient }) => {
  if (!patient) {
    return (
      <div className="no-last-patient placeholder">
        <FaHistory className="no-patient-icon" />
        <p>Último paciente Atendido</p>
        <span>Se mostrará aquí después de finalizar una consulta.</span>
      </div>
    );
  }

  return (
    <div className="doctor-last-patient-card">
      <div className="doctor-patient-header">
        <div className="doctor-patient-badge completed">Finalizado</div>
        <div className="doctor-turn-number">
          Turno #{patient.turnNumber || "N/A"}
        </div>
      </div>
      <div className="doctor-patient-info">
        <h4>
          {patient.patientFullName ||
            patient.patientName ||
            "Nombre no disponible"}
        </h4>
        <div className="doctor-patient-details">
          <div className="doctor-detail-item">
            <strong>Motivo:</strong>
            <span className="consultation-reason">
              {patient.reason || "No especificado"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para la tarjeta de paciente en espera (NO ES CLICABLE)
const WaitingPatientCard = ({ patient, position }) => {
  if (!patient) return null;

  return (
    <div className="doctor-waiting-patient-card">
      <div className="doctor-waiting-header">
        <div className="doctor-waiting-position">#{position}</div>
        <div className="doctor-waiting-turn">
          Turno {patient.turnNumber || "N/A"}
        </div>
      </div>
      <div className="doctor-waiting-info">
        <h4>
          {patient.patientFullName ||
            patient.patientName ||
            "Nombre no disponible"}
        </h4>
        <div className="doctor-waiting-details">
          <div className="consultation-reason-waiting">
            {patient.reason || "Consulta general"}
          </div>
          <div className="doctor-waiting-time">~{position * 15} min</div>
        </div>
      </div>
      <div className="doctor-waiting-status">
        <FaUserClock className="waiting-icon" />
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  // OBTENER LOS DATOS REALES DEL CONTEXTO
  const {
    currentPatient,
    handleFinalizeConsultation,
    waitingPatients,
    queueStats,
    lastAttendedPatient,
  } = useOutletContext();

  const navigate = useNavigate();

  // Función para navegar a la ficha del paciente
  const handleNavigateToPatient = (patientId) => {
    if (patientId) {
      navigate(`/dashboard-doctor/paciente/${patientId}`);
    } else {
      alert(
        "No se encontró la información completa de este paciente para abrir su ficha."
      );
    }
  };

  console.log("DoctorDashboard - Datos del contexto:", {
    currentPatient,
    waitingPatients,
    queueStats,
    lastAttendedPatient,
  });

  // Componente de tarjeta de estadísticas
  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <div className="doctor-stat-card">
      <div className="doctor-stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="doctor-stat-content">
        <h3>{value}</h3>
        <p className="doctor-stat-title">{title}</p>
        <p className="doctor-stat-subtitle">{subtitle}</p>
      </div>
    </div>
  );

  // Estado de carga mientras los datos del contexto se resuelven
  if (currentPatient === undefined || queueStats === undefined) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Sincronizando con la fila virtual...</h2>
      </div>
    );
  }

  return (
    <main className="doctor-dash-content">
      {/* ESTADÍSTICAS */}
      <section className="doctor-stats-grid">
        <StatCard
          icon={<FaUserInjured />}
          title="Total Hoy"
          value={queueStats.totalToday || 0}
          subtitle="Pacientes en fila"
          color="#2563eb"
        />
        <StatCard
          icon={<FaStethoscope />}
          title="En Consulta"
          value={queueStats.inProgress || 0}
          subtitle="Paciente actual"
          color="#059669"
        />
        <StatCard
          icon={<FaUserClock />}
          title="En Espera"
          value={queueStats.waiting || 0}
          subtitle="Próximos en fila"
          color="#d97706"
        />
        <StatCard
          icon={<FaCheckCircle />}
          title="Finalizados"
          value={queueStats.completed || 0}
          subtitle="Consultas del día"
          color="#059669"
        />
      </section>

      {/* ✨ ESTRUCTURA DE 2 COLUMNAS CON ÚLTIMO PACIENTE DEBAJO */}
      <div className="doctor-main-grid">
        {/* Columna izquierda - Paciente Actual + Último Finalizado */}
        <div className="doctor-left-column">
          {/* Paciente Actual */}
          <section className="doctor-queue-section current-section">
            <div className="doctor-section-header">
              <h2>Paciente en Consulta</h2>
              <div className="section-indicator current">Activo</div>
            </div>
            <div className="doctor-queue-content">
              {/* ✨ 3. PASAR LA FUNCIÓN DE NAVEGACIÓN SÓLO A ESTA TARJETA */}
              <CurrentPatientCard
                patient={currentPatient}
                onFinalize={handleFinalizeConsultation}
                onClick={() =>
                  handleNavigateToPatient(currentPatient?.patientUid)
                }
              />
            </div>
          </section>

          {/* ✨ Último Paciente Finalizado (debajo) */}
          <section className="doctor-queue-section last-attended-section">
            <div className="doctor-section-header">
              <h2>Último Paciente Atendido</h2>
              <div className="section-indicator completed">Historial</div>
            </div>
            <div className="doctor-queue-content">
              {/* Esta tarjeta ya no recibe 'onClick' */}
              <LastAttendedCard patient={lastAttendedPatient} />
            </div>
          </section>
        </div>

        {/* Columna derecha - Lista de Espera */}
        <section className="doctor-list-section waiting-section">
          <div className="doctor-section-header">
            <h2>Pacientes en Espera</h2>
            <div className="waiting-count">
              {queueStats.waiting || 0} pacientes
            </div>
          </div>
          <div className="doctor-list-content">
            {waitingPatients && waitingPatients.length > 0 ? (
              <div className="patients-waiting-list">
                {waitingPatients.map((patient, index) => (
                  // Esta tarjeta no recibe 'onClick'
                  <WaitingPatientCard
                    key={patient.id || patient.turnNumber || index}
                    patient={patient}
                    position={index + 1}
                  />
                ))}
              </div>
            ) : (
              <NoPatientsView />
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default DoctorDashboard;
