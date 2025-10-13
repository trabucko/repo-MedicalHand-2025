// src/components/Expedientes/HistorialClinico.jsx
import React, { useState, useEffect } from "react";
import {
  FaCalendar,
  FaStethoscope,
  FaPills,
  FaFlask,
  FaNotesMedical,
  FaFileMedical,
  FaArrowLeft,
  FaUserMd,
  FaClipboardList,
} from "react-icons/fa";
import "./historialClinico.css";

// Firestore
import { db } from "../../../../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

// Función para formatear fechas de manera segura
const formatDateTime = (dateInput) => {
  if (!dateInput) return "Fecha no disponible";
  let dateObj;

  if (typeof dateInput.toDate === "function") {
    dateObj = dateInput.toDate();
  } else {
    dateObj = new Date(dateInput);
  }

  if (isNaN(dateObj.getTime())) {
    return "Fecha inválida";
  }

  return dateObj.toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const HistorialClinico = ({ paciente, onClose }) => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultas = async () => {
      if (!paciente || !paciente.id_usuario) {
        setLoading(false);
        return;
      }

      try {
        console.log(
          `Buscando historial para el usuario: ${paciente.id_usuario}`
        );
        const consultasCol = collection(db, "consultas");

        // ✅ CORRECCIÓN: Usando "patient_uid" en lugar de "id_usuario"
        const q = query(
          consultasCol,
          where("patient_uid", "==", paciente.id_usuario),
          orderBy("fechaConsulta", "desc")
        );

        const consultaSnapshot = await getDocs(q);

        if (consultaSnapshot.empty) {
          console.log("No se encontraron consultas para este paciente.");
          setConsultas([]);
        } else {
          const consultasData = consultaSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log(
            `Se encontraron ${consultasData.length} consultas.`,
            consultasData
          );
          setConsultas(consultasData);
        }
      } catch (error) {
        console.error("Error al obtener el historial clínico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, [paciente]);

  if (loading) {
    return (
      <div className="hc-container">
        <div className="hc-loading-state">
          <div className="hc-spinner"></div>
          <h3 className="hc-loading-title">Cargando Historial Clínico...</h3>
          <p className="hc-loading-message">
            Buscando consultas médicas anteriores
          </p>
        </div>
      </div>
    );
  }

  if (consultas.length === 0) {
    return (
      <div className="hc-container">
        <div className="hc-header">
          <button onClick={onClose} className="hc-back-button">
            <FaArrowLeft /> Volver al Expediente
          </button>
          <h2 className="hc-title">Historial Clínico</h2>
          <p className="hc-subtitle">
            {paciente.nombre} • C.I. {paciente.cedula}
          </p>
        </div>

        <div className="hc-empty-state">
          <FaFileMedical className="hc-empty-icon" />
          <h3 className="hc-empty-title">
            No hay historial clínico disponible
          </h3>
          <p className="hc-empty-message">
            No se encontraron consultas médicas registradas para{" "}
            {paciente.nombre}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hc-container">
      <div className="hc-header">
        <button onClick={onClose} className="hc-back-button">
          <FaArrowLeft /> Volver al Expediente
        </button>
        <h2 className="hc-title">Historial Clínico de {paciente.nombre}</h2>
        <p className="hc-subtitle">
          {consultas.length} consulta{consultas.length !== 1 ? "s" : ""}{" "}
          registrada{consultas.length !== 1 ? "s" : ""} • C.I. {paciente.cedula}
        </p>
      </div>

      <div className="hc-consultas-list">
        {consultas.map((consulta, index) => (
          <div key={consulta.id} className="hc-consulta-card">
            <div className="hc-consulta-header">
              <div className="hc-consulta-info">
                <div className="hc-consulta-fecha">
                  <FaCalendar className="hc-icon" />
                  <span className="hc-fecha-text">
                    Consulta del {formatDateTime(consulta.fechaConsulta)}
                  </span>
                </div>
                <h3 className="hc-consulta-motivo">
                  {consulta.motivoConsulta || "Consulta de rutina"}
                </h3>
                <div className="hc-consulta-medico">
                  <FaUserMd className="hc-icon" />
                  <span className="hc-medico-text">
                    Atendido por:{" "}
                    {consulta.doctor_name || "Médico no especificado"}
                  </span>
                </div>
              </div>

              <div className="hc-consulta-actions">
                <button
                  className="hc-btn hc-btn-primary"
                  title="Ver detalles completos"
                >
                  <FaClipboardList />
                </button>
                <button
                  className="hc-btn hc-btn-secondary"
                  title="Descargar reporte"
                >
                  <FaFileMedical />
                </button>
              </div>
            </div>

            <div className="hc-consulta-content">
              {/* Diagnóstico */}
              {consulta.diagnostico && (
                <div className="hc-section">
                  <div className="hc-section-header">
                    <FaStethoscope className="hc-section-icon" />
                    <h4 className="hc-section-title">Diagnóstico</h4>
                  </div>
                  <div className="hc-section-content">
                    <p>{consulta.diagnostico}</p>
                  </div>
                </div>
              )}

              {/* Tratamiento */}
              {consulta.tratamiento && (
                <div className="hc-section">
                  <div className="hc-section-header">
                    <FaPills className="hc-section-icon" />
                    <h4 className="hc-section-title">Plan de Tratamiento</h4>
                  </div>
                  <div className="hc-section-content">
                    <p>{consulta.tratamiento}</p>
                  </div>
                </div>
              )}

              {/* Exámenes Solicitados - VERSIÓN MEJORADA */}
              {consulta.examsRequested &&
                consulta.examsRequested.length > 0 && (
                  <div className="hc-section">
                    <div className="hc-section-header">
                      <FaFlask className="hc-section-icon" />
                      <h4 className="hc-section-title">Exámenes Solicitados</h4>
                    </div>
                    <div className="hc-section-content">
                      <ul className="hc-examenes-list">
                        {consulta.examsRequested.map((examen, index) => {
                          // ✅ MANEJO MEJORADO: Soporta tanto string como objeto
                          const nombreExamen =
                            typeof examen === "string"
                              ? examen
                              : examen.nombre || examen;
                          const estadoExamen = examen.estado || "solicitado";

                          return (
                            <li key={index} className="hc-examen-item">
                              <span className="hc-examen-nombre">
                                {nombreExamen}
                              </span>
                              <span
                                className={`hc-examen-estado ${estadoExamen}`}
                              >
                                {estadoExamen === "completado"
                                  ? "Completado"
                                  : estadoExamen === "proceso"
                                  ? "En Proceso"
                                  : "Solicitado"}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}

              {/* Notas Médicas */}
              {consulta.notasMedicas && (
                <div className="hc-section">
                  <div className="hc-section-header">
                    <FaNotesMedical className="hc-section-icon" />
                    <h4 className="hc-section-title">Notas Médicas</h4>
                  </div>
                  <div className="hc-section-content">
                    <div className="hc-notes-list">
                      <div className="hc-note-item">
                        <div className="hc-note-header">
                          <span className="hc-note-badge seguimiento">
                            Seguimiento
                          </span>
                          <span className="hc-note-date">
                            {formatDateTime(consulta.fechaConsulta)}
                          </span>
                        </div>
                        <p className="hc-note-content">
                          {consulta.notasMedicas}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Medicamentos Recetados - VERSIÓN MEJORADA */}
              {consulta.medicamentosRecetados &&
                consulta.medicamentosRecetados.length > 0 && (
                  <div className="hc-section">
                    <div className="hc-section-header">
                      <FaPills className="hc-section-icon" />
                      <h4 className="hc-section-title">
                        Medicamentos Recetados
                      </h4>
                    </div>
                    <div className="hc-section-content">
                      <div className="hc-medicamentos-grid">
                        {consulta.medicamentosRecetados.map(
                          (medicamento, index) => (
                            <div key={index} className="hc-medicamento-item">
                              <strong>
                                {medicamento.nombre || medicamento}
                              </strong>
                              <div className="hc-medicamento-details">
                                {medicamento.dosis && (
                                  <span>Dosis: {medicamento.dosis}</span>
                                )}
                                {medicamento.frecuencia && (
                                  <span>
                                    Frecuencia: {medicamento.frecuencia}
                                  </span>
                                )}
                                {medicamento.duracion && (
                                  <span>Duración: {medicamento.duracion}</span>
                                )}
                                {!medicamento.dosis &&
                                  !medicamento.frecuencia &&
                                  !medicamento.duracion && (
                                    <span>
                                      Información de prescripción no disponible
                                    </span>
                                  )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* Síntomas - NUEVA SECCIÓN */}
              {consulta.sintomas && (
                <div className="hc-section">
                  <div className="hc-section-header">
                    <FaStethoscope className="hc-section-icon" />
                    <h4 className="hc-section-title">Síntomas Reportados</h4>
                  </div>
                  <div className="hc-section-content">
                    <p>{consulta.sintomas}</p>
                  </div>
                </div>
              )}

              {/* Observaciones - NUEVA SECCIÓN */}
              {consulta.observaciones && (
                <div className="hc-section">
                  <div className="hc-section-header">
                    <FaNotesMedical className="hc-section-icon" />
                    <h4 className="hc-section-title">Observaciones</h4>
                  </div>
                  <div className="hc-section-content">
                    <p>{consulta.observaciones}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer de la consulta */}
            <div className="hc-consulta-footer">
              <div className="hc-consulta-metadata">
                <span className="hc-consulta-id">
                  ID: {consulta.id.substring(0, 8)}...
                </span>
                {consulta.createdAt && (
                  <span className="hc-consulta-created">
                    Registrado: {formatDateTime(consulta.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorialClinico;
