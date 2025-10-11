// src/assets/components/components_Doctor/paciente/PacienteForm/consultasPrevias.jsx

import React from "react";
import {
  FaCalendar,
  FaStethoscope,
  FaPills,
  FaFlask,
  FaNotesMedical,
  FaFileMedical,
} from "react-icons/fa";
import "./consultasPrevias.css";

const formatDateTime = (dateInput) => {
  if (!dateInput) return "";
  let dateObj;

  if (typeof dateInput.toDate === "function") {
    dateObj = dateInput.toDate();
  } else if (typeof dateInput === "string") {
    dateObj = new Date(dateInput);
  } else {
    return "Fecha inválida";
  }

  if (isNaN(dateObj.getTime())) {
    return "Fecha inválida";
  }

  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return dateObj.toLocaleString("es-ES", options);
};

const ConsultasPrevias = ({ consultas = [] }) => {
  if (!consultas || consultas.length === 0) {
    return (
      <div className="cp-container">
        <div className="cp-empty-state">
          <FaFileMedical className="cp-empty-icon" />
          <h3 className="cp-empty-title">No hay consultas previas</h3>
          <p className="cp-empty-message">
            No se encontraron consultas médicas anteriores para este paciente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-container">
      <div className="cp-header">
        <h2 className="cp-title">Historial de Consultas Previas</h2>
        <p className="cp-subtitle">
          {consultas.length} consulta{consultas.length !== 1 ? "s" : ""}{" "}
          registrada{consultas.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="cp-consultas-list">
        {consultas.map((consulta, index) => (
          <div key={consulta.id || index} className="cp-consulta-card">
            <div className="cp-consulta-header">
              <div className="cp-consulta-info">
                <div className="cp-consulta-fecha">
                  <FaCalendar className="cp-icon" />
                  <span className="cp-fecha-text">
                    Consulta del {formatDateTime(consulta.fechaConsulta)}
                  </span>
                </div>
                <h3 className="cp-consulta-motivo">
                  {consulta.motivoConsulta || "Consulta de rutina"}
                </h3>
                <div className="cp-consulta-medico">
                  <span className="cp-medico-text">
                    Atendido por: Dr. {consulta.doctor_name || "Médico"}
                  </span>
                </div>
              </div>
            </div>

            <div className="cp-consulta-content">
              {/* Diagnóstico */}
              {consulta.diagnostico && (
                <div className="cp-section">
                  <div className="cp-section-header">
                    <FaStethoscope className="cp-section-icon" />
                    <h4 className="cp-section-title">Diagnóstico</h4>
                  </div>
                  <div className="cp-section-content">
                    <p>{consulta.diagnostico}</p>
                  </div>
                </div>
              )}

              {/* Tratamiento */}
              {consulta.tratamiento && (
                <div className="cp-section">
                  <div className="cp-section-header">
                    <FaPills className="cp-section-icon" />
                    <h4 className="cp-section-title">Plan de Tratamiento</h4>
                  </div>
                  <div className="cp-section-content">
                    <p>{consulta.tratamiento}</p>
                  </div>
                </div>
              )}

              {/* Medicamentos */}
              {consulta.medicamentos && consulta.medicamentos.length > 0 && (
                <div className="cp-section">
                  <div className="cp-section-header">
                    <FaPills className="cp-section-icon" />
                    <h4 className="cp-section-title">Medicamentos Recetados</h4>
                  </div>
                  <div className="cp-section-content">
                    <div className="cp-medicamentos-grid">
                      {consulta.medicamentos.map((med, medIndex) => (
                        <div key={medIndex} className="cp-medicamento-item">
                          <strong>{med.nombre}</strong>
                          <div className="cp-medicamento-details">
                            <span>Dosis: {med.dosis}</span>
                            <span>Frecuencia: {med.frecuencia}</span>
                            <span>Duración: {med.duracion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Exámenes */}
              {consulta.examsRequested &&
                consulta.examsRequested.length > 0 && (
                  <div className="cp-section">
                    <div className="cp-section-header">
                      <FaFlask className="cp-section-icon" />
                      <h4 className="cp-section-title">Exámenes Solicitados</h4>
                    </div>
                    <div className="cp-section-content">
                      <div className="cp-examenes-list">
                        {consulta.examsRequested.map((examen, examIndex) => (
                          <div key={examIndex} className="cp-examen-item">
                            <span className="cp-examen-nombre">
                              {examen.nombre}
                            </span>
                            <span
                              className={`cp-examen-estado ${
                                examen.estado || "solicitado"
                              }`}
                            >
                              {examen.estado === "completado"
                                ? "Completado"
                                : examen.estado === "proceso"
                                ? "En proceso"
                                : "Solicitado"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {/* Observaciones */}
              {consulta.observaciones && (
                <div className="cp-section">
                  <div className="cp-section-header">
                    <FaNotesMedical className="cp-section-icon" />
                    <h4 className="cp-section-title">Observaciones</h4>
                  </div>
                  <div className="cp-section-content">
                    <p>{consulta.observaciones}</p>
                  </div>
                </div>
              )}

              {/* Notas adicionales */}
              {consulta.notes && consulta.notes.length > 0 && (
                <div className="cp-section">
                  <div className="cp-section-header">
                    <FaNotesMedical className="cp-section-icon" />
                    <h4 className="cp-section-title">Notas Adicionales</h4>
                  </div>
                  <div className="cp-section-content">
                    <div className="cp-notes-list">
                      {consulta.notes.map((nota, noteIndex) => (
                        <div key={noteIndex} className="cp-note-item">
                          <div className="cp-note-header">
                            <span
                              className={`cp-note-badge ${
                                nota.tipo || "default"
                              }`}
                            >
                              {nota.tipo === "comun"
                                ? "Nota"
                                : nota.tipo === "seguimiento"
                                ? "Seguimiento"
                                : nota.tipo === "recomendacion"
                                ? "Recomendación"
                                : "Nota"}
                            </span>
                            <span className="cp-note-date">
                              {formatDateTime(nota.fecha)}
                            </span>
                          </div>
                          <p className="cp-note-content">{nota.texto}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsultasPrevias;
