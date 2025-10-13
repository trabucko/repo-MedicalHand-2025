// src/components/Expedientes/Expedientes.jsx
import React, { useState } from "react";
import {
  FiSearch,
  FiX,
  FiUser,
  FiHeart,
  FiFileText,
  FiEdit,
  FiBarChart2,
  FiCalendar,
  FiFile,
  FiRefreshCw,
  FiCheck,
  FiInfo,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDroplet,
  FiAlertTriangle,
  FiClock,
  FiUserCheck,
} from "react-icons/fi";
import { FaPills, FaStethoscope } from "react-icons/fa";
import "./expediente.css";

// Firestore
import { db } from "../../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// Importamos el nuevo componente de historial
import HistorialClinico from "../Expediente/HistorialClinico/historialClinico";

const Expedientes = () => {
  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ Nuevo estado para controlar qué se muestra en el panel derecho
  const [rightPanelView, setRightPanelView] = useState("welcome"); // welcome, loading, no-results, detail, history

  // --- BÚSQUEDA AVANZADA ---
  const handleSearch = async (e) => {
    e.preventDefault();
    setHasSearched(true);
    setSelectedPatient(null);
    setSearchResults([]);
    setRightPanelView("loading");

    const cedula = searchTerm.trim();
    if (!cedula) {
      setRightPanelView("welcome");
      setHasSearched(false);
      return;
    }

    setSearchLoading(true);

    try {
      const usersCol = collection(db, "usuarios_movil");
      const userQuery = query(
        usersCol,
        where("personalInfo.idNumber", "==", cedula)
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setRightPanelView("no-results");
        return;
      }

      // Obtener info y UID del usuario principal
      const userInfo = userSnapshot.docs[0].data();
      const userId = userInfo.uid;
      const allUsersInfoMap = { [userId]: userInfo };
      const uidsToSearch = [userId];

      console.log("Usuario encontrado:", userInfo);

      // Si es tutor, buscar pacientes gestionados
      if (userInfo.isTutor === true) {
        console.log(
          `El usuario es tutor. Buscando pacientes gestionados por ${userId}...`
        );
        const managedUsersQuery = query(
          usersCol,
          where("managedBy", "==", userId)
        );
        const managedSnapshot = await getDocs(managedUsersQuery);

        if (!managedSnapshot.empty) {
          const managedUserIds = managedSnapshot.docs.map((doc) => {
            const managedData = doc.data();
            allUsersInfoMap[managedData.uid] = managedData;
            return managedData.uid;
          });
          uidsToSearch.push(...managedUserIds);
          console.log(
            `Se encontraron ${managedUserIds.length} pacientes gestionados:`,
            managedUserIds
          );
        } else {
          console.log("No tiene pacientes gestionados.");
        }
      }

      // Buscar expedientes de todos los UID
      const expedientesCol = collection(db, "expedientes");
      const expedientesQuery = query(
        expedientesCol,
        where("id_usuario", "in", uidsToSearch)
      );
      const expedientesSnapshot = await getDocs(expedientesQuery);

      if (expedientesSnapshot.empty) {
        console.log("Se encontraron usuarios, pero no tienen expedientes.");
        setRightPanelView("no-results");
        return;
      }

      // Combinar datos para renderizado
      const combinedData = expedientesSnapshot.docs
        .map((doc) => {
          const expediente = { id: doc.id, ...doc.data() };
          const patientInfo = allUsersInfoMap[expediente.id_usuario];
          if (!patientInfo) return null;

          return {
            id_usuario: expediente.id_usuario,
            id: expediente.id,
            nombre: `${patientInfo.personalInfo?.firstName || "Sin"} ${
              patientInfo.personalInfo?.lastName || "Nombre"
            }`,
            cedula: patientInfo.personalInfo?.idNumber || "No registrada",
            fechaNacimiento: formatDate(patientInfo.personalInfo?.dateOfBirth),
            telefono: patientInfo.contactInfo?.phoneNumber || "No registrado",
            email: patientInfo.email || "No registrado",
            direccion: patientInfo.contactInfo?.address || "No registrada",
            tipoSangre: patientInfo.medicalInfo?.bloodType || "N/A",
            alergias:
              patientInfo.medicalInfo?.knownAllergies || "No registradas",
            enfermedadesCronicas:
              patientInfo.medicalInfo?.chronicDiseases?.join(", ") || "Ninguna",
            ultimaConsulta: formatDate(expediente.fechadeultimaactualizacion),
            proximaCita: "No registrada",
            estado: "Activo",
            notas: "Notas no disponibles.",
            medicamentos: "Medicamentos no registrados.",
            medicoTratante: expediente.hospitalName || "No asignado",
            fechaIngreso: formatDate(expediente.fechadecreacion),
            isTutor: patientInfo.isTutor || false,
            managedBy: patientInfo.managedBy || null,
          };
        })
        .filter(Boolean);

      console.log("Expedientes encontrados:", combinedData);

      setSearchResults(combinedData);
      // Seleccionar automáticamente el primer resultado si hay
      if (combinedData.length > 0) {
        setSelectedPatient(combinedData[0]);
        setRightPanelView("detail");
      } else {
        setRightPanelView("no-results");
      }
    } catch (error) {
      console.error("🚨 Error en la búsqueda:", error);
      setRightPanelView("no-results");
    } finally {
      setSearchLoading(false);
    }
  };

  // --- FUNCIONES AUXILIARES ---
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    return timestamp.toDate().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateAge = (fechaNacimiento) => {
    if (!fechaNacimiento || fechaNacimiento === "N/A") return "N/A";
    const [dia, mes, año] = fechaNacimiento.split("/").map(Number);
    if (!dia || !mes || !año) return "N/A";
    const fechaNac = new Date(año, mes - 1, dia);
    if (isNaN(fechaNac)) return "N/A";
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesDif = hoy.getMonth() - fechaNac.getMonth();
    if (mesDif < 0 || (mesDif === 0 && hoy.getDate() < fechaNac.getDate()))
      edad--;
    return edad >= 0 ? edad : "N/A";
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedPatient(null);
    setHasSearched(false);
    setRightPanelView("welcome");
  };

  // --- UI ---
  return (
    <div className="expedientes-container-exp">
      <div className="expedientes-header-exp">
        <h1 className="expedientes-titulo-exp">
          <FaStethoscope /> Sistema de Gestión de Expedientes
        </h1>
        <p className="expedientes-descripcion-exp">
          Busque un paciente por su número de cédula para ver sus expedientes
          médicos
        </p>
      </div>

      <div className="expedientes-busqueda-container-exp">
        <form onSubmit={handleSearch} className="expedientes-form-busqueda-exp">
          <div className="expedientes-search-main-exp">
            <div className="expedientes-search-input-group-exp">
              <div className="expedientes-search-wrapper-exp">
                <FiSearch className="expedientes-search-icon-exp" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ingrese el número de cédula del paciente..."
                  className="expedientes-input-busqueda-exp"
                />
              </div>
              <button
                type="submit"
                className="expedientes-btn-buscar-exp"
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <div className="expedientes-circle-loader-exp">
                    <div className="expedientes-circle-spinner-exp"></div>
                  </div>
                ) : (
                  <>
                    <FiSearch />
                    Buscar
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="expedientes-search-actions-exp">
            <button
              type="button"
              onClick={clearSearch}
              className="expedientes-btn-limpiar-exp"
            >
              <FiX /> Limpiar búsqueda
            </button>
            {hasSearched && !searchLoading && (
              <div className="expedientes-search-stats-exp">
                <FiCheck /> {searchResults.length} expediente(s) encontrado(s)
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="expedientes-content-layout-exp">
        {/* Panel de resultados */}
        {hasSearched && searchResults.length > 0 && (
          <div className="expedientes-resultados-panel-exp">
            <div className="expedientes-resultados-header-exp">
              <h3>
                <FiUserCheck /> Resultados de la Búsqueda
                <span className="expedientes-resultados-count-exp">
                  {searchResults.length}
                </span>
              </h3>
            </div>
            <div className="expedientes-resultados-grid-exp">
              {searchResults.map((paciente, index) => (
                <div
                  key={paciente.id}
                  className={`expedientes-resultado-card-exp ${
                    selectedPatient?.id === paciente.id ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedPatient(paciente);
                    setRightPanelView("detail");
                  }}
                >
                  <div className="expedientes-card-header-exp">
                    <div className="expedientes-avatar-exp">
                      <FiUser />
                      {paciente.isTutor && (
                        <span
                          className="expedientes-tutor-badge-exp"
                          title="Tutor"
                        >
                          T
                        </span>
                      )}
                    </div>
                    <div className="expedientes-card-title-exp">
                      <h4>{paciente.nombre}</h4>
                      <span className="expedientes-cedula-exp">
                        C.I. {paciente.cedula}
                      </span>
                    </div>
                    <span
                      className={`expedientes-estado-badge-exp ${paciente.estado.toLowerCase()}-exp`}
                    >
                      {paciente.estado}
                    </span>
                  </div>

                  <div className="expedientes-card-info-exp">
                    <div className="expedientes-info-item-exp">
                      <FiClock />
                      <span>{calculateAge(paciente.fechaNacimiento)} años</span>
                    </div>
                    <div className="expedientes-info-item-exp">
                      <FiDroplet />
                      <span>{paciente.tipoSangre}</span>
                    </div>
                    {paciente.managedBy && (
                      <div className="expedientes-info-item-exp">
                        <FiUser />
                        <span>Paciente gestionado</span>
                      </div>
                    )}
                  </div>

                  <div className="expedientes-card-footer-exp">
                    <div className="expedientes-ultima-visita-exp">
                      <small>Última consulta: {paciente.ultimaConsulta}</small>
                    </div>
                    <div className="expedientes-seleccion-indicator-exp">
                      {selectedPatient?.id === paciente.id && (
                        <div className="expedientes-seleccionado-exp">
                          <FiCheck />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel de detalles */}
        <div className="expedientes-detalle-panel-exp">
          {(() => {
            switch (rightPanelView) {
              case "loading":
                return (
                  <div className="expedientes-loading-state-exp">
                    <div className="expedientes-circle-progress-exp">
                      <div className="expedientes-circle-exp">
                        <div className="expedientes-circle-inner-exp"></div>
                      </div>
                      <p>Buscando en la base de datos...</p>
                      <span className="expedientes-loading-text-exp">
                        Consultando registros médicos
                      </span>
                    </div>
                  </div>
                );

              case "detail":
                return (
                  <DetallePaciente
                    paciente={selectedPatient}
                    calculateAge={calculateAge}
                    onShowHistory={() => setRightPanelView("history")}
                  />
                );

              case "history":
                return (
                  <HistorialClinico
                    paciente={selectedPatient}
                    onClose={() => setRightPanelView("detail")}
                  />
                );

              case "no-results":
                return (
                  <div className="expedientes-sin-resultados-exp">
                    <div className="expedientes-empty-state-exp">
                      <FiSearch className="expedientes-empty-icon-exp" />
                      <h3>No se encontraron expedientes</h3>
                      <p>
                        No hay ningún paciente registrado con la cédula "
                        <strong>{searchTerm}</strong>".
                      </p>
                      <button
                        onClick={clearSearch}
                        className="expedientes-btn-intentar-exp"
                      >
                        <FiRefreshCw /> Nueva búsqueda
                      </button>
                    </div>
                  </div>
                );

              case "welcome":
              default:
                return (
                  <div className="expedientes-informativo-exp">
                    <div className="expedientes-welcome-state-exp">
                      <FiInfo className="expedientes-welcome-icon-exp" />
                      <h3>Búsqueda de Expedientes Médicos</h3>
                      <p>
                        Ingrese el número de cédula de un paciente para
                        consultar sus expedientes médicos y información clínica.
                      </p>
                      <div className="expedientes-features-grid-exp">
                        <div className="expedientes-feature-item-exp">
                          <FiUserCheck />
                          <span>Pacientes y tutores</span>
                        </div>
                        <div className="expedientes-feature-item-exp">
                          <FiHeart />
                          <span>Historial médico</span>
                        </div>
                        <div className="expedientes-feature-item-exp">
                          <FaPills />
                          <span>Tratamientos</span>
                        </div>
                        <div className="expedientes-feature-item-exp">
                          <FiFileText />
                          <span>Expedientes completos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
            }
          })()}
        </div>
      </div>
    </div>
  );
};

// Componente separado para detalle de paciente (ACTUALIZADO CON onShowHistory)
const DetallePaciente = ({ paciente, calculateAge, onShowHistory }) => (
  <div className="expedientes-detalle-paciente-exp">
    <div className="expedientes-detalle-header-exp">
      <div className="expedientes-paciente-main-info-exp">
        <div className="expedientes-avatar-large-exp">
          <FiUser />
          {paciente.isTutor && (
            <span className="expedientes-tutor-badge-large-exp" title="Tutor">
              Tutor
            </span>
          )}
        </div>
        <div className="expedientes-paciente-info-exp">
          <h2>{paciente.nombre}</h2>
          <div className="expedientes-paciente-meta-exp">
            <span className="expedientes-cedula-badge-exp">
              C.I. {paciente.cedula}
            </span>
            <span className="expedientes-age-exp">
              {calculateAge(paciente.fechaNacimiento)} años
            </span>
            <span className="expedientes-birth-exp">
              Nac: {paciente.fechaNacimiento}
            </span>
          </div>
        </div>
      </div>
      <div className="expedientes-header-actions-exp">
        <span
          className={`expedientes-estado-badge-large-exp ${paciente.estado.toLowerCase()}-exp`}
        >
          {paciente.estado}
        </span>
        <div className="expedientes-ultima-consulta-exp">
          <FiClock />
          <span>
            <strong>Última consulta:</strong> {paciente.ultimaConsulta}
          </span>
        </div>
      </div>
    </div>

    <div className="expedientes-detalle-content-exp">
      <div className="expedientes-grid-layout-exp">
        <div className="expedientes-columna-exp">
          <div className="expedientes-info-card-exp">
            <h3>
              <FiUser /> Información Personal
            </h3>
            <div className="expedientes-info-grid-exp">
              <div className="expedientes-info-item-detailed-exp">
                <FiMail />
                <div>
                  <label>Correo Electrónico</label>
                  <span>{paciente.email}</span>
                </div>
              </div>
              <div className="expedientes-info-item-detailed-exp">
                <FiPhone />
                <div>
                  <label>Teléfono</label>
                  <span>{paciente.telefono}</span>
                </div>
              </div>
              <div className="expedientes-info-item-detailed-exp">
                <FiMapPin />
                <div>
                  <label>Dirección</label>
                  <span>{paciente.direccion}</span>
                </div>
              </div>
              <div className="expedientes-info-item-detailed-exp">
                <FiCalendar />
                <div>
                  <label>Fecha de Ingreso</label>
                  <span>{paciente.fechaIngreso}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="expedientes-columna-exp">
          <div className="expedientes-info-card-exp">
            <h3>
              <FiHeart /> Información Médica
            </h3>
            <div className="expedientes-info-grid-exp">
              <div className="expedientes-info-item-detailed-exp">
                <FiDroplet />
                <div>
                  <label>Grupo Sanguíneo</label>
                  <span
                    className={`expedientes-sangre-exp ${
                      paciente.tipoSangre !== "N/A" ? "has-blood" : ""
                    }`}
                  >
                    {paciente.tipoSangre}
                  </span>
                </div>
              </div>
              <div className="expedientes-info-item-detailed-exp">
                <FiAlertTriangle />
                <div>
                  <label>Alergias</label>
                  <span
                    className={
                      paciente.alergias === "No registradas"
                        ? "expedientes-no-alergias-exp"
                        : "expedientes-si-alergias-exp"
                    }
                  >
                    {paciente.alergias}
                  </span>
                </div>
              </div>
              <div className="expedientes-info-item-detailed-exp">
                <FiHeart />
                <div>
                  <label>Condiciones Crónicas</label>
                  <span>{paciente.enfermedadesCronicas}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="expedientes-acciones-container-exp">
      <button className="expedientes-btn-primary-exp">
        <FiEdit /> Editar Expediente
      </button>
      <button className="expedientes-btn-secondary-exp" onClick={onShowHistory}>
        <FiBarChart2 /> Historial Clínico
      </button>

      <button className="expedientes-btn-warning-exp">
        <FiFile /> Generar Reporte
      </button>
    </div>
  </div>
);

export default Expedientes;
