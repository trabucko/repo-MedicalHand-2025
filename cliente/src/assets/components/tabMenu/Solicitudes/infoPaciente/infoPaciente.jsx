import React, { useState } from "react";
import "./InfoPaciente.css";

const InfoPaciente = ({ solicitud, onClose, onGestionar }) => {
  const [activeTab, setActiveTab] = useState("general");

  // Si no hay datos, muestra un estado de carga
  if (!solicitud) {
    return <div className="paciente-container">Cargando información...</div>;
  }

  // Separamos los datos para un código más limpio y claro
  const cita = solicitud.citaCompleta || {};
  const paciente = solicitud.pacienteCompleto || {};

  // Creamos variables específicas para acceder a la información anidada de forma segura
  const personalInfo = paciente.personalInfo || {};
  const contactInfo = paciente.contactInfo || {};
  const medicalInfo = paciente.medicalInfo || {};
  const emergencyContact = contactInfo.emergencyContact || {};

  // --- FUNCIONES AUXILIARES ---
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento || !fechaNacimiento.toDate) return "N/A";
    const fechaNac = fechaNacimiento.toDate();
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    return timestamp.toDate().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pendiente":
        return "";
      case "confirmada":
        return "Confirmada";
      case "cancelado":
        return "Cancelado";
      default:
        return "reprogramado";
    }
  };

  // Combinamos nombre y apellido para mostrarlos juntos
  const nombreCompleto = `${personalInfo.firstName || ""} ${
    personalInfo.lastName || ""
  }`.trim();

  return (
    <div className="paciente-container">
      <header className="paciente-header">
        <div className="header-content">
          <div className="patient-avatar">
            <span>
              {(personalInfo.firstName?.[0] || "") +
                (personalInfo.lastName?.[0] || "") || "P"}
            </span>
          </div>
          <div className="patient-main-info">
            <h1>{nombreCompleto || "Paciente no encontrado"}</h1>
            <p className="patient-id">ID: {personalInfo.idNumber || "N/A"}</p>
            <div className="status-container">
              <span className={`status-badge ${cita.status}`}>
                {getStatusIcon(cita.status)}{" "}
                {cita.status?.charAt(0).toUpperCase() + cita.status?.slice(1)}
              </span>
              <span
                className={`activity-badge ${
                  cita.isActive ? "active" : "inactive"
                }`}
              >
                {cita.isActive ? "● Activo" : "○ Inactivo"}
              </span>
            </div>
          </div>
          <div className="header-actions">
            {/* *** SOLUCIÓN: Conectar el botón con la función onGestionar *** */}
            <button
              className="btn-primary"
              onClick={() => onGestionar(solicitud)}
            >
              Gestionar Solicitud
            </button>
            <button className="btn-secondary" onClick={onClose}>
              Volver
            </button>
          </div>
        </div>
      </header>

      <nav className="tabs-navigation">
        <button
          className={`tab ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          Información General
        </button>
        <button
          className={`tab ${activeTab === "medica" ? "active" : ""}`}
          onClick={() => setActiveTab("medica")}
        >
          Información de Solicitud
        </button>
        <button
          className={`tab ${activeTab === "documentos" ? "active" : ""}`}
          onClick={() => setActiveTab("documentos")}
        >
          Documentos
        </button>
        <button
          className={`tab ${activeTab === "citas" ? "active" : ""}`}
          onClick={() => setActiveTab("citas")}
        >
          Historial de Citas
        </button>
      </nav>

      <div className="tab-content">
        {activeTab === "general" && (
          <div className="info-grid">
            {/* --- Tarjeta de Información Personal y de Contacto --- */}
            <div className="info-card">
              <div className="card-header">
                <h3>Información Personal y de Contacto</h3>
              </div>
              <div className="card-content">
                <div className="info-item">
                  <label>Nombre Completo</label>
                  <span>{nombreCompleto || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Identificación</label>
                  <span>{personalInfo.idNumber || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Fecha de Nacimiento</label>
                  <span>{formatearFecha(personalInfo.dateOfBirth)}</span>
                </div>
                <div className="info-item">
                  <label>Edad</label>
                  <span>{calcularEdad(personalInfo.dateOfBirth)} años</span>
                </div>
                <div className="info-item">
                  <label>Sexo</label>
                  <span>{personalInfo.sex || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Teléfono</label>
                  <span>{contactInfo.phoneNumber || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span>{contactInfo.email || "N/A"}</span>
                </div>
                <div className="info-item full-width">
                  <label>Dirección</label>
                  <span>{contactInfo.address || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* --- Tarjeta de Información Médica --- */}
            <div className="info-card">
              <div className="card-header">
                <h3>Información Médica</h3>
              </div>
              <div className="card-content">
                <div className="info-item">
                  <label>Tipo de Sangre</label>
                  <span>{medicalInfo.bloodType || "N/A"}</span>
                </div>
                <div className="info-item full-width">
                  <label>Alergias Conocidas</label>
                  <span>
                    {medicalInfo.knownAllergies || "Ninguna reportada"}
                  </span>
                </div>
                <div className="info-item full-width">
                  <label>Enfermedades Crónicas</label>
                  <span>
                    {Array.isArray(medicalInfo.chronicDiseases) &&
                    medicalInfo.chronicDiseases.length > 0
                      ? medicalInfo.chronicDiseases.join(", ")
                      : "Ninguna reportada"}
                  </span>
                </div>
              </div>
            </div>

            {/* --- Tarjeta de Contacto de Emergencia --- */}
            <div className="info-card">
              <div className="card-header">
                <h3>Contacto de Emergencia</h3>
              </div>
              <div className="card-content">
                <div className="info-item">
                  <label>Nombre</label>
                  <span>{emergencyContact.name || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Teléfono</label>
                  <span>{emergencyContact.phoneNumber || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "medica" && (
          <div className="info-grid">
            <div className="info-card">
              <div className="card-header">
                <h3>Información de la Solicitud</h3>
              </div>
              <div className="card-content">
                <div className="info-item">
                  <label>Hospital</label>
                  <span>{cita.hospital}</span>
                </div>
                <div className="info-item">
                  <label>Especialidad Requerida</label>
                  <span>{cita.specialty}</span>
                </div>
                <div className="info-item full-width">
                  <label>Motivo de Consulta</label>
                  <span>{cita.reason}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documentos" && (
          <div className="info-grid">
            <div className="info-card">
              <div className="card-header">
                <h3>Documentos de Verificación</h3>
              </div>
              <div className="card-content">
                <div className="documents-list">
                  <div className="document-item">
                    <div className="document-icon">🆔</div>
                    <div className="document-info">
                      <label>Frente de Identificación</label>
                      {cita.verificationUrls?.idFrontUrl ? (
                        <a
                          href={cita.verificationUrls.idFrontUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="document-link"
                        >
                          Ver documento
                        </a>
                      ) : (
                        <span className="document-missing">No disponible</span>
                      )}
                    </div>
                  </div>
                  <div className="document-item">
                    <div className="document-icon">🆔</div>
                    <div className="document-info">
                      <label>Reverso de Identificación</label>
                      {cita.verificationUrls?.idBackUrl ? (
                        <a
                          href={cita.verificationUrls.idBackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="document-link"
                        >
                          Ver documento
                        </a>
                      ) : (
                        <span className="document-missing">No disponible</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "citas" && (
          <div className="info-grid">
            <div className="info-card">
              <div className="card-header">
                <h3>Historial de Citas</h3>
              </div>
              <div className="card-content">
                <div className="appointments-list">
                  <div className="appointment-item pending">
                    <div className="appointment-date">
                      <span className="date">
                        {formatearFecha(cita.requestTimestamp)}
                      </span>
                      <span className="time">
                        {cita.requestTimestamp
                          ?.toDate()
                          .toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          }) || ""}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <span className="doctor">Solicitud Actual</span>
                      <span className="specialty">{cita.specialty}</span>
                      <span className="status pending">
                        Pendiente de Aprobación
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPaciente;
