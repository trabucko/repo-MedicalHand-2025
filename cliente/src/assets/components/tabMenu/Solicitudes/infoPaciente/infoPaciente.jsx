import React, { useState } from "react";
import "./InfoPaciente.css";

const InfoPaciente = ({ solicitud, onClose }) => {
  const [activeTab, setActiveTab] = useState("general");

  // Si no hay datos, muestra un estado de carga
  if (!solicitud) {
    return <div className="paciente-container">Cargando información...</div>;
  }

  // Obtenemos el objeto completo con todos los datos desde la prop.
  const datos = solicitud.datosCompletos || {};

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
        return "⏳";
      case "confirmada":
        return "✅";
      case "cancelado":
        return "❌";
      default:
        return "📋";
    }
  };

  return (
    <div className="paciente-container">
      {/* Header ahora usa la variable 'datos' */}
      <header className="paciente-header">
        <div className="header-content">
          <div className="patient-avatar">
            <span>
              {datos.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "P"}
            </span>
          </div>
          <div className="patient-main-info">
            <h1>{datos.fullName || "Paciente no encontrado"}</h1>
            <p className="patient-id">ID: {datos.idNumber || "N/A"}</p>
            <div className="status-container">
              <span className={`status-badge ${datos.status}`}>
                {getStatusIcon(datos.status)}{" "}
                {datos.status?.charAt(0).toUpperCase() + datos.status?.slice(1)}
              </span>
              <span
                className={`activity-badge ${
                  datos.isActive ? "active" : "inactive"
                }`}
              >
                {datos.isActive ? "● Activo" : "○ Inactivo"}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-primary">Gestionar Solicitud</button>
            <button className="btn-secondary" onClick={onClose}>
              Volver
            </button>
          </div>
        </div>
      </header>

      {/* Navegación por pestañas (sin cambios) */}
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

      {/* Contenido de las pestañas ahora usa la variable 'datos' */}
      <div className="tab-content">
        {activeTab === "general" && (
          <div className="info-grid">
            <div className="info-card">
              <div className="card-header">
                <h3>Información Personal</h3>
              </div>
              <div className="card-content">
                <div className="info-item">
                  <label>Nombre Completo</label>
                  <span>{datos.fullName}</span>
                </div>
                <div className="info-item">
                  <label>Identificación</label>
                  <span>{datos.idNumber}</span>
                </div>
                <div className="info-item">
                  <label>Fecha de Nacimiento</label>
                  <span>{formatearFecha(datos.dateOfBirth)}</span>
                </div>
                <div className="info-item">
                  <label>Edad</label>
                  <span>{calcularEdad(datos.dateOfBirth)} años</span>
                </div>
                <div className="info-item">
                  <label>Teléfono</label>
                  <span>{datos.phoneNumber}</span>
                </div>
                <div className="info-item">
                  <label>UID del Sistema</label>
                  <span className="uid-text">{datos.uid}</span>
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
                  <span>{datos.hospital}</span>
                </div>
                <div className="info-item">
                  <label>Especialidad Requerida</label>
                  <span>{datos.specialty}</span>
                </div>
                <div className="info-item full-width">
                  <label>Motivo de Consulta</label>
                  <span>{datos.reason}</span>
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
                      {datos.verificationUrls?.idFrontUrl ? (
                        <a
                          href={datos.verificationUrls.idFrontUrl}
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
                      {datos.verificationUrls?.idBackUrl ? (
                        <a
                          href={datos.verificationUrls.idBackUrl}
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
                        {formatearFecha(datos.requestTimestamp)}
                      </span>
                      <span className="time">
                        {datos.requestTimestamp
                          ?.toDate()
                          .toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          }) || ""}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <span className="doctor">Solicitud Actual</span>
                      <span className="specialty">{datos.specialty}</span>
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
