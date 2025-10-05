// src/assets/components/components_Doctor/paciente/PacienteForm/pacienteForm.jsx

import React, { useCallback, useMemo } from "react";
import {
  FaUser,
  FaStethoscope,
  FaFileMedical,
  FaPills,
  FaFlask,
  FaNotesMedical,
  FaSave,
  FaPrint,
  FaTimes,
  FaPlus,
  FaEdit,
  FaCheck,
  // --- Iconos nuevos para estados ---
  FaHourglassStart,
  FaSyncAlt,
  FaCheckCircle,
} from "react-icons/fa";
import "./pacienteForm.css";

const formatDate = (dateInput) => {
  if (!dateInput) {
    return "";
  }

  // Opción 1: Si es un objeto de Firestore (tiene el método .toDate)
  if (typeof dateInput.toDate === "function") {
    return dateInput.toDate().toLocaleDateString("es-ES");
  }

  // Opción 2: Si es un string (puede ser ISO "2025-10-05T..." o "DD/MM/YYYY")
  if (typeof dateInput === "string") {
    // Intenta crear la fecha directamente (funciona para fechas ISO)
    let d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("es-ES");
    }

    // Si falla, puede ser un string "DD/MM/YYYY". Lo intentamos manualmente.
    const parts = dateInput.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // El mes en JS empieza en 0
      const year = parseInt(parts[2], 10);
      d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("es-ES");
      }
    }
  }

  // Si después de todos los intentos no se puede leer la fecha
  return "Fecha inválida";
};

const PacienteForm = ({
  pacienteData,
  activeTab,
  handleTabChange,
  handleInputChange,
  handleGuardar,
  agregarMedicamento,
  eliminarMedicamento,
  agregarExamen,
  eliminarExamen,
  agregarNota,
  eliminarNota,
  marcarExamenCompletado,
}) => {
  const TabPanel = useCallback(
    ({ children, value, index }) => (
      <div
        className="px-tab-panel"
        style={{ display: value === index ? "block" : "none" }}
      >
        <div className="px-panel-content">{children}</div>
      </div>
    ),
    []
  );

  const tabs = useMemo(
    () => [
      { icon: FaUser, label: "Información" },
      { icon: FaFileMedical, label: "Historia" },
      { icon: FaStethoscope, label: "Diagnóstico" },
      { icon: FaPills, label: "Recetas" },
      { icon: FaFlask, label: "Exámenes" },
      { icon: FaNotesMedical, label: "Notas" },
    ],
    []
  );

  return (
    <div className="px-main-container">
      {/* Header */}
      <div className="px-header">
        <div className="px-header-left">
          <FaUser className="px-header-icon" />
          <h1 className="px-title">Expediente Médico</h1>
        </div>
        <div className="px-header-actions">
          <button className="px-btn px-btn-secondary">
            <FaPrint className="px-btn-icon" />
            Imprimir
          </button>
          <button className="px-btn px-btn-primary" onClick={handleGuardar}>
            <FaSave className="px-btn-icon" />
            Guardar
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-tabs-container">
        <div className="px-tabs">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.label}
                className={`px-tab ${
                  activeTab === index ? "px-tab-active" : ""
                }`}
                onClick={() => handleTabChange(null, index)}
              >
                <Icon className="px-tab-icon" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-content">
        {/* Tab 0: Información */}
        <TabPanel value={activeTab} index={0}>
          <h3 className="px-section-title">Información del Paciente</h3>
          <div className="px-form-grid">
            {/* Fila 1 */}
            <div className="px-form-group">
              <label className="px-label">Nombre Completo</label>
              <input
                type="text"
                className="px-input"
                value={`${pacienteData.nombre || ""} ${
                  pacienteData.apellido || ""
                }`}
                disabled
              />
            </div>
            <div className="px-form-group">
              <label className="px-label">Email</label>
              <input
                type="email"
                className="px-input"
                value={pacienteData.email || ""}
                disabled
              />
            </div>
            <div className="px-form-group">
              <label className="px-label">Edad</label>
              <input
                type="text"
                className="px-input"
                value={pacienteData.edad || ""}
                disabled
              />
            </div>

            {/* Fila 2 */}
            <div className="px-form-group">
              <label className="px-label">Género</label>
              <input
                type="text"
                className="px-input"
                value={pacienteData.genero || ""}
                disabled
              />
            </div>
            <div className="px-form-group">
              <label className="px-label">Teléfono</label>
              <input
                type="text"
                className="px-input"
                value={pacienteData.telefono || ""}
                disabled
              />
            </div>
            <div className="px-form-group">
              <label className="px-label">Tipo de Sangre</label>
              <input
                type="text"
                className="px-input"
                name="bloodType"
                value={pacienteData.bloodType || ""}
                onChange={(e) => handleInputChange("bloodType", e.target.value)}
              />
            </div>

            {/* Dirección */}
            <div className="px-form-group px-full-width">
              <label className="px-label">Dirección</label>
              <textarea
                className="px-textarea"
                value={pacienteData.direccion || ""}
                disabled
                rows="2"
              />
            </div>

            {/* Alergias */}
            <div className="px-form-group px-full-width">
              <label className="px-label">Alergias Conocidas</label>
              <textarea
                className="px-textarea"
                name="knownAllergies"
                value={pacienteData.knownAllergies || ""}
                onChange={(e) =>
                  handleInputChange("knownAllergies", e.target.value)
                }
                rows="2"
              />
            </div>

            {/* Enfermedades crónicas */}
            <div className="px-form-group px-full-width">
              <label className="px-label">Enfermedades Crónicas</label>
              <textarea
                className="px-textarea"
                name="chronicDiseases"
                value={
                  Array.isArray(pacienteData.chronicDiseases)
                    ? pacienteData.chronicDiseases.join(", ")
                    : ""
                }
                onChange={(e) =>
                  handleInputChange(
                    "chronicDiseases",
                    e.target.value.split(",").map((d) => d.trim())
                  )
                }
                placeholder="Separadas por comas, ej: Diabetes, Hipertensión"
                rows="2"
              />
            </div>
          </div>
        </TabPanel>

        {/* Tab 1: Historia Clínica */}
        <TabPanel value={activeTab} index={1}>
          <h3 className="px-section-title">Historia Clínica</h3>
          <div className="px-form-grid">
            <div className="px-form-group">
              <label className="px-label">Motivo de la Consulta</label>
              <textarea
                className="px-textarea"
                value={pacienteData.motivoConsulta || ""}
                onChange={(e) =>
                  handleInputChange("motivoConsulta", e.target.value)
                }
                rows="2"
              />
            </div>
            <div className="px-form-group">
              <label className="px-label">Descripción de los Síntomas</label>
              <textarea
                className="px-textarea"
                value={pacienteData.descripcionSintomas || ""}
                onChange={(e) =>
                  handleInputChange("descripcionSintomas", e.target.value)
                }
                rows="3"
              />
            </div>
            <div className="px-form-group">
              <label className="px-label">Tiempo de la Enfermedad</label>
              <input
                type="text"
                className="px-input"
                value={pacienteData.tiempoEnfermedad || ""}
                onChange={(e) =>
                  handleInputChange("tiempoEnfermedad", e.target.value)
                }
              />
            </div>
            <div className="px-form-group">
              <label className="px-label">Tratamiento Previo</label>
              <textarea
                className="px-textarea"
                value={pacienteData.tratamientoPrevio || ""}
                onChange={(e) =>
                  handleInputChange("tratamientoPrevio", e.target.value)
                }
                rows="2"
              />
            </div>
            <div className="px-form-group px-full-width">
              <label className="px-label">Estilo de Vida</label>
              <textarea
                className="px-textarea"
                value={pacienteData.estiloVida || ""}
                onChange={(e) =>
                  handleInputChange("estiloVida", e.target.value)
                }
                rows="3"
              />
            </div>
          </div>
        </TabPanel>

        {/* Tab 2: Diagnóstico */}
        <TabPanel value={activeTab} index={2}>
          <h3 className="px-section-title">Diagnóstico Médico</h3>
          <div className="px-form-stack">
            {["sintomas", "diagnostico", "observaciones", "tratamiento"].map(
              (field, i) => (
                <div className="px-form-group" key={field}>
                  <label className="px-label">
                    {
                      [
                        "Síntomas Principales",
                        "Diagnóstico",
                        "Observaciones",
                        "Plan de Tratamiento",
                      ][i]
                    }
                  </label>
                  <textarea
                    className="px-textarea"
                    value={pacienteData[field] || ""}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    rows={i === 3 ? 4 : 3}
                  />
                </div>
              )
            )}
          </div>
        </TabPanel>

        {/* Tab 3: Recetas */}
        <TabPanel value={activeTab} index={3}>
          <h3 className="px-section-title">Gestión de Recetas Médicas</h3>
          <div className="px-card">
            <h4 className="px-card-title">Agregar Medicamento</h4>
            <div className="px-medication-form">
              <div className="px-form-row">
                {["nuevoMedicamento", "dosis", "frecuencia", "duracion"].map(
                  (field, i) => (
                    <div className="px-form-group compact" key={field}>
                      <label className="px-label">
                        {["Medicamento", "Dosis", "Frecuencia", "Duración"][i]}
                      </label>
                      <input
                        type="text"
                        className="px-input px-input-receta"
                        value={pacienteData[field] || ""}
                        onChange={(e) =>
                          handleInputChange(field, e.target.value)
                        }
                      />
                    </div>
                  )
                )}
                <button
                  className="px-btn px-btn-add"
                  onClick={agregarMedicamento}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="px-medication-list">
            <h4 className="px-section-subtitle">Medicamentos Recetados</h4>
            {!pacienteData.medicamentos?.length ? (
              <p className="px-empty-message">
                No se han agregado medicamentos
              </p>
            ) : (
              <div className="px-items-grid">
                {pacienteData.medicamentos.map((med, i) => (
                  <div key={med.id || i} className="px-medication-item">
                    <div className="px-item-header">
                      <h5 className="px-item-title">{med.nombre}</h5>
                      <button
                        className="px-btn-remove"
                        onClick={() => eliminarMedicamento(med.id)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="px-item-details">
                      <span>Dosis: {med.dosis}</span>
                      <span>Frecuencia: {med.frecuencia}</span>
                      <span>Duración: {med.duracion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabPanel>

        {/* Tab 4: Exámenes */}
        <TabPanel value={activeTab} index={4}>
          <h3 className="px-section-title">Exámenes y Laboratorios</h3>
          <div className="px-card">
            <h4 className="px-card-title">Solicitar Exámenes</h4>
            <div className="px-exam-form">
              <div className="px-form-row">
                <div className="px-form-group flex-1">
                  <input
                    type="text"
                    className="px-input px-input-examen"
                    value={pacienteData.nuevoExamen || ""}
                    onChange={(e) =>
                      handleInputChange("nuevoExamen", e.target.value)
                    }
                    placeholder="Ej: Hemograma completo, Radiografía de tórax..."
                  />
                </div>
                <button
                  className="px-btn px-btn-primary"
                  onClick={agregarExamen}
                >
                  <FaPlus className="px-btn-icon" />
                  Agregar Examen
                </button>
              </div>
            </div>
          </div>
          <div className="px-card">
            <h4 className="px-card-title">Exámenes Solicitados</h4>
            <div className="px-exam-list">
              {!pacienteData.examsRequested?.length ? (
                <div className="px-empty-state">
                  <p className="px-empty-message">
                    No se han solicitado exámenes
                  </p>
                  <small>Agregue exámenes usando el formulario superior</small>
                </div>
              ) : (
                <div className="px-exams-grid">
                  {pacienteData.examsRequested.map((examen) => (
                    // ✅ REPARACIÓN: Usar examen.id para el key y para eliminar.
                    <div key={examen.id} className="px-exam-item">
                      <div className="px-exam-header">
                        <div className="px-exam-info">
                          <h5 className="px-exam-name">
                            {examen.nombre || examen}
                          </h5>
                          <div className="px-exam-meta">
                            {/* ✅ CAMBIO: Iconos para los estados */}
                            <span
                              className={`px-exam-status ${
                                examen.estado || "solicitado"
                              }`}
                            >
                              {examen.estado === "completado" ? (
                                <FaCheckCircle />
                              ) : examen.estado === "proceso" ? (
                                <FaSyncAlt />
                              ) : (
                                <FaHourglassStart />
                              )}
                              {examen.estado === "completado"
                                ? " Completado"
                                : examen.estado === "proceso"
                                ? " En proceso"
                                : " Solicitado"}
                            </span>
                               {" "}
                            <span className="px-exam-date">
                              {formatDate(examen.fechaSolicitud)}
                            </span>
                          </div>
                        </div>
                        <div className="px-exam-actions">
                          <button
                            className="px-btn-icon-small"
                            onClick={() => marcarExamenCompletado(examen.id)}
                            title="Marcar como completado"
                          >
                            <FaCheck />
                          </button>
                          {/* ✅ REPARACIÓN: Llamar a eliminarExamen con el id del examen */}
                          <button
                            className="px-btn-remove"
                            onClick={() => eliminarExamen(examen.id)}
                            title="Eliminar examen"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                      {examen.observaciones && (
                        <div className="px-exam-observations">
                          <p>{examen.observaciones}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ✅ MODIFICADO: Solo se muestra la lista de resultados, sin formulario de carga */}
          <div className="px-card">
            <h4 className="px-card-title">Resultados de Exámenes</h4>
            <div className="px-results-list">
              {!pacienteData.resultadosArchivos?.length ? (
                <div className="px-empty-state">
                  <p className="px-empty-message">
                    No hay resultados de exámenes disponibles
                  </p>
                </div>
              ) : (
                <div className="px-files-grid">
                  {pacienteData.resultadosArchivos.map((archivo, i) => (
                    <div key={i} className="px-file-card">
                      <div className="px-file-header">
                        <div className="px-file-icon">
                          {archivo.tipo === "pdf" ? (
                            <FaFilePdf />
                          ) : (
                            <FaFileImage />
                          )}
                        </div>
                        <div className="px-file-info">
                          <h6 className="px-file-name">{archivo.nombre}</h6>
                          <div className="px-file-meta">
                            <span className="px-file-size">
                              {archivo.tamaño}
                            </span>
                            <span className="px-file-date">
                              {archivo.fechaSubida}
                            </span>
                            <span className="px-file-exam">
                              {archivo.examenAsociado}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="px-file-actions">
                        <a
                          href={archivo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-btn-icon-small"
                          title="Ver archivo"
                        >
                          <FaEye />
                        </a>
                        <button
                          className="px-btn-icon-small"
                          onClick={() =>
                            descargarArchivo(archivo.url, archivo.nombre)
                          }
                          title="Descargar"
                        >
                          <FaDownload />
                        </button>
                        <button
                          className="px-btn-remove"
                          onClick={() => eliminarExamenArchivo(i)}
                          title="Eliminar"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabPanel>

        {/* Tab 5: Notas */}
        <TabPanel value={activeTab} index={5}>
          <h3 className="px-section-title">Notas Médicas Adicionales</h3>
          <div className="px-card">
            <h4 className="px-card-title">Agregar Nueva Nota</h4>
            <div className="px-notes-form">
              <div className="px-form-grid">
                <div className="px-form-group">
                  <label className="px-label">Tipo de Nota</label>
                  <select
                    className="px-select"
                    value={pacienteData.nuevaNotaTipo || ""}
                    onChange={(e) =>
                      handleInputChange("nuevaNotaTipo", e.target.value)
                    }
                  >
                    <option value="">-- Seleccione tipo --</option>
                    <option value="comun">Nota Común</option>
                    <option value="seguimiento">Nota de Seguimiento</option>
                    <option value="recomendacion">Recomendación</option>
                  </select>
                </div>
                <div className="px-form-group px-full-width">
                  <label className="px-label">Contenido de la Nota</label>
                  <textarea
                    className="px-textarea"
                    value={pacienteData.nuevaNotaTexto || ""}
                    onChange={(e) =>
                      handleInputChange("nuevaNotaTexto", e.target.value)
                    }
                    placeholder="Escriba el contenido de la nota médica..."
                    rows="4"
                  />
                </div>
                <div className="px-form-group px-full-width">
                  <button
                    className="px-btn px-btn-primary"
                    onClick={agregarNota}
                    disabled={!pacienteData.nuevaNotaTexto?.trim()}
                  >
                    <FaSave className="px-btn-icon" />
                    Agregar Nota
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="px-notes-list">
            <h4 className="px-section-subtitle">Notas Guardadas</h4>
            {!pacienteData.notes?.length ? (
              <div className="px-empty-state">
                <p className="px-empty-message">No se han agregado notas aún</p>
                <small>
                  Use el formulario superior para agregar la primera nota
                </small>
              </div>
            ) : (
              <div className="px-items-grid">
                {pacienteData.notes.map((nota, i) => (
                  <div key={nota.id || i} className="px-note-item">
                    <div className="px-note-header">
                      <span
                        className={`px-note-badge ${nota.tipo || "default"}`}
                      >
                        {nota.tipo === "comun" && "Nota Común"}
                        {nota.tipo === "seguimiento" && "Seguimiento"}
                        {nota.tipo === "recomendacion" && "Recomendación"}
                        {!nota.tipo && "Nota"}
                      </span>
                      <div className="px-note-actions">
                        <button className="px-btn-edit" title="Editar nota">
                          <FaEdit />
                        </button>
                        <button
                          className="px-btn-remove"
                          onClick={() => eliminarNota(nota.id)}
                          title="Eliminar nota"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                    <div className="px-note-content">
                      <p>{nota.texto}</p>
                    </div>
                    <div className="px-note-meta">
                      <span className="px-note-date">
                        {formatDate(nota.fecha)}
                      </span>
                      <span className="px-note-author">
                        Dr. {nota.autor || "Médico"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabPanel>
      </div>
    </div>
  );
};

export default React.memo(PacienteForm);
